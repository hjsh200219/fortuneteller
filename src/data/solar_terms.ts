/**
 * 24절기(二十四節氣) 통합 테이블 (1900-2200)
 * 사주 계산에서 월주를 정하는데 중요한 기준
 *
 * 연도별 테이블:
 * - 1900-2019: solar_terms_1900_2019.ts (Jean Meeus 알고리즘)
 * - 2020-2030: solar_terms_complete.ts (Jean Meeus 알고리즘)
 * - 2031-2100: solar_terms_2031_2100.ts (Jean Meeus 알고리즘)
 * - 2101-2200: solar_terms_2101_2200.ts (Jean Meeus 알고리즘)
 */

import { formatInTimeZone } from 'date-fns-tz';
import type { SolarTerm } from '../types/index.js';
import { SOLAR_TERMS_1900_2019, type SolarTermComplete } from './solar_terms_1900_2019.js';
import { SOLAR_TERMS_COMPLETE } from './solar_terms_complete.js';
import { SOLAR_TERMS_2031_2100 } from './solar_terms_2031_2100.js';
import { SOLAR_TERMS_2101_2200 } from './solar_terms_2101_2200.js';

export type { SolarTermComplete };

export interface SolarTermData {
  name: SolarTerm;
  hanja: string;
  month: number; // 양력 대략 월
  description: string;
}

export const SOLAR_TERMS: SolarTermData[] = [
  { name: '입춘', hanja: '立春', month: 2, description: '봄의 시작' },
  { name: '우수', hanja: '雨水', month: 2, description: '눈이 녹아 비가 됨' },
  { name: '경칩', hanja: '驚蟄', month: 3, description: '개구리가 겨울잠에서 깸' },
  { name: '춘분', hanja: '春分', month: 3, description: '낮과 밤의 길이가 같음' },
  { name: '청명', hanja: '淸明', month: 4, description: '날씨가 맑고 따뜻함' },
  { name: '곡우', hanja: '穀雨', month: 4, description: '농사를 시작하는 비' },
  { name: '입하', hanja: '立夏', month: 5, description: '여름의 시작' },
  { name: '소만', hanja: '小滿', month: 5, description: '만물이 점차 자람' },
  { name: '망종', hanja: '芒種', month: 6, description: '곡식의 씨를 뿌림' },
  { name: '하지', hanja: '夏至', month: 6, description: '일년 중 낮이 가장 김' },
  { name: '소서', hanja: '小暑', month: 7, description: '본격적인 더위 시작' },
  { name: '대서', hanja: '大暑', month: 7, description: '가장 더운 시기' },
  { name: '입추', hanja: '立秋', month: 8, description: '가을의 시작' },
  { name: '처서', hanja: '處暑', month: 8, description: '더위가 그침' },
  { name: '백로', hanja: '白露', month: 9, description: '이슬이 맺히기 시작' },
  { name: '추분', hanja: '秋分', month: 9, description: '낮과 밤의 길이가 같음' },
  { name: '한로', hanja: '寒露', month: 10, description: '찬 이슬이 맺힘' },
  { name: '상강', hanja: '霜降', month: 10, description: '서리가 내리기 시작' },
  { name: '입동', hanja: '立冬', month: 11, description: '겨울의 시작' },
  { name: '소설', hanja: '小雪', month: 11, description: '첫눈이 내림' },
  { name: '대설', hanja: '大雪', month: 12, description: '눈이 많이 내림' },
  { name: '동지', hanja: '冬至', month: 12, description: '일년 중 밤이 가장 김' },
  { name: '소한', hanja: '小寒', month: 1, description: '작은 추위' },
  { name: '대한', hanja: '大寒', month: 1, description: '가장 추운 시기' },
];

/**
 * 특정 연도의 24절기 날짜 계산
 * 간략한 근사식 사용 (정확도: ±1일)
 */
export interface SolarTermDate {
  term: SolarTerm;
  date: Date;
}

/**
 * 24절기 대략적인 날짜 (양력)
 * 실제로는 매년 조금씩 달라지므로 정밀한 계산이 필요
 */
