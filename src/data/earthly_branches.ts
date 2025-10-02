/**
 * 지지(地支) 데이터
 * 12개의 지지와 관련 정보
 */

import type { EarthlyBranch, HeavenlyStem, WuXing, YinYang } from '../types/index.js';
import { HEAVENLY_STEMS } from './heavenly_stems.js';

export interface EarthlyBranchData {
  korean: EarthlyBranch;
  hanja: string;
  element: WuXing;
  yinYang: YinYang;
  animal: string; // 띠
  month: number; // 해당 월 (1-12)
  direction: string; // 방향
  index: number;
}

export const EARTHLY_BRANCHES: EarthlyBranchData[] = [
  {
    korean: '자',
    hanja: '子',
    element: '수',
    yinYang: '양',
    animal: '쥐',
    month: 11,
    direction: '북',
    index: 0,
  },
  {
    korean: '축',
    hanja: '丑',
    element: '토',
    yinYang: '음',
    animal: '소',
    month: 12,
    direction: '북북동',
    index: 1,
  },
  {
    korean: '인',
    hanja: '寅',
    element: '목',
    yinYang: '양',
    animal: '호랑이',
    month: 1,
    direction: '동북동',
    index: 2,
  },
  {
    korean: '묘',
    hanja: '卯',
    element: '목',
    yinYang: '음',
    animal: '토끼',
    month: 2,
    direction: '동',
    index: 3,
  },
  {
    korean: '진',
    hanja: '辰',
    element: '토',
    yinYang: '양',
    animal: '용',
    month: 3,
    direction: '동남동',
    index: 4,
  },
  {
    korean: '사',
    hanja: '巳',
    element: '화',
    yinYang: '음',
    animal: '뱀',
    month: 4,
    direction: '남남동',
    index: 5,
  },
  {
    korean: '오',
    hanja: '午',
    element: '화',
    yinYang: '양',
    animal: '말',
    month: 5,
    direction: '남',
    index: 6,
  },
  {
    korean: '미',
    hanja: '未',
    element: '토',
    yinYang: '음',
    animal: '양',
    month: 6,
    direction: '남남서',
    index: 7,
  },
  {
    korean: '신',
    hanja: '申',
    element: '금',
    yinYang: '양',
    animal: '원숭이',
    month: 7,
    direction: '서남서',
    index: 8,
  },
  {
    korean: '유',
    hanja: '酉',
    element: '금',
    yinYang: '음',
    animal: '닭',
    month: 8,
    direction: '서',
    index: 9,
  },
  {
    korean: '술',
    hanja: '戌',
    element: '토',
    yinYang: '양',
    animal: '개',
    month: 9,
    direction: '서북서',
    index: 10,
  },
  {
    korean: '해',
    hanja: '亥',
    element: '수',
    yinYang: '음',
    animal: '돼지',
    month: 10,
    direction: '북북서',
    index: 11,
  },
];

/**
 * 지지 인덱스로 지지 데이터 가져오기
 */
export function getEarthlyBranchByIndex(index: number): EarthlyBranchData {
  const normalizedIndex = ((index % 12) + 12) % 12;
  return EARTHLY_BRANCHES[normalizedIndex]!;
}

/**
 * 지지 한글명으로 지지 데이터 가져오기
 */
export function getEarthlyBranchByKorean(
  korean: EarthlyBranch
): EarthlyBranchData | undefined {
  return EARTHLY_BRANCHES.find((branch) => branch.korean === korean);
}

/**
 * 지지 한자로 지지 데이터 가져오기
 */
export function getEarthlyBranchByHanja(hanja: string): EarthlyBranchData | undefined {
  return EARTHLY_BRANCHES.find((branch) => branch.hanja === hanja);
}

/**
 * 연도로 띠(지지) 계산하기
 */
export function getAnimalSignByYear(year: number): EarthlyBranchData {
  // 1900년은 자(쥐)년 기준
  const baseYear = 1900;
  const index = (year - baseYear) % 12;
  return getEarthlyBranchByIndex(index);
}

