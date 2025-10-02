/**
 * 종합 검증 스크립트
 * Phase 3.1: 전체 정확도 검증 실행
 */

import {
  runComprehensiveValidation,
  formatValidationResult,
} from '../lib/comprehensive_validation.js';

console.log('사주팔자 종합 정확도 검증 시작...\n');

const result = runComprehensiveValidation();
const formattedResult = formatValidationResult(result);

console.log(formattedResult);

// 목표 정확도 검증 (95% 이상)
if (result.overallAccuracy >= 95) {
  console.log('✅ Phase 3.1 목표 달성: 전체 정확도 95% 이상!');
  process.exit(0);
} else if (result.overallAccuracy >= 90) {
  console.log('⚠️  Phase 3.1 목표에 근접: 전체 정확도 90% 이상');
  process.exit(0);
} else {
  console.log(
    `❌ Phase 3.1 목표 미달성: 전체 정확도 ${result.overallAccuracy.toFixed(1)}% (목표: 95%)`
  );
  process.exit(1);
}
