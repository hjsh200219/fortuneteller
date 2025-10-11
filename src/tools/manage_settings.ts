/**
 * manage_settings 통합 도구
 * 설정 조회/변경을 하나로 통합
 */

import { InterpretationSettings } from '../lib/interpretation_settings.js';

export type SettingsAction = 'get' | 'set';

export interface ManageSettingsArgs {
  action: SettingsAction;

  // set용
  preset?: string;
  custom?: {
    ziping?: number;
    dts?: number;
    qtbj?: number;
    modern?: number;
    shensha?: number;
  };
}

export function handleManageSettings(args: ManageSettingsArgs): string {
  const { action, preset } = args;
  const settings = InterpretationSettings.getInstance();

  switch (action) {
    case 'get':
      return JSON.stringify(settings.getSettings());

    case 'set':
      if (preset) {
        settings.loadPreset(preset);
      }
      // custom은 현재 설정 구조와 맞지 않아 프리셋만 지원
      return JSON.stringify(settings.getSettings());

    default:
      throw new Error(`알 수 없는 action: ${action}`);
  }
}
