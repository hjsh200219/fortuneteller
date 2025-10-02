/**
 * 통합 데이터 쿼리 시스템
 *
 * 분산된 음력/절기 데이터 파일들을 통합 관리하고
 * 1900-2200년 전체 범위에 대한 단일 API 제공
 */

import type { SolarTerm } from '../types/index.js';
import { LRUCache } from './performance_cache.js';

// 음력 데이터 import
import { LUNAR_TABLE_1900_2019, getLunarYearData1900_2019, type LunarYearData } from '../data/lunar_table_1900_2019.js';
import { LUNAR_TABLE_EXTENDED, getLunarYearData } from '../data/lunar_table_extended.js';
import { LUNAR_TABLE_2031_2100, getLunarYearData2031_2100 } from '../data/lunar_table_2031_2100.js';
import { LUNAR_TABLE_2101_2200, getLunarYearData2101_2200 } from '../data/lunar_table_2101_2200.js';

// 절기 데이터 import
import { SOLAR_TERMS_1900_2019, type SolarTermComplete } from '../data/solar_terms_1900_2019.js';
import { SOLAR_TERMS_COMPLETE } from '../data/solar_terms_complete.js';
import { SOLAR_TERMS_2031_2100 } from '../data/solar_terms_2031_2100.js';
import { SOLAR_TERMS_2101_2200 } from '../data/solar_terms_2101_2200.js';

/**
 * 데이터 범위 상수
 */
export const DATA_RANGE = {
  MIN_YEAR: 1900,
  MAX_YEAR: 2200,
  TOTAL_YEARS: 301,
} as const;

/**
 * 통합 데이터 캐시
 */
const lunarDataCache = new LRUCache<number, LunarYearData>(301, 3600000); // 1시간 TTL
const solarTermCache = new LRUCache<string, SolarTermComplete>(7224, 3600000); // 301년 × 24절기

/**
 * 통합 음력 데이터 조회
 *
 * 1900-2200년 전체 범위에서 음력 데이터를 조회합니다.
 *
 * @param year 연도 (1900-2200)
 * @returns 음력 연도 데이터 또는 undefined
 * @throws Error 범위를 벗어난 연도인 경우
 */
export function getUnifiedLunarYearData(year: number): LunarYearData | undefined {
  // 범위 검증
  if (year < DATA_RANGE.MIN_YEAR || year > DATA_RANGE.MAX_YEAR) {
    throw new Error(
      `연도는 ${DATA_RANGE.MIN_YEAR}년부터 ${DATA_RANGE.MAX_YEAR}년 사이여야 합니다. 입력: ${year}년`
    );
  }

  // 캐시 확인
  const cached = lunarDataCache.get(year);
  if (cached) {
    return cached;
  }

  // 연도 범위에 따라 적절한 데이터 소스 선택
  let data: LunarYearData | undefined;

  if (year >= 1900 && year <= 2019) {
    data = getLunarYearData1900_2019(year);
  } else if (year >= 2020 && year <= 2030) {
    data = getLunarYearData(year);
  } else if (year >= 2031 && year <= 2100) {
    data = getLunarYearData2031_2100(year);
  } else if (year >= 2101 && year <= 2200) {
    data = getLunarYearData2101_2200(year);
  }

  // 캐시에 저장
  if (data) {
    lunarDataCache.set(year, data);
  }

  return data;
}

/**
 * 통합 절기 데이터 조회
 *
 * 1900-2200년 전체 범위에서 특정 연도와 절기의 데이터를 조회합니다.
 *
 * @param year 연도 (1900-2200)
 * @param term 절기명
 * @returns 절기 데이터 또는 undefined
 * @throws Error 범위를 벗어난 연도인 경우
 */
export function getUnifiedSolarTerm(year: number, term: SolarTerm): SolarTermComplete | undefined {
  // 범위 검증
  if (year < DATA_RANGE.MIN_YEAR || year > DATA_RANGE.MAX_YEAR) {
    throw new Error(
      `연도는 ${DATA_RANGE.MIN_YEAR}년부터 ${DATA_RANGE.MAX_YEAR}년 사이여야 합니다. 입력: ${year}년`
    );
  }

  // 캐시 키 생성
  const cacheKey = `${year}-${term}`;

  // 캐시 확인
  const cached = solarTermCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 연도 범위에 따라 적절한 데이터 소스 선택
  let data: SolarTermComplete | undefined;

  if (year >= 1900 && year <= 2019) {
    data = SOLAR_TERMS_1900_2019.find(st => st.year === year && st.term === term);
  } else if (year >= 2020 && year <= 2030) {
    data = SOLAR_TERMS_COMPLETE.find(st => st.year === year && st.term === term);
  } else if (year >= 2031 && year <= 2100) {
    data = SOLAR_TERMS_2031_2100.find(st => st.year === year && st.term === term);
  } else if (year >= 2101 && year <= 2200) {
    data = SOLAR_TERMS_2101_2200.find(st => st.year === year && st.term === term);
  }

  // 캐시에 저장
  if (data) {
    solarTermCache.set(cacheKey, data);
  }

  return data;
}

/**
 * 특정 연도의 모든 절기 데이터 조회
 *
 * @param year 연도 (1900-2200)
 * @returns 해당 연도의 모든 절기 배열
 * @throws Error 범위를 벗어난 연도인 경우
 */
