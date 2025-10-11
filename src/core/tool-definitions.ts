/**
 * MCP 도구 정의 - 최적화 버전
 * 로컬 테이블 기반 (KASI API 제거)
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'analyze_saju',
    description: '사주 분석 통합 (basic/fortune/yongsin/school_compare/yongsin_method)',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string', description: 'YYYY-MM-DD' },
        birthTime: { type: 'string', description: 'HH:mm' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        analysisType: {
          type: 'string',
          enum: ['basic', 'fortune', 'yongsin', 'school_compare', 'yongsin_method'],
          description: 'basic:사주계산 | fortune:운세 | yongsin:용신 | school_compare:유파비교 | yongsin_method:용신방법론',
        },
        fortuneType: {
          type: 'string',
          enum: ['general', 'career', 'wealth', 'health', 'love'],
          description: 'fortune용 (general/career/wealth/health/love)',
        },
        schools: {
          type: 'array',
          items: { type: 'string', enum: ['ziping', 'dts', 'qtbj', 'modern', 'shensha'] },
          description: 'school_compare용',
        },
        method: {
          type: 'string',
          enum: ['strength', 'seasonal', 'mediation', 'disease'],
          description: 'yongsin_method용 (strength/seasonal/mediation/disease)',
        },
      },
      required: ['birthDate', 'birthTime', 'gender', 'analysisType'],
    },
  },
  {
    name: 'check_compatibility',
    description: '두 사람 궁합 분석',
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
    description: '양력↔음력 변환',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'YYYY-MM-DD' },
        fromCalendar: { type: 'string', enum: ['solar', 'lunar'] },
        toCalendar: { type: 'string', enum: ['solar', 'lunar'] },
        isLeapMonth: { type: 'boolean', default: false },
      },
      required: ['date', 'fromCalendar', 'toCalendar'],
    },
  },
  {
    name: 'get_daily_fortune',
    description: '일일 운세',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        targetDate: { type: 'string', description: 'YYYY-MM-DD' },
      },
      required: ['birthDate', 'birthTime', 'gender', 'targetDate'],
    },
  },
  {
    name: 'get_dae_un',
    description: '10년 대운',
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
    name: 'get_fortune_by_period',
    description: '시간대별 운세 (year/month/hour/multi-year)',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        periodType: {
          type: 'string',
          enum: ['year', 'month', 'hour', 'multi-year'],
          description: 'year:YYYY | month:YYYY-MM | hour:YYYY-MM-DD HH:mm | multi-year:연속',
        },
        target: { type: 'string', description: '기간 (periodType에 맞는 형식)' },
        count: { type: 'number', default: 5, description: 'multi-year용' },
      },
      required: ['birthDate', 'birthTime', 'gender', 'periodType'],
    },
  },
  {
    name: 'manage_settings',
    description: '해석 설정 관리 (get/set)',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['get', 'set'] },
        preset: { type: 'string', enum: ['ziping', 'dts', 'qtbj', 'modern', 'shensha', 'balanced'] },
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
      required: ['action'],
    },
  },
];
