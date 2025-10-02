/**
 * 사주 분석 공통 헬퍼 함수
 *
 * 여러 라이브러리에서 공통으로 사용되는 유틸리티 함수들
 */

import type { HeavenlyStem, EarthlyBranch } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { BASE_YEAR, BASE_DATE, BASE_DAY_STEM_INDEX, BASE_DAY_BRANCH_INDEX } from './constants.js';

/**
 * 년도에서 천간 구하기
 *
 * @param year - 양력 년도
 * @returns 해당 년도의 천간
 */
export function getHeavenlyStemFromYear(year: number): HeavenlyStem {
  const stemIndex = (year - BASE_YEAR) % 10;
  const stem = getHeavenlyStemByIndex(stemIndex < 0 ? stemIndex + 10 : stemIndex);
  return stem.korean;
}

/**
 * 년도에서 지지 구하기
 *
 * @param year - 양력 년도
 * @returns 해당 년도의 지지
 */
export function getEarthlyBranchFromYear(year: number): EarthlyBranch {
  const branchIndex = (year - BASE_YEAR) % 12;
  const branch = getEarthlyBranchByIndex(branchIndex < 0 ? branchIndex + 12 : branchIndex);
  return branch.korean;
}

/**
 * 날짜에서 일주(일간, 일지) 구하기
 *
 * @param date - 날짜
 * @returns 일간과 일지
 */
export function getDayPillar(date: Date): { stem: HeavenlyStem; branch: EarthlyBranch } {
  const diffDays = Math.floor((date.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24));

  const stemIndex = (BASE_DAY_STEM_INDEX + diffDays) % 10;
  const branchIndex = (BASE_DAY_BRANCH_INDEX + diffDays) % 12;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);

  return {
    stem: stem.korean,
    branch: branch.korean,
  };
}

/**
 * 점수를 0-100 범위로 제한
 *
 * @param score - 원본 점수
 * @returns 0-100 범위의 점수
 */
export function clampScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}

/**
 * 배열에서 안전하게 요소 가져오기
 *
 * @param array - 배열
 * @param index - 인덱스
 * @param defaultValue - 기본값
 * @returns 배열 요소 또는 기본값
 */
export function safeArrayAccess<T>(array: readonly T[], index: number, defaultValue: T): T {
  return array[index] ?? defaultValue;
}

/**
 * 날짜 유효성 검증
 *
 * @param date - 검증할 날짜
 * @throws Error if date is invalid
 */
export function validateDate(date: Date): void {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
}

/**
 * 년도 범위 검증
 *
 * @param year - 검증할 년도
 * @param minYear - 최소 년도 (기본: 1900)
 * @param maxYear - 최대 년도 (기본: 2100)
 * @throws Error if year is out of range
 */
export function validateYear(year: number, minYear = 1900, maxYear = 2100): void {
  if (!Number.isInteger(year) || year < minYear || year > maxYear) {
    throw new Error(`Year must be between ${minYear} and ${maxYear}`);
  }
}
