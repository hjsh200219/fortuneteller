/**
 * 격국(格局) 판단 시스템
 * 사주팔자의 전체적인 패턴과 틀을 분석
 */

import type { SajuData, TenGod } from '../types/index.js';

export type GyeokGuk =
  | 'jeong_gwan'    // 정관격
  | 'jeong_jae'     // 정재격
  | 'sig_sin'       // 식신격
  | 'jeong_in'      // 정인격
  | 'sang_gwan'     // 상관격
  | 'pyeon_in'      // 편인격
  | 'pyeon_jae'     // 편재격
  | 'chil_sal'      // 칠살격(편관격)
  | 'bi_gyeon'      // 비견격
  | 'geob_jae'      // 겁재격
  | 'jong_wang'     // 종왕격
  | 'jong_sal'      // 종살격
  | 'jong_jae'      // 종재격
  | 'balanced';      // 중화격

export interface GyeokGukAnalysis {
  gyeokGuk: GyeokGuk;
  name: string;
  hanja: string;
  description: string;
  personality: string[];
  strengths: string[];
  weaknesses: string[];
  careerPath: string[];
  lifeAdvice: string[];
  compatibility: {
    good: string[];  // 잘 맞는 격국
    bad: string[];   // 안 맞는 격국
  };
}

/**
 * 격국별 상세 정보
 */
