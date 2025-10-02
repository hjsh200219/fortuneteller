/**
 * 윤달 출생자 특수 분석 시스템
 * 윤달은 음력 달 사이에 끼어드는 특수한 달로, 명리학에서 독특한 의미를 가짐
 */

import type { SajuData, WuXing, HeavenlyStem, EarthlyBranch } from '../types/index.js';

export interface LeapMonthAnalysis {
  isLeapMonth: boolean;
  specialCharacteristics: string[];
  elementAdjustments: {
    element: WuXing;
    originalStrength: number;
    adjustedStrength: number;
    reason: string;
  }[];
  lifePathInterpretation: string;
  recommendations: string[];
  warnings: string[];
}

/**
 * 윤달 출생자 종합 분석
 */
export function analyzeLeapMonthBirth(sajuData: SajuData): LeapMonthAnalysis | null {
  if (!sajuData.isLeapMonth) {
    return null;
  }

  const specialCharacteristics = getLeapMonthCharacteristics(sajuData);
  const elementAdjustments = calculateLeapMonthElementAdjustments(sajuData);
  const lifePathInterpretation = getLeapMonthLifePath(sajuData);
  const recommendations = getLeapMonthRecommendations(sajuData);
  const warnings = getLeapMonthWarnings(sajuData);

  return {
    isLeapMonth: true,
    specialCharacteristics,
    elementAdjustments,
    lifePathInterpretation,
    recommendations,
    warnings,
  };
}

/**
 * 윤달 출생자 특성
 */
function getLeapMonthCharacteristics(sajuData: SajuData): string[] {
  const characteristics: string[] = [];

  // 기본 윤달 특성
  characteristics.push('윤달 출생자는 음(陰)과 양(陽) 사이의 경계에 태어난 특별한 사람입니다');
  characteristics.push('일반인보다 더 섬세하고 감수성이 풍부한 경향이 있습니다');

  // 월주 기준 특성
  const monthElement = sajuData.month.branchElement;

  // 월령 지지에 따른 특성
  if (monthElement === '목') {
    characteristics.push('윤달 목(木) 기운: 성장과 변화에 대한 적응력이 뛰어납니다');
  } else if (monthElement === '화') {
    characteristics.push('윤달 화(火) 기운: 창의성과 열정이 내면에 깊이 자리잡고 있습니다');
  } else if (monthElement === '토') {
    characteristics.push('윤달 토(土) 기운: 중재와 조화를 이루는 능력이 탁월합니다');
  } else if (monthElement === '금') {
    characteristics.push('윤달 금(金) 기운: 결단력과 판단력이 신중하고 깊이 있습니다');
  } else if (monthElement === '수') {
    characteristics.push('윤달 수(水) 기운: 지혜와 통찰력이 남다릅니다');
  }

  // 음양 균형 특성
  if (sajuData.year.yinYang === sajuData.day.yinYang) {
    characteristics.push('음양이 조화를 이루어 내면의 평화를 추구하는 성향이 강합니다');
  } else {
    characteristics.push('음양의 대비가 뚜렷하여 역동적인 삶을 살아가는 경향이 있습니다');
  }

  return characteristics;
}

/**
 * 윤달 오행 세력 보정 계산
 * 윤달은 일반 달보다 오행의 기운이 약하거나 특수한 영향을 받음
 */
function calculateLeapMonthElementAdjustments(sajuData: SajuData): LeapMonthAnalysis['elementAdjustments'] {
  const adjustments: LeapMonthAnalysis['elementAdjustments'] = [];
  const wuxingCount = sajuData.wuxingCount;

  // 월령의 오행은 윤달로 인해 10-15% 감소
  const monthElement = sajuData.month.branchElement;
  const originalStrength = wuxingCount[monthElement];
  const reductionRate = 0.125; // 평균 12.5% 감소
  const adjustedStrength = Math.max(0, originalStrength * (1 - reductionRate));

  adjustments.push({
    element: monthElement,
    originalStrength,
    adjustedStrength: Math.round(adjustedStrength * 10) / 10,
    reason: `윤달은 정상 월령보다 기운이 약하여 ${monthElement} 오행의 세력이 감소합니다`,
  });

  // 월령 오행을 극하는 오행은 상대적으로 강화됨
  const keMonthElement = getKeElement(monthElement);
  const keOriginalStrength = wuxingCount[keMonthElement];
  const keEnhancementRate = 0.1; // 10% 증가
  const keAdjustedStrength = keOriginalStrength * (1 + keEnhancementRate);

  if (keOriginalStrength > 0) {
    adjustments.push({
      element: keMonthElement,
      originalStrength: keOriginalStrength,
      adjustedStrength: Math.round(keAdjustedStrength * 10) / 10,
      reason: `월령 ${monthElement}이(가) 약해지면서 ${keMonthElement} 오행이 상대적으로 강화됩니다`,
    });
  }

  return adjustments;
}

/**
 * 윤달 출생자 인생 해석
 */
