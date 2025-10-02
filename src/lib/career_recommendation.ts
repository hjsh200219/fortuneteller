/**
 * 직업 추천 시스템 (Career Recommendation)
 *
 * 용신, 오행 균형, 십성 분석을 기반으로 적합한 직업을 추천합니다.
 */

import type { SajuData, WuXing, HeavenlyStem, TenGod } from '../types/index.js';

/**
 * 직업 카테고리
 */
export type CareerCategory =
  | '경영/관리'
  | '금융/재무'
  | '법률/행정'
  | '교육/연구'
  | '예술/문화'
  | '의료/보건'
  | 'IT/기술'
  | '제조/생산'
  | '서비스/영업'
  | '언론/미디어'
  | '건설/부동산'
  | '농업/환경'
  | '종교/상담'
  | '안전/보안';

/**
 * 직업 추천 결과
 */
export interface CareerRecommendation {
  /** 추천 직업 목록 (우선순위 순) */
  recommendations: {
    category: CareerCategory;
    score: number; // 0-100
    specificJobs: string[];
    reason: string;
    yongsinAlignment: string; // 용신과의 관계
    strength: '매우 적합' | '적합' | '보통' | '부적합';
  }[];

  /** 피해야 할 직업 */
  jobsToAvoid: {
    category: CareerCategory;
    reason: string;
    alternativeSuggestion: string;
  }[];

  /** 오행별 직업 적성 */
  elementalAffinity: {
    element: WuXing;
    affinity: number; // 0-100
    careers: string[];
  }[];

  /** 경력 개발 조언 */
  careerAdvice: {
    earlyCareer: string[]; // 초기 경력 (20-30대)
    midCareer: string[]; // 중기 경력 (40-50대)
    lateCareer: string[]; // 후기 경력 (60대 이상)
    entrepreneurship: string; // 창업 적성
  };

  /** 직장 환경 선호도 */
  workEnvironment: {
    preferredSize: '대기업' | '중견기업' | '중소기업' | '스타트업' | '자영업';
    workStyle: '독립형' | '협업형' | '혼합형';
    leadership: '리더십 강함' | '리더십 보통' | '팔로워십 강함';
    stability: '안정 추구형' | '도전 추구형' | '균형형';
  };

  /** 종합 평가 */
  summary: string;
}

/**
 * 오행별 직업 매핑
 */
const ELEMENT_CAREERS: Record<WuXing, { categories: CareerCategory[]; jobs: string[] }> = {
  '목': {
    categories: ['교육/연구', '예술/문화', '의료/보건', '농업/환경'],
    jobs: [
      '교사', '교수', '연구원', '작가', '예술가', '디자이너',
      '한의사', '약사', '상담사', '조경사', '농부', '환경운동가',
      '출판 편집자', '큐레이터', '원예사', '산림 관리자'
    ],
  },
  '화': {
    categories: ['언론/미디어', '예술/문화', 'IT/기술', '서비스/영업'],
    jobs: [
      '방송인', '기자', '마케터', '광고 기획자', '배우', '가수',
      '프로그래머', '디지털 마케터', '영업사원', '강사', 'MC',
      '유튜버', '인플루언서', '이벤트 기획자', '홍보 담당자'
    ],
  },
  '토': {
    categories: ['건설/부동산', '경영/관리', '금융/재무', '농업/환경'],
    jobs: [
      '부동산 중개인', '건축가', '토목 기사', 'CEO', '경영 컨설턴트',
      '회계사', '세무사', '은행원', '농업 경영인', '부동산 개발자',
      '자산 관리사', '감정평가사', '도시 계획가', '물류 관리자'
    ],
  },
  '금': {
    categories: ['금융/재무', '법률/행정', '안전/보안', '제조/생산'],
    jobs: [
      '변호사', '검사', '판사', '경찰', '군인', '금융 애널리스트',
      '투자 전문가', '공무원', '회계사', '감사', '기계 기술자',
      '금속 가공업자', '보안 전문가', '품질 관리자', '법무사'
    ],
  },
  '수': {
    categories: ['IT/기술', '의료/보건', '종교/상담', '서비스/영업'],
    jobs: [
      '의사', '간호사', '약사', '수의사', '심리 상담사', '철학자',
      'IT 개발자', '데이터 과학자', '연구원', '물류 관리자',
      '종교인', '명리학자', '작가', '번역가', '수산업자', '바리스타'
    ],
  },
} as const;

