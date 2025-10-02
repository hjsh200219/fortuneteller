/**
 * 음양력 변환 라이브러리
 * 양력 ↔ 음력 변환 기능
 *
 * 우선순위:
 * 1. 한국천문연구원(KASI) API (정확도 높음)
 * 2. 근사 계산 방식 (API 실패 시 폴백)
 */

import type { CalendarType, CalendarConversion } from '../types/index.js';
import { getCurrentSolarTerm } from '../data/solar_terms.js';
import { solarToLunarWithFallback, lunarToSolarWithFallback } from './kasi_api.js';

/**
 * 음양력 변환 (KASI API 우선, 실패 시 근사 방식)
 */
export async function convertCalendar(
  date: string,
  fromCalendar: CalendarType,
  toCalendar: CalendarType
): Promise<CalendarConversion> {
  const inputDate = new Date(date);

  if (fromCalendar === toCalendar) {
    return {
      originalDate: date,
      originalCalendar: fromCalendar,
      convertedDate: date,
      convertedCalendar: toCalendar,
      solarTerm: getCurrentSolarTerm(inputDate),
    };
  }

  // 양력 → 음력
  if (fromCalendar === 'solar' && toCalendar === 'lunar') {
    const lunarDate = await solarToLunarAuto(inputDate);
    return {
      originalDate: date,
      originalCalendar: 'solar',
      convertedDate: lunarDate.dateString,
      convertedCalendar: 'lunar',
      isLeapMonth: lunarDate.isLeapMonth,
      solarTerm: getCurrentSolarTerm(inputDate),
    };
  }

  // 음력 → 양력
  if (fromCalendar === 'lunar' && toCalendar === 'solar') {
    const solarDate = await lunarToSolarAuto(inputDate);
    return {
      originalDate: date,
      originalCalendar: 'lunar',
      convertedDate: solarDate.dateString,
      convertedCalendar: 'solar',
      solarTerm: getCurrentSolarTerm(solarDate.date),
    };
  }

  throw new Error('유효하지 않은 달력 변환입니다');
}

/**
 * 동기 버전 음양력 변환 (근사 방식만 사용)
 * 하위 호환성을 위해 유지
 */
export function convertCalendarSync(
  date: string,
  fromCalendar: CalendarType,
  toCalendar: CalendarType
): CalendarConversion {
  const inputDate = new Date(date);

  if (fromCalendar === toCalendar) {
    return {
      originalDate: date,
      originalCalendar: fromCalendar,
      convertedDate: date,
      convertedCalendar: toCalendar,
      solarTerm: getCurrentSolarTerm(inputDate),
    };
  }

  // 양력 → 음력
  if (fromCalendar === 'solar' && toCalendar === 'lunar') {
    const lunarDate = solarToLunarApprox(inputDate);
    return {
      originalDate: date,
      originalCalendar: 'solar',
      convertedDate: lunarDate.dateString,
      convertedCalendar: 'lunar',
      isLeapMonth: lunarDate.isLeapMonth,
      solarTerm: getCurrentSolarTerm(inputDate),
    };
  }

  // 음력 → 양력
  if (fromCalendar === 'lunar' && toCalendar === 'solar') {
    const solarDate = lunarToSolarApprox(inputDate);
    return {
      originalDate: date,
      originalCalendar: 'lunar',
      convertedDate: solarDate.dateString,
      convertedCalendar: 'solar',
      solarTerm: getCurrentSolarTerm(solarDate.date),
    };
  }

  throw new Error('유효하지 않은 달력 변환입니다');
}

/**
 * 양력 → 음력 변환 (자동 폴백)
 */
