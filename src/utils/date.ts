/**
 * date-fns 기반 날짜 처리 유틸리티
 * PRD Priority 2.2: 날짜 처리 라이브러리 통합
 */

import { parseISO, format, addMinutes, isValid, differenceInYears } from 'date-fns';
import { toDate, fromZonedTime } from 'date-fns-tz';
import { getLongitudeOffsetMinutesForSaju } from '../data/longitude_table.js';

/**
 * 한국 시간대
 */
export const KOREA_TIMEZONE = 'Asia/Seoul';

/**
 * 출생일시를 대한민국 벽시계 시각으로 해석하여 UTC 시각으로 변환합니다.
 * IANA `Asia/Seoul` 규칙을 사용하므로 1948~1960·1987~1988 일광절약시간(썸머타임) 구간이 반영됩니다.
 * 입력은 당시 기록된 시계 시각(표준시+1h로 앞당겨졌던 시기)을 그대로 넣는 것을 가정합니다.
 */
export function parseBirthDateTimeKorea(birthDate: string, birthTime: string): Date {
  const d = toDate(`${birthDate}T${birthTime}:00`, { timeZone: KOREA_TIMEZONE });
  if (isNaN(d.getTime())) {
    throw new Error(`유효하지 않은 출생일시입니다: ${birthDate} ${birthTime}`);
  }
  return d;
}

/**
 * 진태양시 보정값 (분) — 레거시 고정값. 사주 계산은 {@link getAdjustedBirthInstantForSaju}의 경도 보정을 사용합니다.
 */
export const TRUE_SOLAR_TIME_ADJUSTMENT = -30;

/**
 * 출생 벽시계 시각(썸머타임 반영)에 동경 135° 대비 출생지 경도 보정을 더한 시각(UTC)
 */
export function getAdjustedBirthInstantForSaju(
  solarDate: string,
  birthTime: string,
  birthCity?: string
): Date {
  const wall = parseBirthDateTimeKorea(solarDate, birthTime);
  const offsetMin = getLongitudeOffsetMinutesForSaju(birthCity);
  return addMinutes(wall, offsetMin);
}

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
 * 운이 적용되는 양력 연도(세운·연운 등)의 연말(12/31) 시점 만 나이
 * 해당 해의 운을 볼 때 표시하는 나이를 통일하기 위해 사용
 */
export function getManAgeForFortuneYear(birthDateStr: string, fortuneYear: number): number {
  const birth = parseISODate(birthDateStr);
  const yearEnd = new Date(fortuneYear, 11, 31, 23, 59, 59, 999);
  return Math.max(0, differenceInYears(yearEnd, birth));
}

/**
 * 날짜와 시간을 결합하여 Date 객체 생성 (대한민국 역사 시각·썸머타임 반영)
 * @param dateStr - 날짜 문자열 (YYYY-MM-DD)
 * @param timeStr - 시간 문자열 (HH:mm)
 * @returns Date 객체
 */
export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  return parseBirthDateTimeKorea(dateStr, timeStr);
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
 * 1. 출생일시를 Asia/Seoul 벽시계 시각으로 해석(썸머타임 구간 포함)
 * 2. 출생지 경도 보정(한국 표준시 동경 135° 대비)
 *
 * @param dateStr - 날짜 문자열 (YYYY-MM-DD)
 * @param timeStr - 시간 문자열 (HH:mm)
 * @param birthCity - 출생 시군구명 (longitude_table 키, 예: 서울). 생략 시 서울
 * @returns 사주 계산에 사용할 Date 객체
 */
export function prepareSajuDate(dateStr: string, timeStr: string, birthCity?: string): Date {
  return getAdjustedBirthInstantForSaju(dateStr, timeStr, birthCity);
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
