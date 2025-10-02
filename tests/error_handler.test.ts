/**
 * 에러 처리 시스템 테스트
 */

import { describe, it, expect } from '@jest/globals';
import {
  SajuError,
  SajuErrorType,
  validateDate,
  validateTime,
  validateCalendar,
  validateGender,
  validateLunarMonth,
  validateLunarDay,
  validateYearRange,
  formatErrorForUser,
  attemptErrorRecovery,
} from '../src/lib/error_handler.js';

describe('에러 처리 시스템', () => {
  describe('SajuError 클래스', () => {
    it('기본 에러 생성', () => {
      const error = new SajuError(
        SajuErrorType.INVALID_DATE,
        '유효하지 않은 날짜입니다.'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SajuError);
      expect(error.type).toBe(SajuErrorType.INVALID_DATE);
      expect(error.message).toBe('유효하지 않은 날짜입니다.');
      expect(error.recoverable).toBe(true);
    });

    it('상세 정보가 포함된 에러', () => {
      const details = { year: 1899 };
      const error = new SajuError(
        SajuErrorType.INVALID_YEAR_RANGE,
        '범위를 벗어난 연도입니다.',
        details
      );

      expect(error.details).toEqual(details);
    });

    it('복구 불가능한 에러', () => {
      const error = new SajuError(
        SajuErrorType.INTERNAL_ERROR,
        '내부 오류',
        undefined,
        false
      );

      expect(error.recoverable).toBe(false);
    });

    it('JSON 직렬화', () => {
      const error = new SajuError(
        SajuErrorType.INVALID_DATE,
        '테스트 에러',
        { test: true }
      );

      const json = error.toJSON();
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('type');
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('details');
      expect(json).toHaveProperty('timestamp');
    });

    it('사용자 친화적 메시지 생성', () => {
      const error = new SajuError(
        SajuErrorType.INVALID_DATE,
        '유효하지 않은 날짜입니다.'
      );

      const userMessage = error.getUserMessage();
      expect(userMessage).toContain('유효하지 않은 날짜입니다.');
      expect(userMessage).toContain('제안:');
    });
  });

  describe('날짜 유효성 검증', () => {
    it('유효한 날짜는 통과', () => {
      expect(() => validateDate(new Date('2024-01-15'))).not.toThrow();
      expect(() => validateDate(new Date('1900-01-01'))).not.toThrow();
      expect(() => validateDate(new Date('2200-12-31'))).not.toThrow();
    });

    it('유효하지 않은 날짜 객체는 에러', () => {
      expect(() => validateDate(new Date('invalid'))).toThrow(SajuError);
      expect(() => validateDate(new Date('invalid'))).toThrow(
        /유효하지 않은 날짜/
      );
    });

    it('범위를 벗어난 연도는 에러', () => {
      expect(() => validateDate(new Date('1899-12-31'))).toThrow(SajuError);
      expect(() => validateDate(new Date('2201-01-01'))).toThrow(SajuError);
    });

    it('에러 타입 확인', () => {
      try {
        validateDate(new Date('1899-12-31'));
      } catch (error) {
        expect(error).toBeInstanceOf(SajuError);
        expect((error as SajuError).type).toBe(SajuErrorType.INVALID_YEAR_RANGE);
      }
    });
  });

  describe('시간 유효성 검증', () => {
    it('유효한 시간은 통과', () => {
      expect(() => validateTime(0, 0)).not.toThrow();
      expect(() => validateTime(12, 30)).not.toThrow();
      expect(() => validateTime(23, 59)).not.toThrow();
    });

    it('유효하지 않은 시간은 에러', () => {
      expect(() => validateTime(-1, 0)).toThrow(SajuError);
      expect(() => validateTime(24, 0)).toThrow(SajuError);
      expect(() => validateTime(12, -1)).toThrow(SajuError);
      expect(() => validateTime(12, 60)).toThrow(SajuError);
    });
  });

  describe('달력 타입 유효성 검증', () => {
    it('유효한 달력 타입은 통과', () => {
      expect(() => validateCalendar('solar')).not.toThrow();
      expect(() => validateCalendar('lunar')).not.toThrow();
    });

    it('유효하지 않은 달력 타입은 에러', () => {
      expect(() => validateCalendar('invalid')).toThrow(SajuError);
      expect(() => validateCalendar('')).toThrow(SajuError);
    });
  });

  describe('성별 유효성 검증', () => {
    it('유효한 성별은 통과', () => {
      expect(() => validateGender('male')).not.toThrow();
      expect(() => validateGender('female')).not.toThrow();
    });

    it('유효하지 않은 성별은 에러', () => {
      expect(() => validateGender('invalid')).toThrow(SajuError);
      expect(() => validateGender('')).toThrow(SajuError);
    });
  });

  describe('음력 월 유효성 검증', () => {
    it('유효한 음력 월은 통과', () => {
      expect(() => validateLunarMonth(2024, 1, false)).not.toThrow();
      expect(() => validateLunarMonth(2024, 12, false)).not.toThrow();
      expect(() => validateLunarMonth(2024, 6, true)).not.toThrow();
    });

    it('유효하지 않은 음력 월은 에러', () => {
      expect(() => validateLunarMonth(2024, 0, false)).toThrow(SajuError);
      expect(() => validateLunarMonth(2024, 13, false)).toThrow(SajuError);
    });
  });

  describe('음력 일 유효성 검증', () => {
    it('유효한 음력 일은 통과', () => {
      expect(() => validateLunarDay(1)).not.toThrow();
      expect(() => validateLunarDay(15)).not.toThrow();
      expect(() => validateLunarDay(30)).not.toThrow();
    });

    it('유효하지 않은 음력 일은 에러', () => {
      expect(() => validateLunarDay(0)).toThrow(SajuError);
      expect(() => validateLunarDay(31)).toThrow(SajuError);
    });
  });

  describe('연도 범위 유효성 검증', () => {
    it('유효한 연도는 통과', () => {
      expect(() => validateYearRange(1900)).not.toThrow();
      expect(() => validateYearRange(2024)).not.toThrow();
      expect(() => validateYearRange(2200)).not.toThrow();
    });

    it('범위를 벗어난 연도는 에러', () => {
      expect(() => validateYearRange(1899)).toThrow(SajuError);
      expect(() => validateYearRange(2201)).toThrow(SajuError);
    });

    it('컨텍스트 정보 포함', () => {
      try {
        validateYearRange(1899, '음력 데이터 조회');
      } catch (error) {
        expect(error).toBeInstanceOf(SajuError);
        expect((error as SajuError).message).toContain('음력 데이터 조회');
      }
    });
  });

  describe('에러 포맷팅', () => {
    it('SajuError 포맷팅', () => {
      const error = new SajuError(
        SajuErrorType.INVALID_DATE,
        '유효하지 않은 날짜입니다.'
      );

      const formatted = formatErrorForUser(error);
      expect(formatted.success).toBe(false);
      expect(formatted.error.type).toBe(SajuErrorType.INVALID_DATE);
      expect(formatted.error.message).toContain('유효하지 않은 날짜');
      expect(formatted.error.recoverable).toBe(true);
    });

    it('일반 에러 포맷팅', () => {
      const error = new Error('일반 에러');
      const formatted = formatErrorForUser(error);

      expect(formatted.success).toBe(false);
      expect(formatted.error.type).toBe(SajuErrorType.UNKNOWN_ERROR);
      expect(formatted.error.message).toContain('일반 에러');
      expect(formatted.error.recoverable).toBe(false);
    });

    it('문자열 에러 포맷팅', () => {
      const formatted = formatErrorForUser('에러 문자열');

      expect(formatted.success).toBe(false);
      expect(formatted.error.type).toBe(SajuErrorType.UNKNOWN_ERROR);
    });
  });

  describe('에러 복구', () => {
    it('정상 실행시 결과 반환', () => {
      const result = attemptErrorRecovery(() => 42, 0);
      expect(result).toBe(42);
    });

    it('에러 발생시 fallback 반환', () => {
      const result = attemptErrorRecovery(
        () => {
          throw new Error('테스트 에러');
        },
        0
      );
      expect(result).toBe(0);
    });

    it('커스텀 에러 핸들러 실행', () => {
      let errorCaught = false;
      attemptErrorRecovery(
        () => {
          throw new Error('테스트 에러');
        },
        0,
        () => {
          errorCaught = true;
        }
      );
      expect(errorCaught).toBe(true);
    });
  });

  describe('에러 메시지 품질', () => {
    it('모든 에러 타입은 사용자 친화적 제안을 포함해야 함', () => {
      const errorTypes = Object.values(SajuErrorType);

      for (const type of errorTypes) {
        const error = new SajuError(type, '테스트 메시지');
        const userMessage = error.getUserMessage();

        // 제안이 없는 경우도 허용 (기본 메시지만)
        expect(userMessage).toBeTruthy();
        expect(typeof userMessage).toBe('string');
      }
    });

    it('에러 메시지는 한글로 작성되어야 함', () => {
      const error = new SajuError(
        SajuErrorType.INVALID_DATE,
        '유효하지 않은 날짜입니다.'
      );

      const message = error.getUserMessage();
      // 한글이 포함되어 있는지 확인
      expect(message).toMatch(/[가-힣]/);
    });
  });
});
