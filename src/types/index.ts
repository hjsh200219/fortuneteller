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

  // 특수 요소
  specialMarks?: string[];
  dominantElements?: WuXing[];
  weakElements?: WuXing[];
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

