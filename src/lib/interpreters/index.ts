/**
 * 유파별 해석기 모듈
 * School Interpreters Module
 */

import type { SchoolCode, UserInterpretationSettings } from '../../types/interpretation.js';
import type { SchoolInterpreter } from '../school_interpreter.js';
import { ZipingInterpreter } from './ziping_interpreter.js';
import { ModernInterpreter } from './modern_interpreter.js';

// 간단한 기본 해석기 (나머지 3개 유파용)
import { BaseSchoolInterpreter } from '../school_interpreter.js';
import { YongSinSelector } from '../yongsin/selector.js';
import type { SajuPillars } from '../../types/index.js';

// 적천수 해석기
class DtsInterpreter extends BaseSchoolInterpreter {
  readonly schoolCode: SchoolCode = 'dts';
  readonly schoolName = '적천수';

  determineYongSin(pillars: SajuPillars, method: 'strength' | 'seasonal' | 'mediation' | 'disease'): string {
    const sajuData = this.createSimpleSajuData(pillars);
    const result = YongSinSelector.select(sajuData, method);
    return result.primaryYongSin;
  }

  interpretHealth(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `천간의 투출과 통근을 중시하여 ${yongSin} 기운의 건강법을 권장합니다.`;
  }

  interpretWealth(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `천간의 흐름에 따라 ${yongSin} 방향의 재물 운이 형성됩니다.`;
  }

  interpretCareer(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `천간 중심 해석으로 ${yongSin} 오행 관련 명예로운 직업이 적합합니다.`;
  }

  interpretRelationship(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `천간의 조화를 중시하여 ${yongSin} 기운과 어울리는 관계가 좋습니다.`;
  }

  interpretFame(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `천간의 투출이 명예와 직결됩니다. ${yongSin} 분야에서 사회적 인정을 받을 수 있습니다.`;
  }

  private createSimpleSajuData(pillars: SajuPillars): import('../../types/index.js').SajuData {
    return {
      year: pillars.year,
      month: pillars.month,
      day: pillars.day,
      hour: pillars.hour,
      wuxingCount: { 목: 2, 화: 2, 토: 2, 금: 2, 수: 2 },
      dayMasterStrength: { level: 'medium', score: 50, analysis: '' },
      birthDate: '1990-01-01',
      birthTime: '00:00',
      calendar: 'solar' as const,
      isLeapMonth: false,
      gender: 'male' as const,
      tenGods: [],
    };
  }
}

// 궁통보감 해석기
class QtbjInterpreter extends BaseSchoolInterpreter {
  readonly schoolCode: SchoolCode = 'qtbj';
  readonly schoolName = '궁통보감';

  determineYongSin(pillars: SajuPillars, method: 'strength' | 'seasonal' | 'mediation' | 'disease'): string {
    const sajuData = this.createSimpleSajuData(pillars);
    // 궁통보감은 조후용신 선호
    const preferredMethod = method === 'strength' ? 'seasonal' : method;
    const result = YongSinSelector.select(sajuData, preferredMethod);
    return result.primaryYongSin;
  }

  interpretHealth(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `계절의 한난조습을 조절하는 ${yongSin} 기운으로 건강을 유지하세요. 계절 음식과 양생법이 중요합니다.`;
  }

  interpretWealth(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `계절의 흐름에 따라 ${yongSin} 오행 관련 재물 운이 좋습니다.`;
  }

  interpretCareer(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `계절 조화를 중시하여 ${yongSin} 관련 직업, 특히 건강과 자연 관련 분야가 적합합니다.`;
  }

  interpretRelationship(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `계절적 균형을 맞추는 ${yongSin} 기운의 사람과 조화롭습니다.`;
  }

  interpretFame(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `계절의 조화를 이룬 ${yongSin} 분야에서 명성을 얻을 수 있습니다.`;
  }

  private createSimpleSajuData(pillars: SajuPillars): import('../../types/index.js').SajuData {
    return {
      year: pillars.year,
      month: pillars.month,
      day: pillars.day,
      hour: pillars.hour,
      wuxingCount: { 목: 2, 화: 2, 토: 2, 금: 2, 수: 2 },
      dayMasterStrength: { level: 'medium', score: 50, analysis: '' },
      birthDate: '1990-01-01',
      birthTime: '00:00',
      calendar: 'solar' as const,
      isLeapMonth: false,
      gender: 'male' as const,
      tenGods: [],
    };
  }
}

// 신살중심 해석기
class ShenshaInterpreter extends BaseSchoolInterpreter {
  readonly schoolCode: SchoolCode = 'shensha';
  readonly schoolName = '신살중심';

  determineYongSin(pillars: SajuPillars, method: 'strength' | 'seasonal' | 'mediation' | 'disease'): string {
    const sajuData = this.createSimpleSajuData(pillars);
    const result = YongSinSelector.select(sajuData, method);
    return result.primaryYongSin;
  }

  interpretHealth(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `신살의 영향을 고려하여 ${yongSin} 기운으로 건강을 보호하세요.`;
  }

  interpretWealth(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `재성 관련 신살과 ${yongSin} 오행의 조화로 재물 운이 형성됩니다.`;
  }

  interpretCareer(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `귀인살과 ${yongSin} 오행이 만나는 분야에서 귀인의 도움을 받을 수 있습니다.`;
  }

  interpretRelationship(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `도화살과 원진살 등을 고려하여 ${yongSin} 기운과 조화로운 관계가 유리합니다.`;
  }

  interpretFame(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `문창귀인과 학당귀인이 ${yongSin} 분야에서 명예를 가져다 줍니다.`;
  }

  private createSimpleSajuData(pillars: SajuPillars): import('../../types/index.js').SajuData {
    return {
      year: pillars.year,
      month: pillars.month,
      day: pillars.day,
      hour: pillars.hour,
      wuxingCount: { 목: 2, 화: 2, 토: 2, 금: 2, 수: 2 },
      dayMasterStrength: { level: 'medium', score: 50, analysis: '' },
      birthDate: '1990-01-01',
      birthTime: '00:00',
      calendar: 'solar' as const,
      isLeapMonth: false,
      gender: 'male' as const,
      tenGods: [],
    };
  }
}

/**
 * 유파별 해석기 레지스트리
 */
export const SCHOOL_INTERPRETERS: Record<SchoolCode, SchoolInterpreter> = {
  ziping: new ZipingInterpreter(),
  dts: new DtsInterpreter(),
  qtbj: new QtbjInterpreter(),
  modern: new ModernInterpreter(),
  shensha: new ShenshaInterpreter(),
};

/**
 * 유파 해석기 가져오기
 */
export function getSchoolInterpreter(school: SchoolCode): SchoolInterpreter {
  const interpreter = SCHOOL_INTERPRETERS[school];
  if (!interpreter) {
    throw new Error(`Unknown school: ${school}`);
  }
  return interpreter;
}

export * from './ziping_interpreter.js';
export * from './modern_interpreter.js';
