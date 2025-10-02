/**
 * 세운(歲運) 분석 라이브러리
 *
 * 년운(年運)의 상세 분석 - 매년의 운세 흐름 파악
 */

import type {
  HeavenlyStem,
  EarthlyBranch,
  SajuData,
  WuXing
} from '../types/index.js';
import {
  getHeavenlyStemFromYear,
  getEarthlyBranchFromYear,
} from './helpers.js';

/**
 * 세운 분석 결과
 */
export interface SeyunAnalysis {
  year: number;
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  yearPillar: string; // 년주 (예: "갑자")

  // 사주와의 관계
  relationWithBirth: {
    stemRelation: string; // 천간 관계
    branchRelation: string; // 지지 관계
    harmonyScore: number; // 조화도 (0-100)
    conflictWarning: string[]; // 충돌 경고
  };

  // 오행 분석
  wuxingAnalysis: {
    yearElement: WuXing;
    balanceChange: string; // 오행 균형 변화
    favorableElements: WuXing[]; // 유리한 오행
    unfavorableElements: WuXing[]; // 불리한 오행
  };

  // 대운과의 조화
  daeunHarmony?: {
    isHarmonious: boolean;
    description: string;
  };

  // 운세 평가
  fortune: {
    overall: '대길' | '길' | '평' | '흉' | '대흉';
    score: number; // 0-100
    keyAspects: {
      career: number; // 사업운 0-100
      wealth: number; // 재물운 0-100
      health: number; // 건강운 0-100
      relationship: number; // 인간관계운 0-100
    };
  };

  // 상세 해석
  interpretation: {
    summary: string; // 요약
    opportunities: string[]; // 기회 요인
    challenges: string[]; // 도전 과제
    advice: string[]; // 조언
  };

  // 주요 시기
  importantPeriods: {
    favorableMonths: number[]; // 유리한 달 (1-12)
    cautiousMonths: number[]; // 주의할 달 (1-12)
  };
}

/**
 * 세운 분석 수행
 */
export function analyzeSeyun(
  saju: SajuData,
  targetYear: number
): SeyunAnalysis {
  // 1. 해당 년도의 간지 구하기
  const yearStem = getHeavenlyStemFromYear(targetYear);
  const yearBranch = getEarthlyBranchFromYear(targetYear);
  const yearPillar = `${yearStem}${yearBranch}`;

  // 2. 사주와의 관계 (간단한 설명)
  const stemRelation = '일반';
  const branchRelation = '보통';

  // 3. 충돌 확인 (천극지충)
  const conflictWarning = checkConflicts(
    yearStem,
    yearBranch,
    saju
  );

  // 4. 조화도 계산
  const harmonyScore = calculateHarmonyScore(
    yearStem,
    yearBranch,
    saju
  );

  // 5. 오행 분석
  const yearElement = getElementFromStem(yearStem);
  const wuxingAnalysis = analyzeWuxingForYear(yearElement, saju);

  // 6. 운세 평가
  const fortune = evaluateFortune(
    harmonyScore,
    conflictWarning.length,
    wuxingAnalysis
  );

  // 7. 상세 해석
  const interpretation = generateInterpretation(
    yearPillar,
    stemRelation,
    branchRelation,
    conflictWarning,
    wuxingAnalysis,
    fortune
  );

  // 8. 주요 시기 분석
  const importantPeriods = analyzeImportantPeriods(
    yearStem,
    yearBranch,
    saju
  );

  return {
    year: targetYear,
    yearStem,
    yearBranch,
    yearPillar,
    relationWithBirth: {
      stemRelation,
      branchRelation,
      harmonyScore,
      conflictWarning,
    },
    wuxingAnalysis,
    fortune,
    interpretation,
    importantPeriods,
  };
}

/**
 * 여러 해의 세운 분석
 */
export function analyzeMultipleYears(
  saju: SajuData,
  startYear: number,
  endYear: number
): SeyunAnalysis[] {
  const results: SeyunAnalysis[] = [];

  for (let year = startYear; year <= endYear; year++) {
    results.push(analyzeSeyun(saju, year));
  }

  return results;
}

/**
 * 충돌 확인
 */
