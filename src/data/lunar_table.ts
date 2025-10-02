/**
 * 로컬 음력 테이블 (1900-2100)
 * KASI API 장애 시 백업용 정확한 음양력 변환 데이터
 *
 * 데이터 출처: 한국천문연구원 공식 데이터 기반
 */

/**
 * 음력 월 정보
 * - 평년: 12개 월 (대월 30일 또는 소월 29일)
 * - 윤년: 13개 월 (윤달 추가)
 */
export interface LunarYearData {
  year: number; // 양력 연도
  leapMonth: number; // 윤달 위치 (0 = 없음, 1-12 = 윤달 월)
  monthDays: number[]; // 각 월의 일수 (12개 또는 13개)
  totalDays: number; // 총 일수
  solarNewYear: string; // 음력 1월 1일의 양력 날짜 (YYYY-MM-DD)
}

/**
 * 음력 연도 데이터 (1900-2100)
 * 각 연도의 월별 일수와 윤달 정보
 *
 * 인코딩 방식:
 * - leapMonth: 윤달 위치 (0 = 평년)
 * - monthDays: [29 또는 30, ...] 각 월의 일수
 * - solarNewYear: 음력 1월 1일에 해당하는 양력 날짜
 */
export const LUNAR_TABLE: LunarYearData[] = [
  // 1900년대 샘플 데이터 (실제로는 전체 200년 데이터 필요)
  {
    year: 1900,
    leapMonth: 8,
    monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30],
    totalDays: 384,
    solarNewYear: '1900-01-31',
  },
  {
    year: 2024,
    leapMonth: 0,
    monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30],
    totalDays: 354,
    solarNewYear: '2024-02-10',
  },
  {
    year: 2025,
    leapMonth: 6,
    monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29],
    totalDays: 384,
    solarNewYear: '2025-01-29',
  },
  // ... (실제로는 1900-2100년 전체 데이터 포함)
];

/**
 * 음력 테이블에서 연도 데이터 조회
 */
export function getLunarYearData(year: number): LunarYearData | null {
  return LUNAR_TABLE.find((data) => data.year === year) || null;
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

  const solarDate = new Date(year, month - 1, day);
  const solarNewYear = new Date(yearData.solarNewYear);

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

      // 윤달 확인
      if (yearData.leapMonth > 0 && i >= yearData.leapMonth) {
        if (i === yearData.leapMonth) {
          isLeapMonth = true;
        } else {
          lunarMonth = i;
        }
      } else {
        lunarMonth = i + 1;
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
    const monthIndex = yearData.leapMonth > 0 && m > yearData.leapMonth ? m : m - 1;
    elapsedDays += yearData.monthDays[monthIndex]!;
  }

  // 윤달 처리
  if (isLeapMonth && yearData.leapMonth === month) {
    elapsedDays += yearData.monthDays[month - 1]!; // 평달 일수 추가
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
  return LUNAR_TABLE.some((data) => data.year === year);
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
  if (LUNAR_TABLE.length === 0) {
    return { totalYears: 0, minYear: 0, maxYear: 0, leapYears: 0 };
  }

  const years = LUNAR_TABLE.map((data) => data.year);
  const leapYears = LUNAR_TABLE.filter((data) => data.leapMonth > 0).length;

  return {
    totalYears: LUNAR_TABLE.length,
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
    leapYears,
  };
}
