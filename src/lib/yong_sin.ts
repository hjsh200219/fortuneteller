/**
 * 용신(用神) 선정 시스템
 * 사주의 불균형을 조절하고 운을 개선하는 핵심 오행 분석
 */

import type { SajuData, WuXing } from '../types/index.js';
import { analyzeLeapMonthBirth } from './leap_month_analysis.js';

export interface YongSinAnalysis {
  primaryYongSin: WuXing;        // 주 용신
  secondaryYongSin?: WuXing;     // 보조 용신 (희신의 일부)
  xiSin: WuXing[];               // 희신(喜神) - 용신을 돕는 오행
  jiSin: WuXing[];               // 기신(忌神) - 피해야 할 오행
  chouSin: WuXing[];             // 수신(仇神) - 용신을 극하는 오행
  dayMasterStrength: 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak';
  reasoning: string;              // 용신 선정 이유
  leapMonthAnalysis?: {
    isLeapMonth: boolean;
    specialCharacteristics: string[];
    elementAdjustments: {
      element: WuXing;
      originalStrength: number;
      adjustedStrength: number;
      reason: string;
    }[];
    lifePathInterpretation: string;
    recommendations: string[];
    warnings: string[];
  };
  recommendations: {
    colors: string[];
    directions: string[];
    careers: string[];
    activities: string[];
    cautions: string[];
  };
}

/**
 * 오행별 색상, 방위, 직업 매핑
 */
const WU_XING_ATTRIBUTES: Record<
  WuXing,
  {
    colors: string[];
    directions: string[];
    careers: string[];
    activities: string[];
  }
> = {
  목: {
    colors: ['초록색', '청록색', '연두색'],
    directions: ['동쪽'],
    careers: ['교육', '출판', '섬유', '목재', '종이', '인쇄', '꽃/식물 사업', '환경'],
    activities: ['산책', '등산', '원예', '독서', '글쓰기', '학습'],
  },
  화: {
    colors: ['빨간색', '주황색', '보라색', '분홍색'],
    directions: ['남쪽'],
    careers: ['요리', '전기', '광고', '방송', '예술', '연예', 'IT', '교육', '에너지'],
    activities: ['운동', '사교 활동', '공연 관람', '창작 활동', '여행'],
  },
  토: {
    colors: ['노란색', '갈색', '황토색', '베이지'],
    directions: ['중앙', '남서', '북동'],
    careers: ['건설', '부동산', '농업', '도자기', '중개', '물류', '보관', '컨설팅'],
    activities: ['명상', '요가', '전통 문화', '농사', '부동산 투자', '중재'],
  },
  금: {
    colors: ['흰색', '금색', '은색', '회색'],
    directions: ['서쪽'],
    careers: ['금융', '은행', '회계', '법조', '금속', '기계', '자동차', '정밀 산업'],
    activities: ['금융 투자', '골프', '등산', '정리 정돈', '법률 공부', '계획 수립'],
  },
  수: {
    colors: ['검은색', '남색', '파란색'],
    directions: ['북쪽'],
    careers: ['물류', '유통', '무역', '수산', '음료', '화학', '연구', '의료', '정보통신'],
    activities: ['수영', '낚시', '여행', '연구', '학습', '명상', '휴식'],
  },
};

/**
 * 용신 선정 메인 함수
 */
