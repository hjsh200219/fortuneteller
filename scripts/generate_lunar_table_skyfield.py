#!/usr/bin/env python3
"""한국 음력(태음태양력) 연도 테이블 생성 — JPL DE440(skyfield) 천문 계산.

규칙(시헌력·KASI 방식):
  - 합삭(新月)이 드는 한국 표준시 날짜가 그 달 1일.
  - 동지(황경 270°)가 든 달이 11월.
  - 두 동지월 사이에 달이 13개면, 그 사이 첫 번째 '중기(中氣)가 없는 달'이 윤달(앞 달 번호를 잇는다).
  - 날짜 판정 시간대: 1912년 이전 UTC+8(시헌력 동경 120°), 1954-03-21~1961-08-09 UTC+8:30, 그 밖 UTC+9.
  - 1900-2049 전 연도가 KASI 공표 음력(월 일수·윤달·설날)과 일치한다.

    python3 -m venv .venv && .venv/bin/pip install skyfield
    .venv/bin/python scripts/generate_lunar_table_skyfield.py

검증: tests/lunar-table-verification.test.ts 가 KASI(한국천문연구원) 공표 음력과 대조한 앵커를 고정한다.
"""
import datetime as dt
from pathlib import Path

from skyfield import almanac
from skyfield.api import load
from skyfield.framelib import ecliptic_frame
from skyfield.searchlib import find_discrete

START, END = 1900, 2200
OUT = Path(__file__).resolve().parent.parent / 'src/data/lunar_table_1900_2200.ts'

ts = load.timescale()
eph = load('de440.bsp')
earth, sun = eph['earth'], eph['sun']


def kst_offset(t_utc: dt.datetime) -> dt.timedelta:
    d = t_utc + dt.timedelta(hours=9)
    if d.replace(tzinfo=None) < dt.datetime(1912, 1, 1):
        # 1912년 이전 역서는 청 시헌력(동경 120°) 기준 — KASI 공표 음력과 이 기준에서만 1900-1911 이 모두 맞는다
        return dt.timedelta(hours=8)
    if dt.datetime(1954, 3, 21) <= d.replace(tzinfo=None) < dt.datetime(1961, 8, 10):
        return dt.timedelta(hours=8, minutes=30)
    return dt.timedelta(hours=9)


def local_date(t) -> dt.date:
    u = t.utc_datetime().replace(tzinfo=None)
    return (u + kst_offset(u)).date()


# 합삭 날짜
t0, t1 = ts.utc(START - 1, 10, 1), ts.utc(END + 2, 3, 1)
pt, ph = almanac.find_discrete(t0, t1, almanac.moon_phases(eph))
new_moons = sorted({local_date(t) for t, p in zip(pt, ph) if p == 0})


# 중기(황경 30° 배수) 날짜
def seg(t):
    _, lon, _ = earth.at(t).observe(sun).apparent().frame_latlon(ecliptic_frame)
    return (lon.degrees // 30).astype(int) % 12


seg.step_days = 10
zt, zv = find_discrete(t0, t1, seg)
zhongqi = [(local_date(t), int(v) * 30) for t, v in zip(zt, zv)]  # v*30 = 황경(0=춘분 … 270=동지)

# 달 = [new_moons[i], new_moons[i+1])
months = []
for a, b in zip(new_moons, new_moons[1:]):
    zs = [lon for d, lon in zhongqi if a <= d < b]
    months.append({'start': a, 'days': (b - a).days, 'zq': zs})

# 동지월 인덱스
dongji_idx = [i for i, m in enumerate(months) if 270 in m['zq']]
for i, m in enumerate(months):
    m['num'] = None
    m['leap'] = False
for k in range(len(dongji_idx) - 1):
    a, b = dongji_idx[k], dongji_idx[k + 1]
    span = months[a:b]
    leap_at = None
    if b - a == 13:
        leap_at = next(j for j, m in enumerate(span[1:], start=1) if not m['zq'])
    num = 11
    for j, m in enumerate(span):
        if j == 0:
            m['num'] = 11
            continue
        if j == leap_at:
            m['num'] = num
            m['leap'] = True
            continue
        num = num % 12 + 1
        m['num'] = num

rows = []
for y in range(START, END + 1):
    idx = [i for i, m in enumerate(months) if m['num'] == 1 and not m['leap'] and m['start'].year == y]
    if not idx:
        continue
    i = idx[0]
    ys = []
    j = i
    while True:
        ys.append(months[j])
        j += 1
        if months[j]['num'] == 1 and not months[j]['leap']:
            break
    leap = next((m['num'] for m in ys if m['leap']), 0)
    rows.append((y, leap, [m['days'] for m in ys], ys[0]['start'].isoformat()))

lines = [
    '/**',
    ' * 한국 음력 연도 테이블 (1900-2200) — 자동 생성, 수동 편집 금지',
    ' * 생성: scripts/generate_lunar_table_skyfield.py (JPL DE440 합삭·중기, 한국 표준시 이력)',
    ' */',
    '',
    'export interface LunarYearData {',
    '  year: number;',
    '  leapMonth: number; // 0 = 윤달 없음, 1-12 = 그 달 뒤에 윤달',
    '  monthDays: number[]; // 달별 일수 (윤달 포함 순서대로, 평년 12개·윤년 13개)',
    '  totalDays: number;',
    '  solarNewYear: string; // 음력 1월 1일의 양력 날짜',
    '}',
    '',
    'export const LUNAR_TABLE_1900_2200: LunarYearData[] = [',
]
for y, leap, days, ny in rows:
    lines.append(f"  {{ year: {y}, leapMonth: {leap}, monthDays: [{', '.join(map(str, days))}], totalDays: {sum(days)}, solarNewYear: '{ny}' }},")
lines.append('];')
OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'{len(rows)} years -> {OUT}')
