/**
 * 음양력 변환 라이브러리
 * 양력 ↔ 음력 변환 기능
 *
 * 로컬 테이블 기반 (1900-2200)
 */

import type { CalendarType, CalendarConversion } from '../types/index.js';
import { getCurrentSolarTerm } from '../data/solar_terms.js';
import { solarToLunarLocal, lunarToSolarLocal } from '../data/lunar_table.js';

/**
 * 음양력 변환
 */
export function convertCalendar(
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
    const result = solarToLunarLocal(
      inputDate.getFullYear(),
      inputDate.getMonth() + 1,
      inputDate.getDate()
    );

    if (!result) {
      throw new Error(
        `지원하지 않는 연도입니다: ${inputDate.getFullYear()} (1900-2200만 지원)`
      );
    }

    const dateString = `${result.year}-${String(result.month).padStart(2, '0')}-${String(result.day).padStart(2, '0')}`;

    return {
      originalDate: date,
      originalCalendar: 'solar',
      convertedDate: dateString,
      convertedCalendar: 'lunar',
      isLeapMonth: result.isLeapMonth,
      solarTerm: getCurrentSolarTerm(inputDate),
    };
  }

  // 음력 → 양력
  if (fromCalendar === 'lunar' && toCalendar === 'solar') {
    const result = lunarToSolarLocal(
      inputDate.getFullYear(),
      inputDate.getMonth() + 1,
      inputDate.getDate(),
      false // 기본적으로 평달로 가정
    );

    if (!result) {
      throw new Error(
        `지원하지 않는 연도입니다: ${inputDate.getFullYear()} (1900-2200만 지원)`
      );
    }

    const dateString = `${result.year}-${String(result.month).padStart(2, '0')}-${String(result.day).padStart(2, '0')}`;
    const solarDate = new Date(dateString);

    return {
      originalDate: date,
      originalCalendar: 'lunar',
      convertedDate: dateString,
      convertedCalendar: 'solar',
      solarTerm: getCurrentSolarTerm(solarDate),
    };
  }

  throw new Error('유효하지 않은 달력 변환입니다');
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
