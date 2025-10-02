/**
 * get_interpretation_settings MCP Tool
 * 현재 해석 설정 조회 도구
 */

import { InterpretationSettings } from '../lib/interpretation_settings.js';
import type { UserInterpretationSettings } from '../types/interpretation.js';

export interface GetInterpretationSettingsResult {
  success: boolean;
  settings?: UserInterpretationSettings;
  message: string;
}

/**
 * 현재 해석 설정 조회
 */
export async function getInterpretationSettings(): Promise<GetInterpretationSettingsResult> {
  try {
    const settingsManager = InterpretationSettings.getInstance();
    const currentSettings = settingsManager.getSettings();

    return {
      success: true,
      settings: currentSettings,
      message: '현재 해석 설정을 성공적으로 조회했습니다.',
    };
  } catch (error) {
    return {
      success: false,
      message: `설정 조회 실패: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
