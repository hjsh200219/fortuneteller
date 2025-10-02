/**
 * 용신 선택기 통합 모듈
 * Unified YongSin Selector
 *
 * 4가지 알고리즘을 통합하고 사용자 설정에 따라 적절한 알고리즘 선택
 */

import type { SajuData } from '../../types/index.js';
import type { YongSinMethod } from '../../types/interpretation.js';
import type { YongSinAlgorithm, YongSinResult } from './base.js';
import { StrengthYongSinAlgorithm } from './strength_algorithm.js';
import { SeasonalYongSinAlgorithm } from './seasonal_algorithm.js';
import { MediationYongSinAlgorithm } from './mediation_algorithm.js';
import { DiseaseYongSinAlgorithm } from './disease_algorithm.js';

/**
 * 용신 알고리즘 레지스트리
 */
const ALGORITHMS: Record<YongSinMethod, YongSinAlgorithm> = {
  strength: new StrengthYongSinAlgorithm(),
  seasonal: new SeasonalYongSinAlgorithm(),
  mediation: new MediationYongSinAlgorithm(),
  disease: new DiseaseYongSinAlgorithm(),
};

/**
 * 용신 선택기
 */
export class YongSinSelector {
  /**
   * 지정된 방법으로 용신 선택
   * @param sajuData 사주 데이터
   * @param method 용신 선택 방법
   * @returns 용신 선정 결과
   */
  static select(sajuData: SajuData, method: YongSinMethod): YongSinResult {
    const algorithm = ALGORITHMS[method];
    if (!algorithm) {
      throw new Error(`Unknown YongSin method: ${method}`);
    }

    return algorithm.select(sajuData);
  }

  /**
   * 모든 알고리즘으로 용신 선택 (비교 분석용)
   * @param sajuData 사주 데이터
   * @returns 각 방법별 용신 결과
   */
  static selectAll(sajuData: SajuData): Record<YongSinMethod, YongSinResult> {
    const results: Partial<Record<YongSinMethod, YongSinResult>> = {};

    for (const [method, algorithm] of Object.entries(ALGORITHMS) as [YongSinMethod, YongSinAlgorithm][]) {
      try {
        results[method] = algorithm.select(sajuData);
      } catch (error) {
        console.error(`Error selecting YongSin with ${method}:`, error);
      }
    }

    return results as Record<YongSinMethod, YongSinResult>;
  }

  /**
   * 자동으로 가장 적합한 알고리즘 선택
   * @param sajuData 사주 데이터
   * @returns 최적 알고리즘으로 선정한 용신
   */
  static selectAuto(sajuData: SajuData): YongSinResult & { recommendedMethod: YongSinMethod } {
    const applicabilities: [YongSinMethod, number][] = [];

    for (const [method, algorithm] of Object.entries(ALGORITHMS) as [YongSinMethod, YongSinAlgorithm][]) {
      const score = algorithm.calculateApplicability(sajuData);
      applicabilities.push([method, score]);
    }

    // 가장 높은 적합도의 알고리즘 선택
    applicabilities.sort((a, b) => b[1] - a[1]);
    const [bestMethod] = applicabilities[0] || ['strength', 0.5];

    const result = this.select(sajuData, bestMethod as YongSinMethod);

    return {
      ...result,
      recommendedMethod: bestMethod as YongSinMethod,
    };
  }

  /**
   * 각 알고리즘의 적용 적합도 평가
   * @param sajuData 사주 데이터
   * @returns 각 방법별 적합도 점수
   */
  static evaluateApplicability(sajuData: SajuData): Record<YongSinMethod, number> {
    const scores: Partial<Record<YongSinMethod, number>> = {};

    for (const [method, algorithm] of Object.entries(ALGORITHMS) as [YongSinMethod, YongSinAlgorithm][]) {
      scores[method] = algorithm.calculateApplicability(sajuData);
    }

    return scores as Record<YongSinMethod, number>;
  }

  /**
   * 알고리즘 정보 가져오기
   * @param method 용신 선택 방법
   * @returns 알고리즘 정보
   */
  static getAlgorithmInfo(method: YongSinMethod): {
    name: string;
    description: string;
  } {
    const algorithm = ALGORITHMS[method];
    if (!algorithm) {
      throw new Error(`Unknown YongSin method: ${method}`);
    }

    return {
      name: algorithm.name,
      description: algorithm.description,
    };
  }

  /**
   * 모든 알고리즘 정보
   */
  static getAllAlgorithms(): Array<{
    method: YongSinMethod;
    name: string;
    description: string;
  }> {
    return Object.entries(ALGORITHMS).map(([method, algorithm]) => ({
      method: method as YongSinMethod,
      name: algorithm.name,
      description: algorithm.description,
    }));
  }
}

/**
 * 편의 함수: 용신 선택
 */
export function selectYongSin(sajuData: SajuData, method: YongSinMethod = 'strength'): YongSinResult {
  return YongSinSelector.select(sajuData, method);
}

/**
 * 편의 함수: 자동 선택
 */
export function selectYongSinAuto(sajuData: SajuData): YongSinResult & { recommendedMethod: YongSinMethod } {
  return YongSinSelector.selectAuto(sajuData);
}
