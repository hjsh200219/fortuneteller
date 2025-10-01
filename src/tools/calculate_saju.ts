/**
 * calculate_saju 도구 구현
 */

import { calculateSaju, formatSaju } from '../lib/saju.js';
import { isValidDate, isValidTime } from '../lib/calendar.js';
import type { CalendarType, Gender } from '../types/index.js';

export interface CalculateSajuArgs {
  birthDate: string;
  birthTime: string;
  calendar: CalendarType;
  isLeapMonth?: boolean;
  gender: Gender;
}

export function handleCalculateSaju(args: CalculateSajuArgs): string {
  // 입력 검증
  if (!isValidDate(args.birthDate)) {
    throw new Error(`유효하지 않은 날짜 형식입니다: ${args.birthDate}. YYYY-MM-DD 형식을 사용하세요.`);
  }

  if (!isValidTime(args.birthTime)) {
    throw new Error(`유효하지 않은 시간 형식입니다: ${args.birthTime}. HH:MM 형식을 사용하세요.`);
  }

  // 사주 계산
  const sajuData = calculateSaju(
    args.birthDate,
    args.birthTime,
    args.calendar,
    args.isLeapMonth || false,
    args.gender
  );

  // 결과 포맷팅
  const formatted = formatSaju(sajuData);

  return JSON.stringify(
    {
      success: true,
      data: sajuData,
      formatted,
    },
    null,
    2
  );
}

