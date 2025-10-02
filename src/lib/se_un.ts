/**
 * 세운(歲運) 계산 시스템
 * 연별 운세 분석 - 매년의 천간지지와 그에 따른 운세
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { analyzeElementInteraction } from '../data/wuxing.js';

/**
 * 세운(歲運) 한 해 정보
 */
export interface SeUnYear {
  year: number; // 실제 연도 (예: 2025)
  age: number; // 나이
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: WuXing;
  branchElement: WuXing;
  ganjiName: string; // 간지명 (예: "을사년")
  yearAnimal: string; // 띠 (예: "뱀띠")
  interaction: {
    withDayMaster: string; // 일간과의 관계
    withYongSin: string; // 용신과의 관계
    elementBalance: string; // 오행 균형
  };
  fortune: {
    overall: string; // 전반적 운세
    career: string; // 직업운
    wealth: string; // 재물운
    health: string; // 건강운
    relationship: string; // 인간관계운
  };
  monthlyHighlights?: {
    bestMonths: number[]; // 좋은 달 (1-12)
    cautionMonths: number[]; // 주의할 달 (1-12)
  };
}

/**
 * 특정 연도의 간지 계산
 * 갑자년(1984)을 기준으로 계산
 */
function getYearGanJi(year: number): { stem: HeavenlyStem; branch: EarthlyBranch } {
  // 1984년 = 갑자년 (甲子年)
  const baseYear = 1984;
  const yearDiff = year - baseYear;

  const stemIndex = (yearDiff % 10 + 10) % 10;
  const branchIndex = (yearDiff % 12 + 12) % 12;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);

  return {
    stem: stem.korean,
    branch: branch.korean,
  };
}

/**
 * 지지에 따른 띠 이름
 */
const ZODIAC_ANIMALS: Record<EarthlyBranch, string> = {
  자: '쥐띠',
  축: '소띠',
  인: '호랑이띠',
  묘: '토끼띠',
  진: '용띠',
  사: '뱀띠',
  오: '말띠',
  미: '양띠',
  신: '원숭이띠',
  유: '닭띠',
  술: '개띠',
  해: '돼지띠',
};

/**
 * 세운 분석
 */
export function analyzeSeUn(
  sajuData: SajuData,
  targetYear: number
): SeUnYear {
  const birthYear = parseInt(sajuData.birthDate.split('-')[0]!);
  const age = targetYear - birthYear + 1; // 한국 나이

  const yearGanJi = getYearGanJi(targetYear);
  const stemData = getHeavenlyStemByIndex(
    ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'].indexOf(yearGanJi.stem)
  );
  const branchData = getEarthlyBranchByIndex(
    ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'].indexOf(
      yearGanJi.branch
    )
  );

  // 일간과의 관계 분석
  const dayMasterInteraction = analyzeElementInteraction(
    sajuData.day.stemElement,
    stemData.element
  );

  // 용신과의 관계 분석
  const yongSinElement = sajuData.yongSin?.primaryYongSin || sajuData.day.stemElement;
  const yongSinInteraction = analyzeElementInteraction(yongSinElement, stemData.element);

  // 오행 균형 분석
  const elementBalance = analyzeYearElementBalance(sajuData, stemData.element, branchData.element);

  // 운세 분석
  const fortune = analyzeFortune(
    sajuData,
    stemData.element,
    branchData.element,
    dayMasterInteraction,
    yongSinInteraction
  );

  // 월별 하이라이트
  const monthlyHighlights = calculateMonthlyHighlights(sajuData);

  return {
    year: targetYear,
    age,
    stem: yearGanJi.stem,
    branch: yearGanJi.branch,
    stemElement: stemData.element,
    branchElement: branchData.element,
    ganjiName: `${yearGanJi.stem}${yearGanJi.branch}년`,
    yearAnimal: ZODIAC_ANIMALS[yearGanJi.branch]!,
    interaction: {
      withDayMaster: dayMasterInteraction,
      withYongSin: yongSinInteraction,
      elementBalance,
    },
    fortune,
    monthlyHighlights,
  };
}

/**
 * 오행 균형 분석
 */
