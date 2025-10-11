/**
 * analyze_saju 통합 도구
 * 모든 사주 분석 기능을 하나로 통합
 */

import type { CalendarType, Gender, FortuneAnalysisType } from '../types/index.js';
import type { SchoolCode, YongSinMethod } from '../types/interpretation.js';
import { calculateSaju } from '../lib/saju.js';
import { analyzeFortune } from '../lib/fortune.js';
import { selectYongSin as selectYongSinOrig } from '../lib/yong_sin.js';
import { SchoolComparator } from '../lib/school_comparator.js';
import { selectYongSin } from '../lib/yongsin/selector.js';
import { InterpretationSettings } from '../lib/interpretation_settings.js';

export type AnalysisType = 
  | 'basic'           // 기본 사주팔자 계산
  | 'fortune'         // 운세 분석
  | 'yongsin'         // 용신 분석
  | 'school_compare'  // 유파 비교
  | 'yongsin_method'; // 용신 방법론

export interface AnalyzeSajuArgs {
  birthDate: string;
  birthTime: string;
  calendar?: CalendarType;
  isLeapMonth?: boolean;
  gender: Gender;
  analysisType: AnalysisType;
  
  // fortune용
  fortuneType?: FortuneAnalysisType;
  
  // school_compare용
  schools?: Array<'ziping' | 'dts' | 'qtbj' | 'modern' | 'shensha'>;
  
  // yongsin_method용
  method?: 'strength' | 'seasonal' | 'mediation' | 'disease';
}

export async function handleAnalyzeSaju(args: AnalyzeSajuArgs): Promise<string> {
  const {
    birthDate,
    birthTime,
    calendar = 'solar',
    isLeapMonth = false,
    gender,
    analysisType,
    fortuneType,
    schools,
    method,
  } = args;

  // 사주 계산
  const sajuData = calculateSaju(birthDate, birthTime, calendar, isLeapMonth, gender);

  switch (analysisType) {
    case 'basic':
      // 기본 사주팔자만 반환
      return JSON.stringify(sajuData);

    case 'fortune': {
      if (!fortuneType) {
        throw new Error('fortune 분석 시 fortuneType 필수');
      }
      const fortune = analyzeFortune(sajuData, fortuneType);
      return JSON.stringify(fortune);
    }

    case 'yongsin': {
      const yongsin = selectYongSinOrig(sajuData);
      return JSON.stringify(yongsin);
    }

    case 'school_compare': {
      const schoolList: SchoolCode[] = schools || ['ziping', 'dts', 'qtbj', 'modern', 'shensha'];
      const settings = InterpretationSettings.getInstance().getSettings();
      const comparison = await SchoolComparator.compareSchools(sajuData, schoolList, settings);
      return JSON.stringify(comparison);
    }

    case 'yongsin_method': {
      if (!method) {
        throw new Error('yongsin_method 분석 시 method 필수');
      }
      const yongsinResult = selectYongSin(sajuData, method as YongSinMethod);
      return JSON.stringify(yongsinResult);
    }

    default:
      throw new Error(`알 수 없는 analysisType: ${analysisType}`);
  }
}
