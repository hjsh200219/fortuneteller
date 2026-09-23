/**
 * 사주 기둥 회귀 테스트 — 2026-09 수정분
 *
 * 각 사례는 수정 전 엔진에서 틀렸던 입력이다. 기대값은 JPL DE440s 절기·지방평균시(서울 -32분)로
 * 독립 계산한 값(무작위·경계 22,792건 대조에서 불일치 0).
 */

import { calculateSaju } from '../src/lib/saju.js';
import { calculateDaeUn } from '../src/lib/dae_un.js';
import { SOLAR_TERMS_JIE } from '../src/data/solar_terms.js';
import { analyzeWolUn } from '../src/lib/wol_un.js';
import { analyzeWolun } from '../src/lib/wolun_analysis.js';
import { getDayPillar } from '../src/lib/helpers.js';
import { convertCalendar } from '../src/lib/calendar.js';
import { analyzeIljin } from '../src/lib/iljin_analysis.js';
import { selectMonthCommandStem } from '../src/lib/gyeok_guk.js';
import { extractJiJangGan, calculateJiJangGanStrength, checkWolRyeong } from '../src/data/earthly_branches.js';
import type { SajuData } from '../src/types/index.js';

function pillars(date: string, time: string, gender: 'male' | 'female' = 'male'): string {
  const s = calculateSaju(date, time, 'solar', false, gender, '서울');
  return [s.year, s.month, s.day, s.hour].map((p) => p.stem + p.branch).join(' ');
}

describe('절입 경계 — 정밀 절기표(분 단위)로 연주·월주 결정', () => {
  test('2026 입춘(02-04 05:02) 7분 전은 을사년 기축월', () => {
    expect(pillars('2026-02-04', '04:55').split(' ').slice(0, 2)).toEqual(['을사', '기축']);
  });
  test('2026 입춘(02-04 05:02) 8분 후는 병오년 경인월', () => {
    expect(pillars('2026-02-04', '05:10').split(' ').slice(0, 2)).toEqual(['병오', '경인']);
  });
  test('2002 입하(05-06 01:37) 17분 전은 아직 갑진월', () => {
    expect(pillars('2002-05-06', '01:20').split(' ')[1]).toBe('갑진');
  });
});

describe('야자시(23시대) 시간(時干)', () => {
  test('23시대 시간은 다음날 자시 천간 — 같은 날 00시대와 달라야 한다', () => {
    const late = pillars('2024-03-10', '23:45').split(' ');
    const early = pillars('2024-03-10', '00:45').split(' ');
    expect(late[2]).toBe(early[2]); // 일주는 당일 유지
    expect(late[3]!.slice(1)).toBe('자');
    expect(late[3]).not.toBe(early[3]);
  });
  test('다음날 00시대 자시와 같은 간지', () => {
    const late = pillars('2024-03-10', '23:45').split(' ');
    const nextEarly = pillars('2024-03-11', '00:45').split(' ');
    expect(late[3]).toBe(nextEarly[3]);
  });
});

describe('표준시·썸머타임 이력 — 지방평균시 읽기', () => {
  test('1988-05-08 03:47(썸머타임 시작일) = 지방평균시 02:15 → 축시', () => {
    expect(pillars('1988-05-08', '03:47', 'female').split(' ')[3]!.slice(1)).toBe('축');
  });
  test('1957(UTC+8:30) 09:30 = 지방평균시 09:28 → 사시', () => {
    expect(pillars('1957-01-24', '09:30', 'female').split(' ')[3]!.slice(1)).toBe('사');
  });
  test('1900-01-01(소한 이전)도 계산된다 — 기해년 병자월', () => {
    expect(pillars('1900-01-01', '12:00').split(' ').slice(0, 2)).toEqual(['기해', '병자']);
  });
});

describe('대운 기산 — 12절(節)', () => {
  test('12절에는 소한이 있고 소설(氣)은 없다', () => {
    expect(SOLAR_TERMS_JIE).toContain('소한');
    expect(SOLAR_TERMS_JIE).not.toContain('소설');
  });
  test('1986-11-20 10:00 남(병인년 순행): 다음 절 대설까지 17.4일 → 대운수 5, 첫 대운 경자', () => {
    const s = calculateSaju('1986-11-20', '10:00', 'solar', false, 'male', '서울');
    const first = calculateDaeUn(s)[0]!;
    expect(first.startAge).toBe(5);
    expect(first.stem + first.branch).toBe('경자');
  });
  test('2027-01-19 15:00 여(입춘 전 병오년 역행): 이전 절 소한까지 13.7일 → 대운수 4', () => {
    const s = calculateSaju('2027-01-19', '15:00', 'solar', false, 'female', '서울');
    expect(calculateDaeUn(s)[0]!.startAge).toBe(4);
  });
});

