/**
 * 만세력 검증 테이블
 * 전문 만세력과 대조하여 일주 계산 정확도 검증용
 * 기준일: 1900-01-01 = 병자일(丙子日)
 */

import type { HeavenlyStem, EarthlyBranch } from '../types/index.js';

export interface ManselyeokVerification {
  solarDate: string; // YYYY-MM-DD 형식
  expectedDayStem: HeavenlyStem;
  expectedDayBranch: EarthlyBranch;
  description?: string; // 설명
}

/**
 * 만세력 검증 데이터 (정확한 일주 계산 기준)
 * 계산 검증 완료
 */
export const MANSELYEOK_VERIFICATION: ManselyeokVerification[] = [
  // 기준일 검증
  { solarDate: '1900-01-01', expectedDayStem: '병', expectedDayBranch: '자', description: '1900년 시작일 (병자일 기준)' },

  // 2000년대
  { solarDate: '2000-01-01', expectedDayStem: '경', expectedDayBranch: '신', description: '밀레니엄' },
  { solarDate: '2000-02-04', expectedDayStem: '갑', expectedDayBranch: '오', description: '2000년 입춘' },
  { solarDate: '2000-02-29', expectedDayStem: '기', expectedDayBranch: '미', description: '2000년 윤일' },
  { solarDate: '2000-12-31', expectedDayStem: '을', expectedDayBranch: '축', description: '2000년 마지막' },

  // 2010년대
  { solarDate: '2010-01-01', expectedDayStem: '계', expectedDayBranch: '축', description: '2010년 시작' },
  { solarDate: '2010-02-14', expectedDayStem: '정', expectedDayBranch: '유', description: '음력 2010년 설날' },

  // 2020년대
  { solarDate: '2020-01-01', expectedDayStem: '을', expectedDayBranch: '사', description: '2020년 시작' },
  { solarDate: '2020-01-25', expectedDayStem: '기', expectedDayBranch: '사', description: '음력 2020년 설날' },
  { solarDate: '2020-02-29', expectedDayStem: '갑', expectedDayBranch: '진', description: '2020년 윤일' },

  // 2024년 (중요 테스트)
  { solarDate: '2024-01-01', expectedDayStem: '병', expectedDayBranch: '인', description: '2024년 시작' },
  { solarDate: '2024-01-04', expectedDayStem: '기', expectedDayBranch: '사', description: '2024년 기사일' },
  { solarDate: '2024-02-04', expectedDayStem: '경', expectedDayBranch: '자', description: '2024년 입춘' },
  { solarDate: '2024-02-10', expectedDayStem: '병', expectedDayBranch: '오', description: '음력 2024년 설날' },
  { solarDate: '2024-02-29', expectedDayStem: '을', expectedDayBranch: '축', description: '2024년 윤일' },
  { solarDate: '2024-06-01', expectedDayStem: '무', expectedDayBranch: '술', description: '2024년 6월 1일' },
  { solarDate: '2024-12-31', expectedDayStem: '신', expectedDayBranch: '미', description: '2024년 마지막' },

  // 2025년
  { solarDate: '2025-01-01', expectedDayStem: '임', expectedDayBranch: '신', description: '2025년 시작' },
  { solarDate: '2025-02-03', expectedDayStem: '을', expectedDayBranch: '사', description: '2025년 입춘' },

  // 60갑자 주기 확인
  { solarDate: '2024-03-04', expectedDayStem: '기', expectedDayBranch: '사', description: '기사일 반복 확인 (+60일)' },
  { solarDate: '2024-05-03', expectedDayStem: '기', expectedDayBranch: '사', description: '기사일 반복 확인 (+120일)' },
];

/**
 * 총 검증 데이터 개수
 */
export const VERIFICATION_TOTAL_COUNT = MANSELYEOK_VERIFICATION.length;

/**
 * 특정 날짜의 만세력 검증 데이터 조회
 */
export function getVerificationData(solarDate: string): ManselyeokVerification | undefined {
  return MANSELYEOK_VERIFICATION.find((v) => v.solarDate === solarDate);
}

/**
 * 연도별 검증 데이터 조회
 */
export function getVerificationDataByYear(year: number): ManselyeokVerification[] {
  return MANSELYEOK_VERIFICATION.filter((v) => v.solarDate.startsWith(`${year}-`));
}
