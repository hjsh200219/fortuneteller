/**
 * 통합 데이터 쿼리 시스템
 *
 * 분산된 음력/절기 데이터 파일들을 통합 관리하고
 * 1900-2200년 전체 범위에 대한 단일 API 제공
 */

import type { SolarTerm } from '../types/index.js';
import { LRUCache } from './performance_cache.js';

// 음력 데이터 import
import { getLunarYearData, type LunarYearData } from '../data/lunar_table.js';
import { LUNAR_TABLE_1900_2200 } from '../data/lunar_table_1900_2200.js';

// 절기 데이터 import
import { getSolarTermsForYear, type SolarTermComplete } from '../data/solar_terms.js';

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

  const data = getLunarYearData(year) ?? undefined;

  // 캐시에 저장
  if (data) {
    lunarDataCache.set(year, data);
  }

  return data;
}

/** 1900-2200 전체 절기(시간순, timestamp 보정 적용) — getSolarTermsForYear 단일 출처 */
let allSolarTermsCache: SolarTermComplete[] | null = null;
function getAllSolarTerms(): SolarTermComplete[] {
  if (!allSolarTermsCache) {
    const terms: SolarTermComplete[] = [];
    for (let y = DATA_RANGE.MIN_YEAR; y <= DATA_RANGE.MAX_YEAR; y++) {
      terms.push(...getSolarTermsForYear(y));
    }
    allSolarTermsCache = terms;
  }
  return allSolarTermsCache;
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

  const data = getSolarTermsForYear(year).find(st => st.term === term);

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

  return getSolarTermsForYear(year);
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
  const allTerms = getAllSolarTerms();

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
  const allTerms = getAllSolarTerms();

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
  const allLunarData = LUNAR_TABLE_1900_2200;

  const allSolarTerms = getAllSolarTerms();

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
