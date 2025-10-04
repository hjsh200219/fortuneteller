/**
 * compare_interpretation_schools MCP Tool
 * 유파 비교 도구
 */

import { calculateSaju } from '../lib/saju.js';
import { SchoolComparator } from '../lib/school_comparator.js';
import { InterpretationSettings } from '../lib/interpretation_settings.js';
import type { SchoolCode, SchoolComparisonResult } from '../types/interpretation.js';
import type { CalendarType, Gender } from '../types/index.js';

export interface CompareSchoolsParams {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  calendar?: CalendarType;
  isLeapMonth?: boolean;
  gender: Gender;
  /** 비교할 유파 목록 (기본: 모두) */
  schools?: SchoolCode[];
}

export interface CompareSchoolsResult {
  success: boolean;
  comparison?: SchoolComparisonResult;
  recommendedSchool?: SchoolCode;
  message: string;
}

/**
 * 유파 비교 분석
 */
export async function compareInterpretationSchools(
  params: CompareSchoolsParams
): Promise<CompareSchoolsResult> {
  try {
    // 날짜/시간 문자열 생성
    const birthDate = `${params.year}-${String(params.month).padStart(2, '0')}-${String(params.day).padStart(2, '0')}`;
    const birthTime = `${String(params.hour).padStart(2, '0')}:${String(params.minute).padStart(2, '0')}`;

    // 사주 계산
    const sajuData = calculateSaju(
      birthDate,
      birthTime,
      params.calendar || 'solar',
      params.isLeapMonth || false,
      params.gender
    );

    // 비교할 유파 (기본: 모두)
    const schools: SchoolCode[] = (params.schools || ['ziping', 'dts', 'qtbj', 'modern', 'shensha']) as SchoolCode[];

    // 현재 설정
    const settings = InterpretationSettings.getInstance().getSettings();

    // 비교 수행
    const comparison = await SchoolComparator.compareSchools(
      {
        year: sajuData.year,
        month: sajuData.month,
        day: sajuData.day,
        hour: sajuData.hour,
      },
      schools,
      settings
    );

    // 추천 유파
    const recommendedSchool = SchoolComparator.recommendSchool(settings, comparison.interpretations);

    return {
      success: true,
      comparison,
      recommendedSchool,
      message: `${schools.length}개 유파 비교 분석이 완료되었습니다.`,
    };
  } catch (error) {
    return {
      success: false,
      message: `유파 비교 실패: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
