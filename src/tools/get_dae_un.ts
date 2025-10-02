/**
 * get_dae_un 도구 핸들러
 * 대운(大運) 조회 기능
 */

import { calculateSaju } from '../lib/saju.js';
import { calculateDaeUn, getDaeUnAtAge, formatDaeUnList, formatDaeUn } from '../lib/dae_un.js';
import type { CalendarType, Gender } from '../types/index.js';

export interface GetDaeUnArgs {
  birthDate: string;
  birthTime: string;
  calendar?: CalendarType;
  isLeapMonth?: boolean;
  gender: Gender;
  age?: number; // 특정 나이의 대운 조회 (옵션)
  limit?: number; // 조회할 대운 개수 (기본 10개)
}

export function handleGetDaeUn(args: GetDaeUnArgs): string {
  try {
    const {
      birthDate,
      birthTime,
      calendar = 'solar',
      isLeapMonth = false,
      gender,
      age,
      limit = 10,
    } = args;

    // 1. 사주 계산
    const sajuData = calculateSaju(birthDate, birthTime, calendar, isLeapMonth, gender);

    // 2. 대운 계산
    const daeUnPeriods = calculateDaeUn(sajuData);

    let result = '';

    // 3. 특정 나이의 대운 조회
    if (age !== undefined) {
      const currentDaeUn = getDaeUnAtAge(sajuData, age);

      if (currentDaeUn) {
        result += `## ${age}세 대운\n\n`;
        result += formatDaeUn(currentDaeUn) + '\n\n';
        result += `### 대운 분석\n\n`;
        result += `- **천간**: ${currentDaeUn.stem} (${currentDaeUn.stemElement})\n`;
        result += `  - 상반기 5년(${currentDaeUn.startAge}-${currentDaeUn.startAge + 4}세)의 주요 운세 영향\n\n`;
        result += `- **지지**: ${currentDaeUn.branch} (${currentDaeUn.branchElement})\n`;
        result += `  - 하반기 5년(${currentDaeUn.startAge + 5}-${currentDaeUn.endAge}세)의 주요 운세 영향\n\n`;
      } else {
        result += `${age}세에 해당하는 대운 정보를 찾을 수 없습니다.\n\n`;
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