/**
 * 삼합(三合) - 3개 지지의 강한 조화 관계
 */
export const SAM_HAP: Record<string, { branches: EarthlyBranch[]; element: WuXing; name: string }> = {
  수국: { branches: ['신', '자', '진'], element: '수', name: '신자진 수국' },
  목국: { branches: ['해', '묘', '미'], element: '목', name: '해묘미 목국' },
  화국: { branches: ['인', '오', '술'], element: '화', name: '인오술 화국' },
  금국: { branches: ['사', '유', '축'], element: '금', name: '사유축 금국' },
};

/**
 * 삼합 체크 함수
 */
export function checkSamHap(branches: EarthlyBranch[]): { type: string | null; element: WuXing | null } {
  const branchSet = new Set(branches);

  for (const [type, data] of Object.entries(SAM_HAP)) {
    const hasAll = data.branches.every((b) => branchSet.has(b));
    if (hasAll) {
      return { type, element: data.element };
    }

    // 부분 삼합 (2개만 있어도 약한 영향)
    const count = data.branches.filter((b) => branchSet.has(b)).length;
    if (count >= 2) {
      return { type: `반${type}`, element: data.element };
    }
  }

  return { type: null, element: null };
}

/**
 * 삼형(三刑) - 3개 지지의 형벌 관계
 */
export const SAM_HYEONG: Record<string, EarthlyBranch[]> = {
  무은지형: ['인', '사', '신'], // 恩義之刑
  지세지형: ['축', '술', '미'], // 持勢之刑
  무례지형_1: ['자', '묘'], // 無禮之刑
  자형: ['진', '진'], // 自刑 (같은 지지끼리)
  자형_2: ['오', '오'],
  자형_3: ['유', '유'],
  자형_4: ['해', '해'],
};

/**
 * 삼형 체크 함수
 */
export function checkSamHyeong(branches: EarthlyBranch[]): string[] {
  const branchSet = new Set(branches);
  const hyeongList: string[] = [];

  // 무은지형 체크
  if (branchSet.has('인') && branchSet.has('사') && branchSet.has('신')) {
    hyeongList.push('무은지형(인사신)');
  }

  // 지세지형 체크
  if (branchSet.has('축') && branchSet.has('술') && branchSet.has('미')) {
    hyeongList.push('지세지형(축술미)');
  }

  // 무례지형 체크
  if (branchSet.has('자') && branchSet.has('묘')) {
    hyeongList.push('무례지형(자묘)');
  }

  // 자형 체크 (같은 지지가 2개 이상)
  const branchCounts: Record<string, number> = {};
  branches.forEach((b) => {
    branchCounts[b] = (branchCounts[b] || 0) + 1;
  });

  ['진', '오', '유', '해'].forEach((b) => {
    if (branchCounts[b] && branchCounts[b] >= 2) {
      hyeongList.push(`자형(${b}${b})`);
    }
  });

  return hyeongList;
}

/**
 * 육해(六害) - 6쌍의 해를 끼치는 관계
 */
export const YUK_HAE: [EarthlyBranch, EarthlyBranch][] = [
  ['자', '미'], // 子未害
  ['축', '오'], // 丑午害
  ['인', '사'], // 寅巳害
  ['묘', '진'], // 卯辰害
  ['신', '해'], // 申亥害
  ['유', '술'], // 酉戌害
];

/**
 * 육해 체크 함수
 */
export function checkYukHae(branches: EarthlyBranch[]): [EarthlyBranch, EarthlyBranch][] {
  const branchSet = new Set(branches);
  const haeList: [EarthlyBranch, EarthlyBranch][] = [];

  YUK_HAE.forEach(([b1, b2]) => {
    if (branchSet.has(b1) && branchSet.has(b2)) {
      haeList.push([b1, b2]);
    }
  });

  return haeList;
}