async function solarToLunarAuto(
  solarDate: Date
): Promise<{ dateString: string; isLeapMonth: boolean }> {
  try {
    // KASI API + 로컬 테이블 폴백
    const result = await solarToLunarWithFallback(
      solarDate.getFullYear(),
      solarDate.getMonth() + 1,
      solarDate.getDate()
    );

    const dateString = `${result.lunYear}-${result.lunMonth.padStart(2, '0')}-${result.lunDay.padStart(2, '0')}`;
    const isLeapMonth = result.lunLeapmonth === '윤달';

    return { dateString, isLeapMonth };
  } catch (error) {
    // 최종 폴백: 근사 방식
    console.warn('KASI API 및 로컬 테이블 실패, 근사 방식 사용:', error);
    return solarToLunarApprox(solarDate);
  }
}

/**
 * 음력 → 양력 변환 (자동 폴백)
 */
async function lunarToSolarAuto(
  lunarDate: Date,
  isLeapMonth: boolean = false
): Promise<{ dateString: string; date: Date }> {
  try {
    // KASI API + 로컬 테이블 폴백
    const result = await lunarToSolarWithFallback(
      lunarDate.getFullYear(),
      lunarDate.getMonth() + 1,
      lunarDate.getDate(),
      isLeapMonth
    );

    const dateString = `${result.solYear}-${result.solMonth.padStart(2, '0')}-${result.solDay.padStart(2, '0')}`;
    const date = new Date(dateString);

    return { dateString, date };
  } catch (error) {
    // 최종 폴백: 근사 방식
    console.warn('KASI API 및 로컬 테이블 실패, 근사 방식 사용:', error);
    return lunarToSolarApprox(lunarDate);
  }
}

/**
 * 양력 → 음력 변환 (근사 방식)
 * 평균 음력 월: 29.53일
 */
function solarToLunarApprox(solarDate: Date): { dateString: string; isLeapMonth: boolean } {
  // 1900년 1월 31일 = 음력 1900년 1월 1일 (기준점)
  const baseDate = new Date(1900, 0, 31);
  const diffDays = Math.floor((solarDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  // 음력 평균 1년: 354일 (12개월 × 29.5일)
  const lunarYearDays = 354;
  let year = 1900 + Math.floor(diffDays / lunarYearDays);
  let remainingDays = diffDays % lunarYearDays;

  // 월 계산 (29.5일 평균)
  const lunarMonthDays = 29.53;
  let month = Math.floor(remainingDays / lunarMonthDays) + 1;
  let day = Math.floor(remainingDays % lunarMonthDays) + 1;

  // 보정
  if (month > 12) {
    year++;
    month = 1;
  }
  if (day > 30) {
    month++;
    day = 1;
  }

  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    dateString,
    isLeapMonth: false, // 근사 방식에서는 윤달 미고려
  };
}

/**
 * 음력 → 양력 변환 (근사 방식)
 */
function lunarToSolarApprox(lunarDate: Date): { dateString: string; date: Date } {
  const year = lunarDate.getFullYear();
  const month = lunarDate.getMonth();
  const day = lunarDate.getDate();

  // 1900년 음력 1월 1일 = 양력 1900년 1월 31일 (기준점)
  const baseDate = new Date(1900, 0, 31);

  // 음력 경과일 계산
  const lunarYearDays = 354;
  const lunarMonthDays = 29.53;

  const yearsDiff = year - 1900;
  const totalDays =
    yearsDiff * lunarYearDays + month * lunarMonthDays + day - baseDate.getDate();

  const solarDate = new Date(baseDate.getTime() + totalDays * 24 * 60 * 60 * 1000);

  const dateString = solarDate.toISOString().split('T')[0]!;

  return {
    dateString,
    date: solarDate,
  };
}

/**
 * 날짜 문자열 유효성 검사
 */
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * 시간 문자열 유효성 검사
 */
export function isValidTime(timeString: string): boolean {
  const regex = /^\d{2}:\d{2}$/;
  if (!regex.test(timeString)) {
    return false;
  }

  const [hours, minutes] = timeString.split(':').map(Number);
  return hours! >= 0 && hours! < 24 && minutes! >= 0 && minutes! < 60;
}