/**
 * 십성별 직업 특성 및 적합 직군
 */
interface TenGodCareerProfile {
  // 기본 특성 (0-100)
  leadership: number; // 리더십
  independence: number; // 독립성
  creativity: number; // 창의성
  stability: number; // 안정성 추구
  communication: number; // 소통능력
  analytical: number; // 분석력
  execution: number; // 실행력
  innovation: number; // 혁신성

  // 적합 직군
  suitableCategories: CareerCategory[];

  // 직업 스타일
  workStyle: '독립형' | '협업형' | '혼합형';

  // 창업 적성 (0-100)
  entrepreneurship: number;

  // 특징
  characteristics: string[];
}

const TEN_GODS_CAREER_PROFILES: Record<TenGod, TenGodCareerProfile> = {
  '비견': {
    leadership: 60,
    independence: 85,
    creativity: 50,
    stability: 60,
    communication: 55,
    analytical: 60,
    execution: 75,
    innovation: 50,
    suitableCategories: ['경영/관리', '제조/생산', '건설/부동산', '서비스/영업'],
    workStyle: '독립형',
    entrepreneurship: 75,
    characteristics: [
      '자립심이 강하고 독립적',
      '경쟁 상황에서 능력 발휘',
      '동업보다는 단독 경영 선호',
      '자영업 성공 가능성 높음'
    ],
  },
  '겁재': {
    leadership: 70,
    independence: 90,
    creativity: 60,
    stability: 40,
    communication: 65,
    analytical: 55,
    execution: 85,
    innovation: 65,
    suitableCategories: ['경영/관리', '서비스/영업', '언론/미디어', 'IT/기술'],
    workStyle: '혼합형',
    entrepreneurship: 85,
    characteristics: [
      '추진력과 행동력이 뛰어남',
      '빠른 의사결정과 실행',
      '위험 감수하는 성향',
      '동업은 신중하게 접근 필요'
    ],
  },
  '식신': {
    leadership: 40,
    independence: 70,
    creativity: 90,
    stability: 50,
    communication: 80,
    analytical: 60,
    execution: 65,
    innovation: 75,
    suitableCategories: ['예술/문화', '교육/연구', '서비스/영업', '언론/미디어'],
    workStyle: '독립형',
    entrepreneurship: 70,
    characteristics: [
      '창의력과 표현력이 뛰어남',
      '예술적 감각 우수',
      '여유롭고 안정적인 성향',
      '인간관계 원만'
    ],
  },
  '상관': {
    leadership: 50,
    independence: 85,
    creativity: 95,
    stability: 30,
    communication: 85,
    analytical: 75,
    execution: 70,
    innovation: 95,
    suitableCategories: ['예술/문화', 'IT/기술', '언론/미디어', '교육/연구'],
    workStyle: '독립형',
    entrepreneurship: 80,
    characteristics: [
      '탁월한 창의성과 기술력',
      '독특하고 혁신적인 아이디어',
      '기존 틀을 깨는 성향',
      '전문 기술직 적합'
    ],
  },
  '편재': {
    leadership: 70,
    independence: 65,
    creativity: 60,
    stability: 50,
    communication: 85,
    analytical: 70,
    execution: 80,
    innovation: 65,
    suitableCategories: ['금융/재무', '서비스/영업', '경영/관리', '건설/부동산'],
    workStyle: '혼합형',
    entrepreneurship: 90,
    characteristics: [
      '사교성과 활동성이 뛰어남',
      '재물 운용 능력 우수',
      '다양한 사업 기회 포착',
      '유동적 재산 관리 능력'
    ],
  },
  '정재': {
    leadership: 50,
    independence: 40,
    creativity: 40,
    stability: 90,
    communication: 60,
    analytical: 75,
    execution: 85,
    innovation: 40,
    suitableCategories: ['금융/재무', '경영/관리', '법률/행정', '제조/생산'],
    workStyle: '협업형',
    entrepreneurship: 50,
    characteristics: [
      '성실하고 근면함',
      '안정적 재산 축적',
      '체계적이고 계획적',
      '정규직 근무 적합'
    ],
  },
  '편관': {
    leadership: 90,
    independence: 75,
    creativity: 50,
    stability: 60,
    communication: 70,
    analytical: 80,
    execution: 90,
    innovation: 60,
    suitableCategories: ['법률/행정', '안전/보안', '경영/관리'],
    workStyle: '혼합형',
    entrepreneurship: 75,
    characteristics: [
      '강력한 추진력과 결단력',
      '권력과 명예 지향',
      '도전적이고 과감함',
      '경쟁 환경에서 강점 발휘'
    ],
  },
  '정관': {
    leadership: 80,
    independence: 50,
    creativity: 40,
    stability: 85,
    communication: 75,
    analytical: 85,
    execution: 80,
    innovation: 45,
    suitableCategories: ['법률/행정', '경영/관리', '교육/연구', '의료/보건'],
    workStyle: '협업형',
    entrepreneurship: 45,
    characteristics: [
      '책임감이 강하고 정직함',
      '규칙과 원칙 준수',
      '명예와 지위 중시',
      '조직 생활 적합'
    ],
  },
  '편인': {
    leadership: 40,
    independence: 65,
    creativity: 85,
    stability: 70,
    communication: 55,
    analytical: 90,
    execution: 60,
    innovation: 85,
    suitableCategories: ['교육/연구', 'IT/기술', '종교/상담', '예술/문화'],
    workStyle: '독립형',
    entrepreneurship: 60,
    characteristics: [
      '독특하고 깊이 있는 사고',
      '비주류 학문과 기술',
      '직관력과 영감 뛰어남',
      '전문 연구직 적합'
    ],
  },
  '정인': {
    leadership: 50,
    independence: 50,
    creativity: 70,
    stability: 90,
    communication: 70,
    analytical: 85,
    execution: 70,
    innovation: 60,
    suitableCategories: ['교육/연구', '의료/보건', '법률/행정', '경영/관리'],
    workStyle: '협업형',
    entrepreneurship: 40,
    characteristics: [
      '학습 능력과 지적 능력 우수',
      '안정적이고 신중함',
      '보호와 양육 성향',
      '학문과 교육 분야 적합'
    ],
  },
} as const;

