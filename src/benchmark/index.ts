/**
 * 성능 벤치마크 시스템
 * Performance Benchmark System
 *
 * PRD Priority 5.2: 성능 벤치마크 및 병목 지점 식별
 */

import { calculateSaju } from '../lib/saju.js';
import { calculateDaeUn } from '../lib/dae_un.js';
import { analyzeFortune } from '../lib/fortune.js';
import { checkCompatibility } from '../lib/compatibility.js';

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
}

interface BenchmarkSuite {
  suiteName: string;
  results: BenchmarkResult[];
  totalTime: number;
}

/**
 * 단일 함수 벤치마크 실행
 */
async function benchmarkFunction(
  name: string,
  fn: () => unknown | Promise<unknown>,
  iterations: number = 1000
): Promise<BenchmarkResult> {
  const times: number[] = [];

  // 워밍업
  for (let i = 0; i < 10; i++) {
    await fn();
  }

  // 실제 측정
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((a, b) => a + b, 0);
  const avgTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / avgTime;

  return {
    name,
    iterations,
    totalTime,
    avgTime,
    minTime,
    maxTime,
    opsPerSecond,
  };
}

/**
 * 사주 계산 벤치마크
 */
export async function benchmarkSajuCalculation(): Promise<BenchmarkSuite> {
  console.log('\n🔬 사주 계산 성능 벤치마크 시작...\n');

  const testCases = [
    {
      name: '기본 사주 계산',
      fn: () => calculateSaju('1990-03-15', '10:30', 'solar', false, 'male'),
    },
    {
      name: '음력 사주 계산',
      fn: () => calculateSaju('1990-02-15', '10:30', 'lunar', false, 'male'),
    },
    {
      name: '윤달 사주 계산',
      fn: () => calculateSaju('1990-02-15', '10:30', 'lunar', true, 'male'),
    },
  ];

  const results: BenchmarkResult[] = [];
  const suiteStart = performance.now();

  for (const testCase of testCases) {
    const result = await benchmarkFunction(testCase.name, testCase.fn, 1000);
    results.push(result);
    console.log(`✓ ${result.name}: ${result.avgTime.toFixed(2)}ms (${result.opsPerSecond.toFixed(0)} ops/sec)`);
  }

  const suiteEnd = performance.now();

  return {
    suiteName: '사주 계산',
    results,
    totalTime: suiteEnd - suiteStart,
  };
}

/**
 * 대운 계산 벤치마크
 */
export async function benchmarkDaeUnCalculation(): Promise<BenchmarkSuite> {
  console.log('\n🔬 대운 계산 성능 벤치마크 시작...\n');

  const sajuData = calculateSaju('1990-03-15', '10:30', 'solar', false, 'male');

  const testCases = [
    {
      name: '남자 대운 계산',
      fn: () => calculateDaeUn(sajuData),
    },
    {
      name: '여자 대운 계산',
      fn: () => calculateDaeUn({ ...sajuData, gender: 'female' }),
    },
  ];

  const results: BenchmarkResult[] = [];
  const suiteStart = performance.now();

  for (const testCase of testCases) {
    const result = await benchmarkFunction(testCase.name, testCase.fn, 1000);
    results.push(result);
    console.log(`✓ ${result.name}: ${result.avgTime.toFixed(2)}ms (${result.opsPerSecond.toFixed(0)} ops/sec)`);
  }

  const suiteEnd = performance.now();

  return {
    suiteName: '대운 계산',
    results,
    totalTime: suiteEnd - suiteStart,
  };
}

/**
 * 운세 분석 벤치마크
 */