describe('월운 — 양력 M월 = 그 달 절입 절의 월건', () => {
  const base = calculateSaju('1986-11-20', '10:00', 'solar', false, 'male', '서울');
  test('1950-2100 매달 15일 월주와 두 월운 모듈 간지가 같다', () => {
    const mismatches: string[] = [];
    for (let y = 1950; y <= 2100; y++) {
      for (let m = 1; m <= 12; m++) {
        const mm = String(m).padStart(2, '0');
        const s = calculateSaju(`${y}-${mm}-15`, '12:00', 'solar', false, 'male', '서울');
        const expected = s.month.stem + s.month.branch;
        const a = analyzeWolUn(base, y, m);
        const b = analyzeWolun(base, y, m);
        if (a.stem + a.branch !== expected || b.monthStem + b.monthBranch !== expected) {
          mismatches.push(`${y}-${mm}: ${expected} vs ${a.stem}${a.branch}/${b.monthStem}${b.monthBranch}`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });
});

describe('일진 — getDayPillar 가 calculateSaju 일주와 같다', () => {
  test('2000-2030 매달 1·15일 정오', () => {
    const mismatches: string[] = [];
    for (let y = 2000; y <= 2030; y++) {
      for (let m = 1; m <= 12; m++) {
        for (const d of [1, 15]) {
          const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const s = calculateSaju(ds, '12:00', 'solar', false, 'male', '서울');
          const p = getDayPillar(new Date(`${ds}T12:00`));
          if (p.stem + p.branch !== s.day.stem + s.day.branch) mismatches.push(ds);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });
});

describe('음력 변환 — KASI 공표 음력과 일치하는 생성 테이블', () => {
  // 기대값: KASI 음력(korean_lunar_calendar) — 수정 전 테이블은 1900-2049 중 149년의 달 일수가 틀렸다
  test.each([
    ['1901-06-15', '1901-04-29', false],
    ['1984-11-22', '1984-10-30', false], // 1984 윤10월 전날
    ['1984-11-23', '1984-10-01', true], // 윤10월 1일
    ['2020-05-23', '2020-04-01', true], // 윤4월 1일
    ['2026-02-16', '2025-12-29', false], // 설 전날(이전 테이블은 설 전을 전부 전년 12-31 로 뭉갰다)
    ['2033-12-22', '2033-11-01', true], // 2033 윤11월
  ])('양력 %s → 음력 %s (윤달 %s), 역변환 일치', (solar, lunar, leap) => {
    const s2l = convertCalendar(solar, 'solar', 'lunar');
    expect(s2l.convertedDate).toBe(lunar);
    expect(!!s2l.isLeapMonth).toBe(leap);
    expect(convertCalendar(lunar, 'lunar', 'solar', leap).convertedDate).toBe(solar);
  });
  test('음력 2월 30일은 양력 3월 1일로 바뀌지 않는다(없는 날이면 오류)', () => {
    // 2026 음력 2월은 29일까지
    expect(() => convertCalendar('2026-02-30', 'lunar', 'solar')).toThrow('없는 음력 날짜');
  });
});

describe('일진 28수·12직', () => {
  test('1970-01-01(목)은 두(斗)수, 2026-09-23(수)은 기(箕)수', () => {
    const base = calculateSaju('1986-11-20', '10:00', 'solar', false, 'male', '서울');
    expect(analyzeIljin(new Date(1970, 0, 1, 9), base).constellation.name).toBe('두');
    expect(analyzeIljin(new Date(2026, 8, 23, 9), base).constellation.name).toBe('기');
  });
  test('12직: 월건 지지와 같은 지지의 날이 건 — 2024-01-01(갑자, 자월)은 건', () => {
    const base = calculateSaju('1986-11-20', '10:00', 'solar', false, 'male', '서울');
    expect(analyzeIljin(new Date(2024, 0, 1, 9), base).twelveGods.name).toBe('건');
  });
});

describe('격국·강약 — 월령 기준', () => {
  const chart = (y: string, m: string, d: string, h: string) =>
    ({
      year: { stem: y[0], branch: y[1] },
      month: { stem: m[0], branch: m[1] },
      day: { stem: d[0], branch: d[1] },
      hour: { stem: h[0], branch: h[1] },
    }) as unknown as SajuData;

  test('월지 지장간 중 투출한 천간이 격 — 축월(기·신·계)에 신금 투출이면 무토 일간 상관격', () => {
    expect(selectMonthCommandStem(chart('경자', '신축', '무오', '갑인'))).toBe('신');
  });
  test('투출이 없으면 정기 — 해월(임·갑)에 임·갑 모두 없으면 임', () => {
    expect(selectMonthCommandStem(chart('정묘', '신해', '을유', '병자'))).toBe('임');
  });
  test('진·사·미·술 중기·여기 순서: 진=계(중기)·을(여기)', () => {
    expect(extractJiJangGan('진')).toEqual(['무', '계', '을']);
    expect(extractJiJangGan('술')).toEqual(['무', '정', '신']);
  });
  test('당령 지지는 정기 세력이 가장 크다 — 인월(monthIndex 0)의 인', () => {
    expect(calculateJiJangGanStrength('인', 0).primary.strength).toBe(90);
  });
  test('식상·재성 월은 실령', () => {
    expect(checkWolRyeong('갑', '오').isDeukRyeong).toBe(false); // 목 일간, 화월 = 식상
    expect(checkWolRyeong('갑', '진').isDeukRyeong).toBe(false); // 목 일간, 토월 = 재성
  });
  test('일간과 같은 천간(비견)도 십신 분포에 들어간다', () => {
    const s = calculateSaju('1985-03-20', '12:00', 'solar', false, 'male', '서울');
    const same = [s.year.stem, s.month.stem, s.hour.stem].filter((st) => st === s.day.stem).length;
    expect(s.tenGodsDistribution!.비견).toBeGreaterThanOrEqual(same);
  });
});
