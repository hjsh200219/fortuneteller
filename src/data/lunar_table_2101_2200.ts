/**
 * 음력 데이터 (2101-2200년)
 * 한국천문연구원(KASI) 기준 음력 계산 데이터
 */

export interface LunarYearData {
  year: number;
  leapMonth: number; // 0 = 윤달 없음, 1-12 = 해당 월 윤달
  monthDays: number[]; // 각 월의 일수 (평년 12개, 윤년 13개)
  totalDays: number; // 연 총 일수
  solarNewYear: string; // 음력 1월 1일의 양력 날짜 (ISO 8601)
}

export const LUNAR_TABLE_2101_2200: LunarYearData[] = [
  // 2101-2110
  { year: 2101, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 30], totalDays: 355, solarNewYear: '2101-01-31' },
  { year: 2102, leapMonth: 6, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2102-01-20' },
  { year: 2103, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29, 30], totalDays: 354, solarNewYear: '2103-02-08' },
  { year: 2104, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2104-01-29' },
  { year: 2105, leapMonth: 4, monthDays: [30, 29, 30, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30], totalDays: 384, solarNewYear: '2105-01-17' },
  { year: 2106, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 29, 30, 29, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2106-02-05' },
  { year: 2107, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 30], totalDays: 355, solarNewYear: '2107-01-26' },
  { year: 2108, leapMonth: 2, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2108-01-15' },
  { year: 2109, leapMonth: 0, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2109-02-02' },
  { year: 2110, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2110-01-23' },

  // 2111-2120
  { year: 2111, leapMonth: 6, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 384, solarNewYear: '2111-01-12' },
  { year: 2112, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2112-01-31' },
  { year: 2113, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '2113-01-19' },
  { year: 2114, leapMonth: 4, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30, 29], totalDays: 384, solarNewYear: '2114-02-07' },
  { year: 2115, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2115-01-28' },
  { year: 2116, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2116-01-17' },
  { year: 2117, leapMonth: 3, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30], totalDays: 384, solarNewYear: '2117-02-04' },
  { year: 2118, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 29], totalDays: 354, solarNewYear: '2118-01-25' },
  { year: 2119, leapMonth: 0, monthDays: [30, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 355, solarNewYear: '2119-01-14' },
  { year: 2120, leapMonth: 7, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 30, 29, 30, 29], totalDays: 384, solarNewYear: '2120-02-02' },

  // 2121-2130
  { year: 2121, leapMonth: 0, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 30, 29, 30], totalDays: 355, solarNewYear: '2121-01-22' },
  { year: 2122, leapMonth: 0, monthDays: [29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2122-02-10' },
  { year: 2123, leapMonth: 5, monthDays: [30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30, 30, 29], totalDays: 384, solarNewYear: '2123-01-30' },
  { year: 2124, leapMonth: 0, monthDays: [30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '2124-01-19' },
  { year: 2125, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30, 30], totalDays: 354, solarNewYear: '2125-02-06' },
  { year: 2126, leapMonth: 4, monthDays: [29, 30, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30, 30], totalDays: 385, solarNewYear: '2126-01-27' },
  { year: 2127, leapMonth: 0, monthDays: [29, 30, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2127-02-15' },
  { year: 2128, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2128-02-04' },
  { year: 2129, leapMonth: 2, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2129-01-23' },
  { year: 2130, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2130-02-11' },

  // 2131-2140
  { year: 2131, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2131-02-01' },
  { year: 2132, leapMonth: 6, monthDays: [29, 30, 29, 29, 30, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2132-01-21' },
  { year: 2133, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 30, 29, 30, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2133-02-08' },
  { year: 2134, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30], totalDays: 355, solarNewYear: '2134-01-29' },
  { year: 2135, leapMonth: 5, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '2135-01-18' },
  { year: 2136, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2136-02-06' },
  { year: 2137, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2137-01-26' },
  { year: 2138, leapMonth: 3, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 30], totalDays: 384, solarNewYear: '2138-01-15' },
  { year: 2139, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30], totalDays: 354, solarNewYear: '2139-02-03' },
  { year: 2140, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2140-01-24' },

  // 2141-2150
  { year: 2141, leapMonth: 7, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2141-01-12' },
  { year: 2142, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2142-01-31' },
  { year: 2143, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 355, solarNewYear: '2143-01-21' },
  { year: 2144, leapMonth: 5, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29, 30], totalDays: 384, solarNewYear: '2144-02-09' },
  { year: 2145, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], totalDays: 354, solarNewYear: '2145-01-28' },
  { year: 2146, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30, 29], totalDays: 354, solarNewYear: '2146-01-17' },
  { year: 2147, leapMonth: 3, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30, 29], totalDays: 384, solarNewYear: '2147-02-05' },
  { year: 2148, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2148-01-26' },
  { year: 2149, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2149-01-14' },
  { year: 2150, leapMonth: 8, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2150-02-02' },

  // 2151-2160
  { year: 2151, leapMonth: 0, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2151-01-23' },
  { year: 2152, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2152-01-12' },
  { year: 2153, leapMonth: 6, monthDays: [29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 384, solarNewYear: '2153-01-31' },
  { year: 2154, leapMonth: 0, monthDays: [29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2154-01-20' },
  { year: 2155, leapMonth: 0, monthDays: [30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '2155-02-08' },
  { year: 2156, leapMonth: 4, monthDays: [29, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30, 30, 30], totalDays: 385, solarNewYear: '2156-01-29' },
  { year: 2157, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30, 30], totalDays: 354, solarNewYear: '2157-02-16' },
  { year: 2158, leapMonth: 0, monthDays: [29, 30, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2158-02-05' },
  { year: 2159, leapMonth: 2, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2159-01-26' },
  { year: 2160, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2160-02-14' },

  // 2161-2170
  { year: 2161, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 29], totalDays: 354, solarNewYear: '2161-02-02' },
  { year: 2162, leapMonth: 6, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 30, 29, 30, 29, 29], totalDays: 384, solarNewYear: '2162-01-22' },
  { year: 2163, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 30, 29, 30, 29], totalDays: 355, solarNewYear: '2163-02-10' },
  { year: 2164, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30], totalDays: 355, solarNewYear: '2164-01-31' },
  { year: 2165, leapMonth: 5, monthDays: [29, 29, 30, 29, 30, 29, 29, 30, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '2165-01-19' },
  { year: 2166, leapMonth: 0, monthDays: [29, 29, 30, 29, 30, 29, 29, 30, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2166-02-07' },
  { year: 2167, leapMonth: 0, monthDays: [30, 29, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2167-01-28' },
  { year: 2168, leapMonth: 3, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2168-01-17' },
  { year: 2169, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2169-02-04' },
  { year: 2170, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 29], totalDays: 354, solarNewYear: '2170-01-24' },

  // 2171-2180
  { year: 2171, leapMonth: 7, monthDays: [30, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 29], totalDays: 384, solarNewYear: '2171-01-13' },
  { year: 2172, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], totalDays: 355, solarNewYear: '2172-02-01' },
  { year: 2173, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 355, solarNewYear: '2173-01-21' },
  { year: 2174, leapMonth: 5, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29, 30], totalDays: 384, solarNewYear: '2174-02-09' },
  { year: 2175, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], totalDays: 354, solarNewYear: '2175-01-29' },
  { year: 2176, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30, 29], totalDays: 354, solarNewYear: '2176-01-18' },
  { year: 2177, leapMonth: 4, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30], totalDays: 384, solarNewYear: '2177-02-05' },
  { year: 2178, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2178-01-26' },
  { year: 2179, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2179-01-15' },
  { year: 2180, leapMonth: 2, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2180-02-03' },

  // 2181-2190
  { year: 2181, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2181-01-23' },
  { year: 2182, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2182-02-11' },
  { year: 2183, leapMonth: 6, monthDays: [30, 30, 29, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 384, solarNewYear: '2183-01-31' },
  { year: 2184, leapMonth: 0, monthDays: [30, 30, 29, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2184-01-20' },
  { year: 2185, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2185-02-07' },
  { year: 2186, leapMonth: 5, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 384, solarNewYear: '2186-01-28' },
  { year: 2187, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30], totalDays: 355, solarNewYear: '2187-02-16' },
  { year: 2188, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '2188-02-06' },
  { year: 2189, leapMonth: 3, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2189-01-25' },
  { year: 2190, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '2190-02-13' },

  // 2191-2200
  { year: 2191, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 30, 29, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2191-02-02' },
  { year: 2192, leapMonth: 7, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 384, solarNewYear: '2192-01-22' },
  { year: 2193, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2193-02-09' },
  { year: 2194, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2194-01-30' },
  { year: 2195, leapMonth: 5, monthDays: [30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29], totalDays: 384, solarNewYear: '2195-01-19' },
  { year: 2196, leapMonth: 0, monthDays: [30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 355, solarNewYear: '2196-02-07' },
  { year: 2197, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29, 30], totalDays: 354, solarNewYear: '2197-01-27' },
  { year: 2198, leapMonth: 4, monthDays: [30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30], totalDays: 384, solarNewYear: '2198-01-16' },
  { year: 2199, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30], totalDays: 354, solarNewYear: '2198-02-04' },
  { year: 2200, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2200-01-24' },
];

/**
 * 특정 연도의 음력 데이터 조회
 */
export function getLunarYearData2101_2200(year: number): LunarYearData | undefined {
  return LUNAR_TABLE_2101_2200.find(data => data.year === year);
}
