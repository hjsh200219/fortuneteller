/**
 * 사주팔자 관련 타입 정의
 */

// 달력 타입
export type CalendarType = 'solar' | 'lunar';

// 성별
export type Gender = 'male' | 'female';

// 천간 (天干) - 10개
export type HeavenlyStem = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';

// 지지 (地支) - 12개
export type EarthlyBranch =
  | '자'
  | '축'
  | '인'
  | '묘'
  | '진'
  | '사'
  | '오'
  | '미'
  | '신'
  | '유'
  | '술'
  | '해';

// 오행 (五行)
export type WuXing = '목' | '화' | '토' | '금' | '수';

// 음양
export type YinYang = '음' | '양';

// 십성 (十星)
export type TenGod =
  | '비견'
  | '겁재'
  | '식신'
  | '상관'
  | '편재'
  | '정재'
  | '편관'
  | '정관'
  | '편인'
  | '정인';

// 사주 기둥 (四柱)
export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: WuXing;
  branchElement: WuXing;
  yinYang: YinYang;
}

// 사주 사기둥 (Four Pillars)
export interface SajuPillars {
  year: Pillar; // 연주 (年柱)
  month: Pillar; // 월주 (月柱)
  day: Pillar; // 일주 (日柱)
  hour: Pillar; // 시주 (時柱)
}

// 사주팔자 전체 데이터
export interface SajuData {
  // 기본 정보
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  calendar: CalendarType;
  isLeapMonth: boolean;
  gender: Gender;

  // 사주 사기둥
  year: Pillar; // 연주 (年柱)
  month: Pillar; // 월주 (月柱)
  day: Pillar; // 일주 (日柱)
  hour: Pillar; // 시주 (時柱)

  // 오행 분석
  wuxingCount: Record<WuXing, number>;

  // 십성 분석
  tenGods: TenGod[];
  tenGodsDistribution?: Record<TenGod, number>; // 십성 분포

  // 신살
  sinSals?: SinSal[]; // 신살 목록

  // 지지 관계
  branchRelations?: {
    samHap?: { type: string | null; element: WuXing | null };
    samHyeong?: string[];
    yukHae?: [EarthlyBranch, EarthlyBranch][];
    summary?: string;
  };

  // 지장간(支藏干) 정보
  jiJangGan?: {
    year: {
      primary: { stem: HeavenlyStem; strength: number };
      secondary?: { stem: HeavenlyStem; strength: number };
      residual?: { stem: HeavenlyStem; strength: number };
    };
    month: {
      primary: { stem: HeavenlyStem; strength: number };
      secondary?: { stem: HeavenlyStem; strength: number };
      residual?: { stem: HeavenlyStem; strength: number };
    };
    day: {
      primary: { stem: HeavenlyStem; strength: number };
      secondary?: { stem: HeavenlyStem; strength: number };
      residual?: { stem: HeavenlyStem; strength: number };
    };
    hour: {
      primary: { stem: HeavenlyStem; strength: number };
      secondary?: { stem: HeavenlyStem; strength: number };
      residual?: { stem: HeavenlyStem; strength: number };
    };
  };

  // 월령 및 일간 강약
  wolRyeong?: {
    isDeukRyeong: boolean; // 득령 여부
    reason: string;
    strength: 'strong' | 'medium' | 'weak';
  };
  dayMasterStrength?: {
    level: 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak';
    score: number; // 0-100
    analysis: string;
  };

  // 격국(格局)
  gyeokGuk?: {
    gyeokGuk: string;
    name: string;
    hanja: string;
    description: string;
  };

  // 용신(用神)
  yongSin?: {
    primaryYongSin: WuXing;
    secondaryYongSin?: WuXing;
    reasoning: string;
  };

  // 특수 요소
  specialMarks?: string[];
  dominantElements?: WuXing[];
  weakElements?: WuXing[];
}

// 십성 해석 결과
export interface TenGodInterpretation {
  tenGod: TenGod;
  count: number;
  intensity: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak'; // 강도 표현
  strengths: string[];
  weaknesses: string[];
  advice: string[];
}

// 신살(神殺) 타입
export type SinSal =
  | 'cheon_eul_gwi_in' // 천을귀인
  | 'cheon_deok_gwi_in' // 천덕귀인
  | 'wol_deok_gwi_in' // 월덕귀인
  | 'mun_chang_gwi_in' // 문창귀인
  | 'hak_dang_gwi_in' // 학당귀인
  | 'geum_yeo_rok' // 금여록
  | 'hwa_gae_sal' // 화개살
  | 'yang_in_sal' // 양인살
  | 'do_hwa_sal' // 도화살
  | 'baek_ho_sal' // 백호살
  | 'yeok_ma_sal' // 역마살
  | 'gwa_suk_sal' // 고숙살 (과숙살)
  | 'gong_mang' // 공망
  | 'won_jin_sal' // 원진살
  | 'gwi_mun_gwan_sal'; // 귀문관살

export interface SinSalInfo {
  sinSal: SinSal;
  name: string;
  hanja: string;
  type: 'lucky' | 'unlucky' | 'neutral';
  description: string;
  effects: string[];
  advice: string[];
}

// 운세 분석 타입
export type FortuneAnalysisType = 'general' | 'career' | 'wealth' | 'health' | 'love';

// 운세 분석 결과
export interface FortuneAnalysis {
  type: FortuneAnalysisType;
  targetDate?: string;
  score: number; // 0-100
  summary: string;
  details: {
    positive: string[];
    negative: string[];
    advice: string[];
  };
  luckyElements?: {
    colors?: string[];
    directions?: string[];
    numbers?: number[];
  };
}

// 궁합 분석 결과
export interface CompatibilityAnalysis {
  compatibilityScore: number; // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  advice: string[];
  elementHarmony: {
    harmony: number; // 0-100
    description: string;
  };
}

// 일일 운세
export interface DailyFortune {
  date: string;
  overallLuck: number; // 0-100
  wealthLuck: number;
  careerLuck: number;
  healthLuck: number;
  loveLuck: number;
  luckyColor: string;
  luckyDirection: string;
  advice: string;
}

// 음양력 변환 결과
export interface CalendarConversion {
  originalDate: string;
  originalCalendar: CalendarType;
  convertedDate: string;
  convertedCalendar: CalendarType;
  isLeapMonth?: boolean;
  solarTerm?: string; // 절기
}

// 24절기
export type SolarTerm =
  | '입춘'
  | '우수'
  | '경칩'
  | '춘분'
  | '청명'
  | '곡우'
  | '입하'
  | '소만'
  | '망종'
  | '하지'
  | '소서'
  | '대서'
  | '입추'
  | '처서'
  | '백로'
  | '추분'
  | '한로'
  | '상강'
  | '입동'
  | '소설'
  | '대설'
  | '동지'
  | '소한'
  | '대한';

// 에러 타입
export class SajuError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SajuError';
  }
}

// 해석 유파 관련 타입
export * from './interpretation.js';