function checkConflicts(
  yearStem: HeavenlyStem,
  yearBranch: EarthlyBranch,
  saju: SajuData
): string[] {
  const conflicts: string[] = [];

  // 천간 충 (天干冲)
  const stemConflicts: Record<HeavenlyStem, HeavenlyStem> = {
    '갑': '경', '을': '신', '병': '임', '정': '계', '무': '갑',
    '기': '을', '경': '병', '신': '정', '임': '무', '계': '기',
  };

  if (saju.year.stem === stemConflicts[yearStem]) {
    conflicts.push(`년간 충: ${yearStem}과 ${saju.year.stem}이 충돌`);
  }
  if (saju.month.stem === stemConflicts[yearStem]) {
    conflicts.push(`월간 충: ${yearStem}과 ${saju.month.stem}이 충돌`);
  }
  if (saju.day.stem === stemConflicts[yearStem]) {
    conflicts.push(`일간 충: ${yearStem}과 ${saju.day.stem}이 충돌 (주의 필요)`);
  }

  // 지지 충 (地支冲)
  const branchConflicts: Record<EarthlyBranch, EarthlyBranch> = {
    '자': '오', '축': '미', '인': '신', '묘': '유',
    '진': '술', '사': '해', '오': '자', '미': '축',
    '신': '인', '유': '묘', '술': '진', '해': '사',
  };

  if (saju.year.branch === branchConflicts[yearBranch]) {
    conflicts.push(`년지 충: ${yearBranch}과 ${saju.year.branch}이 충돌`);
  }
  if (saju.month.branch === branchConflicts[yearBranch]) {
    conflicts.push(`월지 충: ${yearBranch}과 ${saju.month.branch}이 충돌`);
  }
  if (saju.day.branch === branchConflicts[yearBranch]) {
    conflicts.push(`일지 충: ${yearBranch}과 ${saju.day.branch}이 충돌 (매우 주의)`);
  }

  return conflicts;
}

/**
 * 조화도 계산
 */
function calculateHarmonyScore(
  yearStem: HeavenlyStem,
  yearBranch: EarthlyBranch,
  saju: SajuData
): number {
  let score = 50; // 기본 점수

  // 삼합(三合) 확인 - 지지 조화
  const tripleHarmony = checkTripleHarmony(yearBranch, [
    saju.year.branch,
    saju.month.branch,
    saju.day.branch,
    saju.hour.branch,
  ]);
  if (tripleHarmony) score += 20;

  // 육합(六合) 확인
  const sixHarmony = checkSixHarmony(yearBranch, saju.day.branch);
  if (sixHarmony) score += 15;

  // 천간 합 확인
  const stemHarmony = checkStemHarmony(yearStem, saju.day.stem);
  if (stemHarmony) score += 10;

  // 오행 균형 고려
  const wuxingBonus = checkWuxingBalance(yearStem, saju);
  score += wuxingBonus;

  return Math.min(100, Math.max(0, score));
}

/**
 * 삼합 확인
 */
function checkTripleHarmony(
  branch: EarthlyBranch,
  sajuBranches: EarthlyBranch[]
): boolean {
  const tripleHarmonies = [
    ['인', '오', '술'], // 화국
    ['해', '묘', '미'], // 목국
    ['사', '유', '축'], // 금국
    ['신', '자', '진'], // 수국
  ];

  return tripleHarmonies.some((harmony) => {
    return harmony.includes(branch) &&
           sajuBranches.some(sb => harmony.includes(sb) && sb !== branch);
  });
}

/**
 * 육합 확인
 */
function checkSixHarmony(
  branch1: EarthlyBranch,
  branch2: EarthlyBranch
): boolean {
  const sixHarmonies: Record<EarthlyBranch, EarthlyBranch> = {
    '자': '축', '인': '해', '묘': '술', '진': '유',
    '사': '신', '오': '미', '축': '자', '해': '인',
    '술': '묘', '유': '진', '신': '사', '미': '오',
  };

  return sixHarmonies[branch1] === branch2;
}

/**
 * 천간 합 확인
 */
function checkStemHarmony(
  stem1: HeavenlyStem,
  stem2: HeavenlyStem
): boolean {
  const stemHarmonies: Record<HeavenlyStem, HeavenlyStem> = {
    '갑': '기', '을': '경', '병': '신', '정': '임', '무': '계',
    '기': '갑', '경': '을', '신': '병', '임': '정', '계': '무',
  };

  return stemHarmonies[stem1] === stem2;
}

/**
 * 오행 균형 점수
 */