/**
 * 지지 관계 종합 분석
 */
export function analyzeBranchRelations(branches: EarthlyBranch[]): {
  samHap: { type: string | null; element: WuXing | null };
  samHyeong: string[];
  yukHae: [EarthlyBranch, EarthlyBranch][];
  summary: string;
} {
  const samHap = checkSamHap(branches);
  const samHyeong = checkSamHyeong(branches);
  const yukHae = checkYukHae(branches);

  let summary = '';
  if (samHap.type) {
    summary += `${samHap.type}이 형성되어 ${samHap.element} 기운이 강화됩니다. `;
  }
  if (samHyeong.length > 0) {
    summary += `${samHyeong.join(', ')} 형벌 관계가 있어 갈등이 있을 수 있습니다. `;
  }
  if (yukHae.length > 0) {
    const haeStr = yukHae.map(([a, b]) => `${a}${b}`).join(', ');
    summary += `${haeStr} 해 관계가 있어 서로 방해할 수 있습니다.`;
  }

  if (!summary) {
    summary = '특별한 지지 관계가 없습니다.';
  }

  return { samHap, samHyeong, yukHae, summary };
}

/**
 * 지장간(支藏干) - 각 지지 안에 숨어있는 천간들
 */
export const JI_JANG_GAN: Record<
  EarthlyBranch,
  {
    primary: HeavenlyStem; // 정기(正氣)
    secondary?: HeavenlyStem; // 중기(中氣)
    residual?: HeavenlyStem; // 여기(餘氣)
  }
> = {
  자: { primary: '계' }, // 子: 계수만
  축: { primary: '기', secondary: '신', residual: '계' }, // 丑: 기토, 신금, 계수
  인: { primary: '갑', secondary: '병', residual: '무' }, // 寅: 갑목, 병화, 무토
  묘: { primary: '을' }, // 卯: 을목만
  진: { primary: '무', secondary: '을', residual: '계' }, // 辰: 무토, 을목, 계수
  사: { primary: '병', secondary: '무', residual: '경' }, // 巳: 병화, 무토, 경금
  오: { primary: '정', secondary: '기' }, // 午: 정화, 기토
  미: { primary: '기', secondary: '정', residual: '을' }, // 未: 기토, 정화, 을목
  신: { primary: '경', secondary: '임', residual: '무' }, // 申: 경금, 임수, 무토
  유: { primary: '신' }, // 酉: 신금만
  술: { primary: '무', secondary: '신', residual: '정' }, // 戌: 무토, 신금, 정화
  해: { primary: '임', secondary: '갑' }, // 亥: 임수, 갑목
};

/**
 * 지장간 추출 - 지지에서 숨은 천간들을 모두 반환
 */
export function extractJiJangGan(branch: EarthlyBranch): HeavenlyStem[] {
  const jiJang = JI_JANG_GAN[branch];
  const stems: HeavenlyStem[] = [jiJang.primary];
  if (jiJang.secondary) stems.push(jiJang.secondary);
  if (jiJang.residual) stems.push(jiJang.residual);
  return stems;
}

/**
 * 지장간 세력 계산 (절기 기준)
 * 절기에 따라 정기/중기/여기의 강도가 달라짐
 */
