#!/usr/bin/env python3
"""24절기 테이블 생성 — JPL DE440 천체력(skyfield) 기반.

JPL DE440 천체력(skyfield)으로 태양 겉보기 황경을 J2000 황도 좌표계(`frame_latlon(ecliptic_frame)`)로 구해
15° 경계를 넘는 순간을 찾는다. KASI 공표 절기 시각과 분 단위로 일치한다
(tests/kasi-anchor-verification.test.ts).

    python3 -m venv .venv && .venv/bin/pip install skyfield
    .venv/bin/python scripts/generate_solar_terms_skyfield.py

연도 규약은 기존 테이블과 같다: year=Y 에는 Y년 1월 대한부터 Y+1년 1월 소한까지 24개.
1900년 1월 초(소한 이전)를 덮기 위해
year=1899 의 대설·동지·소한도 넣는다.
"""
import datetime as dt
from pathlib import Path

from skyfield.api import load
from skyfield.framelib import ecliptic_frame
from skyfield.searchlib import find_discrete

START, END = 1900, 2200
OUT = Path(__file__).resolve().parent.parent / 'src/data/solar_terms_1900_2200.ts'
KST = dt.timezone(dt.timedelta(hours=9))
NAMES = {
    315: '입춘', 330: '우수', 345: '경칩', 0: '춘분', 15: '청명', 30: '곡우',
    45: '입하', 60: '소만', 75: '망종', 90: '하지', 105: '소서', 120: '대서',
    135: '입추', 150: '처서', 165: '백로', 180: '추분', 195: '한로', 210: '상강',
    225: '입동', 240: '소설', 255: '대설', 270: '동지', 285: '소한', 300: '대한',
}

ts = load.timescale()
eph = load('de440.bsp')
earth, sun = eph['earth'], eph['sun']


def segment(t):
    _, lon, _ = earth.at(t).observe(sun).apparent().frame_latlon(ecliptic_frame)
    return (lon.degrees // 15).astype(int) % 24


segment.step_days = 7

times, values = find_discrete(ts.utc(START - 1, 12, 1), ts.utc(END + 1, 1, 15), segment)
rows = []
for t, v in zip(times, values):
    lon = int(v) * 15
    kst = t.utc_datetime().astimezone(KST)
    # 분 단위 반올림 — KASI 공표 방식
    kst = (kst + dt.timedelta(seconds=30)).replace(second=0, microsecond=0)
    year = kst.year - 1 if NAMES[lon] == '소한' else kst.year
    if not START - 1 <= year <= END:
        continue
    rows.append((year, NAMES[lon], kst, lon))

lines = [
    '/**',
    ' * 24절기 테이블 (1899 대설·동지·소한 + 1900-2200) — 자동 생성, 수동 편집 금지',
    ' * 생성: scripts/generate_solar_terms_skyfield.py (JPL DE440, J2000 황도 좌표계)',
    ' * 연도 규약: year=Y 는 Y년 1월 대한 ~ Y+1년 1월 소한 (24개)',
    ' */',
    '',
    "import type { SolarTerm } from '../types/index.js';",
    '',
    'export interface SolarTermComplete {',
    '  year: number;',
    '  term: SolarTerm;',
    '  datetime: string; // ISO 8601 (KST)',
    '  timestamp: number; // Unix ms',
    '  solarLongitude: number; // 태양 황경(도)',
    '}',
    '',
    'export const SOLAR_TERMS_1900_2200: SolarTermComplete[] = [',
]
for year, name, kst, lon in rows:
    iso = kst.strftime('%Y-%m-%dT%H:%M:00+09:00')
    ms = int(kst.timestamp() * 1000)
    lines.append(f"  {{ year: {year}, term: '{name}', datetime: '{iso}', timestamp: {ms}, solarLongitude: {lon} }},")
lines.append('];')
OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'{len(rows)} rows -> {OUT}')
