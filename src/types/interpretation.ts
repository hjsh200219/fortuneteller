/**
 * 해석 유파 및 설정 타입 정의
 * Interpretation schools and settings type definitions
 */

/**
 * 해석 유파 코드
 * - ziping: 자평명리 (Traditional orthodox)
 * - dts: 적천수 (Heavenly stem focused)
 * - qtbj: 궁통보감 (Seasonal adjustment)
 * - modern: 현대명리 (Modern practical)
 * - shensha: 신살중심 (Spirit stars focused)
 */
export type SchoolCode = 'ziping' | 'dts' | 'qtbj' | 'modern' | 'shensha';

/**
 * 용신 선택 방법
 * - strength: 강약용신 (Strength-based)
 * - seasonal: 조후용신 (Seasonal adjustment)
 * - mediation: 통관용신 (Conflict mediation)
 * - disease: 병약용신 (Disease-cure)
 */
export type YongSinMethod = 'strength' | 'seasonal' | 'mediation' | 'disease';

/**
 * 우선순위 설정 (0.0 ~ 1.0)
 */
export interface PrioritySettings {
  /** 건강 우선순위 */
  health: number;
  /** 재물 우선순위 */
  wealth: number;
  /** 직업/사업 우선순위 */
  career: number;
  /** 인간관계/배우자 우선순위 */
  relationship: number;
  /** 명예/사회적 지위 우선순위 */
  fame: number;
}

/**
 * 시대 반영 설정
 */
export interface EraAdaptationSettings {
  /** 현대 직업 데이터베이스 사용 */
  modernCareer: boolean;
  /** 글로벌 환경 고려 */
  globalContext: boolean;
  /** IT/기술 산업 특화 해석 */
  techIndustry: boolean;
}

/**
 * 대운/세운 가중치 설정
 */
export interface FortuneWeightSettings {
  /** 대운 가중치 (0.0 ~ 1.0) */
  daeun: number;
  /** 세운 가중치 (0.0 ~ 1.0) */
  seyun: number;
}

/**
 * 사용자 해석 설정
 */
export interface UserInterpretationSettings {
  /** 해석 유파 */
  school: SchoolCode;
  /** 용신 선택 방법 */
  yongSinMethod: YongSinMethod;
  /** 우선순위 설정 */
  priorities: PrioritySettings;
  /** 시대 반영 설정 */
  eraAdaptation: EraAdaptationSettings;
  /** 대운/세운 가중치 */
  fortuneWeights: FortuneWeightSettings;
}

/**
 * 유파별 해석 결과
 */
export interface SchoolInterpretation {
  /** 유파 코드 */
  school: SchoolCode;
  /** 유파 이름 (한글) */
  schoolName: string;
  /** 사용된 용신 */
  yongSin: string;
  /** 격국 (해당되는 경우) */
  geokGuk?: string;
  /** 종합 해석 */
  overall: string;
  /** 건강 해석 */
  health: string;
  /** 재물 해석 */
  wealth: string;
  /** 직업 해석 */
  career: string;
  /** 인간관계 해석 */
  relationship: string;
  /** 명예 해석 */
  fame: string;
  /** 대운 해석 */
  daeunAnalysis: string;
  /** 세운 해석 */
  seyunAnalysis: string;
  /** 신뢰도 점수 (0.0 ~ 1.0) */
  confidence: number;
}

/**
 * 유파 비교 결과
 */
export interface SchoolComparisonResult {
  /** 비교된 유파들 */
  schools: SchoolCode[];
  /** 각 유파별 해석 */
  interpretations: SchoolInterpretation[];
  /** 합의 항목 (여러 유파가 동의하는 내용) */
  consensus: {
    category: keyof Pick<SchoolInterpretation, 'health' | 'wealth' | 'career' | 'relationship' | 'fame'>;
    agreement: string;
    schools: SchoolCode[];
  }[];
  /** 차이점 (유파별로 다른 해석) */
  differences: {
    category: keyof Pick<SchoolInterpretation, 'health' | 'wealth' | 'career' | 'relationship' | 'fame'>;
    interpretations: {
      school: SchoolCode;
      interpretation: string;
    }[];
  }[];
  /** 최종 권장 사항 */
  recommendation: string;
}
