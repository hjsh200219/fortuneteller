/**
 * 만세력 대운 기준 참조 테이블
 * 전통 만세력의 대운 계산 기준을 데이터화
 * 
 * 대운 계산 원칙:
 * 1. 양남음녀(陽男陰女): 순행(順行) - 출생 후 다음 절기까지
 * 2. 음남양녀(陰男陽女): 역행(逆行) - 출생 전 이전 절기까지
 * 3. 3일 = 1년, 1일 = 4개월 (전통 공식)
 * 4. 2시간(1시진) = 10일 (만세력 정밀 계산)
 */

export interface DaeUnReference {
  /** 절기명 */
  solarTerm: string;
  /** 절기 양력 날짜시간 (ISO 8601) */
  datetime: string;
  /** 순행/역행 구분 */
  direction: 'forward' | 'backward';
  /** 출생일로부터 경과 일수 */
  daysFromBirth: number;
  /** 대운 시작 나이 (세) */
  startAge: number;
  /** 대운 시작 나이 (개월) */
  startAgeMonths: number;
}

/**
 * 만세력 전통 방식 대운 시작 나이 계산
 * 
 * 시간을 더 정밀하게 반영하는 공식:
 * - 1일 = 4개월
 * - 1시진(2시간) = 10일
 * - 따라서 2시간 = 10일 = 1.33개월
 * 
 * @param daysFromSolarTerm 절기로부터 경과 일수
 * @param hoursFromSolarTerm 일수 외 추가 시간
 * @returns 대운 시작 나이 (년, 개월)
 */
export function calculateDaeUnStartAgeFromManselyeok(
  daysFromSolarTerm: number,
  hoursFromSolarTerm: number
): { years: number; months: number; totalMonths: number } {
  // 전통 공식: 3일 = 1년 (12개월)
  // 따라서 1일 = 4개월
  const monthsFromDays = daysFromSolarTerm * 4;
  
  // 만세력 정밀 계산: 1시진(2시간) = 10일 = 40개월/3
  // 2시간 = 10일 → 10일 * 4개월 = 40개월
  // 따라서 1시간 = 20개월 / 3 = 6.67개월
  const monthsFromHours = (hoursFromSolarTerm / 3) * 6.67;
  
  const totalMonths = Math.round(monthsFromDays + monthsFromHours);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  return { years, months, totalMonths };
}

/**
 * 전통 만세력 시간 환산 테이블
 * 출처: 명리정종, 적천수 등 전통 명리서
 */
export const MANSELYEOK_TIME_CONVERSION = {
  /** 1일 = 4개월 */
  DAY_TO_MONTHS: 4,
  
  /** 3일 = 1년 */
  DAYS_PER_YEAR: 3,
  
  /** 1시진(2시간) = 10일 */
  SIJIN_TO_DAYS: 10,
  
  /** 1시진 = 2시간 */
  SIJIN_HOURS: 2,
  
  /** 따라서 1시간 = 5일 */
  HOUR_TO_DAYS: 5,
  
  /** 1시간 = 20개월 (5일 × 4개월/일) */
  HOUR_TO_MONTHS: 20 / 3, // 6.67개월
} as const;

/**
 * 만세력 기준 대운 시작 나이 정밀 계산
 * 
 * @param daysFromSolarTerm 절기로부터 경과 일수
 * @param hours 추가 시간
 * @param minutes 추가 분
 * @returns 대운 시작 나이 (정수)
 */
export function getManselyeokDaeUnStartAge(
  daysFromSolarTerm: number,
  hours: number = 0,
  minutes: number = 0
): number {
  const { DAY_TO_MONTHS, HOUR_TO_MONTHS } = MANSELYEOK_TIME_CONVERSION;
  
  // 일수를 개월로 환산
  let totalMonths = daysFromSolarTerm * DAY_TO_MONTHS;
  
  // 시간을 개월로 환산 (시간 포함)
  const totalHours = hours + minutes / 60;
  totalMonths += totalHours * HOUR_TO_MONTHS;
  
  // 년수로 환산
  const years = totalMonths / 12;
  
  // 6개월 이상이면 올림 (전통 방식)
  const startAge = Math.round(years);
  
  // 최소 0세, 최대 10세
  return Math.max(0, Math.min(10, startAge));
}

/**
 * 2시간(1시진) 단위 대운 보정 테이블
 * 만세력에서 시간을 고려한 정밀 계산
 */
export const SIJIN_DAEUN_ADJUSTMENT = {
  // 자시(23-01시)
  '자': { hours: 0, adjustment: 0 },
  // 축시(01-03시)
  '축': { hours: 2, adjustment: 10 }, // +10일
  // 인시(03-05시)
  '인': { hours: 4, adjustment: 20 }, // +20일
  // 묘시(05-07시)
  '묘': { hours: 6, adjustment: 30 }, // +30일
  // 진시(07-09시)
  '진': { hours: 8, adjustment: 40 }, // +40일
  // 사시(09-11시)
  '사': { hours: 10, adjustment: 50 }, // +50일
  // 오시(11-13시)
  '오': { hours: 12, adjustment: 60 }, // +60일
  // 미시(13-15시)
  '미': { hours: 14, adjustment: 70 }, // +70일
  // 신시(15-17시)
  '신': { hours: 16, adjustment: 80 }, // +80일
  // 유시(17-19시)
  '유': { hours: 18, adjustment: 90 }, // +90일
  // 술시(19-21시)
  '술': { hours: 20, adjustment: 100 }, // +100일
  // 해시(21-23시)
  '해': { hours: 22, adjustment: 110 }, // +110일
} as const;

