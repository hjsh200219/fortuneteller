/**
 * 용신 알고리즘 기본 인터페이스
 * Base interface for YongSin algorithms
 */

import type { SajuData, WuXing } from '../../types/index.js';
import type { YongSinMethod } from '../../types/interpretation.js';

/**
 * 용신 선정 결과
 */
export interface YongSinResult {
  /** 주 용신 */
  primaryYongSin: WuXing;
  /** 보조 용신 */
  secondaryYongSin?: WuXing;
  /** 희신(喜神) - 용신을 돕는 오행 */
  xiSin: WuXing[];
  /** 기신(忌神) - 피해야 할 오행 */
  jiSin: WuXing[];
  /** 수신(仇神) - 용신을 극하는 오행 */
  chouSin: WuXing[];
  /** 선정 이유 */
  reasoning: string;
  /** 알고리즘 방법 */
  method: YongSinMethod;
  /** 신뢰도 (0.0 ~ 1.0) */
  confidence: number;
}

/**
 * 용신 선정 알고리즘 인터페이스
 */
export interface YongSinAlgorithm {
  /** 알고리즘 이름 */
  readonly name: string;
  /** 알고리즘 방법 코드 */
  readonly method: YongSinMethod;
  /** 알고리즘 설명 */
  readonly description: string;

  /**
   * 용신 선정
   * @param sajuData 사주 데이터
   * @returns 용신 선정 결과
   */
  select(sajuData: SajuData): YongSinResult;

  /**
   * 적용 가능 여부 판단
   * @param sajuData 사주 데이터
   * @returns 0.0 ~ 1.0 적용 적합도
   */
  calculateApplicability(sajuData: SajuData): number;
}

/**
 * 오행 상생상극 유틸리티
 */
export class WuXingRelations {
  /**
   * A가 B를 생(生)함
   * 목생화, 화생토, 토생금, 금생수, 수생목
   */
  static getShengElement(element: WuXing): WuXing {
    const map: Record<WuXing, WuXing> = {
      목: '화',
      화: '토',
      토: '금',
      금: '수',
      수: '목',
    };
    return map[element];
  }

  /**
   * B를 생(生)하는 A
   */
  static getShengMeElement(element: WuXing): WuXing {
    const map: Record<WuXing, WuXing> = {
      목: '수',
      화: '목',
      토: '화',
      금: '토',
      수: '금',
    };
    return map[element];
  }

  /**
   * A가 B를 극(克)함
   * 목극토, 토극수, 수극화, 화극금, 금극목
   */
  static getKeElement(element: WuXing): WuXing {
    const map: Record<WuXing, WuXing> = {
      목: '토',
      화: '금',
      토: '수',
      금: '목',
      수: '화',
    };
    return map[element];
  }

  /**
   * B를 극(克)하는 A
   */
  static getKeMeElement(element: WuXing): WuXing {
    const map: Record<WuXing, WuXing> = {
      목: '금',
      화: '수',
      토: '목',
      금: '화',
      수: '토',
    };
    return map[element];
  }

  /**
   * 가장 약한 오행 찾기
   */
  static findWeakestElement(wuxingCount: Record<WuXing, number>): WuXing {
    let weakest: WuXing = '목';
    let minCount = wuxingCount['목'];

    for (const [element, count] of Object.entries(wuxingCount) as [WuXing, number][]) {
      if (count < minCount) {
        minCount = count;
        weakest = element;
      }
    }

    return weakest;
  }

  /**
   * 가장 강한 오행 찾기
   */
  static findStrongestElement(wuxingCount: Record<WuXing, number>): WuXing {
    let strongest: WuXing = '목';
    let maxCount = wuxingCount['목'];

    for (const [element, count] of Object.entries(wuxingCount) as [WuXing, number][]) {
      if (count > maxCount) {
        maxCount = count;
        strongest = element;
      }
    }

    return strongest;
  }

  /**
   * 충돌하는 두 오행 사이를 중재하는 오행
   * 금 ← 수 → 목 (수가 금목 충돌 중재)
   */
  static getMediationElement(element1: WuXing, element2: WuXing): WuXing | null {
    // element1이 element2를 극하는 경우
    if (this.getKeElement(element1) === element2) {
      // element1 → 중재자 → element2 (중재자가 element1을 설기하고 element2를 생)
      return this.getShengElement(element1);
    }

    // element2가 element1을 극하는 경우
    if (this.getKeElement(element2) === element1) {
      return this.getShengElement(element2);
    }

    // 충돌 관계가 아니면 null
    return null;
  }

  /**
   * 오행 간 관계 유형
   */
  static getRelationType(from: WuXing, to: WuXing): 'sheng' | 'ke' | 'same' | 'other' {
    if (from === to) return 'same';
    if (this.getShengElement(from) === to) return 'sheng';
    if (this.getKeElement(from) === to) return 'ke';
    return 'other';
  }
}
