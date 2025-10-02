/**
 * 오행(五行) 데이터
 * 목, 화, 토, 금, 수의 상생상극 관계
 */

import type { WuXing } from '../types/index.js';

export interface WuXingData {
  name: WuXing;
  hanja: string;
  color: string[];
  direction: string;
  season: string;
  personality: string[];
}

export const WUXING_DATA: Record<WuXing, WuXingData> = {
  목: {
    name: '목',
    hanja: '木',
    color: ['청색', '녹색'],
    direction: '동',
    season: '봄',
    personality: ['인자함', '성장', '확장', '창의적', '유연함'],
  },
  화: {
    name: '화',
    hanja: '火',
    color: ['적색', '주황색', '분홍색'],
    direction: '남',
    season: '여름',
    personality: ['열정적', '활동적', '밝음', '예의바름', '적극적'],
  },
  토: {
    name: '토',
    hanja: '土',
    color: ['황색', '갈색'],
    direction: '중앙',
    season: '환절기',
    personality: ['신중함', '안정적', '포용력', '신뢰', '중재'],
  },
  금: {
    name: '금',
    hanja: '金',
    color: ['백색', '금색', '은색'],
    direction: '서',
    season: '가을',
    personality: ['의리', '결단력', '강직함', '정의로움', '원칙적'],
  },
  수: {
    name: '수',
    hanja: '水',
    color: ['흑색', '청색', '남색'],
    direction: '북',
    season: '겨울',
    personality: ['지혜로움', '깊이', '부드러움', '유연함', '침착함'],
  },
};

/**
 * 오행 상생 관계 (生)
 * 木生火 (목생화): 나무가 불을 낳는다
 * 火生土 (화생토): 불이 흙을 낳는다
 * 土生金 (토생금): 흙이 금을 낳는다
 * 金生水 (금생수): 금이 물을 낳는다
 * 水生木 (수생목): 물이 나무를 낳는다
 */
export const WUXING_GENERATION: Record<WuXing, WuXing> = {
  목: '화',
  화: '토',
  토: '금',
  금: '수',
  수: '목',
};

/**
 * 오행 상극 관계 (克)
 * 木克土 (목극토): 나무가 흙을 이긴다
 * 土克水 (토극수): 흙이 물을 이긴다
 * 水克火 (수극화): 물이 불을 이긴다
 * 火克金 (화극금): 불이 금을 이긴다
 * 金克木 (금극목): 금이 나무를 이긴다
 */
export const WUXING_DESTRUCTION: Record<WuXing, WuXing> = {
  목: '토',
  화: '금',
  토: '수',
  금: '목',
  수: '화',
};

/**
 * 두 오행이 상생 관계인지 확인
 */
export function isGenerating(from: WuXing, to: WuXing): boolean {
  return WUXING_GENERATION[from] === to;
}

/**
 * 두 오행이 상극 관계인지 확인
 */
export function isDestroying(from: WuXing, to: WuXing): boolean {
  return WUXING_DESTRUCTION[from] === to;
}

/**
 * 두 오행의 관계 분석
 */
export function analyzeWuXingRelation(
  from: WuXing,
  to: WuXing
): 'same' | 'generation' | 'destruction' | 'neutral' {
  if (from === to) return 'same';
  if (isGenerating(from, to)) return 'generation';
  if (isDestroying(from, to)) return 'destruction';
  return 'neutral';
}

/**
 * 오행의 강약 계산
 * 여러 오행의 개수를 받아서 강한 오행과 약한 오행을 판단
 */
export function analyzeWuXingBalance(counts: Record<WuXing, number>): {
  strong: WuXing[];
  weak: WuXing[];
  balanced: boolean;
} {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const average = total / 5;

  const strong: WuXing[] = [];
  const weak: WuXing[] = [];

  for (const [element, count] of Object.entries(counts) as [WuXing, number][]) {
    if (count > average * 1.5) {
      strong.push(element);
    } else if (count < average * 0.5) {
      weak.push(element);
    }
  }

  return {
    strong,
    weak,
    balanced: strong.length === 0 && weak.length === 0,
  };
}

/**
 * 두 오행 간의 상호작용 분석 (문자열 설명)
 */
export function analyzeElementInteraction(from: WuXing, to: WuXing): string {
  if (from === to) {
    return `비화(比和) 관계로 같은 오행이 서로 돕습니다.`;
  }

  if (isGenerating(from, to)) {
    return `${from}이(가) ${to}을(를) 생(生)하는 관계로 긍정적인 영향을 줍니다.`;
  }

  if (isGenerating(to, from)) {
    return `${to}이(가) ${from}을(를) 생(生)하는 관계로 도움을 받습니다.`;
  }

  if (isDestroying(from, to)) {
    return `${from}이(가) ${to}을(를) 극(克)하는 관계로 부정적인 영향을 줍니다.`;
  }

  if (isDestroying(to, from)) {
    return `${to}이(가) ${from}을(를) 극(克)하는 관계로 어려움이 있을 수 있습니다.`;
  }

  return `중립적인 관계입니다.`;
}

/**
 * 특정 오행을 생(生)하는 오행 반환
 */
export function getGeneratingElement(element: WuXing): WuXing {
  const reverseGeneration: Record<WuXing, WuXing> = {
    목: '수',
    화: '목',
    토: '화',
    금: '토',
    수: '금',
  };
  return reverseGeneration[element]!;
}

/**
 * 특정 오행이 생(生)하는 오행 반환
 */
export function getGeneratedElement(element: WuXing): WuXing {
  return WUXING_GENERATION[element]!;
}

/**
 * 특정 오행을 극(克)하는 오행 반환
 */
export function getControllingElement(element: WuXing): WuXing {
  const reverseDestruction: Record<WuXing, WuXing> = {
    목: '금',
    화: '수',
    토: '목',
    금: '화',
    수: '토',
  };
  return reverseDestruction[element]!;
}

/**
 * 특정 오행이 극(克)하는 오행 반환
 */
export function getControlledElement(element: WuXing): WuXing {
  return WUXING_DESTRUCTION[element]!;
}

/**
 * 특정 오행을 설(洩)하는 오행 반환 (생하는 대상)
 */
export function getWeakeningElement(element: WuXing): WuXing {
  return WUXING_GENERATION[element]!;
}