const GYEOK_GUK_INFO: Record<GyeokGuk, Omit<GyeokGukAnalysis, 'gyeokGuk'>> = {
  jeong_gwan: {
    name: '정관격',
    hanja: '正官格',
    description: '정관이 월지에 투출하여 일간을 다스리는 격국. 리더십과 책임감이 강한 타입',
    personality: ['책임감이 강함', '정직하고 원칙적', '명예를 중시', '사회적 지위 추구'],
    strengths: ['리더십 능력', '조직 관리 능력', '신뢰받는 성품', '안정적 경력'],
    weaknesses: ['융통성 부족', '권위주의적', '스트레스 과다', '변화 적응 어려움'],
    careerPath: ['공무원', '교사', '변호사', '대기업 임원', '관리직', '정치인'],
    lifeAdvice: [
      '명예와 지위를 얻을 운명이지만 과도한 부담은 주의',
      '정직하고 원칙적인 태도를 유지하라',
      '부하와 후배를 잘 이끌면 큰 성공 가능',
      '가족과의 시간도 중요하게 생각하라',
    ],
    compatibility: {
      good: ['정재격', '정인격', '식신격'],
      bad: ['상관격', '편인격'],
    },
  },

  jeong_jae: {
    name: '정재격',
    hanja: '正財格',
    description: '정재가 월지에 투출한 격국. 꾸준함과 안정을 추구하는 타입',
    personality: ['성실하고 근면', '절약 정신', '현실적', '가정적'],
    strengths: ['재물 관리 능력', '꾸준한 노력', '신뢰성', '실무 능력'],
    weaknesses: ['보수적', '모험심 부족', '인색할 수 있음', '기회 놓칠 수 있음'],
    careerPath: ['회계사', '재무담당', '은행원', '부동산', '자영업', '경영관리'],
    lifeAdvice: [
      '꾸준히 노력하면 재물을 모을 수 있음',
      '안정적 투자가 유리, 투기는 피하라',
      '가족을 소중히 여기고 가정을 잘 꾸리라',
      '가끔은 과감한 도전도 필요함',
    ],
    compatibility: {
      good: ['정관격', '식신격', '비견격'],
      bad: ['편재격', '겁재격'],
    },
  },

  sig_sin: {
    name: '식신격',
    hanja: '食神格',
    description: '식신이 월지에 투출한 격국. 창의적이고 낙천적인 타입',
    personality: ['낙천적이고 긍정적', '창의적', '표현력이 풍부', '여유로움'],
    strengths: ['창작 능력', '예술적 재능', '인간관계', '스트레스 관리'],
    weaknesses: ['게으를 수 있음', '현실감 부족', '계획성 부족', '집중력 부족'],
    careerPath: ['예술가', '요리사', '작가', '디자이너', '방송인', '연예인', '강사'],
    lifeAdvice: [
      '창의적 재능을 발휘할 수 있는 분야를 찾아라',
      '즐기면서 일하는 것이 성공의 비결',
      '때로는 현실적 계획도 필요함',
      '건강 관리에 신경쓰라',
    ],
    compatibility: {
      good: ['정재격', '편재격', '정관격'],
      bad: ['편인격'],
    },
  },

  jeong_in: {
    name: '정인격',
    hanja: '正印格',
    description: '정인이 월지에 투출한 격국. 학문과 지혜를 추구하는 타입',
    personality: ['학구적', '사려깊음', '이타적', '보수적'],
    strengths: ['학습 능력', '분석력', '전문성', '인내심'],
    weaknesses: ['우유부단', '소극적', '현실감 부족', '의존성'],
    careerPath: ['학자', '연구원', '교수', '의사', '변호사', '전문직', '공무원'],
    lifeAdvice: [
      '학문이나 전문 분야에서 두각을 나타낼 것',
      '끊임없이 배우고 연구하라',
      '지나친 이상주의는 피하고 현실도 고려하라',
      '사람들과의 교류도 중요함',
    ],
    compatibility: {
      good: ['정관격', '비견격'],
      bad: ['편재격', '정재격'],
    },
  },

  sang_gwan: {
    name: '상관격',
    hanja: '傷官格',
    description: '상관이 강한 격국. 비판적이고 독창적인 타입',
    personality: ['비판적', '독창적', '자유로움', '표현력 강함'],
    strengths: ['창의성', '재능', '통찰력', '개혁 정신'],
    weaknesses: ['반항적', '비판적', '관계 갈등', '안정성 부족'],
    careerPath: ['예술가', '평론가', '작가', '프리랜서', '혁신 사업', '연구직'],
    lifeAdvice: [
      '예술이나 창작 분야에서 재능 발휘',
      '자유로운 환경에서 더욱 빛남',
      '비판보다는 건설적 제안을 하라',
      '인간관계에서 감정 조절이 중요',
    ],
    compatibility: {
      good: ['편재격', '편인격'],
      bad: ['정관격', '정인격'],
    },
  },

  pyeon_in: {
    name: '편인격',
    hanja: '偏印格',
    description: '편인이 강한 격국. 독특하고 신비로운 타입',
    personality: ['독창적 사고', '신비로움', '직관적', '개인주의'],
    strengths: ['독창성', '직관력', '특수 재능', '학습 능력'],
    weaknesses: ['고독감', '괴팍함', '비사회적', '불안정'],
    careerPath: ['철학자', '예술가', '역술인', '심리학자', '대체의학', '연구직'],
    lifeAdvice: [
      '특수한 분야에서 독보적 위치 차지 가능',
      '직관을 믿되 현실도 놓치지 말라',
      '고독을 즐기되 고립은 피하라',
      '건강과 정신 건강에 유의',
    ],
    compatibility: {
      good: ['상관격', '칠살격'],
      bad: ['식신격', '정재격'],
    },
  },

  pyeon_jae: {
    name: '편재격',
    hanja: '偏財格',
    description: '편재가 강한 격국. 사교적이고 사업 수완이 뛰어난 타입',
    personality: ['사교적', '활동적', '낙천적', '모험적'],
    strengths: ['사업 수완', '인맥', '순발력', '재물운'],
    weaknesses: ['불안정', '낭비', '가정 소홀', '투기 위험'],
    careerPath: ['사업가', '영업', '무역', '금융', '투자', '서비스업', '유흥업'],
    lifeAdvice: [
      '사업이나 투자에서 큰 재물 가능',
      '인맥을 잘 활용하라',
      '과도한 투기는 피하라',
      '가정에도 신경쓰라',
    ],
    compatibility: {
      good: ['식신격', '상관격', '비견격'],
      bad: ['겁재격', '비견격'],
    },
  },

  chil_sal: {
    name: '칠살격',
    hanja: '七殺格',
    description: '편관(칠살)이 강한 격국. 강한 추진력과 승부욕을 지닌 타입',
    personality: ['추진력 강함', '승부욕', '과감함', '카리스마'],
    strengths: ['리더십', '결단력', '실행력', '위기 대응'],
    weaknesses: ['과격함', '독단적', '적 많음', '건강 문제'],
    careerPath: ['군인', '경찰', '운동선수', 'CEO', '정치인', '변호사', '검사'],
    lifeAdvice: [
      '강한 추진력으로 목표를 이룰 수 있음',
      '과격함을 조절하고 신중함을 더하라',
      '적을 만들지 않도록 주의',
      '건강 관리가 매우 중요',
    ],
    compatibility: {
      good: ['식신격', '정인격', '편인격'],
      bad: ['정관격', '겁재격'],
    },
  },

  bi_gyeon: {
    name: '비견격',
    hanja: '比肩格',
    description: '비견이 강한 격국. 독립심과 자존심이 강한 타입',
    personality: ['독립적', '자존심 강함', '의지가 강함', '고집'],
    strengths: ['독립성', '자립심', '끈기', '의지력'],
    weaknesses: ['고집', '협력 부족', '재물 손실', '고독'],
    careerPath: ['자영업', '전문직', '프리랜서', '독립 사업', '개인 사무소'],
    lifeAdvice: [
      '자신의 길을 개척하는 것이 유리',
      '협력도 때로는 필요함',
      '재물 관리에 신경쓰라',
      '파트너 선택이 중요',
    ],
    compatibility: {
      good: ['정재격', '정관격', '식신격'],
      bad: ['비견격', '겁재격'],
    },
  },

  geob_jae: {
    name: '겁재격',
    hanja: '劫財格',
    description: '겁재가 강한 격국. 경쟁심과 야망이 강한 타입',
    personality: ['경쟁심 강함', '야망', '활동적', '변화 추구'],
    strengths: ['행동력', '도전정신', '순발력', '추진력'],
    weaknesses: ['재물 손실', '불안정', '과격함', '신뢰 문제'],
    careerPath: ['사업가', '영업', '스포츠', '연예', '투자', '무역'],
    lifeAdvice: [
      '큰 성공을 거둘 수도 있지만 큰 실패도 조심',
      '재물 관리가 매우 중요',
      '파트너나 동업은 신중하게',
      '인간관계에서 신뢰 쌓기',
    ],
    compatibility: {
      good: ['식신격', '편재격'],
      bad: ['비견격', '겁재격', '정재격'],
    },
  },

  jong_wang: {
    name: '종왕격',
    hanja: '從旺格',
    description: '일간이 극강하고 비겁이 많아 강함을 따르는 특수 격국',
    personality: ['자신감 넘침', '독단적', '강한 개성', '리더십'],
    strengths: ['강한 자아', '추진력', '영향력', '카리스마'],
    weaknesses: ['독선적', '타협 부족', '고립', '건강 문제'],
    careerPath: ['CEO', '정치인', '사업가', '예술가', '독립 전문가'],
    lifeAdvice: [
      '자신의 길을 밀고 나가면 성공',
      '타인의 조언도 귀담아 들으라',
      '건강 관리가 필수',
      '겸손함을 잊지 말라',
    ],
    compatibility: {
      good: ['식신격', '상관격'],
      bad: ['정관격', '칠살격'],
    },
  },

  jong_sal: {
    name: '종살격',
    hanja: '從殺格',
    description: '관살이 극강하고 일간이 약하여 관살을 따르는 특수 격국',
    personality: ['권위 존중', '순응적', '조직 생활 적합', '충성심'],
    strengths: ['조직 적응력', '충성심', '안정 추구', '실무 능력'],
    weaknesses: ['주체성 부족', '의존적', '스트레스', '건강 약함'],
    careerPath: ['대기업', '공무원', '군인', '경찰', '조직 관리직'],
    lifeAdvice: [
      '큰 조직에서 안정적 성공 가능',
      '리더를 잘 만나면 크게 성공',
      '자기 주장도 때로는 필요',
      '스트레스 관리 필수',
    ],
    compatibility: {
      good: ['정인격', '식신격'],
      bad: ['비견격', '겁재격'],
    },
  },

  jong_jae: {
    name: '종재격',
    hanja: '從財格',
    description: '재성이 극강하고 일간이 약하여 재성을 따르는 특수 격국',
    personality: ['재물 추구', '현실적', '사교적', '활동적'],
    strengths: ['재물운', '사업 수완', '인맥', '실리 추구'],
    weaknesses: ['물질 중시', '의리 부족', '과로', '건강 문제'],
    careerPath: ['사업가', '투자가', '부동산', '금융', '무역', '유통'],
    lifeAdvice: [
      '재물운이 매우 강함',
      '사업에서 큰 성공 가능',
      '건강을 희생하지 말라',
      '인간관계도 소중히',
    ],
    compatibility: {
      good: ['식신격', '상관격'],
      bad: ['비견격', '겁재격'],
    },
  },

  balanced: {
    name: '중화격',
    hanja: '中和格',
    description: '오행과 십성이 고르게 분포된 균형잡힌 격국',
    personality: ['균형잡힌 성격', '유연함', '적응력', '조화로움'],
    strengths: ['적응력', '균형감각', '다재다능', '안정성'],
    weaknesses: ['특출난 점 부족', '우유부단', '평범함', '방향성 불명확'],
    careerPath: ['관리직', '종합 기획', '상담', '교육', '서비스', '일반 사무'],
    lifeAdvice: [
      '어느 분야든 무난하게 잘함',
      '특정 분야를 깊이 파는 것도 좋음',
      '균형을 유지하되 때로는 과감함도 필요',
      '꾸준함이 성공의 열쇠',
    ],
    compatibility: {
      good: ['모든 격국과 무난'],
      bad: ['특별히 없음'],
    },
  },
};