function checkWuxingBalance(
  yearStem: HeavenlyStem,
  saju: SajuData
): number {
  const yearElement = getElementFromStem(yearStem);
  const sajuElements = [
    getElementFromStem(saju.year.stem),
    getElementFromStem(saju.month.stem),
    getElementFromStem(saju.day.stem),
    getElementFromStem(saju.hour.stem),
  ];

  // 부족한 오행이면 +10, 과다한 오행이면 -10
  const elementCount = sajuElements.filter(e => e === yearElement).length;

  if (elementCount === 0) return 10; // 부족한 오행 보충
  if (elementCount >= 3) return -10; // 과다한 오행
  return 0; // 적절한 수준
}

/**
 * 천간에서 오행 추출
 */
function getElementFromStem(stem: HeavenlyStem): WuXing {
  const stemToElement: Record<HeavenlyStem, WuXing> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
  };
  return stemToElement[stem];
}

/**
 * 년도의 오행 분석
 */
function analyzeWuxingForYear(
  yearElement: WuXing,
  saju: SajuData
): SeyunAnalysis['wuxingAnalysis'] {
  const dayElement = getElementFromStem(saju.day.stem);

  // 생극제화 관계
  const relationship = getWuxingRelationship(yearElement, dayElement);

  let balanceChange = '';
  const favorableElements: WuXing[] = [];
  const unfavorableElements: WuXing[] = [];

  switch (relationship) {
    case 'generates': // 세운이 일간을 생함
      balanceChange = `${yearElement}이(가) ${dayElement}을(를) 생하여 도움을 주는 해`;
      favorableElements.push(yearElement);
      break;
    case 'generated': // 일간이 세운을 생함
      balanceChange = `${dayElement}이(가) ${yearElement}을(를) 생하여 에너지 소모가 있는 해`;
      break;
    case 'controls': // 세운이 일간을 극함
      balanceChange = `${yearElement}이(가) ${dayElement}을(를) 극하여 도전이 있는 해`;
      unfavorableElements.push(yearElement);
      break;
    case 'controlled': // 일간이 세운을 극함
      balanceChange = `${dayElement}이(가) ${yearElement}을(를) 극하여 기회를 잡는 해`;
      favorableElements.push(yearElement);
      break;
    case 'same':
      balanceChange = `${yearElement}이(가) 같아 동료 의식이 강한 해`;
      break;
  }

  return {
    yearElement,
    balanceChange,
    favorableElements,
    unfavorableElements,
  };
}

/**
 * 오행 생극 관계
 */
function getWuxingRelationship(
  element1: WuXing,
  element2: WuXing
): 'generates' | 'generated' | 'controls' | 'controlled' | 'same' {
  if (element1 === element2) return 'same';

  const generates: Record<WuXing, WuXing> = {
    '목': '화',
    '화': '토',
    '토': '금',
    '금': '수',
    '수': '목',
  };

  const controls: Record<WuXing, WuXing> = {
    '목': '토',
    '토': '수',
    '수': '화',
    '화': '금',
    '금': '목',
  };

  if (generates[element1] === element2) return 'generates';
  if (generates[element2] === element1) return 'generated';
  if (controls[element1] === element2) return 'controls';
  if (controls[element2] === element1) return 'controlled';

  return 'same';
}

/**
 * 운세 평가
 */
function evaluateFortune(
  harmonyScore: number,
  conflictCount: number,
  wuxingAnalysis: SeyunAnalysis['wuxingAnalysis']
): SeyunAnalysis['fortune'] {
  let score = harmonyScore;

  // 충돌 패널티
  score -= conflictCount * 15;

  // 오행 유불리 반영
  score += wuxingAnalysis.favorableElements.length * 10;
  score -= wuxingAnalysis.unfavorableElements.length * 10;

  score = Math.min(100, Math.max(0, score));

  let overall: SeyunAnalysis['fortune']['overall'];
  if (score >= 80) overall = '대길';
  else if (score >= 60) overall = '길';
  else if (score >= 40) overall = '평';
  else if (score >= 20) overall = '흉';
  else overall = '대흉';

  // 세부 운세 (기본 점수에서 약간의 변동)
  const variance = () => Math.floor(Math.random() * 20 - 10);

  return {
    overall,
    score,
    keyAspects: {
      career: Math.min(100, Math.max(0, score + variance())),
      wealth: Math.min(100, Math.max(0, score + variance())),
      health: Math.min(100, Math.max(0, score + variance())),
      relationship: Math.min(100, Math.max(0, score + variance())),
    },
  };
}

