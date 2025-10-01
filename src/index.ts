#!/usr/bin/env node

/**
 * 사주 운세 MCP 서버
 * 한국 전통 사주팔자를 기반으로 운세를 분석하는 MCP 서버
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// 도구 핸들러들 import
import { handleCalculateSaju } from './tools/calculate_saju.js';
import { handleAnalyzeFortune } from './tools/analyze_fortune.js';
import { handleCheckCompatibility } from './tools/check_compatibility.js';
import { handleConvertCalendar } from './tools/convert_calendar.js';
import { handleGetDailyFortune } from './tools/get_daily_fortune.js';

/**
 * MCP 서버 생성 및 설정
 */
const server = new Server(
  {
    name: 'fortuneteller-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 사용 가능한 도구 목록 반환
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'calculate_saju',
        description: '생년월일시로부터 사주팔자를 계산합니다',
        inputSchema: {
          type: 'object',
          properties: {
            birthDate: {
              type: 'string',
              description: '생년월일 (YYYY-MM-DD)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            },
            birthTime: {
              type: 'string',
              description: '출생 시간 (HH:MM)',
              pattern: '^\\d{2}:\\d{2}$',
            },
            calendar: {
              type: 'string',
              enum: ['solar', 'lunar'],
              description: '양력/음력 구분',
            },
            isLeapMonth: {
              type: 'boolean',
              description: '음력 윤달 여부 (음력일 경우만)',
              default: false,
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: '성별',
            },
          },
          required: ['birthDate', 'birthTime', 'calendar', 'gender'],
        },
      },
      {
        name: 'analyze_fortune',
        description: '사주팔자를 기반으로 운세를 분석합니다',
        inputSchema: {
          type: 'object',
          properties: {
            sajuData: {
              type: 'object',
              description: 'calculate_saju로 얻은 사주 데이터',
            },
            analysisType: {
              type: 'string',
              enum: ['general', 'career', 'wealth', 'health', 'love'],
              description: '분석 유형',
              default: 'general',
            },
            targetDate: {
              type: 'string',
              description: '운세를 볼 날짜 (YYYY-MM-DD, 선택사항)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            },
          },
          required: ['sajuData', 'analysisType'],
        },
      },
      {
        name: 'check_compatibility',
        description: '두 사람의 궁합을 분석합니다',
        inputSchema: {
          type: 'object',
          properties: {
            person1: {
              type: 'object',
              description: '첫 번째 사람의 사주 데이터',
            },
            person2: {
              type: 'object',
              description: '두 번째 사람의 사주 데이터',
            },
          },
          required: ['person1', 'person2'],
        },
      },
      {
        name: 'convert_calendar',
        description: '양력과 음력을 변환합니다',
        inputSchema: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: '날짜 (YYYY-MM-DD)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            },
            fromCalendar: {
              type: 'string',
              enum: ['solar', 'lunar'],
              description: '원본 달력',
            },
            toCalendar: {
              type: 'string',
              enum: ['solar', 'lunar'],
              description: '변환할 달력',
            },
          },
          required: ['date', 'fromCalendar', 'toCalendar'],
        },
      },
      {
        name: 'get_daily_fortune',
        description: '특정 날짜의 일일 운세를 제공합니다',
        inputSchema: {
          type: 'object',
          properties: {
            sajuData: {
              type: 'object',
              description: '사용자의 사주 데이터',
            },
            date: {
              type: 'string',
              description: '운세를 볼 날짜 (YYYY-MM-DD)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            },
          },
          required: ['sajuData', 'date'],
        },
      },
    ],
  };
});

/**
 * 도구 실행 핸들러
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'calculate_saju': {
        const result = handleCalculateSaju(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'analyze_fortune': {
        const result = handleAnalyzeFortune(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'check_compatibility': {
        const result = handleCheckCompatibility(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'convert_calendar': {
        const result = handleConvertCalendar(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'get_daily_fortune': {
        const result = handleGetDailyFortune(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: '알 수 없는 도구',
                message: `'${name}' 도구를 찾을 수 없습니다`,
              }),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: '도구 실행 오류',
            message: error instanceof Error ? error.message : '알 수 없는 오류',
          }),
        },
      ],
      isError: true,
    };
  }
});

/**
 * 서버 시작
 */
async function main() {
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

