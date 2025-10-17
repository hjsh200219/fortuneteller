/**
 * 대운(大運) 계산 시스템
 * 10년 단위의 큰 흐름 운세 분석
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { getPreviousSolarTerm, getNextSolarTerm } from '../data/solar_terms_precise.js';
import { daeUnCache, generateDaeUnCacheKey } from './performance_cache.js';
import { getManselyeokDaeUnStartAge } from '../data/daeun_reference_table.js';

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
 * 대운 시작 나이 계산 (만세력 기준 - 정통 계산법)
 * 
 * 만세력 전통 공식:
 * - 3일 = 1년 (12개월)
 * - 1일 = 4개월
 * - 1시진(2시간) = 10일
 * - 1시간 = 5일 = 20개월
 * 
 * 출처: 명리정종, 적천수 등 전통 명리서
 */
function calculateDaeUnStartAge(sajuData: SajuData): number {
  // 만세력 기준: 출생일시를 정확히 반영
  const birthDate = new Date(sajuData.birthDate);
  const [hours, minutes] = sajuData.birthTime.split(':').map(Number);
  birthDate.setHours(hours!, minutes!, 0, 0);
  
  const isForward = isDaeUnForward(sajuData);

  let targetSolarTerm;
  
  if (isForward) {
    // 순행: 출생 후 다음 절기까지
    targetSolarTerm = getNextSolarTerm(birthDate);

    if (!targetSolarTerm) {
      console.warn('다음 절기 데이터를 찾을 수 없습니다. 기본값 5세를 사용합니다.');
      return 5;
    }

    const termDate = new Date(targetSolarTerm.datetime);
    const timeDifference = termDate.getTime() - birthDate.getTime();
    
    // 만세력 정밀 계산: 일, 시, 분 단위로 분리
    const totalMilliseconds = timeDifference;
    const totalMinutes = totalMilliseconds / (1000 * 60);
    const totalHours = totalMinutes / 60;
    const days = Math.floor(totalHours / 24);
    const remainingHours = Math.floor(totalHours % 24);
    const remainingMinutes = Math.floor(totalMinutes % 60);
    
    // 만세력 공식 적용
    return getManselyeokDaeUnStartAge(days, remainingHours, remainingMinutes);
    
  } else {
    // 역행: 출생 전 이전 절기까지
    targetSolarTerm = getPreviousSolarTerm(birthDate);

    if (!targetSolarTerm) {
      console.warn('이전 절기 데이터를 찾을 수 없습니다. 기본값 5세를 사용합니다.');
      return 5;
    }

    const termDate = new Date(targetSolarTerm.datetime);
    const timeDifference = birthDate.getTime() - termDate.getTime();
    
    // 만세력 정밀 계산: 일, 시, 분 단위로 분리
    const totalMilliseconds = timeDifference;
    const totalMinutes = totalMilliseconds / (1000 * 60);
    const totalHours = totalMinutes / 60;
    const days = Math.floor(totalHours / 24);
    const remainingHours = Math.floor(totalHours % 24);
    const remainingMinutes = Math.floor(totalMinutes % 60);
    
    // 만세력 공식 적용
    return getManselyeokDaeUnStartAge(days, remainingHours, remainingMinutes);
  }
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
