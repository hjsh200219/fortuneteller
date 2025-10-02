/**
 * 사주 계산 정확성 테스트
 */

import { describe, it, expect } from '@jest/globals';
import { calculateSaju } from '../src/lib/saju.js';

describe('사주 계산', () => {
  describe('기본 사주 계산', () => {
    it('1990-03-15 10:30 남자', () => {
      const result = calculateSaju('1990-03-15', '10:30', 'solar', false, 'male');
      expect(result.year).toBeDefined();
      expect(result.month).toBeDefined();
      expect(result.day).toBeDefined();
      expect(result.hour).toBeDefined();
    });
  });

  describe('확장된 데이터 범위', () => {
    it('1900년 데이터', () => {
      const result = calculateSaju('1900-06-15', '12:00', 'solar', false, 'male');
      expect(result).toBeDefined();
    });

    it('2200년 데이터', () => {
      const result = calculateSaju('2200-06-15', '12:00', 'solar', false, 'male');
      expect(result).toBeDefined();
    });
  });
});
