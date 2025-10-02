/**
 * 대운(大運) 분석 시스템
 *
 * 10년 주기로 바뀌는 대운을 분석하여 장기 인생 운세를 제공합니다.
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from './constants.js';
import { getPreviousSolarTerm, getNextSolarTerm } from '../data/solar_terms_precise.js';

/**
 * 대운 주기 (10년)
 */
export interface DaeunPeriod {
  /** 시작 나이 */
  startAge: number;
  /** 종료 나이 */
  endAge: number;
  /** 대운 천간 */
  stem: HeavenlyStem;
  /** 대운 지지 */
  branch: EarthlyBranch;
  /** 대운 기둥 (천간+지지) */
  pillar: string;
  /** 대운 오행 */
  element: WuXing;
}

/**
 * 대운 상세 분석
 */
export interface DaeunAnalysis {
  /** 대운 주기 정보 */
  period: DaeunPeriod;

  /** 사주와의 관계 */
  sajuRelation: {
    /** 천간 관계 */
    stemRelation: string;
    /** 지지 관계 */
    branchRelation: string;
    /** 조화도 (0-100) */
    harmonyScore: number;
    /** 충돌 경고 */
    conflicts: string[];
  };

  /** 오행 분석 */
  wuxingAnalysis: {
    /** 대운 오행 */
    element: WuXing;
    /** 오행 균형 변화 */
    balanceChange: string;
    /** 유리한 측면 */
    favorable: string[];
    /** 불리한 측면 */
    unfavorable: string[];
  };

  /** 운세 평가 */
  fortune: {
    /** 전체 평가 */
    overall: '대길' | '길' | '평' | '흉' | '대흉';
    /** 점수 (0-100) */
    score: number;
    /** 세부 점수 */
    aspects: {
      career: number; // 직업운
      wealth: number; // 재물운
      health: number; // 건강운
      relationship: number; // 인간관계운
    };
  };

  /** 해석 */
  interpretation: {
    /** 요약 */
    summary: string;
    /** 주요 기회 */
    opportunities: string[];
    /** 주요 도전과제 */
    challenges: string[];
    /** 조언 */
    advice: string[];
  };

  /** 중요 시기 */
  keyPeriods: {
    /** 가장 좋은 해 (나이) */
    bestYears: number[];
    /** 주의해야 할 해 (나이) */
    cautiousYears: number[];
  };
}

/**
 * 대운 시작 나이 계산 (정밀)
 *
 * 한국천문연구원 절기 데이터를 사용하여 정확한 대운 시작 시기를 계산합니다.
 *
 * @param birthDate 생년월일 (Date 객체)
 * @param isYangMale 양남음녀 여부 (true: 양남음녀 순행, false: 음남양녀 역행)
 * @returns 대운 시작 나이 (만 나이)
 */
function calculateDaeunStartAge(
  birthDate: Date,
  isYangMale: boolean
): number {
  let solarTermDate: Date;

  if (isYangMale) {
    // 양남음녀(陽男陰女): 생일 → 다음 절기
    const nextTerm = getNextSolarTerm(birthDate);
    if (!nextTerm) {
      console.warn('다음 절기를 찾을 수 없어 기본값 3세를 사용합니다.');
      return 3;
    }
    solarTermDate = new Date(nextTerm.datetime);
  } else {
    // 음남양녀(陰男陽女): 이전 절기 → 생일
    const prevTerm = getPreviousSolarTerm(birthDate);
    if (!prevTerm) {
      console.warn('이전 절기를 찾을 수 없어 기본값 3세를 사용합니다.');
      return 3;
    }
    solarTermDate = new Date(prevTerm.datetime);
  }

  // 생일과 절기 사이의 일수 계산 (절대값)
  const dayDiff = Math.abs(solarTermDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);

  // 3일 = 1년 규칙
  const startAge = Math.floor(dayDiff / 3);

  // 최소 1세, 최대 10세로 제한 (일반적인 대운 시작 범위)
  return Math.max(1, Math.min(10, startAge));
}

