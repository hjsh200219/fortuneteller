/**
 * 운세 분석 로직
 */

import type { SajuData, FortuneAnalysis, FortuneAnalysisType, DailyFortune, WuXing } from '../types/index.js';
import { WUXING_DATA, analyzeWuXingBalance } from '../data/wuxing.js';

/**
 * 사주를 기반으로 운세 분석
 */
export function analyzeFortune(
  sajuData: SajuData,
  analysisType: FortuneAnalysisType,
  _targetDate?: string
): FortuneAnalysis {
  const { wuxingCount } = sajuData;
  const balance = analyzeWuXingBalance(wuxingCount);

  switch (analysisType) {
    case 'general':
      return analyzeGeneralFortune(sajuData, balance);
    case 'career':
      return analyzeCareerFortune(sajuData, balance);
    case 'wealth':
      return analyzeWealthFortune(sajuData, balance);
    case 'health':
      return analyzeHealthFortune(sajuData, balance);
    case 'love':
      return analyzeLoveFortune(sajuData, balance);
    default:
      throw new Error(`지원하지 않는 분석 유형: ${analysisType}`);
  }
}

/**
 * 종합 운세 분석
 */
function analyzeGeneralFortune(
  _sajuData: SajuData,
  balance: ReturnType<typeof analyzeWuXingBalance>
): FortuneAnalysis {
  const positive: string[] = [];
  const negative: string[] = [];
  const advice: string[] = [];

  // 오행 균형 분석
  if (balance.balanced) {
    positive.push('오행이 균형을 이루어 안정적인 운세를 보입니다');
    advice.push('현재의 균형을 유지하며 꾸준히 노력하세요');
  } else {
    if (balance.strong.length > 0) {
      negative.push(`${balance.strong.join(', ')} 기운이 과도하여 불균형이 있습니다`);
      advice.push(`${balance.weak.join(', ')} 기운을 보충하는 활동을 하세요`);
    }
  }

  // 강한 오행별 특징
  balance.strong.forEach((element) => {
    const data = WUXING_DATA[element];
    positive.push(`${element}(${data.hanja}) 기운이 강해 ${data.personality.slice(0, 2).join(', ')} 특성이 두드러집니다`);
  });

  // 약한 오행별 조언
  balance.weak.forEach((element) => {
    const data = WUXING_DATA[element];
    advice.push(`${data.color.join('/')} 색상을 활용하여 ${element} 기운을 보충하세요`);
  });

  const score = balance.balanced ? 85 : 70 - balance.strong.length * 5 - balance.weak.length * 5;

  return {
    type: 'general',
    score: Math.max(40, Math.min(100, score)),
    summary: balance.balanced
      ? '전반적으로 균형잡힌 운세를 가지고 있습니다'
      : '오행의 균형을 맞추면 더 좋은 운세가 될 것입니다',
    details: {
      positive,
      negative,
      advice,
    },
    luckyElements: {
      colors: balance.weak.flatMap((e) => WUXING_DATA[e].color),
      directions: balance.weak.map((e) => WUXING_DATA[e].direction),
    },
  };
}

/**
 * 직업운 분석
 */
function analyzeCareerFortune(
  sajuData: SajuData,
  balance: ReturnType<typeof analyzeWuXingBalance>
): FortuneAnalysis {
  const positive: string[] = [];
  const negative: string[] = [];
  const advice: string[] = [];

  // 일간 기준 직업 적성
  const dayStem = sajuData.day.stemElement;

  switch (dayStem) {
    case '목':
      positive.push('창의적이고 성장지향적인 분야에 적합합니다');
      advice.push('교육, 예술, 기획 분야를 고려해보세요');
      break;
    case '화':
      positive.push('활동적이고 사람을 대하는 일에 재능이 있습니다');
      advice.push('영업, 서비스, 방송 분야에서 두각을 나타낼 수 있습니다');
      break;
    case '토':
      positive.push('안정적이고 신뢰를 주는 성향이 강합니다');
      advice.push('부동산, 금융, 중재 업무가 잘 맞습니다');
      break;
    case '금':
      positive.push('원칙적이고 결단력있는 리더십을 발휘합니다');
      advice.push('법조계, 군인, 경영 분야에 적합합니다');
      break;
    case '수':
      positive.push('지혜롭고 분석적인 사고력이 뛰어납니다');
      advice.push('연구, IT, 학문 분야에서 성공할 수 있습니다');
      break;
  }

  const score = 70 + (balance.balanced ? 20 : 0) + Math.random() * 10;

  return {
    type: 'career',
    score: Math.floor(score),
    summary: '당신의 사주는 직업 선택에 있어 중요한 힌트를 제공합니다',
    details: { positive, negative, advice },
  };
}

/**
 * 재물운 분석
 */
function analyzeWealthFortune(
  sajuData: SajuData,
  balance: ReturnType<typeof analyzeWuXingBalance>
): FortuneAnalysis {
  const positive: string[] = [];
  const negative: string[] = [];
  const advice: string[] = [];

  // 재성(財星) 분석 - 일간과 극하는 오행
  const dayStemElement = sajuData.day.stemElement;
  const wealthElement: WuXing = getDestroyedElement(dayStemElement);
  const wealthCount = sajuData.wuxingCount[wealthElement];

  if (wealthCount >= 2) {
    positive.push(`재성(${wealthElement})이 충분하여 재물운이 양호합니다`);
    advice.push('투자 기회를 적극적으로 검토해보세요');
  } else if (wealthCount === 1) {
    positive.push('재물운이 적당하여 안정적입니다');
    advice.push('무리한 투자보다는 꾸준한 저축이 유리합니다');
  } else {
    negative.push('재성이 부족하여 재물운이 약합니다');
    advice.push('지출을 줄이고 수입원을 다양화하세요');
  }

  const score = 50 + wealthCount * 15 + (balance.balanced ? 10 : 0);

  return {
    type: 'wealth',
    score: Math.min(100, score),
    summary: wealthCount >= 2 ? '재물운이 좋은 편입니다' : '재물 관리에 신중함이 필요합니다',
    details: { positive, negative, advice },
  };
}

