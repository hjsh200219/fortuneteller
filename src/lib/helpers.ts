/**
 * 사주 분석 공통 헬퍼 함수
 *
 * 여러 라이브러리에서 공통으로 사용되는 유틸리티 함수들
 */

import type { HeavenlyStem, EarthlyBranch } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { BASE_YEAR, BASE_DATE_UTC, BASE_DAY_STEM_INDEX, BASE_DAY_BRANCH_INDEX } from './constants.js';

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
 * 양력 연·월의 월건(月建) 간지 — 그 달에 절입하는 절(節)이 다스리는 달
 *
 * 절(節)은 매달 4~8일에 들어오므로 양력 M월의 대부분은 M월 절이 여는 달이다:
 * 2월=입춘(인월) … 12월=대설(자월), 1월=소한(축월). 1월 축월은 아직 입춘 전이라 전년도 연간으로 월간을 낸다.
 * 절입일 이전 며칠은 전달 간지다 — 날짜 단위가 필요하면 calculateSaju 를 쓴다.
 */
export function getSolarMonthGanJi(
  year: number,
  month: number
): { stem: HeavenlyStem; branch: EarthlyBranch; offsetFromIn: number } {
  const offsetFromIn = (month + 10) % 12; // 0=인월(2월) … 10=자월(12월), 11=축월(1월)
  const sajuYear = month === 1 ? year - 1 : year;
  const yearStemIndex = (((sajuYear - 4) % 10) + 10) % 10;
  // 갑기년 병인월, 을경년 무인월, 병신년 경인월, 정임년 임인월, 무계년 갑인월
  const stemIndex = ((yearStemIndex % 5) * 2 + 2 + offsetFromIn) % 10;
  const branchIndex = (offsetFromIn + 2) % 12;
  return {
    stem: getHeavenlyStemByIndex(stemIndex).korean,
    branch: getEarthlyBranchByIndex(branchIndex).korean,
    offsetFromIn,
  };
}

/**
 * 날짜에서 일주(일간, 일지) 구하기
 *
 * @param date - 날짜
 * @returns 일간과 일지
 */
export function getDayPillar(date: Date): { stem: HeavenlyStem; branch: EarthlyBranch } {
  // UTC 기반으로 일수 차이 계산하여 타임존 영향 제거
  const targetUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((targetUTC - BASE_DATE_UTC) / (1000 * 60 * 60 * 24));

  const stemIndex = ((BASE_DAY_STEM_INDEX + diffDays) % 10 + 10) % 10;
  const branchIndex = ((BASE_DAY_BRANCH_INDEX + diffDays) % 12 + 12) % 12;

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
