/**
 * 궁합 분석 로직
 */

import type { SajuData, CompatibilityAnalysis } from '../types/index.js';
import { analyzeWuXingRelation } from '../data/wuxing.js';
import type { TenGod } from '../types/index.js';

/**
 * 두 사람의 사주 궁합 분석
 */
export function checkCompatibility(person1: SajuData, person2: SajuData): CompatibilityAnalysis {
  // 1. 일주 궁합 (가장 중요)
  const dayCompatibility = analyzeDayPillarCompatibility(person1, person2);

  // 2. 오행 조화
  const elementHarmony = analyzeElementHarmony(person1, person2);

  // 3. 지지 충극 관계
  const branchRelation = analyzeBranchRelation(person1, person2);

  // 4. 십성 궁합
  const tenGodsCompatibility = analyzeTenGodsCompatibility(person1, person2);

  // 종합 점수 계산
  const compatibilityScore = calculateOverallScore(
    dayCompatibility,
    elementHarmony,
    branchRelation,
    tenGodsCompatibility
  );

  // 장단점 분석
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const advice: string[] = [];

  if (dayCompatibility.score >= 70) {
    strengths.push('일주 궁합이 좋아 기본적으로 잘 맞는 사이입니다');
  } else if (dayCompatibility.score < 50) {
    weaknesses.push('일주가 충돌하여 의견 차이가 있을 수 있습니다');
    advice.push('서로의 차이를 인정하고 존중하는 자세가 필요합니다');
  }

  if (elementHarmony.harmony >= 70) {
    strengths.push('오행이 조화로워 서로를 보완합니다');
  } else if (elementHarmony.harmony < 50) {
    weaknesses.push('오행이 충돌하여 갈등이 생길 수 있습니다');
    advice.push('상대방의 장점을 인정하고 이해하려 노력하세요');
  }

  if (branchRelation.isHarmony) {
    strengths.push('지지가 조화로워 편안한 관계를 유지합니다');
  } else if (branchRelation.isConflict) {
    weaknesses.push('지지가 충돌하여 예기치 않은 문제가 발생할 수 있습니다');
    advice.push('감정적인 대립을 피하고 이성적으로 대화하세요');
  }

  // 십성 궁합
  if (tenGodsCompatibility.score >= 70) {
    strengths.push(tenGodsCompatibility.description);
  } else if (tenGodsCompatibility.score < 50) {
    weaknesses.push(tenGodsCompatibility.description);
    advice.push(tenGodsCompatibility.advice);
  }

  // 성격 궁합
  const personalityMatch = analyzePersonalityMatch(person1, person2);
  strengths.push(...personalityMatch.strengths);
  weaknesses.push(...personalityMatch.weaknesses);
  advice.push(...personalityMatch.advice);

  return {
    compatibilityScore,
    summary: getSummary(compatibilityScore),
    strengths,
    weaknesses,
    advice,
    elementHarmony,
  };
}

/**
 * 일주 궁합 분석
 */
function analyzeDayPillarCompatibility(
  person1: SajuData,
  person2: SajuData
): { score: number; description: string } {
  const stem1 = person1.day.stemElement;
  const stem2 = person2.day.stemElement;
  const branch1 = person1.day.branchElement;
  const branch2 = person2.day.branchElement;

  let score = 60; // 기본 점수

  // 천간 관계
  const stemRelation = analyzeWuXingRelation(stem1, stem2);
  if (stemRelation === 'generation') {
    score += 20; // 상생
  } else if (stemRelation === 'destruction') {
    score -= 15; // 상극
  } else if (stemRelation === 'same') {
    score += 10; // 동일
  }

  // 지지 관계
  const branchRelation = analyzeWuXingRelation(branch1, branch2);
  if (branchRelation === 'generation') {
    score += 15;
  } else if (branchRelation === 'destruction') {
    score -= 10;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    description: score >= 70 ? '매우 좋은 궁합' : score >= 50 ? '보통 궁합' : '노력이 필요한 궁합',
  };
}

/**
 * 오행 조화 분석
 */
