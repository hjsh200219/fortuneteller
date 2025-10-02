/**
 * 용신 알고리즘 빠른 테스트
 */

import { YongSinSelector } from '../src/lib/yongsin/selector.js';
import type { SajuData, WuXing } from '../src/types/index.js';

// 간단한 테스트 사주 데이터
const testSaju: SajuData = {
  birthDate: '1990-06-15',
  birthTime: '14:30',
  calendar: 'solar',
  isLeapMonth: false,
  gender: 'male',
  year: {
    stem: '경',
    branch: '오',
    stemElement: '금',
    branchElement: '화',
    yinYang: '양',
  },
  month: {
    stem: '임',
    branch: '오',
    stemElement: '수',
    branchElement: '화',
    yinYang: '양',
  },
  day: {
    stem: '갑',
    branch: '자',
    stemElement: '목',
    branchElement: '수',
    yinYang: '양',
  },
  hour: {
    stem: '신',
    branch: '미',
    stemElement: '금',
    branchElement: '토',
    yinYang: '음',
  },
  wuxingCount: {
    목: 1,
    화: 2,
    토: 1,
    금: 2,
    수: 2,
  },
  tenGods: [],
  dayMasterStrength: {
    level: 'medium',
    score: 50,
    analysis: '중화',
  },
};

console.log('=== 용신 알고리즘 빠른 테스트 ===\n');

console.log('📊 사주 정보:');
console.log(`   일간: ${testSaju.day.stem}(${testSaju.day.stemElement})`);
console.log(`   월지: ${testSaju.month.branch}`);
console.log(`   강약: ${testSaju.dayMasterStrength?.level}`);
console.log(`   오행: 목(${testSaju.wuxingCount['목']}) 화(${testSaju.wuxingCount['화']}) 토(${testSaju.wuxingCount['토']}) 금(${testSaju.wuxingCount['금']}) 수(${testSaju.wuxingCount['수']})\n`);

// 1. 강약용신
console.log('1️⃣  강약용신:');
const strengthResult = YongSinSelector.select(testSaju, 'strength');
console.log(`   용신: ${strengthResult.primaryYongSin}${strengthResult.secondaryYongSin ? `, ${strengthResult.secondaryYongSin}` : ''}`);
console.log(`   신뢰도: ${(strengthResult.confidence * 100).toFixed(0)}%`);
console.log(`   이유: ${strengthResult.reasoning}\n`);

// 2. 조후용신
console.log('2️⃣  조후용신:');
const seasonalResult = YongSinSelector.select(testSaju, 'seasonal');
console.log(`   용신: ${seasonalResult.primaryYongSin}${seasonalResult.secondaryYongSin ? `, ${seasonalResult.secondaryYongSin}` : ''}`);
console.log(`   신뢰도: ${(seasonalResult.confidence * 100).toFixed(0)}%`);
console.log(`   이유: ${seasonalResult.reasoning}\n`);

// 3. 통관용신
console.log('3️⃣  통관용신:');
const mediationResult = YongSinSelector.select(testSaju, 'mediation');
console.log(`   용신: ${mediationResult.primaryYongSin}${mediationResult.secondaryYongSin ? `, ${mediationResult.secondaryYongSin}` : ''}`);
console.log(`   신뢰도: ${(mediationResult.confidence * 100).toFixed(0)}%`);
console.log(`   이유: ${mediationResult.reasoning}\n`);

// 4. 병약용신
console.log('4️⃣  병약용신:');
const diseaseResult = YongSinSelector.select(testSaju, 'disease');
console.log(`   용신: ${diseaseResult.primaryYongSin}${diseaseResult.secondaryYongSin ? `, ${diseaseResult.secondaryYongSin}` : ''}`);
console.log(`   신뢰도: ${(diseaseResult.confidence * 100).toFixed(0)}%`);
console.log(`   이유: ${diseaseResult.reasoning}\n`);

// 5. 자동 선택
console.log('🎯 자동 선택:');
const autoResult = YongSinSelector.selectAuto(testSaju);
const autoInfo = YongSinSelector.getAlgorithmInfo(autoResult.recommendedMethod);
console.log(`   추천: ${autoInfo.name} (${autoResult.recommendedMethod})`);
console.log(`   용신: ${autoResult.primaryYongSin}${autoResult.secondaryYongSin ? `, ${autoResult.secondaryYongSin}` : ''}`);
console.log(`   신뢰도: ${(autoResult.confidence * 100).toFixed(0)}%\n`);

// 6. 적용 적합도
console.log('📈 알고리즘 적용 적합도:');
const applicabilities = YongSinSelector.evaluateApplicability(testSaju);
for (const [method, score] of Object.entries(applicabilities)) {
  const percentage = (score * 100).toFixed(0);
  const bar = '█'.repeat(Math.floor(score * 20));
  const info = YongSinSelector.getAlgorithmInfo(method as 'strength' | 'seasonal' | 'mediation' | 'disease');
  console.log(`   ${info.name.padEnd(8)} ${bar.padEnd(20)} ${percentage}%`);
}

console.log('\n=== 테스트 완료 ===\n');
