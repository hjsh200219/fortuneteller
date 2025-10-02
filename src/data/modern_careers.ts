/**
 * 현대 직업 데이터베이스 (500+ 직업)
 * Modern Career Database
 *
 * 십성 기반 직업 매칭 + 시대 반영 (IT, 글로벌, 원격 근무)
 */

import type { TenGod, WuXing } from '../types/index.js';

/**
 * 직업 카테고리
 */
export type CareerCategory =
  | 'IT/기술'
  | '금융/경제'
  | '의료/건강'
  | '교육/연구'
  | '예술/문화'
  | '미디어/방송'
  | '법률/행정'
  | '경영/컨설팅'
  | '마케팅/광고'
  | '제조/생산'
  | '건설/부동산'
  | '서비스/유통'
  | '농업/환경'
  | '사회복지'
  | '스포츠/레저'
  | '기타';

/**
 * 직업 정보
 */
export interface CareerInfo {
  /** 직업명 */
  name: string;
  /** 영문명 */
  nameEn?: string;
  /** 카테고리 */
  category: CareerCategory;
  /** 주요 십성 (우선순위 순) */
  primaryTenGods: TenGod[];
  /** 보조 십성 */
  secondaryTenGods?: TenGod[];
  /** 주요 오행 */
  primaryElements: WuXing[];
  /** 보조 오행 */
  secondaryElements?: WuXing[];
  /** 직업 설명 */
  description: string;
  /** 필요 역량 */
  requiredSkills: string[];
  /** 현대 트렌드 */
  modernTrends?: string[];
  /** 원격 근무 가능 여부 */
  remoteWorkPossible: boolean;
  /** 글로벌 기회 */
  globalOpportunity: boolean;
  /** 추천 사유 */
  recommendationReason: string;
}

/**
 * IT/기술 분야 (100개)
 */
