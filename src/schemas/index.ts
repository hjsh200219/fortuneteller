/**
 * Zod 입력 검증 스키마 정의
 * PRD Priority 1.2: 입력 검증 강화
 */

import { z } from 'zod';

/**
 * 날짜 형식 검증 (YYYY-MM-DD)
 */
export const DateSchema = z.string().regex(
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  '날짜는 YYYY-MM-DD 형식이어야 합니다'
);

/**
 * 시간 형식 검증 (HH:mm)
 */
export const TimeSchema = z.string().regex(
  /^([01]\d|2[0-3]):([0-5]\d)$/,
  '시간은 HH:mm 형식이어야 합니다 (00:00~23:59)'
);

/**
 * 달력 타입 (양력/음력)
 */
export const CalendarTypeSchema = z.enum(['solar', 'lunar'], {
  errorMap: () => ({ message: '달력 타입은 solar 또는 lunar여야 합니다' })
});

/**
 * 성별
 */
export const GenderSchema = z.enum(['male', 'female'], {
  errorMap: () => ({ message: '성별은 male 또는 female이어야 합니다' })
});

/**
 * 사주 계산 입력 스키마
 */
export const CalculateSajuSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입 (solar: 양력, lunar: 음력)'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별 (male: 남자, female: 여자)')
});

/**
 * 운세 분석 입력 스키마
 */
export const AnalyzeFortuneSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별')
});

/**
 * 궁합 분석 입력 스키마
 */
export const CheckCompatibilitySchema = z.object({
  person1: z.object({
    birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
    birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
    calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
    isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
    gender: GenderSchema.describe('성별')
  }).describe('첫 번째 사람'),
  person2: z.object({
    birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
    birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
    calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
    isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
    gender: GenderSchema.describe('성별')
  }).describe('두 번째 사람')
});

/**
 * 달력 변환 입력 스키마
 */
export const ConvertCalendarSchema = z.object({
  date: DateSchema.describe('변환할 날짜 (YYYY-MM-DD)'),
  fromCalendar: CalendarTypeSchema.describe('입력 달력 타입'),
  toCalendar: CalendarTypeSchema.describe('출력 달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부 (음력 입력 시)')
});

/**
 * 일일 운세 입력 스키마
 */
export const GetDailyFortuneSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  targetDate: DateSchema.describe('운세를 볼 날짜 (YYYY-MM-DD)'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별')
});

/**
 * 대운 조회 입력 스키마
 */
export const GetDaeUnSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별')
});

/**
 * 용신 분석 입력 스키마
 */
export const AnalyzeYongSinSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별')
});

/**
 * 연별 운세 입력 스키마
 */
export const GetYearlyFortuneSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  targetYear: z.number().int().min(1900).max(2100).describe('운세를 볼 연도'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별')
});

/**
 * 월별 운세 입력 스키마
 */
export const GetMonthlyFortuneSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  targetYear: z.number().int().min(1900).max(2100).describe('운세를 볼 연도'),
  targetMonth: z.number().int().min(1).max(12).describe('운세를 볼 월 (1-12)'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별')
});

/**
 * 시간대별 운세 입력 스키마
 */
export const GetHourlyFortuneSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  targetDate: DateSchema.describe('운세를 볼 날짜 (YYYY-MM-DD)'),
  targetHour: z.number().int().min(0).max(23).describe('운세를 볼 시간 (0-23)'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별')
});

/**
 * 해석 설정 변경 입력 스키마
 */
export const SetInterpretationSettingsSchema = z.object({
  preset: z.enum(['ziping', 'modern', 'jukcheonsu', 'gungtongbogam', 'sinsal']).optional().describe('프리셋 (ziping, modern, jukcheonsu, gungtongbogam, sinsal)'),
  customWeights: z.object({
    gyeokguk: z.number().min(0).max(1).optional().describe('격국 가중치 (0-1)'),
    sipseong: z.number().min(0).max(1).optional().describe('십성 가중치 (0-1)'),
    sinsal: z.number().min(0).max(1).optional().describe('신살 가중치 (0-1)'),
    wuxing: z.number().min(0).max(1).optional().describe('오행 가중치 (0-1)')
  }).optional().describe('커스텀 가중치')
});

/**
 * 유파 비교 입력 스키마
 */
export const CompareInterpretationSchoolsSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별')
});

/**
 * 용신 방법론 분석 입력 스키마
 */
export const AnalyzeWithYongsinMethodSchema = z.object({
  birthDate: DateSchema.describe('생년월일 (YYYY-MM-DD)'),
  birthTime: TimeSchema.describe('출생 시간 (HH:mm)'),
  method: z.enum(['strength', 'seasonal', 'mediation', 'disease']).describe('용신 방법론 (strength: 강약용신, seasonal: 조후용신, mediation: 통관용신, disease: 병약용신)'),
  calendar: CalendarTypeSchema.default('solar').describe('달력 타입'),
  isLeapMonth: z.boolean().default(false).describe('음력 윤달 여부'),
  gender: GenderSchema.describe('성별')
});

/**
 * 타입 추출 유틸리티
 */
export type CalculateSajuInput = z.infer<typeof CalculateSajuSchema>;
export type AnalyzeFortuneInput = z.infer<typeof AnalyzeFortuneSchema>;
export type CheckCompatibilityInput = z.infer<typeof CheckCompatibilitySchema>;
export type ConvertCalendarInput = z.infer<typeof ConvertCalendarSchema>;
export type GetDailyFortuneInput = z.infer<typeof GetDailyFortuneSchema>;
export type GetDaeUnInput = z.infer<typeof GetDaeUnSchema>;
export type AnalyzeYongSinInput = z.infer<typeof AnalyzeYongSinSchema>;
export type GetYearlyFortuneInput = z.infer<typeof GetYearlyFortuneSchema>;
export type GetMonthlyFortuneInput = z.infer<typeof GetMonthlyFortuneSchema>;
export type GetHourlyFortuneInput = z.infer<typeof GetHourlyFortuneSchema>;
export type SetInterpretationSettingsInput = z.infer<typeof SetInterpretationSettingsSchema>;
export type CompareInterpretationSchoolsInput = z.infer<typeof CompareInterpretationSchoolsSchema>;
export type AnalyzeWithYongsinMethodInput = z.infer<typeof AnalyzeWithYongsinMethodSchema>;
