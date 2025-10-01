/**
 * 궁합 분석 로직
 */

import type { SajuData, CompatibilityAnalysis } from '../types/index.js';
import { analyzeWuXingRelation } from '../data/wuxing.js';

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

  // 종합 점수 계산
  const compatibilityScore = calculateOverallScore(dayCompatibility, elementHarmony, branchRelation);

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
 * 종합 점수 계산
 */
function calculateOverallScore(
  dayCompatibility: { score: number },
  elementHarmony: { harmony: number },
  branchRelation: { isHarmony: boolean; isConflict: boolean }
): number {
  let score = 0;

  // 일주 궁합 (40%)
  score += dayCompatibility.score * 0.4;

  // 오행 조화 (35%)
  score += elementHarmony.harmony * 0.35;

  // 지지 관계 (25%)
  let branchScore = 50;
  if (branchRelation.isHarmony) branchScore = 80;
  if (branchRelation.isConflict) branchScore = 30;
  score += branchScore * 0.25;

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

