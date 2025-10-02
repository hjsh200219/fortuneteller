/**
 * 통합 에러 처리 시스템
 *
 * 사주 프로그램의 모든 에러를 표준화하고 명확한 메시지 제공
 */

/**
 * 사주 프로그램 에러 타입
 */
export enum SajuErrorType {
  // 입력 검증 에러
  INVALID_DATE = 'INVALID_DATE',
  INVALID_TIME = 'INVALID_TIME',
  INVALID_CALENDAR = 'INVALID_CALENDAR',
  INVALID_GENDER = 'INVALID_GENDER',
  INVALID_YEAR_RANGE = 'INVALID_YEAR_RANGE',
  INVALID_MONTH = 'INVALID_MONTH',
  INVALID_DAY = 'INVALID_DAY',
  INVALID_LEAP_MONTH = 'INVALID_LEAP_MONTH',

  // 데이터 에러
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  LUNAR_DATA_MISSING = 'LUNAR_DATA_MISSING',
  SOLAR_TERM_MISSING = 'SOLAR_TERM_MISSING',
  JIJANGGAN_DATA_MISSING = 'JIJANGGAN_DATA_MISSING',

  // 계산 에러
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  SAJU_CALCULATION_FAILED = 'SAJU_CALCULATION_FAILED',
  CALENDAR_CONVERSION_FAILED = 'CALENDAR_CONVERSION_FAILED',
  DAE_UN_CALCULATION_FAILED = 'DAE_UN_CALCULATION_FAILED',

  // 시스템 에러
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 사주 프로그램 커스텀 에러 클래스
 */
export class SajuError extends Error {
  public readonly type: SajuErrorType;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly recoverable: boolean;
  public readonly timestamp: Date;

  constructor(
    type: SajuErrorType,
    message: string,
    details?: unknown,
    recoverable: boolean = true
  ) {
    super(message);
    this.name = 'SajuError';
    this.type = type;
    this.code = type;
    this.details = details;
    this.recoverable = recoverable;
    this.timestamp = new Date();

    // 프로토타입 체인 유지
    Object.setPrototypeOf(this, SajuError.prototype);
  }

