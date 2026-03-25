/**
 * 절기 교차 검증 테스트
 *
 * 1. getCurrentSolarTermPrecise가 올바른 절기를 반환하는지
 * 2. getSolarTermsForYear가 1900-2200 전체 범위를 커버하는지
 * 3. 12월~1월 순환 경계에서 올바른 절기를 반환하는지
 * 4. 입춘 경계에서 연주 전환이 올바른지
 */

import {
  getCurrentSolarTerm,
  getCurrentSolarTermPrecise,
  getSolarTermsForYear,
} from '../src/data/solar_terms.js';

describe('절기 데이터 커버리지 검증', () => {
  test('getSolarTermsForYear가 1900-2200 전체 범위를 커버해야 함', () => {
    const missingYears: number[] = [];

    for (let year = 1900; year <= 2200; year++) {
      const terms = getSolarTermsForYear(year);
      if (terms.length === 0) {
        missingYears.push(year);
      }
    }

    expect(missingYears).toEqual([]);
  });

  test('각 연도에 24개 절기가 모두 존재해야 함', () => {
    const sampleYears = [1900, 1950, 2000, 2020, 2025, 2050, 2100, 2150, 2200];
    const expectedTerms = [
      '입춘', '우수', '경칩', '춘분', '청명', '곡우',
      '입하', '소만', '망종', '하지', '소서', '대서',
      '입추', '처서', '백로', '추분', '한로', '상강',
      '입동', '소설', '대설', '동지', '소한', '대한',
    ];

    for (const year of sampleYears) {
      const terms = getSolarTermsForYear(year);
      const termNames = terms.map(t => t.term);

      for (const expected of expectedTerms) {
        expect(termNames).toContain(expected);
      }
    }
  });

  test('절기 timestamp가 시간순으로 정렬되어 있어야 함', () => {
    const sampleYears = [1900, 2000, 2025, 2100, 2200];

    for (const year of sampleYears) {
      const terms = getSolarTermsForYear(year);
      for (let i = 1; i < terms.length; i++) {
        expect(terms[i]!.timestamp).toBeGreaterThan(terms[i - 1]!.timestamp);
      }
    }
  });
});

describe('getCurrentSolarTerm 근사 함수 버그 검증', () => {
  // Critical-2: 12월~1월 순환 실패 재현
  test('[Bug] 12월 22일 이후에 동지가 반환되어야 함 (현재 버그: 입춘 반환)', () => {
    const dec25 = new Date(2025, 11, 25, 12, 0, 0); // 12월 25일
    const result = getCurrentSolarTerm(dec25);
    // 12월 22일 이후는 동지여야 하지만, 현재 버그로 인해 '입춘'이 반환될 수 있음
    expect(result).toBe('동지');
  });

  test('[Bug] 1월 3일에 동지가 반환되어야 함 (소한 이전)', () => {
    const jan3 = new Date(2026, 0, 3, 12, 0, 0);
    const result = getCurrentSolarTerm(jan3);
    // 소한(1/6)  이전이므로 동지가 반환되어야 함
    expect(result).toBe('동지');
  });
});

describe('getCurrentSolarTermPrecise 정밀 함수 검증', () => {
  test('12월 25일에 동지가 반환되어야 함', () => {
    const dec25 = new Date(2025, 11, 25, 12, 0, 0);
    const result = getCurrentSolarTermPrecise(dec25);
    expect(result).toBe('동지');
  });

  test('1월 3일에 동지가 반환되어야 함 (소한 이전)', () => {
    const jan3 = new Date(2026, 0, 3, 12, 0, 0);
    const result = getCurrentSolarTermPrecise(jan3);
    expect(result).toBe('동지');
  });

  test('1월 6일 이후에 소한이 반환되어야 함', () => {
    const jan7 = new Date(2026, 0, 7, 12, 0, 0);
    const result = getCurrentSolarTermPrecise(jan7);
    expect(result).toBe('소한');
  });

  // 입춘 경계 테스트
  test('2025년 입춘(2/3 23:10) 이전에는 대한이어야 함', () => {
    const beforeIpchun = new Date(2025, 1, 3, 22, 0, 0); // 2/3 22:00
    const result = getCurrentSolarTermPrecise(beforeIpchun);
    expect(result).toBe('대한');
  });

  test('2025년 입춘(2/3 23:10) 이후에는 입춘이어야 함', () => {
    const afterIpchun = new Date(2025, 1, 4, 0, 0, 0); // 2/4 00:00
    const result = getCurrentSolarTermPrecise(afterIpchun);
    expect(result).toBe('입춘');
  });

  test('2026년 입춘(2/4 04:46) 이전에는 대한이어야 함', () => {
    const beforeIpchun = new Date(2026, 1, 4, 3, 0, 0); // 2/4 03:00
    const result = getCurrentSolarTermPrecise(beforeIpchun);
    expect(result).toBe('대한');
  });

  test('2026년 입춘(2/4 04:46) 이후에는 입춘이어야 함', () => {
    const afterIpchun = new Date(2026, 1, 4, 5, 0, 0); // 2/4 05:00
    const result = getCurrentSolarTermPrecise(afterIpchun);
    expect(result).toBe('입춘');
  });

  // 모든 24절기가 정밀 함수에서 반환 가능한지 검증
  test('2025년 모든 24절기가 적절한 날짜에서 반환되어야 함', () => {
    const terms2025 = getSolarTermsForYear(2025);
    expect(terms2025.length).toBe(24);

    for (let i = 0; i < terms2025.length; i++) {
      const term = terms2025[i]!;
      // 절기 시작 1시간 후에 해당 절기가 반환되어야 함
      const testDate = new Date(term.timestamp + 60 * 60 * 1000);
      const result = getCurrentSolarTermPrecise(testDate);
      expect(result).toBe(term.term);
    }
  });
});

describe('연주 입춘 경계 검증', () => {
  // Critical-3: 입춘 이전 판정 누락 재현
  test('[Bug] 1월 15일은 입춘 이전이므로 전년도 연주를 사용해야 함', () => {
    // 2025-01-15는 입춘(2/3) 이전이므로 2024년(갑진년) 연주
    const result = calculateSajuForYearTest('2025-01-15', '12:00');
    // 2024년 = 갑진년
    expect(result.yearStem).toBe('갑');
    expect(result.yearBranch).toBe('진');
  });

  test('[Bug] 1월 1일은 입춘 이전이므로 전년도 연주를 사용해야 함', () => {
    const result = calculateSajuForYearTest('2025-01-01', '12:00');
    expect(result.yearStem).toBe('갑');
    expect(result.yearBranch).toBe('진');
  });

  test('입춘 이후(2/4)에는 해당 연도 연주를 사용해야 함', () => {
    const result = calculateSajuForYearTest('2025-02-04', '12:00');
    // 2025년 = 을사년
    expect(result.yearStem).toBe('을');
    expect(result.yearBranch).toBe('사');
  });
});

/**
 * 연주 테스트용 헬퍼 (calculateSaju 래핑)
 */
function calculateSajuForYearTest(date: string, time: string) {
  // dynamic import 대신 직접 가져오기
  const { calculateSaju } = require('../src/lib/saju.js');
  const result = calculateSaju(date, time, 'solar', false, 'male');
  return {
    yearStem: result.year.stem,
    yearBranch: result.year.branch,
  };
}