/**
 * 격국 판단 메인 함수
 */
export function determineGyeokGuk(sajuData: SajuData): GyeokGukAnalysis {
  // 1. 특수 격국 판단 (종격)
  const specialGyeokGuk = checkSpecialGyeokGuk(sajuData);
  if (specialGyeokGuk) {
    return {
      gyeokGuk: specialGyeokGuk,
      ...GYEOK_GUK_INFO[specialGyeokGuk],
    };
  }

  // 2. 월지 지장간에서 투출한 십성 확인
  // 월지의 정기(주기)로 십성 판단
  let dominantTenGod: TenGod | null = null;

  // 십성 분포에서 가장 많은 십성 찾기
  if (sajuData.tenGodsDistribution) {
    const tenGodEntries = Object.entries(sajuData.tenGodsDistribution) as [TenGod, number][];
    const sortedTenGods = tenGodEntries
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    if (sortedTenGods.length > 0 && sortedTenGods[0]) {
      dominantTenGod = sortedTenGods[0][0];
    }
  }

  // 3. 십성별 격국 매핑
  const gyeokGuk = mapTenGodToGyeokGuk(dominantTenGod);

  return {
    gyeokGuk,
    ...GYEOK_GUK_INFO[gyeokGuk],
  };
}

/**
 * 특수 격국(종격) 판단
 */
