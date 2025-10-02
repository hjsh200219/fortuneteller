/**
 * analyze_with_yongsin_method MCP Tool
 * 특정 용신 방법론으로 사주 분석
 */

import { calculateSaju } from '../lib/saju.js';
import { YongSinSelector } from '../lib/yongsin/selector.js';
import { CareerMatcher } from '../lib/career_matcher.js';
import { InterpretationSettings } from '../lib/interpretation_settings.js';
import type { YongSinMethod } from '../types/interpretation.js';
import type { CalendarType, Gender } from '../types/index.js';

export interface AnalyzeWithYongSinParams {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  calendar?: CalendarType;
  isLeapMonth?: boolean;
  gender: Gender;
  /** 사용할 용신 방법론 */
  yongSinMethod: YongSinMethod;
  /** 직업 추천 포함 여부 */
  includeCareerRecommendation?: boolean;
}

export interface AnalyzeWithYongSinResult {
  success: boolean;
  analysis?: {
    /** 사주 사기둥 */
    pillars: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    /** 선택된 용신 */
    yongSin: {
      primary: string;
      secondary?: string;
      method: YongSinMethod;
      confidence: number;
      reasoning: string;
    };
    /** 오행 분포 */
    elementDistribution: Record<string, number>;
    /** 십성 분포 */
    tenGodDistribution?: Record<string, number>;
    /** 직업 추천 (옵션) */
    careerRecommendations?: Array<{
      name: string;
      category: string;
      matchScore: number;
      reasons: string[];
    }>;
  };
  message: string;
}

/**
 * 특정 용신 방법론으로 사주 분석
 */
export async function analyzeWithYongSinMethod(
  params: AnalyzeWithYongSinParams
): Promise<AnalyzeWithYongSinResult> {
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

    // 용신 선택
    const yongSinResult = YongSinSelector.select(sajuData, params.yongSinMethod);

    // 분석 결과 구성
    const analysis: AnalyzeWithYongSinResult['analysis'] = {
      pillars: {
        year: `${sajuData.year.stem}${sajuData.year.branch}`,
        month: `${sajuData.month.stem}${sajuData.month.branch}`,
        day: `${sajuData.day.stem}${sajuData.day.branch}`,
        hour: `${sajuData.hour.stem}${sajuData.hour.branch}`,
      },
      yongSin: {
        primary: yongSinResult.primaryYongSin,
        secondary: yongSinResult.secondaryYongSin,
        method: params.yongSinMethod,
        confidence: yongSinResult.confidence,
        reasoning: yongSinResult.reasoning,
      },
      elementDistribution: sajuData.wuxingCount,
      tenGodDistribution: sajuData.tenGodsDistribution,
    };

    // 직업 추천 (옵션)
    if (params.includeCareerRecommendation) {
      const settings = InterpretationSettings.getInstance().getSettings();
      const careerMatches = CareerMatcher.matchCareers(sajuData, settings, {
        minScore: 70,
        maxResults: 10,
      });

      analysis.careerRecommendations = careerMatches.map((match) => ({
        name: match.career.name,
        category: match.career.category,
        matchScore: Math.round(match.matchScore),
        reasons: match.matchReasons,
      }));
    }

    return {
      success: true,
      analysis,
      message: `${params.yongSinMethod} 방법론으로 사주 분석이 완료되었습니다.`,
    };
  } catch (error) {
    return {
      success: false,
      message: `사주 분석 실패: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
