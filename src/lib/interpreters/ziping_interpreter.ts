/**
 * 자평명리(子平命理) 해석기
 * Traditional Orthodox Ziping School Interpreter
 *
 * 특징:
 * - 음양오행의 균형 중시
 * - 격국(格局) 체계적 활용
 * - 일간 강약 기준 용신 선택
 * - 전통적이고 정통적인 해석
 */

import type { SajuPillars } from '../../types/index.js';
import type { UserInterpretationSettings, SchoolCode } from '../../types/interpretation.js';
import { BaseSchoolInterpreter } from '../school_interpreter.js';
import { YongSinSelector } from '../yongsin/selector.js';

export class ZipingInterpreter extends BaseSchoolInterpreter {
  readonly schoolCode: SchoolCode = 'ziping';
  readonly schoolName = '자평명리';

  determineYongSin(pillars: SajuPillars, method: UserInterpretationSettings['yongSinMethod']): string {
    // 사주 데이터 구성 (간단히)
    const sajuData = this.pillarsToSajuData(pillars);
    const result = YongSinSelector.select(sajuData, method);
    return result.primaryYongSin;
  }

  override determineGeokGuk(pillars: SajuPillars): string {
    // 격국 판단 로직 (간단한 버전)
    const dayStem = pillars.day.stemElement;
    const monthBranch = pillars.month.branchElement;

    // 월령 득령 여부로 기본 격국 판단
    if (dayStem === monthBranch) {
      return '건록격(建祿格)';
    }

    // 월지 기준 격국
    const seasonalFormats: Record<string, string> = {
      목: '인수격(印綬格)',
      화: '식신격(食神格)',
      토: '재성격(財星格)',
      금: '관성격(官星格)',
      수: '인수격(印綬格)',
    };

    return seasonalFormats[monthBranch] || '평범격(平凡格)';
  }

  interpretHealth(_pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string {
    const priority = settings.priorities.health;
    const dayStem = _pillars.day.stemElement;

    let interpretation = `일간(${dayStem})의 기운이 ${yongSin} 오행의 도움을 받아 건강을 유지합니다.`;

    if (priority >= 0.8) {
      interpretation += ` 특히 건강을 중시하시니, ${yongSin} 기운을 보강하는 음식과 활동(${this.getElementActivities(yongSin)})을 권장합니다.`;
    }

    return interpretation;
  }

  interpretWealth(_pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string {
    const priority = settings.priorities.wealth;

    let interpretation = `재물 운은 ${yongSin} 오행의 흐름에 따라 형성됩니다.`;

    if (priority >= 0.8) {
      interpretation += ` 재물을 중시하시니, ${yongSin} 방향(${this.getElementDirection(yongSin)})의 투자나 사업을 고려하세요.`;
    }

    return interpretation;
  }

  interpretCareer(_pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string {
    let interpretation = `직업은 ${yongSin} 오행과 관련된 분야가 유리합니다.`;

    if (settings.eraAdaptation.modernCareer) {
      const careers = this.getModernCareers(yongSin);
      interpretation += ` 현대 직업으로는 ${careers.slice(0, 3).join(', ')} 등이 적합합니다.`;
    } else {
      const traditionalCareers = this.getTraditionalCareers(yongSin);
      interpretation += ` 전통적으로 ${traditionalCareers.slice(0, 3).join(', ')} 등이 좋습니다.`;
    }

    return interpretation;
  }

  interpretRelationship(_pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string {
    const priority = settings.priorities.relationship;

    let interpretation = `인간관계는 음양오행의 균형을 중시하는 자평명리 관점에서, ${yongSin} 기운과 조화로운 사람과 좋은 관계를 맺습니다.`;

    if (priority >= 0.8) {
      interpretation += ` 배우자나 동료는 ${yongSin} 오행의 특성을 가진 사람이 좋습니다.`;
    }

    return interpretation;
  }

  interpretFame(_pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string {
    const priority = settings.priorities.fame;

    let interpretation = `명예와 사회적 지위는 격국과 용신의 조화에 달려 있습니다.`;

    if (priority >= 0.8) {
      interpretation += ` ${yongSin} 오행을 활용한 활동으로 명성을 얻을 수 있습니다.`;
    }

    return interpretation;
  }

  // 유틸리티 메서드들
  private pillarsToSajuData(pillars: SajuPillars): any {
    return {
      day: pillars.day,
      month: pillars.month,
      year: pillars.year,
      hour: pillars.hour,
      wuxingCount: {
        목: 2,
        화: 2,
        토: 2,
        금: 2,
        수: 2,
      },
      dayMasterStrength: { level: 'medium', score: 50, analysis: '' },
      birthDate: '1990-01-01',
      birthTime: '00:00',
      calendar: 'solar' as const,
      isLeapMonth: false,
      gender: 'male' as const,
      tenGods: [],
    };
  }

  private getElementActivities(element: string): string {
    const activities: Record<string, string> = {
      목: '산책, 등산, 원예',
      화: '운동, 사교 활동',
      토: '명상, 요가',
      금: '골프, 정리 정돈',
      수: '수영, 휴식',
    };
    return activities[element] || '적절한 활동';
  }

  private getElementDirection(element: string): string {
    const directions: Record<string, string> = {
      목: '동쪽',
      화: '남쪽',
      토: '중앙',
      금: '서쪽',
      수: '북쪽',
    };
    return directions[element] || '중앙';
  }

  private getModernCareers(element: string): string[] {
    const careers: Record<string, string[]> = {
      목: ['교육', '출판', '환경', '바이오'],
      화: ['IT', '광고', '방송', '에너지'],
      토: ['부동산', '건설', '컨설팅'],
      금: ['금융', '법조', '반도체', '정밀 산업'],
      수: ['물류', '유통', '연구', 'IT'],
    };
    return careers[element] || ['다양한 분야'];
  }

  private getTraditionalCareers(element: string): string[] {
    const careers: Record<string, string[]> = {
      목: ['교사', '문필가', '목수'],
      화: ['요리사', '전기 기술자', '예술가'],
      토: ['농부', '건축가', '중개인'],
      금: ['금융업', '금속 가공', '법관'],
      수: ['상인', '어부', '의사'],
    };
    return careers[element] || ['다양한 직업'];
  }
}
