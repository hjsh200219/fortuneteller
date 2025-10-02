/**
 * 십성(十星) 계산 및 해석 로직
 * 일간(日干)을 기준으로 다른 천간·지지와의 관계를 10가지로 분류
 */

import type { HeavenlyStem, TenGod, SajuData, TenGodInterpretation } from '../types/index.js';
import { getHeavenlyStemByKorean } from '../data/heavenly_stems.js';
import { WUXING_GENERATION, WUXING_DESTRUCTION } from '../data/wuxing.js';

/**
 * 십성 데이터 (이름, 한자, 의미)
 */
export interface TenGodData {
  name: TenGod;
  hanja: string;
  category: 'self' | 'output' | 'wealth' | 'power' | 'resource';
  meaning: string[];
  represents: string[];
}

export const TEN_GODS_DATA: Record<TenGod, TenGodData> = {
  비견: {
    name: '비견',
    hanja: '比肩',
    category: 'self',
    meaning: ['형제', '친구', '동료', '경쟁자'],
    represents: ['자립심', '독립성', '경쟁심', '자존심'],
  },
  겁재: {
    name: '겁재',
    hanja: '劫財',
    category: 'self',
    meaning: ['형제', '동업자', '경쟁자', '라이벌'],
    represents: ['경쟁', '분쟁', '손재', '협력'],
  },
  식신: {
    name: '식신',
    hanja: '食神',
    category: 'output',
    meaning: ['표현력', '재능', '자녀', '여유'],
    represents: ['창의성', '예술', '복', '향유'],
  },
  상관: {
    name: '상관',
    hanja: '傷官',
    category: 'output',
    meaning: ['재능', '기술', '표현', '반항'],
    represents: ['창의력', '비판', '개혁', '자유'],
  },
  편재: {
    name: '편재',
    hanja: '偏財',
    category: 'wealth',
    meaning: ['유동재산', '아버지', '사업', '외부활동'],
    represents: ['사교성', '활동성', '재물운', '다재다능'],
  },
  정재: {
    name: '정재',
    hanja: '正財',
    category: 'wealth',
    meaning: ['고정재산', '아내(남)', '현실', '근면'],
    represents: ['안정', '성실', '신용', '근검'],
  },
  편관: {
    name: '편관',
    hanja: '偏官',
    category: 'power',
    meaning: ['권력', '명예', '압박', '도전'],
    represents: ['추진력', '과감함', '위험', '경쟁'],
  },
  정관: {
    name: '정관',
    hanja: '正官',
    category: 'power',
    meaning: ['직장', '명예', '남편(여)', '규율'],
    represents: ['책임감', '정직', '안정', '보수'],
  },
  편인: {
    name: '편인',
    hanja: '偏印',
    category: 'resource',
    meaning: ['비정규학문', '계모', '특수재능', '종교'],
    represents: ['독특함', '영감', '직관', '신비'],
  },
  정인: {
    name: '정인',
    hanja: '正印',
    category: 'resource',
    meaning: ['학문', '어머니', '지식', '명예'],
    represents: ['학습', '보호', '안정', '신용'],
  },
};

/**
 * 일간과 대상 천간을 비교하여 십성 판단
 */
export function calculateTenGod(dayStem: HeavenlyStem, targetStem: HeavenlyStem): TenGod {
  // 일간과 대상의 오행 및 음양 가져오기
  const dayData = getHeavenlyStemByKorean(dayStem);
  const targetData = getHeavenlyStemByKorean(targetStem);

  if (!dayData || !targetData) {
    throw new Error(`천간 데이터를 찾을 수 없습니다: ${dayStem}, ${targetStem}`);
  }

  const dayElement = dayData.element;
  const dayYinYang = dayData.yinYang;
  const targetElement = targetData.element;
  const targetYinYang = targetData.yinYang;

  // 1. 같은 오행
  if (dayElement === targetElement) {
    return dayYinYang === targetYinYang ? '비견' : '겁재';
  }

  // 2. 일간이 생(生)하는 오행 - 식신/상관
  if (WUXING_GENERATION[dayElement] === targetElement) {
    return dayYinYang === targetYinYang ? '식신' : '상관';
  }

  // 3. 일간이 극(克)하는 오행 - 편재/정재
  if (WUXING_DESTRUCTION[dayElement] === targetElement) {
    return dayYinYang === targetYinYang ? '편재' : '정재';
  }

  // 4. 일간을 극(克)하는 오행 - 편관/정관
  if (WUXING_DESTRUCTION[targetElement] === dayElement) {
    return dayYinYang === targetYinYang ? '편관' : '정관';
  }

  // 5. 일간을 생(生)하는 오행 - 편인/정인
  if (WUXING_GENERATION[targetElement] === dayElement) {
    return dayYinYang === targetYinYang ? '편인' : '정인';
  }

  // 이론적으로 여기 도달하면 안됨
  throw new Error(`십성 계산 오류: ${dayStem}(${dayElement}) - ${targetStem}(${targetElement})`);
}

