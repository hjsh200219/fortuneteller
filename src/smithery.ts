/**
 * Smithery 배포용 진입점
 * Smithery Deployment Entry Point
 *
 * Smithery가 요구하는 함수 형식으로 export
 */

import { createMCPServer } from './core/server.js';

/**
 * Smithery stateless 서버
 * @param config Smithery 설정 (현재 미사용)
 * @returns MCP Server 인스턴스
 */
export default function ({ config }: { config?: unknown }) {
  // config는 향후 사용을 위해 예약
  void config;

  const server = createMCPServer();

  return server;
}
