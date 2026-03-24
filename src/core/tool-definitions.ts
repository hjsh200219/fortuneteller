/**
 * MCP 도구 정의 - 지연 로딩 버전
 * 로컬 테이블 기반 (KASI API 제거)
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * 도구 스키마 팩토리 함수들
 * 각 도구는 필요할 때만 스키마를 생성합니다
 */
const toolSchemaFactories: Record<string, () => Tool> = {
  analyze_saju: () => ({
    name: 'analyze_saju',
    description:
      '사주 분석 통합 (basic/fortune/yongsin/school_compare/yongsin_method). 호출 전 사용자에게 이름(한글)·한자(선택)·양력/음력·생년월일시·윤달(음력 시)·성별·태어난 시군구를 확인할 것. 대화형 상세 해석 문장은 저장소 CLAUDE.md 「명리 해석 프롬프트」 절의 6항목 구조를 따른다.',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string', description: 'YYYY-MM-DD' },
        birthTime: { type: 'string', description: 'HH:mm' },
        birthCity: {
          type: 'string',
          description:
            '출생 시군구(한글, longitude_table 키: 서울·부산·대구·제주 등). 호출 전 사용자에게 확인. 생략 시 서울 경도로 경도 보정',
        },
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
  }),

  check_compatibility: () => ({
    name: 'check_compatibility',
    description:
      '두 사람 궁합 분석. 각 사람마다 이름(한글)·한자(선택)·양력/음력·생년월일시·성별·출생 시군구를 호출 전에 확인할 것.',
    inputSchema: {
      type: 'object',
      properties: {
        person1: {
          type: 'object',
          properties: {
            birthDate: { type: 'string' },
            birthTime: { type: 'string' },
            birthCity: {
              type: 'string',
              description: '출생 시군구(서울·부산 등). 생략 시 서울 경도 보정',
            },
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
            birthCity: {
              type: 'string',
              description: '출생 시군구(서울·부산 등). 생략 시 서울 경도 보정',
            },
            calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
            isLeapMonth: { type: 'boolean', default: false },
            gender: { type: 'string', enum: ['male', 'female'] },
          },
          required: ['birthDate', 'birthTime', 'gender'],
        },
      },
      required: ['person1', 'person2'],
    },
  }),

  convert_calendar: () => ({
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
  }),

  get_daily_fortune: () => ({
    name: 'get_daily_fortune',
    description:
      '일일 운세. 호출 전 사용자에게 이름(한글)·한자(선택)·양력/음력·생년월일시·성별·출생 시군구를 확인할 것.',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        birthCity: {
          type: 'string',
          description: '출생 시군구(서울·부산 등). 생략 시 서울 경도 보정',
        },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        targetDate: { type: 'string', description: 'YYYY-MM-DD' },
      },
      required: ['birthDate', 'birthTime', 'gender', 'targetDate'],
    },
  }),

  get_dae_un: () => ({
    name: 'get_dae_un',
    description:
      '10년 대운 (나이는 만 나이 기준, targetYear는 해당 양력 연도 말일 기준 만 나이로 구간 조회). 호출 전 사용자에게 이름(한글)·한자(선택)·양력/음력·생년월일시·성별·출생 시군구를 확인할 것.',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        birthCity: {
          type: 'string',
          description: '출생 시군구(서울·부산 등). 생략 시 서울 경도 보정',
        },
        calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
        isLeapMonth: { type: 'boolean', default: false },
        gender: { type: 'string', enum: ['male', 'female'] },
        age: { type: 'number', description: '조회할 만 나이(선택). targetYear와 함께 주면 targetYear 우선' },
        targetYear: {
          type: 'number',
          description: '운이 들어오는 양력 연도(선택). 해당 연도 12/31 기준 만 나이로 대운 구간 매칭',
        },
        limit: { type: 'number', default: 10, description: '표시할 대운 개수 상한' },
      },
      required: ['birthDate', 'birthTime', 'gender'],
    },
  }),

  get_fortune_by_period: () => ({
    name: 'get_fortune_by_period',
    description:
      '시간대별 운세 (year/month/hour/multi-year). 호출 전 사용자에게 이름(한글)·한자(선택)·양력/음력·생년월일시·성별·출생 시군구를 확인할 것.',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string' },
        birthTime: { type: 'string' },
        birthCity: {
          type: 'string',
          description: '출생 시군구(서울·부산 등). 생략 시 서울 경도 보정',
        },
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
  }),

  manage_settings: () => ({
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
  }),
};

/**
 * 사용 가능한 도구 이름 목록
 */
export const AVAILABLE_TOOLS = Object.keys(toolSchemaFactories);

/**
 * 특정 도구의 스키마를 로드합니다
 */
export function getToolSchema(toolName: string): Tool | undefined {
  const factory = toolSchemaFactories[toolName];
  return factory ? factory() : undefined;
}

/**
 * 여러 도구의 스키마를 한 번에 로드합니다
 */
export function getToolSchemas(toolNames: string[]): Tool[] {
  return toolNames
    .map((name) => getToolSchema(name))
    .filter((schema): schema is Tool => schema !== undefined);
}

/**
 * 모든 도구 스키마를 로드합니다 (하위 호환성)
 * @deprecated 가능하면 getToolSchemas()를 사용하세요
 */
export function getAllToolDefinitions(): Tool[] {
  return AVAILABLE_TOOLS.map((name) => getToolSchema(name)!);
}

/**
 * 하위 호환성을 위한 전체 도구 정의
 * 지연 로딩을 사용하려면 getToolSchema() 또는 getToolSchemas()를 사용하세요
 */
export const TOOL_DEFINITIONS: Tool[] = getAllToolDefinitions();
