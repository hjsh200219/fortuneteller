/**
 * 지지(地支) 데이터
 * 12개의 지지와 관련 정보
 */

import { JIJANGGAN_STRENGTH_DETAILED } from './jijanggan_strength_table.js';
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
 * 삼합 체크 — 세 글자가 다 있으면 삼합, 두 글자면 왕지(자·오·묘·유)가 낀 경우만 반합
 * (생지+고지, 예: 인·술 은 반합으로 치지 않는다)
 */
export function checkSamHap(branches: EarthlyBranch[]): { type: string | null; element: WuXing | null } {
  const branchSet = new Set(branches);

  for (const [type, data] of Object.entries(SAM_HAP)) {
    if (data.branches.every((b) => branchSet.has(b))) {
      return { type, element: data.element };
    }
  }
  for (const [type, data] of Object.entries(SAM_HAP)) {
    const wangJi = data.branches[1]!; // 가운데 = 왕지
    const count = data.branches.filter((b) => branchSet.has(b)).length;
    if (count >= 2 && branchSet.has(wangJi)) {
      return { type: `반${type}`, element: data.element };
    }
  }

  return { type: null, element: null };
}

/** 육충(六沖) */
export const YUK_CHUNG: [EarthlyBranch, EarthlyBranch][] = [
  ['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해'],
];

/** 육합(六合)과 합화 오행 */
export const YUK_HAP: { pair: [EarthlyBranch, EarthlyBranch]; element: WuXing }[] = [
  { pair: ['자', '축'], element: '토' },
  { pair: ['인', '해'], element: '목' },
  { pair: ['묘', '술'], element: '화' },
  { pair: ['진', '유'], element: '금' },
  { pair: ['사', '신'], element: '수' },
  { pair: ['오', '미'], element: '화' },
];

function presentPairs<T extends { 0: EarthlyBranch; 1: EarthlyBranch }>(branches: EarthlyBranch[], pairs: T[]): T[] {
  const set = new Set(branches);
  return pairs.filter((p) => set.has(p[0]) && set.has(p[1]));
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

  // 삼형은 세 글자가 다 있으면 삼형, 두 글자만 있어도 그 두 글자 사이의 형으로 본다
  const trio = (letters: EarthlyBranch[], name: string) => {
    const present = letters.filter((b) => branchSet.has(b));
    if (present.length === 3) hyeongList.push(`${name}(${letters.join('')})`);
    else if (present.length === 2) hyeongList.push(`${name} 일부(${present.join('')})`);
  };
  trio(['인', '사', '신'], '무은지형');
  trio(['축', '술', '미'], '지세지형');

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
  yukChung: [EarthlyBranch, EarthlyBranch][];
  yukHap: { pair: [EarthlyBranch, EarthlyBranch]; element: WuXing }[];
  summary: string;
} {
  const samHap = checkSamHap(branches);
  const samHyeong = checkSamHyeong(branches);
  const yukHae = checkYukHae(branches);
  const yukChung = presentPairs(branches, YUK_CHUNG);
  const yukHap = YUK_HAP.filter(({ pair }) => branches.includes(pair[0]) && branches.includes(pair[1]));

  let summary = '';
  if (samHap.type) {
    summary += `${samHap.type}이 형성되어 ${samHap.element} 기운이 강화됩니다. `;
  }
  if (yukHap.length > 0) {
    summary += `${yukHap.map(({ pair, element }) => `${pair.join('')}합(${element})`).join(', ')} 육합이 있어 서로 끌어당깁니다. `;
  }
  if (yukChung.length > 0) {
    summary += `${yukChung.map(([a, b]) => `${a}${b}`).join(', ')} 충이 있어 변동·이동이 잦을 수 있습니다. `;
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

  return { samHap, samHyeong, yukHae, yukChung, yukHap, summary: summary.trim() };
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
> = Object.fromEntries(
  // 단일 출처: JIJANGGAN_STRENGTH_DETAILED(여기·중기·정기 순) — 두 표가 따로 놀면 격국·강약이 다른 지장간을 본다
  (Object.entries(JIJANGGAN_STRENGTH_DETAILED) as [EarthlyBranch, { stem: HeavenlyStem }[]][]).map(([branch, phases]) => {
    const primary = phases[phases.length - 1]!.stem;
    if (phases.length === 3) return [branch, { primary, secondary: phases[1]!.stem, residual: phases[0]!.stem }];
    return [branch, { primary, residual: phases[0]!.stem }];
  })
) as Record<EarthlyBranch, { primary: HeavenlyStem; secondary?: HeavenlyStem; residual?: HeavenlyStem }>;

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
  // monthIndex 는 인월=0 기준, 지지 배열은 자=0 기준 — 같은 기준(인=0)으로 맞춘다
  const branchIndex = EARTHLY_BRANCHES.findIndex((b) => b.korean === branch);
  const branchMonthIndex = (branchIndex - 2 + 12) % 12;
  const monthDiff = (monthIndex - branchMonthIndex + 12) % 12;

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

  // 남은 두 경우: 일간이 월지를 생(식상월 — 설기) 또는 극(재성월 — 소모). 둘 다 실령이다.
  if (generationMap[dayStemElement] === primaryElement) {
    return {
      isDeukRyeong: false,
      reason: `일간 ${dayStemElement}이(가) 월지 ${primaryElement}을(를) 생하여 기운이 빠지므로(식상월) 실령입니다`,
      strength: 'weak',
    };
  }
  return {
    isDeukRyeong: false,
    reason: `일간 ${dayStemElement}이(가) 월지 ${primaryElement}을(를) 극하여 힘을 쓰므로(재성월) 실령입니다`,
    strength: 'weak',
  };
}

