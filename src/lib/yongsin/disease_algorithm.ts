/**
 * 병약용신(病藥用神) 알고리즘
 * Disease-Cure YongSin Selection
 *
 * 사주의 문제점(병)을 진단하고 치료(약)하는 오행을 용신으로 선택
 * - 과다한 오행을 제어
 * - 부족한 오행을 보충
 * - 현대적이고 실용적인 접근법
 */

import type { SajuData, WuXing } from '../../types/index.js';
import type { YongSinAlgorithm, YongSinResult } from './base.js';
import { WuXingRelations } from './base.js';

/**
 * 사주 병증 유형
 */
interface SajuDisease {
  /** 병증 유형 */
  type: 'excess' | 'deficiency' | 'conflict' | 'stagnation';
  /** 문제 오행 */
  problematicElement: WuXing;
  /** 심각도 (1-10) */
  severity: number;
  /** 진단 */
  diagnosis: string;
  /** 치료 오행 (용신) */
  cure: WuXing;
}

export class DiseaseYongSinAlgorithm implements YongSinAlgorithm {
  readonly name = '병약용신';
  readonly method = 'disease' as const;
  readonly description = '사주의 문제점을 진단하고 치료하는 오행을 용신으로 선택합니다. 현대적이고 실용적인 접근법입니다.';

  select(sajuData: SajuData): YongSinResult {
    // 1. 사주 병증 진단
    const diseases = this.diagnoseDiseases(sajuData);

    if (diseases.length === 0) {
      // 병증이 없으면 강약용신 로직으로 폴백
      return this.fallbackToStrength(sajuData);
    }

    // 2. 가장 심각한 병증 선택
    const mainDisease = diseases.reduce((max, disease) =>
      disease.severity > max.severity ? disease : max
    );

    const primaryYongSin = mainDisease.cure;
    const secondaryYongSin = WuXingRelations.getShengMeElement(primaryYongSin); // 용신을 생하는 오행

    // 희신: 치료 용신과 이를 돕는 오행
    const xiSin: WuXing[] = [primaryYongSin];
    if (secondaryYongSin) {
      xiSin.push(secondaryYongSin);
    }

    // 기신: 문제 오행과 이를 돕는 오행
    const jiSin: WuXing[] = [mainDisease.problematicElement];
    if (mainDisease.type === 'excess') {
      jiSin.push(WuXingRelations.getShengMeElement(mainDisease.problematicElement));
    }

    // 수신: 용신을 극하는 오행
    const chouSin: WuXing[] = [WuXingRelations.getKeMeElement(primaryYongSin)];

    const reasoning = `${mainDisease.diagnosis} ${primaryYongSin} 오행으로 치료하여 균형을 회복합니다.`;

    // 신뢰도: 병증 심각도에 비례
    const confidence = Math.min(0.95, 0.5 + mainDisease.severity * 0.05);

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
    const diseases = this.diagnoseDiseases(sajuData);

    // 병증이 많고 심각할수록 적합도 높음
    if (diseases.length === 0) {
      return 0.3;
    }

    const maxSeverity = Math.max(...diseases.map((d) => d.severity));

    if (maxSeverity >= 8) {
      return 0.95;
    } else if (maxSeverity >= 6) {
      return 0.85;
    } else if (maxSeverity >= 4) {
      return 0.7;
    } else {
      return 0.5;
    }
  }

  /**
   * 사주 병증 진단
   */
  private diagnoseDiseases(sajuData: SajuData): SajuDisease[] {
    const diseases: SajuDisease[] = [];
    const wuxingCount = sajuData.wuxingCount;
    const dayStemElement = sajuData.day.stemElement;

    // 1. 과다 병증 (excess): 어떤 오행이 4개 이상
    for (const [element, count] of Object.entries(wuxingCount) as [WuXing, number][]) {
      if (count >= 4) {
        const severity = Math.min(10, count + 2);
        const cure = WuXingRelations.getKeElement(element); // 극하는 오행으로 제어

        diseases.push({
          type: 'excess',
          problematicElement: element,
          severity,
          diagnosis: `${element} 오행이 과다합니다(${count}개).`,
          cure,
        });
      }
    }

    // 2. 결핍 병증 (deficiency): 어떤 오행이 0개
    for (const element of ['목', '화', '토', '금', '수'] as WuXing[]) {
      const count = wuxingCount[element] || 0;
      if (count === 0) {
        const severity = 6;
        const cure = element; // 부족한 오행 자체가 용신

        diseases.push({
          type: 'deficiency',
          problematicElement: element,
          severity,
          diagnosis: `${element} 오행이 전혀 없습니다.`,
          cure,
        });
      }
    }

    // 3. 일간 극약 병증 (일간을 극하는 오행이 많음)
    const keMeElement = WuXingRelations.getKeMeElement(dayStemElement);
    const keMeCount = wuxingCount[keMeElement] || 0;
    if (keMeCount >= 3) {
      const severity = Math.min(10, keMeCount + 1);
      const cure = WuXingRelations.getKeElement(keMeElement); // 관살을 극하는 오행

      diseases.push({
        type: 'conflict',
        problematicElement: keMeElement,
        severity,
        diagnosis: `일간(${dayStemElement})을 극하는 ${keMeElement} 오행이 많습니다(${keMeCount}개).`,
        cure,
      });
    }

    // 4. 재성 극과 병증 (재성이 많아 인성을 극함)
    const keElement = WuXingRelations.getKeElement(dayStemElement); // 재성
    const keCount = wuxingCount[keElement] || 0;
    const shengMeElement = WuXingRelations.getShengMeElement(dayStemElement); // 인성
    const shengMeCount = wuxingCount[shengMeElement] || 0;

    if (keCount >= 3 && shengMeCount <= 1) {
      const severity = Math.min(10, keCount);
      const cure = WuXingRelations.getKeElement(keElement); // 재성을 극하는 관살

      diseases.push({
        type: 'stagnation',
        problematicElement: keElement,
        severity,
        diagnosis: `${keElement}(재성)이 과다하여 ${shengMeElement}(인성)을 극합니다.`,
        cure,
      });
    }

    return diseases;
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
      reasoning: `특별한 병증이 없어 강약용신 방식으로 ${primaryYongSin}을 선택합니다.`,
      method: this.method,
      confidence: 0.6,
    };
  }
}
