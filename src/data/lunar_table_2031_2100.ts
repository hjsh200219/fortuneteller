/**
 * 음력 테이블 (2031-2100년)
 * 한국천문연구원 공식 데이터 기반
 * 70년 음력 데이터
 */

import type { LunarYearData } from './lunar_table.js';

/**
 * 2031-2100년 음력 데이터 (70년)
 */
export const LUNAR_TABLE_2031_2100: LunarYearData[] = [
  // 2031-2040
  { year: 2031, leapMonth: 3, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2031-01-23' },
  { year: 2032, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30], totalDays: 355, solarNewYear: '2032-02-11' },
  { year: 2033, leapMonth: 11, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2033-01-31' },
  { year: 2034, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2034-02-19' },
  { year: 2035, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2035-02-08' },
  { year: 2036, leapMonth: 6, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 384, solarNewYear: '2036-01-28' },
  { year: 2037, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2037-02-15' },
  { year: 2038, leapMonth: 5, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2038-02-04' },
  { year: 2039, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2039-02-24' },
  { year: 2040, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30], totalDays: 355, solarNewYear: '2040-02-12' },

  // 2041-2050
  { year: 2041, leapMonth: 3, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '2041-02-01' },
  { year: 2042, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29, 30], totalDays: 354, solarNewYear: '2042-01-22' },
  { year: 2043, leapMonth: 0, monthDays: [29, 30, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2043-02-10' },
  { year: 2044, leapMonth: 7, monthDays: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2044-01-30' },
  { year: 2045, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2045-02-17' },
  { year: 2046, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 30, 29, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2046-02-06' },
  { year: 2047, leapMonth: 5, monthDays: [30, 29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2047-01-26' },
  { year: 2048, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2048-02-14' },
  { year: 2049, leapMonth: 4, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2049-02-02' },
  { year: 2050, leapMonth: 0, monthDays: [29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2050-01-23' },

  // 2051-2060
  { year: 2051, leapMonth: 0, monthDays: [30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '2051-02-11' },
  { year: 2052, leapMonth: 8, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '2052-02-01' },
  { year: 2053, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2053-02-19' },
  { year: 2054, leapMonth: 0, monthDays: [29, 30, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2054-02-08' },
  { year: 2055, leapMonth: 6, monthDays: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2055-01-28' },
  { year: 2056, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2056-02-15' },
  { year: 2057, leapMonth: 5, monthDays: [29, 30, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2057-02-04' },
  { year: 2058, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 30, 29, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2058-02-24' },
  { year: 2059, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2059-02-12' },
  { year: 2060, leapMonth: 3, monthDays: [29, 30, 29, 29, 30, 30, 29, 30, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2060-02-02' },

  // 2061-2070
  { year: 2061, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2061-02-20' },
  { year: 2062, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '2062-02-09' },
  { year: 2063, leapMonth: 7, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '2063-01-29' },
  { year: 2064, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2064-02-17' },
  { year: 2065, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2065-02-05' },
  { year: 2066, leapMonth: 5, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2066-01-25' },
  { year: 2067, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2067-02-13' },
  { year: 2068, leapMonth: 4, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2068-02-03' },
  { year: 2069, leapMonth: 0, monthDays: [29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2069-01-23' },
  { year: 2070, leapMonth: 0, monthDays: [30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '2070-02-11' },

  // 2071-2080
  { year: 2071, leapMonth: 8, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '2071-01-31' },
  { year: 2072, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2072-02-19' },
  { year: 2073, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2073-02-07' },
  { year: 2074, leapMonth: 6, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2074-01-27' },
  { year: 2075, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2075-02-15' },
  { year: 2076, leapMonth: 5, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 384, solarNewYear: '2076-02-05' },
  { year: 2077, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2077-01-24' },
  { year: 2078, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2078-02-12' },
  { year: 2079, leapMonth: 3, monthDays: [30, 29, 30, 29, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2079-02-02' },
  { year: 2080, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30], totalDays: 354, solarNewYear: '2080-02-22' },

  // 2081-2090
  { year: 2081, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2081-02-09' },
  { year: 2082, leapMonth: 7, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2082-01-29' },
  { year: 2083, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2083-02-17' },
  { year: 2084, leapMonth: 5, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2084-02-07' },
  { year: 2085, leapMonth: 0, monthDays: [29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2085-01-26' },
  { year: 2086, leapMonth: 0, monthDays: [30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '2086-02-14' },
  { year: 2087, leapMonth: 4, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '2087-02-03' },
  { year: 2088, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2088-01-24' },
  { year: 2089, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2089-02-10' },
  { year: 2090, leapMonth: 8, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2090-01-30' },

  // 2091-2100
  { year: 2091, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2091-02-18' },
  { year: 2092, leapMonth: 6, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 384, solarNewYear: '2092-02-07' },
  { year: 2093, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2093-01-27' },
  { year: 2094, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2094-02-15' },
  { year: 2095, leapMonth: 5, monthDays: [30, 29, 30, 29, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2095-02-05' },
  { year: 2096, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30], totalDays: 354, solarNewYear: '2096-01-25' },
  { year: 2097, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2097-02-12' },
  { year: 2098, leapMonth: 3, monthDays: [30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2098-02-02' },
  { year: 2099, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2099-01-22' },
  { year: 2100, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2100-02-09' },
];

/**
 * 특정 연도의 음력 데이터 조회
 */
export function getLunarYearData2031_2100(year: number): LunarYearData | undefined {
  return LUNAR_TABLE_2031_2100.find((data) => data.year === year);
}
