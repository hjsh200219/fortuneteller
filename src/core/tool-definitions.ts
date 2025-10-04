/**
 * MCP 도구 정의
 * MCP Tool Definitions
 *
 * PRD Priority 2.1: 관심사 분리 강화
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * 모든 MCP 도구 정의 배열
 */
export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'calculate_saju',
    description: '생년월일시를 기반으로 사주팔자를 계산합니다',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: {
          type: 'string',
          description: '생년월일 (YYYY-MM-DD 형식)',
        },
        birthTime: {
          type: 'string',
          description: '출생 시간 (HH:mm 형식)',
        },
        calendar: {
          type: 'string',
          enum: ['solar', 'lunar'],
          description: '양력(solar) 또는 음력(lunar)',
          default: 'solar',
        },
        isLeapMonth: {
          type: 'boolean',
          description: '음력 윤달 여부',
          default: false,
        },
        gender: {
          type: 'string',
          enum: ['male', 'female'],
          description: '성별 (male: 남자, female: 여자)',
        },
      },
      required: ['birthDate', 'birthTime', 'gender'],
    },
  },
  {
    name: 'analyze_fortune',
    description: '사주팔자를 기반으로 운세를 분석합니다',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: {
          type: 'string',
          description: '생년월일 (YYYY-MM-DD 형식)',
        },
        birthTime: {
          type: 'string',
          description: '출생 시간 (HH:mm 형식)',
        },
        calendar: {
          type: 'string',
          enum: ['solar', 'lunar'],
          description: '양력(solar) 또는 음력(lunar)',
          default: 'solar',
        },
        isLeapMonth: {
          type: 'boolean',
          description: '음력 윤달 여부',
          default: false,
        },
        gender: {
          type: 'string',
          enum: ['male', 'female'],
          description: '성별',
        },
        fortuneType: {
          type: 'string',
          enum: ['general', 'career', 'wealth', 'health', 'love'],
          description: '운세 유형 (general: 전반, career: 직업, wealth: 재물, health: 건강, love: 애정)',
        },
      },
      required: ['birthDate', 'birthTime', 'gender', 'fortuneType'],
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
          properties: {
            birthDate: { type: 'string' },
            birthTime: { type: 'string' },
            calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
            isLeapMonth: { type: 'boolean', default: false },
            gender: { type: 'string', enum: ['male', 'female'] },
          },
          required: ['birthDate', 'birthTime', 'gender'],
        },
        person2: {
          type: 'object',
          properties: {
            birthDate: { type: 'string' },
            birthTime: { type: 'string' },
            calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
            isLeapMonth: { type: 'boolean', default: false },
            gender: { type: 'string', enum: ['male', 'female'] },
          },
          required: ['birthDate', 'birthTime', 'gender'],
        },
      },
      required: ['person1', 'person2'],
    },
  },
  {
    name: 'convert_calendar',
    description: '양력과 음력을 상호 변환합니다',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: '변환할 날짜 (YYYY-MM-DD 형식)',
        },
        fromCalendar: {
          type: 'string',
          enum: ['solar', 'lunar'],
          description: '변환 전 달력 종류',
        },
        toCalendar: {
          type: 'string',
          enum: ['solar', 'lunar'],
          description: '변환 후 달력 종류',
        },
        isLeapMonth: {
          type: 'boolean',
          description: '음력 윤달 여부 (음력→양력 변환시만 사용)',
          default: false,
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
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        targetDate: {
          type: 'string',
          description: '운세를 확인할 날짜 (YYYY-MM-DD)',
        },
      },
      required: ['birthDate', 'birthTime', 'gender', 'targetDate'],
    },
  },
  {
    name: 'get_dae_un',
    description: '10년 단위 대운을 계산합니다',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
      },
      required: ['birthDate', 'birthTime', 'gender'],
    },
  },
  {
    name: 'analyze_yong_sin',
    description: '용신을 분석하고 상세한 조언을 제공합니다 (색상, 방향, 직업 등)',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
      },
      required: ['birthDate', 'birthTime', 'gender'],
    },
  },
  {
    name: 'get_yearly_fortune',
    description: '세운(歲運) - 특정 연도의 운세를 제공합니다',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        targetYear: {
          type: 'number',
          description: '운세를 확인할 연도 (예: 2025)',
        },
      },
      required: ['birthDate', 'birthTime', 'gender', 'targetYear'],
    },
  },
  {
    name: 'get_monthly_fortune',
    description: '월운(月運) - 특정 월의 운세를 제공합니다',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        targetMonth: {
          type: 'string',
          description: '운세를 확인할 월 (YYYY-MM)',
        },
      },
      required: ['birthDate', 'birthTime', 'gender', 'targetMonth'],
    },
  },
  {
    name: 'get_hourly_fortune',
    description: '시운(時運) - 특정 시간대의 운세를 제공합니다',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        targetDateTime: {
          type: 'string',
          description: '운세를 확인할 일시 (YYYY-MM-DD HH:mm)',
        },
      },
      required: ['birthDate', 'birthTime', 'gender', 'targetDateTime'],
    },
  },
  {
    name: 'get_api_status',
    description: 'KASI API 상태 및 캐시 통계를 조회합니다',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'set_interpretation_settings',
    description: '해석 설정을 변경합니다 (프리셋 또는 커스텀)',
    inputSchema: {
      type: 'object',
      properties: {
        preset: {
          type: 'string',
          enum: ['ziping', 'dts', 'qtbj', 'modern', 'shensha', 'balanced'],
          description: '프리셋 선택',
        },
        custom: {
          type: 'object',
          properties: {
            ziping: { type: 'number', minimum: 0, maximum: 1 },
            dts: { type: 'number', minimum: 0, maximum: 1 },
            qtbj: { type: 'number', minimum: 0, maximum: 1 },
            modern: { type: 'number', minimum: 0, maximum: 1 },
            shensha: { type: 'number', minimum: 0, maximum: 1 },
          },
        },
      },
    },
  },
  {
    name: 'get_interpretation_settings',
    description: '현재 해석 설정을 조회합니다',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'compare_interpretation_schools',
    description: '여러 유파에서 사주를 해석하고 비교 분석합니다',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        schools: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['ziping', 'dts', 'qtbj', 'modern', 'shensha'],
          },
          description: '비교할 유파 목록 (미지정시 전체)',
        },
      },
      required: ['birthDate', 'birthTime', 'gender'],
    },
  },
  {
    name: 'analyze_with_yongsin_method',
    description: '특정 용신 방법론으로 사주를 분석합니다',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        method: {
          type: 'string',
          enum: ['strength', 'seasonal', 'mediation', 'disease'],
          description: '용신 선정 방법 (strength: 강약용신, seasonal: 조후용신, mediation: 통관용신, disease: 병약용신)',
        },
      },
      required: ['birthDate', 'birthTime', 'gender', 'method'],
    },
  },
];
