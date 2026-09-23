/**
 * 궁합 분석 로직
 */

import type { SajuData, CompatibilityAnalysis } from '../types/index.js';
import { analyzeWuXingRelation } from '../data/wuxing.js';
import type { TenGod, HeavenlyStem, EarthlyBranch } from '../types/index.js';
import { getFavorSets } from './luck_evaluation.js';

/** 천간합(天干合) */
const STEM_HAP: [HeavenlyStem, HeavenlyStem][] = [['갑', '기'], ['을', '경'], ['병', '신'], ['정', '임'], ['무', '계']];
const BRANCH_HAP: [EarthlyBranch, EarthlyBranch][] = [['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미']];
const BRANCH_CHUNG: [EarthlyBranch, EarthlyBranch][] = [['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해']];
const BRANCH_WONJIN: [EarthlyBranch, EarthlyBranch][] = [['자', '미'], ['축', '오'], ['인', '유'], ['묘', '신'], ['진', '해'], ['사', '술']];
const isPair = <T>(pairs: [T, T][], a: T, b: T) => pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
/**
 * 교차 형(刑): 인사신·축술미의 두 글자, 자묘.
 * 같은 글자 자형(진진·해해 등)은 한 사주 안의 관계라 교차에서는 보지 않는다 — 동갑이면 년지가 늘 같아 감점이 굳는다.
 */
const BRANCH_HYEONG: [EarthlyBranch, EarthlyBranch][] = [
  ['인', '사'], ['사', '신'], ['인', '신'], ['축', '술'], ['술', '미'], ['자', '묘'],
];
/** 삼합 그룹 [생지, 왕지, 고지] — 왕지가 낀 두 글자를 반합으로 본다 */
const SAMHAP_GROUPS: EarthlyBranch[][] = [['신', '자', '진'], ['해', '묘', '미'], ['인', '오', '술'], ['사', '유', '축']];
const isHalfSamHap = (a: EarthlyBranch, b: EarthlyBranch) =>
  a !== b && SAMHAP_GROUPS.some((g) => g.includes(a) && g.includes(b) && (a === g[1] || b === g[1]));
const POSITION_NAMES = ['년', '월', '일', '시'] as const;

/** 교차 합·충 항목 — 사람1 자리·사람2 자리(년·월·일·시), 일지·일간이 걸리면 가중 2 */
type CrossRelationItem = NonNullable<CompatibilityAnalysis['crossRelations']>[number];

/**
 * 두 사주 사이의 교차 합·충 — 일주끼리(일주 궁합에서 따로 봄)를 뺀 모든 자리 쌍
 * 천간: 일간이 한쪽에 걸린 천간합만(비일간끼리는 잡음이 커서 제외). 지지: 16쌍 전부, 일지(배우자궁)가 걸리면 가중 2.
 */
function analyzeCrossRelations(person1: SajuData, person2: SajuData): {
  items: CrossRelationItem[];
  stemScore: number;
  branchScore: number;
} {
  const pillars = (p: SajuData) => [p.year, p.month, p.day, p.hour];
  const p1 = pillars(person1);
  const p2 = pillars(person2);
  const items: CrossRelationItem[] = [];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i === 2 && j === 2) continue; // 일주끼리는 analyzeDayPillarCompatibility
      const positions: [string, string] = [POSITION_NAMES[i]!, POSITION_NAMES[j]!];
      const s1 = p1[i]!.stem;
      const s2 = p2[j]!.stem;
      if ((i === 2 || j === 2) && isPair(STEM_HAP, s1, s2)) {
        items.push({ kind: '천간합', positions, chars: [s1, s2], weight: 2 });
      }
      const b1 = p1[i]!.branch;
      const b2 = p2[j]!.branch;
      const weight = i === 2 || j === 2 ? 2 : 1;
      if (isPair(BRANCH_HAP, b1, b2)) items.push({ kind: '육합', positions, chars: [b1, b2], weight });
      else if (isHalfSamHap(b1, b2)) items.push({ kind: '반합', positions, chars: [b1, b2], weight });
      if (isPair(BRANCH_CHUNG, b1, b2)) items.push({ kind: '충', positions, chars: [b1, b2], weight });
      if (isPair(BRANCH_HYEONG, b1, b2)) items.push({ kind: '형', positions, chars: [b1, b2], weight });
      if (isPair(BRANCH_WONJIN, b1, b2)) items.push({ kind: '원진', positions, chars: [b1, b2], weight });
    }
  }

  // 16쌍을 다 보므로 항목당 점수는 작게 — 바닥·천장에 붙지 않게
  const points: Record<CrossRelationItem['kind'], number> = { 천간합: 10, 육합: 6, 반합: 3, 충: -6, 형: -3, 원진: -3 };
  const sumOf = (pred: (k: CrossRelationItem['kind']) => boolean) =>
    items.filter((it) => pred(it.kind)).reduce((sum, it) => sum + points[it.kind] * it.weight, 0);
  const stemScore = Math.max(15, Math.min(90, 50 + sumOf((k) => k === '천간합')));
  const branchScore = Math.max(15, Math.min(90, 50 + sumOf((k) => k !== '천간합')));
  return { items, stemScore, branchScore };
}

