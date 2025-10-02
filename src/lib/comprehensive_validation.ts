/**
 * 종합 정확도 검증 시스템
 * Phase 3.1: 전체 사주 계산 정확도 95% 이상 검증
 */

import type { SajuData } from '../types/index.js';
import { calculateSaju } from './saju.js';
import { calculateDaeUn } from './dae_un.js';
import { selectYongSin } from './yong_sin.js';

export interface ComprehensiveValidationResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallAccuracy: number; // 0-100%
  categoryResults: {
    dayPillar: { accuracy: number; passed: number; total: number };
    hourPillar: { accuracy: number; passed: number; total: number };
    daeUn: { accuracy: number; passed: number; total: number };
    jiJangGan: { accuracy: number; passed: number; total: number };
    yongSin: { accuracy: number; passed: number; total: number };
    leapMonth: { accuracy: number; passed: number; total: number };
  };
  failedCases: {
    category: string;
    testCase: string;
    expected: any;
    actual: any;
    reason: string;
  }[];
  recommendations: string[];
}

export interface SajuTestCase {
  description: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  calendar: 'solar' | 'lunar';
  isLeapMonth: boolean;
  gender: 'male' | 'female';
  location?: string;
  expected: {
    dayStem?: string;
    dayBranch?: string;
    hourStem?: string;
    hourBranch?: string;
    daeUnStartAge?: number;
    primaryYongSin?: string;
    isLeapMonthAnalyzed?: boolean;
  };
}

/**
 * 통합 검증 테스트 케이스
 */
export const COMPREHENSIVE_TEST_CASES: SajuTestCase[] = [
  // 일주 검증 케이스 (기존 검증 데이터 활용)
  {
    description: '1900년 1월 1일 (병자일 기준일)',
    birthDate: '1900-01-01',
    birthTime: '12:00',
    calendar: 'solar',
    isLeapMonth: false,
    gender: 'male',
    expected: { dayStem: '병', dayBranch: '자' },
  },
  {
    description: '2000년 1월 1일 (밀레니엄)',
    birthDate: '2000-01-01',
    birthTime: '12:00',
    calendar: 'solar',
    isLeapMonth: false,
    gender: 'male',
    expected: { dayStem: '경', dayBranch: '신' },
  },
  {
    description: '2024년 1월 1일',
    birthDate: '2024-01-01',
    birthTime: '12:00',
    calendar: 'solar',
    isLeapMonth: false,
    gender: 'female',
    expected: { dayStem: '병', dayBranch: '인' },
  },

  // 시주 검증 케이스 (진태양시 보정 포함)
  {
    description: '서울 자시 출생 (23:00-01:00)',
    birthDate: '2024-06-15',
    birthTime: '00:00',
    calendar: 'solar',
    isLeapMonth: false,
    gender: 'male',
    location: '서울',
    expected: { dayStem: '신', dayBranch: '해', hourBranch: '자' },
  },
  {
    description: '부산 오시 출생 (11:00-13:00)',
    birthDate: '2024-06-15',
    birthTime: '12:00',
    calendar: 'solar',
    isLeapMonth: false,
    gender: 'female',
    location: '부산',
    expected: { dayStem: '임', dayBranch: '자', hourBranch: '오' },
  },

  // 대운 시작 나이 검증 (절기 기반)
  {
    description: '입춘 직후 출생 (양남 순행)',
    birthDate: '2024-02-05',
    birthTime: '12:00',
    calendar: 'solar',
    isLeapMonth: false,
    gender: 'male',
    expected: { daeUnStartAge: 5 }, // 예상값 (실제 계산 필요)
  },
  {
    description: '경칩 직전 출생 (음녀 순행)',
    birthDate: '2024-03-04',
    birthTime: '12:00',
    calendar: 'solar',
    isLeapMonth: false,
    gender: 'female',
    expected: { daeUnStartAge: 4 }, // 예상값
  },

  // 윤달 출생자 검증
  {
    description: '윤달 출생자 (음력 2023년 윤2월)',
    birthDate: '2023-03-22',
    birthTime: '12:00',
    calendar: 'lunar',
    isLeapMonth: true,
    gender: 'male',
    expected: { isLeapMonthAnalyzed: true },
  },

  // 용신 분석 검증 (존재 여부만 확인)
  {
    description: '1990년 사주 용신 분석',
    birthDate: '1990-05-15',
    birthTime: '12:00',
    calendar: 'solar',
    isLeapMonth: false,
    gender: 'male',
    expected: {}, // 용신 계산 존재 여부만 확인
  },
  {
    description: '1995년 사주 용신 분석',
    birthDate: '1995-11-20',
    birthTime: '06:00',
    calendar: 'solar',
    isLeapMonth: false,
    gender: 'female',
    expected: {}, // 용신 계산 존재 여부만 확인
  },
];

/**
 * 종합 검증 실행
 */
