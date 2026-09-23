/**
 * 세운(歲運) 계산 시스템
 * 연별 운세 분석 - 매년의 천간지지와 그에 따른 운세
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { analyzeElementInteraction } from '../data/wuxing.js';
import { getManAgeForFortuneYear } from '../utils/date.js';
import { evaluateGanJi, describeLuck, getFavorSets, type GanJiLuck } from './luck_evaluation.js';
import { getSolarMonthGanJi } from './helpers.js';

/**
 * 세운(歲運) 한 해 정보
 */
export interface SeUnYear {
  year: number; // 실제 연도 (예: 2025)
  /** 해당 연도 말(12/31) 기준 만 나이 (세운이 적용되는 해 기준) */
  age: number;
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
  /** 일간 기준 십신·용신 유불리 평가 */
  evaluation?: Pick<GanJiLuck, 'stemTenGod' | 'branchTenGod' | 'stemFavor' | 'branchFavor' | 'verdict' | 'score' | 'clashWithDayBranch' | 'harmonyWithDayBranch'>;
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
  const age = getManAgeForFortuneYear(sajuData.birthDate, targetYear);

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

  // 운세 분석 — 십신·용신 유불리·일지 합충
  const favorSets = getFavorSets(sajuData);
  const luck = evaluateGanJi(sajuData, yearGanJi.stem, yearGanJi.branch, favorSets);
  const fortune = describeLuck(luck, sajuData, '해');

  // 월별 하이라이트 — 그 해 실제 월건 간지로
  const monthlyHighlights = calculateMonthlyHighlights(sajuData, targetYear, favorSets);

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
    evaluation: {
      stemTenGod: luck.stemTenGod,
      branchTenGod: luck.branchTenGod,
      stemFavor: luck.stemFavor,
      branchFavor: luck.branchFavor,
      verdict: luck.verdict,
      score: luck.score,
      clashWithDayBranch: luck.clashWithDayBranch,
      harmonyWithDayBranch: luck.harmonyWithDayBranch,
    },
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
 * 월별 하이라이트 — 양력 1~12월 각 달의 월건 간지를 평가해
 * 유리한 달(용신 쪽)과 주의할 달(기신 쪽이거나 일지를 충)을 겹치지 않게 고른다.
 */
function calculateMonthlyHighlights(
  sajuData: SajuData,
  year: number,
  favorSets: ReturnType<typeof getFavorSets>
): SeUnYear['monthlyHighlights'] {
  const bestMonths: number[] = [];
  const cautionMonths: number[] = [];
  for (let month = 1; month <= 12; month++) {
    const { stem, branch } = getSolarMonthGanJi(year, month);
    const luck = evaluateGanJi(sajuData, stem, branch, favorSets);
    if (luck.clashWithDayBranch || luck.verdict === 'unfavorable') {
      cautionMonths.push(month);
    } else if (luck.verdict === 'favorable') {
      bestMonths.push(month);
    }
  }
  return { bestMonths, cautionMonths };
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
