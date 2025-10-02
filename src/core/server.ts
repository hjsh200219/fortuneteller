/**
 * MCP 서버 핵심 로직
 * Core Server Logic
 *
 * PRD Priority 2.1: 관심사 분리 강화
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type ListToolsRequest,
} from '@modelcontextprotocol/sdk/types.js';

import { TOOL_DEFINITIONS } from './tool-definitions.js';
import { handleToolCall } from './tool-handler.js';

/**
 * MCP 서버 인스턴스 생성
 */
export function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'saju-mcp',
      version: '1.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 도구 목록 핸들러 등록
  server.setRequestHandler(ListToolsRequestSchema, async (_request: ListToolsRequest) => {
    return {
      tools: TOOL_DEFINITIONS,
    };
  });

  // 도구 호출 핸들러 등록
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    try {
      const result = await handleToolCall(request.params.name, request.params.arguments);
      return {
        content: [
          {
            type: 'text' as const,
            text: result,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              error: true,
              message: errorMessage,
            }),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