function getLeapMonthLifePath(sajuData: SajuData): string {
  const monthElement = sajuData.month.branchElement;
  const dayElement = sajuData.day.stemElement;
  const dayMasterStrength = sajuData.dayMasterStrength?.level || 'medium';

  let interpretation = '';

  // 일간 강약에 따른 해석
  if (dayMasterStrength === 'very_strong' || dayMasterStrength === 'strong') {
    interpretation += '일간이 강한 윤달 출생자는 독립적이고 자신만의 길을 개척하는 능력이 뛰어납니다. ';
    interpretation += '다만 주변과의 조화를 의식적으로 추구할 필요가 있습니다. ';
  } else if (dayMasterStrength === 'weak' || dayMasterStrength === 'very_weak') {
    interpretation += '일간이 약한 윤달 출생자는 주변의 도움과 협력이 중요합니다. ';
    interpretation += '타인과의 관계에서 진정한 힘을 얻을 수 있습니다. ';
  } else {
    interpretation += '일간이 중화된 윤달 출생자는 균형잡힌 삶을 살아갈 가능성이 높습니다. ';
  }

  // 월령과 일간의 관계에 따른 해석
  if (monthElement === dayElement) {
    interpretation += '월령과 일간이 같은 오행으로, 자신의 본질에 충실한 삶을 살아갑니다. ';
  } else if (getShengElement(monthElement) === dayElement) {
    interpretation += '월령이 일간을 생(生)하여, 주변의 지원을 받으며 성장하는 인생입니다. ';
  } else if (getKeElement(monthElement) === dayElement) {
    interpretation += '월령이 일간을 극(克)하여, 도전과 극복을 통해 성장하는 인생입니다. ';
  }

  interpretation += '윤달의 특별한 기운은 당신에게 남다른 통찰력과 직관을 부여합니다.';

  return interpretation;
}

/**
 * 윤달 출생자 권장사항
 */
function getLeapMonthRecommendations(sajuData: SajuData): string[] {
  const recommendations: string[] = [];

  recommendations.push('윤달의 특수한 에너지를 활용하여 직관력과 창의성을 발휘하세요');
  recommendations.push('음력 달의 변화(초하루, 보름 등)에 주목하여 중요한 일정을 계획하세요');

  const monthElement = sajuData.month.branchElement;
  const 生monthElement = getShengElement(monthElement);

  recommendations.push(`월령 ${monthElement}을(를) 보강하기 위해 ${生monthElement} 오행을 활용하세요`);
  recommendations.push('명리학 전문가의 정기적인 상담을 통해 윤달의 특성을 잘 이해하고 활용하세요');
  recommendations.push('전통 문화와 역사에 관심을 가지면 자신의 정체성을 더 잘 이해할 수 있습니다');

  return recommendations;
}

/**
 * 윤달 출생자 주의사항
 */
function getLeapMonthWarnings(sajuData: SajuData): string[] {
  const warnings: string[] = [];

  warnings.push('윤달 출생자는 감정의 기복이 클 수 있으므로 감정 관리에 유의하세요');
  warnings.push('주변과의 소통에서 오해가 생기기 쉬우므로 명확한 의사표현을 연습하세요');

  const monthElement = sajuData.month.branchElement;
  const 克monthElement = getKeElement(monthElement);

  warnings.push(`월령 ${monthElement}을(를) 극(克)하는 ${克monthElement} 오행을 과도하게 사용하지 마세요`);
  warnings.push('중요한 결정을 내릴 때는 충분한 시간을 두고 신중하게 판단하세요');

  return warnings;
}

/**
 * 오행 상생 관계: A가 B를 생(生)함
 */
function getShengElement(element: WuXing): WuXing {
  const shengMap: Record<WuXing, WuXing> = {
    목: '화',
    화: '토',
    토: '금',
    금: '수',
    수: '목',
  };
  return shengMap[element];
}

/**
 * 오행 상극 관계: A가 B를 극(克)함
 */
function getKeElement(element: WuXing): WuXing {
  const keMap: Record<WuXing, WuXing> = {
    목: '토',
    화: '금',
    토: '수',
    금: '목',
    수: '화',
  };
  return keMap[element];
}

/**
 * 윤달 지장간 세력 보정
 * 윤달의 지장간은 일반 달보다 세력이 약함
 */
export function applyLeapMonthJiJangGanAdjustment(
  _branch: EarthlyBranch,
  isLeapMonth: boolean,
  originalStrength: {
    primary: { stem: HeavenlyStem; strength: number };
    secondary?: { stem: HeavenlyStem; strength: number };
    residual?: { stem: HeavenlyStem; strength: number };
  }
): {
  primary: { stem: HeavenlyStem; strength: number };
  secondary?: { stem: HeavenlyStem; strength: number };
  residual?: { stem: HeavenlyStem; strength: number };
} {
  if (!isLeapMonth) {
    return originalStrength;
  }

  // 윤달은 지장간 세력이 10% 감소
  const reductionRate = 0.1;

  const adjusted: {
    primary: { stem: HeavenlyStem; strength: number };
    secondary?: { stem: HeavenlyStem; strength: number };
    residual?: { stem: HeavenlyStem; strength: number };
  } = {
    primary: {
      stem: originalStrength.primary.stem,
      strength: Math.round(originalStrength.primary.strength * (1 - reductionRate)),
    },
  };

  if (originalStrength.secondary) {
    adjusted.secondary = {
      stem: originalStrength.secondary.stem,
      strength: Math.round(originalStrength.secondary.strength * (1 - reductionRate)),
    };
  }

  if (originalStrength.residual) {
    adjusted.residual = {
      stem: originalStrength.residual.stem,
      strength: Math.round(originalStrength.residual.strength * (1 - reductionRate)),
    };
  }

  return adjusted;
}
