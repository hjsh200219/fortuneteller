/**
 * Smithery 배포용 진입점
 * Smithery Deployment Entry Point
 *
 * Smithery는 createServer 함수를 default export로 요구합니다.
 */

import { createMCPServer } from './core/server.js';

/**
 * Smithery가 요구하는 createServer 함수
 * @param config Smithery 설정 (현재 미사용)
 * @returns MCP Server 인스턴스
 */
export default function createServer({ config }: { config?: unknown }) {
  // config는 향후 Smithery 설정을 위해 예약
  void config;

  const server = createMCPServer();

  return server;
}
