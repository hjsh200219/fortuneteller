/**
 * 지지(地支) 데이터
 * 12개의 지지와 관련 정보
 */

import type { EarthlyBranch, WuXing, YinYang } from '../types/index.js';

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

