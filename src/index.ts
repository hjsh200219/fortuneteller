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
import { handleGetDaeUn } from './tools/get_dae_un.js';
import { handleAnalyzeYongSin } from './tools/analyze_yong_sin.js';
import { handleGetYearlyFortune } from './tools/get_yearly_fortune.js';
import { handleGetMonthlyFortune } from './tools/get_monthly_fortune.js';
import { handleGetHourlyFortune } from './tools/get_hourly_fortune.js';
import { handleGetAPIStatus } from './tools/get_api_status.js';

// 해석 유파 관련 도구들
import { setInterpretationSettings } from './tools/set_interpretation_settings.js';
import { compareInterpretationSchools } from './tools/compare_interpretation_schools.js';
import { getInterpretationSettings } from './tools/get_interpretation_settings.js';
import { analyzeWithYongSinMethod } from './tools/analyze_with_yongsin_method.js';

/**
 * MCP 서버 생성 및 설정
 */
const server = new Server(
  {
    name: 'saju-mcp',
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
      {
        name: 'get_dae_un',
        description: '대운(大運) 정보를 조회합니다. 10년 단위의 큰 흐름 운세를 제공합니다.',
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
              description: '달력 종류 (solar: 양력, lunar: 음력)',
            },
            isLeapMonth: {
              type: 'boolean',
              description: '윤달 여부 (음력인 경우)',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: '성별 (대운 순행/역행 결정에 필요)',
            },
            age: {
              type: 'number',
              description: '특정 나이의 대운 조회 (옵션)',
            },
            limit: {
              type: 'number',
              description: '조회할 대운 개수 (기본 10개)',
            },
          },
          required: ['birthDate', 'birthTime', 'calendar', 'isLeapMonth', 'gender'],
        },
      },
      {
        name: 'analyze_yong_sin',
        description: '용신(用神) 상세 분석 및 조언을 제공합니다. 색상, 방향, 직업, 활동 등을 추천합니다.',
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
              description: '달력 종류 (solar: 양력, lunar: 음력)',
            },
            isLeapMonth: {
              type: 'boolean',
              description: '윤달 여부 (음력인 경우)',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: '성별',
            },
          },
          required: ['birthDate', 'birthTime', 'calendar', 'isLeapMonth', 'gender'],
        },
      },
      {
        name: 'get_yearly_fortune',
        description: '세운(歲運) 연별 운세를 조회합니다. 매년의 전반적인 운세와 직업, 재물, 건강, 인간관계 등을 분석합니다.',
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
              description: '달력 종류 (solar: 양력, lunar: 음력)',
            },
            isLeapMonth: {
              type: 'boolean',
              description: '윤달 여부 (음력인 경우)',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: '성별',
            },
            targetYear: {
              type: 'number',
              description: '특정 연도 조회 (선택)',
            },
            years: {
              type: 'number',
              description: '조회할 연수 (기본 5년)',
            },
          },
          required: ['birthDate', 'birthTime', 'calendar', 'isLeapMonth', 'gender'],
        },
      },
      {
        name: 'get_monthly_fortune',
        description: '월운(月運) 월별 운세를 조회합니다. 매달의 업무, 금전, 건강, 연애 운세를 분석하고 길일과 주의일을 제공합니다.',
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
              description: '달력 종류 (solar: 양력, lunar: 음력)',
            },
            isLeapMonth: {
              type: 'boolean',
              description: '윤달 여부 (음력인 경우)',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: '성별',
            },
            targetYear: {
              type: 'number',
              description: '특정 연도 (선택)',
            },
            targetMonth: {
              type: 'number',
              description: '특정 월 (1-12, 선택)',
            },
            months: {
              type: 'number',
              description: '조회할 개월수 (기본 12개월)',
            },
          },
          required: ['birthDate', 'birthTime', 'calendar', 'isLeapMonth', 'gender'],
        },
      },
      {
        name: 'get_hourly_fortune',
        description: '시운(時運) 시간대별 운세를 조회합니다. 12시진(2시간 단위)의 활동 적합도와 추천 활동을 제공합니다.',
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
              description: '달력 종류 (solar: 양력, lunar: 음력)',
            },
            isLeapMonth: {
              type: 'boolean',
              description: '윤달 여부 (음력인 경우)',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: '성별',
            },
            targetDate: {
              type: 'string',
              description: '특정 날짜 (YYYY-MM-DD, 선택)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            },
            targetHour: {
              type: 'number',
              description: '특정 시각 (0-23, 선택)',
            },
            allHours: {
              type: 'boolean',
              description: '하루 전체 12시진 조회 (선택)',
            },
          },
          required: ['birthDate', 'birthTime', 'calendar', 'isLeapMonth', 'gender'],
        },
      },
      {
        name: 'get_api_status',
        description: 'KASI API 상태, Circuit Breaker, 캐시 통계를 조회합니다. API 장애 대응 시스템의 현재 상태를 확인할 수 있습니다.',
        inputSchema: {
          type: 'object',
          properties: {
            detailed: {
              type: 'boolean',
              description: '상세 정보 포함 여부 (기본값: false)',
            },
          },
        },
      },
      {
        name: 'set_interpretation_settings',
        description: '사주 해석 설정을 변경합니다. 프리셋 또는 사용자 정의 설정을 적용할 수 있습니다.',
        inputSchema: {
          type: 'object',
          properties: {
            preset: {
              type: 'string',
              enum: ['traditional', 'modern_professional', 'health_focused', 'career_focused'],
              description: '프리셋 선택',
            },
            customSettings: {
              type: 'object',
              description: '사용자 정의 설정 (부분 업데이트 가능)',
            },
          },
        },
      },
      {
        name: 'get_interpretation_settings',
        description: '현재 적용된 사주 해석 설정을 조회합니다.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'compare_interpretation_schools',
        description: '여러 유파(자평명리, 적천수, 궁통보감, 현대명리, 신살중심)의 해석을 비교합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            year: {
              type: 'number',
              description: '출생 연도',
            },
            month: {
              type: 'number',
              description: '출생 월',
            },
            day: {
              type: 'number',
              description: '출생 일',
            },
            hour: {
              type: 'number',
              description: '출생 시',
            },
            minute: {
              type: 'number',
              description: '출생 분',
            },
            calendar: {
              type: 'string',
              enum: ['solar', 'lunar'],
              description: '양력/음력',
            },
            isLeapMonth: {
              type: 'boolean',
              description: '윤달 여부',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: '성별',
            },
            schools: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['ziping', 'dts', 'qtbj', 'modern', 'shensha'],
              },
              description: '비교할 유파 목록 (기본: 전체)',
            },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'gender'],
        },
      },
      {
        name: 'analyze_with_yongsin_method',
        description: '특정 용신 방법론(강약용신, 조후용신, 통관용신, 병약용신)으로 사주를 분석하고 직업을 추천합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            year: {
              type: 'number',
              description: '출생 연도',
            },
            month: {
              type: 'number',
              description: '출생 월',
            },
            day: {
              type: 'number',
              description: '출생 일',
            },
            hour: {
              type: 'number',
              description: '출생 시',
            },
            minute: {
              type: 'number',
              description: '출생 분',
            },
            calendar: {
              type: 'string',
              enum: ['solar', 'lunar'],
              description: '양력/음력',
            },
            isLeapMonth: {
              type: 'boolean',
              description: '윤달 여부',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: '성별',
            },
            yongSinMethod: {
              type: 'string',
              enum: ['strength', 'seasonal', 'mediation', 'disease'],
              description: '용신 방법론',
            },
            includeCareerRecommendation: {
              type: 'boolean',
              description: '직업 추천 포함 여부',
            },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'gender', 'yongSinMethod'],
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
        const result = await handleConvertCalendar(args as any);
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

      case 'get_dae_un': {
        const result = handleGetDaeUn(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'analyze_yong_sin': {
        const result = handleAnalyzeYongSin(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'get_yearly_fortune': {
        const result = handleGetYearlyFortune(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'get_monthly_fortune': {
        const result = handleGetMonthlyFortune(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'get_hourly_fortune': {
        const result = handleGetHourlyFortune(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'get_api_status': {
        const result = handleGetAPIStatus(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'set_interpretation_settings': {
        const result = await setInterpretationSettings(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_interpretation_settings': {
        const result = await getInterpretationSettings();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'compare_interpretation_schools': {
        const result = await compareInterpretationSchools(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'analyze_with_yongsin_method': {
        const result = await analyzeWithYongSinMethod(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
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

