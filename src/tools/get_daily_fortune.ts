/**
 * get_daily_fortune 도구 구현
 */

import { getDailyFortune } from '../lib/fortune.js';
import { calculateSaju } from '../lib/saju.js';
import { isValidDate } from '../lib/calendar.js';
import type { CalendarType, Gender } from '../types/index.js';

export interface GetDailyFortuneArgs {
  birthDate: string;
  birthTime: string;
  calendar?: CalendarType;
  isLeapMonth?: boolean;
  gender: Gender;
  targetDate: string;
}

export function handleGetDailyFortune(args: GetDailyFortuneArgs): string {
  const {
    birthDate,
    birthTime,
    calendar = 'solar',
    isLeapMonth = false,
    gender,
    targetDate,
  } = args;

  // 입력 검증
  if (!isValidDate(targetDate)) {
    throw new Error(`유효하지 않은 날짜 형식입니다: ${targetDate}. YYYY-MM-DD 형식을 사용하세요.`);
  }

  // 사주 계산
  const sajuData = calculateSaju(birthDate, birthTime, calendar, isLeapMonth, gender);

  // 일일 운세 생성
  const dailyFortune = getDailyFortune(sajuData, targetDate);

  return JSON.stringify(dailyFortune);
}