export function runComprehensiveValidation(): ComprehensiveValidationResult {
  let totalTests = 0;
  let passedTests = 0;
  const failedCases: ComprehensiveValidationResult['failedCases'] = [];

  // 카테고리별 결과
  const categoryResults = {
    dayPillar: { accuracy: 0, passed: 0, total: 0 },
    hourPillar: { accuracy: 0, passed: 0, total: 0 },
    daeUn: { accuracy: 0, passed: 0, total: 0 },
    jiJangGan: { accuracy: 0, passed: 0, total: 0 },
    yongSin: { accuracy: 0, passed: 0, total: 0 },
    leapMonth: { accuracy: 0, passed: 0, total: 0 },
  };

  for (const testCase of COMPREHENSIVE_TEST_CASES) {
    try {
      // 사주 계산
      const sajuData: SajuData = calculateSaju(
        testCase.birthDate,
        testCase.birthTime,
        testCase.calendar,
        testCase.isLeapMonth,
        testCase.gender
      );

      // 일주 검증
      if (testCase.expected.dayStem && testCase.expected.dayBranch) {
        totalTests++;
        categoryResults.dayPillar.total++;

        if (
          sajuData.day.stem === testCase.expected.dayStem &&
          sajuData.day.branch === testCase.expected.dayBranch
        ) {
          passedTests++;
          categoryResults.dayPillar.passed++;
        } else {
          failedCases.push({
            category: '일주',
            testCase: testCase.description,
            expected: `${testCase.expected.dayStem}${testCase.expected.dayBranch}`,
            actual: `${sajuData.day.stem}${sajuData.day.branch}`,
            reason: '일주 계산 불일치',
          });
        }
      }

      // 시주 검증
      if (testCase.expected.hourStem || testCase.expected.hourBranch) {
        totalTests++;
        categoryResults.hourPillar.total++;

        const hourMatch =
          (!testCase.expected.hourStem || sajuData.hour.stem === testCase.expected.hourStem) &&
          (!testCase.expected.hourBranch || sajuData.hour.branch === testCase.expected.hourBranch);

        if (hourMatch) {
          passedTests++;
          categoryResults.hourPillar.passed++;
        } else {
          failedCases.push({
            category: '시주',
            testCase: testCase.description,
            expected: `${testCase.expected.hourStem || '?'}${testCase.expected.hourBranch || '?'}`,
            actual: `${sajuData.hour.stem}${sajuData.hour.branch}`,
            reason: '시주 계산 불일치 (진태양시 보정 확인 필요)',
          });
        }
      }

      // 대운 시작 나이 검증
      if (testCase.expected.daeUnStartAge !== undefined) {
        totalTests++;
        categoryResults.daeUn.total++;

        const daeUnPeriods = calculateDaeUn(sajuData);
        const startAge = daeUnPeriods[0]?.startAge || 0;

        if (startAge === testCase.expected.daeUnStartAge) {
          passedTests++;
          categoryResults.daeUn.passed++;
        } else {
          failedCases.push({
            category: '대운',
            testCase: testCase.description,
            expected: testCase.expected.daeUnStartAge,
            actual: startAge,
            reason: '대운 시작 나이 불일치 (절기 계산 확인 필요)',
          });
        }
      }

      // 지장간 검증 (존재 여부만 확인)
      if (sajuData.jiJangGan) {
        totalTests++;
        categoryResults.jiJangGan.total++;

        if (sajuData.jiJangGan.month.primary && sajuData.jiJangGan.month.primary.strength > 0) {
          passedTests++;
          categoryResults.jiJangGan.passed++;
        } else {
          failedCases.push({
            category: '지장간',
            testCase: testCase.description,
            expected: '지장간 세력 계산됨',
            actual: '지장간 세력 미계산',
            reason: '지장간 계산 실패',
          });
        }
      }

      // 용신 검증 (존재 여부 확인)
      // 모든 사주에 대해 용신이 계산되는지 확인
      totalTests++;
      categoryResults.yongSin.total++;

      const yongSinAnalysis = selectYongSin(sajuData);

      if (
        yongSinAnalysis &&
        yongSinAnalysis.primaryYongSin &&
        yongSinAnalysis.reasoning.length > 0
      ) {
        passedTests++;
        categoryResults.yongSin.passed++;
      } else {
        failedCases.push({
          category: '용신',
          testCase: testCase.description,
          expected: '용신 선정 완료',
          actual: yongSinAnalysis ? '용신 미선정' : '용신 분석 실패',
          reason: '용신 선정 실패',
        });
      }

      // 윤달 분석 검증
      if (testCase.expected.isLeapMonthAnalyzed !== undefined) {
        totalTests++;
        categoryResults.leapMonth.total++;

        const yongSinAnalysis = selectYongSin(sajuData);
        const hasLeapAnalysis =
          yongSinAnalysis.leapMonthAnalysis &&
          yongSinAnalysis.leapMonthAnalysis.isLeapMonth === true;

        if (hasLeapAnalysis === testCase.expected.isLeapMonthAnalyzed) {
          passedTests++;
          categoryResults.leapMonth.passed++;
        } else {
          failedCases.push({
            category: '윤달',
            testCase: testCase.description,
            expected: '윤달 분석 있음',
            actual: hasLeapAnalysis ? '윤달 분석 있음' : '윤달 분석 없음',
            reason: '윤달 특수 분석 실패',
          });
        }
      }
    } catch (error) {
      totalTests++;
      failedCases.push({
        category: '오류',
        testCase: testCase.description,
        expected: '정상 계산',
        actual: error instanceof Error ? error.message : '알 수 없는 오류',
        reason: '사주 계산 중 예외 발생',
      });
    }
  }

  // 카테고리별 정확도 계산
  for (const category of Object.keys(categoryResults) as Array<
    keyof typeof categoryResults
  >) {
    const result = categoryResults[category];
    result.accuracy = result.total > 0 ? (result.passed / result.total) * 100 : 0;
  }

  const failedTests = totalTests - passedTests;
  const overallAccuracy = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  // 개선 권장사항 생성
  const recommendations: string[] = [];

  if (categoryResults.dayPillar.accuracy < 100) {
    recommendations.push('일주 계산 정확도 개선 필요: 만세력 데이터 추가 검증 권장');
  }
  if (categoryResults.hourPillar.accuracy < 90) {
    recommendations.push('시주 계산 정확도 개선 필요: 진태양시 보정 로직 재검토 권장');
  }
  if (categoryResults.daeUn.accuracy < 90) {
    recommendations.push('대운 계산 정확도 개선 필요: 절기 데이터 정밀도 향상 권장');
  }
  if (categoryResults.jiJangGan.accuracy < 95) {
    recommendations.push('지장간 계산 정확도 개선 필요: 세력 분배 테이블 재검토 권장');
  }
  if (categoryResults.yongSin.accuracy < 85) {
    recommendations.push('용신 선정 정확도 개선 필요: 일간 강약 판단 로직 고도화 권장');
  }
  if (categoryResults.leapMonth.accuracy < 80) {
    recommendations.push('윤달 분석 정확도 개선 필요: 윤달 특수 로직 보완 권장');
  }

  if (overallAccuracy >= 95) {
    recommendations.push('전체 정확도 95% 이상 달성: Phase 3.1 목표 완료!');
  } else if (overallAccuracy >= 90) {
    recommendations.push('전체 정확도 90% 이상 달성: Phase 3.1 목표에 근접');
  } else {
    recommendations.push(
      `전체 정확도 ${overallAccuracy.toFixed(1)}%: 목표 95% 달성을 위해 추가 개선 필요`
    );
  }

  return {
    totalTests,
    passedTests,
    failedTests,
    overallAccuracy,
    categoryResults,
    failedCases,
    recommendations,
  };
}

