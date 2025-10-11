/**
 * MCP 도구 핸들러
 * MCP Tool Handler
 *
 * PRD Priority 2.1: 관심사 분리 강화
 */

import {
  handleAnalyzeSaju,
  handleManageSettings,
  handleCheckCompatibility,
  handleConvertCalendar,
  handleGetDailyFortune,
  handleGetDaeUn,
  handleGetFortuneByPeriod,
  handleGetApiStatus,
} from '../tools/index.js';

/**
 * 도구 이름에 따라 적절한 핸들러를 호출합니다
 */
export async function handleToolCall(name: string, args: unknown): Promise<string> {
  switch (name) {
    case 'analyze_saju':
      return await handleAnalyzeSaju(args as Parameters<typeof handleAnalyzeSaju>[0]);

    case 'manage_settings':
      return handleManageSettings(args as Parameters<typeof handleManageSettings>[0]);

    case 'check_compatibility':
      return handleCheckCompatibility(args as Parameters<typeof handleCheckCompatibility>[0]);

    case 'convert_calendar':
      return handleConvertCalendar(args as Parameters<typeof handleConvertCalendar>[0]);

    case 'get_daily_fortune':
      return handleGetDailyFortune(args as Parameters<typeof handleGetDailyFortune>[0]);

    case 'get_dae_un':
      return handleGetDaeUn(args as Parameters<typeof handleGetDaeUn>[0]);

    case 'get_fortune_by_period':
      return handleGetFortuneByPeriod(args as Parameters<typeof handleGetFortuneByPeriod>[0]);

    case 'get_api_status':
      return handleGetApiStatus(args as Parameters<typeof handleGetApiStatus>[0]);

    default:
      throw new Error(`알 수 없는 도구: ${name}`);
  }
}
