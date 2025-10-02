/**
 * get_api_status MCP 도구
 * KASI API 상태 조회 및 캐시 통계
 */

import { getStatusReport } from '../lib/kasi_api.js';

export interface GetAPIStatusArgs {
  detailed?: boolean; // 상세 정보 포함 여부
}

export function handleGetAPIStatus(_args: GetAPIStatusArgs = {}): string {
  const report = getStatusReport();

  return JSON.stringify(
    {
      success: true,
      data: {
        report,
        timestamp: new Date().toISOString(),
      },
    },
    null,
    2
  );
}