function checkSpecialGyeokGuk(sajuData: SajuData): GyeokGuk | null {
  const dist = sajuData.tenGodsDistribution;
  if (!dist) return null;

  const totalCount = Object.values(dist).reduce((sum, count) => sum + count, 0);

  // 비겁이 5개 이상이고 전체의 60% 이상 → 종왕격
  const biGeopCount = (dist['비견'] || 0) + (dist['겁재'] || 0);
  if (biGeopCount >= 5 && biGeopCount / totalCount >= 0.6) {
    return 'jong_wang';
  }

  // 관살이 5개 이상이고 전체의 60% 이상 → 종살격
  const gwanSalCount = (dist['정관'] || 0) + (dist['편관'] || 0);
  if (gwanSalCount >= 5 && gwanSalCount / totalCount >= 0.6) {
    return 'jong_sal';
  }

  // 재성이 5개 이상이고 전체의 60% 이상 → 종재격
  const jaeCount = (dist['정재'] || 0) + (dist['편재'] || 0);
  if (jaeCount >= 5 && jaeCount / totalCount >= 0.6) {
    return 'jong_jae';
  }

  return null;
}

/**
 * 십성을 격국으로 매핑
 */
function mapTenGodToGyeokGuk(tenGod: TenGod | null): GyeokGuk {
  if (!tenGod) return 'balanced';

  const gyeokGukMap: Record<TenGod, GyeokGuk> = {
    '정관': 'jeong_gwan',
    '정재': 'jeong_jae',
    '식신': 'sig_sin',
    '정인': 'jeong_in',
    '상관': 'sang_gwan',
    '편인': 'pyeon_in',
    '편재': 'pyeon_jae',
    '편관': 'chil_sal',
    '비견': 'bi_gyeon',
    '겁재': 'geob_jae',
  };

  return gyeokGukMap[tenGod] || 'balanced';
}

/**
 * 격국 정보 조회
 */
export function getGyeokGukInfo(gyeokGuk: GyeokGuk): Omit<GyeokGukAnalysis, 'gyeokGuk'> {
  return GYEOK_GUK_INFO[gyeokGuk];
}
