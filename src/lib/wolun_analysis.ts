/**
 * 월운(月運) 분석 라이브러리
 *
 * 월별 운세 상세 분석
 */

import type {
  HeavenlyStem,
  EarthlyBranch,
  SajuData,
  WuXing
} from '../types/index.js';
import { getHeavenlyStemFromYear } from './helpers.js';

/**
 * 월운 분석 결과
 */
export interface WolunAnalysis {
  year: number;
  month: number; // 1-12
  monthStem: HeavenlyStem;
  monthBranch: EarthlyBranch;
  monthPillar: string; // 월주

  // 오행 분석
  element: WuXing;
  elementBalance: {
    description: string;
    isFavorable: boolean;
  };

  // 운세 점수
  fortune: {
    overall: '대길' | '길' | '평' | '흉' | '대흉';
    score: number; // 0-100
    career: number;
    wealth: number;
    health: number;
    relationship: number;
  };

  // 주요 특징
  characteristics: {
    keywords: string[]; // 핵심 키워드
    opportunities: string[]; // 기회
    cautions: string[]; // 주의사항
  };

  // 길일/흉일
  specialDays: {
    luckyDates: number[]; // 길한 날짜들
    unluckyDates: number[]; // 흉한 날짜들
  };

  // 상세 조언
  advice: {
    doList: string[]; // 하면 좋은 일
    dontList: string[]; // 피해야 할 일
    direction: string; // 유리한 방위
    color: string; // 유리한 색상
  };
}

/**
 * 특정 월의 월운 분석
 */
export function analyzeWolun(
  saju: SajuData,
  year: number,
  month: number
): WolunAnalysis {
  // 1. 월간지 구하기
  const yearStem = getHeavenlyStemFromYear(year);
  const monthStem = getMonthStem(year, month, yearStem);
  const monthBranch = getMonthBranch(month);
  const monthPillar = `${monthStem}${monthBranch}`;

  // 2. 오행 분석
  const element = getElementFromStem(monthStem);
  const elementBalance = analyzeElementBalance(element, saju);

  // 3. 운세 점수 계산
  const fortune = calculateMonthFortune(
    monthStem,
    monthBranch,
    saju,
    elementBalance.isFavorable
  );

  // 4. 특징 분석
  const characteristics = analyzeCharacteristics(
    monthPillar,
    element,
    fortune
  );

  // 5. 특별한 날짜 분석
  const specialDays = findSpecialDays(year, month, monthBranch, saju);

  // 6. 조언 생성
  const advice = generateMonthAdvice(element, fortune, monthBranch);

  return {
    year,
    month,
    monthStem,
    monthBranch,
    monthPillar,
    element,
    elementBalance,
    fortune,
    characteristics,
    specialDays,
    advice,
  };
}

/**
 * 1년 전체 월운 분석
 */
export function analyzeYearlyWolun(
  saju: SajuData,
  year: number
): WolunAnalysis[] {
  const results: WolunAnalysis[] = [];

  for (let month = 1; month <= 12; month++) {
    results.push(analyzeWolun(saju, year, month));
  }

  return results;
}

/**
 * 월간 구하기 (년간 기준 월간 계산)
 */
function getMonthStem(
  _year: number,
  month: number,
  yearStem: HeavenlyStem
): HeavenlyStem {
  // 월간 계산 공식
  const stems: HeavenlyStem[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

  // 년간에 따른 월간 시작 (갑기년은 병인월부터)
  const monthStartMap: Record<HeavenlyStem, number> = {
    '갑': 2, '기': 2, // 갑기년 - 병인월
    '을': 4, '경': 4, // 을경년 - 무인월
    '병': 6, '신': 6, // 병신년 - 경인월
    '정': 8, '임': 8, // 정임년 - 임인월
    '무': 0, '계': 0, // 무계년 - 갑인월
  };

  const baseIndex = monthStartMap[yearStem];
  const monthOffset = month - 1; // 1월 = 인월(0번째)

  const index = (baseIndex + monthOffset) % 10;
  return stems[index] || '갑';
}

/**
 * 월지 구하기
 */
function getMonthBranch(month: number): EarthlyBranch {
  // 양력 월 기준 (절입 전후로 실제로는 다를 수 있음)
  const branches: EarthlyBranch[] = [
    '축', // 12월 대한-1월 입춘 전
    '인', // 1월 입춘-2월 경칩 전
    '묘', // 2월 경칩-3월 청명 전
    '진', // 3월 청명-4월 입하 전
    '사', // 4월 입하-5월 망종 전
    '오', // 5월 망종-6월 소서 전
    '미', // 6월 소서-7월 입추 전
    '신', // 7월 입추-8월 백로 전
    '유', // 8월 백로-9월 한로 전
    '술', // 9월 한로-10월 입동 전
    '해', // 10월 입동-11월 대설 전
    '자', // 11월 대설-12월 소한 전
  ];

  // 간단하게 양력 월 기준 (정확한 절입일 계산은 별도 필요)
  return branches[month % 12] || '자';
}

/**
 * 천간에서 오행 추출
 */
function getElementFromStem(stem: HeavenlyStem): WuXing {
  const map: Record<HeavenlyStem, WuXing> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
  };
  return map[stem];
}