/**
 * 십성 직업 분석 결과
 */
interface TenGodsCareerAnalysis {
  dominantTenGod: TenGod; // 가장 강한 십성
  dominantProfile: TenGodCareerProfile;
  averageTraits: {
    leadership: number;
    independence: number;
    creativity: number;
    stability: number;
    communication: number;
    analytical: number;
    execution: number;
    innovation: number;
  };
  workStyle: '독립형' | '협업형' | '혼합형';
  entrepreneurship: number;
  suitableCategories: CareerCategory[];
}

/**
 * 사주의 십성 분포를 분석하여 직업 특성 도출
 */
function analyzeTenGodsCareer(saju: SajuData): TenGodsCareerAnalysis {
  const distribution = saju.tenGodsDistribution || {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0,
    정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0,
  };

  // 가장 강한 십성 찾기
  let maxCount = 0;
  let dominantTenGod: TenGod = '비견';

  (Object.keys(distribution) as TenGod[]).forEach((tenGod) => {
    if (distribution[tenGod] > maxCount) {
      maxCount = distribution[tenGod];
      dominantTenGod = tenGod;
    }
  });

  const dominantProfile = TEN_GODS_CAREER_PROFILES[dominantTenGod];

  // 모든 십성의 가중 평균 계산
  let totalCount = 0;
  const avgTraits = {
    leadership: 0,
    independence: 0,
    creativity: 0,
    stability: 0,
    communication: 0,
    analytical: 0,
    execution: 0,
    innovation: 0,
  };

  (Object.keys(distribution) as TenGod[]).forEach((tenGod) => {
    const count = distribution[tenGod];
    if (count > 0) {
      const profile = TEN_GODS_CAREER_PROFILES[tenGod];
      totalCount += count;
      avgTraits.leadership += profile.leadership * count;
      avgTraits.independence += profile.independence * count;
      avgTraits.creativity += profile.creativity * count;
      avgTraits.stability += profile.stability * count;
      avgTraits.communication += profile.communication * count;
      avgTraits.analytical += profile.analytical * count;
      avgTraits.execution += profile.execution * count;
      avgTraits.innovation += profile.innovation * count;
    }
  });

  if (totalCount > 0) {
    Object.keys(avgTraits).forEach((key) => {
      avgTraits[key as keyof typeof avgTraits] /= totalCount;
    });
  }

  // 업무 스타일 결정
  let workStyle: '독립형' | '협업형' | '혼합형';
  if (avgTraits.independence > 70) {
    workStyle = '독립형';
  } else if (avgTraits.independence < 50) {
    workStyle = '협업형';
  } else {
    workStyle = '혼합형';
  }

  // 창업 적성 계산
  let entrepreneurship = 0;
  (Object.keys(distribution) as TenGod[]).forEach((tenGod) => {
    const count = distribution[tenGod];
    if (count > 0) {
      entrepreneurship += TEN_GODS_CAREER_PROFILES[tenGod].entrepreneurship * count;
    }
  });
  entrepreneurship = totalCount > 0 ? entrepreneurship / totalCount : 50;

  // 적합 직군 수집 (빈도순)
  const categoryCount: Record<string, number> = {};
  (Object.keys(distribution) as TenGod[]).forEach((tenGod) => {
    const count = distribution[tenGod];
    if (count > 0) {
      TEN_GODS_CAREER_PROFILES[tenGod].suitableCategories.forEach((category) => {
        categoryCount[category] = (categoryCount[category] || 0) + count;
      });
    }
  });

  const suitableCategories = (Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category]) => category) as CareerCategory[]);

  return {
    dominantTenGod,
    dominantProfile,
    averageTraits: avgTraits,
    workStyle,
    entrepreneurship,
    suitableCategories,
  };
}

