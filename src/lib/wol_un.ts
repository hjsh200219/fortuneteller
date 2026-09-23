/**
 * 월운(月運) 계산 시스템
 * 월별 운세 분석 - 매달의 천간지지와 그에 따른 운세
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { analyzeElementInteraction } from '../data/wuxing.js';
import { SOLAR_TERMS } from '../data/solar_terms.js';
import { getSolarMonthGanJi, getDayPillar } from './helpers.js';
import { evaluateGanJi, describeLuck, getFavorSets, type GanJiLuck } from './luck_evaluation.js';

/**
 * 월운(月運) 한 달 정보
 */
export interface WolUnMonth {
  year: number; // 연도
  month: number; // 월 (1-12)
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: WuXing;
  branchElement: WuXing;
  ganjiName: string; // 간지명 (예: "을축월")
  solarTerm: string; // 해당 월의 절기
  interaction: {
    withDayMaster: string; // 일간과의 관계
    withYongSin: string; // 용신과의 관계
    withYear: string; // 세운과의 조화
  };
  fortune: {
    overall: string; // 전반적 운세
    work: string; // 업무운
    money: string; // 금전운
    health: string; // 건강운
    love: string; // 연애운
  };
  advice: string[]; // 조언
  luckyDays?: number[]; // 길일 (1-31)
  cautionDays?: number[]; // 주의일 (1-31)
}

/**
 * 특정 년월의 간지 계산 (양력 M월 = 그 달 절입 절의 월건, 1월은 전년도 연간)
 */
function getMonthGanJi(
  year: number,
  month: number
): { stem: HeavenlyStem; branch: EarthlyBranch; solarTerm: string } {
  const { stem, branch, offsetFromIn } = getSolarMonthGanJi(year, month);
  // 월초 절(節) 이름 — SOLAR_TERMS 는 입춘부터 절·기 교대
  const solarTermName = SOLAR_TERMS[offsetFromIn * 2]!.name;
  return { stem, branch, solarTerm: solarTermName };
}

/**
 * 월운 분석
 */