/**
 * 상세 해석 생성
 */
function generateInterpretation(
  yearPillar: string,
  _stemRelation: string,
  _branchRelation: string,
  conflicts: string[],
  wuxingAnalysis: SeyunAnalysis['wuxingAnalysis'],
  fortune: SeyunAnalysis['fortune']
): SeyunAnalysis['interpretation'] {
  const summary = `${yearPillar}년은 전반적으로 ${fortune.overall}한 해입니다. ${wuxingAnalysis.balanceChange}`;

  const opportunities: string[] = [];
  const challenges: string[] = [];
  const advice: string[] = [];

  // 기회 요인
  if (fortune.score >= 60) {
    opportunities.push('사업 확장이나 새로운 도전에 유리한 시기');
    opportunities.push('인간관계 확대와 협력 기회 증가');
  }
  if (wuxingAnalysis.favorableElements.length > 0) {
    opportunities.push(`${wuxingAnalysis.favorableElements.join(', ')} 오행 관련 분야에서 좋은 성과 기대`);
  }

  // 도전 과제
  if (conflicts.length > 0) {
    challenges.push('충돌로 인한 변동이나 갈등 가능성');
    challenges.push('기존 관계나 상황에 변화 필요');
  }
  if (wuxingAnalysis.unfavorableElements.length > 0) {
    challenges.push(`${wuxingAnalysis.unfavorableElements.join(', ')} 오행 관련 분야는 신중히 접근`);
  }
  if (fortune.score < 50) {
    challenges.push('무리한 확장보다는 내실 다지기에 집중');
  }

  // 조언
  if (fortune.overall === '대길' || fortune.overall === '길') {
    advice.push('적극적인 행동과 도전이 좋은 결과를 가져올 수 있습니다');
    advice.push('준비해온 일들을 실행에 옮기기 좋은 시기입니다');
  } else if (fortune.overall === '평') {
    advice.push('안정을 유지하면서 조심스럽게 전진하세요');
    advice.push('급한 결정보다는 충분한 검토 후 행동하세요');
  } else {
    advice.push('새로운 시작보다는 마무리와 정리에 집중하세요');
    advice.push('어려움은 일시적이니 인내심을 가지세요');
    advice.push('건강 관리와 안전에 특히 주의하세요');
  }

  return {
    summary,
    opportunities: opportunities.length > 0 ? opportunities : ['안정적인 상황 유지'],
    challenges: challenges.length > 0 ? challenges : ['특별한 어려움 없음'],
    advice,
  };
}

/**
 * 주요 시기 분석
 */
function analyzeImportantPeriods(
  _yearStem: HeavenlyStem,
  yearBranch: EarthlyBranch,
  _saju: SajuData
): SeyunAnalysis['importantPeriods'] {
  const favorableMonths: number[] = [];
  const cautiousMonths: number[] = [];

  // 간단한 월별 분석 (실제로는 더 복잡한 계산 필요)
  for (let month = 1; month <= 12; month++) {
    const monthBranch = getMonthBranch(month);

    // 삼합이나 육합이 되는 달
    if (checkSixHarmony(yearBranch, monthBranch)) {
      favorableMonths.push(month);
    }

    // 충이 되는 달
    const branchConflicts: Record<EarthlyBranch, EarthlyBranch> = {
      '자': '오', '축': '미', '인': '신', '묘': '유',
      '진': '술', '사': '해', '오': '자', '미': '축',
      '신': '인', '유': '묘', '술': '진', '해': '사',
    };

    if (branchConflicts[yearBranch] === monthBranch) {
      cautiousMonths.push(month);
    }
  }

  return {
    favorableMonths: favorableMonths.length > 0 ? favorableMonths : [1, 5, 9],
    cautiousMonths: cautiousMonths.length > 0 ? cautiousMonths : [3, 7, 11],
  };
}

/**
 * 월에서 지지 구하기
 */
function getMonthBranch(month: number): EarthlyBranch {
  const monthBranches: EarthlyBranch[] = [
    '인', '묘', '진', '사', '오', '미',
    '신', '유', '술', '해', '자', '축',
  ];
  // 1월 = 인월 (입춘 기준이지만 여기서는 간단히 처리)
  return monthBranches[(month - 1 + 2) % 12] || '인';
}
