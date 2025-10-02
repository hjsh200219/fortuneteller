/**
 * 확장 음력 테이블 (2020-2030)
 * 정확한 음양력 변환을 위한 상세 데이터
 *
 * 데이터 출처: 한국천문연구원 천문우주지식정보
 */

import type { LunarYearData } from './lunar_table.js';

/**
 * 2020-2030년 음력 데이터 (11년)
 * 각 연도의 월별 일수와 윤달 정보
 */
export const LUNAR_TABLE_EXTENDED: LunarYearData[] = [
  {
    year: 2020,
    leapMonth: 4, // 윤4월
    monthDays: [30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30],
    totalDays: 384,
    solarNewYear: '2020-01-25',
  },
  {
    year: 2021,
    leapMonth: 0, // 평년
    monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30],
    totalDays: 354,
    solarNewYear: '2021-02-12',
  },
  {
    year: 2022,
    leapMonth: 0, // 평년
    monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29],
    totalDays: 354,
    solarNewYear: '2022-02-01',
  },
  {
    year: 2023,
    leapMonth: 2, // 윤2월
    monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29],
    totalDays: 384,
    solarNewYear: '2023-01-22',
  },
  {
    year: 2024,
    leapMonth: 0, // 평년
    monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30],
    totalDays: 354,
    solarNewYear: '2024-02-10',
  },
  {
    year: 2025,
    leapMonth: 6, // 윤6월
    monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29],
    totalDays: 384,
    solarNewYear: '2025-01-29',
  },
  {
    year: 2026,
    leapMonth: 0, // 평년
    monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29],
    totalDays: 354,
    solarNewYear: '2026-02-17',
  },
  {
    year: 2027,
    leapMonth: 0, // 평년
    monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30],
    totalDays: 355,
    solarNewYear: '2027-02-06',
  },
  {
    year: 2028,
    leapMonth: 5, // 윤5월
    monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30],
    totalDays: 384,
    solarNewYear: '2028-01-26',
  },
  {
    year: 2029,
    leapMonth: 0, // 평년
    monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30],
    totalDays: 354,
    solarNewYear: '2029-02-13',
  },
  {
    year: 2030,
    leapMonth: 0, // 평년
    monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29],
    totalDays: 354,
    solarNewYear: '2030-02-03',
  },
];

/**
 * 특정 연도의 음력 데이터 조회
 */
export function getLunarYearData(year: number): LunarYearData | undefined {
  return LUNAR_TABLE_EXTENDED.find((data) => data.year === year);
}

/**
 * 윤년 여부 확인
 */
export function isLeapYear(year: number): boolean {
  const data = getLunarYearData(year);
  return data ? data.leapMonth > 0 : false;
}

/**
 * 특정 연도의 윤달 위치 조회
 */
export function getLeapMonth(year: number): number {
  const data = getLunarYearData(year);
  return data ? data.leapMonth : 0;
}

/**
 * 음력 월의 일수 조회
 */
export function getLunarMonthDays(year: number, month: number, isLeapMonth: boolean = false): number {
  const data = getLunarYearData(year);
  if (!data) return 29; // 기본값

  // 윤달인 경우
  if (isLeapMonth && data.leapMonth === month) {
    // 윤달은 leapMonth 위치 다음 인덱스
    const leapMonthIndex = data.monthDays.findIndex((_, idx) => idx === data.leapMonth);
    return data.monthDays[leapMonthIndex] || 29;
  }

  // 평달인 경우
  return data.monthDays[month - 1] || 29;
}

/**
 * 음력 연도의 총 일수
 */
export function getLunarYearTotalDays(year: number): number {
  const data = getLunarYearData(year);
  return data ? data.totalDays : 354; // 기본값은 평년
}

/**
 * 음력 1월 1일의 양력 날짜
 */
export function getSolarNewYear(year: number): string | undefined {
  const data = getLunarYearData(year);
  return data?.solarNewYear;
}