/**
 * 사주 전체의 십성 분포 계산 (지장간 세력 반영)
 */
export function calculateTenGodsDistribution(sajuData: SajuData): Record<TenGod, number> {
  const distribution: Record<TenGod, number> = {
    비견: 0,
    겁재: 0,
    식신: 0,
    상관: 0,
    편재: 0,
    정재: 0,
    편관: 0,
    정관: 0,
    편인: 0,
    정인: 0,
  };

  const dayStem = sajuData.day.stem;

  // 연주, 월주, 시주의 천간 (일주 제외)
  const stems = [sajuData.year.stem, sajuData.month.stem, sajuData.hour.stem];

  stems.forEach((stem) => {
    if (stem !== dayStem) {
      // 일간과 다른 천간만 계산
      const tenGod = calculateTenGod(dayStem, stem);
      distribution[tenGod]++;
    }
  });

  // 지장간 세력을 직접 반영
  if (sajuData.jiJangGan) {
    const pillars = ['year', 'month', 'day', 'hour'] as const;

    pillars.forEach((pillar) => {
      const jiJangGan = sajuData.jiJangGan?.[pillar];
      if (!jiJangGan) return;

      // 정기(正氣) - 주 지장간
      if (jiJangGan.primary && jiJangGan.primary.stem !== dayStem) {
        const tenGod = calculateTenGod(dayStem, jiJangGan.primary.stem);
        // 세력을 백분율로 변환하여 가중치로 사용 (0-1 범위)
        distribution[tenGod] += jiJangGan.primary.strength / 100;
      }

      // 중기(中氣) - 보조 지장간
      if (jiJangGan.secondary && jiJangGan.secondary.stem !== dayStem) {
        const tenGod = calculateTenGod(dayStem, jiJangGan.secondary.stem);
        distribution[tenGod] += jiJangGan.secondary.strength / 100;
      }

      // 여기(餘氣) - 잔여 지장간
      if (jiJangGan.residual && jiJangGan.residual.stem !== dayStem) {
        const tenGod = calculateTenGod(dayStem, jiJangGan.residual.stem);
        distribution[tenGod] += jiJangGan.residual.strength / 100;
      }
    });
  } else {
    // 지장간 정보가 없을 경우 기존 방식 (0.5 가중치)
    const branches = [
      sajuData.year.branch,
      sajuData.month.branch,
      sajuData.day.branch,
      sajuData.hour.branch,
    ];

    branches.forEach((branch) => {
      const branchStem = mapBranchToStem(branch);
      if (branchStem && branchStem !== dayStem) {
        const tenGod = calculateTenGod(dayStem, branchStem);
        distribution[tenGod] += 0.5;
      }
    });
  }

  return distribution;
}

/**
 * 지지를 대표 천간으로 매핑 (간단 버전)
 * TODO: 지장간 구현 시 상세화
 */
function mapBranchToStem(branch: string): HeavenlyStem | null {
  const mapping: Record<string, HeavenlyStem> = {
    자: '계',
    축: '기',
    인: '갑',
    묘: '을',
    진: '무',
    사: '병',
    오: '정',
    미: '기',
    신: '경',
    유: '신',
    술: '무',
    해: '임',
  };
  return mapping[branch] || null;
}

/**
 * 십성 목록 생성 (사주 8자 각각의 십성)
 */
export function generateTenGodsList(sajuData: SajuData): TenGod[] {
  const dayStem = sajuData.day.stem;
  const tenGods: TenGod[] = [];

  // 연주 천간
  if (sajuData.year.stem !== dayStem) {
    tenGods.push(calculateTenGod(dayStem, sajuData.year.stem));
  } else {
    tenGods.push('비견'); // 일간과 같으면 비견
  }

  // 월주 천간
  if (sajuData.month.stem !== dayStem) {
    tenGods.push(calculateTenGod(dayStem, sajuData.month.stem));
  } else {
    tenGods.push('비견');
  }

  // 일주 천간 (자기 자신이므로 비견)
  tenGods.push('비견');

  // 시주 천간
  if (sajuData.hour.stem !== dayStem) {
    tenGods.push(calculateTenGod(dayStem, sajuData.hour.stem));
  } else {
    tenGods.push('비견');
  }

  // 지지는 생략 또는 간단히 추가 가능
  return tenGods;
}