export function analyzeWolUn(
  sajuData: SajuData,
  targetYear: number,
  targetMonth: number,
  _yearStem?: HeavenlyStem
): WolUnMonth {
  // 연간은 targetYear·targetMonth 로 직접 낸다(1월은 전년도). _yearStem 은 호출부 호환용.
  const monthGanJi = getMonthGanJi(targetYear, targetMonth);

  const stemData = getHeavenlyStemByIndex(
    ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'].indexOf(monthGanJi.stem)
  );
  const branchData = getEarthlyBranchByIndex(
    ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'].indexOf(
      monthGanJi.branch
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

  // 세운과의 관계 — 월지가 그 해(입춘 기준) 연지와 충·합하는지
  const yearInteraction = describeYearMonthRelation(targetYear, targetMonth, monthGanJi.branch);

  // 운세 분석 — 십신·용신 유불리·일지 합충
  const favorSets = getFavorSets(sajuData);
  const luck = evaluateGanJi(sajuData, monthGanJi.stem, monthGanJi.branch, favorSets);
  const described = describeLuck(luck, sajuData, '달');
  const fortune: WolUnMonth['fortune'] = {
    overall: described.overall,
    work: described.career,
    money: described.wealth,
    health: described.health,
    love: described.relationship,
  };

  const advice = generateMonthAdvice(luck);

  // 길일/주의일 — 그 달 실제 일진을 평가
  const { luckyDays, cautionDays } = calculateLuckyCautionDays(sajuData, targetYear, targetMonth, favorSets);

  return {
    year: targetYear,
    month: targetMonth,
    stem: monthGanJi.stem,
    branch: monthGanJi.branch,
    stemElement: stemData.element,
    branchElement: branchData.element,
    ganjiName: `${monthGanJi.stem}${monthGanJi.branch}월`,
    solarTerm: monthGanJi.solarTerm,
    interaction: {
      withDayMaster: dayMasterInteraction,
      withYongSin: yongSinInteraction,
      withYear: yearInteraction,
    },
    fortune,
    advice,
    luckyDays,
    cautionDays,
  };
}

const BRANCHES: EarthlyBranch[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

function describeYearMonthRelation(year: number, month: number, monthBranch: EarthlyBranch): string {
  const sajuYear = month === 1 ? year - 1 : year;
  const yearBranch = BRANCHES[(((sajuYear - 4) % 12) + 12) % 12]!;
  const yi = BRANCHES.indexOf(yearBranch);
  const mi = BRANCHES.indexOf(monthBranch);
  if ((yi + 6) % 12 === mi) return `월지 ${monthBranch}이(가) 세운 연지 ${yearBranch}와 충(沖)합니다. 그 해 흐름과 부딪히는 달입니다.`;
  if ((yi + mi) % 12 === 1) return `월지 ${monthBranch}이(가) 세운 연지 ${yearBranch}와 육합합니다. 그 해 흐름을 거드는 달입니다.`;
  return `월지 ${monthBranch}와 세운 연지 ${yearBranch} 사이에 충·합은 없습니다.`;
}

function generateMonthAdvice(luck: GanJiLuck): string[] {
  const advice: string[] = [];
  if (luck.verdict === 'favorable') advice.push('용신 쪽 달입니다. 미뤄 둔 일을 이때 추진하세요.');
  else if (luck.verdict === 'unfavorable') advice.push('기신 쪽 달입니다. 새 일을 벌이기보다 하던 일을 정리하세요.');
  else if (luck.verdict === 'mixed') advice.push('유불리가 엇갈리는 달입니다. 시작은 하되 한도와 퇴로를 먼저 정하세요.');
  else advice.push('뚜렷한 유불리 신호가 없는 달입니다. 평소 계획대로 가세요.');
  if (luck.clashWithDayBranch) advice.push('월지가 일지를 충합니다. 이사·큰 일정 변경은 한 번 더 따져 보세요.');
  if (luck.harmonyWithDayBranch) advice.push('월지가 일지와 육합합니다. 가까운 사람과의 약속·화해에 좋습니다.');
  return advice;
}

/**
 * 길일/주의일 — 그 달 양력 1일~말일의 일진(日辰)을 원국 기준으로 평가
 * 길일: 용신 쪽이고 일지를 충하지 않는 날. 주의일: 일지를 충하거나 기신 쪽인 날.
 */
function calculateLuckyCautionDays(
  sajuData: SajuData,
  year: number,
  month: number,
  favorSets: ReturnType<typeof getFavorSets>
): { luckyDays: number[]; cautionDays: number[] } {
  const luckyDays: number[] = [];
  const cautionDays: number[] = [];
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= lastDay; day++) {
    const { stem, branch } = getDayPillar(new Date(year, month - 1, day, 12));
    const luck = evaluateGanJi(sajuData, stem, branch, favorSets);
    if (luck.clashWithDayBranch || luck.verdict === 'unfavorable') cautionDays.push(day);
    else if (luck.verdict === 'favorable') luckyDays.push(day);
  }
  return { luckyDays, cautionDays };
}

/**
 * 여러 달의 월운 조회
 */
export function getMultipleWolUn(
  sajuData: SajuData,
  startYear: number,
  startMonth: number,
  months: number = 12,
  yearStem: HeavenlyStem
): WolUnMonth[] {
  const results: WolUnMonth[] = [];

  let currentYear = startYear;
  let currentMonth = startMonth;

  for (let i = 0; i < months; i++) {
    results.push(analyzeWolUn(sajuData, currentYear, currentMonth, yearStem));

    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return results;
}

/**
 * 현재 월의 월운 조회
 */
export function getCurrentWolUn(sajuData: SajuData, yearStem: HeavenlyStem): WolUnMonth {
  const now = new Date();
  return analyzeWolUn(sajuData, now.getFullYear(), now.getMonth() + 1, yearStem);
}
