/**
 * 해석 유파 기본 프리셋
 * Default interpretation school presets
 */

/**
 * 기본 프리셋 3개
 */
export const DEFAULT_PRESETS = {
  /**
   * 전통 중심 프리셋 (자평명리 기반)
   * - 강약용신 사용
   * - 건강과 명예 중시
   * - 시대 반영 최소화
   */
  traditional: {
    school: 'ziping' as const,
    yongSinMethod: 'strength' as const,
    priorities: {
      health: 0.9,
      wealth: 0.6,
      career: 0.7,
      relationship: 0.7,
      fame: 0.8,
    },
    eraAdaptation: {
      modernCareer: false,
      globalContext: false,
      techIndustry: false,
    },
    fortuneWeights: {
      daeun: 0.7,
      seyun: 0.3,
    },
  },

  /**
   * 현대 실용 프리셋 (현대명리 기반)
   * - 병약용신 사용
   * - 직업과 재물 중시
   * - 시대 반영 최대화
   */
  modern_professional: {
    school: 'modern' as const,
    yongSinMethod: 'disease' as const,
    priorities: {
      health: 0.7,
      wealth: 0.9,
      career: 1.0,
      relationship: 0.6,
      fame: 0.5,
    },
    eraAdaptation: {
      modernCareer: true,
      globalContext: true,
      techIndustry: true,
    },
    fortuneWeights: {
      daeun: 0.6,
      seyun: 0.4,
    },
  },

  /**
   * 건강 중심 프리셋 (궁통보감 기반)
   * - 조후용신 사용 (계절적 균형 중시)
   * - 건강 최우선
   * - 적절한 시대 반영
   */
  health_focused: {
    school: 'qtbj' as const,
    yongSinMethod: 'seasonal' as const,
    priorities: {
      health: 1.0,
      wealth: 0.5,
      career: 0.6,
      relationship: 0.7,
      fame: 0.4,
    },
    eraAdaptation: {
      modernCareer: true,
      globalContext: false,
      techIndustry: false,
    },
    fortuneWeights: {
      daeun: 0.7,
      seyun: 0.3,
    },
  },
};

/**
 * 유파별 기본 가중치
 * School-specific default weights
 */
export const SCHOOL_WEIGHTS: Record<string, {
  health: number;
  wealth: number;
  career: number;
  relationship: number;
  fame: number;
}> = {
  /**
   * 자평명리: 균형 잡힌 전통적 관점
   */
  ziping: {
    health: 0.8,
    wealth: 0.7,
    career: 0.7,
    relationship: 0.7,
    fame: 0.8,
  },

  /**
   * 적천수: 천간 중심, 명예와 사회적 지위 중시
   */
  dts: {
    health: 0.7,
    wealth: 0.6,
    career: 0.8,
    relationship: 0.6,
    fame: 0.9,
  },

  /**
   * 궁통보감: 계절적 조화, 건강 중시
   */
  qtbj: {
    health: 0.9,
    wealth: 0.6,
    career: 0.7,
    relationship: 0.7,
    fame: 0.6,
  },

  /**
   * 현대명리: 실용적 접근, 직업과 재물 중시
   */
  modern: {
    health: 0.7,
    wealth: 0.9,
    career: 1.0,
    relationship: 0.7,
    fame: 0.6,
  },

  /**
   * 신살중심: 인간관계와 명예 중시
   */
  shensha: {
    health: 0.6,
    wealth: 0.7,
    career: 0.7,
    relationship: 0.9,
    fame: 0.8,
  },
};

/**
 * 유파별 설명
 */
export const SCHOOL_DESCRIPTIONS: Record<string, string> = {
  ziping: '자평명리 - 전통 정통파. 음양오행의 균형과 강약을 중시하며, 격국 이론을 체계적으로 활용합니다.',
  dts: '적천수 - 천간 중심 해석. 천간의 투출과 통근을 중요시하며, 명예와 사회적 지위 분석에 강점이 있습니다.',
  qtbj: '궁통보감 - 계절 조화 중시. 사주의 한난조습(寒暖燥濕) 균형을 강조하며, 건강 분석에 탁월합니다.',
  modern: '현대명리 - 실용적 해석. 현대 직업과 라이프스타일을 반영하며, 구체적이고 실천 가능한 조언을 제공합니다.',
  shensha: '신살중심 - 신살 활용 해석. 다양한 신살(神煞)을 활용하여 인간관계와 특수한 운세를 분석합니다.',
};

/**
 * 용신 방법별 설명
 */
export const YONGSIN_METHOD_DESCRIPTIONS: Record<string, string> = {
  strength: '강약용신 - 일간의 강약을 판단하여 부족한 오행을 용신으로 선택합니다. 가장 전통적이고 널리 사용되는 방법입니다.',
  seasonal: '조후용신 - 사주의 한난조습(寒暖燥濕)을 조절하는 오행을 용신으로 선택합니다. 계절적 균형과 건강 분석에 유용합니다.',
  mediation: '통관용신 - 충돌하는 오행 사이를 중재하는 오행을 용신으로 선택합니다. 복잡한 사주 구조에 효과적입니다.',
  disease: '병약용신 - 사주의 문제점을 진단하고 치료하는 오행을 용신으로 선택합니다. 현대적이고 실용적인 접근법입니다.',
};
