/**
 * 사주 계산 정확도 검증 시스템
 */

import type { HeavenlyStem, EarthlyBranch } from '../types/index.js';
import { MANSELYEOK_VERIFICATION, VERIFICATION_TOTAL_COUNT } from '../data/manselyeok_table.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';

export interface ValidationResult {
  total: number;
  passed: number;
  failed: number;
  accuracy: number;
  failedCases: Array<{
    date: string;
    expected: { stem: HeavenlyStem; branch: EarthlyBranch };
    actual: { stem: HeavenlyStem; branch: EarthlyBranch };
    description?: string;
  }>;
}

/**
 * 일주 계산 정확도 검증
 * 만세력 검증 테이블과 비교
 */
export function validateDayPillar(): ValidationResult {
  let passed = 0;
  const failedCases: ValidationResult['failedCases'] = [];

  for (const test of MANSELYEOK_VERIFICATION) {
    const date = new Date(test.solarDate);
    const result = calculateDayPillarForValidation(date);

    if (result.stem === test.expectedDayStem && result.branch === test.expectedDayBranch) {
      passed++;
    } else {
      failedCases.push({
        date: test.solarDate,
        expected: { stem: test.expectedDayStem, branch: test.expectedDayBranch },
        actual: { stem: result.stem, branch: result.branch },
        description: test.description,
      });
    }
  }

  const failed = VERIFICATION_TOTAL_COUNT - passed;
  const accuracy = passed / VERIFICATION_TOTAL_COUNT;

  return {
    total: VERIFICATION_TOTAL_COUNT,
    passed,
    failed,
    accuracy,
    failedCases,
  };
}

/**
 * 일주 계산 함수 (검증용)
 * src/lib/saju.ts의 calculateDayPillar와 동일한 로직
 */
function calculateDayPillarForValidation(date: Date): { stem: HeavenlyStem; branch: EarthlyBranch } {
  // 기준일: 1900년 1월 1일 = 병자일 (stemIndex=2, branchIndex=0)
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  // 60갑자 순환
  // 병(丙) = 2, 자(子) = 0에서 시작
  const stemIndex = (2 + diffDays) % 10;
  const branchIndex = (0 + diffDays) % 12;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);

  return {
    stem: stem.korean,
    branch: branch.korean,
  };
}

/**
 * 검증 결과 포맷팅
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push(`=== 일주 계산 정확도 검증 결과 ===`);
  lines.push(`총 테스트: ${result.total}개`);
  lines.push(`통과: ${result.passed}개`);
  lines.push(`실패: ${result.failed}개`);
  lines.push(`정확도: ${(result.accuracy * 100).toFixed(2)}%`);
  lines.push('');

  if (result.failedCases.length > 0) {
    lines.push(`=== 실패한 케이스 (${result.failedCases.length}개) ===`);
    result.failedCases.forEach((failedCase, index) => {
      lines.push(`${index + 1}. ${failedCase.date} ${failedCase.description || ''}`);
      lines.push(`   예상: ${failedCase.expected.stem}${failedCase.expected.branch}`);
      lines.push(`   실제: ${failedCase.actual.stem}${failedCase.actual.branch}`);
    });
  } else {
    lines.push('모든 테스트 통과! ✅');
  }

  return lines.join('\n');
}

/**
 * 검증 실행 및 결과 출력
 */
export function runValidation(): void {
  console.log('일주 계산 정확도 검증 시작...\n');

  const result = validateDayPillar();
  const formattedResult = formatValidationResult(result);

  console.log(formattedResult);
  console.log('');

  // 정확도 목표 달성 여부
  const targetAccuracy = 0.98; // 98%
  if (result.accuracy >= targetAccuracy) {
    console.log(`✅ 목표 정확도 ${targetAccuracy * 100}% 달성! (${(result.accuracy * 100).toFixed(2)}%)`);
  } else {
    console.log(
      `❌ 목표 정확도 미달: ${(result.accuracy * 100).toFixed(2)}% (목표: ${targetAccuracy * 100}%)`
    );
    console.log(`   ${result.failed}개 케이스 수정 필요`);
  }
}