/**
 * 직업 추천 생성 (십성 분석 통합)
 */
export function recommendCareer(saju: SajuData): CareerRecommendation {
  const yongsin = saju.yongSin?.primaryYongSin || '목';

  // 1. 십성 분석
  const tenGodsAnalysis = analyzeTenGodsCareer(saju);

  // 2. 오행별 적성 계산
  const elementalAffinity = calculateElementalAffinity(saju, yongsin);

  // 3. 직업 추천 생성 (십성 + 오행 통합)
  const recommendations = generateRecommendations(saju, yongsin, elementalAffinity, tenGodsAnalysis);

  // 4. 피해야 할 직업
  const jobsToAvoid = identifyJobsToAvoid(saju, yongsin);

  // 5. 경력 조언
  const careerAdvice = generateCareerAdvice(saju, yongsin);

  // 6. 직장 환경 선호도 (십성 기반)
  const workEnvironment = analyzeWorkEnvironment(saju, tenGodsAnalysis);

  // 7. 종합 평가
  const summary = generateSummary(recommendations, workEnvironment);

  return {
    recommendations,
    jobsToAvoid,
    elementalAffinity,
    careerAdvice,
    workEnvironment,
    summary,
  };
}

/**
 * 오행별 적성 계산
 */
function calculateElementalAffinity(
  saju: SajuData,
  yongsin: WuXing
): CareerRecommendation['elementalAffinity'] {
  const elements: WuXing[] = ['목', '화', '토', '금', '수'];

  return elements.map((element) => {
    let affinity = 50; // 기본 점수

    // 용신과 같으면 +40
    if (element === yongsin) {
      affinity += 40;
    }

    // 용신을 생하면 +20
    if (generates(element, yongsin)) {
      affinity += 20;
    }

    // 용신을 극하면 -30
    if (controls(element, yongsin)) {
      affinity -= 30;
    }

    // 사주 내 해당 오행 강도에 따라 조정
    const strength = getElementStrength(saju, element);
    if (strength > 2) {
      affinity -= 10; // 너무 강하면 감점
    } else if (strength < 1) {
      affinity += 15; // 약하면 보완 필요
    }

    affinity = Math.max(0, Math.min(100, affinity));

    return {
      element,
      affinity,
      careers: ELEMENT_CAREERS[element].jobs.slice(0, 5),
    };
  }).sort((a, b) => b.affinity - a.affinity);
}

/**
 * 직업 추천 생성 (십성 + 오행 통합)
 */