/**
 * 대운 천간지지 계산
 */
function calculateDaeunPillar(
  monthStem: HeavenlyStem,
  monthBranch: EarthlyBranch,
  順逆: '順行' | '逆行',
  순서: number
): { stem: HeavenlyStem; branch: EarthlyBranch } {
  const stemIndex = HEAVENLY_STEMS.indexOf(monthStem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(monthBranch);

  let newStemIndex: number;
  let newBranchIndex: number;

  if (順逆 === '順行') {
    // 순행: 다음 천간지지
    newStemIndex = (stemIndex + 순서) % 10;
    newBranchIndex = (branchIndex + 순서) % 12;
  } else {
    // 역행: 이전 천간지지
    newStemIndex = (stemIndex - 순서 + 10) % 10;
    newBranchIndex = (branchIndex - 순서 + 12) % 12;
  }

  const stem = getHeavenlyStemByIndex(newStemIndex);
  const branch = getEarthlyBranchByIndex(newBranchIndex);

  return {
    stem: stem.korean,
    branch: branch.korean,
  };
}

/**
 * 대운 목록 생성
 */
export function calculateDaeunList(
  saju: SajuData,
  maxAge: number = 100
): DaeunPeriod[] {
  const gender = saju.gender;
  const monthStem = saju.month.stem;
  const monthBranch = saju.month.branch;

  // 양남음녀는 순행, 음남양녀는 역행
  // TODO: 실제로는 연주의 음양을 확인해야 하지만, 간단히 성별로 판단
  const isYangMale = gender === 'male';
  const direction: '順行' | '逆行' = isYangMale ? '順行' : '逆行';

  // 생년월일 Date 객체 생성
  const birthDate = new Date(saju.birthDate);

  // 절기 데이터 기반 정밀 대운 시작 나이 계산
  const startAge = calculateDaeunStartAge(birthDate, isYangMale);

  const periods: DaeunPeriod[] = [];
  let currentAge = startAge;
  let periodIndex = 1;

  while (currentAge <= maxAge) {
    const { stem, branch } = calculateDaeunPillar(monthStem, monthBranch, direction, periodIndex);
    const stemData = getHeavenlyStemByIndex(HEAVENLY_STEMS.indexOf(stem));
    const element = stemData.element;

    periods.push({
      startAge: currentAge,
      endAge: currentAge + 9,
      stem,
      branch,
      pillar: `${stem}${branch}`,
      element,
    });

    currentAge += 10;
    periodIndex += 1;
  }

  return periods;
}

/**
 * 특정 나이의 대운 찾기
 */
export function getDaeunByAge(
  saju: SajuData,
  age: number
): DaeunPeriod | null {
  const periods = calculateDaeunList(saju, age + 10);
  return periods.find(p => age >= p.startAge && age <= p.endAge) || null;
}

/**
 * 특정 연도의 대운 찾기
 */
export function getDaeunByYear(
  saju: SajuData,
  year: number
): DaeunPeriod | null {
  const birthYear = parseInt(saju.birthDate.split('-')[0] || '2000');
  const age = year - birthYear;
  return getDaeunByAge(saju, age);
}

/**
 * 대운 상세 분석
 */
export function analyzeDaeun(
  saju: SajuData,
  daeunPeriod: DaeunPeriod
): DaeunAnalysis {
  const yongsin = saju.yongSin?.primaryYongSin || '목';

  // 1. 사주와의 관계 분석
  const sajuRelation = analyzeSajuRelation(saju, daeunPeriod);

  // 2. 오행 분석
  const wuxingAnalysis = analyzeWuxing(saju, daeunPeriod, yongsin);

  // 3. 운세 평가
  const fortune = evaluateFortune(sajuRelation, wuxingAnalysis, yongsin, daeunPeriod.element);

  // 4. 해석 생성
  const interpretation = generateInterpretation(daeunPeriod, sajuRelation, wuxingAnalysis, fortune);

  // 5. 중요 시기
  const keyPeriods = identifyKeyPeriods(daeunPeriod, fortune);

  return {
    period: daeunPeriod,
    sajuRelation,
    wuxingAnalysis,
    fortune,
    interpretation,
    keyPeriods,
  };
}

/**
 * 사주와의 관계 분석
 */
function analyzeSajuRelation(
  saju: SajuData,
  daeun: DaeunPeriod
): DaeunAnalysis['sajuRelation'] {
  let harmonyScore = 50;
  const conflicts: string[] = [];

  // 일간과 대운 천간 관계
  const dayStem = saju.day.stem;
  const stemRelation = dayStem === daeun.stem
    ? '비견 (동일 천간)'
    : '타 천간';

  if (dayStem === daeun.stem) {
    harmonyScore += 10;
  }

  // 지지 충돌 체크 (간단 버전)
  const branchRelation = '보통';

  // 용신 관계
  const yongsin = saju.yongSin?.primaryYongSin || '목';
  if (daeun.element === yongsin) {
    harmonyScore += 30;
  }

  return {
    stemRelation,
    branchRelation,
    harmonyScore: Math.min(100, Math.max(0, harmonyScore)),
    conflicts,
  };
}

/**
 * 오행 분석
 */
function analyzeWuxing(
  saju: SajuData,
  daeun: DaeunPeriod,
  yongsin: WuXing
): DaeunAnalysis['wuxingAnalysis'] {
  const element = daeun.element;
  const favorable: string[] = [];
  const unfavorable: string[] = [];

  // 용신과의 관계
  if (element === yongsin) {
    favorable.push('대운이 용신과 일치하여 매우 유리합니다.');
  } else if (generates(element, yongsin)) {
    favorable.push('대운이 용신을 생조하여 유리합니다.');
  } else if (controls(element, yongsin)) {
    unfavorable.push('대운이 용신을 극하여 불리합니다.');
  }

  // 오행 균형 변화
  const currentCount = saju.wuxingCount[element] || 0;
  let balanceChange = '';
  if (currentCount === 0) {
    balanceChange = `부족했던 ${element} 기운이 보충됩니다.`;
    favorable.push(balanceChange);
  } else if (currentCount >= 3) {
    balanceChange = `이미 강한 ${element} 기운이 더욱 강해집니다.`;
    unfavorable.push('오행 균형이 깨질 수 있습니다.');
  } else {
    balanceChange = `${element} 기운이 강화됩니다.`;
  }

  return {
    element,
    balanceChange,
    favorable,
    unfavorable,
  };
}

/**
 * 운세 평가
 */
function evaluateFortune(
  sajuRelation: DaeunAnalysis['sajuRelation'],
  wuxingAnalysis: DaeunAnalysis['wuxingAnalysis'],
  yongsin: WuXing,
  daeunElement: WuXing
): DaeunAnalysis['fortune'] {
  let score = sajuRelation.harmonyScore;

  // 용신 보너스
  if (daeunElement === yongsin) {
    score += 20;
  } else if (generates(daeunElement, yongsin)) {
    score += 10;
  } else if (controls(daeunElement, yongsin)) {
    score -= 20;
  }

  // 유리/불리 요소 반영
  score += wuxingAnalysis.favorable.length * 5;
  score -= wuxingAnalysis.unfavorable.length * 10;

  score = Math.min(100, Math.max(0, score));

  // 세부 점수
  const career = Math.min(100, score + (Math.random() * 10 - 5));
  const wealth = Math.min(100, score + (Math.random() * 10 - 5));
  const health = Math.min(100, score + (Math.random() * 10 - 5));
  const relationship = Math.min(100, score + (Math.random() * 10 - 5));

  const overall: '대길' | '길' | '평' | '흉' | '대흉' =
    score >= 80 ? '대길'
    : score >= 65 ? '길'
    : score >= 45 ? '평'
    : score >= 30 ? '흉'
    : '대흉';

  return {
    overall,
    score,
    aspects: {
      career: Math.round(career),
      wealth: Math.round(wealth),
      health: Math.round(health),
      relationship: Math.round(relationship),
    },
  };
}

/**
 * 해석 생성
 */
function generateInterpretation(
  daeun: DaeunPeriod,
  sajuRelation: DaeunAnalysis['sajuRelation'],
  wuxingAnalysis: DaeunAnalysis['wuxingAnalysis'],
  fortune: DaeunAnalysis['fortune']
): DaeunAnalysis['interpretation'] {
  const summary = `${daeun.startAge}세부터 ${daeun.endAge}세까지의 10년은 ${fortune.overall} 운세입니다. (점수: ${fortune.score}점)`;

  const opportunities = [
    ...wuxingAnalysis.favorable,
    fortune.score >= 70 ? '장기적 계획을 세우기 좋은 시기입니다.' : '',
  ].filter(Boolean);

  const challenges = [
    ...wuxingAnalysis.unfavorable,
    ...sajuRelation.conflicts,
  ].filter(Boolean);

  const advice = [
    fortune.score >= 70
      ? `${daeun.element} 오행을 활용한 활동이 유리합니다.`
      : '신중하고 보수적인 태도가 필요합니다.',
    '대운은 10년 단위이므로 장기적 관점에서 접근하세요.',
  ];

  return {
    summary,
    opportunities: opportunities.length > 0 ? opportunities : ['꾸준한 노력이 필요한 시기입니다.'],
    challenges: challenges.length > 0 ? challenges : ['특별한 도전과제는 없습니다.'],
    advice,
  };
}

/**
 * 중요 시기 식별
 */
function identifyKeyPeriods(
  daeun: DaeunPeriod,
  fortune: DaeunAnalysis['fortune']
): DaeunAnalysis['keyPeriods'] {
  const bestYears: number[] = [];
  const cautiousYears: number[] = [];

  // 대운 초반 (1-3년차)
  if (fortune.score >= 70) {
    bestYears.push(daeun.startAge, daeun.startAge + 1, daeun.startAge + 2);
  }

  // 대운 중반 (4-7년차)
  if (fortune.score >= 60) {
    bestYears.push(daeun.startAge + 5);
  }

  // 대운 말기 (8-10년차)
  if (fortune.score < 50) {
    cautiousYears.push(daeun.endAge - 1, daeun.endAge);
  }

  return {
    bestYears: bestYears.slice(0, 5),
    cautiousYears: cautiousYears.slice(0, 3),
  };
}

// ==================== 헬퍼 함수 ====================

/**
 * 오행 상생
 */
function generates(from: WuXing, to: WuXing): boolean {
  const cycle: Record<WuXing, WuXing> = {
    '목': '화',
    '화': '토',
    '토': '금',
    '금': '수',
    '수': '목',
  };
  return cycle[from] === to;
}

/**
 * 오행 상극
 */
function controls(from: WuXing, to: WuXing): boolean {
  const cycle: Record<WuXing, WuXing> = {
    '목': '토',
    '토': '수',
    '수': '화',
    '화': '금',
    '금': '목',
  };
  return cycle[from] === to;
}

/**
 * 다중 대운 분석 (여러 대운 한번에)
 */
export function analyzeMultipleDaeun(
  saju: SajuData,
  startAge: number,
  endAge: number
): DaeunAnalysis[] {
  const periods = calculateDaeunList(saju, endAge);
  const relevantPeriods = periods.filter(
    p => (p.startAge >= startAge && p.startAge <= endAge) ||
         (p.endAge >= startAge && p.endAge <= endAge)
  );

  return relevantPeriods.map(period => analyzeDaeun(saju, period));
}
