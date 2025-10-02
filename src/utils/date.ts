/**
 * date-fns 기반 날짜 처리 유틸리티
 * PRD Priority 2.2: 날짜 처리 라이브러리 통합
 */

import { parseISO, format, addMinutes, isValid } from 'date-fns';
import { toDate, fromZonedTime } from 'date-fns-tz';

/**
 * 한국 시간대
 */
export const KOREA_TIMEZONE = 'Asia/Seoul';

/**
 * 진태양시 보정값 (분)
 */
export const TRUE_SOLAR_TIME_ADJUSTMENT = -30;

/**
 * ISO 날짜 문자열 파싱
 * @param dateString - ISO 형식 날짜 문자열
 * @returns Date 객체
 */
export function parseISODate(dateString: string): Date {
  const parsed = parseISO(dateString);
  if (!isValid(parsed)) {
    throw new Error(`잘못된 날짜 형식: ${dateString}`);
  }
  return parsed;
}

/**
 * 날짜와 시간을 결합하여 Date 객체 생성
 * @param dateStr - 날짜 문자열 (YYYY-MM-DD)
 * @param timeStr - 시간 문자열 (HH:mm)
 * @returns Date 객체
 */
export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const isoString = `${dateStr}T${timeStr}:00`;
  return parseISODate(isoString);
}

/**
 * 한국 시간대로 변환
 * @param date - Date 객체
 * @returns 한국 시간대로 변환된 Date 객체
 */
export function toKoreaTime(date: Date): Date {
  return toDate(date, { timeZone: KOREA_TIMEZONE });
}

/**
 * 한국 시간대에서 UTC로 변환
 * @param date - Date 객체
 * @returns UTC Date 객체
 */
export function fromKoreaTime(date: Date): Date {
  return fromZonedTime(date, KOREA_TIMEZONE);
}

/**
 * 진태양시 보정 적용
 * @param date - Date 객체
 * @returns 진태양시 보정이 적용된 Date 객체
 */
export function applyTrueSolarTimeAdjustment(date: Date): Date {
  return addMinutes(date, TRUE_SOLAR_TIME_ADJUSTMENT);
}

/**
 * 사주 계산용 날짜 준비
 * 1. 날짜와 시간 결합
 * 2. 한국 시간대 적용
 * 3. 진태양시 보정
 *
 * @param dateStr - 날짜 문자열 (YYYY-MM-DD)
 * @param timeStr - 시간 문자열 (HH:mm)
 * @returns 사주 계산에 사용할 Date 객체
 */
export function prepareSajuDate(dateStr: string, timeStr: string): Date {
  const combined = combineDateAndTime(dateStr, timeStr);
  const koreaTime = toKoreaTime(combined);
  return applyTrueSolarTimeAdjustment(koreaTime);
}

/**
 * Date 객체를 표준 형식으로 포맷
 * @param date - Date 객체
 * @param formatStr - 포맷 문자열 (기본: 'yyyy-MM-dd HH:mm:ss')
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(date: Date, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  return format(date, formatStr);
}

/**
 * Date 객체에서 연도 추출
 * @param date - Date 객체
 * @returns 연도 (YYYY)
 */
export function getYear(date: Date): number {
  return date.getFullYear();
}

/**
 * Date 객체에서 월 추출
 * @param date - Date 객체
 * @returns 월 (1-12)
 */
export function getMonth(date: Date): number {
  return date.getMonth() + 1;
}

/**
 * Date 객체에서 일 추출
 * @param date - Date 객체
 * @returns 일 (1-31)
 */
export function getDay(date: Date): number {
  return date.getDate();
}

/**
 * Date 객체에서 시간 추출
 * @param date - Date 객체
 * @returns 시간 (0-23)
 */
export function getHour(date: Date): number {
  return date.getHours();
}

/**
 * Date 객체에서 분 추출
 * @param date - Date 객체
 * @returns 분 (0-59)
 */
export function getMinute(date: Date): number {
  return date.getMinutes();
}

/**
 * 날짜 유효성 검증
 * @param date - Date 객체
 * @returns 유효 여부
 */
export function isValidDate(date: Date): boolean {
  return isValid(date);
}
