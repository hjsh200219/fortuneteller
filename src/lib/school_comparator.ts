/**
 * 유파 비교 엔진
 * School Comparison Engine
 *
 * 여러 유파의 해석 결과를 비교하고 합의점/차이점 분석
 */

import type { SajuPillars } from '../types/index.js';
import type {
  SchoolCode,
  UserInterpretationSettings,
  SchoolInterpretation,
  SchoolComparisonResult,
} from '../types/interpretation.js';
import { getSchoolInterpreter } from './interpreters/index.js';

/**
 * 유파 비교기
 */
export class SchoolComparator {
  /**
   * 여러 유파로 해석 및 비교
   */
  static async compareSchools(
    pillars: SajuPillars,
    schools: SchoolCode[],
    settings: UserInterpretationSettings
  ): Promise<SchoolComparisonResult> {
    // 각 유파별 해석 수행
    const interpretations: SchoolInterpretation[] = [];

    for (const school of schools) {
      const interpreter = getSchoolInterpreter(school);
      const interpretation = await interpreter.interpret(pillars, settings);
      interpretations.push(interpretation);
    }

    // 합의 항목 찾기
    const consensus = this.findConsensus(interpretations);

    // 차이점 분석
    const differences = this.findDifferences(interpretations);

    // 최종 권장 사항 생성
    const recommendation = this.generateRecommendation(interpretations, consensus, differences);

    return {
      schools,
      interpretations,
      consensus,
      differences,
      recommendation,
    };
  }

  /**
   * 합의 항목 찾기
   * 여러 유파가 동의하는 내용
   */
  private static findConsensus(
    interpretations: SchoolInterpretation[]
  ): SchoolComparisonResult['consensus'] {
    const consensus: SchoolComparisonResult['consensus'] = [];

    // 용신 합의
    const yongSinCounts: Record<string, SchoolCode[]> = {};
    for (const interp of interpretations) {
      const yongSin = interp.yongSin;
      if (!yongSinCounts[yongSin]) {
        yongSinCounts[yongSin] = [];
      }
      yongSinCounts[yongSin].push(interp.school);
    }

    // 2개 이상 유파가 동의하는 용신
    for (const [yongSin, schools] of Object.entries(yongSinCounts)) {
      if (schools.length >= 2) {
        consensus.push({
          category: 'health',
          agreement: `용신으로 ${yongSin} 오행을 사용하는 것이 좋습니다`,
          schools,
        });
      }
    }

    // 카테고리별 유사 키워드 검색
    const categories: Array<keyof Pick<SchoolInterpretation, 'health' | 'wealth' | 'career' | 'relationship' | 'fame'>> = [
      'health',
      'wealth',
      'career',
      'relationship',
      'fame',
    ];

    for (const category of categories) {
      const commonKeywords = this.findCommonKeywords(interpretations, category);
      if (commonKeywords.length > 0) {
        const agreeingSchools = interpretations
          .filter((interp) => {
            const text = interp[category];
            return commonKeywords.some((keyword) => text.includes(keyword));
          })
          .map((interp) => interp.school);

        if (agreeingSchools.length >= 2) {
          consensus.push({
            category,
            agreement: `${commonKeywords.slice(0, 2).join(', ')} 관련 조언이 공통적입니다`,
            schools: agreeingSchools,
          });
        }
      }
    }

    return consensus;
  }

  /**
   * 차이점 분석
   */
  private static findDifferences(
    interpretations: SchoolInterpretation[]
  ): SchoolComparisonResult['differences'] {
    const differences: SchoolComparisonResult['differences'] = [];

    const categories: Array<keyof Pick<SchoolInterpretation, 'health' | 'wealth' | 'career' | 'relationship' | 'fame'>> = [
      'health',
      'wealth',
      'career',
      'relationship',
      'fame',
    ];

    for (const category of categories) {
      // 각 유파의 해석이 다른 경우
      const uniqueInterpretations = interpretations.map((interp) => ({
        school: interp.school,
        interpretation: interp[category],
      }));

      // 고유한 해석이 2개 이상인 경우 차이점으로 기록
      const uniqueTexts = [...new Set(uniqueInterpretations.map((ui) => ui.interpretation))];
      if (uniqueTexts.length >= 2) {
        differences.push({
          category,
          interpretations: uniqueInterpretations,
        });
      }
    }

    return differences;
  }

