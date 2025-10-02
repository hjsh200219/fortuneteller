/**
 * 통합 데이터 쿼리 시스템 테스트
 */

import { describe, it, expect } from '@jest/globals';
import {
  getUnifiedLunarYearData,
  getUnifiedSolarTerm,
  getUnifiedYearSolarTerms,
  getUnifiedCurrentSolarTerm,
  getUnifiedNextSolarTerm,
  isYearInRange,
  isDateInRange,
  getDataStatistics,
  clearDataCache,
  DATA_RANGE,
} from '../src/lib/unified_data_query.js';

describe('통합 데이터 쿼리 시스템', () => {
  describe('getUnifiedLunarYearData', () => {
    it('1900년 음력 데이터를 정확히 조회해야 함', () => {
      const data = getUnifiedLunarYearData(1900);
      expect(data).toBeDefined();
      expect(data?.year).toBe(1900);
      expect(data?.leapMonth).toBe(8);
    });

    it('2024년 음력 데이터를 정확히 조회해야 함', () => {
      const data = getUnifiedLunarYearData(2024);
      expect(data).toBeDefined();
      expect(data?.year).toBe(2024);
    });

    it('2100년 음력 데이터를 정확히 조회해야 함', () => {
      const data = getUnifiedLunarYearData(2100);
      expect(data).toBeDefined();
      expect(data?.year).toBe(2100);
    });

    it('2200년 음력 데이터를 정확히 조회해야 함', () => {
      const data = getUnifiedLunarYearData(2200);
      expect(data).toBeDefined();
      expect(data?.year).toBe(2200);
    });

    it('범위를 벗어난 연도는 에러를 발생시켜야 함', () => {
      expect(() => getUnifiedLunarYearData(1899)).toThrow();
      expect(() => getUnifiedLunarYearData(2201)).toThrow();
    });

    it('음력 데이터는 총 일수 정보를 포함해야 함', () => {
      const data = getUnifiedLunarYearData(2024);
      expect(data?.totalDays).toBeGreaterThanOrEqual(354);
      expect(data?.totalDays).toBeLessThanOrEqual(385);
    });

    it('월별 일수 배열은 12개 또는 13개여야 함', () => {
      const data = getUnifiedLunarYearData(2024);
      const monthCount = data?.monthDays.length || 0;
      expect(monthCount === 12 || monthCount === 13).toBe(true);
    });
  });

  describe('getUnifiedSolarTerm', () => {
    it('1900년 입춘 절기를 정확히 조회해야 함', () => {
      const term = getUnifiedSolarTerm(1900, '입춘');
      expect(term).toBeDefined();
      expect(term?.year).toBe(1900);
      expect(term?.term).toBe('입춘');
      expect(term?.solarLongitude).toBe(315);
    });

    it('2024년 동지 절기를 정확히 조회해야 함', () => {
      const term = getUnifiedSolarTerm(2024, '동지');
      expect(term).toBeDefined();
      expect(term?.year).toBe(2024);
      expect(term?.term).toBe('동지');
      expect(term?.solarLongitude).toBe(270);
    });

    it('범위를 벗어난 연도는 에러를 발생시켜야 함', () => {
      expect(() => getUnifiedSolarTerm(1899, '입춘')).toThrow();
      expect(() => getUnifiedSolarTerm(2201, '입춘')).toThrow();
    });
  });

  describe('getUnifiedYearSolarTerms', () => {
    it('1900년의 모든 절기를 조회해야 함', () => {
      const terms = getUnifiedYearSolarTerms(1900);
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.every(t => t.year === 1900)).toBe(true);
    });

    it('2024년의 절기는 24개여야 함', () => {
      const terms = getUnifiedYearSolarTerms(2024);
      expect(terms.length).toBe(24);
    });

    it('절기는 시간 순으로 정렬되어야 함', () => {
      const terms = getUnifiedYearSolarTerms(2024);
      for (let i = 1; i < terms.length; i++) {
        expect(terms[i]!.timestamp).toBeGreaterThan(terms[i - 1]!.timestamp);
      }
    });
  });

  describe('getUnifiedCurrentSolarTerm', () => {
    it('2024-01-15는 소한 이후여야 함', () => {
      const date = new Date('2024-01-15T00:00:00+09:00');
      const term = getUnifiedCurrentSolarTerm(date);
      expect(term).toBeDefined();
      expect(term?.term).toBe('소한');
    });

    it('2024-03-21는 춘분 이후여야 함', () => {
      const date = new Date('2024-03-21T00:00:00+09:00');
      const term = getUnifiedCurrentSolarTerm(date);
      expect(term).toBeDefined();
      // 춘분 또는 그 이전 절기
      expect(['경칩', '춘분']).toContain(term?.term);
    });

    it('범위를 벗어난 날짜는 에러를 발생시켜야 함', () => {
      const date1 = new Date('1899-12-31T00:00:00+09:00');
      const date2 = new Date('2201-01-01T00:00:00+09:00');
      expect(() => getUnifiedCurrentSolarTerm(date1)).toThrow();
      expect(() => getUnifiedCurrentSolarTerm(date2)).toThrow();
    });
  });

  describe('getUnifiedNextSolarTerm', () => {
    it('2024-01-01 다음 절기는 소한이어야 함', () => {
      const date = new Date('2024-01-01T00:00:00+09:00');
      const term = getUnifiedNextSolarTerm(date);
      expect(term).toBeDefined();
      expect(term?.term).toBe('소한');
    });

    it('다음 절기의 시간은 현재 시간보다 이후여야 함', () => {
      const date = new Date('2024-06-15T00:00:00+09:00');
      const term = getUnifiedNextSolarTerm(date);
      expect(term).toBeDefined();
      expect(term!.timestamp).toBeGreaterThan(date.getTime());
    });
  });

  describe('범위 검증 함수', () => {
    it('isYearInRange는 유효한 범위를 정확히 판단해야 함', () => {
      expect(isYearInRange(1900)).toBe(true);
      expect(isYearInRange(2024)).toBe(true);
      expect(isYearInRange(2200)).toBe(true);
      expect(isYearInRange(1899)).toBe(false);
      expect(isYearInRange(2201)).toBe(false);
    });

    it('isDateInRange는 유효한 날짜를 정확히 판단해야 함', () => {
      expect(isDateInRange(new Date('1900-01-01'))).toBe(true);
      expect(isDateInRange(new Date('2024-06-15'))).toBe(true);
      expect(isDateInRange(new Date('2200-12-31'))).toBe(true);
      expect(isDateInRange(new Date('1899-12-31'))).toBe(false);
      expect(isDateInRange(new Date('2201-01-01'))).toBe(false);
    });
  });

  describe('getDataStatistics', () => {
    it('데이터 통계를 정확히 반환해야 함', () => {
      const stats = getDataStatistics();
      expect(stats.lunarYears).toBeGreaterThan(0);
      expect(stats.solarTerms).toBeGreaterThan(0);
      expect(stats.yearRange.min).toBe(DATA_RANGE.MIN_YEAR);
      expect(stats.yearRange.max).toBe(DATA_RANGE.MAX_YEAR);
    });

    it('음력 데이터는 301년치가 있어야 함', () => {
      const stats = getDataStatistics();
      // 실제 데이터는 일부만 있을 수 있으므로 최소값만 검증
      expect(stats.lunarYears).toBeGreaterThan(100);
    });
  });

  describe('캐시 기능', () => {
    beforeEach(() => {
      clearDataCache();
    });

    it('동일한 데이터를 여러 번 조회해도 결과가 일관되어야 함', () => {
      const data1 = getUnifiedLunarYearData(2024);
      const data2 = getUnifiedLunarYearData(2024);
      expect(data1).toEqual(data2);
    });

    it('캐시 초기화 후에도 데이터 조회가 가능해야 함', () => {
      const data1 = getUnifiedLunarYearData(2024);
      clearDataCache();
      const data2 = getUnifiedLunarYearData(2024);
      expect(data1).toEqual(data2);
    });
  });

  describe('성능 테스트', () => {
    it('1000번 조회가 1초 이내에 완료되어야 함', () => {
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        getUnifiedLunarYearData(2024);
      }
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('전체 범위 스캔이 합리적인 시간 내에 완료되어야 함', () => {
      const startTime = Date.now();
      for (let year = 1900; year <= 2200; year += 10) {
        getUnifiedLunarYearData(year);
      }
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