/**
 * 두 사람의 사주 궁합 분석
 */
export function checkCompatibility(person1: SajuData, person2: SajuData): CompatibilityAnalysis {
  // 1. 일주 궁합 (가장 중요)
  const dayCompatibility = analyzeDayPillarCompatibility(person1, person2);

  // 2. 오행 조화
  const elementHarmony = analyzeElementHarmony(person1, person2);

  // 3. 교차 합·충 — 두 사주의 모든 자리 쌍(천간합·육합·반합·충·형·원진)
  const cross = analyzeCrossRelations(person1, person2);

  // 4. 십성 궁합
  const tenGodsCompatibility = analyzeTenGodsCompatibility(person1, person2);

  // 종합 점수 계산
  const compatibilityScore = calculateOverallScore(dayCompatibility, elementHarmony, cross, tenGodsCompatibility);

  // 장단점 분석
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const advice: string[] = [];

  if (dayCompatibility.score >= 70) {
    strengths.push('일주 궁합이 좋아 기본적으로 잘 맞는 사이입니다');
  } else if (dayCompatibility.score < 50) {
    weaknesses.push('일주가 충돌하여 의견 차이가 있을 수 있습니다');
    advice.push('서로의 차이를 인정하고 존중하는 자세가 필요합니다');
  }

  if (elementHarmony.harmony >= 70) {
    strengths.push('오행이 조화로워 서로를 보완합니다');
  } else if (elementHarmony.harmony < 50) {
    weaknesses.push('오행이 충돌하여 갈등이 생길 수 있습니다');
    advice.push('상대방의 장점을 인정하고 이해하려 노력하세요');
  }

  const describe = (it: CrossRelationItem) =>
    `${it.kind}: 첫째 ${it.positions[0]}${it.kind === '천간합' ? '간' : '지'} ${it.chars[0]} ↔ 둘째 ${it.positions[1]}${it.kind === '천간합' ? '간' : '지'} ${it.chars[1]}${it.weight === 2 ? ' (일주 걸림)' : ''}`;
  const good = cross.items.filter((it) => ['천간합', '육합', '반합'].includes(it.kind));
  const bad = cross.items.filter((it) => ['충', '형', '원진'].includes(it.kind));
  if (good.length > 0) strengths.push(`서로 끌어당기는 교차 합이 있습니다 — ${good.map(describe).join(', ')}`);
  if (bad.length > 0) {
    weaknesses.push(`서로 부딪히는 교차 충·형·원진이 있습니다 — ${bad.map(describe).join(', ')}`);
    if (bad.some((it) => it.weight === 2)) advice.push('배우자궁(일지)이 걸린 충·원진은 논리보다 시간을 두고 푸는 편이 낫습니다');
  }

  // 십성 궁합
  if (tenGodsCompatibility.score >= 70) {
    strengths.push(tenGodsCompatibility.description);
  } else if (tenGodsCompatibility.score < 50) {
    weaknesses.push(tenGodsCompatibility.description);
    advice.push(tenGodsCompatibility.advice);
  }

  // 성격 궁합
  const personalityMatch = analyzePersonalityMatch(person1, person2);
  strengths.push(...personalityMatch.strengths);
  weaknesses.push(...personalityMatch.weaknesses);
  advice.push(...personalityMatch.advice);

  return {
    compatibilityScore,
    summary: getSummary(compatibilityScore),
    strengths,
    weaknesses,
    advice,
    elementHarmony,
    crossRelations: cross.items,
  };
}

/**
 * 일주 궁합 분석
 */
