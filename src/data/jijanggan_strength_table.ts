/**
 * 지장간(支藏干) 세력 분배 정밀 테이블
 * 전통 명리학 이론 기반: 여기(余氣), 중기(中氣), 정기(正氣)
 */

import type { EarthlyBranch, HeavenlyStem } from '../types/index.js';

export interface JiJangGanStrengthPhase {
  stem: HeavenlyStem;
  days: number; // 해당 천간이 세력을 가지는 일수
  strength: number; // 세력 비율 (%)
}

/**
 * 지지별 지장간 세력 분배 상세 테이블
 * 각 지지마다 절기로부터 며칠째에 어떤 천간이 얼마의 세력을 가지는지 정의
 */
export const JIJANGGAN_STRENGTH_DETAILED: Record<EarthlyBranch, JiJangGanStrengthPhase[]> = {
  // 인월 (寅月): 입춘 ~ 경칩 (30일)
  인: [
    { stem: '무', days: 7, strength: 23 }, // 여기 7일
    { stem: '병', days: 7, strength: 23 }, // 중기 7일
    { stem: '갑', days: 16, strength: 54 }, // 정기 16일
  ],

  // 묘월 (卯月): 경칩 ~ 청명 (30일)
  묘: [
    { stem: '갑', days: 10, strength: 33 }, // 여기 10일
    { stem: '을', days: 20, strength: 67 }, // 정기 20일
  ],

  // 진월 (辰月): 청명 ~ 입하 (30일)
  진: [
    { stem: '을', days: 9, strength: 30 }, // 여기 9일
    { stem: '계', days: 3, strength: 10 }, // 중기 3일
    { stem: '무', days: 18, strength: 60 }, // 정기 18일
  ],

  // 사월 (巳月): 입하 ~ 망종 (31일)
  사: [
    { stem: '무', days: 7, strength: 23 }, // 여기 7일
    { stem: '경', days: 9, strength: 29 }, // 중기 9일
    { stem: '병', days: 15, strength: 48 }, // 정기 15일
  ],

  // 오월 (午月): 망종 ~ 소서 (30일)
  오: [
    { stem: '병', days: 10, strength: 33 }, // 여기 10일
    { stem: '기', days: 10, strength: 33 }, // 중기 10일
    { stem: '정', days: 10, strength: 34 }, // 정기 10일
  ],

  // 미월 (未月): 소서 ~ 입추 (31일)
  미: [
    { stem: '정', days: 9, strength: 29 }, // 여기 9일
    { stem: '을', days: 3, strength: 10 }, // 중기 3일
    { stem: '기', days: 19, strength: 61 }, // 정기 19일
  ],

  // 신월 (申月): 입추 ~ 백로 (31일)
  신: [
    { stem: '기', days: 7, strength: 23 }, // 여기 7일
    { stem: '임', days: 7, strength: 23 }, // 중기 7일
    { stem: '경', days: 17, strength: 54 }, // 정기 17일
  ],

  // 유월 (酉月): 백로 ~ 한로 (30일)
  유: [
    { stem: '경', days: 10, strength: 33 }, // 여기 10일
    { stem: '신', days: 20, strength: 67 }, // 정기 20일
  ],

  // 술월 (戌月): 한로 ~ 입동 (31일)
  술: [
    { stem: '신', days: 9, strength: 29 }, // 여기 9일
    { stem: '정', days: 3, strength: 10 }, // 중기 3일
    { stem: '무', days: 19, strength: 61 }, // 정기 19일
  ],

  // 해월 (亥月): 입동 ~ 대설 (31일)
  해: [
    { stem: '무', days: 7, strength: 23 }, // 여기 7일
    { stem: '갑', days: 9, strength: 29 }, // 중기 9일
    { stem: '임', days: 15, strength: 48 }, // 정기 15일
  ],

  // 자월 (子月): 대설 ~ 소한 (30일)
  자: [
    { stem: '임', days: 10, strength: 33 }, // 여기 10일
    { stem: '계', days: 20, strength: 67 }, // 정기 20일
  ],

  // 축월 (丑月): 소한 ~ 입춘 (31일)
  축: [
    { stem: '계', days: 9, strength: 29 }, // 여기 9일
    { stem: '신', days: 3, strength: 10 }, // 중기 3일
    { stem: '기', days: 19, strength: 61 }, // 정기 19일
  ],
};

/**
 * 지지별 총 일수 (절기 간 평균 일수)
 */
export const BRANCH_TOTAL_DAYS: Record<EarthlyBranch, number> = {
  인: 30,
  묘: 30,
  진: 30,
  사: 31,
  오: 30,
  미: 31,
  신: 31,
  유: 30,
  술: 31,
  해: 31,
  자: 30,
  축: 31,
};

/**
 * 절기 시작일로부터 경과 일수를 기반으로 지장간 세력 계산
 * @param branch 지지
 * @param daysSinceTermStart 절기 시작일로부터 경과 일수
 * @returns 지장간별 세력 정보
 */
export function calculateJiJangGanStrengthByDays(
  branch: EarthlyBranch,
  daysSinceTermStart: number
): {
  primary: { stem: HeavenlyStem; strength: number };
  secondary?: { stem: HeavenlyStem; strength: number };
  residual?: { stem: HeavenlyStem; strength: number };
} {
  const strengthTable = JIJANGGAN_STRENGTH_DETAILED[branch];

  if (!strengthTable) {
    throw new Error(`지지 ${branch}에 대한 지장간 세력 테이블을 찾을 수 없습니다.`);
  }

  // 경과 일수를 해당 지지의 총 일수로 제한
  const totalDays = BRANCH_TOTAL_DAYS[branch]!;
  const adjustedDays = Math.min(daysSinceTermStart, totalDays - 1);

  let cumulativeDays = 0;
  let currentPhaseIndex = 0;

  // 현재 경과 일수가 어느 단계에 속하는지 찾기
  for (let i = 0; i < strengthTable.length; i++) {
    cumulativeDays += strengthTable[i]!.days;
    if (adjustedDays < cumulativeDays) {
      currentPhaseIndex = i;
      break;
    }
  }

  // 현재 단계의 천간이 주력
  const currentPhase = strengthTable[currentPhaseIndex]!;
  const result: {
    primary: { stem: HeavenlyStem; strength: number };
    secondary?: { stem: HeavenlyStem; strength: number };
    residual?: { stem: HeavenlyStem; strength: number };
  } = {
    primary: { stem: currentPhase.stem, strength: currentPhase.strength },
  };

  // 다음 단계 천간 (있으면 secondary)
  if (currentPhaseIndex + 1 < strengthTable.length) {
    const nextPhase = strengthTable[currentPhaseIndex + 1]!;
    result.secondary = { stem: nextPhase.stem, strength: nextPhase.strength };
  }

  // 이전 단계 천간 (있으면 residual)
  if (currentPhaseIndex > 0) {
    const prevPhase = strengthTable[currentPhaseIndex - 1]!;
    result.residual = { stem: prevPhase.stem, strength: prevPhase.strength };
  }

  return result;
}