export function selectYongSin(sajuData: SajuData): YongSinAnalysis {
  // 1. 일간 강약 판단
  const strengthLevel = sajuData.dayMasterStrength?.level || 'medium';
  const dayStemElement = sajuData.day.stemElement;

  let primaryYongSin: WuXing;
  let secondaryYongSin: WuXing | undefined;
  let xiSin: WuXing[] = [];
  let jiSin: WuXing[] = [];
  let chouSin: WuXing[] = [];
  let reasoning = '';

  // 2. 용신 선정 로직
  if (strengthLevel === 'very_strong' || strengthLevel === 'strong') {
    // 일간이 강함 → 설(洩), 극(克)하는 오행이 용신
    // 설기: 일간이 생(生)하는 오행 (식상)
    // 극: 일간을 극(克)하는... 아니 일간이 극하는 오행 (재성)

    // 일간이 강하면: 식상(설), 재성(극), 관살(극)을 용신으로
    const shengElement = getShengElement(dayStemElement); // 일간이 생하는 오행
    const keElement = getKeElement(dayStemElement); // 일간이 극하는 오행

    primaryYongSin = shengElement; // 식상으로 설기
    secondaryYongSin = keElement; // 재성으로 일간의 힘을 빼냄

    xiSin = [shengElement, keElement];
    jiSin = [dayStemElement, getShengMeElement(dayStemElement)]; // 비겁, 인성은 기신
    chouSin = [getShengMeElement(dayStemElement)]; // 인성은 수신(용신을 극함)

    reasoning = `일간(${dayStemElement})이 ${strengthLevel === 'very_strong' ? '매우 ' : ''}강하므로, 일간의 힘을 설(洩)하거나 소모시키는 ${shengElement}(식상)과 ${keElement}(재성)을 용신으로 삼습니다.`;
  } else if (strengthLevel === 'weak' || strengthLevel === 'very_weak') {
    // 일간이 약함 → 생(生)하거나 동일 오행이 용신
    // 생기: 일간을 생(生)하는 오행 (인성)
    // 동일: 일간과 동일 오행 (비겁)

    const shengMeElement = getShengMeElement(dayStemElement); // 일간을 생하는 오행

    primaryYongSin = shengMeElement; // 인성으로 생기
    secondaryYongSin = dayStemElement; // 비겁으로 돕기

    xiSin = [shengMeElement, dayStemElement];
    jiSin = [getKeElement(dayStemElement), getKeMeElement(dayStemElement)]; // 재성, 관살은 기신
    chouSin = [getKeElement(dayStemElement)]; // 재성은 수신(용신인 인성을 극함)

    reasoning = `일간(${dayStemElement})이 ${strengthLevel === 'very_weak' ? '매우 ' : ''}약하므로, 일간을 생(生)하는 ${shengMeElement}(인성)과 일간과 같은 ${dayStemElement}(비겁)을 용신으로 삼습니다.`;
  } else {
    // medium - 중화
    // 중화된 경우는 조후용신(계절 조율)이나 통관용신 사용
    // 간단하게: 약한 오행을 용신으로

    const weakestElement = findWeakestElement(sajuData);
    primaryYongSin = weakestElement;

    xiSin = [weakestElement, getShengElement(weakestElement)];
    jiSin = [getKeElement(weakestElement)];
    chouSin = [getKeMeElement(weakestElement)];

    reasoning = `사주가 중화되어 있으므로, 가장 약한 오행인 ${weakestElement}를 보강하여 균형을 맞춥니다.`;
  }

  // 3. 윤달 출생자 특수 분석
  const leapMonthAnalysis = analyzeLeapMonthBirth(sajuData);

  // 4. 용신 기반 조언 생성 (윤달 분석 반영)
  const recommendations = generateRecommendations(
    primaryYongSin,
    secondaryYongSin,
    jiSin,
    leapMonthAnalysis
  );

  return {
    primaryYongSin,
    secondaryYongSin,
    xiSin,
    jiSin,
    chouSin,
    dayMasterStrength: strengthLevel,
    reasoning,
    leapMonthAnalysis: leapMonthAnalysis || undefined,
    recommendations,
  };
}

/**
 * 오행 상생 관계: A가 B를 생(生)함
 * 목생화, 화생토, 토생금, 금생수, 수생목
 */
function getShengElement(element: WuXing): WuXing {
  const shengMap: Record<WuXing, WuXing> = {
    목: '화',
    화: '토',
    토: '금',
    금: '수',
    수: '목',
  };
  return shengMap[element];
}

/**
 * 나를 생(生)하는 오행
 */
function getShengMeElement(element: WuXing): WuXing {
  const shengMeMap: Record<WuXing, WuXing> = {
    목: '수', // 수생목
    화: '목', // 목생화
    토: '화', // 화생토
    금: '토', // 토생금
    수: '금', // 금생수
  };
  return shengMeMap[element];
}

/**
 * 오행 상극 관계: A가 B를 극(克)함
 * 목극토, 토극수, 수극화, 화극금, 금극목
 */
function getKeElement(element: WuXing): WuXing {
  const keMap: Record<WuXing, WuXing> = {
    목: '토',
    화: '금',
    토: '수',
    금: '목',
    수: '화',
  };
  return keMap[element];
}

/**
 * 나를 극(克)하는 오행
 */
function getKeMeElement(element: WuXing): WuXing {
  const keMeMap: Record<WuXing, WuXing> = {
    목: '금', // 금극목
    화: '수', // 수극화
    토: '목', // 목극토
    금: '화', // 화극금
    수: '토', // 토극수
  };
  return keMeMap[element];
}

/**
 * 가장 약한 오행 찾기
 */
function findWeakestElement(sajuData: SajuData): WuXing {
  const wuxingCount = sajuData.wuxingCount;

  let weakestElement: WuXing = '목';
  let minCount = wuxingCount['목'];

  for (const [element, count] of Object.entries(wuxingCount) as [WuXing, number][]) {
    if (count < minCount) {
      minCount = count;
      weakestElement = element;
    }
  }

  return weakestElement;
}

/**
 * 용신 기반 조언 생성 (윤달 분석 반영)
 */
