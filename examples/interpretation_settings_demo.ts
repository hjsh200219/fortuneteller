/**
 * 해석 설정 시스템 데모
 * Interpretation Settings System Demo
 */

import { InterpretationSettings } from '../src/lib/interpretation_settings.js';
import { SCHOOL_DESCRIPTIONS, YONGSIN_METHOD_DESCRIPTIONS } from '../src/data/school_presets.js';

async function demonstrateSettings() {
  console.log('=== 해석 설정 시스템 데모 ===\n');

  const settings = InterpretationSettings.getInstance();

  // 1. 기본 프리셋 3개 테스트
  console.log('1️⃣  기본 프리셋 3개\n');

  const presets = ['traditional', 'modern_professional', 'health_focused'];
  for (const preset of presets) {
    settings.loadPreset(preset);
    const current = settings.getSettings();
    const summary = settings.getSummary();

    console.log(`📋 ${preset.toUpperCase()}`);
    console.log(`   유파: ${current.school} (${SCHOOL_DESCRIPTIONS[current.school]})`);
    console.log(`   용신: ${current.yongSinMethod} (${YONGSIN_METHOD_DESCRIPTIONS[current.yongSinMethod]})`);
    console.log(`   최우선: ${summary.topPriority}`);
    console.log(`   현대화: ${summary.modernAdaptation ? 'ON' : 'OFF'}`);
    console.log(`   우선순위:`);
    console.log(`     - 건강: ${current.priorities.health}`);
    console.log(`     - 재물: ${current.priorities.wealth}`);
    console.log(`     - 직업: ${current.priorities.career}`);
    console.log(`     - 관계: ${current.priorities.relationship}`);
    console.log(`     - 명예: ${current.priorities.fame}`);
    console.log();
  }

  // 2. 커스텀 설정 테스트
  console.log('\n2️⃣  커스텀 설정 예시\n');

  settings.loadPreset('traditional');
  console.log('📌 기본 (traditional) → 커스텀 변경');

  settings.loadCustom({
    yongSinMethod: 'seasonal', // 조후용신으로 변경
    priorities: {
      wealth: 1.0, // 재물 최우선
      career: 0.9,
    },
    eraAdaptation: {
      modernCareer: true, // 현대 직업 활성화
    },
  });

  const custom = settings.getSettings();
  console.log(`   유파: ${custom.school} (유지됨)`);
  console.log(`   용신: ${custom.yongSinMethod} (변경됨)`);
  console.log(`   재물 우선순위: ${custom.priorities.wealth} (변경됨)`);
  console.log(`   현대 직업: ${custom.eraAdaptation.modernCareer} (변경됨)`);
  console.log();

  // 3. 유파별 기본 가중치
  console.log('\n3️⃣  유파별 기본 가중치\n');

  const schools = ['ziping', 'dts', 'qtbj', 'modern', 'shensha'] as const;
  for (const school of schools) {
    const weights = settings.getSchoolDefaultWeights(school);
    const maxWeight = Math.max(...Object.values(weights));
    const topCategory = Object.entries(weights).find(([_, v]) => v === maxWeight)?.[0];

    console.log(`📚 ${school.toUpperCase()}`);
    console.log(`   ${SCHOOL_DESCRIPTIONS[school]}`);
    console.log(`   최우선 영역: ${topCategory} (${maxWeight})`);
    console.log();
  }

  // 4. 파일 저장/로드 테스트
  console.log('\n4️⃣  파일 저장/로드 테스트\n');

  const testFilePath = '/tmp/saju_settings_test.json';

  settings.loadPreset('modern_professional');
  await settings.saveToFile(testFilePath);
  console.log(`✅ 설정 저장됨: ${testFilePath}`);

  settings.reset(); // 초기화
  console.log(`🔄 설정 초기화 (traditional 프리셋)`);

  await settings.loadFromFile(testFilePath);
  const loaded = settings.getSettings();
  console.log(`✅ 설정 로드됨: ${loaded.school} / ${loaded.yongSinMethod}`);
  console.log();

  // 5. 유효성 검사 테스트
  console.log('\n5️⃣  유효성 검사\n');

  try {
    settings.loadCustom({
      priorities: {
        health: 1.5, // 범위 초과!
      },
    });
  } catch (error) {
    console.log(`❌ 유효성 검사 실패 (예상된 동작):`);
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    settings.loadPreset('unknown_preset');
  } catch (error) {
    console.log(`❌ 존재하지 않는 프리셋 (예상된 동작):`);
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log('\n=== 데모 완료 ===\n');
}

// 실행
demonstrateSettings().catch(console.error);
