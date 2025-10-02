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

  // 결과 포맷팅
  const formatted = `
🌅 ${dailyFortune.date} 오늘의 운세

📊 종합 운: ${dailyFortune.overallLuck}/100 ${getLuckEmoji(dailyFortune.overallLuck)}

세부 운세:
  💰 재물운: ${dailyFortune.wealthLuck}/100 ${getLuckBar(dailyFortune.wealthLuck)}
  💼 직업운: ${dailyFortune.careerLuck}/100 ${getLuckBar(dailyFortune.careerLuck)}
  ❤️  건강운: ${dailyFortune.healthLuck}/100 ${getLuckBar(dailyFortune.healthLuck)}
  💕 애정운: ${dailyFortune.loveLuck}/100 ${getLuckBar(dailyFortune.loveLuck)}

🍀 오늘의 행운:
  • 색상: ${dailyFortune.luckyColor}
  • 방향: ${dailyFortune.luckyDirection}

💡 오늘의 조언:
${dailyFortune.advice}
  `.trim();

  return JSON.stringify(
    {
      success: true,
      data: dailyFortune,
      formatted,
    },
    null,
    2
  );
}

function getLuckEmoji(luck: number): string {
  if (luck >= 80) return '🌟';
  if (luck >= 60) return '😊';
  if (luck >= 40) return '😐';
  return '😞';
}

function getLuckBar(luck: number): string {
  const filled = Math.floor(luck / 10);
  const empty = 10 - filled;
  return '⭐'.repeat(filled) + '☆'.repeat(empty);
}