export function calculateJiJangGanStrength(
  branch: EarthlyBranch,
  monthIndex: number // 0-11 (0=입춘~, 1=경칩~, ...)
): {
  primary: { stem: HeavenlyStem; strength: number }; // 0-100
  secondary?: { stem: HeavenlyStem; strength: number };
  residual?: { stem: HeavenlyStem; strength: number };
} {
  const jiJang = JI_JANG_GAN[branch];

  // 지지와 월령의 관계로 세력 결정
  const branchIndex = EARTHLY_BRANCHES.findIndex((b) => b.korean === branch);
  const monthDiff = (monthIndex - branchIndex + 12) % 12;

  let primaryStrength = 70; // 기본 정기 세력
  let secondaryStrength = 20; // 기본 중기 세력
  let residualStrength = 10; // 기본 여기 세력

  // 월령과 완전 일치 (당령): 정기가 가장 강함
  if (monthDiff === 0) {
    primaryStrength = 90;
    secondaryStrength = 7;
    residualStrength = 3;
  }
  // 전월 (퇴기): 여기가 상대적으로 강함
  else if (monthDiff === 11) {
    primaryStrength = 50;
    secondaryStrength = 30;
    residualStrength = 20;
  }
  // 다음월 (진기): 중기가 상대적으로 강함
  else if (monthDiff === 1) {
    primaryStrength = 60;
    secondaryStrength = 30;
    residualStrength = 10;
  }
  // 먼 시기: 정기만 약하게
  else {
    primaryStrength = 40;
    secondaryStrength = 10;
    residualStrength = 5;
  }

  const result: {
    primary: { stem: HeavenlyStem; strength: number };
    secondary?: { stem: HeavenlyStem; strength: number };
    residual?: { stem: HeavenlyStem; strength: number };
  } = {
    primary: { stem: jiJang.primary, strength: primaryStrength },
  };

  if (jiJang.secondary) {
    result.secondary = { stem: jiJang.secondary, strength: secondaryStrength };
  }

  if (jiJang.residual) {
    result.residual = { stem: jiJang.residual, strength: residualStrength };
  }

  return result;
}

/**
 * 월령 득실 판단
 * 일간이 월지의 지장간으로부터 생을 받거나 같으면 득령(得令)
 * 극을 받으면 실령(失令)
 */
export function checkWolRyeong(
  dayStem: HeavenlyStem,
  monthBranch: EarthlyBranch
): {
  isDeukRyeong: boolean; // 득령 여부
  reason: string;
  strength: 'strong' | 'medium' | 'weak';
} {
  const jiJangStems = extractJiJangGan(monthBranch);
  const dayStemData = HEAVENLY_STEMS.find((s) => s.korean === dayStem);
  if (!dayStemData) {
    return { isDeukRyeong: false, reason: '일간 정보 없음', strength: 'medium' };
  }

  const dayStemElement = dayStemData.element;

  // 정기(primary) 천간의 오행 확인
  const primaryStemData = HEAVENLY_STEMS.find((s) => s.korean === jiJangStems[0]);
  if (!primaryStemData) {
    return { isDeukRyeong: false, reason: '지장간 정보 없음', strength: 'medium' };
  }

  const primaryElement = primaryStemData.element;

  // 일간과 월지 지장간 정기의 관계
  if (dayStemElement === primaryElement) {
    return {
      isDeukRyeong: true,
      reason: `월지 지장간과 일간이 같은 ${dayStemElement} 오행이므로 득령입니다`,
      strength: 'strong',
    };
  }

  // 상생 관계 체크 (월지가 일간을 생)
  const generationMap: Record<WuXing, WuXing> = {
    목: '화',
    화: '토',
    토: '금',
    금: '수',
    수: '목',
  };

  if (generationMap[primaryElement] === dayStemElement) {
    return {
      isDeukRyeong: true,
      reason: `월지 ${primaryElement}이(가) 일간 ${dayStemElement}을(를) 생하므로 득령입니다`,
      strength: 'medium',
    };
  }

  // 상극 관계 체크 (월지가 일간을 극)
  const destructionMap: Record<WuXing, WuXing> = {
    목: '토',
    화: '금',
    토: '수',
    금: '목',
    수: '화',
  };

  if (destructionMap[primaryElement] === dayStemElement) {
    return {
      isDeukRyeong: false,
      reason: `월지 ${primaryElement}이(가) 일간 ${dayStemElement}을(를) 극하므로 실령입니다`,
      strength: 'weak',
    };
  }

  return {
    isDeukRyeong: false,
    reason: '월지와 일간의 관계가 중립적입니다',
    strength: 'medium',
  };
}

