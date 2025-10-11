/**
 * convert_calendar 도구 구현
 * 로컬 테이블 기반 음양력 변환 (1900-2200)
 */

import { convertCalendar, isValidDate } from '../lib/calendar.js';
import type { CalendarType } from '../types/index.js';

export interface ConvertCalendarArgs {
  date: string;
  fromCalendar: CalendarType;
  toCalendar: CalendarType;
}

export function handleConvertCalendar(args: ConvertCalendarArgs): string {
  // 입력 검증
  if (!isValidDate(args.date)) {
    throw new Error(`유효하지 않은 날짜 형식입니다: ${args.date}. YYYY-MM-DD 형식을 사용하세요.`);
  }

  if (args.fromCalendar === args.toCalendar) {
    return JSON.stringify(
      {
        success: true,
        message: '동일한 달력 체계입니다.',
        data: {
          originalDate: args.date,
          convertedDate: args.date,
        },
      },
      null,
      2
    );
  }

  // 달력 변환 (로컬 테이블 사용)
  const result = convertCalendar(args.date, args.fromCalendar, args.toCalendar);

  const formatted = `
📅 음양력 변환 결과

${getCalendarKorean(args.fromCalendar)} → ${getCalendarKorean(args.toCalendar)}

입력: ${result.originalDate} (${getCalendarKorean(result.originalCalendar)})
결과: ${result.convertedDate} (${getCalendarKorean(result.convertedCalendar)})

${result.isLeapMonth ? '⚠️ 윤달입니다' : ''}
${result.solarTerm ? `절기: ${result.solarTerm}` : ''}
  `.trim();

  return JSON.stringify(
    {
      success: true,
      data: result,
      formatted,
    },
    null,
    2
  );
}

function getCalendarKorean(calendar: CalendarType): string {
  return calendar === 'solar' ? '양력' : '음력';
}

