/**
 * get_hourly_fortune MCP 도구
 * 시운(時運) 시간대별 운세 조회
 */

import type { CalendarType, Gender } from '../types/index.js';
import { calculateSaju } from '../lib/saju.js';
import { analyzeSiUn, getDailySiUn } from '../lib/si_un.js';

export interface GetHourlyFortuneArgs {
  birthDate: string;
  birthTime: string;
  calendar: CalendarType;
  isLeapMonth: boolean;
  gender: Gender;
  targetDate?: string; // 특정 날짜 (YYYY-MM-DD, 선택)
  targetHour?: number; // 특정 시각 (0-23, 선택)
  allHours?: boolean; // 하루 전체 12시진 조회 (선택)
}

export function handleGetHourlyFortune(args: GetHourlyFortuneArgs): string {
  const {
    birthDate,
    birthTime,
    calendar,
    isLeapMonth,
    gender,
    targetDate,
    targetHour,
    allHours = false,
  } = args;

  // 사주 계산
  const sajuData = calculateSaju(birthDate, birthTime, calendar, isLeapMonth, gender);

  let result = '# 시운(時運) 시간대별 운세\n\n';

  const date = targetDate || new Date().toISOString().split('T')[0]!;

  // 하루 전체 12시진 조회 vs 특정 시간 조회
  if (allHours) {
    const siUnList = getDailySiUn(sajuData, date);

    result += `**${date} 하루 전체(12시진) 운세**\n\n`;

    for (const siUn of siUnList) {
      result += formatHourSummary(siUn);
      result += '\n---\n\n';
    }
  } else {
    const hour = targetHour !== undefined ? targetHour : new Date().getHours();
    const siUn = analyzeSiUn(sajuData, date, hour);
    result += formatSingleHour(siUn);
  }

  return result;
}

/**
 * 단일 시간 상세 포맷
 */
function formatSingleHour(siUn: any): string {
  let result = `## ${siUn.date} ${siUn.hourRange} (${siUn.branchName})\n\n`;

  result += `**간지**: ${siUn.ganjiName} (${siUn.stem}${siUn.branch})\n`;
  result += `**오행**: ${siUn.stemElement}/${siUn.branchElement}\n\n`;

  result += `### 오행 관계\n\n`;
  result += `- **일간과의 관계**: ${siUn.interaction.withDayMaster}\n`;
  result += `- **용신과의 관계**: ${siUn.interaction.withYongSin}\n\n`;

  result += `### 시간대별 운세\n\n`;
  result += `**활동 적합도**\n${siUn.fortune.activity}\n\n`;
  result += `**의사결정 적합도**\n${siUn.fortune.decision}\n\n`;
  result += `**미팅/만남 적합도**\n${siUn.fortune.meeting}\n\n`;
  result += `**휴식 적합도**\n${siUn.fortune.rest}\n\n`;

  result += `### 조언\n\n`;
  result += `${siUn.advice}\n\n`;

  if (siUn.luckyActivity) {
    result += `**추천 활동**: ${siUn.luckyActivity}\n\n`;
  }

  return result;
}

/**
 * 시간 요약 포맷
 */
function formatHourSummary(siUn: any): string {
  let result = `## ${siUn.hourRange} (${siUn.branchName})\n\n`;

  result += `**간지**: ${siUn.ganjiName}\n\n`;
  result += `**활동**: ${siUn.fortune.activity}\n\n`;

  if (siUn.luckyActivity) {
    result += `**추천**: ${siUn.luckyActivity}\n`;
  }

  return result;
}