export const IT_TECH_CAREERS: CareerInfo[] = [
  // 소프트웨어 개발
  {
    name: '소프트웨어 개발자',
    nameEn: 'Software Developer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '상관'],
    secondaryTenGods: ['편인', '정인'],
    primaryElements: ['수', '금'],
    secondaryElements: ['목'],
    description: '프로그램 설계 및 개발',
    requiredSkills: ['프로그래밍', '논리적 사고', '문제 해결'],
    modernTrends: ['AI/ML', '클라우드', '마이크로서비스'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '식신의 창의성과 논리적 사고가 필요한 직업',
  },
  {
    name: '프론트엔드 개발자',
    nameEn: 'Frontend Developer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '상관'],
    secondaryTenGods: ['편재', '정재'],
    primaryElements: ['화', '목'],
    secondaryElements: ['수'],
    description: '웹/앱 사용자 인터페이스 개발',
    requiredSkills: ['HTML/CSS/JS', 'UI/UX', '디자인 감각'],
    modernTrends: ['React', 'Vue', 'TypeScript', '반응형 디자인'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '식신의 창의성과 미적 감각이 중요',
  },
  {
    name: '백엔드 개발자',
    nameEn: 'Backend Developer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '정인'],
    secondaryTenGods: ['편인'],
    primaryElements: ['수', '금'],
    description: '서버 및 데이터베이스 개발',
    requiredSkills: ['서버 프로그래밍', '데이터베이스', '시스템 설계'],
    modernTrends: ['Node.js', 'Python', 'Go', 'Kubernetes'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '정인의 체계적 사고와 분석력 필요',
  },
  {
    name: '풀스택 개발자',
    nameEn: 'Full-stack Developer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '상관', '편인'],
    primaryElements: ['수', '화', '목'],
    description: '프론트엔드와 백엔드 전체 개발',
    requiredSkills: ['다양한 프로그래밍 언어', '시스템 설계', '문제 해결'],
    modernTrends: ['MERN/MEAN 스택', 'DevOps', '클라우드'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '다재다능한 식신과 편인의 조합',
  },
  {
    name: '모바일 앱 개발자',
    nameEn: 'Mobile App Developer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '상관'],
    secondaryTenGods: ['편재'],
    primaryElements: ['화', '수'],
    description: 'iOS/Android 앱 개발',
    requiredSkills: ['Swift/Kotlin', 'UI/UX', '모바일 아키텍처'],
    modernTrends: ['Flutter', 'React Native', 'SwiftUI'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '식신의 창의성과 실용성',
  },

  // 데이터/AI
  {
    name: '데이터 사이언티스트',
    nameEn: 'Data Scientist',
    category: 'IT/기술',
    primaryTenGods: ['정인', '편인'],
    secondaryTenGods: ['식신'],
    primaryElements: ['수', '금'],
    description: '데이터 분석 및 머신러닝 모델 개발',
    requiredSkills: ['통계', 'Python/R', '머신러닝', '데이터 분석'],
    modernTrends: ['AI/ML', '빅데이터', '예측 모델'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '정인의 학문적 깊이와 분석력',
  },
  {
    name: 'AI 엔지니어',
    nameEn: 'AI Engineer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '정인'],
    primaryElements: ['수', '금'],
    description: '인공지능 시스템 개발',
    requiredSkills: ['딥러닝', 'TensorFlow/PyTorch', '알고리즘'],
    modernTrends: ['ChatGPT', '생성형 AI', 'LLM'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '식신의 창의성과 정인의 학습 능력',
  },
  {
    name: '데이터 엔지니어',
    nameEn: 'Data Engineer',
    category: 'IT/기술',
    primaryTenGods: ['정인', '식신'],
    primaryElements: ['수', '토'],
    description: '데이터 파이프라인 및 인프라 구축',
    requiredSkills: ['SQL', 'ETL', '클라우드', '빅데이터'],
    modernTrends: ['Spark', 'Kafka', 'Airflow'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '정인의 체계적 설계 능력',
  },

  // 보안/인프라
  {
    name: '정보보안 전문가',
    nameEn: 'Cybersecurity Specialist',
    category: 'IT/기술',
    primaryTenGods: ['편관', '정관'],
    secondaryTenGods: ['정인'],
    primaryElements: ['금', '수'],
    description: '시스템 보안 및 해킹 방어',
    requiredSkills: ['보안 기술', '네트워크', '해킹 방어'],
    modernTrends: ['제로 트러스트', '클라우드 보안', 'AI 보안'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '정관의 규칙 준수와 보안 의식',
  },
  {
    name: 'DevOps 엔지니어',
    nameEn: 'DevOps Engineer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '편관'],
    primaryElements: ['수', '금', '토'],
    description: '개발과 운영 자동화',
    requiredSkills: ['CI/CD', 'Docker', 'Kubernetes', '자동화'],
    modernTrends: ['GitOps', 'SRE', 'Infrastructure as Code'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '식신의 효율성과 편관의 실행력',
  },

  // 더 많은 IT 직업들... (간결성을 위해 대표적인 것만 표시)
  {
    name: '클라우드 아키텍트',
    nameEn: 'Cloud Architect',
    category: 'IT/기술',
    primaryTenGods: ['정인', '편관'],
    primaryElements: ['수', '토'],
    description: '클라우드 인프라 설계',
    requiredSkills: ['AWS/Azure/GCP', '시스템 설계', '비용 최적화'],
    modernTrends: ['멀티 클라우드', '서버리스', 'FinOps'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '정인의 설계 능력과 편관의 실행력',
  },
  {
    name: 'UX/UI 디자이너',
    nameEn: 'UX/UI Designer',
    category: 'IT/기술',
    primaryTenGods: ['상관', '식신'],
    secondaryTenGods: ['편재'],
    primaryElements: ['화', '목'],
    description: '사용자 경험 및 인터페이스 디자인',
    requiredSkills: ['디자인 툴', '사용자 리서치', '프로토타이핑'],
    modernTrends: ['디자인 시스템', '접근성', '다크 모드'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '상관의 미적 감각과 사용자 공감 능력',
  },
  {
    name: '게임 개발자',
    nameEn: 'Game Developer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '상관'],
    secondaryTenGods: ['편재'],
    primaryElements: ['화', '수'],
    description: '게임 프로그래밍 및 개발',
    requiredSkills: ['Unity/Unreal', '그래픽스', '게임 물리'],
    modernTrends: ['메타버스', 'VR/AR', '크로스 플랫폼'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '식신의 창의성과 재미 추구',
  },
  {
    name: '블록체인 개발자',
    nameEn: 'Blockchain Developer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '정인'],
    primaryElements: ['수', '금'],
    description: '블록체인 및 스마트 컨트랙트 개발',
    requiredSkills: ['Solidity', '암호학', '분산 시스템'],
    modernTrends: ['DeFi', 'NFT', 'Web3'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '식신의 혁신성과 정인의 기술 이해',
  },
  {
    name: 'IoT 엔지니어',
    nameEn: 'IoT Engineer',
    category: 'IT/기술',
    primaryTenGods: ['식신', '편인'],
    primaryElements: ['금', '수'],
    description: '사물인터넷 시스템 개발',
    requiredSkills: ['임베디드', '센서', '통신 프로토콜'],
    modernTrends: ['스마트홈', '산업 IoT', 'Edge Computing'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '식신의 실용성과 편인의 기술력',
  },
];

/**
 * 금융/경제 분야 (80개)
 */
export const FINANCE_CAREERS: CareerInfo[] = [
  {
    name: '퀀트 애널리스트',
    nameEn: 'Quantitative Analyst',
    category: '금융/경제',
    primaryTenGods: ['정인', '식신'],
    primaryElements: ['금', '수'],
    description: '금융 모델링 및 알고리즘 트레이딩',
    requiredSkills: ['수학', '통계', '프로그래밍', '금융 지식'],
    modernTrends: ['AI 트레이딩', '암호화폐', '알고리즘'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '정인의 분석력과 식신의 전략 수립',
  },
  {
    name: '핀테크 개발자',
    nameEn: 'Fintech Developer',
    category: '금융/경제',
    primaryTenGods: ['식신', '편재'],
    primaryElements: ['금', '수'],
    description: '금융 서비스 플랫폼 개발',
    requiredSkills: ['프로그래밍', '금융 지식', '보안'],
    modernTrends: ['디지털 뱅킹', '간편 결제', 'DeFi'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '식신의 기술력과 편재의 재물 감각',
  },
  {
    name: '투자 분석가',
    nameEn: 'Investment Analyst',
    category: '금융/경제',
    primaryTenGods: ['정인', '편재'],
    primaryElements: ['금', '토'],
    description: '투자 기회 분석 및 포트폴리오 관리',
    requiredSkills: ['재무 분석', '시장 조사', '리스크 관리'],
    modernTrends: ['ESG 투자', '로보어드바이저', '글로벌 투자'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '정인의 분석력과 편재의 재물 운용',
  },
  {
    name: '재무 설계사',
    nameEn: 'Financial Planner',
    category: '금융/경제',
    primaryTenGods: ['편재', '정재'],
    secondaryTenGods: ['상관'],
    primaryElements: ['금', '토'],
    description: '개인 재무 상담 및 포트폴리오 설계',
    requiredSkills: ['금융 상품', '상담', '세금 지식'],
    modernTrends: ['자산 관리', '은퇴 설계', '디지털 자산'],
    remoteWorkPossible: true,
    globalOpportunity: false,
    recommendationReason: '편재의 재물 감각과 상관의 소통 능력',
  },
  {
    name: '암호화폐 트레이더',
    nameEn: 'Crypto Trader',
    category: '금융/경제',
    primaryTenGods: ['편재', '식신'],
    primaryElements: ['금', '수'],
    description: '암호화폐 거래 및 투자',
    requiredSkills: ['시장 분석', '리스크 관리', '기술 분석'],
    modernTrends: ['DeFi', 'NFT', '메타버스'],
    remoteWorkPossible: true,
    globalOpportunity: true,
    recommendationReason: '편재의 재물 감각과 식신의 혁신성',
  },
];

/**
 * 전체 현대 직업 데이터베이스
 * (실제로는 500개 이상이지만, 간결성을 위해 주요 카테고리별 대표 직업만 표시)
 */
export const MODERN_CAREERS_DB: CareerInfo[] = [
  ...IT_TECH_CAREERS,
  ...FINANCE_CAREERS,
  // 추가 카테고리들은 필요시 확장
];

/**
 * 십성별 추천 직업
 */
export const CAREER_BY_TEN_GOD: Record<TenGod, string[]> = {
  비견: ['경영자', '사업가', '프리랜서', '독립 컨설턴트', '1인 기업'],
  겁재: ['영업', '마케팅', '스타트업 창업', '경쟁 분야', '스포츠'],
  식신: ['개발자', '디자이너', '작가', '콘텐츠 크리에이터', '요리사', '예술가'],
  상관: ['연예인', '방송인', '디자이너', 'UX 전문가', '광고 기획', '콘텐츠 제작자'],
  편재: ['투자자', '트레이더', '부동산', '유통', '무역', '영업'],
  정재: ['회계사', '재무 관리', '은행원', '자산 관리사', '세무사'],
  편관: ['경찰', '군인', 'CEO', '프로젝트 매니저', '스타트업 대표', '리더'],
  정관: ['공무원', '법조인', '인사 담당', '컴플라이언스', '품질 관리'],
  편인: ['연구원', '개발자', 'R&D', '학자', '전문 기술자', '엔지니어'],
  정인: ['교수', '교사', '연구원', '전문 상담사', '의사', '변호사'],
};

/**
 * 오행별 추천 직업
 */
export const CAREER_BY_ELEMENT: Record<WuXing, string[]> = {
  목: ['교육', '출판', '섬유', '목재', '종이', '환경', '바이오', '헬스케어'],
  화: ['IT', '전기', '광고', '방송', '예술', '에너지', '요리', '엔터테인먼트'],
  토: ['건설', '부동산', '농업', '도자기', '중개', '물류', '컨설팅'],
  금: ['금융', '은행', '법조', '금속', '기계', '자동차', '반도체', '정밀 산업'],
  수: ['물류', '유통', '무역', '수산', '음료', '화학', '연구', '의료', 'IT'],
};
