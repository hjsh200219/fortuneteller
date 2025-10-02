/**
 * 강약용신(强弱用神) 알고리즘
 * Strength-Based YongSin Selection
 *
 * 일간의 강약을 판단하여 부족한 오행을 용신으로 선택
 * - 일간이 강함: 설기(洩氣), 극(克)하는 오행 사용
 * - 일간이 약함: 생조(生助)하는 오행 사용
 */

import type { SajuData, WuXing } from '../../types/index.js';
import type { YongSinAlgorithm, YongSinResult } from './base.js';
import { WuXingRelations } from './base.js';

export class StrengthYongSinAlgorithm implements YongSinAlgorithm {
  readonly name = '강약용신';
  readonly method = 'strength' as const;
  readonly description = '일간의 강약을 판단하여 부족한 오행을 용신으로 선택합니다. 가장 전통적이고 널리 사용되는 방법입니다.';

  select(sajuData: SajuData): YongSinResult {
    const strengthLevel = sajuData.dayMasterStrength?.level || 'medium';
    const dayStemElement = sajuData.day.stemElement;

    let primaryYongSin: WuXing;
    let secondaryYongSin: WuXing | undefined;
    let xiSin: WuXing[] = [];
    let jiSin: WuXing[] = [];
    let chouSin: WuXing[] = [];
    let reasoning = '';
    let confidence = 0.7;

    if (strengthLevel === 'very_strong' || strengthLevel === 'strong') {
      // 일간이 강함 → 설기, 극하는 오행이 용신
      const shengElement = WuXingRelations.getShengElement(dayStemElement); // 식상(설기)
      const keElement = WuXingRelations.getKeElement(dayStemElement); // 재성

      primaryYongSin = shengElement;
      secondaryYongSin = keElement;

      xiSin = [shengElement, keElement];
      jiSin = [dayStemElement, WuXingRelations.getShengMeElement(dayStemElement)]; // 비겁, 인성
      chouSin = [WuXingRelations.getShengMeElement(dayStemElement)]; // 인성

      reasoning = `일간(${dayStemElement})이 ${strengthLevel === 'very_strong' ? '매우 ' : ''}강하므로, 일간의 힘을 설기(洩氣)하는 ${shengElement}(식상)과 ${keElement}(재성)을 용신으로 삼습니다.`;
      confidence = strengthLevel === 'very_strong' ? 0.9 : 0.8;

    } else if (strengthLevel === 'weak' || strengthLevel === 'very_weak') {
      // 일간이 약함 → 생조하는 오행이 용신
      const shengMeElement = WuXingRelations.getShengMeElement(dayStemElement); // 인성

      primaryYongSin = shengMeElement;
      secondaryYongSin = dayStemElement; // 비겁

      xiSin = [shengMeElement, dayStemElement];
      jiSin = [
        WuXingRelations.getKeElement(dayStemElement), // 재성
        WuXingRelations.getKeMeElement(dayStemElement), // 관살
      ];
      chouSin = [WuXingRelations.getKeElement(dayStemElement)]; // 재성

      reasoning = `일간(${dayStemElement})이 ${strengthLevel === 'very_weak' ? '매우 ' : ''}약하므로, 일간을 생조(生助)하는 ${shengMeElement}(인성)과 ${dayStemElement}(비겁)을 용신으로 삼습니다.`;
      confidence = strengthLevel === 'very_weak' ? 0.9 : 0.8;

    } else {
      // medium - 중화
      const weakestElement = WuXingRelations.findWeakestElement(sajuData.wuxingCount);
      primaryYongSin = weakestElement;

      xiSin = [weakestElement, WuXingRelations.getShengElement(weakestElement)];
      jiSin = [WuXingRelations.getKeElement(weakestElement)];
      chouSin = [WuXingRelations.getKeMeElement(weakestElement)];

      reasoning = `사주가 중화되어 있으므로, 가장 약한 오행인 ${weakestElement}를 보강하여 균형을 맞춥니다.`;
      confidence = 0.6; // 중화는 다른 알고리즘 고려 필요
    }

    return {
      primaryYongSin,
      secondaryYongSin,
      xiSin,
      jiSin,
      chouSin,
      reasoning,
      method: this.method,
      confidence,
    };
  }

  calculateApplicability(sajuData: SajuData): number {
    const strengthLevel = sajuData.dayMasterStrength?.level;

    // 일간 강약이 명확할수록 적용 적합도 높음
    if (!strengthLevel) return 0.5;

    if (strengthLevel === 'very_strong' || strengthLevel === 'very_weak') {
      return 0.95;
    }

    if (strengthLevel === 'strong' || strengthLevel === 'weak') {
      return 0.85;
    }

    // medium인 경우 적합도 낮음 (조후용신 등 다른 방법 권장)
    return 0.4;
  }
}