  /**
   * 공통 키워드 찾기
   */
  private static findCommonKeywords(
    interpretations: SchoolInterpretation[],
    category: keyof Pick<SchoolInterpretation, 'health' | 'wealth' | 'career' | 'relationship' | 'fame'>
  ): string[] {
    const keywords: Record<string, number> = {};

    // 각 해석에서 키워드 추출
    for (const interp of interpretations) {
      const text = interp[category];
      const words = text.split(/[\s,.]/).filter((w) => w.length >= 2);

      for (const word of words) {
        keywords[word] = (keywords[word] || 0) + 1;
      }
    }

    // 2개 이상 유파에서 등장하는 키워드
    return Object.entries(keywords)
      .filter(([_, count]) => count >= 2)
      .map(([word]) => word)
      .slice(0, 5);
  }

  /**
   * 최종 권장 사항 생성
   */
  private static generateRecommendation(
    interpretations: SchoolInterpretation[],
    consensus: SchoolComparisonResult['consensus'],
    differences: SchoolComparisonResult['differences']
  ): string {
    let recommendation = '';

    // 합의 사항 요약
    if (consensus.length > 0) {
      recommendation += `${consensus.length}개 항목에서 여러 유파가 동의합니다:\n`;
      for (const item of consensus.slice(0, 3)) {
        recommendation += `- ${item.agreement} (${item.schools.length}개 유파 동의)\n`;
      }
    }

    // 신뢰도 높은 해석 우선 권장
    const highConfidenceInterps = interpretations.filter((interp) => interp.confidence >= 0.8);
    if (highConfidenceInterps.length > 0) {
      const best = highConfidenceInterps[0];
      recommendation += `\n가장 신뢰도 높은 해석: ${best?.schoolName} (${((best?.confidence || 0) * 100).toFixed(0)}%)\n`;
    }

    // 차이점 고려 권장
    if (differences.length > 0) {
      recommendation += `\n${differences.length}개 영역에서 유파별 관점이 다릅니다. 자신의 상황과 가치관에 맞는 해석을 선택하세요.`;
    }

    return recommendation || '각 유파의 관점을 참고하여 종합적으로 판단하시기 바랍니다.';
  }

  /**
   * 특정 유파 추천
   */
  static recommendSchool(
    settings: UserInterpretationSettings,
    interpretations: SchoolInterpretation[]
  ): SchoolCode {
    // 우선순위 기반 추천
    const priorities = settings.priorities;

    // 최우선 영역 확인
    const topPriority = Object.entries(priorities).reduce((max, [key, value]) =>
      value > max.value ? { key: key as keyof typeof priorities, value } : max,
      { key: 'health' as keyof typeof priorities, value: 0 }
    ).key;

    // 우선순위별 추천 유파
    const recommendations: Record<string, SchoolCode> = {
      health: 'qtbj', // 궁통보감 - 건강
      wealth: 'modern', // 현대명리 - 재물
      career: 'modern', // 현대명리 - 직업
      relationship: 'shensha', // 신살중심 - 인간관계
      fame: 'dts', // 적천수 - 명예
    };

    const recommended = recommendations[topPriority];
    if (recommended) {
      return recommended;
    }

    // 신뢰도 기준 선택
    const sorted = [...interpretations].sort((a, b) => b.confidence - a.confidence);
    return sorted[0]?.school || 'ziping';
  }
}

/**
 * 편의 함수: 유파 비교
 */
export async function compareSchools(
  pillars: SajuPillars,
  schools: SchoolCode[],
  settings: UserInterpretationSettings
): Promise<SchoolComparisonResult> {
  return SchoolComparator.compareSchools(pillars, schools, settings);
}