/**
 * 검증 결과 포맷팅
 */
export function formatValidationResult(result: ComprehensiveValidationResult): string {
  let output = '\n';
  output += '='.repeat(60) + '\n';
  output += '종합 정확도 검증 결과\n';
  output += '='.repeat(60) + '\n\n';

  output += `전체 테스트: ${result.totalTests}개\n`;
  output += `통과: ${result.passedTests}개\n`;
  output += `실패: ${result.failedTests}개\n`;
  output += `전체 정확도: ${result.overallAccuracy.toFixed(2)}%\n\n`;

  output += '='.repeat(60) + '\n';
  output += '카테고리별 정확도\n';
  output += '='.repeat(60) + '\n';

  const categories: Array<{
    key: keyof ComprehensiveValidationResult['categoryResults'];
    name: string;
  }> = [
    { key: 'dayPillar', name: '일주 계산' },
    { key: 'hourPillar', name: '시주 계산' },
    { key: 'daeUn', name: '대운 계산' },
    { key: 'jiJangGan', name: '지장간 세력' },
    { key: 'yongSin', name: '용신 선정' },
    { key: 'leapMonth', name: '윤달 분석' },
  ];

  for (const category of categories) {
    const cat = result.categoryResults[category.key];
    if (cat.total > 0) {
      output += `${category.name}: ${cat.passed}/${cat.total} (${cat.accuracy.toFixed(1)}%)\n`;
    }
  }

  if (result.failedCases.length > 0) {
    output += '\n';
    output += '='.repeat(60) + '\n';
    output += '실패 케이스 상세\n';
    output += '='.repeat(60) + '\n';

    for (const failedCase of result.failedCases) {
      output += `\n[${failedCase.category}] ${failedCase.testCase}\n`;
      output += `  예상: ${JSON.stringify(failedCase.expected)}\n`;
      output += `  실제: ${JSON.stringify(failedCase.actual)}\n`;
      output += `  사유: ${failedCase.reason}\n`;
    }
  }

  output += '\n';
  output += '='.repeat(60) + '\n';
  output += '개선 권장사항\n';
  output += '='.repeat(60) + '\n';

  for (const recommendation of result.recommendations) {
    output += `• ${recommendation}\n`;
  }

  output += '\n';
  output += '='.repeat(60) + '\n';

  return output;
}