function analyzeElementHarmony(
  person1: SajuData,
  person2: SajuData
): { harmony: number; description: string } {
  let harmonyScore = 50;

  // 각자의 강한 오행과 약한 오행 비교
  const person1Strong = person1.dominantElements || [];
  const person1Weak = person1.weakElements || [];
  const person2Strong = person2.dominantElements || [];
  const person2Weak = person2.weakElements || [];

  // 서로의 부족한 부분을 채워주는지 확인
  let complementCount = 0;
  let conflictCount = 0;

  person1Weak.forEach((element) => {
    if (person2Strong.includes(element)) {
      complementCount++;
    }
  });

  person2Weak.forEach((element) => {
    if (person1Strong.includes(element)) {
      complementCount++;
    }
  });

  // 같은 오행이 강한 경우 충돌 가능
  person1Strong.forEach((element) => {
    if (person2Strong.includes(element)) {
      conflictCount++;
    }
  });

  harmonyScore += complementCount * 15;
  harmonyScore -= conflictCount * 10;

  return {
    harmony: Math.max(0, Math.min(100, harmonyScore)),
    description:
      complementCount > 0
        ? '서로의 부족한 점을 보완하는 좋은 관계입니다'
        : '각자의 특성을 존중하는 것이 중요합니다',
  };
}

/**
 * 지지 충극 관계 분석
 */
function analyzeBranchRelation(
  person1: SajuData,
  person2: SajuData
): { isHarmony: boolean; isConflict: boolean; description: string } {
  // 간단한 지지 충극 판단
  const branches1 = [person1.year.branch, person1.month.branch, person1.day.branch, person1.hour.branch];
  const branches2 = [person2.year.branch, person2.month.branch, person2.day.branch, person2.hour.branch];

  // 육합(六合) 관계 확인 (간단 버전)
  const harmonyPairs = [
    ['자', '축'],
    ['인', '해'],
    ['묘', '술'],
    ['진', '유'],
    ['사', '신'],
    ['오', '미'],
  ];

  // 충(沖) 관계 확인
  const conflictPairs = [
    ['자', '오'],
    ['축', '미'],
    ['인', '신'],
    ['묘', '유'],
    ['진', '술'],
    ['사', '해'],
  ];

  let harmonyCount = 0;
  let conflictCount = 0;

  branches1.forEach((b1) => {
    branches2.forEach((b2) => {
      harmonyPairs.forEach((pair) => {
        if ((pair[0] === b1 && pair[1] === b2) || (pair[0] === b2 && pair[1] === b1)) {
          harmonyCount++;
        }
      });

      conflictPairs.forEach((pair) => {
        if ((pair[0] === b1 && pair[1] === b2) || (pair[0] === b2 && pair[1] === b1)) {
          conflictCount++;
        }
      });
    });
  });

  return {
    isHarmony: harmonyCount > 0,
    isConflict: conflictCount > 0,
    description:
      harmonyCount > conflictCount
        ? '지지가 잘 어울립니다'
        : conflictCount > 0
          ? '지지에 충돌이 있어 주의가 필요합니다'
          : '무난한 관계입니다',
  };
}

/**
 * 성격 궁합 분석
 */
function analyzePersonalityMatch(
  person1: SajuData,
  person2: SajuData
): { strengths: string[]; weaknesses: string[]; advice: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const advice: string[] = [];

  const element1 = person1.day.stemElement;
  const element2 = person2.day.stemElement;

  // 목-화 조합
  if (
    (element1 === '목' && element2 === '화') ||
    (element1 === '화' && element2 === '목')
  ) {
    strengths.push('창의성과 열정이 조화를 이루는 역동적인 관계');
    advice.push('서로의 에너지를 긍정적인 방향으로 활용하세요');
  }

  // 토-금 조합
  if (
    (element1 === '토' && element2 === '금') ||
    (element1 === '금' && element2 === '토')
  ) {
    strengths.push('안정성과 원칙이 조화를 이루는 신뢰있는 관계');
    advice.push('때로는 융통성도 발휘하세요');
  }

  // 금-수 조합
  if (
    (element1 === '금' && element2 === '수') ||
    (element1 === '수' && element2 === '금')
  ) {
    strengths.push('결단력과 지혜가 어우러지는 이상적인 조합');
    advice.push('감정 교류를 더 자주 하세요');
  }

  // 같은 오행
  if (element1 === element2) {
    strengths.push('서로를 잘 이해하는 편안한 관계');
    weaknesses.push('너무 비슷해서 새로운 자극이 부족할 수 있음');
    advice.push('새로운 경험을 함께 시도해보세요');
  }

  return { strengths, weaknesses, advice };
}

/**
 * 십성 궁합 분석
 */
