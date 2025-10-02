/**
 * 유파별 해석기 인터페이스
 * School Interpreter Interface
 */

import type { SchoolInterpretation, SchoolCode, UserInterpretationSettings, PrioritySettings } from '../types/interpretation.js';
import type { SajuPillars } from '../types/index.js';

/**
 * 유파별 해석기 인터페이스
 * 모든 해석 유파는 이 인터페이스를 구현해야 함
 */
export interface SchoolInterpreter {
  /**
   * 유파 코드
   */
  readonly schoolCode: SchoolCode;

  /**
   * 유파 이름 (한글)
   */
  readonly schoolName: string;

  /**
   * 사주 해석 수행
   * @param pillars 사주 기둥
   * @param settings 사용자 설정
   * @returns 해석 결과
   */
  interpret(pillars: SajuPillars, settings: UserInterpretationSettings): Promise<SchoolInterpretation>;

  /**
   * 용신 결정
   * @param pillars 사주 기둥
   * @param method 용신 선택 방법
   * @returns 용신 오행
   */
  determineYongSin(pillars: SajuPillars, method: UserInterpretationSettings['yongSinMethod']): string;

  /**
   * 격국 판단 (해당되는 유파만)
   * @param pillars 사주 기둥
   * @returns 격국 이름 또는 undefined
   */
  determineGeokGuk?(pillars: SajuPillars): string | undefined;

  /**
   * 건강 해석
   * @param pillars 사주 기둥
   * @param yongSin 용신
   * @param settings 사용자 설정
   * @returns 건강 해석 텍스트
   */
  interpretHealth(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;

  /**
   * 재물 해석
   * @param pillars 사주 기둥
   * @param yongSin 용신
   * @param settings 사용자 설정
   * @returns 재물 해석 텍스트
   */
  interpretWealth(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;

  /**
   * 직업 해석
   * @param pillars 사주 기둥
   * @param yongSin 용신
   * @param settings 사용자 설정
   * @returns 직업 해석 텍스트
   */
  interpretCareer(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;

  /**
   * 인간관계 해석
   * @param pillars 사주 기둥
   * @param yongSin 용신
   * @param settings 사용자 설정
   * @returns 인간관계 해석 텍스트
   */
  interpretRelationship(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;

  /**
   * 명예 해석
   * @param pillars 사주 기둥
   * @param yongSin 용신
   * @param settings 사용자 설정
   * @returns 명예 해석 텍스트
   */
  interpretFame(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;

  /**
   * 신뢰도 계산
   * @param pillars 사주 기둥
   * @param settings 사용자 설정
   * @returns 0.0 ~ 1.0 사이의 신뢰도 점수
   */
  calculateConfidence(pillars: SajuPillars, settings: UserInterpretationSettings): number;
}

/**
 * 기본 해석기 추상 클래스
 * 공통 로직 구현
 */
export abstract class BaseSchoolInterpreter implements SchoolInterpreter {
  abstract readonly schoolCode: SchoolCode;
  abstract readonly schoolName: string;

  /**
   * 격국 판단 (선택적, 하위 클래스에서 구현)
   */
  determineGeokGuk?(pillars: SajuPillars): string | undefined;

  /**
   * 사주 해석 수행 (템플릿 메서드)
   */
  async interpret(pillars: SajuPillars, settings: UserInterpretationSettings): Promise<SchoolInterpretation> {
    // 용신 결정
    const yongSin = this.determineYongSin(pillars, settings.yongSinMethod);

    // 격국 판단 (선택적)
    const geokGuk = this.determineGeokGuk?.(pillars);

    // 각 영역별 해석
    const health = this.interpretHealth(pillars, yongSin, settings);
    const wealth = this.interpretWealth(pillars, yongSin, settings);
    const career = this.interpretCareer(pillars, yongSin, settings);
    const relationship = this.interpretRelationship(pillars, yongSin, settings);
    const fame = this.interpretFame(pillars, yongSin, settings);

    // 종합 해석 생성
    const overall = this.generateOverall(pillars, yongSin, geokGuk, settings);

    // 대운/세운 해석
    const daeunAnalysis = this.interpretDaeun(pillars, yongSin, settings);
    const seyunAnalysis = this.interpretSeyun(pillars, yongSin, settings);

    // 신뢰도 계산
    const confidence = this.calculateConfidence(pillars, settings);

    return {
      school: this.schoolCode,
      schoolName: this.schoolName,
      yongSin,
      geokGuk,
      overall,
      health,
      wealth,
      career,
      relationship,
      fame,
      daeunAnalysis,
      seyunAnalysis,
      confidence,
    };
  }

  abstract determineYongSin(pillars: SajuPillars, method: UserInterpretationSettings['yongSinMethod']): string;
  abstract interpretHealth(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;
  abstract interpretWealth(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;
  abstract interpretCareer(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;
  abstract interpretRelationship(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;
  abstract interpretFame(pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string;

  /**
   * 종합 해석 생성
   */
  protected generateOverall(
    _pillars: SajuPillars,
    yongSin: string,
    geokGuk: string | undefined,
    settings: UserInterpretationSettings
  ): string {
    let overall = `용신은 ${yongSin}입니다.`;

    if (geokGuk) {
      overall += ` 격국은 ${geokGuk}입니다.`;
    }

    // 우선순위가 가장 높은 영역 언급
    const topPriority = this.getTopPriority(settings.priorities);
    overall += ` 특히 ${this.getPriorityLabel(topPriority)} 영역에 주목할 필요가 있습니다.`;

    return overall;
  }

  /**
   * 대운 해석
   */
  protected interpretDaeun(_pillars: SajuPillars, _yongSin: string, _settings: UserInterpretationSettings): string {
    return '대운 해석은 추후 구현 예정입니다.';
  }

  /**
   * 세운 해석
   */
  protected interpretSeyun(_pillars: SajuPillars, _yongSin: string, _settings: UserInterpretationSettings): string {
    return '세운 해석은 추후 구현 예정입니다.';
  }

  /**
   * 신뢰도 계산 (기본 구현)
   */
  calculateConfidence(_pillars: SajuPillars, _settings: UserInterpretationSettings): number {
    // 기본값: 0.7 (중간 신뢰도)
    // 각 유파에서 override 가능
    return 0.7;
  }

  /**
   * 최우선 영역 찾기
   */
  protected getTopPriority(priorities: PrioritySettings): keyof PrioritySettings {
    return Object.entries(priorities).reduce((max, [key, value]) =>
      value > max.value ? { key: key as keyof PrioritySettings, value } : max,
      { key: 'health' as keyof PrioritySettings, value: 0 }
    ).key;
  }

  /**
   * 우선순위 레이블 가져오기
   */
  protected getPriorityLabel(priority: 'health' | 'wealth' | 'career' | 'relationship' | 'fame'): string {
    const labels = {
      health: '건강',
      wealth: '재물',
      career: '직업',
      relationship: '인간관계',
      fame: '명예',
    };
    return labels[priority];
  }
}