export const SOLAR_TERM_APPROXIMATE_DATES: Record<SolarTerm, [number, number]> = {
  입춘: [2, 4],
  우수: [2, 19],
  경칩: [3, 6],
  춘분: [3, 21],
  청명: [4, 5],
  곡우: [4, 20],
  입하: [5, 6],
  소만: [5, 21],
  망종: [6, 6],
  하지: [6, 21],
  소서: [7, 7],
  대서: [7, 23],
  입추: [8, 8],
  처서: [8, 23],
  백로: [9, 8],
  추분: [9, 23],
  한로: [10, 8],
  상강: [10, 23],
  입동: [11, 7],
  소설: [11, 22],
  대설: [12, 7],
  동지: [12, 22],
  소한: [1, 6],
  대한: [1, 20],
};

/**
 * datetime 문자열에서 올바른 UTC timestamp를 계산
 * 원본 데이터의 timestamp가 KST offset(+09:00)을 무시하고 저장된 문제 보정
 */
function correctTimestamp(term: SolarTermComplete): SolarTermComplete {
  const corrected = new Date(term.datetime).getTime();
  if (corrected !== term.timestamp) {
    return { ...term, timestamp: corrected };
  }
  return term;
}

// 보정된 데이터 캐시
const correctedCache = new Map<number, SolarTermComplete[]>();

/**
 * 연도별 절기 데이터 조회 (자동 분기, timestamp 보정 적용)
 */
export function getSolarTermsForYear(year: number): SolarTermComplete[] {
  const cached = correctedCache.get(year);
  if (cached) return cached;

  let raw: SolarTermComplete[];

  // 1900-2019
  if (year >= 1900 && year <= 2019) {
    raw = SOLAR_TERMS_1900_2019.filter((data) => data.year === year);
  } else if (year >= 2020 && year <= 2030) {
    raw = SOLAR_TERMS_COMPLETE.filter((data) => data.year === year);
  } else if (year >= 2031 && year <= 2100) {
    raw = SOLAR_TERMS_2031_2100.filter((data) => data.year === year);
  } else if (year >= 2101 && year <= 2200) {
    raw = SOLAR_TERMS_2101_2200.filter((data) => data.year === year);
  } else {
    return [];
  }

  const corrected = raw.map(correctTimestamp);
  correctedCache.set(year, corrected);
  return corrected;
}

const SEOUL_TZ = 'Asia/Seoul';

/**
 * 24절기 중 **절(節)** 12개 — 월건(月建)·대운 기산에 쓰임. **기(氣)**(우수·춘분 등)는 제외.
 */
export const SOLAR_TERMS_JIE: SolarTerm[] = [
  '입춘',
  '경칩',
  '청명',
  '입하',
  '망종',
  '소서',
  '입추',
  '백로',
  '한로',
  '입동',
  '소설',
  '대설',
];

const JIE_SET = new Set<SolarTerm>(SOLAR_TERMS_JIE);

function isJieTerm(term: SolarTerm): boolean {
  return JIE_SET.has(term);
}

/**
 * 출생 시각 **이전**(포함)의 가장 최근 절기 — 1900-2200 통합 테이블
 */
export function getPreviousSolarTermByInstant(date: Date): SolarTermComplete | null {
  const timestamp = date.getTime();
  const seoulYear = parseInt(formatInTimeZone(date, SEOUL_TZ, 'yyyy'), 10);
  const minY = Math.max(1900, seoulYear - 1);
  const maxY = Math.min(2200, seoulYear + 1);
  const allTerms: SolarTermComplete[] = [];
  for (let y = minY; y <= maxY; y++) {
    allTerms.push(...getSolarTermsForYear(y));
  }
  const before = allTerms.filter((t) => t.timestamp <= timestamp);
  if (before.length === 0) {
    return null;
  }
  return before.reduce((latest, cur) => (cur.timestamp > latest.timestamp ? cur : latest));
}

/**
 * 출생 시각 **이후**의 가장 이른 절기 — 1900-2200 통합 테이블 (대운 순행 기산 등)
 */
export function getNextSolarTermByInstant(date: Date): SolarTermComplete | null {
  const timestamp = date.getTime();
  const seoulYear = parseInt(formatInTimeZone(date, SEOUL_TZ, 'yyyy'), 10);
  const minY = Math.max(1900, seoulYear - 1);
  const maxY = Math.min(2200, seoulYear + 1);
  const allTerms: SolarTermComplete[] = [];
  for (let y = minY; y <= maxY; y++) {
    allTerms.push(...getSolarTermsForYear(y));
  }
  const after = allTerms.filter((t) => t.timestamp > timestamp);
  if (after.length === 0) {
    return null;
  }
  return after.reduce((earliest, cur) => (cur.timestamp < earliest.timestamp ? cur : earliest));
}

