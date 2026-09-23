/**
 * 로컬 음력 테이블 (1900-2200)
 *
 * 데이터: lunar_table_1900_2200.ts — scripts/generate_lunar_table_skyfield.py 로 JPL DE440 합삭·중기에서 생성.
 * 1900-2049 는 KASI 공표 음력과 월 일수·윤달·설날까지 전부 일치(tests/lunar-table-verification.test.ts).
 *
 * 날짜 계산은 달력 일 단위 UTC 산술로 한다(시간대·썸머타임 무관).
 */

import { LUNAR_TABLE_1900_2200, type LunarYearData } from './lunar_table_1900_2200.js';

export type { LunarYearData };

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDayNumber(year: number, month: number, day: number): number {
  return Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

function fromDayNumber(dayNumber: number): { year: number; month: number; day: number } {
  const d = new Date(dayNumber * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function newYearDayNumber(data: LunarYearData): number {
  const [y, m, d] = data.solarNewYear.split('-').map(Number);
  return toDayNumber(y!, m!, d!);
}

/** monthDays 배열 위치 → (음력 월, 윤달 여부) */
function monthAtIndex(data: LunarYearData, index: number): { month: number; isLeapMonth: boolean } {
  if (data.leapMonth === 0 || index < data.leapMonth) return { month: index + 1, isLeapMonth: false };
  if (index === data.leapMonth) return { month: data.leapMonth, isLeapMonth: true };
  return { month: index, isLeapMonth: false };
}

/** (음력 월, 윤달 여부) → monthDays 배열 위치. 없는 윤달이면 -1 */
function indexOfMonth(data: LunarYearData, month: number, isLeapMonth: boolean): number {
  if (isLeapMonth) return data.leapMonth === month ? month : -1;
  return data.leapMonth > 0 && month > data.leapMonth ? month : month - 1;
}

/**
 * 음력 연도 데이터 조회
 */
export function getLunarYearData(year: number): LunarYearData | null {
  return LUNAR_TABLE_1900_2200.find((data) => data.year === year) ?? null;
}

/**
 * 양력 → 음력
 */
export function solarToLunarLocal(
  year: number,
  month: number,
  day: number
): { year: number; month: number; day: number; isLeapMonth: boolean } | null {
  const target = toDayNumber(year, month, day);

  // 양력 연도 안에 설날 전이면 음력으로는 전년도
  let data = getLunarYearData(year);
  if (data && target < newYearDayNumber(data)) data = getLunarYearData(year - 1);
  if (!data) return null;

  let remaining = target - newYearDayNumber(data);
  for (let i = 0; i < data.monthDays.length; i++) {
    const days = data.monthDays[i]!;
    if (remaining < days) {
      return { year: data.year, ...monthAtIndex(data, i), day: remaining + 1 };
    }
    remaining -= days;
  }
  return null;
}

/**
 * 음력 → 양력. 없는 윤달이나 그 달 일수를 넘는 날은 null.
 */
export function lunarToSolarLocal(
  year: number,
  month: number,
  day: number,
  isLeapMonth: boolean = false
): { year: number; month: number; day: number } | null {
  const data = getLunarYearData(year);
  if (!data) return null;

  const index = indexOfMonth(data, month, isLeapMonth);
  if (index < 0 || index >= data.monthDays.length) return null;
  if (day < 1 || day > data.monthDays[index]!) return null;

  let elapsed = 0;
  for (let i = 0; i < index; i++) elapsed += data.monthDays[i]!;
  return fromDayNumber(newYearDayNumber(data) + elapsed + day - 1);
}

/**
 * 로컬 테이블 지원 범위 확인
 */
export function isYearSupported(year: number): boolean {
  return year >= 1900 && year <= 2200;
}
