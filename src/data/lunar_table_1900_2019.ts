/**
 * 음력 데이터 (1900-2019년)
 * 한국천문연구원(KASI) 기준 음력 계산 데이터
 */

export interface LunarYearData {
  year: number;
  leapMonth: number; // 0 = 윤달 없음, 1-12 = 해당 월 윤달
  monthDays: number[]; // 각 월의 일수 (평년 12개, 윤년 13개)
  totalDays: number; // 연 총 일수
  solarNewYear: string; // 음력 1월 1일의 양력 날짜 (ISO 8601)
}

export const LUNAR_TABLE_1900_2019: LunarYearData[] = [
  // 1900-1909
  { year: 1900, leapMonth: 8, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1900-01-31' },
  { year: 1901, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1901-02-19' },
  { year: 1902, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1902-02-08' },
  { year: 1903, leapMonth: 5, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1903-01-29' },
  { year: 1904, leapMonth: 0, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1904-02-16' },
  { year: 1905, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1905-02-04' },
  { year: 1906, leapMonth: 4, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 384, solarNewYear: '1906-01-25' },
  { year: 1907, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '1907-02-13' },
  { year: 1908, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '1908-02-02' },
  { year: 1909, leapMonth: 2, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30, 29], totalDays: 384, solarNewYear: '1909-01-22' },

  // 1910-1919
  { year: 1910, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '1910-02-10' },
  { year: 1911, leapMonth: 6, monthDays: [29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '1911-01-30' },
  { year: 1912, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '1912-02-18' },
  { year: 1913, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30], totalDays: 354, solarNewYear: '1913-02-06' },
  { year: 1914, leapMonth: 5, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29], totalDays: 384, solarNewYear: '1914-01-26' },
  { year: 1915, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 29], totalDays: 354, solarNewYear: '1915-02-14' },
  { year: 1916, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1916-02-03' },
  { year: 1917, leapMonth: 2, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1917-01-23' },
  { year: 1918, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1918-02-11' },
  { year: 1919, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 355, solarNewYear: '1919-02-01' },

  // 1920-1929
  { year: 1920, leapMonth: 8, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29, 30], totalDays: 384, solarNewYear: '1920-02-20' },
  { year: 1921, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], totalDays: 354, solarNewYear: '1921-02-08' },
  { year: 1922, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30, 29], totalDays: 354, solarNewYear: '1922-01-28' },
  { year: 1923, leapMonth: 5, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30], totalDays: 384, solarNewYear: '1923-02-16' },
  { year: 1924, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29], totalDays: 354, solarNewYear: '1924-02-05' },
  { year: 1925, leapMonth: 4, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1925-01-24' },
  { year: 1926, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29], totalDays: 354, solarNewYear: '1926-02-13' },
  { year: 1927, leapMonth: 0, monthDays: [30, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 355, solarNewYear: '1927-02-02' },
  { year: 1928, leapMonth: 2, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1928-01-23' },
  { year: 1929, leapMonth: 0, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1929-02-10' },

  // 1930-1939
  { year: 1930, leapMonth: 6, monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], totalDays: 384, solarNewYear: '1930-01-30' },
  { year: 1931, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1931-02-17' },
  { year: 1932, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '1932-02-06' },
  { year: 1933, leapMonth: 5, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], totalDays: 384, solarNewYear: '1933-01-26' },
  { year: 1934, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '1934-02-14' },
  { year: 1935, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30], totalDays: 354, solarNewYear: '1935-02-04' },
  { year: 1936, leapMonth: 3, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30], totalDays: 384, solarNewYear: '1936-01-24' },
  { year: 1937, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30], totalDays: 354, solarNewYear: '1937-02-11' },
  { year: 1938, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1938-01-31' },
  { year: 1939, leapMonth: 7, monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 384, solarNewYear: '1939-02-19' },

  // 1940-1949
  { year: 1940, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1940-02-08' },
  { year: 1941, leapMonth: 6, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1941-01-27' },
  { year: 1942, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1942-02-15' },
  { year: 1943, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30], totalDays: 355, solarNewYear: '1943-02-05' },
  { year: 1944, leapMonth: 4, monthDays: [29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '1944-01-25' },
  { year: 1945, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30], totalDays: 354, solarNewYear: '1945-02-13' },
  { year: 1946, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '1946-02-02' },
  { year: 1947, leapMonth: 2, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '1947-01-22' },
  { year: 1948, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 29, 30], totalDays: 354, solarNewYear: '1948-02-10' },
  { year: 1949, leapMonth: 7, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1949-01-29' },

  // 1950-1959
  { year: 1950, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 29], totalDays: 354, solarNewYear: '1950-02-17' },
  { year: 1951, leapMonth: 0, monthDays: [30, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 355, solarNewYear: '1951-02-06' },
  { year: 1952, leapMonth: 5, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1952-01-27' },
  { year: 1953, leapMonth: 0, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1953-02-14' },
  { year: 1954, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1954-02-03' },
  { year: 1955, leapMonth: 3, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 384, solarNewYear: '1955-01-24' },
  { year: 1956, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '1956-02-12' },
  { year: 1957, leapMonth: 8, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], totalDays: 384, solarNewYear: '1957-01-31' },
  { year: 1958, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '1958-02-18' },
  { year: 1959, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30], totalDays: 354, solarNewYear: '1959-02-08' },

  // 1960-1969
  { year: 1960, leapMonth: 6, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30], totalDays: 384, solarNewYear: '1960-01-28' },
  { year: 1961, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30], totalDays: 354, solarNewYear: '1961-02-15' },
  { year: 1962, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1962-02-05' },
  { year: 1963, leapMonth: 4, monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 384, solarNewYear: '1963-01-25' },
  { year: 1964, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1964-02-13' },
  { year: 1965, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1965-02-02' },
  { year: 1966, leapMonth: 3, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 384, solarNewYear: '1966-01-21' },
  { year: 1967, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30], totalDays: 355, solarNewYear: '1966-02-09' },
  { year: 1968, leapMonth: 7, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '1968-01-30' },
  { year: 1969, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '1969-02-17' },

  // 1970-1979
  { year: 1970, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 354, solarNewYear: '1970-02-06' },
  { year: 1971, leapMonth: 5, monthDays: [30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30], totalDays: 384, solarNewYear: '1971-01-27' },
  { year: 1972, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 29, 30], totalDays: 354, solarNewYear: '1972-02-15' },
  { year: 1973, leapMonth: 0, monthDays: [30, 30, 29, 30, 30, 29, 30, 29, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1973-02-03' },
  { year: 1974, leapMonth: 4, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1974-01-23' },
  { year: 1975, leapMonth: 0, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1975-02-11' },
  { year: 1976, leapMonth: 8, monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], totalDays: 384, solarNewYear: '1976-01-31' },
  { year: 1977, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1977-02-18' },
  { year: 1978, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '1978-02-07' },
  { year: 1979, leapMonth: 6, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], totalDays: 384, solarNewYear: '1979-01-28' },

  // 1980-1989
  { year: 1980, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '1980-02-16' },
  { year: 1981, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30], totalDays: 354, solarNewYear: '1981-02-05' },
  { year: 1982, leapMonth: 4, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30], totalDays: 384, solarNewYear: '1982-01-25' },
  { year: 1983, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30], totalDays: 354, solarNewYear: '1983-02-13' },
  { year: 1984, leapMonth: 10, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1984-02-02' },
  { year: 1985, leapMonth: 0, monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1985-02-20' },
  { year: 1986, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '1986-02-09' },
  { year: 1987, leapMonth: 6, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1987-01-29' },
  { year: 1988, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1988-02-17' },
  { year: 1989, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30], totalDays: 355, solarNewYear: '1989-02-06' },

  // 1990-1999
  { year: 1990, leapMonth: 5, monthDays: [29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30, 30], totalDays: 384, solarNewYear: '1990-01-27' },
  { year: 1991, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30], totalDays: 354, solarNewYear: '1991-02-15' },
  { year: 1992, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 354, solarNewYear: '1992-02-04' },
  { year: 1993, leapMonth: 3, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30], totalDays: 384, solarNewYear: '1993-01-23' },
  { year: 1994, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 29, 30], totalDays: 354, solarNewYear: '1994-02-10' },
  { year: 1995, leapMonth: 8, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1995-01-31' },
  { year: 1996, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 29], totalDays: 354, solarNewYear: '1996-02-19' },
  { year: 1997, leapMonth: 0, monthDays: [30, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 355, solarNewYear: '1997-02-07' },
  { year: 1998, leapMonth: 5, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '1998-01-28' },
  { year: 1999, leapMonth: 0, monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '1999-02-16' },

  // 2000-2009
  { year: 2000, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2000-02-05' },
  { year: 2001, leapMonth: 4, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 384, solarNewYear: '2001-01-24' },
  { year: 2002, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2002-02-12' },
  { year: 2003, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '2003-02-01' },
  { year: 2004, leapMonth: 2, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30, 29], totalDays: 384, solarNewYear: '2004-01-22' },
  { year: 2005, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 29], totalDays: 354, solarNewYear: '2005-02-09' },
  { year: 2006, leapMonth: 7, monthDays: [30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2006-01-29' },
  { year: 2007, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2007-02-18' },
  { year: 2008, leapMonth: 0, monthDays: [30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], totalDays: 355, solarNewYear: '2008-02-07' },
  { year: 2009, leapMonth: 5, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], totalDays: 384, solarNewYear: '2009-01-26' },

  // 2010-2019
  { year: 2010, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2010-02-14' },
  { year: 2011, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 30, 29, 30, 30, 29, 30], totalDays: 355, solarNewYear: '2011-02-03' },
  { year: 2012, leapMonth: 3, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29, 30], totalDays: 384, solarNewYear: '2012-01-23' },
  { year: 2013, leapMonth: 0, monthDays: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], totalDays: 354, solarNewYear: '2013-02-10' },
  { year: 2014, leapMonth: 9, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], totalDays: 384, solarNewYear: '2014-01-31' },
  { year: 2015, leapMonth: 0, monthDays: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], totalDays: 355, solarNewYear: '2015-02-19' },
  { year: 2016, leapMonth: 0, monthDays: [29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30], totalDays: 354, solarNewYear: '2016-02-08' },
  { year: 2017, leapMonth: 5, monthDays: [30, 29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30], totalDays: 384, solarNewYear: '2017-01-28' },
  { year: 2018, leapMonth: 0, monthDays: [30, 29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30], totalDays: 354, solarNewYear: '2018-02-16' },
  { year: 2019, leapMonth: 0, monthDays: [30, 29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29], totalDays: 354, solarNewYear: '2019-02-05' },
];

/**
 * 특정 연도의 음력 데이터 조회
 */
export function getLunarYearData1900_2019(year: number): LunarYearData | undefined {
  return LUNAR_TABLE_1900_2019.find(data => data.year === year);
}
