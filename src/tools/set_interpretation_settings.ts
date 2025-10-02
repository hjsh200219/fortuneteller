/**
 * set_interpretation_settings MCP Tool
 * 해석 설정 변경 도구
 */

import { InterpretationSettings } from '../lib/interpretation_settings.js';
import type { UserInterpretationSettings } from '../types/interpretation.js';

export interface SetInterpretationSettingsParams {
  /** 프리셋 이름 또는 커스텀 설정 */
  preset?: string;
  /** 커스텀 설정 */
  customSettings?: Partial<UserInterpretationSettings>;
}

export interface SetInterpretationSettingsResult {
  success: boolean;
  currentSettings: UserInterpretationSettings;
  message: string;
}

/**
 * 해석 설정 변경
 */
export async function setInterpretationSettings(
  params: SetInterpretationSettingsParams
): Promise<SetInterpretationSettingsResult> {
  try {
    const settings = InterpretationSettings.getInstance();

    // 프리셋 로드
    if (params.preset) {
      settings.loadPreset(params.preset);
      return {
        success: true,
        currentSettings: settings.getSettings(),
        message: `프리셋 '${params.preset}'을 적용했습니다.`,
      };
    }

    // 커스텀 설정 로드
    if (params.customSettings) {
      settings.loadCustom(params.customSettings);
      return {
        success: true,
        currentSettings: settings.getSettings(),
        message: '커스텀 설정을 적용했습니다.',
      };
    }

    return {
      success: false,
      currentSettings: settings.getSettings(),
      message: '프리셋 이름 또는 커스텀 설정을 제공해주세요.',
    };
  } catch (error) {
    const settings = InterpretationSettings.getInstance();
    return {
      success: false,
      currentSettings: settings.getSettings(),
      message: `설정 변경 실패: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