/**
 * 십성 개수에 따른 강도 판단
 */
function getIntensity(count: number): 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak' {
  if (count >= 3) return 'very_strong';
  if (count >= 1.5) return 'strong';
  if (count >= 0.8) return 'moderate';
  if (count > 0) return 'weak';
  return 'very_weak';
}

/**
 * 강도에 따른 수식어 반환
 */
function getIntensityModifier(intensity: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak'): string {
  switch (intensity) {
    case 'very_strong':
      return '매우 강한';
    case 'strong':
      return '강한';
    case 'moderate':
      return '적당한';
    case 'weak':
      return '약간의';
    case 'very_weak':
      return '매우 약한';
  }
}

/**
 * 십성별 의미 해석 (연속적 범위 반영)
 */
export function interpretTenGod(tenGod: TenGod, count: number): TenGodInterpretation {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const advice: string[] = [];
  const intensity = getIntensity(count);
  const modifier = getIntensityModifier(intensity);

  // 십성별 해석
  switch (tenGod) {
    case '비견':
      if (count >= 1.5) {
        strengths.push(`${modifier} 자립심과 독립성을 가지고 있습니다`);
        if (count >= 3) {
          strengths.push('강력한 목표 지향성과 끈기가 있습니다');
          weaknesses.push('고집이 매우 세고 타협을 어려워할 수 있습니다');
          advice.push('협력과 타협의 중요성을 인식하고 유연성을 기르세요');
        } else {
          strengths.push('목표 지향적이며 끈기가 있습니다');
          weaknesses.push('고집이 세고 타협을 어려워할 수 있습니다');
          advice.push('협력과 타협의 중요성을 인식하세요');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 자존심과 자립심이 있습니다`);
        advice.push('자신감을 유지하며 타인과 균형있게 지내세요');
      } else {
        weaknesses.push('의지력이나 추진력이 약할 수 있습니다');
        advice.push('자신감을 키우고 주도성을 발휘하세요');
      }
      break;

    case '겁재':
      if (count >= 1.5) {
        strengths.push(`${modifier} 협력과 팀워크 능력이 있습니다`);
        if (count >= 3) {
          weaknesses.push('재물 손실이나 과도한 경쟁 상황에 주의가 필요합니다');
          advice.push('재물 관리에 매우 신중하고 경쟁보다는 협력을 택하세요');
        } else {
          weaknesses.push('재물 손실이나 경쟁 상황이 있을 수 있습니다');
          advice.push('재물 관리에 신중하고 경쟁보다는 협력을 택하세요');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 경쟁심과 협력심이 있습니다`);
      }
      break;

    case '식신':
      if (count >= 1.5) {
        strengths.push(`${modifier} 창의력과 예술적 재능이 있습니다`);
        if (count >= 3) {
          strengths.push('매우 여유롭고 낙천적인 성격입니다');
          advice.push('창작 활동이나 서비스업에서 뛰어난 재능을 발휘할 수 있습니다');
        } else {
          strengths.push('여유롭고 낙천적인 성격입니다');
          advice.push('창작 활동이나 서비스업에 적합합니다');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 표현력과 창의성이 있습니다`);
      } else {
        weaknesses.push('창의력이나 표현력이 부족할 수 있습니다');
        advice.push('예술이나 취미 활동을 통해 표현력을 키우세요');
      }
      break;

    case '상관':
      if (count >= 1.5) {
        strengths.push(`${modifier} 재능과 비판적 사고력이 있습니다`);
        if (count >= 3) {
          strengths.push('매우 개혁적이고 자유로운 사고를 합니다');
          weaknesses.push('권위에 매우 반항적이거나 비판적일 수 있습니다');
          advice.push('탁월한 재능을 긍정적으로 활용하고 조화를 추구하세요');
        } else {
          strengths.push('개혁적이고 자유로운 사고를 합니다');
          weaknesses.push('권위에 반항적이거나 비판적일 수 있습니다');
          advice.push('재능을 긍정적으로 활용하고 조화를 추구하세요');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 비판력과 개혁 성향이 있습니다`);
      }
      break;

    case '편재':
      if (count >= 1.5) {
        strengths.push(`${modifier} 사교적이고 활동적인 재물운이 있습니다`);
        if (count >= 3) {
          strengths.push('매우 다양한 사업 기회를 만들 수 있습니다');
          advice.push('사업이나 영업직에서 탁월한 능력을 발휘할 수 있습니다');
        } else {
          strengths.push('다양한 사업 기회를 만들 수 있습니다');
          advice.push('사업이나 영업직에 적합합니다');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 재물운과 사교성이 있습니다`);
      } else {
        weaknesses.push('재물운이 약하거나 소극적일 수 있습니다');
        advice.push('적극적인 재물 활동을 하세요');
      }
      break;

    case '정재':
      if (count >= 1.5) {
        strengths.push(`${modifier} 성실하고 근면한 재물 관리 능력이 있습니다`);
        if (count >= 3) {
          strengths.push('매우 안정적인 수입원을 확보합니다');
          advice.push('정직하고 꾸준한 직업에서 큰 성공을 거둘 수 있습니다');
        } else {
          strengths.push('안정적인 수입원을 확보합니다');
          advice.push('정직하고 꾸준한 직업이 유리합니다');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 균형잡힌 재물운이 있습니다`);
      }
      break;

    case '편관':
      if (count >= 1.5) {
        strengths.push(`${modifier} 추진력과 결단력이 있습니다`);
        if (count >= 3) {
          weaknesses.push('과도한 스트레스나 압박감이 있을 수 있습니다');
          advice.push('강한 에너지를 긍정적으로 활용하고 휴식과 균형을 유지하세요');
        } else {
          weaknesses.push('스트레스나 압박감이 있을 수 있습니다');
          advice.push('에너지를 긍정적으로 활용하세요');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 권위와 추진력이 있습니다`);
      }
      break;

    case '정관':
      if (count >= 1.5) {
        strengths.push(`${modifier} 책임감이 있고 질서를 중시합니다`);
        if (count >= 3) {
          strengths.push('조직생활에 매우 적합합니다');
          advice.push('공무원이나 대기업 관리직으로 큰 성공을 거둘 수 있습니다');
        } else {
          strengths.push('조직생활에 적합합니다');
          advice.push('공무원이나 대기업 직장인으로 적합합니다');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 책임감과 규율이 있습니다`);
      } else {
        weaknesses.push('권위나 책임감이 부족할 수 있습니다');
        advice.push('책임감을 기르고 조직 활동에 참여하세요');
      }
      break;

    case '편인':
      if (count >= 1.5) {
        strengths.push(`${modifier} 독창적이고 직관적인 사고를 합니다`);
        if (count >= 3) {
          strengths.push('특수 분야나 종교·철학에 매우 깊은 관심이 있습니다');
          advice.push('전문적이고 독특한 분야에서 탁월한 재능을 발휘할 수 있습니다');
        } else {
          strengths.push('특수 분야나 종교·철학에 관심이 많습니다');
          advice.push('전문적이고 독특한 분야에서 재능을 발휘하세요');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 직관력과 학습력이 있습니다`);
      }
      break;

    case '정인':
      if (count >= 1.5) {
        strengths.push(`${modifier} 학문적 재능과 명예운이 있습니다`);
        if (count >= 3) {
          strengths.push('보호받고 도움받는 운이 매우 강합니다');
          advice.push('학업이나 연구 분야에서 큰 성공을 거둘 수 있습니다');
        } else {
          strengths.push('보호받고 도움받는 운이 있습니다');
          advice.push('학업이나 연구 분야에서 성공할 수 있습니다');
        }
      } else if (count >= 0.5) {
        strengths.push(`${modifier} 학습력과 지혜가 있습니다`);
      } else {
        weaknesses.push('학습 의욕이나 보호운이 약할 수 있습니다');
        advice.push('꾸준한 학습과 자기개발을 하세요');
      }
      break;
  }

  return {
    tenGod,
    count,
    intensity,
    strengths,
    weaknesses,
    advice,
  };
}

/**
 * 사주의 모든 십성 해석
 */
export function interpretAllTenGods(distribution: Record<TenGod, number>): TenGodInterpretation[] {
  const interpretations: TenGodInterpretation[] = [];

  for (const [tenGod, count] of Object.entries(distribution) as [TenGod, number][]) {
    if (count > 0) {
      const interpretation = interpretTenGod(tenGod, count);
      interpretations.push(interpretation);
    }
  }

  return interpretations;
}