function analyzeTenGodsCompatibility(
  person1: SajuData,
  person2: SajuData
): { score: number; description: string; advice: string } {
  let score = 60; // 기본 점수
  let description = '';
  let advice = '';

  if (!person1.tenGodsDistribution || !person2.tenGodsDistribution) {
    return { score: 60, description: '십성 정보가 부족합니다', advice: '' };
  }

  const dist1 = person1.tenGodsDistribution;
  const dist2 = person2.tenGodsDistribution;

  // 상호 보완성 분석
  const complementaryPairs: Array<[TenGod, TenGod]> = [
    ['정관', '정인'], // 관인상생: 직업운과 학습능력의 조화
    ['정재', '식신'], // 식신생재: 창의성이 재물로 연결
    ['정인', '비견'], // 인수생신: 학습이 자아를 강화
    ['편재', '식신'], // 식신생재: 창의성으로 돈을 버는 조합
    ['정관', '정재'], // 재관: 재물과 지위의 조화
  ];

  let complementCount = 0;
  complementaryPairs.forEach(([god1, god2]) => {
    if ((dist1[god1] >= 2 && dist2[god2] >= 2) || (dist1[god2] >= 2 && dist2[god1] >= 2)) {
      complementCount++;
      score += 10;
    }
  });

  if (complementCount >= 2) {
    description = '십성이 서로를 보완하여 시너지가 큽니다';
    advice = '각자의 강점을 살려 협력하면 큰 성과를 이룰 수 있습니다';
  } else if (complementCount === 1) {
    description = '십성의 일부 영역에서 보완 관계가 있습니다';
    advice = '서로의 장점을 인정하고 활용하세요';
  }

  // 경쟁 관계 분석
  const competitivePairs: Array<[TenGod, TenGod]> = [
    ['비견', '비견'], // 같은 자아, 경쟁
    ['겁재', '겁재'], // 같은 경쟁심
    ['편재', '편재'], // 재물 경쟁
  ];

  let conflictCount = 0;
  competitivePairs.forEach(([god1, god2]) => {
    if (dist1[god1] >= 3 && dist2[god2] >= 3) {
      conflictCount++;
      score -= 10;
    }
  });

  if (conflictCount >= 2) {
    description = '십성이 충돌하여 경쟁이 심할 수 있습니다';
    advice = '서로 양보하고 협력하는 자세가 필요합니다';
  }

  // 균형 있는 십성 조합
  const total1 = Object.values(dist1).reduce((sum, count) => sum + count, 0);
  const total2 = Object.values(dist2).reduce((sum, count) => sum + count, 0);
  const variance1 = Object.values(dist1).reduce((sum, count) => sum + Math.pow(count - total1 / 10, 2), 0);
  const variance2 = Object.values(dist2).reduce((sum, count) => sum + Math.pow(count - total2 / 10, 2), 0);

  if (variance1 < 3 && variance2 < 3) {
    score += 10;
    description = description || '두 사람 모두 균형잡힌 십성 분포를 가지고 있습니다';
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    description: description || '십성 궁합이 무난합니다',
    advice: advice || '서로의 특성을 이해하고 존중하세요',
  };
}

/**
 * 종합 점수 계산
 */
function calculateOverallScore(
  dayCompatibility: { score: number },
  elementHarmony: { harmony: number },
  branchRelation: { isHarmony: boolean; isConflict: boolean },
  tenGodsCompatibility: { score: number }
): number {
  let score = 0;

  // 일주 궁합 (35%)
  score += dayCompatibility.score * 0.35;

  // 오행 조화 (30%)
  score += elementHarmony.harmony * 0.3;

  // 지지 관계 (20%)
  let branchScore = 50;
  if (branchRelation.isHarmony) branchScore = 80;
  if (branchRelation.isConflict) branchScore = 30;
  score += branchScore * 0.2;

  // 십성 궁합 (15%)
  score += tenGodsCompatibility.score * 0.15;

  return Math.round(score);
}

/**
 * 궁합 요약 메시지
 */
function getSummary(score: number): string {
  if (score >= 85) {
    return '천생연분입니다! 서로에게 최고의 파트너가 될 수 있습니다.';
  } else if (score >= 70) {
    return '매우 좋은 궁합입니다. 서로를 존중하며 행복한 관계를 만들어갈 수 있습니다.';
  } else if (score >= 55) {
    return '무난한 궁합입니다. 서로 노력하면 좋은 관계를 유지할 수 있습니다.';
  } else if (score >= 40) {
    return '다소 어려움이 있을 수 있습니다. 서로를 이해하려는 노력이 필요합니다.';
  } else {
    return '많은 노력이 필요한 관계입니다. 서로의 차이를 인정하고 존중하는 것이 중요합니다.';
  }
}

