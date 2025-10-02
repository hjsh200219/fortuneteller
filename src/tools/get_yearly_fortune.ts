/**
 * get_yearly_fortune MCP 도구
 * 세운(歲運) 연별 운세 조회
 */

import type { CalendarType, Gender } from '../types/index.js';
import { calculateSaju } from '../lib/saju.js';
import { analyzeSeUn, getMultipleSeUn } from '../lib/se_un.js';

export interface GetYearlyFortuneArgs {
  birthDate: string;
  birthTime: string;
  calendar: CalendarType;
  isLeapMonth: boolean;
  gender: Gender;
  targetYear?: number; // 특정 연도 조회 (선택)
  years?: number; // 조회할 연수 (기본 5년)
}

export function handleGetYearlyFortune(args: GetYearlyFortuneArgs): string {
  const { birthDate, birthTime, calendar, isLeapMonth, gender, targetYear, years = 5 } = args;

  // 사주 계산
  const sajuData = calculateSaju(birthDate, birthTime, calendar, isLeapMonth, gender);

  let result = '# 세운(歲運) 연별 운세\n\n';

  // 특정 연도 조회 vs 여러 해 조회
  if (targetYear) {
    const seUn = analyzeSeUn(sajuData, targetYear);
    result += formatSingleYear(seUn);
  } else {
    // 현재 연도부터 여러 해 조회
    const currentYear = new Date().getFullYear();
    const seUnList = getMultipleSeUn(sajuData, currentYear, years);

    result += `**${currentYear}년부터 ${years}년간의 운세**\n\n`;

    for (const seUn of seUnList) {
      result += formatYearSummary(seUn);
      result += '\n---\n\n';
    }
  }

  return result;
}

/**
 * 단일 연도 상세 포맷
 */
function formatSingleYear(seUn: any): string {
  let result = `## ${seUn.year}년 (${seUn.ganjiName}, ${seUn.yearAnimal})\n\n`;

  result += `**나이**: ${seUn.age}세\n`;
  result += `**천간지지**: ${seUn.stem}${seUn.branch} (${seUn.stemElement}/${seUn.branchElement})\n\n`;

  result += `### 오행 관계\n\n`;
  result += `- **일간과의 관계**: ${seUn.interaction.withDayMaster}\n`;
  result += `- **용신과의 관계**: ${seUn.interaction.withYongSin}\n`;
  result += `- **오행 균형**: ${seUn.interaction.elementBalance}\n\n`;

  result += `### 운세 분석\n\n`;
  result += `**전반적 운세**\n${seUn.fortune.overall}\n\n`;
  result += `**직업운**\n${seUn.fortune.career}\n\n`;
  result += `**재물운**\n${seUn.fortune.wealth}\n\n`;
  result += `**건강운**\n${seUn.fortune.health}\n\n`;
  result += `**인간관계운**\n${seUn.fortune.relationship}\n\n`;

  if (seUn.monthlyHighlights) {
    result += `### 월별 하이라이트\n\n`;
    result += `**좋은 달**: ${seUn.monthlyHighlights.bestMonths.map((m: number) => `${m}월`).join(', ')}\n`;
    result += `**주의할 달**: ${seUn.monthlyHighlights.cautionMonths.map((m: number) => `${m}월`).join(', ')}\n\n`;
  }

  return result;
}

/**
 * 여러 연도 요약 포맷
 */
function formatYearSummary(seUn: any): string {
  let result = `## ${seUn.year}년 (${seUn.ganjiName}, 만 ${seUn.age - 1}세)\n\n`;

  result += `**전반**: ${seUn.fortune.overall}\n\n`;
  result += `**직업**: ${seUn.fortune.career}\n\n`;
  result += `**재물**: ${seUn.fortune.wealth}\n\n`;

  if (seUn.monthlyHighlights?.bestMonths.length > 0) {
    result += `**좋은 달**: ${seUn.monthlyHighlights.bestMonths.map((m: number) => `${m}월`).join(', ')}\n`;
  }

  return result;
}
