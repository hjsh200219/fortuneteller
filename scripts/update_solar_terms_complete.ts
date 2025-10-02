/**
 * solar_terms_complete.ts 업데이트 스크립트
 * 2020-2030년 데이터로 업데이트
 */

import { SOLAR_TERMS_PRECISE } from '../src/data/solar_terms_precise.js';

const header = `/**
 * 24절기 완전 테이블 (2020-2030년)
 * 한국천문연구원(KASI) 데이터 기반
 * 시분초 단위 정확도 - 전체 24절기 포함
 */

import type { SolarTerm } from '../types/index.js';

export interface SolarTermComplete {
  year: number;
  term: SolarTerm;
  datetime: string; // ISO 8601 format
  timestamp: number; // Unix timestamp (milliseconds)
  solarLongitude: number; // 태양 황경 (도)
}

/**
 * 24절기 완전 데이터 (2020-2030년)
 * 각 절기의 정확한 시각과 태양 황경 포함
 */
export const SOLAR_TERMS_COMPLETE: SolarTermComplete[] = [
`;

// 절기명과 태양 황경 매핑
const solarLongitudeMap: Record<string, number> = {
  '입춘': 315,
  '우수': 330,
  '경칩': 345,
  '춘분': 0,
  '청명': 15,
  '곡우': 30,
  '입하': 45,
  '소만': 60,
  '망종': 75,
  '하지': 90,
  '소서': 105,
  '대서': 120,
  '입추': 135,
  '처서': 150,
  '백로': 165,
  '추분': 180,
  '한로': 195,
  '상강': 210,
  '입동': 225,
  '소설': 240,
  '대설': 255,
  '동지': 270,
  '소한': 285,
  '대한': 300,
};

// SOLAR_TERMS_PRECISE를 solarLongitude 포함 형태로 변환
const dataLines = SOLAR_TERMS_PRECISE.map(st => {
  const solarLongitude = solarLongitudeMap[st.term];
  return `  { year: ${st.year}, term: '${st.term}', datetime: '${st.datetime}', timestamp: ${st.timestamp}, solarLongitude: ${solarLongitude} },`;
}).join('\n');

const footer = `
];

/**
 * 특정 연도와 절기의 데이터 조회
 */
export function getSolarTerm(year: number, term: string): SolarTermComplete | undefined {
  return SOLAR_TERMS_COMPLETE.find((st) => st.year === year && st.term === term);
}

/**
 * 특정 연도의 모든 절기 조회
 */
export function getYearSolarTerms(year: number): SolarTermComplete[] {
  return SOLAR_TERMS_COMPLETE.filter((st) => st.year === year);
}

/**
 * 태양 황경으로 절기명 조회
 */
export function getSolarTermBySolarLongitude(solarLongitude: number): string | undefined {
  const term = SOLAR_TERMS_COMPLETE.find((st) => st.solarLongitude === solarLongitude);
  return term?.term;
}
`;

const content = header + dataLines + footer;

// 파일 저장
const fs = await import('fs/promises');
const path = await import('path');

const filePath = path.join(process.cwd(), 'src', 'data', 'solar_terms_complete.ts');
await fs.writeFile(filePath, content, 'utf-8');

console.log('✅ solar_terms_complete.ts 업데이트 완료 (2020-2030년)');
console.log(`📊 총 ${SOLAR_TERMS_PRECISE.length}개 항목`);
