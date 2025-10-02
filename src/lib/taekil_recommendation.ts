/**
 * 택일(擇日) 추천 라이브러리
 *
 * 목적에 맞는 좋은 날 선택
 */

import type {
  SajuData
} from '../types/index.js';
import { analyzeIljin, type IljinAnalysis } from './iljin_analysis.js';

/**
 * 택일 목적
 */
export type TaekilPurpose =
  | '혼인' // 결혼
  | '이사' // 이사
  | '개업' // 개업
  | '계약' // 계약/매매
  | '수술' // 수술/치료
  | '여행' // 여행/출행
  | '제사' // 제사/추모
  | '입학' // 입학/취업
  | '상량' // 건축/상량
  | '장례'; // 장례

/**
 * 택일 추천 결과
 */
export interface TaekilRecommendation {
  purpose: TaekilPurpose;
  period: {
    start: Date;
    end: Date;
  };

  // 추천 날짜들
  recommendations: {
    date: Date;
    score: number; // 0-100
    rank: number; // 1, 2, 3...
    dayPillar: string;
    reasons: string[]; // 추천 이유
    bestTime: string; // 최적 시간대
    cautions: string[]; // 주의사항
  }[];

  // 피해야 할 날짜들
  daysToAvoid: {
    date: Date;
    reason: string;
  }[];

  // 종합 조언
  generalAdvice: string;
}

/**
 * 택일 추천
 */
export function recommendTaekil(
  saju: SajuData,
  purpose: TaekilPurpose,
  startDate: Date,
  endDate: Date,
  maxRecommendations: number = 5
): TaekilRecommendation {
  const candidates: Array<{
    date: Date;
    score: number;
    iljin: IljinAnalysis;
  }> = [];

  // 기간 내 모든 날짜 분석
  const current = new Date(startDate);
  while (current <= endDate) {
    const iljin = analyzeIljin(new Date(current), saju);
    const score = evaluateDateForPurpose(iljin, purpose, saju);

    candidates.push({
      date: new Date(current),
      score,
      iljin,
    });

    current.setDate(current.getDate() + 1);
  }

  // 점수순 정렬
  candidates.sort((a, b) => b.score - a.score);

  // 상위 N개 추천
  const topCandidates = candidates.slice(0, maxRecommendations);

  const recommendations = topCandidates.map((candidate, index) => {
    const reasons = generateReasons(candidate.iljin, purpose, candidate.score);
    const bestTime = determineBestTime(candidate.iljin);
    const cautions = generateCautions(candidate.iljin, purpose);

    return {
      date: candidate.date,
      score: candidate.score,
      rank: index + 1,
      dayPillar: candidate.iljin.dayPillar,
      reasons,
      bestTime,
      cautions,
    };
  });

  // 피해야 할 날짜 (하위 점수)
  const worstCandidates = candidates
    .filter(c => c.score < 30)
    .slice(0, 5);

  const daysToAvoid = worstCandidates.map(c => ({
    date: c.date,
    reason: generateAvoidReason(c.iljin, purpose),
  }));

  // 종합 조언
  const generalAdvice = generateGeneralAdvice(purpose, recommendations);

  return {
    purpose,
    period: { start: startDate, end: endDate },
    recommendations,
    daysToAvoid,
    generalAdvice,
  };
}

/**
 * 목적에 따른 날짜 평가
 */
