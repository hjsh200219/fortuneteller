/**
 * 성능 테스트 스크립트
 * Phase 3.3: 캐싱 적용 후 성능 측정
 */

import { calculateSaju } from '../lib/saju.js';
import { calculateDaeUn } from '../lib/dae_un.js';
import { logCacheStats, sajuCache, daeUnCache } from '../lib/performance_cache.js';

console.log('=== 사주팔자 성능 테스트 시작 ===\n');

// 테스트 데이터
const testCases = [
  { birthDate: '1990-05-15', birthTime: '12:00', calendar: 'solar' as const, isLeapMonth: false, gender: 'male' as const },
  { birthDate: '1995-11-20', birthTime: '06:00', calendar: 'solar' as const, isLeapMonth: false, gender: 'female' as const },
  { birthDate: '2000-01-01', birthTime: '00:00', calendar: 'solar' as const, isLeapMonth: false, gender: 'male' as const },
  { birthDate: '2024-06-15', birthTime: '12:00', calendar: 'solar' as const, isLeapMonth: false, gender: 'female' as const },
  { birthDate: '1985-03-10', birthTime: '18:30', calendar: 'solar' as const, isLeapMonth: false, gender: 'male' as const },
];

// 1. 첫 실행 (캐시 미스)
console.log('📊 테스트 1: 첫 실행 (캐시 미스)\n');
const firstRunStart = Date.now();

for (const testCase of testCases) {
  const saju = calculateSaju(
    testCase.birthDate,
    testCase.birthTime,
    testCase.calendar,
    testCase.isLeapMonth,
    testCase.gender
  );
  calculateDaeUn(saju);
}

const firstRunTime = Date.now() - firstRunStart;
console.log(`첫 실행 시간: ${firstRunTime}ms (평균: ${(firstRunTime / testCases.length).toFixed(1)}ms/건)\n`);

logCacheStats();

// 2. 두 번째 실행 (캐시 히트)
console.log('📊 테스트 2: 두 번째 실행 (캐시 히트)\n');
const secondRunStart = Date.now();

for (const testCase of testCases) {
  const saju = calculateSaju(
    testCase.birthDate,
    testCase.birthTime,
    testCase.calendar,
    testCase.isLeapMonth,
    testCase.gender
  );
  calculateDaeUn(saju);
}

const secondRunTime = Date.now() - secondRunStart;
console.log(`두 번째 실행 시간: ${secondRunTime}ms (평균: ${(secondRunTime / testCases.length).toFixed(1)}ms/건)\n`);

logCacheStats();

// 3. 성능 개선율 계산
const improvement = ((firstRunTime - secondRunTime) / firstRunTime) * 100;
console.log('=== 성능 분석 결과 ===');
console.log(`캐시 미스 시간: ${firstRunTime}ms`);
console.log(`캐시 히트 시간: ${secondRunTime}ms`);
console.log(`성능 개선율: ${improvement.toFixed(1)}%`);
console.log(`속도 향상: ${(firstRunTime / secondRunTime).toFixed(1)}x`);

// 4. 대량 테스트 (100건)
console.log('\n=== 대량 테스트 (100건) ===\n');

sajuCache.clear();
daeUnCache.clear();

const bulkTestStart = Date.now();
const randomTestCases = [];

for (let i = 0; i < 100; i++) {
  const year = 1980 + Math.floor(Math.random() * 40);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);

  const testCase = {
    birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    birthTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    calendar: 'solar' as const,
    isLeapMonth: false,
    gender: Math.random() > 0.5 ? ('male' as const) : ('female' as const),
  };

  randomTestCases.push(testCase);

  const saju = calculateSaju(
    testCase.birthDate,
    testCase.birthTime,
    testCase.calendar,
    testCase.isLeapMonth,
    testCase.gender
  );
  calculateDaeUn(saju);
}

const bulkTestTime = Date.now() - bulkTestStart;
console.log(`100건 처리 시간: ${bulkTestTime}ms (평균: ${(bulkTestTime / 100).toFixed(1)}ms/건)`);

logCacheStats();

// 5. 캐시 효율성 재테스트
console.log('=== 캐시 효율성 재테스트 (동일 100건 재계산) ===\n');

const retestStart = Date.now();

for (const testCase of randomTestCases) {
  const saju = calculateSaju(
    testCase.birthDate,
    testCase.birthTime,
    testCase.calendar,
    testCase.isLeapMonth,
    testCase.gender
  );
  calculateDaeUn(saju);
}

const retestTime = Date.now() - retestStart;
console.log(`재계산 시간: ${retestTime}ms (평균: ${(retestTime / 100).toFixed(1)}ms/건)`);
console.log(`캐시 효율: ${((bulkTestTime - retestTime) / bulkTestTime * 100).toFixed(1)}% 시간 절감`);

logCacheStats();

// 6. 최종 결과
console.log('\n=== 최종 성능 지표 ===');
console.log(`✅ 평균 계산 시간 (캐시 미스): ${(bulkTestTime / 100).toFixed(1)}ms`);
console.log(`✅ 평균 계산 시간 (캐시 히트): ${(retestTime / 100).toFixed(1)}ms`);
console.log(`✅ 캐시 적용 성능 향상: ${(bulkTestTime / retestTime).toFixed(1)}x`);

const avgTime = (bulkTestTime / 100);
if (avgTime < 200) {
  console.log(`\n✅ Phase 3.3 목표 달성: 평균 계산 시간 ${avgTime.toFixed(1)}ms < 200ms`);
} else {
  console.log(`\n⚠️  Phase 3.3 목표 근접: 평균 계산 시간 ${avgTime.toFixed(1)}ms (목표: < 200ms)`);
}
