#!/usr/bin/env node

/**
 * 사주 운세 MCP 서버
 * 한국 전통 사주팔자를 기반으로 운세를 분석하는 MCP 서버
 *
 * PRD Priority 2.1: 관심사 분리 강화 - 모듈화된 구조
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './core/server.js';

/**
 * 서버 시작
 */
async function main() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // 에러 처리
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('서버 시작 실패:', error);
  process.exit(1);
});