function generateRecommendations(
  _saju: SajuData,
  yongsin: WuXing,
  elementalAffinity: CareerRecommendation['elementalAffinity'],
  tenGodsAnalysis: TenGodsCareerAnalysis
): CareerRecommendation['recommendations'] {
  const recommendations: CareerRecommendation['recommendations'] = [];

  // 십성 기반 직군에 가점 부여
  const tenGodsCategoryBonus: Record<string, number> = {};
  tenGodsAnalysis.suitableCategories.forEach((category, index) => {
    tenGodsCategoryBonus[category] = 20 - (index * 3); // 20, 17, 14, 11, 8, 5
  });

  // 상위 3개 오행의 직업 카테고리 추천
  elementalAffinity.slice(0, 3).forEach((affinity, index) => {
    const element = affinity.element;
    const elementData = ELEMENT_CAREERS[element];

    elementData.categories.forEach((category) => {
      let score = affinity.affinity - (index * 5); // 순위에 따라 점수 조정

      // 십성 기반 가점
      if (tenGodsCategoryBonus[category]) {
        score += tenGodsCategoryBonus[category];
      }

      const isYongsin = element === yongsin;
      const isTenGodsMatch = tenGodsAnalysis.suitableCategories.includes(category);

      let reason = '';
      if (isYongsin && isTenGodsMatch) {
        reason = `용신(${yongsin})과 일치하고, 십성(${tenGodsAnalysis.dominantTenGod}) 특성에도 매우 적합합니다.`;
      } else if (isYongsin) {
        reason = `용신(${yongsin})과 일치하여 매우 유리합니다.`;
      } else if (isTenGodsMatch) {
        reason = `십성(${tenGodsAnalysis.dominantTenGod}) 특성에 잘 맞습니다.`;
      } else {
        reason = `${element} 기운이 적성에 맞습니다.`;
      }

      recommendations.push({
        category,
        score: Math.max(0, Math.min(100, score)),
        specificJobs: elementData.jobs.filter((_job) =>
          ELEMENT_CAREERS[element].categories.includes(category)
        ).slice(0, 3),
        reason,
        yongsinAlignment: isYongsin ? '용신 일치' : generates(element, yongsin) ? '용신 생조' : '보통',
        strength: score >= 80 ? '매우 적합' : score >= 60 ? '적합' : score >= 40 ? '보통' : '부적합',
      });
    });
  });

  // 점수순 정렬 및 상위 10개 반환
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

/**
 * 피해야 할 직업 식별
 */
function identifyJobsToAvoid(
  _saju: SajuData,
  yongsin: WuXing
): CareerRecommendation['jobsToAvoid'] {
  const jobsToAvoid: CareerRecommendation['jobsToAvoid'] = [];

  // 용신을 극하는 오행의 직업은 피해야 함
  const elements: WuXing[] = ['목', '화', '토', '금', '수'];
  const harmfulElements = elements.filter((el) => controls(el, yongsin));

  harmfulElements.forEach((element) => {
    const elementData = ELEMENT_CAREERS[element];
    elementData.categories.forEach((category) => {
      jobsToAvoid.push({
        category,
        reason: `${element} 기운이 용신(${yongsin})을 극하여 불리합니다.`,
        alternativeSuggestion: `대신 ${yongsin} 관련 직업을 고려하세요.`,
      });
    });
  });

  return jobsToAvoid.slice(0, 5);
}

/**
 * 경력 조언 생성
 */
function generateCareerAdvice(
  saju: SajuData,
  yongsin: WuXing
): CareerRecommendation['careerAdvice'] {
  // const dayMaster = saju.day.stem; // 향후 활용 예정

  return {
    earlyCareer: [
      `${yongsin} 오행 관련 분야에서 경험을 쌓으세요.`,
      '다양한 경험을 통해 적성을 찾는 시기입니다.',
      '인맥 구축과 기술 습득에 집중하세요.',
    ],
    midCareer: [
      '축적된 경험을 바탕으로 전문성을 키우세요.',
      `${yongsin} 기운이 강한 시기에 중요한 결정을 내리세요.`,
      '리더십 역량을 개발할 시기입니다.',
    ],
    lateCareer: [
      '후배 양성과 지식 전수에 집중하세요.',
      '안정적인 수입원을 확보하세요.',
      '새로운 도전보다는 기존 경력을 활용하세요.',
    ],
    entrepreneurship: isEntrepreneurshipSuitable(saju)
      ? `창업 적성이 있습니다. ${yongsin} 관련 사업을 고려하세요.`
      : '직장 생활이 더 안정적입니다. 부업으로 시작하는 것을 권장합니다.',
  };
}

/**
 * 직장 환경 분석 (십성 기반)
 */
function analyzeWorkEnvironment(
  _saju: SajuData,
  tenGodsAnalysis: TenGodsCareerAnalysis
): CareerRecommendation['workEnvironment'] {
  const traits = tenGodsAnalysis.averageTraits;

  // 회사 규모 선호도
  let preferredSize: '대기업' | '중견기업' | '중소기업' | '스타트업' | '자영업';
  if (traits.stability > 75) {
    preferredSize = '대기업';
  } else if (traits.independence > 75 && tenGodsAnalysis.entrepreneurship > 70) {
    preferredSize = '자영업';
  } else if (traits.innovation > 70 && traits.independence > 60) {
    preferredSize = '스타트업';
  } else if (traits.stability > 55) {
    preferredSize = '중견기업';
  } else {
    preferredSize = '중소기업';
  }

  // 업무 스타일은 십성 분석에서 가져옴
  const workStyle = tenGodsAnalysis.workStyle;

  // 리더십
  let leadership: '리더십 강함' | '리더십 보통' | '팔로워십 강함';
  if (traits.leadership > 70) {
    leadership = '리더십 강함';
  } else if (traits.leadership < 50) {
    leadership = '팔로워십 강함';
  } else {
    leadership = '리더십 보통';
  }

  // 안정성 vs 도전
  let stabilityPreference: '안정 추구형' | '도전 추구형' | '균형형';
  if (traits.stability > 70) {
    stabilityPreference = '안정 추구형';
  } else if (traits.innovation > 70 && traits.stability < 50) {
    stabilityPreference = '도전 추구형';
  } else {
    stabilityPreference = '균형형';
  }

  return {
    preferredSize,
    workStyle,
    leadership,
    stability: stabilityPreference,
  };
}

/**
 * 창업 적성 판단
 */
function isEntrepreneurshipSuitable(saju: SajuData): boolean {
  // 비견, 겁재, 편재가 강하면 창업 적성
  // 간단한 버전: 일간이 강하면 창업 적성으로 판단
  const dayStem = saju.day.stem;
  const yangStems: HeavenlyStem[] = ['갑', '병', '무', '경', '임'];
  return yangStems.includes(dayStem);
}

/**
 * 종합 평가 생성
 */
function generateSummary(
  recommendations: CareerRecommendation['recommendations'],
  workEnvironment: CareerRecommendation['workEnvironment']
): string {
  const topCategory = recommendations[0]?.category || '다양한 분야';
  const preferredSize = workEnvironment.preferredSize;
  const workStyle = workEnvironment.workStyle;

  return `${topCategory} 분야에서 가장 큰 성공 가능성을 보입니다. ${preferredSize} 환경에서 ${workStyle} 업무 스타일이 적합합니다.`;
}

// ==================== 헬퍼 함수 ====================

/**
 * 오행 상생 관계 (A generates B)
 */
function generates(from: WuXing, to: WuXing): boolean {
  const cycle: Record<WuXing, WuXing> = {
    '목': '화',
    '화': '토',
    '토': '금',
    '금': '수',
    '수': '목',
  };
  return cycle[from] === to;
}

/**
 * 오행 상극 관계 (A controls B)
 */
function controls(from: WuXing, to: WuXing): boolean {
  const cycle: Record<WuXing, WuXing> = {
    '목': '토',
    '토': '수',
    '수': '화',
    '화': '금',
    '금': '목',
  };
  return cycle[from] === to;
}

/**
 * 사주 내 특정 오행의 강도 계산
 */
function getElementStrength(saju: SajuData, element: WuXing): number {
  let count = 0;
  // 천간 4개 체크 (간단한 버전)
  const stems = [saju.year.stem, saju.month.stem, saju.day.stem, saju.hour.stem];
  const stemElements: Record<HeavenlyStem, WuXing> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
  };

  stems.forEach((stem) => {
    if (stemElements[stem] === element) count++;
  });

  return count;
}
