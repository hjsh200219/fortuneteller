/**
 * 해석 설정 관리자
 * Interpretation Settings Manager
 */

import type { UserInterpretationSettings, SchoolCode, YongSinMethod, PrioritySettings } from '../types/interpretation.js';
import { DEFAULT_PRESETS, SCHOOL_WEIGHTS } from '../data/school_presets.js';
import { readFile, writeFile } from 'fs/promises';

/**
 * 설정 유효성 검사 오류
 */
export class SettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsValidationError';
  }
}

/**
 * 해석 설정 싱글톤 관리자
 */
export class InterpretationSettings {
  private static instance: InterpretationSettings;
  private settings: UserInterpretationSettings;

  private constructor() {
    // 기본값: traditional 프리셋
    this.settings = { ...DEFAULT_PRESETS.traditional };
  }

  /**
   * 싱글톤 인스턴스 가져오기
   */
  static getInstance(): InterpretationSettings {
    if (!InterpretationSettings.instance) {
      InterpretationSettings.instance = new InterpretationSettings();
    }
    return InterpretationSettings.instance;
  }

  /**
   * 기본 프리셋 로드
   * @param presetName 프리셋 이름 (traditional, modern_professional, health_focused)
   */
  loadPreset(presetName: string): void {
    if (presetName === 'traditional') {
      this.settings = { ...DEFAULT_PRESETS.traditional };
    } else if (presetName === 'modern_professional') {
      this.settings = { ...DEFAULT_PRESETS.modern_professional };
    } else if (presetName === 'health_focused') {
      this.settings = { ...DEFAULT_PRESETS.health_focused };
    } else {
      throw new SettingsValidationError(
        `Unknown preset: ${presetName}. Available presets: traditional, modern_professional, health_focused`
      );
    }
  }

  /**
   * 커스텀 설정 로드
   * @param customSettings 부분 또는 전체 설정
   */
  loadCustom(customSettings: Partial<UserInterpretationSettings>): void {
    // 기존 설정과 병합
    const merged: UserInterpretationSettings = {
      school: customSettings.school ?? this.settings.school,
      yongSinMethod: customSettings.yongSinMethod ?? this.settings.yongSinMethod,
      priorities: {
        health: customSettings.priorities?.health ?? this.settings.priorities.health,
        wealth: customSettings.priorities?.wealth ?? this.settings.priorities.wealth,
        career: customSettings.priorities?.career ?? this.settings.priorities.career,
        relationship: customSettings.priorities?.relationship ?? this.settings.priorities.relationship,
        fame: customSettings.priorities?.fame ?? this.settings.priorities.fame,
      },
      eraAdaptation: {
        modernCareer: customSettings.eraAdaptation?.modernCareer ?? this.settings.eraAdaptation.modernCareer,
        globalContext: customSettings.eraAdaptation?.globalContext ?? this.settings.eraAdaptation.globalContext,
        techIndustry: customSettings.eraAdaptation?.techIndustry ?? this.settings.eraAdaptation.techIndustry,
      },
      fortuneWeights: {
        daeun: customSettings.fortuneWeights?.daeun ?? this.settings.fortuneWeights.daeun,
        seyun: customSettings.fortuneWeights?.seyun ?? this.settings.fortuneWeights.seyun,
      },
    };

    // 유효성 검사
    if (!this.validate(merged)) {
      throw new SettingsValidationError('Invalid settings provided');
    }

    this.settings = merged;
  }

  /**
   * 현재 설정 가져오기
   */
  getSettings(): UserInterpretationSettings {
    return { ...this.settings };
  }

  /**
   * 유파별 기본 가중치 가져오기
   * @param school 유파 코드
   */
  getSchoolDefaultWeights(school: SchoolCode): PrioritySettings {
    const weights = SCHOOL_WEIGHTS[school];
    if (!weights) {
      throw new SettingsValidationError(`Unknown school: ${school}`);
    }
    return { ...weights };
  }

