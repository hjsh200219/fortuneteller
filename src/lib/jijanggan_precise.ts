/**
 * 지장간 세력 정밀 계산 라이브러리
 *
 * 절기와 생일을 기반으로 지장간의 정밀한 세력을 계산
 */

import type { EarthlyBranch, HeavenlyStem } from '../types/index.js';
import {
  JIJANGGAN_STRENGTH_DETAILED,
  BRANCH_TOTAL_DAYS,
  calculateJiJangGanStrengthByDays,
} from '../data/jijanggan_strength_table.js';
import { getUnifiedCurrentSolarTerm } from './unified_data_query.js';
import type { SolarTerm } from '../types/index.js';

/**
 * 지장간 정밀 세력 정보
 */
export interface JiJangGanPreciseStrength {
  stem: HeavenlyStem;
  strength: number; // 0-100 범위의 세력
  role: '여기' | '중기' | '정기'; // 해당 천간의 역할
  isActive: boolean; // 현재 활성화 여부
}

/**
 * 지장간 정밀 세력 분석 결과
 */
export interface JiJangGanAnalysis {
  branch: EarthlyBranch;
  birthDate: Date;
  solarTerm: SolarTerm;
  daysSinceTermStart: number;
  totalDays: number;
  strengths: JiJangGanPreciseStrength[];
  dominantStem: HeavenlyStem;
  dominantStrength: number;
}

/**
 * 지장간 세력 정밀 계산
 *
 * @param branch 지지 (月支 또는 日支)
 * @param birthDate 생년월일시
 * @returns 지장간 정밀 세력 분석 결과
 */
export function calculateJiJangGanStrengthPrecise(
  branch: EarthlyBranch,
  birthDate: Date
): JiJangGanAnalysis {
  // 1. 해당 지지의 절기 시작일 찾기
  const currentTerm = getUnifiedCurrentSolarTerm(birthDate);
  if (!currentTerm) {
    throw new Error(`${birthDate.toISOString()}의 절기를 찾을 수 없습니다.`);
  }

  // 절기 시작일
  const termStartDate = new Date(currentTerm.datetime);

  // 2. 절기 시작일로부터 경과 일수 계산
  const daysSinceTermStart = Math.floor(
    (birthDate.getTime() - termStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 3. 총 일수 (해당 월지의 총 일수)
  const totalDays = BRANCH_TOTAL_DAYS[branch];

  // 4. 지장간 세력 테이블에서 정보 조회
  const strengthPhases = JIJANGGAN_STRENGTH_DETAILED[branch];
  if (!strengthPhases) {
    throw new Error(`지지 ${branch}에 대한 지장간 세력 테이블을 찾을 수 없습니다.`);
  }

  // 5. 경과 일수에 따른 활성 천간 계산
  const activePhaseResult = calculateJiJangGanStrengthByDays(branch, daysSinceTermStart);

  // 6. 각 천간별 세력 및 역할 분석
  const strengths: JiJangGanPreciseStrength[] = strengthPhases.map((phase, index) => {
    const role = index === 0 ? '여기' : index === strengthPhases.length - 1 ? '정기' : '중기';
    const isActive =
      activePhaseResult.primary.stem === phase.stem ||
      activePhaseResult.secondary?.stem === phase.stem ||
      activePhaseResult.residual?.stem === phase.stem;

    return {
      stem: phase.stem,
      strength: phase.strength,
      role,
      isActive,
    };
  });

  // 7. 지배적 천간 (가장 세력이 강한 천간)
  const dominantStrength = strengths.reduce(
    (max, s) => (s.strength > max.strength ? s : max),
    strengths[0]!
  );

  return {
    branch,
    birthDate,
    solarTerm: currentTerm.term,
    daysSinceTermStart,
    totalDays,
    strengths,
    dominantStem: dominantStrength.stem,
    dominantStrength: dominantStrength.strength,
  };
}

/**
 * 일주 지장간 정밀 세력 계산
 *
 * 일지의 지장간 세력을 정밀 계산하여 반환
 */
export function calculateDayBranchJiJangGan(
  dayBranch: EarthlyBranch,
  birthDate: Date
): JiJangGanPreciseStrength[] {
  const analysis = calculateJiJangGanStrengthPrecise(dayBranch, birthDate);
  return analysis.strengths;
}

/**
 * 월주 지장간 정밀 세력 계산
 *
 * 월지의 지장간 세력을 정밀 계산하여 반환
 */
export function calculateMonthBranchJiJangGan(
  monthBranch: EarthlyBranch,
  birthDate: Date
): JiJangGanPreciseStrength[] {
  const analysis = calculateJiJangGanStrengthPrecise(monthBranch, birthDate);
  return analysis.strengths;
}

/**
 * 지장간 세력을 백분율로 정규화
 *
 * 여러 지장간의 세력을 합산하여 100%로 정규화
 */
export function normalizeJiJangGanStrengths(
  strengths: JiJangGanPreciseStrength[]
): JiJangGanPreciseStrength[] {
  const total = strengths.reduce((sum, s) => sum + s.strength, 0);

  if (total === 0) {
    return strengths;
  }

  return strengths.map(s => ({
    ...s,
    strength: (s.strength / total) * 100,
  }));
}

/**
 * 지장간 세력 상세 설명 생성
 */
export function describeJiJangGanStrength(analysis: JiJangGanAnalysis): string {
  const descriptions: string[] = [];

  descriptions.push(`${analysis.branch}지의 지장간 분석:`);
  descriptions.push(
    `절기: ${analysis.solarTerm} (시작일로부터 ${analysis.daysSinceTermStart}일 경과)`
  );
  descriptions.push('');
  descriptions.push('지장간 세력 분포:');

  for (const strength of analysis.strengths) {
    const activeMarker = strength.isActive ? '★' : ' ';
    descriptions.push(
      `${activeMarker} ${strength.stem} (${strength.role}): ${strength.strength}%`
    );
  }

  descriptions.push('');
  descriptions.push(
    `지배천간: ${analysis.dominantStem} (${analysis.dominantStrength}%)`
  );

  return descriptions.join('\n');
}

/**
 * 복수 지지의 지장간 통합 분석
 *
 * 사주 전체의 지장간을 통합 분석하여 천간별 총 세력 계산
 */
export function analyzeAllJiJangGan(
  branches: EarthlyBranch[],
  birthDate: Date
): Map<HeavenlyStem, number> {
  const stemStrengthMap = new Map<HeavenlyStem, number>();

  for (const branch of branches) {
    const analysis = calculateJiJangGanStrengthPrecise(branch, birthDate);

    for (const strength of analysis.strengths) {
      const currentStrength = stemStrengthMap.get(strength.stem) || 0;
      stemStrengthMap.set(strength.stem, currentStrength + strength.strength);
    }
  }

  return stemStrengthMap;
}