function generateRecommendations(
  primaryYongSin: WuXing,
  secondaryYongSin: WuXing | undefined,
  jiSin: WuXing[],
  leapMonthAnalysis?: {
    isLeapMonth: boolean;
    specialCharacteristics: string[];
    elementAdjustments: {
      element: WuXing;
      originalStrength: number;
      adjustedStrength: number;
      reason: string;
    }[];
    lifePathInterpretation: string;
    recommendations: string[];
    warnings: string[];
  } | null
): YongSinAnalysis['recommendations'] {
  const primary = WU_XING_ATTRIBUTES[primaryYongSin];
  const secondary = secondaryYongSin ? WU_XING_ATTRIBUTES[secondaryYongSin] : null;

  // 기신(피해야 할 오행)의 속성
  const cautionAttributes = jiSin.map((element) => WU_XING_ATTRIBUTES[element]);

  const colors = [...primary.colors];
  const directions = [...primary.directions];
  const careers = [...primary.careers];
  const activities = [...primary.activities];

  if (secondary) {
    colors.push(...secondary.colors.slice(0, 2));
    directions.push(...secondary.directions.slice(0, 1));
    careers.push(...secondary.careers.slice(0, 3));
    activities.push(...secondary.activities.slice(0, 2));
  }

  // 기신 속성으로 주의사항 생성
  const cautions: string[] = [];

  cautionAttributes.forEach((attr, index) => {
    cautions.push(`${jiSin[index]} 오행(${attr.colors.join(', ')})은 피하세요`);
    cautions.push(`${attr.directions.join(', ')} 방향 이동은 신중하게`);
  });

  // 윤달 출생자인 경우 추가 주의사항
  if (leapMonthAnalysis && leapMonthAnalysis.isLeapMonth) {
    cautions.push(...leapMonthAnalysis.warnings.slice(0, 2));
  }

  return {
    colors: [...new Set(colors)].slice(0, 5),
    directions: [...new Set(directions)].slice(0, 3),
    careers: [...new Set(careers)].slice(0, 8),
    activities: [...new Set(activities)].slice(0, 6),
    cautions: cautions.slice(0, 6),
  };
}

/**
 * 용신 기반 조언 텍스트 생성 (윤달 분석 포함)
 */
export function generateYongSinAdvice(yongSin: YongSinAnalysis): string[] {
  const advice: string[] = [];

  advice.push(`주 용신은 ${yongSin.primaryYongSin} 오행입니다. ${yongSin.reasoning}`);

  // 윤달 출생자 특성 추가
  if (yongSin.leapMonthAnalysis && yongSin.leapMonthAnalysis.isLeapMonth) {
    advice.push(`\n🌙 윤달 출생자 특성:`);
    advice.push(yongSin.leapMonthAnalysis.lifePathInterpretation);

    if (yongSin.leapMonthAnalysis.specialCharacteristics.length > 0) {
      advice.push(
        `특별한 성향: ${yongSin.leapMonthAnalysis.specialCharacteristics.slice(0, 2).join('. ')}`
      );
    }

    if (yongSin.leapMonthAnalysis.elementAdjustments.length > 0) {
      const adjustment = yongSin.leapMonthAnalysis.elementAdjustments[0];
      if (adjustment) {
        advice.push(
          `오행 조정: ${adjustment.element} ${adjustment.originalStrength} → ${adjustment.adjustedStrength} (${adjustment.reason})`
        );
      }
    }
  }

  if (yongSin.recommendations.colors.length > 0) {
    advice.push(
      `길한 색상: ${yongSin.recommendations.colors.slice(0, 3).join(', ')}을 활용하세요`
    );
  }

  if (yongSin.recommendations.directions.length > 0) {
    advice.push(
      `유리한 방향: ${yongSin.recommendations.directions.join(', ')} 방향이 길합니다`
    );
  }

  if (yongSin.recommendations.careers.length > 0) {
    advice.push(
      `적합한 직업: ${yongSin.recommendations.careers.slice(0, 4).join(', ')} 등`
    );
  }

  if (yongSin.recommendations.activities.length > 0) {
    advice.push(
      `권장 활동: ${yongSin.recommendations.activities.slice(0, 3).join(', ')} 등`
    );
  }

  if (yongSin.recommendations.cautions.length > 0) {
    advice.push(`주의사항: ${yongSin.recommendations.cautions[0]}`);
  }

  // 윤달 출생자 권장사항 추가
  if (yongSin.leapMonthAnalysis && yongSin.leapMonthAnalysis.isLeapMonth) {
    if (yongSin.leapMonthAnalysis.recommendations.length > 0) {
      advice.push(
        `윤달 특별 권장: ${yongSin.leapMonthAnalysis.recommendations.slice(0, 2).join('. ')}`
      );
    }
  }

  return advice;
}
