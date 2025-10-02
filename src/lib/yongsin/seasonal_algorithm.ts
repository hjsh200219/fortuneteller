/**
 * 조후용신(調候用神) 알고리즘
 * Seasonal/Climate-Based YongSin Selection
 *
 * 사주의 한난조습(寒暖燥濕)을 조절하는 오행을 용신으로 선택
 * - 춘하(春夏): 따뜻하고 건조 → 수(水), 금(金)으로 한습(寒濕) 조절
 * - 추동(秋冬): 차갑고 습함 → 화(火), 목(木)으로 온조(溫燥) 조절
 * - 계절별 세밀한 조율 필요
 */

import type { SajuData, WuXing } from '../../types/index.js';
import type { YongSinAlgorithm, YongSinResult } from './base.js';
import { WuXingRelations } from './base.js';

/**
 * 계절별 기후 특성
 */
interface SeasonClimate {
  /** 계절 이름 */
  name: string;
  /** 온도: hot(뜨거움), warm(따뜻함), cool(서늘함), cold(추움) */
  temperature: 'hot' | 'warm' | 'cool' | 'cold';
  /** 습도: dry(건조), moderate(적당), humid(습함) */
  humidity: 'dry' | 'moderate' | 'humid';
  /** 필요한 조절: 차갑게, 따뜻하게, 습하게, 건조하게 */
  neededAdjustment: '한습' | '온조' | '청량' | '자윤';
  /** 우선 용신 */
  preferredYongSin: WuXing[];
  /** 기신 */
  avoidElements: WuXing[];
}

/**
 * 월지(月支) 기준 계절 판단
 */
const SEASON_MAP: Record<string, SeasonClimate> = {
  // 인월(寅月, 입춘~경칩): 초봄, 여전히 춥고 건조
  인: {
    name: '초봄(寅月)',
    temperature: 'cold',
    humidity: 'dry',
    neededAdjustment: '온조',
    preferredYongSin: ['화', '목'],
    avoidElements: ['수', '금'],
  },
  // 묘월(卯月, 경칩~청명): 중봄, 따뜻해지고 건조
  묘: {
    name: '중봄(卯月)',
    temperature: 'warm',
    humidity: 'dry',
    neededAdjustment: '자윤',
    preferredYongSin: ['수'],
    avoidElements: ['화'],
  },
  // 진월(辰月, 청명~입하): 늦봄, 따뜻하고 습해짐
  진: {
    name: '늦봄(辰月)',
    temperature: 'warm',
    humidity: 'humid',
    neededAdjustment: '청량',
    preferredYongSin: ['금', '수'],
    avoidElements: ['토'],
  },
  // 사월(巳月, 입하~망종): 초여름, 더워지고 건조
  사: {
    name: '초여름(巳月)',
    temperature: 'hot',
    humidity: 'dry',
    neededAdjustment: '한습',
    preferredYongSin: ['수', '금'],
    avoidElements: ['화'],
  },
  // 오월(午月, 망종~소서): 한여름, 매우 덥고 건조
  오: {
    name: '한여름(午月)',
    temperature: 'hot',
    humidity: 'dry',
    neededAdjustment: '한습',
    preferredYongSin: ['수'],
    avoidElements: ['화', '목'],
  },
  // 미월(未月, 소서~입추): 늦여름, 덥고 습함
  미: {
    name: '늦여름(未月)',
    temperature: 'hot',
    humidity: 'humid',
    neededAdjustment: '청량',
    preferredYongSin: ['금', '수'],
    avoidElements: ['토', '화'],
  },
  // 신월(申月, 입추~백로): 초가을, 서늘하고 건조
  신: {
    name: '초가을(申月)',
    temperature: 'cool',
    humidity: 'dry',
    neededAdjustment: '자윤',
    preferredYongSin: ['수', '목'],
    avoidElements: ['금'],
  },
  // 유월(酉月, 백로~한로): 중가을, 서늘하고 건조
  유: {
    name: '중가을(酉月)',
    temperature: 'cool',
    humidity: 'dry',
    neededAdjustment: '온조',
    preferredYongSin: ['화', '목'],
    avoidElements: ['금'],
  },
  // 술월(戌月, 한로~입동): 늦가을, 차가워지고 건조
  술: {
    name: '늦가을(戌月)',
    temperature: 'cool',
    humidity: 'dry',
    neededAdjustment: '온조',
    preferredYongSin: ['화'],
    avoidElements: ['수', '금'],
  },
  // 해월(亥月, 입동~대설): 초겨울, 춥고 습함
  해: {
    name: '초겨울(亥月)',
    temperature: 'cold',
    humidity: 'humid',
    neededAdjustment: '온조',
    preferredYongSin: ['화', '목'],
    avoidElements: ['수'],
  },
  // 자월(子月, 대설~소한): 한겨울, 매우 춥고 습함
  자: {
    name: '한겨울(子月)',
    temperature: 'cold',
    humidity: 'humid',
    neededAdjustment: '온조',
    preferredYongSin: ['화'],
    avoidElements: ['수', '금'],
  },
  // 축월(丑月, 소한~입춘): 늦겨울, 춥고 건조
  축: {
    name: '늦겨울(丑月)',
    temperature: 'cold',
    humidity: 'dry',
    neededAdjustment: '온조',
    preferredYongSin: ['화', '목'],
    avoidElements: ['수', '토'],
  },
};

