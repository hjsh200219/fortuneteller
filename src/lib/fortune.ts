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
  const positiveParts: string[] = [];
  const negativeParts: string[] = [];
  const adviceParts: string[] = [];

  // 오행 균형 분석
  if (balance.balanced) {
    positiveParts.push('당신의 사주는 오행이 조화롭게 균형을 이루고 있어 안정적인 운세의 흐름을 보입니다.');
    adviceParts.push('현재의 균형잡힌 상태를 유지하면서 꾸준히 노력한다면 더욱 좋은 결과를 얻을 수 있을 것입니다.');
  } else {
    if (balance.strong.length > 0) {
      negativeParts.push(
        `사주 내 ${balance.strong.join(', ')} 기운이 과도하게 강하여 오행의 불균형이 나타나고 있습니다.`
      );
      adviceParts.push(
        `이를 보완하기 위해서는 ${balance.weak.join(', ')} 기운을 보충하는 활동이나 환경을 만들어가는 것이 중요합니다.`
      );
    }
  }

  // 강한 오행별 특징 (오행 균형 점수 반영)
  if (balance.strong.length > 0) {
    const average = 8 / 5; // 총 8개 / 5개 오행

    const strongDesc = balance.strong
      .map((element) => {
        const data = WUXING_DATA[element];
        const count = sajuData.wuxingCount[element];
        const ratio = count / average;

        // 강도에 따라 특성 개수 조정
        let numTraits = 2;
        if (ratio >= 2.5) {
          numTraits = 4; // 매우 강함: 4개 특성
        } else if (ratio >= 2.0) {
          numTraits = 3; // 강함: 3개 특성
        }

        const traits = data.personality.slice(0, numTraits).join(', ');
        const intensity = ratio >= 2.5 ? '매우 강한' : ratio >= 2.0 ? '강한' : '뚜렷한';

        return `${element}(${data.hanja}) 기운의 ${intensity} 영향으로 ${traits}한 특성`;
      })
      .join(balance.strong.length > 1 ? '과 ' : '');

    // 여러 강한 오행이 있을 경우 혼합 표현
    if (balance.strong.length > 1) {
      positiveParts.push(
        `${strongDesc}이 복합적으로 나타나 다채롭고 입체적인 성격을 형성하고 있습니다.`
      );
    } else {
      positiveParts.push(`${strongDesc}이 뚜렷하게 나타나고 있습니다.`);
    }
  }

  // 약한 오행별 조언
  if (balance.weak.length > 0) {
    const weakColors = balance.weak.map((element) => {
      const data = WUXING_DATA[element];
      return `${element} 기운을 보충하는 ${data.color.join('/')} 색상`;
    });
    adviceParts.push(`일상에서 ${weakColors.join(', ')}을 활용하면 오행의 균형을 맞추는 데 도움이 될 것입니다.`);
  }

  // 십성 분석 통합 (강도 표현 활용)
  if (sajuData.tenGodsDistribution) {
    const tenGodsInterpretations = interpretAllTenGods(sajuData.tenGodsDistribution);
    const tenGodsStrengths: string[] = [];
    const tenGodsWeaknesses: string[] = [];
    const tenGodsAdvice: string[] = [];

    tenGodsInterpretations.forEach((interp) => {
      if (interp.count > 0) {
        // 강도에 따라 표현 조정
        const intensityPrefix =
          interp.intensity === 'very_strong'
            ? '매우 강한'
            : interp.intensity === 'strong'
              ? '강한'
              : interp.intensity === 'moderate'
                ? '적당한'
                : '약간의';

        if (interp.strengths.length > 0) {
          // 강도가 높을수록 더 많은 특성 표현
          const numStrengths = interp.intensity === 'very_strong' ? 3 : interp.intensity === 'strong' ? 2 : 1;
          const strengthText = interp.strengths.slice(0, numStrengths).join(' ');
          tenGodsStrengths.push(`${intensityPrefix} ${interp.tenGod}의 영향으로 ${strengthText}`);
        }

        if (interp.advice.length > 0 && interp.intensity !== 'very_weak') {
          tenGodsAdvice.push(`${interp.tenGod} 측면에서는 ${interp.advice[0]}`);
        }

        if (interp.weaknesses.length > 0 && interp.count >= 1.5) {
          const weaknessText =
            interp.intensity === 'very_strong'
              ? `${interp.tenGod}이(가) 매우 과다하여 ${interp.weaknesses[0]}는 경향이 강함`
              : `${interp.tenGod}이(가) 과다하여 ${interp.weaknesses[0]}는 경향`;
          tenGodsWeaknesses.push(weaknessText);
        }
      }
    });

    if (tenGodsStrengths.length > 0) {
      positiveParts.push(`십성 분석에서는 ${tenGodsStrengths.join(', ')}을 보이고 있습니다.`);
    }
    if (tenGodsWeaknesses.length > 0) {
      negativeParts.push(`다만 ${tenGodsWeaknesses.join(', ')}이 나타날 수 있으니 주의가 필요합니다.`);
    }
    if (tenGodsAdvice.length > 0) {
      adviceParts.push(`십성의 균형을 위해 ${tenGodsAdvice.slice(0, 2).join(', ')}는 것이 좋겠습니다.`);
    }
  }

  // 신살 분석 통합
  if (sajuData.sinSals && sajuData.sinSals.length > 0) {
    const sinSalAnalysis = interpretBySinSal(sajuData.sinSals);

    if (sinSalAnalysis.blessings.length > 0) {
      const blessings = sinSalAnalysis.blessings.slice(0, 3).join(' 또한 ');
      positiveParts.push(`신살의 축복으로 ${blessings}는 길한 운세가 함께하고 있습니다.`);
    }

    if (sinSalAnalysis.warnings.length > 0) {
      const warnings = sinSalAnalysis.warnings.slice(0, 2).join(' 그리고 ');
      negativeParts.push(`신살의 영향으로 ${warnings}는 점에 유의해야 합니다.`);
    }

    if (sinSalAnalysis.specialAdvice.length > 0) {
      const special = sinSalAnalysis.specialAdvice.slice(0, 2).join(' 아울러 ');
      adviceParts.push(`신살의 작용을 조화롭게 다루기 위해 ${special}는 것을 권장합니다.`);
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
      positive: positiveParts.length > 0 ? [positiveParts.join(' ')] : [],
      negative: negativeParts.length > 0 ? [negativeParts.join(' ')] : [],
      advice: adviceParts.length > 0 ? [adviceParts.join(' ')] : [],
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
  const positiveParts: string[] = [];
  const negativeParts: string[] = [];
  const adviceParts: string[] = [];

  // 일간 기준 직업 적성
  const dayStem = sajuData.day.stemElement;

  switch (dayStem) {
    case '목':
      positiveParts.push(
        '일간이 목(木) 기운을 가지고 있어 창의적이고 성장지향적인 분야에 뛰어난 적성을 보입니다.'
      );
      adviceParts.push('교육, 예술, 기획과 같이 새로운 것을 만들어내는 분야에서 능력을 발휘할 수 있습니다.');
      break;
    case '화':
      positiveParts.push(
        '일간의 화(火) 기운은 활동적이고 사람을 대하는 일에 타고난 재능을 부여합니다.'
      );
      adviceParts.push('영업, 서비스, 방송 등 사람들과 소통하며 열정을 전달하는 분야가 잘 맞을 것입니다.');
      break;
    case '토':
      positiveParts.push('토(土) 일간의 영향으로 안정적이고 신뢰를 주는 성향이 강하게 나타납니다.');
      adviceParts.push('부동산, 금융, 중재 업무처럼 신뢰와 안정성이 중요한 분야에 적합합니다.');
      break;
    case '금':
      positiveParts.push('금(金) 일간은 원칙적이고 결단력있는 리더십의 자질을 보여줍니다.');
      adviceParts.push(
        '법조계, 군인, 경영 분야처럼 명확한 판단과 실행력이 요구되는 직업이 잘 맞습니다.'
      );
      break;
    case '수':
      positiveParts.push('수(水) 일간의 특성으로 지혜롭고 분석적인 사고력이 매우 뛰어납니다.');
      adviceParts.push('연구, IT, 학문 분야에서 깊이있는 탐구를 통해 성공할 수 있는 잠재력이 큽니다.');
      break;
  }

  // 십성 기반 직업 적성 분석
  if (sajuData.tenGodsDistribution) {
    const dist = sajuData.tenGodsDistribution;
    const tenGodsParts: string[] = [];
    const tenGodsAdvice: string[] = [];

    // 식신/상관: 표현력, 창조력
    if (dist.식신 >= 2 || dist.상관 >= 2) {
      tenGodsParts.push(
        '식신과 상관이 강하게 작용하여 창의적이고 표현력이 뛰어난 성향을 지니고 있습니다'
      );
      tenGodsAdvice.push('예술, 창작, 콘텐츠 제작 분야에서 독창적인 재능을 발휘할 수 있습니다');
    }

    // 정관/편관: 리더십, 권위
    if (dist.정관 >= 2 || dist.편관 >= 2) {
      tenGodsParts.push('관성의 영향으로 리더십과 책임감이 뛰어나며 조직을 이끄는 능력이 있습니다');
      tenGodsAdvice.push('관리직, 공직, 경영 분야에서 타고난 지도력을 발휘하며 성공할 가능성이 높습니다');
    }

    // 정재/편재: 재물운, 사업 수완
    if (dist.정재 >= 2 || dist.편재 >= 2) {
      tenGodsParts.push('재성이 강하여 재물을 관리하고 불리는 사업 수완이 뛰어납니다');
      tenGodsAdvice.push('금융, 사업, 영업 분야에서 재능을 발휘하며 경제적 성공을 이룰 수 있습니다');
    }

    // 정인/편인: 학습능력, 전문성
    if (dist.정인 >= 2 || dist.편인 >= 2) {
      tenGodsParts.push('인성의 힘이 강해 학습능력과 전문성을 갖추는 데 유리합니다');
      tenGodsAdvice.push('연구, 교육, 전문직처럼 깊이있는 지식과 전문성이 요구되는 분야가 적합합니다');
    }

    if (tenGodsParts.length > 0) {
      positiveParts.push(`십성 분석에서 ${tenGodsParts.join('. 또한 ')}.`);
    }
    if (tenGodsAdvice.length > 0) {
      adviceParts.push(tenGodsAdvice.join('. 아울러 ') + '.');
    }

    // 비견/겁재 과다 시 주의사항
    if (dist.비견 + dist.겁재 >= 4) {
      negativeParts.push(
        '비겁이 과다하게 나타나 독립적인 성향은 강하지만 타인과의 협업에서 어려움을 겪을 수 있습니다.'
      );
      adviceParts.push(
        '팀워크 능력을 개발하는 노력을 기울이거나, 혹은 독립 사업을 통해 자신만의 길을 개척하는 것도 좋은 선택이 될 수 있습니다.'
      );
    }
  }

  const score = 70 + (balance.balanced ? 20 : 0) + Math.random() * 10;

  return {
    type: 'career',
    score: Math.floor(score),
    summary: '당신의 사주는 직업 선택에 있어 중요한 힌트를 제공합니다',
    details: {
      positive: positiveParts.length > 0 ? [positiveParts.join(' ')] : [],
      negative: negativeParts.length > 0 ? [negativeParts.join(' ')] : [],
      advice: adviceParts.length > 0 ? [adviceParts.join(' ')] : [],
    },
  };
}

/**
 * 재물운 분석
 */
function analyzeWealthFortune(
  sajuData: SajuData,
  balance: ReturnType<typeof analyzeWuXingBalance>
): FortuneAnalysis {
  const positiveParts: string[] = [];
  const negativeParts: string[] = [];
  const adviceParts: string[] = [];

  // 재성(財星) 분석 - 일간과 극하는 오행
  const dayStemElement = sajuData.day.stemElement;
  const wealthElement: WuXing = getDestroyedElement(dayStemElement);
  const wealthCount = sajuData.wuxingCount[wealthElement];

  if (wealthCount >= 2) {
    positiveParts.push(
      `사주 내 재성(${wealthElement})이 충분히 자리잡고 있어 재물을 모으고 불리는 운이 양호한 편입니다.`
    );
    adviceParts.push(
      '재물운이 뒷받침되는 시기이므로 투자 기회가 찾아올 때 적극적으로 검토하고 도전해보는 것이 좋습니다.'
    );
  } else if (wealthCount === 1) {
    positiveParts.push('재성이 적당히 배치되어 있어 안정적인 재물운을 보이고 있습니다.');
    adviceParts.push(
      '무리한 투자로 위험을 감수하기보다는 꾸준한 저축과 안정적인 재테크를 통해 자산을 축적하는 것이 유리합니다.'
    );
  } else {
    negativeParts.push('사주 내 재성이 부족하여 재물을 모으는 데 어려움이 있을 수 있습니다.');
    adviceParts.push(
      '불필요한 지출을 줄이고 수입원을 다양화하는 노력이 필요하며, 장기적인 재무 계획을 세우는 것이 중요합니다.'
    );
  }

  // 십성 기반 재물운 분석
  if (sajuData.tenGodsDistribution) {
    const dist = sajuData.tenGodsDistribution;
    const tenGodsParts: string[] = [];
    const tenGodsAdvice: string[] = [];

    // 정재: 안정적 재물, 근로소득
    if (dist.정재 >= 2) {
      tenGodsParts.push('정재가 강하게 작용하여 꾸준하고 안정적인 재물운을 가지고 있습니다');
      tenGodsAdvice.push(
        '정기적인 수입원을 확보하고 체계적인 저축 습관을 들이면 탄탄한 재정 기반을 만들 수 있습니다'
      );
    } else if (dist.정재 === 0) {
      negativeParts.push('정재가 없어 안정적이고 지속적인 수입원을 확보하는 데 어려움이 있을 수 있습니다.');
    }

    // 편재: 변동적 재물, 사업수완
    if (dist.편재 >= 2) {
      tenGodsParts.push('편재의 힘이 강해 투자나 사업을 통한 유동적 재물 획득의 가능성이 높습니다');
      tenGodsAdvice.push(
        '적극적으로 투자 기회와 사업 아이템을 모색하되, 리스크 관리와 손절 기준을 명확히 하여 위험에 대비해야 합니다'
      );
    }

    // 식신: 생재(生財), 재물을 만드는 능력
    if (dist.식신 >= 2) {
      tenGodsParts.push('식신이 강하여 스스로 재물을 창출하고 만들어내는 능력이 뛰어납니다');
      tenGodsAdvice.push(
        '창의적인 아이디어나 콘텐츠 제작, 자신만의 특기를 활용한 사업으로 수익을 창출하는 방법을 고려해보세요'
      );
    }

    if (tenGodsParts.length > 0) {
      positiveParts.push(`십성 분석 결과 ${tenGodsParts.join('. 또한 ')}.`);
    }
    if (tenGodsAdvice.length > 0) {
      adviceParts.push(tenGodsAdvice.join('. 아울러 ') + '.');
    }

    // 비견/겁재: 재물 경쟁, 나눔
    if (dist.비견 + dist.겁재 >= 3) {
      if (dist.정재 + dist.편재 === 0) {
        negativeParts.push(
          '비겁은 많지만 재성이 없어 재물을 모으기보다는 나누거나 써야 하는 상황이 많을 수 있습니다.'
        );
        adviceParts.push(
          '다른 사람과의 협업보다는 독립적인 수입원을 개발하고 자신만의 사업 모델을 만드는 데 집중하는 것이 좋습니다.'
        );
      } else {
        negativeParts.push(
          '비겁이 많아 재물을 여러 사람과 나누거나 경쟁 속에서 획득해야 하는 경우가 발생할 수 있습니다.'
        );
        adviceParts.push(
          '재물 관리를 철저히 하고 충동적인 지출이나 불필요한 소비를 자제하여 자산을 보호하는 것이 중요합니다.'
        );
      }
    }
  }

  const score = 50 + wealthCount * 15 + (balance.balanced ? 10 : 0);

  return {
    type: 'wealth',
    score: Math.min(100, score),
    summary: wealthCount >= 2 ? '재물운이 좋은 편입니다' : '재물 관리에 신중함이 필요합니다',
    details: {
      positive: positiveParts.length > 0 ? [positiveParts.join(' ')] : [],
      negative: negativeParts.length > 0 ? [negativeParts.join(' ')] : [],
      advice: adviceParts.length > 0 ? [adviceParts.join(' ')] : [],
    },
  };
}

/**
 * 건강운 분석
 */
function analyzeHealthFortune(
  _sajuData: SajuData,
  balance: ReturnType<typeof analyzeWuXingBalance>
): FortuneAnalysis {
  const positiveParts: string[] = [];
  const negativeParts: string[] = [];
  const adviceParts: string[] = [];

  if (balance.balanced) {
    positiveParts.push(
      '오행의 기운이 조화롭게 균형을 이루고 있어 전반적인 건강운이 양호하며 큰 질병에 대한 저항력도 강한 편입니다.'
    );
    adviceParts.push(
      '건강한 체질을 유지하기 위해 규칙적인 생활 리듬과 적절한 운동, 균형잡힌 식사를 지속하는 것이 중요합니다.'
    );
  } else {
    const strongParts: string[] = [];
    const weakParts: string[] = [];
    const healthAdvice: string[] = [];

    balance.strong.forEach((element) => {
      strongParts.push(`${element} 기운이 과도하게 강하여 관련된 신체 부위나 장기에 부담`);
      healthAdvice.push(getHealthAdvice(element));
    });

    balance.weak.forEach((element) => {
      weakParts.push(`${element} 기운이 약하여 해당 장기의 기능이 저하되거나 취약`);
      healthAdvice.push(`${element} 기운을 보충할 수 있는 음식 섭취와 생활 습관 개선`);
    });

    if (strongParts.length > 0) {
      negativeParts.push(`${strongParts.join('하고, ')}할 수 있으니 주의가 필요합니다.`);
    }
    if (weakParts.length > 0) {
      negativeParts.push(`${weakParts.join('할 수 있으며, ')}할 가능성이 있습니다.`);
    }
    if (healthAdvice.length > 0) {
      adviceParts.push(
        `건강 관리를 위해 ${healthAdvice.join(', ')}에 집중하는 것이 좋습니다. 정기적인 건강 검진을 통해 예방에 힘쓰는 것도 중요합니다.`
      );
    }
  }

  const score = 80 - balance.strong.length * 10 - balance.weak.length * 8;

  return {
    type: 'health',
    score: Math.max(40, score),
    summary: balance.balanced ? '전반적으로 건강한 체질입니다' : '균형잡힌 생활습관이 필요합니다',
    details: {
      positive: positiveParts.length > 0 ? [positiveParts.join(' ')] : [],
      negative: negativeParts.length > 0 ? [negativeParts.join(' ')] : [],
      advice: adviceParts.length > 0 ? [adviceParts.join(' ')] : [],
    },
  };
}

/**
 * 애정운 분석
 */
function analyzeLoveFortune(
  sajuData: SajuData,
  _balance: ReturnType<typeof analyzeWuXingBalance>
): FortuneAnalysis {
  const positiveParts: string[] = [];
  const negativeParts: string[] = [];
  const adviceParts: string[] = [];

  const dayStemElement = sajuData.day.stemElement;

  // 오행별 애정 스타일
  switch (dayStemElement) {
    case '목':
      positiveParts.push(
        '일간의 목(木) 기운으로 따뜻하고 배려심이 깊은 연애 스타일을 가지고 있어 상대방에게 안정감과 위로를 줍니다.'
      );
      adviceParts.push(
        '파트너에게 성장의 기회를 주고 함께 발전해나가는 관계를 만들면 더욱 행복한 사랑을 할 수 있습니다.'
      );
      break;
    case '화':
      positiveParts.push(
        '화(火) 일간의 영향으로 열정적이고 표현이 풍부한 사랑을 하며, 상대방에게 강렬한 인상을 남깁니다.'
      );
      adviceParts.push(
        '때로는 차분하고 절제된 모습도 보여주면 관계가 더욱 깊어지고 오래 지속될 수 있습니다.'
      );
      break;
    case '토':
      positiveParts.push(
        '토(土) 일간으로 안정적이고 헌신적인 관계를 추구하며, 신뢰와 책임감을 바탕으로 사랑을 쌓아갑니다.'
      );
      adviceParts.push(
        '너무 보수적이거나 변화를 두려워하지 말고 가끔은 새로운 시도로 관계에 활력을 불어넣는 것도 좋습니다.'
      );
      break;
    case '금':
      positiveParts.push(
        '금(金) 일간의 특성으로 진지하고 책임감있는 태도로 관계에 임하며, 약속과 신의를 중요시합니다.'
      );
      adviceParts.push(
        '융통성과 여유를 가지고 상대방의 감정을 이해하려는 노력을 기울이면 관계가 더욱 원만해질 것입니다.'
      );
      break;
    case '수':
      positiveParts.push(
        '수(水) 일간으로 깊이있고 지적인 교감을 중시하며, 정신적인 유대감과 이해를 바탕으로 사랑을 키워갑니다.'
      );
      adviceParts.push(
        '생각과 감정을 말로 표현하는 연습을 통해 상대방에게 마음을 더 잘 전달할 수 있도록 노력하세요.'
      );
      break;
  }

  // 십성 기반 애정운 분석
  if (sajuData.tenGodsDistribution) {
    const dist = sajuData.tenGodsDistribution;
    const isMale = sajuData.gender === 'male';
    const spouseParts: string[] = [];
    const spouseAdvice: string[] = [];

    if (isMale) {
      // 남성: 재성(財星)이 배우자
      const spouseCount = dist.정재 + dist.편재;
      if (spouseCount >= 2) {
        spouseParts.push('재성이 자리잡고 있어 이성과의 인연이 좋고 만남의 기회도 많은 편입니다');
        if (dist.정재 >= 1) {
          spouseAdvice.push(
            '정재의 영향으로 안정적이고 진실한 결혼 운을 가지고 있어 좋은 배우자를 만날 가능성이 높습니다'
          );
        }
        if (dist.편재 >= 2) {
          negativeParts.push(
            '편재가 많아 여러 이성과의 인연이 생기기 쉽고 관계가 복잡해질 수 있는 경향이 있습니다.'
          );
          spouseAdvice.push('한 사람에게 집중하고 진심을 다하는 태도가 행복한 결실을 맺는 데 중요합니다');
        }
      } else if (spouseCount === 0) {
        negativeParts.push('재성이 없어 이성과의 인연이 약하거나 만남의 기회가 적을 수 있습니다.');
        spouseAdvice.push(
          '적극적으로 사회활동이나 모임에 참여하여 새로운 만남의 기회를 만들어가는 노력이 필요합니다'
        );
      }
    } else {
      // 여성: 관성(官星)이 배우자
      const spouseCount = dist.정관 + dist.편관;
      if (spouseCount >= 2) {
        spouseParts.push('관성이 있어 좋은 조건과 품성을 갖춘 배우자를 만날 수 있는 운이 있습니다');
        if (dist.정관 >= 1) {
          spouseAdvice.push(
            '정관의 작용으로 안정적이고 존경할 수 있는 배우자와 행복한 결혼 생활을 이어갈 가능성이 높습니다'
          );
        }
        if (dist.편관 >= 2) {
          negativeParts.push(
            '편관이 많아 애정 관계에서 복잡한 상황이 발생하거나 선택의 어려움을 겪을 수 있습니다.'
          );
          spouseAdvice.push('신중하게 상대방을 선택하고 관계를 발전시켜 나가는 것이 중요합니다');
        }
      } else if (spouseCount === 0) {
        negativeParts.push('관성이 없어 배우자를 만나는 시기가 늦어지거나 인연이 약할 수 있습니다.');
        spouseAdvice.push('조급해하지 말고 인내심을 가지고 운명의 인연이 찾아오기를 기다리는 자세가 필요합니다');
      }
    }

    if (spouseParts.length > 0) {
      positiveParts.push(`십성 분석에서 ${spouseParts.join('. 또한 ')}.`);
    }
    if (spouseAdvice.length > 0) {
      adviceParts.push(spouseAdvice.join('. 또한 ') + '.');
    }

    // 식상(食傷) 과다: 배우자성 극함
    if (dist.식신 + dist.상관 >= 4) {
      if (isMale) {
        negativeParts.push(
          '식상이 과다하여 재성을 생하는 효과는 있으나 배우자와의 의견 충돌이나 갈등이 발생할 가능성이 있습니다.'
        );
      } else {
        negativeParts.push(
          '식상이 과다하여 관성을 극하는 작용으로 인해 배우자 인연에 어려움이 있거나 관계 유지에 주의가 필요합니다.'
        );
      }
      adviceParts.push(
        '상대방을 존중하고 이해하려는 마음가짐을 가지며, 배려와 소통을 통해 갈등을 예방하는 노력이 중요합니다.'
      );
    }

    // 비겁(比劫) 과다: 배우자성 경쟁
    if (dist.비견 + dist.겁재 >= 4) {
      negativeParts.push(
        '비겁이 많아 이성 관계에서 경쟁 상황이 발생하거나 애정 문제로 인한 갈등을 겪을 수 있습니다.'
      );
      adviceParts.push(
        '독점욕이나 질투심을 줄이고 상대방의 자유와 개성을 존중하며 신뢰를 바탕으로 관계를 발전시켜 나가세요.'
      );
    }
  }

  const score = 70 + Math.random() * 20;

  return {
    type: 'love',
    score: Math.floor(score),
    summary: '당신만의 독특한 애정 스타일이 있습니다',
    details: {
      positive: positiveParts.length > 0 ? [positiveParts.join(' ')] : [],
      negative: negativeParts.length > 0 ? [negativeParts.join(' ')] : [],
      advice: adviceParts.length > 0 ? [adviceParts.join(' ')] : [],
    },
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