export function getUnifiedYearSolarTerms(year: number): SolarTermComplete[] {
  // 범위 검증
  if (year < DATA_RANGE.MIN_YEAR || year > DATA_RANGE.MAX_YEAR) {
    throw new Error(
      `연도는 ${DATA_RANGE.MIN_YEAR}년부터 ${DATA_RANGE.MAX_YEAR}년 사이여야 합니다. 입력: ${year}년`
    );
  }

  // 연도 범위에 따라 적절한 데이터 소스 선택
  if (year >= 1900 && year <= 2019) {
    return SOLAR_TERMS_1900_2019.filter(st => st.year === year);
  } else if (year >= 2020 && year <= 2030) {
    return SOLAR_TERMS_COMPLETE.filter(st => st.year === year);
  } else if (year >= 2031 && year <= 2100) {
    return SOLAR_TERMS_2031_2100.filter(st => st.year === year);
  } else if (year >= 2101 && year <= 2200) {
    return SOLAR_TERMS_2101_2200.filter(st => st.year === year);
  }

  return [];
}

/**
 * 특정 날짜의 현재 절기 조회
 *
 * @param date 조회할 날짜
 * @returns 현재 절기 데이터 또는 null
 * @throws Error 지원하지 않는 날짜 범위인 경우
 */
export function getUnifiedCurrentSolarTerm(date: Date): SolarTermComplete | null {
  const year = date.getFullYear();

  // 범위 검증
  if (year < DATA_RANGE.MIN_YEAR || year > DATA_RANGE.MAX_YEAR) {
    throw new Error(
      `날짜는 ${DATA_RANGE.MIN_YEAR}년부터 ${DATA_RANGE.MAX_YEAR}년 사이여야 합니다. 입력: ${date.toISOString()}`
    );
  }

  const timestamp = date.getTime();
  let currentTerm: SolarTermComplete | null = null;

  // 모든 절기 데이터를 통합하여 검색
  const allTerms = [
    ...SOLAR_TERMS_1900_2019,
    ...SOLAR_TERMS_COMPLETE,
    ...SOLAR_TERMS_2031_2100,
    ...SOLAR_TERMS_2101_2200,
  ];

  // 정렬된 순서로 검색 (timestamp 기준)
  for (const term of allTerms) {
    if (term.timestamp <= timestamp) {
      currentTerm = term;
    } else {
      break;
    }
  }

  return currentTerm;
}

/**
 * 특정 날짜의 다음 절기 조회
 *
 * @param date 조회할 날짜
 * @returns 다음 절기 데이터 또는 null
 * @throws Error 지원하지 않는 날짜 범위인 경우
 */
export function getUnifiedNextSolarTerm(date: Date): SolarTermComplete | null {
  const year = date.getFullYear();

  // 범위 검증
  if (year < DATA_RANGE.MIN_YEAR || year > DATA_RANGE.MAX_YEAR) {
    throw new Error(
      `날짜는 ${DATA_RANGE.MIN_YEAR}년부터 ${DATA_RANGE.MAX_YEAR}년 사이여야 합니다. 입력: ${date.toISOString()}`
    );
  }

  const timestamp = date.getTime();

  // 모든 절기 데이터를 통합하여 검색
  const allTerms = [
    ...SOLAR_TERMS_1900_2019,
    ...SOLAR_TERMS_COMPLETE,
    ...SOLAR_TERMS_2031_2100,
    ...SOLAR_TERMS_2101_2200,
  ];

  // 정렬된 순서로 검색
  for (const term of allTerms) {
    if (term.timestamp > timestamp) {
      return term;
    }
  }

  return null;
}

/**
 * 데이터 범위 검증
 *
 * @param year 검증할 연도
 * @returns 유효 여부
 */
export function isYearInRange(year: number): boolean {
  return year >= DATA_RANGE.MIN_YEAR && year <= DATA_RANGE.MAX_YEAR;
}

/**
 * 데이터 범위 검증 (날짜)
 *
 * @param date 검증할 날짜
 * @returns 유효 여부
 */
export function isDateInRange(date: Date): boolean {
  const year = date.getFullYear();
  return isYearInRange(year);
}

/**
 * 데이터 통계 정보
 */
export function getDataStatistics(): {
  lunarYears: number;
  solarTerms: number;
  yearRange: { min: number; max: number };
  cacheStats: {
    lunarHits: number;
    lunarSize: number;
    solarTermHits: number;
    solarTermSize: number;
  };
} {
  const allLunarData = [
    ...LUNAR_TABLE_1900_2019,
    ...LUNAR_TABLE_EXTENDED,
    ...LUNAR_TABLE_2031_2100,
    ...LUNAR_TABLE_2101_2200,
  ];

  const allSolarTerms = [
    ...SOLAR_TERMS_1900_2019,
    ...SOLAR_TERMS_COMPLETE,
    ...SOLAR_TERMS_2031_2100,
    ...SOLAR_TERMS_2101_2200,
  ];

  return {
    lunarYears: allLunarData.length,
    solarTerms: allSolarTerms.length,
    yearRange: {
      min: DATA_RANGE.MIN_YEAR,
      max: DATA_RANGE.MAX_YEAR,
    },
    cacheStats: {
      lunarHits: 0, // TODO: 캐시 히트 카운트 추가
      lunarSize: 0,
      solarTermHits: 0,
      solarTermSize: 0,
    },
  };
}

/**
 * 캐시 초기화
 */
export function clearDataCache(): void {
  lunarDataCache.clear();
  solarTermCache.clear();
}
