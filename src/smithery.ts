/**
 * Smithery 배포용 진입점
 * Smithery Deployment Entry Point
 *
 * Smithery SDK를 사용한 stateful 서버 구현
 */

import { createStatefulServer } from '@smithery/sdk';
import type { CreateServerArg } from '@smithery/sdk/server/stateful.js';
import { createMCPServer } from './core/server.js';

/**
 * Smithery가 요구하는 createServer 함수
 * 각 세션마다 새로운 MCP 서버 인스턴스를 생성합니다.
 */
function createServer({ sessionId, config, auth, logger }: CreateServerArg) {
  // 세션별 로깅
  logger.info(`Creating MCP server for session: ${sessionId}`);

  // config와 auth는 향후 사용을 위해 예약
  void config;
  void auth;

  // MCP 서버 인스턴스 생성
  const server = createMCPServer();

  return server;
}

/**
 * Smithery stateful 서버 생성
 * default export로 Express 앱을 반환합니다.
 */
export default createStatefulServer(createServer, {
  logLevel: 'info',
});