function analyzeDayPillarCompatibility(
  person1: SajuData,
  person2: SajuData
): { score: number; description: string } {
  const stem1 = person1.day.stemElement;
  const stem2 = person2.day.stemElement;
  const branch1 = person1.day.branchElement;
  const branch2 = person2.day.branchElement;

  let score = 60; // 기본 점수

  // 천간 관계
  const stemRelation = analyzeWuXingRelation(stem1, stem2);
  if (stemRelation === 'generation') {
    score += 20; // 상생
  } else if (stemRelation === 'destruction') {
    score -= 15; // 상극
  } else if (stemRelation === 'same') {
    score += 10; // 동일
  }

  // 지지 관계
  const branchRelation = analyzeWuXingRelation(branch1, branch2);
  if (branchRelation === 'generation') {
    score += 15;
  } else if (branchRelation === 'destruction') {
    score -= 10;
  }

  // 일간 천간합 — 서로 끌리는 대표 신호
  if (isPair(STEM_HAP, person1.day.stem, person2.day.stem)) score += 15;
  // 일지(배우자궁)끼리 육합·충·원진
  if (isPair(BRANCH_HAP, person1.day.branch, person2.day.branch)) score += 15;
  if (isPair(BRANCH_CHUNG, person1.day.branch, person2.day.branch)) score -= 15;
  if (isPair(BRANCH_WONJIN, person1.day.branch, person2.day.branch)) score -= 10;

  return {
    score: Math.max(0, Math.min(100, score)),
    description: score >= 70 ? '매우 좋은 궁합' : score >= 50 ? '보통 궁합' : '노력이 필요한 궁합',
  };
}

/**
 * 오행 조화 분석
 */
function analyzeElementHarmony(
  person1: SajuData,
  person2: SajuData
): { harmony: number; description: string } {
  // 용신 보완 — 상대 사주에 내 용신 오행이 넉넉하면(2 이상) 보완, 내 기신 오행이 상대의 강한 오행이면 부담
  let harmonyScore = 50;
  let complementCount = 0;
  let conflictCount = 0;
  for (const [me, other] of [
    [person1, person2],
    [person2, person1],
  ] as const) {
    const { favorable, unfavorable } = getFavorSets(me);
    if ((other.wuxingCount[favorable[0]!] ?? 0) >= 2) complementCount++;
    if ((other.dominantElements ?? []).some((e) => unfavorable.includes(e))) conflictCount++;
  }

  harmonyScore += complementCount * 15;
  harmonyScore -= conflictCount * 10;

  return {
    harmony: Math.max(0, Math.min(100, harmonyScore)),
    description:
      complementCount === 2
        ? '서로가 상대의 용신 오행을 넉넉히 갖고 있어 부족한 점을 채워 주는 관계입니다'
        : complementCount === 1
          ? '한쪽이 상대의 용신 오행을 넉넉히 갖고 있어 한 방향으로 채워 주는 관계입니다'
          : '서로의 용신을 직접 채워 주지는 않아, 각자의 특성을 존중하는 것이 중요합니다',
  };
}

/**
 * 성격 궁합 분석
 */
function analyzePersonalityMatch(
  person1: SajuData,
  person2: SajuData
): { strengths: string[]; weaknesses: string[]; advice: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const advice: string[] = [];

  const element1 = person1.day.stemElement;
  const element2 = person2.day.stemElement;

  // 목-화 조합
  if (
    (element1 === '목' && element2 === '화') ||
    (element1 === '화' && element2 === '목')
  ) {
    strengths.push('창의성과 열정이 조화를 이루는 역동적인 관계');
    advice.push('서로의 에너지를 긍정적인 방향으로 활용하세요');
  }

  // 토-금 조합
  if (
    (element1 === '토' && element2 === '금') ||
    (element1 === '금' && element2 === '토')
  ) {
    strengths.push('안정성과 원칙이 조화를 이루는 신뢰있는 관계');
    advice.push('때로는 융통성도 발휘하세요');
  }

  // 금-수 조합
  if (
    (element1 === '금' && element2 === '수') ||
    (element1 === '수' && element2 === '금')
  ) {
    strengths.push('결단력과 지혜가 어우러지는 이상적인 조합');
    advice.push('감정 교류를 더 자주 하세요');
  }

  // 같은 오행
  if (element1 === element2) {
    strengths.push('서로를 잘 이해하는 편안한 관계');
    weaknesses.push('너무 비슷해서 새로운 자극이 부족할 수 있음');
    advice.push('새로운 경험을 함께 시도해보세요');
  }

  return { strengths, weaknesses, advice };
}

/**
 * 십성 궁합 분석
 */
