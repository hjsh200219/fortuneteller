/**
 * get_dae_un 도구 핸들러
 * 대운(大運) 조회 기능
 */

import { calculateSaju } from '../lib/saju.js';
import { calculateDaeUn, getDaeUnAtAge, formatDaeUnList, formatDaeUn } from '../lib/dae_un.js';
import type { CalendarType, Gender } from '../types/index.js';
import { getManAgeForFortuneYear } from '../utils/date.js';

export interface GetDaeUnArgs {
  birthDate: string;
  birthTime: string;
  birthCity?: string;
  calendar?: CalendarType;
  isLeapMonth?: boolean;
  gender: Gender;
  /** 특정 만 나이의 대운 조회 (targetYear와 동시에 주면 targetYear 우선) */
  age?: number;
  /** 운이 들어오는 양력 연도 — 해당 연도 말 기준 만 나이로 대운 구간 조회 */
  targetYear?: number;
  limit?: number;
}

export function handleGetDaeUn(args: GetDaeUnArgs): string {
  try {
    const {
      birthDate,
      birthTime,
      birthCity,
      calendar = 'solar',
      isLeapMonth = false,
      gender,
      age,
      targetYear,
      limit = 10,
    } = args;

    // 1. 사주 계산
    const sajuData = calculateSaju(birthDate, birthTime, calendar, isLeapMonth, gender, birthCity);

    // 2. 대운 계산
    const daeUnPeriods = calculateDaeUn(sajuData);

    let result = '';

    const resolvedAge =
      targetYear !== undefined
        ? getManAgeForFortuneYear(birthDate, targetYear)
        : age;

    // 3. 특정 만 나이(또는 운 연도 기준 만 나이)의 대운 조회
    if (resolvedAge !== undefined) {
      const currentDaeUn = getDaeUnAtAge(sajuData, resolvedAge);

      if (currentDaeUn) {
        const ageLabel =
          targetYear !== undefined
            ? `${targetYear}년 운 기준 만 ${resolvedAge}세`
            : `만 ${resolvedAge}세`;
        result += `## ${ageLabel} 대운\n\n`;
        result += formatDaeUn(currentDaeUn) + '\n\n';
        result += `### 대운 분석\n\n`;
        result += `- **천간**: ${currentDaeUn.stem} (${currentDaeUn.stemElement})\n`;
        result += `  - 상반기 5년(${currentDaeUn.startAge}-${currentDaeUn.startAge + 4}세)의 주요 운세 영향\n\n`;
        result += `- **지지**: ${currentDaeUn.branch} (${currentDaeUn.branchElement})\n`;
        result += `  - 하반기 5년(${currentDaeUn.startAge + 5}-${currentDaeUn.endAge}세)의 주요 운세 영향\n\n`;
      } else {
        result += `${resolvedAge}세(만 나이)에 해당하는 대운 정보를 찾을 수 없습니다.\n\n`;
      }
    }

    // 4. 전체 대운 목록
    result += `## 전체 대운 목록\n\n`;
    result += formatDaeUnList(daeUnPeriods, limit);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return `오류가 발생했습니다: ${error.message}`;
    }
    return '알 수 없는 오류가 발생했습니다.';
  }
}