export class SeasonalYongSinAlgorithm implements YongSinAlgorithm {
  readonly name = '조후용신';
  readonly method = 'seasonal' as const;
  readonly description = '사주의 한난조습(寒暖燥濕)을 조절하는 오행을 용신으로 선택합니다. 계절적 균형과 건강 분석에 유용합니다.';

  select(sajuData: SajuData): YongSinResult {
    const monthBranch = sajuData.month.branch;
    const dayStemElement = sajuData.day.stemElement;

    // 월지로 계절 판단
    const season = SEASON_MAP[monthBranch];
    if (!season) {
      throw new Error(`Unknown month branch: ${monthBranch}`);
    }

    // 계절 특성에 따른 용신 선택
    const primaryYongSin = season.preferredYongSin[0] as WuXing;
    const secondaryYongSin = season.preferredYongSin[1] as WuXing | undefined;

    // 희신: 용신과 용신을 돕는 오행
    const xiSin: WuXing[] = season.preferredYongSin.slice(0, 2) as WuXing[];
    if (primaryYongSin && WuXingRelations.getShengMeElement(primaryYongSin)) {
      xiSin.push(WuXingRelations.getShengMeElement(primaryYongSin));
    }

    // 기신: 피해야 할 오행
    const jiSin: WuXing[] = season.avoidElements;

    // 수신: 용신을 극하는 오행
    const chouSin: WuXing[] = [WuXingRelations.getKeMeElement(primaryYongSin)];

    const reasoning = `${season.name} 출생으로 ${season.temperature === 'hot' || season.temperature === 'warm' ? '따뜻하고' : '차갑고'} ${season.humidity === 'dry' ? '건조한' : '습한'} 기운이 강합니다. ${season.neededAdjustment} 조절을 위해 ${primaryYongSin} 오행을 용신으로 삼습니다.`;

    // 계절과 일간의 조화 확인
    const confidence = this.calculateSeasonalHarmony(dayStemElement, season);

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
    const monthBranch = sajuData.month.branch;
    const season = SEASON_MAP[monthBranch];

    if (!season) return 0.0;

    // 계절 편중이 심한 경우 조후용신 적합도 높음
    const wuxingCount = sajuData.wuxingCount;

    // 화(火)가 많으면 한습 필요, 수(水)가 많으면 온조 필요
    const fireCount = wuxingCount['화'] || 0;
    const waterCount = wuxingCount['수'] || 0;

    let applicability = 0.7; // 기본값

    if (season.neededAdjustment === '한습' && fireCount >= 3) {
      applicability = 0.95; // 여름에 화 많음 → 조후용신 매우 적합
    } else if (season.neededAdjustment === '온조' && waterCount >= 3) {
      applicability = 0.95; // 겨울에 수 많음 → 조후용신 매우 적합
    } else if (season.temperature === 'hot' || season.temperature === 'cold') {
      applicability = 0.85; // 극단적 계절
    }

    return applicability;
  }

  /**
   * 계절과 일간의 조화도 계산
   */
  private calculateSeasonalHarmony(dayStem: WuXing, season: SeasonClimate): number {
    // 일간이 계절 용신과 일치하면 높은 신뢰도
    if (season.preferredYongSin.includes(dayStem)) {
      return 0.95;
    }

    // 일간이 기신과 일치하면 낮은 신뢰도
    if (season.avoidElements.includes(dayStem)) {
      return 0.6;
    }

    // 중간 신뢰도
    return 0.8;
  }
}
