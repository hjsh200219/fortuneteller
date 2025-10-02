/**
 * 통관용신(通關用神) 알고리즘
 * Mediation/Conflict-Resolution YongSin Selection
 *
 * 충돌하는 오행 사이를 중재하는 오행을 용신으로 선택
 * - 두 강한 오행이 서로 극(克)할 때 중간 오행으로 화해
 * - 예: 금(金) ← 수(水) → 목(木) (수가 금목 충돌 중재)
 */

import type { SajuData, WuXing } from '../../types/index.js';
import type { YongSinAlgorithm, YongSinResult } from './base.js';
import { WuXingRelations } from './base.js';

/**
 * 오행 충돌 정보
 */
interface ElementConflict {
  /** 충돌 오행 1 */
  element1: WuXing;
  /** 충돌 오행 2 */
  element2: WuXing;
  /** 충돌 강도 (개수 기준) */
  strength: number;
  /** 중재 오행 */
  mediator: WuXing | null;
}

export class MediationYongSinAlgorithm implements YongSinAlgorithm {
  readonly name = '통관용신';
  readonly method = 'mediation' as const;
  readonly description = '충돌하는 오행 사이를 중재하는 오행을 용신으로 선택합니다. 복잡한 사주 구조에 효과적입니다.';

  select(sajuData: SajuData): YongSinResult {
    const wuxingCount = sajuData.wuxingCount;
    const dayStemElement = sajuData.day.stemElement;

    // 1. 충돌 쌍 찾기
    const conflicts = this.findConflicts(wuxingCount);

    if (conflicts.length === 0) {
      // 충돌이 없으면 강약용신 로직으로 폴백
      return this.fallbackToStrength(sajuData);
    }

    // 2. 가장 강한 충돌 선택
    const mainConflict = conflicts.reduce((max, conflict) =>
      conflict.strength > max.strength ? conflict : max
    );

    if (!mainConflict.mediator) {
      // 중재자가 없으면 강약용신 로직으로 폴백
      return this.fallbackToStrength(sajuData);
    }

    const primaryYongSin = mainConflict.mediator;
    const secondaryYongSin = WuXingRelations.getShengMeElement(primaryYongSin); // 중재자를 생하는 오행

    // 희신: 중재 용신과 이를 돕는 오행
    const xiSin: WuXing[] = [primaryYongSin, secondaryYongSin];

    // 기신: 충돌하는 두 오행
    const jiSin: WuXing[] = [mainConflict.element1, mainConflict.element2];

    // 수신: 중재 용신을 극하는 오행
    const chouSin: WuXing[] = [WuXingRelations.getKeMeElement(primaryYongSin)];

    const reasoning = `${mainConflict.element1}(${wuxingCount[mainConflict.element1]}개)과 ${mainConflict.element2}(${wuxingCount[mainConflict.element2]}개)이 충돌합니다. ${primaryYongSin} 오행이 ${mainConflict.element1}을 설기(洩氣)하고 ${mainConflict.element2}를 생조(生助)하여 중재하므로 용신으로 삼습니다.`;

    // 신뢰도: 충돌 강도와 중재 효과에 따라
    const confidence = this.calculateMediationConfidence(mainConflict, dayStemElement);

    return {
      primaryYongSin,
      secondaryYongSin,
      xiSin: [...new Set(xiSin)],
      jiSin: [...new Set(jiSin)],
      chouSin: [...new Set(chouSin)],
      reasoning,
      method: this.method,
      confidence,
    };
  }

  calculateApplicability(sajuData: SajuData): number {
    const wuxingCount = sajuData.wuxingCount;
    const conflicts = this.findConflicts(wuxingCount);

    // 충돌이 많을수록 통관용신 적합도 높음
    if (conflicts.length === 0) {
      return 0.2; // 충돌 없으면 부적합
    }

    if (conflicts.length >= 2) {
      return 0.95; // 다중 충돌
    }

    const mainConflict = conflicts[0];
    if (!mainConflict) return 0.2;

    // 충돌 강도가 높을수록 적합
    if (mainConflict.strength >= 6) {
      return 0.9;
    } else if (mainConflict.strength >= 4) {
      return 0.75;
    } else {
      return 0.5;
    }
  }

  /**
   * 오행 충돌 탐지
   */
  private findConflicts(wuxingCount: Record<WuXing, number>): ElementConflict[] {
    const conflicts: ElementConflict[] = [];
    const elements: WuXing[] = ['목', '화', '토', '금', '수'];

    // 강한 오행 쌍 찾기 (둘 다 2개 이상)
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const elem1 = elements[i];
        const elem2 = elements[j];

        if (!elem1 || !elem2) continue;

        const count1 = wuxingCount[elem1] || 0;
        const count2 = wuxingCount[elem2] || 0;

        // 둘 다 2개 이상이고 상극 관계
        if (count1 >= 2 && count2 >= 2) {
          const relationType = WuXingRelations.getRelationType(elem1, elem2);

          if (relationType === 'ke') {
            // elem1이 elem2를 극함
            const mediator = WuXingRelations.getMediationElement(elem1, elem2);
            conflicts.push({
              element1: elem1,
              element2: elem2,
              strength: count1 + count2,
              mediator,
            });
          } else if (WuXingRelations.getRelationType(elem2, elem1) === 'ke') {
            // elem2가 elem1을 극함
            const mediator = WuXingRelations.getMediationElement(elem2, elem1);
            conflicts.push({
              element1: elem2,
              element2: elem1,
              strength: count1 + count2,
              mediator,
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * 중재 신뢰도 계산
   */
  private calculateMediationConfidence(conflict: ElementConflict, dayStem: WuXing): number {
    if (!conflict.mediator) return 0.5;

    // 중재자가 일간과 같으면 높은 신뢰도
    if (conflict.mediator === dayStem) {
      return 0.95;
    }

    // 중재자가 일간을 생하면 높은 신뢰도
    if (WuXingRelations.getShengElement(conflict.mediator) === dayStem) {
      return 0.9;
    }

    // 충돌 강도에 따라
    if (conflict.strength >= 6) {
      return 0.85;
    } else if (conflict.strength >= 4) {
      return 0.75;
    } else {
      return 0.6;
    }
  }

  /**
   * 강약용신 로직으로 폴백
   */
  private fallbackToStrength(sajuData: SajuData): YongSinResult {
    const strengthLevel = sajuData.dayMasterStrength?.level || 'medium';
    const dayStemElement = sajuData.day.stemElement;

    let primaryYongSin: WuXing;
    let secondaryYongSin: WuXing | undefined;

    if (strengthLevel === 'very_strong' || strengthLevel === 'strong') {
      primaryYongSin = WuXingRelations.getShengElement(dayStemElement);
      secondaryYongSin = WuXingRelations.getKeElement(dayStemElement);
    } else if (strengthLevel === 'weak' || strengthLevel === 'very_weak') {
      primaryYongSin = WuXingRelations.getShengMeElement(dayStemElement);
      secondaryYongSin = dayStemElement;
    } else {
      primaryYongSin = WuXingRelations.findWeakestElement(sajuData.wuxingCount);
    }

    return {
      primaryYongSin,
      secondaryYongSin,
      xiSin: secondaryYongSin ? [primaryYongSin, secondaryYongSin] : [primaryYongSin],
      jiSin: [WuXingRelations.getKeMeElement(primaryYongSin)],
      chouSin: [WuXingRelations.getKeElement(primaryYongSin)],
      reasoning: `충돌이 없어 강약용신 방식으로 ${primaryYongSin}을 선택합니다.`,
      method: this.method,
      confidence: 0.5,
    };
  }
}
