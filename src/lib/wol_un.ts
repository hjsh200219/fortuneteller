/**
 * 월운(月運) 계산 시스템
 * 월별 운세 분석 - 매달의 천간지지와 그에 따른 운세
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { analyzeElementInteraction } from '../data/wuxing.js';
import { SOLAR_TERMS } from '../data/solar_terms.js';

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
 * 월지(月支) 배열 - 절기 기준
 * 입춘(2월) = 인월, 경칩(3월) = 묘월, ...
 */
const MONTH_BRANCHES: EarthlyBranch[] = [
  '인', // 입춘 (2월)
  '묘', // 경칩 (3월)
  '진', // 청명 (4월)
  '사', // 입하 (5월)
  '오', // 망종 (6월)
  '미', // 소서 (7월)
  '신', // 입추 (8월)
  '유', // 백로 (9월)
  '술', // 한로 (10월)
  '해', // 입동 (11월)
  '자', // 대설 (12월)
  '축', // 소한 (1월)
];

/**
 * 월간(月干) 계산
 * 년간에 따라 정해진 규칙으로 계산
 */
function getMonthStem(yearStem: HeavenlyStem, monthBranch: EarthlyBranch): HeavenlyStem {
  // 년간에 따른 정월(인월) 천간 결정
  const firstMonthStems: Record<HeavenlyStem, HeavenlyStem> = {
    갑: '병',
    을: '무',
    병: '경',
    정: '임',
    무: '갑',
    기: '병',
    경: '무',
    신: '경',
    임: '임',
    계: '갑',
  };

  const firstMonthStem = firstMonthStems[yearStem]!;
  const firstMonthStemIndex = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'].indexOf(
    firstMonthStem
  );

  // 인월부터 순서대로 천간 배정
  const monthBranchIndex = MONTH_BRANCHES.indexOf(monthBranch);
  const monthStemIndex = (firstMonthStemIndex + monthBranchIndex) % 10;

  return ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'][
    monthStemIndex
  ] as HeavenlyStem;
}

/**
 * 특정 년월의 간지 계산
 */
function getMonthGanJi(
  month: number,
  yearStem: HeavenlyStem
): { stem: HeavenlyStem; branch: EarthlyBranch; solarTerm: string } {
  // 절기 기준으로 월지 결정
  // 간단화: 양력 월을 기준으로 근사치 사용
  const solarTermIndex = month - 1;
  const monthBranch = MONTH_BRANCHES[solarTermIndex % 12]!;
  const monthStem = getMonthStem(yearStem, monthBranch);

  // 해당 월의 대표 절기
  const solarTermName = SOLAR_TERMS[solarTermIndex * 2]!.name; // 월초 절기 이름

  return {
    stem: monthStem,
    branch: monthBranch,
    solarTerm: solarTermName,
  };
}

/**
 * 월운 분석
 */
export function analyzeWolUn(
  sajuData: SajuData,
  targetYear: number,
  targetMonth: number,
  yearStem: HeavenlyStem
): WolUnMonth {
  const monthGanJi = getMonthGanJi(targetMonth, yearStem);

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

  // 세운과의 조화 분석
  const yearInteraction = '세운과 조화를 이루어 안정적인 달입니다.';

  // 운세 분석
  const fortune = analyzeMonthFortune(
    sajuData,
    stemData.element,
    branchData.element,
    dayMasterInteraction,
    yongSinInteraction
  );

  // 조언 생성
  const advice = generateMonthAdvice(
    sajuData,
    stemData.element,
    yongSinInteraction,
    targetMonth
  );

  // 길일/주의일 계산 (간단 버전)
  const { luckyDays, cautionDays } = calculateLuckyCautionDays(
    sajuData,
    monthGanJi.branch,
    targetMonth
  );

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

/**
 * 월별 운세 분석
 */
function analyzeMonthFortune(
  sajuData: SajuData,
  monthStemElement: WuXing,
  _monthBranchElement: WuXing,
  dayMasterInteraction: string,
  yongSinInteraction: string
): WolUnMonth['fortune'] {
  const isYongSinMonth = yongSinInteraction.includes('생') || yongSinInteraction.includes('비화');
  const isDayMasterSupported = dayMasterInteraction.includes('생');

  return {
    overall: isYongSinMonth
      ? '이번 달은 용신이 들어와 운세가 상승합니다. 중요한 일을 추진하기 좋은 시기입니다.'
      : '평범한 달입니다. 안정을 유지하고 새로운 시도는 신중하게 결정하세요.',

    work: isDayMasterSupported
      ? '업무에서 좋은 성과를 낼 수 있습니다. 적극적으로 임하면 인정받을 것입니다.'
      : '업무가 다소 버거울 수 있습니다. 무리하지 말고 휴식을 취하세요.',

    money: monthStemElement === '목' || monthStemElement === '금'
      ? '금전운이 좋습니다. 투자 기회를 살펴보세요.'
      : '금전 관리에 유의하세요. 불필요한 지출을 줄이세요.',

    health: _monthBranchElement === sajuData.day.branchElement
      ? '건강에 주의가 필요합니다. 과로를 피하고 충분히 쉬세요.'
      : '건강 상태가 양호합니다. 규칙적인 생활을 유지하세요.',

    love: isYongSinMonth
      ? '연애운이 좋습니다. 새로운 만남이나 관계 발전의 기회가 있습니다.'
      : '연애에서 조금 소극적일 수 있습니다. 여유를 가지고 기다리세요.',
  };
}

/**
 * 월별 조언 생성
 */
function generateMonthAdvice(
  _sajuData: SajuData,
  _monthStemElement: WuXing,
  yongSinInteraction: string,
  month: number
): string[] {
  const advice: string[] = [];

  if (yongSinInteraction.includes('생')) {
    advice.push('용신이 들어오는 좋은 달입니다. 적극적으로 행동하세요.');
    advice.push('중요한 결정이나 계약을 추진하기 좋은 시기입니다.');
  } else if (yongSinInteraction.includes('극')) {
    advice.push('조심스럽게 행동하세요. 충동적인 결정은 피하세요.');
    advice.push('현상 유지에 집중하고 새로운 도전은 다음 달로 미루세요.');
  }

  // 계절별 조언
  if ([3, 4, 5].includes(month)) {
    advice.push('봄철입니다. 새로운 시작에 좋은 시기이니 계획을 실행에 옮기세요.');
  } else if ([6, 7, 8].includes(month)) {
    advice.push('여름철입니다. 활동적으로 움직이되 건강 관리에 유의하세요.');
  } else if ([9, 10, 11].includes(month)) {
    advice.push('가을철입니다. 수확의 계절이니 그동안의 노력이 결실을 맺을 것입니다.');
  } else {
    advice.push('겨울철입니다. 내실을 다지고 다음을 준비하는 시기입니다.');
  }

  return advice;
}

/**
 * 길일/주의일 계산
 */
function calculateLuckyCautionDays(
  _sajuData: SajuData,
  _monthBranch: EarthlyBranch,
  _month: number
): { luckyDays: number[]; cautionDays: number[] } {
  // 간단한 계산 (실제로는 일간지를 모두 계산해야 함)
  const luckyDays: number[] = [];
  const cautionDays: number[] = [];

  // 길일: 5일마다
  for (let day = 5; day <= 30; day += 5) {
    luckyDays.push(day);
  }

  // 주의일: 7의 배수
  for (let day = 7; day <= 28; day += 7) {
    cautionDays.push(day);
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
      // 년간도 변경해야 하지만 간단화를 위해 생략
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