/**
 * 건강운 분석
 */
function analyzeHealthFortune(
  _sajuData: SajuData,
  balance: ReturnType<typeof analyzeWuXingBalance>
): FortuneAnalysis {
  const positive: string[] = [];
  const negative: string[] = [];
  const advice: string[] = [];

  if (balance.balanced) {
    positive.push('오행이 균형을 이루어 건강운이 좋습니다');
  } else {
    balance.strong.forEach((element) => {
      negative.push(`${element} 기운이 과도하여 관련 건강에 주의가 필요합니다`);
      advice.push(getHealthAdvice(element));
    });

    balance.weak.forEach((element) => {
      negative.push(`${element} 기운이 약하여 관련 장기가 약할 수 있습니다`);
      advice.push(`${element} 기운을 보충하는 음식과 활동을 하세요`);
    });
  }

  const score = 80 - balance.strong.length * 10 - balance.weak.length * 8;

  return {
    type: 'health',
    score: Math.max(40, score),
    summary: balance.balanced ? '전반적으로 건강한 체질입니다' : '균형잡힌 생활습관이 필요합니다',
    details: { positive, negative, advice },
  };
}

/**
 * 애정운 분석
 */
function analyzeLoveFortune(
  sajuData: SajuData,
  _balance: ReturnType<typeof analyzeWuXingBalance>
): FortuneAnalysis {
  const positive: string[] = [];
  const negative: string[] = [];
  const advice: string[] = [];

  const dayStemElement = sajuData.day.stemElement;

  // 오행별 애정 스타일
  switch (dayStemElement) {
    case '목':
      positive.push('따뜻하고 배려심 많은 연애 스타일입니다');
      advice.push('상대방에게 성장의 기회를 주는 관계가 좋습니다');
      break;
    case '화':
      positive.push('열정적이고 표현이 풍부한 사랑을 합니다');
      advice.push('때로는 차분함도 필요합니다');
      break;
    case '토':
      positive.push('안정적이고 헌신적인 관계를 추구합니다');
      advice.push('너무 보수적이지 않도록 주의하세요');
      break;
    case '금':
      positive.push('진지하고 책임감있는 관계를 원합니다');
      advice.push('융통성과 여유를 가지세요');
      break;
    case '수':
      positive.push('깊이있고 지적인 교감을 중시합니다');
      advice.push('감정 표현을 더 자주 하세요');
      break;
  }

  const score = 70 + Math.random() * 20;

  return {
    type: 'love',
    score: Math.floor(score),
    summary: '당신만의 독특한 애정 스타일이 있습니다',
    details: { positive, negative, advice },
  };
}

/**
 * 일일 운세 생성
 */
export function getDailyFortune(sajuData: SajuData, date: string): DailyFortune {
  const targetDate = new Date(date);
  const dayElement = sajuData.day.stemElement;

  // 날짜 기반 운세 변동
  const dateNumber = targetDate.getDate();
  const monthNumber = targetDate.getMonth() + 1;

  const variance = ((dateNumber + monthNumber) % 20) - 10; // -10 ~ +10

  return {
    date,
    overallLuck: Math.min(100, Math.max(30, 70 + variance)),
    wealthLuck: Math.min(100, Math.max(30, 65 + variance + (Math.random() * 20 - 10))),
    careerLuck: Math.min(100, Math.max(30, 75 + variance + (Math.random() * 20 - 10))),
    healthLuck: Math.min(100, Math.max(30, 70 + variance + (Math.random() * 20 - 10))),
    loveLuck: Math.min(100, Math.max(30, 68 + variance + (Math.random() * 20 - 10))),
    luckyColor: WUXING_DATA[dayElement].color[0]!,
    luckyDirection: WUXING_DATA[dayElement].direction,
    advice: `오늘은 ${dayElement} 기운이 강한 날입니다. ${WUXING_DATA[dayElement].personality[0]}하게 행동하세요.`,
  };
}

/**
 * 오행이 극하는 오행 반환
 */
function getDestroyedElement(element: WuXing): WuXing {
  const map: Record<WuXing, WuXing> = {
    목: '토',
    화: '금',
    토: '수',
    금: '목',
    수: '화',
  };
  return map[element];
}

/**
 * 오행별 건강 조언
 */
function getHealthAdvice(element: string): string {
  const adviceMap: Record<string, string> = {
    목: '간과 눈 건강에 유의하고, 스트레스 관리를 하세요',
    화: '심장과 혈압에 주의하고, 과한 흥분을 자제하세요',
    토: '소화기와 비장 건강을 챙기고, 규칙적인 식사를 하세요',
    금: '호흡기와 피부를 관리하고, 건조함을 피하세요',
    수: '신장과 방광 건강에 신경쓰고, 충분한 수분 섭취를 하세요',
  };
  return adviceMap[element] || '건강 관리에 신경쓰세요';
}