/**
 * 오행 균형 분석
 */
function analyzeElementBalance(
  element: WuXing,
  saju: SajuData
): WolunAnalysis['elementBalance'] {
  const dayElement = getElementFromStem(saju.day.stem);

  const relation = getWuxingRelationship(element, dayElement);

  let description = '';
  let isFavorable = false;

  switch (relation) {
    case 'generates':
      description = `${element}이(가) 일간 ${dayElement}을(를) 생하여 도움이 되는 달`;
      isFavorable = true;
      break;
    case 'generated':
      description = `일간 ${dayElement}이(가) ${element}을(를) 생하여 에너지 소모가 있는 달`;
      isFavorable = false;
      break;
    case 'controls':
      description = `${element}이(가) 일간 ${dayElement}을(를) 극하여 압박이 있는 달`;
      isFavorable = false;
      break;
    case 'controlled':
      description = `일간 ${dayElement}이(가) ${element}을(를) 극하여 재물운이 좋은 달`;
      isFavorable = true;
      break;
    case 'same':
      description = `${element}이(가) 일간과 같아 경쟁이 있는 달`;
      isFavorable = false;
      break;
  }

  return { description, isFavorable };
}

/**
 * 오행 관계 분석
 */
function getWuxingRelationship(
  element1: WuXing,
  element2: WuXing
): 'generates' | 'generated' | 'controls' | 'controlled' | 'same' {
  if (element1 === element2) return 'same';

  const generates: Record<WuXing, WuXing> = {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목',
  };

  const controls: Record<WuXing, WuXing> = {
    '목': '토', '토': '수', '수': '화', '화': '금', '금': '목',
  };

  if (generates[element1] === element2) return 'generates';
  if (generates[element2] === element1) return 'generated';
  if (controls[element1] === element2) return 'controls';
  if (controls[element2] === element1) return 'controlled';

  return 'same';
}

/**
 * 월 운세 점수 계산
 */
function calculateMonthFortune(
  monthStem: HeavenlyStem,
  monthBranch: EarthlyBranch,
  saju: SajuData,
  isFavorable: boolean
): WolunAnalysis['fortune'] {
  let baseScore = isFavorable ? 65 : 45;

  // 충돌 확인
  const hasConflict = checkMonthConflict(monthStem, monthBranch, saju);
  if (hasConflict) baseScore -= 20;

  // 조화 확인
  const hasHarmony = checkMonthHarmony(monthBranch, saju);
  if (hasHarmony) baseScore += 15;

  const score = Math.min(100, Math.max(0, baseScore));

  let overall: WolunAnalysis['fortune']['overall'];
  if (score >= 80) overall = '대길';
  else if (score >= 60) overall = '길';
  else if (score >= 40) overall = '평';
  else if (score >= 20) overall = '흉';
  else overall = '대흉';

  return {
    overall,
    score,
    career: Math.min(100, Math.max(0, score + Math.random() * 20 - 10)),
    wealth: Math.min(100, Math.max(0, score + Math.random() * 20 - 10)),
    health: Math.min(100, Math.max(0, score + Math.random() * 20 - 10)),
    relationship: Math.min(100, Math.max(0, score + Math.random() * 20 - 10)),
  };
}

/**
 * 월 충돌 확인
 */
function checkMonthConflict(
  _monthStem: HeavenlyStem,
  monthBranch: EarthlyBranch,
  saju: SajuData
): boolean {
  const branchConflicts: Record<EarthlyBranch, EarthlyBranch> = {
    '자': '오', '축': '미', '인': '신', '묘': '유',
    '진': '술', '사': '해', '오': '자', '미': '축',
    '신': '인', '유': '묘', '술': '진', '해': '사',
  };

  return (
    saju.day.branch === branchConflicts[monthBranch] ||
    saju.month.branch === branchConflicts[monthBranch]
  );
}

/**
 * 월 조화 확인
 */
function checkMonthHarmony(
  monthBranch: EarthlyBranch,
  saju: SajuData
): boolean {
  const sixHarmony: Record<EarthlyBranch, EarthlyBranch> = {
    '자': '축', '인': '해', '묘': '술', '진': '유',
    '사': '신', '오': '미', '축': '자', '해': '인',
    '술': '묘', '유': '진', '신': '사', '미': '오',
  };

  return (
    saju.day.branch === sixHarmony[monthBranch] ||
    saju.month.branch === sixHarmony[monthBranch]
  );
}

/**
 * 특징 분석
 */
