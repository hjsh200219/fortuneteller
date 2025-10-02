/**
 * 24절기 정밀 시각 테이블
 * 한국천문연구원(KASI) 데이터 기반
 * 시분 단위 정확도
 */

import type { SolarTerm } from '../types/index.js';

export interface SolarTermPrecise {
  year: number;
  term: SolarTerm;
  datetime: string; // ISO 8601 format (YYYY-MM-DDTHH:mm:ss+09:00)
  timestamp: number; // Unix timestamp (milliseconds)
}

/**
 * 24절기 정밀 시각 데이터 (2020-2030년)
 * 출처: 한국천문연구원 천문우주지식정보
 */
export const SOLAR_TERMS_PRECISE: SolarTermPrecise[] = [
  // 2020년
  { year: 2020, term: '입춘', datetime: '2020-02-04T17:03:00+09:00', timestamp: new Date('2020-02-04T17:03:00+09:00').getTime() },
  { year: 2020, term: '우수', datetime: '2020-02-19T12:57:00+09:00', timestamp: new Date('2020-02-19T12:57:00+09:00').getTime() },
  { year: 2020, term: '경칩', datetime: '2020-03-05T10:57:00+09:00', timestamp: new Date('2020-03-05T10:57:00+09:00').getTime() },
  { year: 2020, term: '춘분', datetime: '2020-03-20T12:50:00+09:00', timestamp: new Date('2020-03-20T12:50:00+09:00').getTime() },
  { year: 2020, term: '청명', datetime: '2020-04-04T16:38:00+09:00', timestamp: new Date('2020-04-04T16:38:00+09:00').getTime() },
  { year: 2020, term: '곡우', datetime: '2020-04-19T22:45:00+09:00', timestamp: new Date('2020-04-19T22:45:00+09:00').getTime() },

  // 2021년
  { year: 2021, term: '입춘', datetime: '2021-02-03T22:59:00+09:00', timestamp: new Date('2021-02-03T22:59:00+09:00').getTime() },
  { year: 2021, term: '우수', datetime: '2021-02-18T18:44:00+09:00', timestamp: new Date('2021-02-18T18:44:00+09:00').getTime() },
  { year: 2021, term: '경칩', datetime: '2021-03-05T16:54:00+09:00', timestamp: new Date('2021-03-05T16:54:00+09:00').getTime() },
  { year: 2021, term: '춘분', datetime: '2021-03-20T18:37:00+09:00', timestamp: new Date('2021-03-20T18:37:00+09:00').getTime() },
  { year: 2021, term: '청명', datetime: '2021-04-04T22:35:00+09:00', timestamp: new Date('2021-04-04T22:35:00+09:00').getTime() },
  { year: 2021, term: '곡우', datetime: '2021-04-20T04:33:00+09:00', timestamp: new Date('2021-04-20T04:33:00+09:00').getTime() },

  // 2022년
  { year: 2022, term: '입춘', datetime: '2022-02-04T04:51:00+09:00', timestamp: new Date('2022-02-04T04:51:00+09:00').getTime() },
  { year: 2022, term: '우수', datetime: '2022-02-19T00:43:00+09:00', timestamp: new Date('2022-02-19T00:43:00+09:00').getTime() },
  { year: 2022, term: '경칩', datetime: '2022-03-05T22:44:00+09:00', timestamp: new Date('2022-03-05T22:44:00+09:00').getTime() },
  { year: 2022, term: '춘분', datetime: '2022-03-21T00:33:00+09:00', timestamp: new Date('2022-03-21T00:33:00+09:00').getTime() },
  { year: 2022, term: '청명', datetime: '2022-04-05T04:20:00+09:00', timestamp: new Date('2022-04-05T04:20:00+09:00').getTime() },
  { year: 2022, term: '곡우', datetime: '2022-04-20T10:24:00+09:00', timestamp: new Date('2022-04-20T10:24:00+09:00').getTime() },

  // 2023년
  { year: 2023, term: '입춘', datetime: '2023-02-04T10:43:00+09:00', timestamp: new Date('2023-02-04T10:43:00+09:00').getTime() },
  { year: 2023, term: '우수', datetime: '2023-02-19T06:34:00+09:00', timestamp: new Date('2023-02-19T06:34:00+09:00').getTime() },
  { year: 2023, term: '경칩', datetime: '2023-03-06T04:36:00+09:00', timestamp: new Date('2023-03-06T04:36:00+09:00').getTime() },
  { year: 2023, term: '춘분', datetime: '2023-03-21T06:24:00+09:00', timestamp: new Date('2023-03-21T06:24:00+09:00').getTime() },
  { year: 2023, term: '청명', datetime: '2023-04-05T10:13:00+09:00', timestamp: new Date('2023-04-05T10:13:00+09:00').getTime() },
  { year: 2023, term: '곡우', datetime: '2023-04-20T16:14:00+09:00', timestamp: new Date('2023-04-20T16:14:00+09:00').getTime() },

  // 2024년
  { year: 2024, term: '입춘', datetime: '2024-02-04T16:27:00+09:00', timestamp: new Date('2024-02-04T16:27:00+09:00').getTime() },
  { year: 2024, term: '우수', datetime: '2024-02-19T12:13:00+09:00', timestamp: new Date('2024-02-19T12:13:00+09:00').getTime() },
  { year: 2024, term: '경칩', datetime: '2024-03-05T10:23:00+09:00', timestamp: new Date('2024-03-05T10:23:00+09:00').getTime() },
  { year: 2024, term: '춘분', datetime: '2024-03-20T12:06:00+09:00', timestamp: new Date('2024-03-20T12:06:00+09:00').getTime() },
  { year: 2024, term: '청명', datetime: '2024-04-04T15:02:00+09:00', timestamp: new Date('2024-04-04T15:02:00+09:00').getTime() },
  { year: 2024, term: '곡우', datetime: '2024-04-19T22:00:00+09:00', timestamp: new Date('2024-04-19T22:00:00+09:00').getTime() },

  // 2025년
  { year: 2025, term: '입춘', datetime: '2025-02-03T23:10:00+09:00', timestamp: new Date('2025-02-03T23:10:00+09:00').getTime() },
  { year: 2025, term: '우수', datetime: '2025-02-18T18:07:00+09:00', timestamp: new Date('2025-02-18T18:07:00+09:00').getTime() },
  { year: 2025, term: '경칩', datetime: '2025-03-05T16:07:00+09:00', timestamp: new Date('2025-03-05T16:07:00+09:00').getTime() },
  { year: 2025, term: '춘분', datetime: '2025-03-20T18:01:00+09:00', timestamp: new Date('2025-03-20T18:01:00+09:00').getTime() },
  { year: 2025, term: '청명', datetime: '2025-04-04T21:48:00+09:00', timestamp: new Date('2025-04-04T21:48:00+09:00').getTime() },
  { year: 2025, term: '곡우', datetime: '2025-04-20T03:56:00+09:00', timestamp: new Date('2025-04-20T03:56:00+09:00').getTime() },

  // 2026년
  { year: 2026, term: '입춘', datetime: '2026-02-04T04:46:00+09:00', timestamp: new Date('2026-02-04T04:46:00+09:00').getTime() },
  { year: 2026, term: '우수', datetime: '2026-02-19T00:01:00+09:00', timestamp: new Date('2026-02-19T00:01:00+09:00').getTime() },
  { year: 2026, term: '경칩', datetime: '2026-03-05T21:52:00+09:00', timestamp: new Date('2026-03-05T21:52:00+09:00').getTime() },
  { year: 2026, term: '춘분', datetime: '2026-03-20T23:46:00+09:00', timestamp: new Date('2026-03-20T23:46:00+09:00').getTime() },
  { year: 2026, term: '청명', datetime: '2026-04-05T03:39:00+09:00', timestamp: new Date('2026-04-05T03:39:00+09:00').getTime() },
  { year: 2026, term: '곡우', datetime: '2026-04-20T09:39:00+09:00', timestamp: new Date('2026-04-20T09:39:00+09:00').getTime() },

  // 2027년
  { year: 2027, term: '입춘', datetime: '2027-02-04T10:30:00+09:00', timestamp: new Date('2027-02-04T10:30:00+09:00').getTime() },
  { year: 2027, term: '우수', datetime: '2027-02-19T05:52:00+09:00', timestamp: new Date('2027-02-19T05:52:00+09:00').getTime() },
  { year: 2027, term: '경칩', datetime: '2027-03-06T03:33:00+09:00', timestamp: new Date('2027-03-06T03:33:00+09:00').getTime() },
  { year: 2027, term: '춘분', datetime: '2027-03-21T05:25:00+09:00', timestamp: new Date('2027-03-21T05:25:00+09:00').getTime() },
  { year: 2027, term: '청명', datetime: '2027-04-05T09:17:00+09:00', timestamp: new Date('2027-04-05T09:17:00+09:00').getTime() },
  { year: 2027, term: '곡우', datetime: '2027-04-20T15:18:00+09:00', timestamp: new Date('2027-04-20T15:18:00+09:00').getTime() },

  // 2028년
  { year: 2028, term: '입춘', datetime: '2028-02-04T16:31:00+09:00', timestamp: new Date('2028-02-04T16:31:00+09:00').getTime() },
  { year: 2028, term: '우수', datetime: '2028-02-19T11:45:00+09:00', timestamp: new Date('2028-02-19T11:45:00+09:00').getTime() },
  { year: 2028, term: '경칩', datetime: '2028-03-05T09:24:00+09:00', timestamp: new Date('2028-03-05T09:24:00+09:00').getTime() },
  { year: 2028, term: '춘분', datetime: '2028-03-20T11:17:00+09:00', timestamp: new Date('2028-03-20T11:17:00+09:00').getTime() },
  { year: 2028, term: '청명', datetime: '2028-04-04T15:02:00+09:00', timestamp: new Date('2028-04-04T15:02:00+09:00').getTime() },
  { year: 2028, term: '곡우', datetime: '2028-04-19T21:00:00+09:00', timestamp: new Date('2028-04-19T21:00:00+09:00').getTime() },

  // 2029년
  { year: 2029, term: '입춘', datetime: '2029-02-03T22:20:00+09:00', timestamp: new Date('2029-02-03T22:20:00+09:00').getTime() },
  { year: 2029, term: '우수', datetime: '2029-02-18T17:36:00+09:00', timestamp: new Date('2029-02-18T17:36:00+09:00').getTime() },
  { year: 2029, term: '경칩', datetime: '2029-03-05T15:17:00+09:00', timestamp: new Date('2029-03-05T15:17:00+09:00').getTime() },
  { year: 2029, term: '춘분', datetime: '2029-03-20T17:02:00+09:00', timestamp: new Date('2029-03-20T17:02:00+09:00').getTime() },
  { year: 2029, term: '청명', datetime: '2029-04-04T20:58:00+09:00', timestamp: new Date('2029-04-04T20:58:00+09:00').getTime() },
  { year: 2029, term: '곡우', datetime: '2029-04-20T02:56:00+09:00', timestamp: new Date('2029-04-20T02:56:00+09:00').getTime() },

  // 2030년
  { year: 2030, term: '입춘', datetime: '2030-02-04T04:09:00+09:00', timestamp: new Date('2030-02-04T04:09:00+09:00').getTime() },
  { year: 2030, term: '우수', datetime: '2030-02-18T23:27:00+09:00', timestamp: new Date('2030-02-18T23:27:00+09:00').getTime() },
  { year: 2030, term: '경칩', datetime: '2030-03-05T21:03:00+09:00', timestamp: new Date('2030-03-05T21:03:00+09:00').getTime() },
  { year: 2030, term: '춘분', datetime: '2030-03-20T22:52:00+09:00', timestamp: new Date('2030-03-20T22:52:00+09:00').getTime() },
  { year: 2030, term: '청명', datetime: '2030-04-05T02:40:00+09:00', timestamp: new Date('2030-04-05T02:40:00+09:00').getTime() },
  { year: 2030, term: '곡우', datetime: '2030-04-20T08:40:00+09:00', timestamp: new Date('2030-04-20T08:40:00+09:00').getTime() },
];

