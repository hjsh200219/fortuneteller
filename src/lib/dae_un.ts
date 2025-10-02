/**
 * 대운(大運) 계산 시스템
 * 10년 단위의 큰 흐름 운세 분석
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { getPreviousSolarTerm, getNextSolarTerm } from '../data/solar_terms_precise.js';
import { daeUnCache, generateDaeUnCacheKey } from './performance_cache.js';

export interface DaeUnPeriod {
  startAge: number;
  endAge: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: WuXing;
  branchElement: WuXing;
  pillarIndex: number; // 몇 번째 대운인지 (0부터 시작)
}

/**
 * 대운 계산 메인 함수 (캐싱 적용)
 */
export function calculateDaeUn(
  sajuData: SajuData,
  lifespan: number = 120
): DaeUnPeriod[] {
  // 캐시 체크
  const cacheKey = generateDaeUnCacheKey(
    sajuData.birthDate,
    sajuData.year.stem,
    sajuData.month.stem,
    sajuData.gender
  );
  const cached = daeUnCache.get(cacheKey);
  if (cached) {
    return cached as DaeUnPeriod[];
  }

  const daeUnPeriods: DaeUnPeriod[] = [];

  // 1. 대운 시작 나이 계산 (간단화: 남자 양년생/여자 음년생은 순행, 그 외는 역행)
  const startAge = calculateDaeUnStartAge(sajuData);

  // 2. 대운 순행/역행 결정
  const isForward = isDaeUnForward(sajuData);

  // 3. 월주 기준으로 대운 계산
  const monthStemIndex = getHeavenlyStemIndex(sajuData.month.stem);
  const monthBranchIndex = getEarthlyBranchIndex(sajuData.month.branch);

  // 최대 12개 대운 (120세까지)
  const maxPeriods = Math.ceil((lifespan - startAge) / 10);

  for (let i = 0; i < maxPeriods; i++) {
    let stemIndex: number;
    let branchIndex: number;

    if (isForward) {
      // 순행: 월주에서 순방향
      stemIndex = (monthStemIndex + i + 1) % 10;
      branchIndex = (monthBranchIndex + i + 1) % 12;
    } else {
      // 역행: 월주에서 역방향
      stemIndex = (monthStemIndex - i - 1 + 10) % 10;
      branchIndex = (monthBranchIndex - i - 1 + 12) % 12;
    }

    const stem = getHeavenlyStemByIndex(stemIndex);
    const branch = getEarthlyBranchByIndex(branchIndex);

    daeUnPeriods.push({
      startAge: startAge + i * 10,
      endAge: startAge + (i + 1) * 10 - 1,
      stem: stem.korean,
      branch: branch.korean,
      stemElement: stem.element,
      branchElement: branch.element,
      pillarIndex: i,
    });
  }

  // 캐시에 저장
  daeUnCache.set(cacheKey, daeUnPeriods);

  return daeUnPeriods;
}

/**
 * 특정 나이의 대운 조회
 */
export function getDaeUnAtAge(
  sajuData: SajuData,
  age: number
): DaeUnPeriod | null {
  const daeUnPeriods = calculateDaeUn(sajuData);

  for (const period of daeUnPeriods) {
    if (age >= period.startAge && age <= period.endAge) {
      return period;
    }
  }

  return null;
}

/**
 * 대운 시작 나이 계산 (정밀 계산)
 * 출생일부터 다음/이전 절기까지의 일수를 3으로 나눔
 * 3일 = 1년, 즉 1일 = 4개월
 */
function calculateDaeUnStartAge(sajuData: SajuData): number {
  const birthDate = new Date(sajuData.birthDate);
  const isForward = isDaeUnForward(sajuData);

  let targetSolarTerm;
  let daysDifference: number;

  if (isForward) {
    // 순행: 출생 후 다음 절기까지
    targetSolarTerm = getNextSolarTerm(birthDate);

    if (!targetSolarTerm) {
      // 절기 데이터가 없으면 기본값 사용
      console.warn('다음 절기 데이터를 찾을 수 없습니다. 기본값 5세를 사용합니다.');
      return 5;
    }

    const termDate = new Date(targetSolarTerm.datetime);
    daysDifference = Math.floor((termDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // 역행: 출생 전 이전 절기까지
    targetSolarTerm = getPreviousSolarTerm(birthDate);

    if (!targetSolarTerm) {
      // 절기 데이터가 없으면 기본값 사용
      console.warn('이전 절기 데이터를 찾을 수 없습니다. 기본값 5세를 사용합니다.');
      return 5;
    }

    const termDate = new Date(targetSolarTerm.datetime);
    daysDifference = Math.floor((birthDate.getTime() - termDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // 3일 = 1년, 즉 1일 = 4개월
  const years = Math.floor(daysDifference / 3);
  const remainingDays = daysDifference % 3;
  const months = remainingDays * 4;

  // 반올림하여 정수 나이로 반환 (6개월 이상이면 올림)
  const startAge = years + (months >= 6 ? 1 : 0);

  // 최소 0세, 최대 10세로 제한
  return Math.max(0, Math.min(10, startAge));
}

/**
 * 대운 순행/역행 결정
 * - 양남음녀: 순행
 * - 음남양녀: 역행
 */
function isDaeUnForward(sajuData: SajuData): boolean {
  const yearStemYinYang = sajuData.year.yinYang;
  const gender = sajuData.gender;

  // 양년생 남자 또는 음년생 여자 → 순행
  if (
    (yearStemYinYang === '양' && gender === 'male') ||
    (yearStemYinYang === '음' && gender === 'female')
  ) {
    return true;
  }

  // 음년생 남자 또는 양년생 여자 → 역행
  return false;
}

/**
 * 천간 인덱스 찾기
 */
function getHeavenlyStemIndex(stem: HeavenlyStem): number {
  const stems: HeavenlyStem[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  return stems.indexOf(stem);
}

/**
 * 지지 인덱스 찾기
 */
function getEarthlyBranchIndex(branch: EarthlyBranch): number {
  const branches: EarthlyBranch[] = [
    '자',
    '축',
    '인',
    '묘',
    '진',
    '사',
    '오',
    '미',
    '신',
    '유',
    '술',
    '해',
  ];
  return branches.indexOf(branch);
}

/**
 * 대운 포맷팅
 */
export function formatDaeUn(daeUn: DaeUnPeriod): string {
  return `${daeUn.startAge}-${daeUn.endAge}세: ${daeUn.stem}${daeUn.branch} (${daeUn.stemElement}/${daeUn.branchElement})`;
}

/**
 * 대운 목록 포맷팅
 */
export function formatDaeUnList(daeUnPeriods: DaeUnPeriod[], limit: number = 10): string {
  return daeUnPeriods
    .slice(0, limit)
    .map((period) => formatDaeUn(period))
    .join('\n');
}
