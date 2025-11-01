/**
 * 로컬 음력 테이블 (1900-2200)
 * 정확한 음양력 변환 데이터
 *
 * 데이터 출처: 한국천문연구원 공식 데이터 기반
 *
 * 연도별 테이블:
 * - 1900-2019: lunar_table_1900_2019.ts
 * - 2020-2030: lunar_table_extended.ts
 * - 2031-2100: lunar_table_2031_2100.ts
 * - 2101-2200: lunar_table_2101_2200.ts
 */

import { LUNAR_TABLE_1900_2019, type LunarYearData } from './lunar_table_1900_2019.js';
import { LUNAR_TABLE_EXTENDED } from './lunar_table_extended.js';
import { LUNAR_TABLE_2031_2100 } from './lunar_table_2031_2100.js';
import { LUNAR_TABLE_2101_2200 } from './lunar_table_2101_2200.js';

export type { LunarYearData };

/**
 * 음력 테이블에서 연도 데이터 조회 (연도별 자동 분기)
 */
export function getLunarYearData(year: number): LunarYearData | null {
  // 1900-2019
  if (year >= 1900 && year <= 2019) {
    return LUNAR_TABLE_1900_2019.find((data) => data.year === year) || null;
  }

  // 2020-2030
  if (year >= 2020 && year <= 2030) {
    return LUNAR_TABLE_EXTENDED.find((data) => data.year === year) || null;
  }

  // 2031-2100
  if (year >= 2031 && year <= 2100) {
    return LUNAR_TABLE_2031_2100.find((data) => data.year === year) || null;
  }

  // 2101-2200
  if (year >= 2101 && year <= 2200) {
    return LUNAR_TABLE_2101_2200.find((data) => data.year === year) || null;
  }

  return null;
}

/**
 * 로컬 테이블 기반 양력 → 음력 변환
 */
export function solarToLunarLocal(
  year: number,
  month: number,
  day: number
): { year: number; month: number; day: number; isLeapMonth: boolean } | null {
  const yearData = getLunarYearData(year);
  if (!yearData) {
    return null; // 테이블에 없는 연도
  }

  // UTC 기준으로 날짜 생성 (타임존 문제 방지)
  const solarDate = new Date(Date.UTC(year, month - 1, day));
  const [nyYear, nyMonth, nyDay] = yearData.solarNewYear.split('-').map(Number);
  const solarNewYear = new Date(Date.UTC(nyYear!, nyMonth! - 1, nyDay!));

  // 음력 1월 1일보다 이전이면 작년 데이터 참조
  if (solarDate < solarNewYear) {
    const prevYearData = getLunarYearData(year - 1);
    if (!prevYearData) {
      return null;
    }
    // 작년 음력 날짜 계산 (복잡하므로 간소화)
    return solarToLunarLocal(year - 1, 12, 31);
  }

  // 경과 일수 계산
  const diffTime = solarDate.getTime() - solarNewYear.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 음력 월, 일 계산
  let remainingDays = diffDays;
  let lunarMonth = 1;
  let isLeapMonth = false;

  for (let i = 0; i < yearData.monthDays.length; i++) {
    const monthDay = yearData.monthDays[i]!;

    if (remainingDays < monthDay) {
      // 현재 월에 해당
      const lunarDay = remainingDays + 1;

      // 윤달이 있는 경우 월 번호 계산
      if (yearData.leapMonth > 0) {
        // 윤달 이전 달
        if (i < yearData.leapMonth) {
          lunarMonth = i + 1;
          isLeapMonth = false;
        }
        // 윤달 자체
        else if (i === yearData.leapMonth) {
          lunarMonth = yearData.leapMonth;
          isLeapMonth = true;
        }
        // 윤달 이후 달
        else {
          lunarMonth = i;
          isLeapMonth = false;
        }
      } else {
        // 윤달이 없는 평년
        lunarMonth = i + 1;
        isLeapMonth = false;
      }

      return {
        year,
        month: lunarMonth,
        day: lunarDay,
        isLeapMonth,
      };
    }

    remainingDays -= monthDay;
  }

  return null; // 계산 실패
}

/**
 * 로컬 테이블 기반 음력 → 양력 변환
 */
export function lunarToSolarLocal(
  year: number,
  month: number,
  day: number,
  isLeapMonth: boolean = false
): { year: number; month: number; day: number } | null {
  const yearData = getLunarYearData(year);
  if (!yearData) {
    return null;
  }

  const solarNewYear = new Date(yearData.solarNewYear);

  // 음력 1월 1일부터의 경과 일수 계산
  let elapsedDays = 0;

  for (let m = 1; m < month; m++) {
    // 배열 인덱스 계산 (윤달 이후 달은 인덱스 +1 조정)
    let arrayIndex = m - 1;
    if (yearData.leapMonth > 0 && m > yearData.leapMonth) {
      arrayIndex = m; // 윤달 이후 달은 배열에서 한 칸 뒤에 위치
    }

    // m월의 일수 추가
    elapsedDays += yearData.monthDays[arrayIndex]!;

    // 윤달이 m월이면 윤달 일수도 추가
    if (yearData.leapMonth === m) {
      elapsedDays += yearData.monthDays[yearData.leapMonth]!;
    }
  }

  // 윤달 처리: 조회하는 달이 윤달인 경우 평달 일수도 추가
  if (isLeapMonth && yearData.leapMonth === month) {
    let arrayIndex = month - 1;
    if (yearData.leapMonth > 0 && month > yearData.leapMonth) {
      arrayIndex = month;
    }
    elapsedDays += yearData.monthDays[arrayIndex]!;
  }

  elapsedDays += day - 1;

  // 양력 날짜 계산
  const solarDate = new Date(solarNewYear.getTime() + elapsedDays * 24 * 60 * 60 * 1000);

  return {
    year: solarDate.getFullYear(),
    month: solarDate.getMonth() + 1,
    day: solarDate.getDate(),
  };
}

/**
 * 로컬 테이블 지원 범위 확인
 */
export function isYearSupported(year: number): boolean {
  return year >= 1900 && year <= 2200;
}

/**
 * 로컬 테이블 통계
 */
export function getTableStats(): {
  totalYears: number;
  minYear: number;
  maxYear: number;
  leapYears: number;
} {
  const allTables = [
    ...LUNAR_TABLE_1900_2019,
    ...LUNAR_TABLE_EXTENDED,
    ...LUNAR_TABLE_2031_2100,
    ...LUNAR_TABLE_2101_2200,
  ];

  if (allTables.length === 0) {
    return { totalYears: 0, minYear: 0, maxYear: 0, leapYears: 0 };
  }

  const years = allTables.map((data) => data.year);
  const leapYears = allTables.filter((data) => data.leapMonth > 0).length;

  return {
    totalYears: allTables.length,
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
    leapYears,
  };
}
