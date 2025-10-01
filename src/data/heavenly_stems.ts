/**
 * 천간(天干) 데이터
 * 10개의 천간과 관련 정보
 */

import type { HeavenlyStem, WuXing, YinYang } from '../types/index.js';

export interface HeavenlyStemData {
  korean: HeavenlyStem;
  hanja: string;
  element: WuXing;
  yinYang: YinYang;
  index: number;
}

export const HEAVENLY_STEMS: HeavenlyStemData[] = [
  { korean: '갑', hanja: '甲', element: '목', yinYang: '양', index: 0 },
  { korean: '을', hanja: '乙', element: '목', yinYang: '음', index: 1 },
  { korean: '병', hanja: '丙', element: '화', yinYang: '양', index: 2 },
  { korean: '정', hanja: '丁', element: '화', yinYang: '음', index: 3 },
  { korean: '무', hanja: '戊', element: '토', yinYang: '양', index: 4 },
  { korean: '기', hanja: '己', element: '토', yinYang: '음', index: 5 },
  { korean: '경', hanja: '庚', element: '금', yinYang: '양', index: 6 },
  { korean: '신', hanja: '辛', element: '금', yinYang: '음', index: 7 },
  { korean: '임', hanja: '壬', element: '수', yinYang: '양', index: 8 },
  { korean: '계', hanja: '癸', element: '수', yinYang: '음', index: 9 },
];

/**
 * 천간 인덱스로 천간 데이터 가져오기
 */
export function getHeavenlyStemByIndex(index: number): HeavenlyStemData {
  const normalizedIndex = ((index % 10) + 10) % 10;
  return HEAVENLY_STEMS[normalizedIndex]!;
}

/**
 * 천간 한글명으로 천간 데이터 가져오기
 */
export function getHeavenlyStemByKorean(korean: HeavenlyStem): HeavenlyStemData | undefined {
  return HEAVENLY_STEMS.find((stem) => stem.korean === korean);
}

/**
 * 천간 한자로 천간 데이터 가져오기
 */
export function getHeavenlyStemByHanja(hanja: string): HeavenlyStemData | undefined {
  return HEAVENLY_STEMS.find((stem) => stem.hanja === hanja);
}