export async function benchmarkFortuneAnalysis(): Promise<BenchmarkSuite> {
  console.log('\n🔬 운세 분석 성능 벤치마크 시작...\n');

  const sajuData = calculateSaju('1990-03-15', '10:30', 'solar', false, 'male');

  const testCases = [
    {
      name: '전반 운세 분석',
      fn: () => analyzeFortune(sajuData, 'general'),
    },
    {
      name: '직업 운세 분석',
      fn: () => analyzeFortune(sajuData, 'career'),
    },
    {
      name: '재물 운세 분석',
      fn: () => analyzeFortune(sajuData, 'wealth'),
    },
    {
      name: '건강 운세 분석',
      fn: () => analyzeFortune(sajuData, 'health'),
    },
    {
      name: '애정 운세 분석',
      fn: () => analyzeFortune(sajuData, 'love'),
    },
  ];

  const results: BenchmarkResult[] = [];
  const suiteStart = performance.now();

  for (const testCase of testCases) {
    const result = await benchmarkFunction(testCase.name, testCase.fn, 500);
    results.push(result);
    console.log(`✓ ${result.name}: ${result.avgTime.toFixed(2)}ms (${result.opsPerSecond.toFixed(0)} ops/sec)`);
  }

  const suiteEnd = performance.now();

  return {
    suiteName: '운세 분석',
    results,
    totalTime: suiteEnd - suiteStart,
  };
}

/**
 * 궁합 분석 벤치마크
 */
export async function benchmarkCompatibility(): Promise<BenchmarkSuite> {
  console.log('\n🔬 궁합 분석 성능 벤치마크 시작...\n');

  const person1 = calculateSaju('1990-03-15', '10:30', 'solar', false, 'male');
  const person2 = calculateSaju('1992-07-20', '14:00', 'solar', false, 'female');

  const testCases = [
    {
      name: '궁합 분석',
      fn: () => checkCompatibility(person1, person2),
    },
  ];

  const results: BenchmarkResult[] = [];
  const suiteStart = performance.now();

  for (const testCase of testCases) {
    const result = await benchmarkFunction(testCase.name, testCase.fn, 500);
    results.push(result);
    console.log(`✓ ${result.name}: ${result.avgTime.toFixed(2)}ms (${result.opsPerSecond.toFixed(0)} ops/sec)`);
  }

  const suiteEnd = performance.now();

  return {
    suiteName: '궁합 분석',
    results,
    totalTime: suiteEnd - suiteStart,
  };
}

/**
 * 전체 벤치마크 스위트 실행
 */
export async function runAllBenchmarks(): Promise<void> {
  console.log('🚀 사주 MCP 서버 성능 벤치마크 시작\n');
  console.log('='.repeat(60));

  const suites: BenchmarkSuite[] = [];

  // 각 벤치마크 실행
  suites.push(await benchmarkSajuCalculation());
  suites.push(await benchmarkDaeUnCalculation());
  suites.push(await benchmarkFortuneAnalysis());
  suites.push(await benchmarkCompatibility());

  // 전체 요약
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 벤치마크 요약\n');

  for (const suite of suites) {
    console.log(`\n${suite.suiteName}:`);
    console.log(`  총 소요 시간: ${suite.totalTime.toFixed(2)}ms`);

    const avgOps = suite.results.reduce((sum, r) => sum + r.opsPerSecond, 0) / suite.results.length;
    console.log(`  평균 성능: ${avgOps.toFixed(0)} ops/sec`);
  }

  // 병목 지점 식별
  console.log('\n🔍 병목 지점 분석\n');

  const allResults = suites.flatMap(s => s.results);
  const slowest = allResults.sort((a, b) => b.avgTime - a.avgTime).slice(0, 3);

  console.log('가장 느린 작업 Top 3:');
  slowest.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.name}: ${result.avgTime.toFixed(2)}ms`);
  });

  // 최적화 권장사항
  console.log('\n💡 최적화 권장사항\n');

  slowest.forEach(result => {
    if (result.avgTime > 50) {
      console.log(`⚠️  ${result.name}이(가) 50ms 이상 소요됩니다. 캐싱 또는 알고리즘 최적화를 고려하세요.`);
    } else if (result.avgTime > 20) {
      console.log(`⚡ ${result.name}이(가) 20ms 이상 소요됩니다. 성능 개선 여지가 있습니다.`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 벤치마크 완료\n');
}

/**
 * CLI 실행
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllBenchmarks().catch(console.error);
}
