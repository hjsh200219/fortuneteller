/**
 * 운세 분석 로직
 */

import type { SajuData, FortuneAnalysis, FortuneAnalysisType, DailyFortune, WuXing } from '../types/index.js';
import { WUXING_DATA, analyzeWuXingBalance } from '../data/wuxing.js';
import { interpretAllTenGods } from './ten_gods.js';
import { interpretBySinSal } from './sin_sal.js';

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
  sajuData: SajuData,
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

  // 십성 분석 통합
  if (sajuData.tenGodsDistribution) {
    const tenGodsInterpretations = interpretAllTenGods(sajuData.tenGodsDistribution);
    tenGodsInterpretations.forEach((interp) => {
      if (interp.count > 0) {
        // 강점 추가 (상위 2개)
        if (interp.strengths.length > 0) {
          positive.push(`${interp.tenGod}: ${interp.strengths.slice(0, 2).join(', ')}`);
        }
        // 조언 추가 (첫 번째)
        if (interp.advice.length > 0) {
          advice.push(`${interp.tenGod} - ${interp.advice[0]}`);
        }
        // 약점이 있으면 부정적 요소로 추가
        if (interp.weaknesses.length > 0 && interp.count >= 3) {
          negative.push(`${interp.tenGod}이(가) 과다하여 ${interp.weaknesses[0]}`);
        }
      }
    });
  }

  // 신살 분석 통합
  if (sajuData.sinSals && sajuData.sinSals.length > 0) {
    const sinSalAnalysis = interpretBySinSal(sajuData.sinSals);

    // 길신 축복 추가
    if (sinSalAnalysis.blessings.length > 0) {
      positive.push(...sinSalAnalysis.blessings.slice(0, 3)); // 상위 3개
    }

    // 흉신 경고 추가
    if (sinSalAnalysis.warnings.length > 0) {
      negative.push(...sinSalAnalysis.warnings.slice(0, 2)); // 상위 2개
    }

    // 특별 조언 추가
    if (sinSalAnalysis.specialAdvice.length > 0) {
      advice.push(...sinSalAnalysis.specialAdvice.slice(0, 2)); // 상위 2개
    }
  }

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

  // 십성 기반 직업 적성 분석
  if (sajuData.tenGodsDistribution) {
    const dist = sajuData.tenGodsDistribution;

    // 식신/상관: 표현력, 창조력
    if (dist.식신 >= 2 || dist.상관 >= 2) {
      positive.push('식신/상관이 강해 창의적이고 표현력이 뛰어납니다');
      advice.push('예술, 창작, 콘텐츠 제작 분야에서 재능을 발휘하세요');
    }

    // 정관/편관: 리더십, 권위
    if (dist.정관 >= 2 || dist.편관 >= 2) {
      positive.push('관성이 강해 리더십과 책임감이 뛰어납니다');
      advice.push('관리직, 공직, 경영 분야에서 성공할 가능성이 높습니다');
    }

    // 정재/편재: 재물운, 사업 수완
    if (dist.정재 >= 2 || dist.편재 >= 2) {
      positive.push('재성이 강해 재물 관리와 사업 수완이 있습니다');
      advice.push('금융, 사업, 영업 분야에서 두각을 나타낼 수 있습니다');
    }

    // 정인/편인: 학습능력, 전문성
    if (dist.정인 >= 2 || dist.편인 >= 2) {
      positive.push('인성이 강해 학습능력과 전문성이 뛰어납니다');
      advice.push('연구, 교육, 전문직 분야가 적합합니다');
    }

    // 비견/겁재 과다 시 주의사항
    if (dist.비견 + dist.겁재 >= 4) {
      negative.push('비겁이 과다하여 독립적이지만 협업이 어려울 수 있습니다');
      advice.push('팀워크를 개발하거나 독립 사업을 고려하세요');
    }
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

  // 십성 기반 재물운 분석
  if (sajuData.tenGodsDistribution) {
    const dist = sajuData.tenGodsDistribution;

    // 정재: 안정적 재물, 근로소득
    if (dist.정재 >= 2) {
      positive.push('정재가 강해 안정적인 재물운이 있습니다');
      advice.push('정기적인 수입원을 확보하고 꾸준히 저축하세요');
    } else if (dist.정재 === 0) {
      negative.push('정재가 없어 안정적 수입이 부족할 수 있습니다');
    }

    // 편재: 변동적 재물, 사업수완
    if (dist.편재 >= 2) {
      positive.push('편재가 강해 투자나 사업에서 재물을 얻을 수 있습니다');
      advice.push('적극적인 투자와 사업 기회를 모색하되, 위험 관리는 철저히 하세요');
    }

    // 식신: 생재(生財), 재물을 만드는 능력
    if (dist.식신 >= 2) {
      positive.push('식신이 강해 자연스럽게 재물을 만들어내는 능력이 있습니다');
      advice.push('창의적인 활동이나 콘텐츠 제작으로 수익을 창출하세요');
    }

    // 비견/겁재: 재물 경쟁, 나눔
    if (dist.비견 + dist.겁재 >= 3) {
      if (dist.정재 + dist.편재 === 0) {
        negative.push('비겁은 많으나 재성이 없어 재물운이 약합니다');
        advice.push('협업보다는 독립적인 수입원 개발에 집중하세요');
      } else {
        negative.push('비겁이 많아 재물을 나누거나 경쟁해야 할 수 있습니다');
        advice.push('재물 관리를 철저히 하고 불필요한 지출을 줄이세요');
      }
    }
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

  // 십성 기반 애정운 분석
  if (sajuData.tenGodsDistribution) {
    const dist = sajuData.tenGodsDistribution;
    const isMale = sajuData.gender === 'male';

    if (isMale) {
      // 남성: 재성(財星)이 배우자
      const spouseCount = dist.정재 + dist.편재;
      if (spouseCount >= 2) {
        positive.push('재성이 있어 이성과의 인연이 좋습니다');
        if (dist.정재 >= 1) {
          advice.push('정재가 있어 안정적인 결혼 운이 있습니다');
        }
        if (dist.편재 >= 2) {
          negative.push('편재가 많아 이성 관계가 복잡할 수 있습니다');
          advice.push('한 사람에게 집중하는 것이 중요합니다');
        }
      } else if (spouseCount === 0) {
        negative.push('재성이 없어 이성과의 인연이 약할 수 있습니다');
        advice.push('적극적으로 만남의 기회를 만들어보세요');
      }
    } else {
      // 여성: 관성(官星)이 배우자
      const spouseCount = dist.정관 + dist.편관;
      if (spouseCount >= 2) {
        positive.push('관성이 있어 좋은 배우자를 만날 수 있습니다');
        if (dist.정관 >= 1) {
          advice.push('정관이 있어 좋은 결혼 운이 있습니다');
        }
        if (dist.편관 >= 2) {
          negative.push('편관이 많아 애정 관계가 복잡할 수 있습니다');
          advice.push('신중한 선택이 필요합니다');
        }
      } else if (spouseCount === 0) {
        negative.push('관성이 없어 배우자 인연이 늦을 수 있습니다');
        advice.push('인내심을 가지고 좋은 인연을 기다리세요');
      }
    }

    // 식상(食傷) 과다: 배우자성 극함
    if (dist.식신 + dist.상관 >= 4) {
      if (isMale) {
        negative.push('식상이 과다하여 재성을 생하나 배우자와 갈등이 있을 수 있습니다');
      } else {
        negative.push('식상이 과다하여 관성을 극하므로 배우자 인연에 주의가 필요합니다');
      }
      advice.push('상대방을 존중하고 이해하려는 노력이 필요합니다');
    }

    // 비겁(比劫) 과다: 배우자성 경쟁
    if (dist.비견 + dist.겁재 >= 4) {
      negative.push('비겁이 많아 이성 관계에서 경쟁이 있을 수 있습니다');
      advice.push('독점욕을 줄이고 상대방의 자유를 존중하세요');
    }
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
 * 날짜 기반 시드 생성 함수
 */
function generateDateSeed(date: Date, sajuData: SajuData): number {
  const dateStr = date.toISOString().split('T')[0] || '';
  const sajuStr = `${sajuData.day.stem}${sajuData.day.branch}`;
  const combinedStr = dateStr + sajuStr;

  // 문자열을 숫자 시드로 변환
  let seed = 0;
  for (let i = 0; i < combinedStr.length; i++) {
    const char = combinedStr[i];
    if (char) {
      seed = (seed * 31 + char.charCodeAt(0)) % 100000;
    }
  }
  return seed;
}

/**
 * 시드 기반 난수 생성 (0-1 사이 값)
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 일일 운세 생성
 */
export function getDailyFortune(sajuData: SajuData, date: string): DailyFortune {
  const targetDate = new Date(date);
  const seed = generateDateSeed(targetDate, sajuData);
  const dayElement = sajuData.day.stemElement;

  // 날짜 기반 운세 변동
  const dateNumber = targetDate.getDate();
  const monthNumber = targetDate.getMonth() + 1;

  const variance = ((dateNumber + monthNumber) % 20) - 10; // -10 ~ +10

  // 시드 기반 변동 (-10 ~ +10)
  const getVariance = (offset: number) => {
    return (seededRandom(seed + offset) - 0.5) * 20;
  };

  return {
    date,
    overallLuck: Math.round(Math.min(100, Math.max(30, 70 + variance))),
    wealthLuck: Math.round(Math.min(100, Math.max(30, 65 + variance + getVariance(1)))),
    careerLuck: Math.round(Math.min(100, Math.max(30, 75 + variance + getVariance(2)))),
    healthLuck: Math.round(Math.min(100, Math.max(30, 70 + variance + getVariance(3)))),
    loveLuck: Math.round(Math.min(100, Math.max(30, 68 + variance + getVariance(4)))),
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

