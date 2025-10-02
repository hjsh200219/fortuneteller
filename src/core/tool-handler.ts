/**
 * MCP 도구 핸들러
 * MCP Tool Handler
 *
 * PRD Priority 2.1: 관심사 분리 강화
 */

import {
  handleCalculateSaju,
  handleAnalyzeFortune,
  handleCheckCompatibility,
  handleConvertCalendar,
  handleGetDailyFortune,
  handleGetDaeUn,
  handleAnalyzeYongSin,
  handleGetYearlyFortune,
  handleGetMonthlyFortune,
  handleGetHourlyFortune,
  handleGetApiStatus,
  handleSetInterpretationSettings,
  handleGetInterpretationSettings,
  handleCompareInterpretationSchools,
  handleAnalyzeWithYongsinMethod,
} from '../tools/index.js';

/**
 * 도구 이름에 따라 적절한 핸들러를 호출합니다
 */
export async function handleToolCall(name: string, args: unknown): Promise<string> {
  switch (name) {
    case 'calculate_saju':
      return handleCalculateSaju(args as Parameters<typeof handleCalculateSaju>[0]);

    case 'analyze_fortune':
      return handleAnalyzeFortune(args as Parameters<typeof handleAnalyzeFortune>[0]);

    case 'check_compatibility':
      return handleCheckCompatibility(args as Parameters<typeof handleCheckCompatibility>[0]);

    case 'convert_calendar':
      return handleConvertCalendar(args as Parameters<typeof handleConvertCalendar>[0]);

    case 'get_daily_fortune':
      return handleGetDailyFortune(args as Parameters<typeof handleGetDailyFortune>[0]);

    case 'get_dae_un':
      return handleGetDaeUn(args as Parameters<typeof handleGetDaeUn>[0]);

    case 'analyze_yong_sin':
      return handleAnalyzeYongSin(args as Parameters<typeof handleAnalyzeYongSin>[0]);

    case 'get_yearly_fortune':
      return handleGetYearlyFortune(args as Parameters<typeof handleGetYearlyFortune>[0]);

    case 'get_monthly_fortune':
      return handleGetMonthlyFortune(args as Parameters<typeof handleGetMonthlyFortune>[0]);

    case 'get_hourly_fortune':
      return handleGetHourlyFortune(args as Parameters<typeof handleGetHourlyFortune>[0]);

    case 'get_api_status':
      return handleGetApiStatus(args as Parameters<typeof handleGetApiStatus>[0]);

    case 'set_interpretation_settings':
      return JSON.stringify(
        await handleSetInterpretationSettings(args as Parameters<typeof handleSetInterpretationSettings>[0]),
        null,
        2
      );

    case 'get_interpretation_settings':
      return JSON.stringify(await handleGetInterpretationSettings(), null, 2);

    case 'compare_interpretation_schools':
      return JSON.stringify(
        await handleCompareInterpretationSchools(args as Parameters<typeof handleCompareInterpretationSchools>[0]),
        null,
        2
      );

    case 'analyze_with_yongsin_method':
      return JSON.stringify(
        await handleAnalyzeWithYongsinMethod(args as Parameters<typeof handleAnalyzeWithYongsinMethod>[0]),
        null,
        2
      );

    default:
      throw new Error(`알 수 없는 도구: ${name}`);
  }
}