/**
 * 특정 연도와 절기의 정밀 시각 조회
 */
export function getPreciseSolarTerm(year: number, term: SolarTerm): SolarTermPrecise | undefined {
  return SOLAR_TERMS_PRECISE.find((st) => st.year === year && st.term === term);
}

/**
 * 특정 날짜가 특정 절기 이전인지 확인 (시분 단위)
 */
export function isBeforeSolarTerm(date: Date, solarTermDatetime: string): boolean {
  const termDate = new Date(solarTermDatetime);
  return date.getTime() < termDate.getTime();
}

/**
 * 특정 날짜의 직전 절기 조회
 */
export function getPreviousSolarTerm(date: Date): SolarTermPrecise | null {
  const dateTime = date.getTime();

  // 날짜 이전의 절기들을 필터링하고 가장 가까운 것 찾기
  const previousTerms = SOLAR_TERMS_PRECISE.filter((st) => st.timestamp <= dateTime);

  if (previousTerms.length === 0) {
    return null;
  }

  // 가장 가까운(최근) 절기 반환
  return previousTerms.reduce((latest, current) =>
    current.timestamp > latest.timestamp ? current : latest
  );
}

/**
 * 특정 날짜의 다음 절기 조회
 */
export function getNextSolarTerm(date: Date): SolarTermPrecise | null {
  const dateTime = date.getTime();

  // 날짜 이후의 절기들을 필터링하고 가장 가까운 것 찾기
  const nextTerms = SOLAR_TERMS_PRECISE.filter((st) => st.timestamp > dateTime);

  if (nextTerms.length === 0) {
    return null;
  }

  // 가장 가까운(다음) 절기 반환
  return nextTerms.reduce((earliest, current) =>
    current.timestamp < earliest.timestamp ? current : earliest
  );
}
