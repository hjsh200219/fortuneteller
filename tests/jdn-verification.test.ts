/**
 * JDN(율리우스 일수) 기반 일주 전수 검증 테스트
 *
 * 천문학 공식으로 일주를 독립 계산하여 calculateDayPillar와 교차 검증
 * JDN 공식: 천간 = (JDN + 9) % 10, 지지 = (JDN + 1) % 12
 */

import { calculateSaju } from '../src/lib/saju.js';
import { getDayPillar } from '../src/lib/helpers.js';

const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;

/**
 * 그레고리력 날짜 → JDN(율리우스 일수) 변환
 * 천문학적 표준 공식 (Meeus, "Astronomical Algorithms")
 */
function gregorianToJDN(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

/**
 * JDN으로부터 천간 계산
 * 1900-01-01(JDN 2415020) = 갑(0)술 기준으로 offset 교정: (JDN+0)%10
 */
function stemFromJDN(jdn: number): string {
  return HEAVENLY_STEMS[((Math.floor(jdn) + 0) % 10 + 10) % 10]!;
}

/**
 * JDN으로부터 지지 계산
 * 1900-01-01(JDN 2415020) = 갑술(10) 기준으로 offset 교정: (JDN+2)%12
 */
function branchFromJDN(jdn: number): string {
  return EARTHLY_BRANCHES[((Math.floor(jdn) + 2) % 12 + 12) % 12]!;
}

describe('JDN 기반 일주 전수 검증', () => {
  // 기준일 검증
  test('1900-01-01 = 갑술일 (JDN 검증)', () => {
    const jdn = gregorianToJDN(1900, 1, 1);
    expect(stemFromJDN(jdn)).toBe('갑');
    expect(branchFromJDN(jdn)).toBe('술');
  });

  // 만세력 테이블 검증 데이터 (万年历 원전 대조 완료)
  const verificationData = [
    { date: '1900-01-01', stem: '갑', branch: '술', desc: '기준일' },
    { date: '2000-01-01', stem: '무', branch: '오', desc: '밀레니엄' },
    { date: '2000-02-04', stem: '임', branch: '진', desc: '2000년 입춘' },
    { date: '2000-02-29', stem: '정', branch: '사', desc: '2000년 윤일' },
    { date: '2000-12-31', stem: '계', branch: '해', desc: '2000년 마지막' },
    { date: '2010-01-01', stem: '신', branch: '해', desc: '2010년 시작' },
    { date: '2010-02-14', stem: '을', branch: '미', desc: '2010년 설날' },
    { date: '2020-01-01', stem: '계', branch: '묘', desc: '2020년 시작' },
    { date: '2020-01-25', stem: '정', branch: '묘', desc: '2020년 설날' },
    { date: '2020-02-29', stem: '임', branch: '인', desc: '2020년 윤일' },
    { date: '2024-01-01', stem: '갑', branch: '자', desc: '2024년 시작' },
    { date: '2024-01-04', stem: '정', branch: '묘', desc: '2024년 정묘일' },
    { date: '2024-02-04', stem: '무', branch: '술', desc: '2024년 입춘' },
    { date: '2024-02-10', stem: '갑', branch: '진', desc: '2024년 설날' },
    { date: '2024-02-29', stem: '계', branch: '해', desc: '2024년 윤일' },
    { date: '2024-06-01', stem: '병', branch: '신', desc: '2024년 6월' },
    { date: '2024-12-31', stem: '기', branch: '사', desc: '2024년 마지막' },
    { date: '2025-01-01', stem: '경', branch: '오', desc: '2025년 시작' },
    { date: '2025-02-03', stem: '계', branch: '묘', desc: '2025년 입춘' },
    { date: '1970-12-14', stem: '무', branch: '진', desc: '1970-12-14 무진일 (버그 수정 검증)' },
    { date: '2024-03-04', stem: '정', branch: '묘', desc: '60갑자 +60일' },
    { date: '2024-05-03', stem: '정', branch: '묘', desc: '60갑자 +120일' },
  ];

  test.each(verificationData)(
    'JDN 검증: $date = $stem$branch ($desc)',
    ({ date, stem, branch }) => {
      const [y, m, d] = date.split('-').map(Number) as [number, number, number];
      const jdn = gregorianToJDN(y, m, d);
      expect(stemFromJDN(jdn)).toBe(stem);
      expect(branchFromJDN(jdn)).toBe(branch);
    }
  );

  // helpers.ts의 getDayPillar가 JDN과 일치하는지 검증
  test.each(verificationData)(
    'getDayPillar vs JDN: $date ($desc)',
    ({ date, stem, branch }) => {
      const [y, m, d] = date.split('-').map(Number) as [number, number, number];
      // getDayPillar에는 시간이 포함된 Date 전달 (정오 기준으로 타임존 영향 최소화)
      const testDate = new Date(y, m - 1, d, 12, 0, 0);
      const result = getDayPillar(testDate);
      expect(result.stem).toBe(stem);
      expect(result.branch).toBe(branch);
    }
  );

  // saju.ts의 calculateSaju 일주가 JDN과 일치하는지 검증
  test.each(verificationData)(
    'calculateSaju 일주 vs JDN: $date ($desc)',
    ({ date, stem, branch }) => {
      const result = calculateSaju(date, '12:00', 'solar', false, 'male');
      expect(result.day.stem).toBe(stem);
      expect(result.day.branch).toBe(branch);
    }
  );

  // 대규모 전수 검증: 1900-2100 범위에서 매 30일마다 검증 (약 2400건)
  describe('대규모 JDN 교차 검증 (1900-2100, 30일 간격)', () => {
    const massTestCases: Array<{ year: number; month: number; day: number }> = [];

    for (let y = 1900; y <= 2100; y++) {
      for (let m = 1; m <= 12; m += 2) {
        massTestCases.push({ year: y, month: m, day: 1 });
        massTestCases.push({ year: y, month: m, day: 15 });
      }
    }

    test('getDayPillar가 JDN과 100% 일치해야 함', () => {
      let totalChecked = 0;
      let failures = 0;
      const failureDetails: string[] = [];

      for (const { year, month, day } of massTestCases) {
        // 유효한 날짜인지 확인
        const testDate = new Date(year, month - 1, day, 12, 0, 0);
        if (testDate.getMonth() !== month - 1) continue; // 잘못된 날짜 (2/30 등) 스킵

        const jdn = gregorianToJDN(year, month, day);
        const expectedStem = stemFromJDN(jdn);
        const expectedBranch = branchFromJDN(jdn);

        const result = getDayPillar(testDate);
        totalChecked++;

        if (result.stem !== expectedStem || result.branch !== expectedBranch) {
          failures++;
          if (failureDetails.length < 10) {
            failureDetails.push(
              `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}: ` +
              `예상=${expectedStem}${expectedBranch}, 실제=${result.stem}${result.branch}`
            );
          }
        }
      }

      if (failures > 0) {
        console.log(`전수 검증 실패: ${failures}/${totalChecked}`);
        console.log('실패 샘플:', failureDetails.join('\n'));
      }

      expect(failures).toBe(0);
      expect(totalChecked).toBeGreaterThan(2000);
    });

    test('calculateSaju 일주가 JDN과 100% 일치해야 함', () => {
      // 주요 연도만 샘플링 (성능상)
      const sampleYears = [1900, 1950, 1985, 2000, 2010, 2020, 2024, 2025, 2026, 2050, 2100];
      let totalChecked = 0;
      let failures = 0;

      for (const year of sampleYears) {
        for (let month = 1; month <= 12; month++) {
          for (const day of [1, 10, 20]) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const testDate = new Date(year, month - 1, day);
            if (testDate.getMonth() !== month - 1) continue;

            const jdn = gregorianToJDN(year, month, day);
            const expectedStem = stemFromJDN(jdn);
            const expectedBranch = branchFromJDN(jdn);

            try {
              const result = calculateSaju(dateStr, '12:00', 'solar', false, 'male');
              totalChecked++;

              if (result.day.stem !== expectedStem || result.day.branch !== expectedBranch) {
                failures++;
              }
            } catch {
              // 범위 밖 날짜는 스킵
            }
          }
        }
      }

      expect(failures).toBe(0);
      expect(totalChecked).toBeGreaterThan(100);
    });
  });

  // 1970-12-14 무진일 버그 수정 회귀 테스트
  describe('1970-12-14 무진일 버그 수정 검증', () => {
    test('1970-12-14 일주가 무진(戊辰)이어야 함 (만세력 원전 대조)', () => {
      const result = calculateSaju('1970-12-14', '12:00', 'solar', false, 'male');
      expect(result.day.stem).toBe('무');
      expect(result.day.branch).toBe('진');
    });

    test('1970-12-14 연주/월주가 경술/무자이어야 함', () => {
      const result = calculateSaju('1970-12-14', '12:00', 'solar', false, 'male');
      expect(result.year.stem).toBe('경');
      expect(result.year.branch).toBe('술');
      expect(result.month.stem).toBe('무');
      expect(result.month.branch).toBe('자');
    });

    test('1970-12-14 12시 시주가 무오(戊午)이어야 함 (일간 무 기준 오시)', () => {
      const result = calculateSaju('1970-12-14', '12:00', 'solar', false, 'male');
      expect(result.hour.stem).toBe('무');
      expect(result.hour.branch).toBe('오');
    });

    test('getDayPillar도 무진을 반환해야 함', () => {
      const testDate = new Date(1970, 11, 14, 12, 0, 0);
      const result = getDayPillar(testDate);
      expect(result.stem).toBe('무');
      expect(result.branch).toBe('진');
    });

    test('JDN 독립 계산도 무진이어야 함', () => {
      const jdn = gregorianToJDN(1970, 12, 14);
      expect(stemFromJDN(jdn)).toBe('무');
      expect(branchFromJDN(jdn)).toBe('진');
    });
  });
});
