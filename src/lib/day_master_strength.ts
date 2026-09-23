/**
 * 일간(日干) 강약 판단 시스템
 * 사주의 가장 중요한 분석 요소인 일간의 강약을 종합적으로 판단
 */

import type { SajuData, WuXing, HeavenlyStem, EarthlyBranch } from '../types/index.js';
import { getHeavenlyStemByKorean } from '../data/heavenly_stems.js';
import { getGeneratingElement } from '../data/wuxing.js';
import { JIJANGGAN_STRENGTH_DETAILED } from '../data/jijanggan_strength_table.js';

/** 자리별 가중치 — 월지(월령)가 가장 무겁고 일지(좌하)가 다음. 합 9.5 */
const POSITION_WEIGHTS = {
  yearStem: 1,
  monthStem: 1,
  hourStem: 1,
  yearBranch: 1,
  monthBranch: 3,
  dayBranch: 1.5,
  hourBranch: 1,
} as const;

/**
 * 일간을 돕는 기운(비겁·인성)의 가중 비율 (0-1)
 * 천간은 자리 가중치 그대로, 지지는 자리 가중치를 지장간 일수 비율로 나눠 오행별로 더한다.
 */
export function calculateSupportRatio(sajuData: SajuData): {
  ratio: number;
  deukRyeong: boolean;
  deukJi: boolean;
  deukSe: boolean;
} {
  const dayElement = sajuData.day.stemElement;
  const inseong = getGeneratingElement(dayElement);
  const isSupport = (e: WuXing) => e === dayElement || e === inseong;

  let support = 0;
  let total = 0;
  const addStem = (stem: HeavenlyStem, w: number) => {
    total += w;
    if (isSupport(getHeavenlyStemByKorean(stem)!.element)) support += w;
  };
  const branchSupport = (branch: EarthlyBranch) =>
    JIJANGGAN_STRENGTH_DETAILED[branch].reduce(
      (sum, p) => sum + (isSupport(getHeavenlyStemByKorean(p.stem)!.element) ? p.strength / 100 : 0),
      0
    );
  const addBranch = (branch: EarthlyBranch, w: number) => {
    total += w;
    support += w * branchSupport(branch);
  };

  addStem(sajuData.year.stem, POSITION_WEIGHTS.yearStem);
  addStem(sajuData.month.stem, POSITION_WEIGHTS.monthStem);
  addStem(sajuData.hour.stem, POSITION_WEIGHTS.hourStem);
  addBranch(sajuData.year.branch, POSITION_WEIGHTS.yearBranch);
  addBranch(sajuData.month.branch, POSITION_WEIGHTS.monthBranch);
  addBranch(sajuData.day.branch, POSITION_WEIGHTS.dayBranch);
  addBranch(sajuData.hour.branch, POSITION_WEIGHTS.hourBranch);

  // 득령·득지: 월지·일지 정기가 비겁·인성. 득세: 월지·일지를 뺀 나머지 다섯 자리에서 돕는 쪽이 절반 이상
  const mainIsSupport = (b: EarthlyBranch) => isSupport(getHeavenlyStemByKorean(JIJANGGAN_STRENGTH_DETAILED[b].at(-1)!.stem)!.element);
  const restSupport =
    [sajuData.year.stem, sajuData.month.stem, sajuData.hour.stem].filter((st) => isSupport(getHeavenlyStemByKorean(st)!.element)).length +
    branchSupport(sajuData.year.branch) +
    branchSupport(sajuData.hour.branch);

  return {
    ratio: support / total,
    deukRyeong: mainIsSupport(sajuData.month.branch),
    deukJi: mainIsSupport(sajuData.day.branch),
    deukSe: restSupport >= 2.5,
  };
}

/**
 * 등급 경계(돕는 기운 %) — 1901-2099 무작위 출생 20,000건 분포의 15·40·60·85 백분위.
 * 평균 40%(다섯 오행 중 비겁·인성 둘 = 2/5)를 중심으로 신강·신약이 대칭, 중화는 약 20%.
 * very_weak ≤22 < weak ≤35 < medium < 44 ≤ strong < 58 ≤ very_strong
 */
export const STRENGTH_THRESHOLDS = { veryWeak: 22, weak: 35, strong: 44, veryStrong: 58 } as const;

/**
 * 일간 강약 종합 분석 — 돕는 기운(비겁·인성)의 자리·지장간 가중 비율
 */
export function analyzeDayMasterStrength(sajuData: SajuData): {
  level: 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak';
  score: number; // 0-100 = 돕는 기운 비율(%)
  analysis: string;
} {
  const { ratio, deukRyeong, deukJi, deukSe } = calculateSupportRatio(sajuData);
  const score = Math.round(ratio * 100);

  let level: 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak';
  if (score >= STRENGTH_THRESHOLDS.veryStrong) level = 'very_strong';
  else if (score >= STRENGTH_THRESHOLDS.strong) level = 'strong';
  else if (score > STRENGTH_THRESHOLDS.weak) level = 'medium';
  else if (score > STRENGTH_THRESHOLDS.veryWeak) level = 'weak';
  else level = 'very_weak';

  const reasons = [
    deukRyeong ? '득령(월지가 일간을 돕는 기운)' : '실령(월지가 일간을 설·극하는 기운)',
    deukJi ? '득지(일지가 돕는 기운)' : '실지',
    deukSe ? '득세(나머지 자리에서 돕는 기운이 많음)' : '실세',
    `돕는 기운 비율 ${score}%`,
  ];
  if (sajuData.wolRyeong?.reason) reasons.push(sajuData.wolRyeong.reason);

  return { level, score, analysis: reasons.join('. ') + '.' };
}

/**
 * 일간 강약에 따른 용신(用神) 추천
 */
export function recommendYongSin(
  dayMasterStrength: 'very_strong' | 'strong' | 'medium' | 'weak' | 'very_weak'
): {
  yongSin: string[];
  advice: string;
} {
  switch (dayMasterStrength) {
    case 'very_strong':
    case 'strong':
      return {
        yongSin: ['재성(財星)', '관성(官星)', '식상(食傷)'],
        advice: '일간이 강하므로 설기하는 재관식상을 용신으로 삼아야 합니다. 재물운과 직업운을 키우세요.',
      };

    case 'weak':
    case 'very_weak':
      return {
        yongSin: ['인성(印星)', '비겁(比劫)'],
        advice: '일간이 약하므로 돕는 인성과 비겁을 용신으로 삼아야 합니다. 협력자와 멘토의 도움을 받으세요.',
      };

    case 'medium':
    default:
      return {
        yongSin: ['상황에 따라 변동'],
        advice:
          '일간이 중화되어 있습니다. 유연하게 대처하며 균형을 유지하세요.',
      };
  }
}
