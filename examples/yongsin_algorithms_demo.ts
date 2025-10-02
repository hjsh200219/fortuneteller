/**
 * 4가지 용신 알고리즘 비교 데모
 */

import { calculateSaju } from '../src/lib/saju.js';
import { YongSinSelector } from '../src/lib/yongsin/selector.js';
import type { YongSinMethod } from '../src/types/interpretation.js';

async function demonstrateYongSinAlgorithms() {
  console.log('=== 용신 알고리즘 4종 비교 데모 ===\n');

  // 테스트 사주 3개
  const testCases = [
    {
      name: '강한 일간 사주',
      birthDate: '1990-06-15',
      birthTime: '14:30',
      gender: 'male' as const,
    },
    {
      name: '약한 일간 사주',
      birthDate: '1985-12-25',
      birthTime: '22:00',
      gender: 'female' as const,
    },
    {
      name: '충돌 많은 사주',
      birthDate: '1992-03-10',
      birthTime: '10:00',
      gender: 'male' as const,
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📅 ${testCase.name}: ${testCase.birthDate} ${testCase.birthTime} (${testCase.gender})`);
    console.log('='.repeat(60));

    const [year, month, day] = testCase.birthDate.split('-').map(Number);
    const [hour, minute] = testCase.birthTime.split(':').map(Number);

    const sajuData = calculateSaju(
      year || 1990,
      month || 1,
      day || 1,
      hour || 0,
      minute || 0,
      'solar',
      false,
      testCase.gender
    );

    console.log(`\n일간: ${sajuData.day.stem}(${sajuData.day.stemElement})`);
    console.log(`월지: ${sajuData.month.branch}`);
    console.log(`일간 강약: ${sajuData.dayMasterStrength?.level || 'unknown'}`);
    console.log(`오행 분포: 목(${sajuData.wuxingCount['목']}) 화(${sajuData.wuxingCount['화']}) 토(${sajuData.wuxingCount['토']}) 금(${sajuData.wuxingCount['금']}) 수(${sajuData.wuxingCount['수']})`);

    // 적용 적합도 평가
    console.log('\n📊 알고리즘 적용 적합도:');
    const applicabilities = YongSinSelector.evaluateApplicability(sajuData);
    for (const [method, score] of Object.entries(applicabilities)) {
      const percentage = (score * 100).toFixed(0);
      const bar = '█'.repeat(Math.floor(score * 20));
      const algorithmInfo = YongSinSelector.getAlgorithmInfo(method as YongSinMethod);
      console.log(`   ${algorithmInfo.name.padEnd(8)} ${bar.padEnd(20)} ${percentage}%`);
    }

    // 자동 선택
    console.log('\n🎯 자동 선택 결과:');
    const autoResult = YongSinSelector.selectAuto(sajuData);
    const autoInfo = YongSinSelector.getAlgorithmInfo(autoResult.recommendedMethod);
    console.log(`   추천 알고리즘: ${autoInfo.name} (${autoResult.recommendedMethod})`);
    console.log(`   용신: ${autoResult.primaryYongSin}${autoResult.secondaryYongSin ? `, ${autoResult.secondaryYongSin}` : ''}`);
    console.log(`   신뢰도: ${(autoResult.confidence * 100).toFixed(0)}%`);

    // 4가지 알고리즘 비교
    console.log('\n🔍 4가지 알고리즘 비교:\n');
    const allResults = YongSinSelector.selectAll(sajuData);

    for (const [method, result] of Object.entries(allResults)) {
      const info = YongSinSelector.getAlgorithmInfo(method as YongSinMethod);
      console.log(`\n💡 ${info.name} (${method})`);
      console.log(`   용신: ${result.primaryYongSin}${result.secondaryYongSin ? ` / ${result.secondaryYongSin}` : ''}`);
      console.log(`   희신: ${result.xiSin.join(', ')}`);
      console.log(`   기신: ${result.jiSin.join(', ')}`);
      console.log(`   신뢰도: ${(result.confidence * 100).toFixed(0)}%`);
      console.log(`   ▶ ${result.reasoning}`);
    }
  }

  // 알고리즘 목록
  console.log('\n\n' + '='.repeat(60));
  console.log('📚 용신 알고리즘 목록');
  console.log('='.repeat(60));

  const algorithms = YongSinSelector.getAllAlgorithms();
  for (const algo of algorithms) {
    console.log(`\n🔸 ${algo.name} (${algo.method})`);
    console.log(`   ${algo.description}`);
  }

  console.log('\n\n=== 데모 완료 ===\n');
}

demonstrateYongSinAlgorithms().catch(console.error);
