/**
 * 달력 변환 테스트
 */

import { describe, it, expect } from '@jest/globals';
import { convertCalendarSync } from '../src/lib/calendar.js';

describe('달력 변환', () => {
  describe('양력 → 음력 변환', () => {
    it('기본 양력 날짜 변환', () => {
      const result = convertCalendarSync('2024-06-15', 'solar', 'lunar');
      expect(result).toBeDefined();
      expect(result.originalCalendar).toBe('solar');
      expect(result.convertedCalendar).toBe('lunar');
      expect(result.convertedDate).toBeDefined();
    });
  });

  describe('경계 케이스', () => {
    it('1900년 초기 날짜', () => {
      const result = convertCalendarSync('1900-02-01', 'solar', 'lunar');
      expect(result).toBeDefined();
      expect(result.convertedDate).toBeDefined();
    });

    it('2200년 후기 날짜', () => {
      const result = convertCalendarSync('2200-06-15', 'solar', 'lunar');
      expect(result).toBeDefined();
      expect(result.convertedDate).toBeDefined();
    });
  });

  describe('음력 → 양력 변환', () => {
    it('음력 날짜 변환', () => {
      const result = convertCalendarSync('2024-05-15', 'lunar', 'solar');
      expect(result).toBeDefined();
      expect(result.originalCalendar).toBe('lunar');
      expect(result.convertedCalendar).toBe('solar');
    });
  });
});