function analyzeCharacteristics(
  _monthPillar: string,
  element: WuXing,
  fortune: WolunAnalysis['fortune']
): WolunAnalysis['characteristics'] {
  const keywords: string[] = [];
  const opportunities: string[] = [];
  const cautions: string[] = [];

  // 오행별 특징
  const elementKeywords: Record<WuXing, string[]> = {
    '목': ['성장', '확장', '창의'],
    '화': ['열정', '명예', '활동'],
    '토': ['안정', '신뢰', '축적'],
    '금': ['결단', '정리', '수확'],
    '수': ['지혜', '유연', '소통'],
  };
  keywords.push(...elementKeywords[element]);

  // 운세별 특징
  if (fortune.overall === '대길' || fortune.overall === '길') {
    keywords.push('길운', '성공');
    opportunities.push('새로운 시작과 도전에 유리');
    opportunities.push('중요한 결정과 계약 진행 가능');
  } else if (fortune.overall === '평') {
    keywords.push('평온', '유지');
    opportunities.push('현상 유지와 내실 다지기');
    cautions.push('무리한 확장이나 투자는 신중히');
  } else {
    keywords.push('주의', '조심');
    cautions.push('새로운 시작이나 큰 결정은 미루기');
    cautions.push('건강과 안전에 특별히 유의');
  }

  return { keywords, opportunities, cautions };
}

/**
 * 특별한 날짜 찾기
 */
function findSpecialDays(
  year: number,
  month: number,
  _monthBranch: EarthlyBranch,
  saju: SajuData
): WolunAnalysis['specialDays'] {
  const luckyDates: number[] = [];
  const unluckyDates: number[] = [];

  // 간단한 계산 (실제로는 일진 계산 필요)
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    // 일지 계산 (간단히 순환으로 처리)
    const dayBranchIndex = (day % 12);
    const branches: EarthlyBranch[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    const dayBranch = branches[dayBranchIndex];

    // 육합일
    const sixHarmony: Record<EarthlyBranch, EarthlyBranch> = {
      '자': '축', '인': '해', '묘': '술', '진': '유',
      '사': '신', '오': '미', '축': '자', '해': '인',
      '술': '묘', '유': '진', '신': '사', '미': '오',
    };

    if (dayBranch && sixHarmony[dayBranch] && saju.day.branch === sixHarmony[dayBranch]) {
      luckyDates.push(day);
    }

    // 충일
    const conflicts: Record<EarthlyBranch, EarthlyBranch> = {
      '자': '오', '축': '미', '인': '신', '묘': '유',
      '진': '술', '사': '해', '오': '자', '미': '축',
      '신': '인', '유': '묘', '술': '진', '해': '사',
    };

    if (dayBranch && conflicts[dayBranch] && saju.day.branch === conflicts[dayBranch]) {
      unluckyDates.push(day);
    }
  }

  return {
    luckyDates: luckyDates.slice(0, 5), // 상위 5개만
    unluckyDates: unluckyDates.slice(0, 3), // 상위 3개만
  };
}

/**
 * 월 조언 생성
 */
function generateMonthAdvice(
  element: WuXing,
  fortune: WolunAnalysis['fortune'],
  _monthBranch: EarthlyBranch
): WolunAnalysis['advice'] {
  const doList: string[] = [];
  const dontList: string[] = [];

  // 오행별 조언
  const elementAdvice: Record<WuXing, { do: string[], dont: string[] }> = {
    '목': {
      do: ['새로운 계획 수립', '학습과 성장 활동', '창의적 프로젝트'],
      dont: ['과도한 확장', '충동적 결정'],
    },
    '화': {
      do: ['대외 활동 확대', '홍보와 마케팅', '네트워킹'],
      dont: ['감정적 대응', '과시적 소비'],
    },
    '토': {
      do: ['저축과 투자', '관계 돈독히', '건강 관리'],
      dont: ['무리한 일정', '신뢰 없는 거래'],
    },
    '금': {
      do: ['정리와 마무리', '중요 결정', '계약 체결'],
      dont: ['불필요한 지출', '독단적 행동'],
    },
    '수': {
      do: ['학습과 연구', '소통과 협력', '여행과 이동'],
      dont: ['우유부단', '과도한 타협'],
    },
  };

  doList.push(...elementAdvice[element].do);
  dontList.push(...elementAdvice[element].dont);

  // 운세별 조언
  if (fortune.score >= 60) {
    doList.push('적극적 행동과 도전');
  } else {
    dontList.push('큰 변화나 모험');
  }

  // 방위 (오행별)
  const directions: Record<WuXing, string> = {
    '목': '동쪽',
    '화': '남쪽',
    '토': '중앙',
    '금': '서쪽',
    '수': '북쪽',
  };

  // 색상 (오행별)
  const colors: Record<WuXing, string> = {
    '목': '녹색, 청색',
    '화': '적색, 자주색',
    '토': '황색, 갈색',
    '금': '백색, 금색',
    '수': '흑색, 남색',
  };

  return {
    doList,
    dontList,
    direction: directions[element],
    color: colors[element],
  };
}
