/**
 * get_daily_fortune 도구 구현
 */

import { getDailyFortune } from '../lib/fortune.js';
import { isValidDate } from '../lib/calendar.js';
import type { SajuData } from '../types/index.js';

export interface GetDailyFortuneArgs {
  sajuData: SajuData;
  date: string;
}

export function handleGetDailyFortune(args: GetDailyFortuneArgs): string {
  // 입력 검증
  if (!args.sajuData) {
    throw new Error('사주 데이터가 필요합니다. 먼저 calculate_saju를 실행하세요.');
  }

  if (!isValidDate(args.date)) {
    throw new Error(`유효하지 않은 날짜 형식입니다: ${args.date}. YYYY-MM-DD 형식을 사용하세요.`);
  }

  // 일일 운세 생성
  const dailyFortune = getDailyFortune(args.sajuData, args.date);

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

