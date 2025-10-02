/**
 * 일간(日干) 강약 판단 시스템
 * 사주의 가장 중요한 분석 요소인 일간의 강약을 종합적으로 판단
 */

import type { SajuData } from '../types/index.js';

/**
 * 일간 강약 종합 분석
 *
 * 판단 요소:
 * 1. 월령 득실 (40%) - 가장 중요
 * 2. 비겁(比劫) 개수 (25%) - 같은 오행이 일간을 돕는 정도
 * 3. 인성(印星) 개수 (20%) - 일간을 생하는 오행
 * 4. 재관식상 개수 (15%) - 일간을 설기하는 오행
 */
export function analyzeDayMasterStrength(sajuData: SajuData): {
  level: 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak';
  score: number; // 0-100
  analysis: string;
} {
  let score = 50; // 기본 점수
  const reasons: string[] = [];

  // 1. 월령 득실 (40점 만점)
  if (sajuData.wolRyeong) {
    if (sajuData.wolRyeong.strength === 'strong') {
      score += 40;
      reasons.push('월령을 득하여 매우 강함');
    } else if (sajuData.wolRyeong.strength === 'medium') {
      score += 20;
      reasons.push('월령이 중립적');
    } else {
      score -= 20;
      reasons.push('월령을 실하여 약함');
    }
  }

  // 2. 비겁(比劫) 개수 (25점 만점)
  if (sajuData.tenGodsDistribution) {
    const bijeopCount = sajuData.tenGodsDistribution.비견 + sajuData.tenGodsDistribution.겁재;
    if (bijeopCount >= 4) {
      score += 25;
      reasons.push('비겁이 많아 강함');
    } else if (bijeopCount >= 2) {
      score += 15;
      reasons.push('비겁이 적절함');
    } else if (bijeopCount === 1) {
      score += 5;
      reasons.push('비겁이 약간 부족');
    } else {
      score -= 10;
      reasons.push('비겁이 없어 외로움');
    }

    // 3. 인성(印星) 개수 (20점 만점)
    const inseongCount = sajuData.tenGodsDistribution.정인 + sajuData.tenGodsDistribution.편인;
    if (inseongCount >= 3) {
      score += 20;
      reasons.push('인성이 많아 생을 받음');
    } else if (inseongCount >= 2) {
      score += 15;
      reasons.push('인성이 적절히 있음');
    } else if (inseongCount === 1) {
      score += 5;
      reasons.push('인성이 약간 있음');
    }

    // 4. 재관식상 개수 (설기 요소)
    const seolgiCount =
      sajuData.tenGodsDistribution.정재 +
      sajuData.tenGodsDistribution.편재 +
      sajuData.tenGodsDistribution.정관 +
      sajuData.tenGodsDistribution.편관 +
      sajuData.tenGodsDistribution.식신 +
      sajuData.tenGodsDistribution.상관;

    if (seolgiCount >= 6) {
      score -= 15;
      reasons.push('재관식상이 과다하여 설기됨');
    } else if (seolgiCount >= 4) {
      score -= 5;
      reasons.push('재관식상이 많음');
    }
  }

  // 점수를 0-100 범위로 제한
  score = Math.max(0, Math.min(100, score));

  // 레벨 결정
  let level: 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak';
  if (score >= 80) {
    level = 'very_strong';
  } else if (score >= 65) {
    level = 'strong';
  } else if (score >= 40) {
    level = 'medium';
  } else if (score >= 25) {
    level = 'weak';
  } else {
    level = 'very_weak';
  }

  const analysis = reasons.join('. ') + '.';

  return { level, score, analysis };
}

/**
 * 일간 강약에 따른 용신(用神) 추천
 */
export function recommendYongSin(
  dayMasterStrength: 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak'
): {
  yongSin: string[];
  advice: string;
} {
  switch (dayMasterStrength) {
    case 'very_strong':
    case 'strong':
      return {
        yongSin: ['재성(財星)', '관성(官星)', '식상(食傷)'],
        advice: '일간이 강하므로 설기하는 재관식상을 용신으로 삼아야 합니다. 재물운과 직업운을 키우세요.',
      };

    case 'weak':
    case 'very_weak':
      return {
        yongSin: ['인성(印星)', '비겁(比劫)'],
        advice: '일간이 약하므로 돕는 인성과 비겁을 용신으로 삼아야 합니다. 협력자와 멘토의 도움을 받으세요.',
      };

    case 'medium':
    default:
      return {
        yongSin: ['상황에 따라 변동'],
        advice:
          '일간이 중화되어 있습니다. 유연하게 대처하며 균형을 유지하세요.',
      };
  }
}
