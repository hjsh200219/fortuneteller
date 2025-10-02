/**
 * InterpretationSettings 단위 테스트
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { InterpretationSettings, SettingsValidationError } from '../src/lib/interpretation_settings.js';
import type { UserInterpretationSettings } from '../src/types/interpretation.js';

describe('InterpretationSettings', () => {
  let settings: InterpretationSettings;

  beforeEach(() => {
    settings = InterpretationSettings.getInstance();
    settings.reset(); // 각 테스트 전 초기화
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = InterpretationSettings.getInstance();
      const instance2 = InterpretationSettings.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Preset Loading', () => {
    it('should load traditional preset', () => {
      settings.loadPreset('traditional');
      const current = settings.getSettings();

      expect(current.school).toBe('ziping');
      expect(current.yongSinMethod).toBe('strength');
      expect(current.priorities.health).toBe(0.9);
      expect(current.eraAdaptation.modernCareer).toBe(false);
    });

    it('should load modern_professional preset', () => {
      settings.loadPreset('modern_professional');
      const current = settings.getSettings();

      expect(current.school).toBe('modern');
      expect(current.yongSinMethod).toBe('disease');
      expect(current.priorities.career).toBe(1.0);
      expect(current.eraAdaptation.techIndustry).toBe(true);
    });

    it('should load health_focused preset', () => {
      settings.loadPreset('health_focused');
      const current = settings.getSettings();

      expect(current.school).toBe('qtbj');
      expect(current.yongSinMethod).toBe('seasonal');
      expect(current.priorities.health).toBe(1.0);
    });

    it('should throw error for unknown preset', () => {
      expect(() => settings.loadPreset('unknown')).toThrow(SettingsValidationError);
    });
  });

  describe('Custom Settings', () => {
    it('should merge partial custom settings', () => {
      settings.loadPreset('traditional');
      settings.loadCustom({
        yongSinMethod: 'seasonal',
        priorities: {
          wealth: 0.9,
          health: 0.9,
          career: 0.8,
          relationship: 0.7,
          fame: 0.6,
        },
      });

      const current = settings.getSettings();
      expect(current.school).toBe('ziping'); // 기존 유지
      expect(current.yongSinMethod).toBe('seasonal'); // 변경됨
      expect(current.priorities.wealth).toBe(0.9); // 변경됨
      expect(current.priorities.health).toBe(0.9); // 기존 유지
    });

    it('should validate custom settings', () => {
      expect(() => {
        settings.loadCustom({
          school: 'invalid' as any,
        });
      }).toThrow(SettingsValidationError);
    });
  });

  describe('Validation', () => {
    it('should validate valid settings', () => {
      const validSettings: UserInterpretationSettings = {
        school: 'ziping',
        yongSinMethod: 'strength',
        priorities: {
          health: 0.8,
          wealth: 0.6,
          career: 0.7,
          relationship: 0.7,
          fame: 0.8,
        },
        eraAdaptation: {
          modernCareer: true,
          globalContext: false,
          techIndustry: false,
        },
        fortuneWeights: {
          daeun: 0.7,
          seyun: 0.3,
        },
      };

      expect(settings.validate(validSettings)).toBe(true);
    });

    it('should reject invalid school', () => {
      const invalidSettings = {
        school: 'invalid',
      } as any;

      expect(() => settings.validate(invalidSettings)).toThrow(SettingsValidationError);
    });

    it('should reject invalid priority range', () => {
      settings.loadPreset('traditional');
      expect(() => {
        settings.loadCustom({
          priorities: {
            health: 1.5, // > 1.0
            wealth: 0.8,
            career: 0.7,
            relationship: 0.6,
            fame: 0.5,
          },
        });
      }).toThrow(SettingsValidationError);

      expect(() => {
        settings.loadCustom({
          priorities: {
            wealth: -0.1, // < 0.0
            health: 0.9,
            career: 0.8,
            relationship: 0.7,
            fame: 0.6,
          },
        });
      }).toThrow(SettingsValidationError);
    });

    it('should reject invalid fortune weights', () => {
      settings.loadPreset('traditional');
      expect(() => {
        settings.loadCustom({
          fortuneWeights: {
            daeun: 1.5,
            seyun: 0.5,
          },
        });
      }).toThrow(SettingsValidationError);
    });
  });

  describe('School Default Weights', () => {
    it('should return ziping default weights', () => {
      const weights = settings.getSchoolDefaultWeights('ziping');
      expect(weights.health).toBe(0.8);
      expect(weights.fame).toBe(0.8);
    });

    it('should return modern default weights', () => {
      const weights = settings.getSchoolDefaultWeights('modern');
      expect(weights.career).toBe(1.0);
      expect(weights.wealth).toBe(0.9);
    });
  });

  describe('Settings Summary', () => {
    it('should generate summary', () => {
      settings.loadPreset('modern_professional');
      const summary = settings.getSummary();

      expect(summary.school).toBe('modern');
      expect(summary.yongSinMethod).toBe('disease');
      expect(summary.topPriority).toBe('career'); // 1.0
      expect(summary.modernAdaptation).toBe(true);
    });

    it('should identify top priority', () => {
      settings.loadPreset('health_focused');
      const summary = settings.getSummary();

      expect(summary.topPriority).toBe('health'); // 1.0
    });
  });

  describe('Reset', () => {
    it('should reset to default preset', () => {
      settings.loadPreset('modern_professional');
      settings.reset();
      const current = settings.getSettings();

      expect(current.school).toBe('ziping'); // traditional 프리셋
      expect(current.yongSinMethod).toBe('strength');
    });
  });
});