function analyzeYearElementBalance(
  sajuData: SajuData,
  yearStemElement: WuXing,
  yearBranchElement: WuXing
): string {
  const wuxingCount = { ...sajuData.wuxingCount };

  // 세운 오행 추가
  wuxingCount[yearStemElement] = (wuxingCount[yearStemElement] || 0) + 1;
  wuxingCount[yearBranchElement] = (wuxingCount[yearBranchElement] || 0) + 1;

  const total = Object.values(wuxingCount).reduce((sum, count) => sum + count, 0);
  const balanced = Object.values(wuxingCount).every((count) => count >= total * 0.15);

  if (balanced) {
    return '올해는 오행이 균형을 이루어 안정적인 한 해가 될 것입니다.';
  }

  const dominant = (Object.keys(wuxingCount) as WuXing[]).reduce((a, b) =>
    wuxingCount[a]! > wuxingCount[b]! ? a : b
  );
  const weak = (Object.keys(wuxingCount) as WuXing[]).filter(
    (element) => wuxingCount[element]! < total * 0.1
  );

  if (weak.length > 0) {
    return `${dominant} 기운이 강하고 ${weak.join(', ')} 기운이 약하여 불균형한 상태입니다. ${weak.join(', ')}을 보완하는 것이 좋습니다.`;
  }

  return `${dominant} 기운이 강한 한 해입니다.`;
}

/**
 * 운세 분석
 */
function analyzeFortune(
  sajuData: SajuData,
  yearStemElement: WuXing,
  yearBranchElement: WuXing,
  dayMasterInteraction: string,
  yongSinInteraction: string
): SeUnYear['fortune'] {
  const isYongSinYear = yongSinInteraction.includes('생') || yongSinInteraction.includes('비화');
  const isDayMasterSupported = dayMasterInteraction.includes('생');

  return {
    overall: isYongSinYear
      ? '용신이 들어오는 좋은 해입니다. 전반적으로 운이 상승하고 좋은 기회가 찾아올 것입니다.'
      : '용신과 조화를 이루지 못하는 해입니다. 신중하게 행동하고 무리하지 않는 것이 좋습니다.',

    career: isDayMasterSupported
      ? '일간을 돕는 기운이 있어 직장에서 인정받고 승진이나 새로운 기회가 올 수 있습니다.'
      : '직장 생활에 변동이 있을 수 있습니다. 안정을 유지하고 새로운 도전은 신중히 결정하세요.',

    wealth: yearStemElement === '목' || yearStemElement === '수'
      ? '재물운이 좋습니다. 투자나 사업 확장을 고려해볼 만합니다.'
      : '재물운이 평범합니다. 무리한 투자는 피하고 저축에 힘쓰세요.',

    health: yearBranchElement === sajuData.day.branchElement
      ? '건강에 유의해야 합니다. 정기 검진을 받고 건강 관리에 신경 쓰세요.'
      : '건강 상태가 안정적입니다. 꾸준한 운동과 규칙적인 생활이 도움이 됩니다.',

    relationship: isYongSinYear
      ? '대인관계가 원만합니다. 새로운 인연을 만나거나 기존 관계가 돈독해질 수 있습니다.'
      : '대인관계에서 오해나 갈등이 있을 수 있습니다. 소통과 이해심을 가지고 대하세요.',
  };
}

/**
 * 월별 하이라이트 계산
 */
function calculateMonthlyHighlights(
  sajuData: SajuData
): SeUnYear['monthlyHighlights'] {
  const yongSinElement = sajuData.yongSin?.primaryYongSin || sajuData.day.stemElement;

  // 간단한 월별 분석 (실제로는 월간지지를 모두 계산해야 함)
  const bestMonths: number[] = [];
  const cautionMonths: number[] = [];

  // 용신 오행이 왕성한 계절의 달들을 좋은 달로 설정
  const seasonMap: Record<WuXing, number[]> = {
    목: [2, 3, 4], // 봄
    화: [5, 6, 7], // 여름
    토: [1, 4, 7, 10], // 환절기
    금: [8, 9, 10], // 가을
    수: [11, 12, 1], // 겨울
  };

  bestMonths.push(...(seasonMap[yongSinElement] || []));

  // 일간과 충(沖)하는 달을 주의할 달로 설정
  const branchIndex = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'].indexOf(
    sajuData.day.branch
  );
  const chungMonth = ((branchIndex + 6) % 12) + 1;
  cautionMonths.push(chungMonth);

  return {
    bestMonths: [...new Set(bestMonths)].sort((a, b) => a - b),
    cautionMonths: [...new Set(cautionMonths)].sort((a, b) => a - b),
  };
}

/**
 * 여러 해의 세운 조회
 */
export function getMultipleSeUn(
  sajuData: SajuData,
  startYear: number,
  years: number = 5
): SeUnYear[] {
  const results: SeUnYear[] = [];

  for (let i = 0; i < years; i++) {
    results.push(analyzeSeUn(sajuData, startYear + i));
  }

  return results;
}

/**
 * 현재 연도의 세운 조회
 */
export function getCurrentSeUn(sajuData: SajuData): SeUnYear {
  const currentYear = new Date().getFullYear();
  return analyzeSeUn(sajuData, currentYear);
}