function evaluateDateForPurpose(
  iljin: IljinAnalysis,
  purpose: TaekilPurpose,
  _saju: SajuData
): number {
  let score = iljin.score; // 기본 점수

  // 목적별 가중치
  const purposeWeights: Record<TaekilPurpose, {
    goodGods: string[];
    badGods: string[];
    bonus: number;
  }> = {
    '혼인': {
      goodGods: ['정', '만', '성'],
      badGods: ['파', '위', '집'],
      bonus: 20,
    },
    '이사': {
      goodGods: ['건', '개', '성'],
      badGods: ['파', '폐'],
      bonus: 15,
    },
    '개업': {
      goodGods: ['개', '성', '건'],
      badGods: ['파', '폐', '위'],
      bonus: 20,
    },
    '계약': {
      goodGods: ['정', '성', '수'],
      badGods: ['파', '집'],
      bonus: 15,
    },
    '수술': {
      goodGods: ['제', '평', '성'],
      badGods: ['파', '위', '건'],
      bonus: 15,
    },
    '여행': {
      goodGods: ['개', '건', '평'],
      badGods: ['폐', '파'],
      bonus: 10,
    },
    '제사': {
      goodGods: ['제', '폐', '정'],
      badGods: ['파', '만'],
      bonus: 10,
    },
    '입학': {
      goodGods: ['건', '개', '성'],
      badGods: ['파', '위'],
      bonus: 15,
    },
    '상량': {
      goodGods: ['건', '만', '정'],
      badGods: ['파', '위'],
      bonus: 15,
    },
    '장례': {
      goodGods: ['폐', '제', '평'],
      badGods: ['개', '건'],
      bonus: 10,
    },
  };

  const weight = purposeWeights[purpose];

  // 십이신 가중치
  if (weight.goodGods.includes(iljin.twelveGods.name)) {
    score += weight.bonus;
  }
  if (weight.badGods.includes(iljin.twelveGods.name)) {
    score -= weight.bonus;
  }

  // 사주와의 조화
  if (iljin.relationWithSaju.harmony) {
    score += 15;
  }
  if (iljin.relationWithSaju.conflict) {
    score -= 20;
  }

  // 28수 길흉
  if (iljin.constellation.fortune === '길') {
    score += 10;
  } else {
    score -= 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * 추천 이유 생성
 */
function generateReasons(
  iljin: IljinAnalysis,
  purpose: TaekilPurpose,
  score: number
): string[] {
  const reasons: string[] = [];

  // 십이신 이유
  reasons.push(`${iljin.twelveGods.name}일 - ${iljin.twelveGods.description}`);

  // 28수 이유
  if (iljin.constellation.fortune === '길') {
    reasons.push(`${iljin.constellation.name}수로 길한 날`);
  }

  // 사주와의 관계
  if (iljin.relationWithSaju.harmony) {
    reasons.push('사주와 조화를 이루어 더욱 길함');
  }

  // 목적별 특화 이유
  const purposeReasons: Record<TaekilPurpose, string> = {
    '혼인': '혼인에 적합한 길일',
    '이사': '이사와 이동에 좋은 날',
    '개업': '새로운 시작에 대길',
    '계약': '계약과 약속에 적합',
    '수술': '치료와 회복에 유리',
    '여행': '여행과 출행에 길함',
    '제사': '제사와 추모에 적합',
    '입학': '입학과 취업에 좋음',
    '상량': '건축과 상량에 길함',
    '장례': '장례와 안장에 적합',
  };

  if (score >= 70) {
    reasons.push(purposeReasons[purpose]);
  }

  return reasons;
}

/**
 * 최적 시간대 결정
 */
function determineBestTime(iljin: IljinAnalysis): string {
  if (iljin.luckyHours.length > 0) {
    return iljin.luckyHours[0]?.hour || '09:00-11:00 (사시)';
  }

  // 기본적으로 오전 길함
  return '09:00-11:00 (사시)';
}

/**
 * 주의사항 생성
 */
function generateCautions(
  iljin: IljinAnalysis,
  _purpose: TaekilPurpose
): string[] {
  const cautions: string[] = [];

  if (iljin.relationWithSaju.conflict) {
    cautions.push('사주와 충돌이 있으니 신중히 진행');
  }

  if (iljin.cautiousHours.length > 0) {
    const hours = iljin.cautiousHours.map(h => h.hour).join(', ');
    cautions.push(`${hours} 시간대는 피하는 것이 좋음`);
  }

  if (iljin.unsuitableActivities.length > 0) {
    cautions.push(`${iljin.unsuitableActivities.join(', ')}는 피할 것`);
  }

  if (cautions.length === 0) {
    cautions.push('특별한 주의사항 없음');
  }

  return cautions;
}

/**
 * 피해야 하는 이유 생성
 */
function generateAvoidReason(
  iljin: IljinAnalysis,
  purpose: TaekilPurpose
): string {
  if (iljin.twelveGods.name === '파') {
    return '파일(破日)로 모든 일에 불길';
  }

  if (iljin.relationWithSaju.conflict) {
    return '사주와 충돌하여 불길';
  }

  if (iljin.rating === '대흉일' || iljin.rating === '흉일') {
    return `${iljin.rating}로 ${purpose}에 부적합`;
  }

  return '해당 목적에 적합하지 않은 날';
}

/**
 * 종합 조언 생성
 */
function generateGeneralAdvice(
  purpose: TaekilPurpose,
  recommendations: TaekilRecommendation['recommendations']
): string {
  if (recommendations.length === 0) {
    return '추천할 만한 길일이 없습니다. 기간을 조정해 주세요.';
  }

  const bestDate = recommendations[0];
  if (!bestDate) {
    return '추천할 만한 길일이 없습니다. 기간을 조정해 주세요.';
  }

  const purposeAdvice: Record<TaekilPurpose, string> = {
    '혼인': '혼인은 평생의 대사이니 길일을 택하여 진행하시고, 양가의 합의와 준비를 충분히 하세요.',
    '이사': '이사는 새로운 시작이니 깨끗이 청소하고 정리한 후 이동하세요. 이사 후 첫날은 집안 곳곳에 빛을 밝히세요.',
    '개업': '개업은 사업의 시작이니 철저한 준비와 함께 길일에 시작하세요. 개업식은 오전에 하는 것이 좋습니다.',
    '계약': '계약은 신중히 검토한 후 진행하세요. 급하게 서두르지 말고 충분히 확인하는 것이 중요합니다.',
    '수술': '수술은 건강과 직결되니 의료진과 충분히 상담하고 길일을 택하세요. 수술 전 마음의 안정이 중요합니다.',
    '여행': '여행은 안전이 최우선입니다. 길일을 택하되 무리한 일정은 피하세요.',
    '제사': '제사는 정성이 중요합니다. 깨끗한 마음으로 준비하시고 조상께 감사의 마음을 전하세요.',
    '입학': '입학은 새로운 배움의 시작입니다. 길일을 택하여 좋은 기운을 받으세요.',
    '상량': '건축은 안전이 최우선입니다. 길일을 택하여 시작하고 전문가와 상의하세요.',
    '장례': '고인을 정성껏 모시는 마음이 중요합니다. 절차를 지키며 예를 갖추세요.',
  };

  return `추천 날짜는 ${bestDate.date.toISOString().split('T')[0]} (${bestDate.dayPillar}일)입니다. ${purposeAdvice[purpose]}`;
}

/**
 * 빠른 택일 (1개월 이내)
 */
export function quickTaekil(
  saju: SajuData,
  purpose: TaekilPurpose,
  daysAhead: number = 30
): TaekilRecommendation {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);

  return recommendTaekil(saju, purpose, startDate, endDate, 3);
}

/**
 * 특정 월의 길일 찾기
 */
export function findLuckyDaysInMonth(
  saju: SajuData,
  year: number,
  month: number, // 1-12
  purpose: TaekilPurpose
): TaekilRecommendation {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // 다음달 0일 = 이번달 마지막날

  return recommendTaekil(saju, purpose, startDate, endDate, 5);
}