/**
 * **절(節)만** — 출생 이전의 가장 최근 절(대운 역행 기산용. 대서·우수 등 기(氣)는 제외)
 */
export function getPreviousJieSolarTermByInstant(date: Date): SolarTermComplete | null {
  const timestamp = date.getTime();
  const seoulYear = parseInt(formatInTimeZone(date, SEOUL_TZ, 'yyyy'), 10);
  const minY = Math.max(1900, seoulYear - 1);
  const maxY = Math.min(2200, seoulYear + 1);
  const allTerms: SolarTermComplete[] = [];
  for (let y = minY; y <= maxY; y++) {
    allTerms.push(...getSolarTermsForYear(y).filter((t) => isJieTerm(t.term)));
  }
  const before = allTerms.filter((t) => t.timestamp <= timestamp);
  if (before.length === 0) {
    return null;
  }
  return before.reduce((latest, cur) => (cur.timestamp > latest.timestamp ? cur : latest));
}

/**
 * **절(節)만** — 출생 이후의 가장 이른 절(대운 순행 기산용)
 */
export function getNextJieSolarTermByInstant(date: Date): SolarTermComplete | null {
  const timestamp = date.getTime();
  const seoulYear = parseInt(formatInTimeZone(date, SEOUL_TZ, 'yyyy'), 10);
  const minY = Math.max(1900, seoulYear - 1);
  const maxY = Math.min(2200, seoulYear + 1);
  const allTerms: SolarTermComplete[] = [];
  for (let y = minY; y <= maxY; y++) {
    allTerms.push(...getSolarTermsForYear(y).filter((t) => isJieTerm(t.term)));
  }
  const after = allTerms.filter((t) => t.timestamp > timestamp);
  if (after.length === 0) {
    return null;
  }
  return after.reduce((earliest, cur) => (cur.timestamp < earliest.timestamp ? cur : earliest));
}

/**
 * 특정 날짜에 가장 가까운 절기 조회 (정밀)
 */
export function getNearestSolarTerm(date: Date): SolarTermComplete | null {
  const year = date.getFullYear();
  const timestamp = date.getTime();

  const yearTerms = getSolarTermsForYear(year);
  const prevYearTerms = getSolarTermsForYear(year - 1);
  const nextYearTerms = getSolarTermsForYear(year + 1);

  // 전년도 마지막 절기들 + 올해 절기들 + 다음년도 초기 절기들
  const allTerms = [...prevYearTerms.slice(-3), ...yearTerms, ...nextYearTerms.slice(0, 3)];

  if (allTerms.length === 0) {
    return null;
  }

  // 가장 가까운 절기 찾기
  let nearest = allTerms[0]!;
  let minDiff = Math.abs(timestamp - nearest.timestamp);

  for (const term of allTerms) {
    const diff = Math.abs(timestamp - term.timestamp);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = term;
    }
  }

  return nearest;
}

/**
 * 특정 날짜가 어느 절기와 절기 사이인지 판단 (정밀)
 */
export function getCurrentSolarTermPrecise(date: Date): SolarTerm {
  const year = date.getFullYear();
  const timestamp = date.getTime();

  const yearTerms = getSolarTermsForYear(year);
  const prevYearTerms = getSolarTermsForYear(year - 1);

  // 전년도 마지막 절기 포함 (연초 계산용)
  const allTerms = [...prevYearTerms.slice(-2), ...yearTerms];

  if (allTerms.length === 0) {
    return '입춘'; // 기본값
  }

  // 현재 시각 이전의 가장 최근 절기 찾기
  let currentTerm = allTerms[0]!;
  for (const term of allTerms) {
    if (term.timestamp <= timestamp) {
      currentTerm = term;
    } else {
      break;
    }
  }

  return currentTerm.term;
}

/**
 * 특정 날짜가 어느 절기와 절기 사이인지 판단 (근사)
 * 주의: 이 함수는 ±1일 오차가 있으므로 정밀 계산에는 getCurrentSolarTermPrecise 사용
 */