function analyzeTenGodsCompatibility(
  person1: SajuData,
  person2: SajuData
): { score: number; description: string; advice: string } {
  let score = 60; // 기본 점수
  let description = '';
  let advice = '';

  if (!person1.tenGodsDistribution || !person2.tenGodsDistribution) {
    return { score: 60, description: '십성 정보가 부족합니다', advice: '' };
  }

  const dist1 = person1.tenGodsDistribution;
  const dist2 = person2.tenGodsDistribution;

  // 상호 보완성 분석
  const complementaryPairs: Array<[TenGod, TenGod]> = [
    ['정관', '정인'], // 관인상생: 직업운과 학습능력의 조화
    ['정재', '식신'], // 식신생재: 창의성이 재물로 연결
    ['정인', '비견'], // 인수생신: 학습이 자아를 강화
    ['편재', '식신'], // 식신생재: 창의성으로 돈을 버는 조합
    ['정관', '정재'], // 재관: 재물과 지위의 조화
  ];

  let complementCount = 0;
  complementaryPairs.forEach(([god1, god2]) => {
    if ((dist1[god1] >= 2 && dist2[god2] >= 2) || (dist1[god2] >= 2 && dist2[god1] >= 2)) {
      complementCount++;
      score += 10;
    }
  });

  if (complementCount >= 2) {
    description = '십성이 서로를 보완하여 시너지가 큽니다';
    advice = '각자의 강점을 살려 협력하면 큰 성과를 이룰 수 있습니다';
  } else if (complementCount === 1) {
    description = '십성의 일부 영역에서 보완 관계가 있습니다';
    advice = '서로의 장점을 인정하고 활용하세요';
  }

  // 경쟁 관계 분석
  const competitivePairs: Array<[TenGod, TenGod]> = [
    ['비견', '비견'], // 같은 자아, 경쟁
    ['겁재', '겁재'], // 같은 경쟁심
    ['편재', '편재'], // 재물 경쟁
  ];

  let conflictCount = 0;
  competitivePairs.forEach(([god1, god2]) => {
    if (dist1[god1] >= 3 && dist2[god2] >= 3) {
      conflictCount++;
      score -= 10;
    }
  });

  if (conflictCount >= 2) {
    description = '십성이 충돌하여 경쟁이 심할 수 있습니다';
    advice = '서로 양보하고 협력하는 자세가 필요합니다';
  }

  // 균형 있는 십성 조합
  const total1 = Object.values(dist1).reduce((sum, count) => sum + count, 0);
  const total2 = Object.values(dist2).reduce((sum, count) => sum + count, 0);
  const variance1 = Object.values(dist1).reduce((sum, count) => sum + Math.pow(count - total1 / 10, 2), 0);
  const variance2 = Object.values(dist2).reduce((sum, count) => sum + Math.pow(count - total2 / 10, 2), 0);

  if (variance1 < 3 && variance2 < 3) {
    score += 10;
    description = description || '두 사람 모두 균형잡힌 십성 분포를 가지고 있습니다';
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    description: description || '십성 궁합이 무난합니다',
    advice: advice || '서로의 특성을 이해하고 존중하세요',
  };
}

/**
 * 종합 점수 계산
 */
function calculateOverallScore(
  dayCompatibility: { score: number },
  elementHarmony: { harmony: number },
  cross: { stemScore: number; branchScore: number },
  tenGodsCompatibility: { score: number }
): number {
  // 일주 30% · 용신 보완 25% · 교차 지지 합충 25% · 교차 천간합 10% · 십성 10%
  const score =
    dayCompatibility.score * 0.3 +
    elementHarmony.harmony * 0.25 +
    cross.branchScore * 0.25 +
    cross.stemScore * 0.1 +
    tenGodsCompatibility.score * 0.1;
  return Math.round(score);
}

/**
 * 궁합 요약 메시지
 */
function getSummary(score: number): string {
  if (score >= 85) {
    return '천생연분입니다! 서로에게 최고의 파트너가 될 수 있습니다.';
  } else if (score >= 70) {
    return '매우 좋은 궁합입니다. 서로를 존중하며 행복한 관계를 만들어갈 수 있습니다.';
  } else if (score >= 55) {
    return '무난한 궁합입니다. 서로 노력하면 좋은 관계를 유지할 수 있습니다.';
  } else if (score >= 40) {
    return '다소 어려움이 있을 수 있습니다. 서로를 이해하려는 노력이 필요합니다.';
  } else {
    return '많은 노력이 필요한 관계입니다. 서로의 차이를 인정하고 존중하는 것이 중요합니다.';
  }
}