  /**
   * 에러를 JSON으로 직렬화
   */
  toJSON(): object {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      details: this.details,
      recoverable: this.recoverable,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * 사용자 친화적 메시지 생성
   */
  getUserMessage(): string {
    const baseMessage = this.message;
    const suggestion = this.getSuggestion();
    return suggestion ? `${baseMessage}\n\n제안: ${suggestion}` : baseMessage;
  }

  /**
   * 에러 타입별 해결 제안
   */
  private getSuggestion(): string | null {
    const suggestions: Record<SajuErrorType, string> = {
      [SajuErrorType.INVALID_DATE]: '유효한 날짜 형식(YYYY-MM-DD)을 입력해주세요.',
      [SajuErrorType.INVALID_TIME]: '시간은 00:00부터 23:59 사이여야 합니다.',
      [SajuErrorType.INVALID_CALENDAR]: '달력 타입은 "solar" 또는 "lunar"여야 합니다.',
      [SajuErrorType.INVALID_GENDER]: '성별은 "male" 또는 "female"이어야 합니다.',
      [SajuErrorType.INVALID_YEAR_RANGE]:
        '연도는 1900년부터 2200년 사이여야 합니다. 해당 범위의 데이터만 지원됩니다.',
      [SajuErrorType.INVALID_MONTH]: '월은 1부터 12 사이여야 합니다.',
      [SajuErrorType.INVALID_DAY]: '일은 해당 월의 유효한 날짜여야 합니다.',
      [SajuErrorType.INVALID_LEAP_MONTH]: '해당 연도에는 윤달이 없습니다.',
      [SajuErrorType.DATA_NOT_FOUND]: '요청하신 데이터를 찾을 수 없습니다.',
      [SajuErrorType.LUNAR_DATA_MISSING]:
        '해당 연도의 음력 데이터가 없습니다. 1900-2200년 범위를 확인해주세요.',
      [SajuErrorType.SOLAR_TERM_MISSING]: '해당 날짜의 절기 정보를 찾을 수 없습니다.',
      [SajuErrorType.JIJANGGAN_DATA_MISSING]: '지장간 데이터를 찾을 수 없습니다.',
      [SajuErrorType.CALCULATION_ERROR]: '계산 중 오류가 발생했습니다. 입력값을 확인해주세요.',
      [SajuErrorType.SAJU_CALCULATION_FAILED]: '사주 계산에 실패했습니다.',
      [SajuErrorType.CALENDAR_CONVERSION_FAILED]: '음양력 변환에 실패했습니다.',
      [SajuErrorType.DAE_UN_CALCULATION_FAILED]: '대운 계산에 실패했습니다.',
      [SajuErrorType.INTERNAL_ERROR]: '내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      [SajuErrorType.CACHE_ERROR]: '캐시 처리 중 오류가 발생했습니다.',
      [SajuErrorType.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
    };

    return suggestions[this.type] || null;
  }
}

/**
 * 날짜 유효성 검증
 */
export function validateDate(date: Date): void {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new SajuError(
      SajuErrorType.INVALID_DATE,
      '유효하지 않은 날짜입니다.',
      { date }
    );
  }

  const year = date.getFullYear();
  if (year < 1900 || year > 2200) {
    throw new SajuError(
      SajuErrorType.INVALID_YEAR_RANGE,
      `연도는 1900년부터 2200년 사이여야 합니다. 입력: ${year}년`,
      { year, minYear: 1900, maxYear: 2200 }
    );
  }
}

/**
 * 시간 유효성 검증
 */
export function validateTime(hour: number, minute: number): void {
  if (hour < 0 || hour > 23) {
    throw new SajuError(
      SajuErrorType.INVALID_TIME,
      `시간은 0부터 23 사이여야 합니다. 입력: ${hour}시`,
      { hour, validRange: [0, 23] }
    );
  }

  if (minute < 0 || minute > 59) {
    throw new SajuError(
      SajuErrorType.INVALID_TIME,
      `분은 0부터 59 사이여야 합니다. 입력: ${minute}분`,
      { minute, validRange: [0, 59] }
    );
  }
}

/**
 * 달력 타입 유효성 검증
 */
export function validateCalendar(calendar: string): void {
  const validCalendars = ['solar', 'lunar'];
  if (!validCalendars.includes(calendar)) {
    throw new SajuError(
      SajuErrorType.INVALID_CALENDAR,
      `달력 타입은 "solar" 또는 "lunar"여야 합니다. 입력: "${calendar}"`,
      { calendar, validCalendars }
    );
  }
}

/**
 * 성별 유효성 검증
 */
export function validateGender(gender: string): void {
  const validGenders = ['male', 'female'];
  if (!validGenders.includes(gender)) {
    throw new SajuError(
      SajuErrorType.INVALID_GENDER,
      `성별은 "male" 또는 "female"이어야 합니다. 입력: "${gender}"`,
      { gender, validGenders }
    );
  }
}

/**
 * 음력 월 유효성 검증
 */
export function validateLunarMonth(_year: number, month: number, isLeapMonth: boolean): void {
  if (month < 1 || month > 12) {
    throw new SajuError(
      SajuErrorType.INVALID_MONTH,
      `월은 1부터 12 사이여야 합니다. 입력: ${month}월`,
      { month, validRange: [1, 12] }
    );
  }

  // 윤달 검증은 음력 데이터를 확인해야 하므로 여기서는 형식만 검증
  if (typeof isLeapMonth !== 'boolean') {
    throw new SajuError(
      SajuErrorType.INVALID_LEAP_MONTH,
      '윤달 여부는 true 또는 false여야 합니다.',
      { isLeapMonth }
    );
  }
}

/**
 * 음력 일 유효성 검증
 */
export function validateLunarDay(day: number): void {
  if (day < 1 || day > 30) {
    throw new SajuError(
      SajuErrorType.INVALID_DAY,
      `일은 1부터 30 사이여야 합니다. 입력: ${day}일`,
      { day, validRange: [1, 30] }
    );
  }
}

/**
 * 연도 범위 유효성 검증
 */
export function validateYearRange(year: number, context: string = ''): void {
  if (year < 1900 || year > 2200) {
    const contextMsg = context ? ` (${context})` : '';
    throw new SajuError(
      SajuErrorType.INVALID_YEAR_RANGE,
      `연도는 1900년부터 2200년 사이여야 합니다${contextMsg}. 입력: ${year}년`,
      { year, minYear: 1900, maxYear: 2200, context }
    );
  }
}

/**
 * 에러 로깅 (개발 환경에서만)
 */
export function logError(error: Error | SajuError): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[SajuError]', {
      message: error.message,
      stack: error.stack,
      ...(error instanceof SajuError ? error.toJSON() : {}),
    });
  }
}

/**
 * 에러를 사용자 친화적 형식으로 변환
 */
export function formatErrorForUser(error: unknown): {
  success: false;
  error: {
    type: string;
    message: string;
    code: string;
    recoverable: boolean;
    timestamp: string;
  };
} {
  if (error instanceof SajuError) {
    return {
      success: false,
      error: {
        type: error.type,
        message: error.getUserMessage(),
        code: error.code,
        recoverable: error.recoverable,
        timestamp: error.timestamp.toISOString(),
      },
    };
  }

  // 일반 에러 처리
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    success: false,
    error: {
      type: SajuErrorType.UNKNOWN_ERROR,
      message: `알 수 없는 오류가 발생했습니다: ${errorMessage}`,
      code: SajuErrorType.UNKNOWN_ERROR,
      recoverable: false,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * 에러 복구 시도
 */
export function attemptErrorRecovery<T>(
  fn: () => T,
  fallback: T,
  errorHandler?: (error: unknown) => void
): T {
  try {
    return fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      logError(error as Error);
    }
    return fallback;
  }
}

/**
 * 비동기 에러 복구 시도
 */
export async function attemptAsyncErrorRecovery<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorHandler?: (error: unknown) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      logError(error as Error);
    }
    return fallback;
  }
}