  /**
   * 설정 유효성 검사
   * @param settings 검사할 설정
   */
  validate(settings: UserInterpretationSettings): boolean {
    try {
      // 유파 코드 검사
      const validSchools: SchoolCode[] = ['ziping', 'dts', 'qtbj', 'modern', 'shensha'];
      if (!validSchools.includes(settings.school)) {
        throw new SettingsValidationError(`Invalid school: ${settings.school}`);
      }

      // 용신 방법 검사
      const validMethods: YongSinMethod[] = ['strength', 'seasonal', 'mediation', 'disease'];
      if (!validMethods.includes(settings.yongSinMethod)) {
        throw new SettingsValidationError(`Invalid yongSinMethod: ${settings.yongSinMethod}`);
      }

      // 우선순위 범위 검사 (0.0 ~ 1.0)
      const priorities = settings.priorities;
      for (const [key, value] of Object.entries(priorities)) {
        if (typeof value !== 'number' || value < 0 || value > 1) {
          throw new SettingsValidationError(`Invalid priority value for ${key}: ${value} (must be 0.0 ~ 1.0)`);
        }
      }

      // 대운/세운 가중치 검사 (0.0 ~ 1.0)
      const { daeun, seyun } = settings.fortuneWeights;
      if (typeof daeun !== 'number' || daeun < 0 || daeun > 1) {
        throw new SettingsValidationError(`Invalid daeun weight: ${daeun} (must be 0.0 ~ 1.0)`);
      }
      if (typeof seyun !== 'number' || seyun < 0 || seyun > 1) {
        throw new SettingsValidationError(`Invalid seyun weight: ${seyun} (must be 0.0 ~ 1.0)`);
      }

      // Boolean 검사
      const { modernCareer, globalContext, techIndustry } = settings.eraAdaptation;
      if (typeof modernCareer !== 'boolean' || typeof globalContext !== 'boolean' || typeof techIndustry !== 'boolean') {
        throw new SettingsValidationError('Invalid eraAdaptation settings (must be boolean)');
      }

      return true;
    } catch (error) {
      if (error instanceof SettingsValidationError) {
        throw error;
      }
      throw new SettingsValidationError(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 설정을 JSON 파일로 저장
   * @param path 파일 경로
   */
  async saveToFile(path: string): Promise<void> {
    try {
      const json = JSON.stringify(this.settings);
      await writeFile(path, json, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * JSON 파일에서 설정 로드
   * @param path 파일 경로
   */
  async loadFromFile(path: string): Promise<void> {
    try {
      const json = await readFile(path, 'utf-8');
      const settings = JSON.parse(json) as UserInterpretationSettings;

      if (!this.validate(settings)) {
        throw new SettingsValidationError('Invalid settings in file');
      }

      this.settings = settings;
    } catch (error) {
      if (error instanceof SettingsValidationError) {
        throw error;
      }
      throw new Error(`Failed to load settings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 설정 초기화 (기본 프리셋으로 리셋)
   */
  reset(): void {
    this.settings = { ...DEFAULT_PRESETS.traditional };
  }

  /**
   * 현재 설정 요약 정보
   */
  getSummary(): {
    school: string;
    yongSinMethod: string;
    topPriority: string;
    modernAdaptation: boolean;
  } {
    // 우선순위가 가장 높은 카테고리 찾기
    const priorities = this.settings.priorities;
    const topPriority = Object.entries(priorities).reduce((max, [key, value]) =>
      value > max.value ? { key, value } : max,
      { key: 'health', value: 0 }
    ).key;

    return {
      school: this.settings.school,
      yongSinMethod: this.settings.yongSinMethod,
      topPriority,
      modernAdaptation: this.settings.eraAdaptation.modernCareer ||
                       this.settings.eraAdaptation.globalContext ||
                       this.settings.eraAdaptation.techIndustry,
    };
  }
}