export function getCurrentSolarTerm(date: Date): SolarTerm {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 날짜를 월*100+일 형태의 숫자로 변환하여 비교
  const dateNum = month * 100 + day;

  // 각 절기의 대략적 시작일을 숫자로 변환
  const termNums: Array<{ name: SolarTerm; num: number }> = SOLAR_TERMS.map((t) => {
    const [m, d] = SOLAR_TERM_APPROXIMATE_DATES[t.name]!;
    return { name: t.name, num: m * 100 + d };
  });

  // 12월-1월 순환 처리: 동지(12/22) 이후 ~ 소한(1/6) 이전은 동지
  // 대한(1/20) 이후 ~ 입춘(2/4) 이전은 대한
  // 소한(1/6) 이후 ~ 대한(1/20) 이전은 소한

  // 연말 (12월 동지 이후)
  const dongji = SOLAR_TERM_APPROXIMATE_DATES['동지']!;
  if (month === 12 && day >= dongji[1]) {
    return '동지';
  }

  // 연초 (1월)
  const sohan = SOLAR_TERM_APPROXIMATE_DATES['소한']!;
  const daehan = SOLAR_TERM_APPROXIMATE_DATES['대한']!;
  const ipchun = SOLAR_TERM_APPROXIMATE_DATES['입춘']!;
  if (month === 1) {
    if (day < sohan[1]) return '동지';
    if (day < daehan[1]) return '소한';
    return '대한';
  }

  // 2월 입춘 이전
  if (month === 2 && day < ipchun[1]) {
    return '대한';
  }

  // 나머지: 입춘(2월)부터 대설(12월)까지 순차 비교
  for (let i = 0; i < termNums.length; i++) {
    const current = termNums[i]!;
    const next = termNums[(i + 1) % termNums.length]!;

    // 소한/대한은 위에서 이미 처리
    if (current.name === '소한' || current.name === '대한') continue;

    if (dateNum >= current.num && (next.num > current.num ? dateNum < next.num : true)) {
      return current.name;
    }
  }

  return '입춘';
}

/**
 * 절기로부터 월주의 지지 인덱스 얻기
 * 입춘부터 시작 (인월, 寅月)
 */
export function getSolarTermMonthIndex(term: SolarTerm): number {
  const termIndex = SOLAR_TERMS.findIndex((t) => t.name === term);
  // 입춘(0)부터 시작, 2개 절기당 1개월
  return Math.floor(termIndex / 2);
}

/**
 * 특정 날짜의 직전 절기 조회 (1900-2200 전체 범위)
 * 대운 계산용
 */
export function getPreviousSolarTerm(date: Date): SolarTermComplete | null {
  const year = date.getFullYear();
  const timestamp = date.getTime();

  // 현재 연도 + 전년도 절기 데이터 조회
  const yearTerms = getSolarTermsForYear(year);
  const prevYearTerms = getSolarTermsForYear(year - 1);

  const allTerms = [...prevYearTerms, ...yearTerms];

  // 날짜 이전의 절기들 중 가장 최근 것 찾기
  let latest: SolarTermComplete | null = null;
  for (const term of allTerms) {
    if (term.timestamp <= timestamp) {
      if (!latest || term.timestamp > latest.timestamp) {
        latest = term;
      }
    }
  }

  return latest;
}

/**
 * 특정 날짜의 다음 절기 조회 (1900-2200 전체 범위)
 * 대운 계산용
 */
export function getNextSolarTerm(date: Date): SolarTermComplete | null {
  const year = date.getFullYear();
  const timestamp = date.getTime();

  // 현재 연도 + 다음 연도 절기 데이터 조회
  const yearTerms = getSolarTermsForYear(year);
  const nextYearTerms = getSolarTermsForYear(year + 1);

  const allTerms = [...yearTerms, ...nextYearTerms];

  // 날짜 이후의 절기들 중 가장 가까운 것 찾기
  let earliest: SolarTermComplete | null = null;
  for (const term of allTerms) {
    if (term.timestamp > timestamp) {
      if (!earliest || term.timestamp < earliest.timestamp) {
        earliest = term;
      }
    }
  }

  return earliest;
}

