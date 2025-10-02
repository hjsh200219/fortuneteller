/**
 * get_monthly_fortune MCP 도구
 * 월운(月運) 월별 운세 조회
 */

import type { CalendarType, Gender } from '../types/index.js';
import { calculateSaju } from '../lib/saju.js';
import { analyzeWolUn, getMultipleWolUn } from '../lib/wol_un.js';
import { analyzeSeUn } from '../lib/se_un.js';

export interface GetMonthlyFortuneArgs {
  birthDate: string;
  birthTime: string;
  calendar?: CalendarType;
  isLeapMonth?: boolean;
  gender: Gender;
  targetMonth?: string; // "YYYY-MM" 형식 (선택)
  months?: number; // 조회할 개월수 (기본 1개월, 여러 달 조회 시 증가)
}

export function handleGetMonthlyFortune(args: GetMonthlyFortuneArgs): string {
  const {
    birthDate,
    birthTime,
    calendar = 'solar',
    isLeapMonth = false,
    gender,
    targetMonth,
    months = 1,
  } = args;

  // 사주 계산
  const sajuData = calculateSaju(birthDate, birthTime, calendar, isLeapMonth, gender);

  let result = '# 월운(月運) 월별 운세\n\n';

  // targetMonth 파싱 (YYYY-MM 형식)
  let year: number;
  let month: number;

  if (targetMonth) {
    const parts = targetMonth.split('-');
    if (parts.length !== 2) {
      throw new Error(`잘못된 월 형식입니다: ${targetMonth}. YYYY-MM 형식을 사용하세요.`);
    }
    year = parseInt(parts[0]!, 10);
    month = parseInt(parts[1]!, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      throw new Error(`유효하지 않은 월입니다: ${targetMonth}`);
    }
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  // 년간 계산 (세운에서 가져옴)
  const seUn = analyzeSeUn(sajuData, year);
  const yearStem = seUn.stem;

  // 특정 월 단독 조회 vs 여러 달 조회
  if (months === 1) {
    // 단일 월 상세 조회
    const wolUn = analyzeWolUn(sajuData, year, month, yearStem);
    result += formatSingleMonth(wolUn);
  } else {
    // 여러 달 요약 조회
    const wolUnList = getMultipleWolUn(sajuData, year, month, months, yearStem);

    result += `**${year}년 ${month}월부터 ${months}개월간의 운세**\n\n`;

    for (const wolUn of wolUnList) {
      result += formatMonthSummary(wolUn);
      result += '\n---\n\n';
    }
  }

  return result;
}

/**
 * 단일 월 상세 포맷
 */
function formatSingleMonth(wolUn: any): string {
  let result = `## ${wolUn.year}년 ${wolUn.month}월 (${wolUn.ganjiName})\n\n`;

  result += `**천간지지**: ${wolUn.stem}${wolUn.branch} (${wolUn.stemElement}/${wolUn.branchElement})\n`;
  result += `**절기**: ${wolUn.solarTerm}\n\n`;

  result += `### 오행 관계\n\n`;
  result += `- **일간과의 관계**: ${wolUn.interaction.withDayMaster}\n`;
  result += `- **용신과의 관계**: ${wolUn.interaction.withYongSin}\n`;
  result += `- **세운과의 조화**: ${wolUn.interaction.withYear}\n\n`;

  result += `### 운세 분석\n\n`;
  result += `**전반적 운세**\n${wolUn.fortune.overall}\n\n`;
  result += `**업무운**\n${wolUn.fortune.work}\n\n`;
  result += `**금전운**\n${wolUn.fortune.money}\n\n`;
  result += `**건강운**\n${wolUn.fortune.health}\n\n`;
  result += `**연애운**\n${wolUn.fortune.love}\n\n`;

  result += `### 조언\n\n`;
  for (const advice of wolUn.advice) {
    result += `- ${advice}\n`;
  }
  result += '\n';

  if (wolUn.luckyDays && wolUn.luckyDays.length > 0) {
    result += `**길일**: ${wolUn.luckyDays.join('일, ')}일\n`;
  }
  if (wolUn.cautionDays && wolUn.cautionDays.length > 0) {
    result += `**주의일**: ${wolUn.cautionDays.join('일, ')}일\n`;
  }

  return result;
}

/**
 * 여러 달 요약 포맷
 */
function formatMonthSummary(wolUn: any): string {
  let result = `## ${wolUn.year}년 ${wolUn.month}월 (${wolUn.ganjiName})\n\n`;

  result += `**전반**: ${wolUn.fortune.overall}\n\n`;
  result += `**업무**: ${wolUn.fortune.work}\n\n`;

  if (wolUn.advice.length > 0) {
    result += `**조언**: ${wolUn.advice[0]}\n`;
  }

  return result;
}
