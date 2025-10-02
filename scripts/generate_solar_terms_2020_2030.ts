/**
 * 2020-2030년 완전한 24절기 데이터 생성
 * Jean Meeus 알고리즘 기반
 */

import type { SolarTerm } from '../src/types/index.js';

interface SolarTermData {
  year: number;
  term: SolarTerm;
  datetime: string;
  timestamp: number;
  solarLongitude: number;
}

const SOLAR_TERMS_MAP: Array<{ term: SolarTerm; longitude: number }> = [
  { term: '입춘', longitude: 315 },
  { term: '우수', longitude: 330 },
  { term: '경칩', longitude: 345 },
  { term: '춘분', longitude: 0 },
  { term: '청명', longitude: 15 },
  { term: '곡우', longitude: 30 },
  { term: '입하', longitude: 45 },
  { term: '소만', longitude: 60 },
  { term: '망종', longitude: 75 },
  { term: '하지', longitude: 90 },
  { term: '소서', longitude: 105 },
  { term: '대서', longitude: 120 },
  { term: '입추', longitude: 135 },
  { term: '처서', longitude: 150 },
  { term: '백로', longitude: 165 },
  { term: '추분', longitude: 180 },
  { term: '한로', longitude: 195 },
  { term: '상강', longitude: 210 },
  { term: '입동', longitude: 225 },
  { term: '소설', longitude: 240 },
  { term: '대설', longitude: 255 },
  { term: '동지', longitude: 270 },
  { term: '소한', longitude: 285 },
  { term: '대한', longitude: 300 },
];

function toJulianDay(year: number, month: number, day: number, hour: number = 12): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);

  const JD = Math.floor(365.25 * (year + 4716)) +
             Math.floor(30.6001 * (month + 1)) +
             day + B - 1524.5 + (hour / 24);

  return JD;
}

function fromJulianDay(JD: number): { year: number; month: number; day: number; hour: number; minute: number } {
  JD += 0.5;
  const Z = Math.floor(JD);
  const F = JD - Z;

  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }

  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  const fractionalDay = F;
  const hour = Math.floor(fractionalDay * 24);
  const minute = Math.round((fractionalDay * 24 - hour) * 60);

  return { year, month, day, hour, minute };
}

function calculateSolarLongitude(JD: number): number {
  const T = (JD - 2451545.0) / 36525.0;

  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const M_rad = M * Math.PI / 180;

  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_rad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad) +
            0.000289 * Math.sin(3 * M_rad);

  let longitude = (L0 + C) % 360;
  if (longitude < 0) longitude += 360;

  return longitude;
}

function findSolarTermJD(year: number, targetLongitude: number): number {
  const approximateMonth = Math.floor(targetLongitude / 30) + 3;
  let month = approximateMonth > 12 ? approximateMonth - 12 : approximateMonth;
  if (targetLongitude >= 270 && targetLongitude < 360) {
    year -= 1;
    month += 12;
  }

  let JD = toJulianDay(year, month, 1);

  for (let i = 0; i < 10; i++) {
    const currentLongitude = calculateSolarLongitude(JD);

    let diff = targetLongitude - currentLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.00001) break;

    JD += diff / 0.9856;
  }

  return JD;
}

function generateSolarTermsForYear(year: number): SolarTermData[] {
  const terms: SolarTermData[] = [];

  for (const { term, longitude } of SOLAR_TERMS_MAP) {
    const JD = findSolarTermJD(year, longitude);
    const date = fromJulianDay(JD);

    const utcDate = new Date(Date.UTC(
      date.year,
      date.month - 1,
      date.day,
      date.hour,
      date.minute
    ));

    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    const datetime = kstDate.toISOString().replace('Z', '+09:00').slice(0, 19) + '+09:00';

    terms.push({
      year,
      term,
      datetime,
      timestamp: kstDate.getTime(),
      solarLongitude: longitude,
    });
  }

  terms.sort((a, b) => a.timestamp - b.timestamp);

  return terms;
}

async function main() {
  console.log('🌅 2020-2030년 24절기 데이터 생성 시작...\n');

  const fs = await import('fs/promises');
  const path = await import('path');

  const allTerms: SolarTermData[] = [];

  for (let year = 2020; year <= 2030; year++) {
    allTerms.push(...generateSolarTermsForYear(year));
    console.log(`  ${year}년 완료`);
  }

  const header = `/**
 * 24절기 완전 테이블 (2020-2030년)
 * Jean Meeus 알고리즘 기반 천문 계산
 * 시분 단위 정확도 - 전체 24절기 포함
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

  const dataLines = allTerms.map(t =>
    `  { year: ${t.year}, term: '${t.term}', datetime: '${t.datetime}', timestamp: ${t.timestamp}, solarLongitude: ${t.solarLongitude} },`
  ).join('\n');

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

  const dataDir = path.join(process.cwd(), 'src', 'data');
  await fs.writeFile(path.join(dataDir, 'solar_terms_complete.ts'), content, 'utf-8');

  console.log('\n✅ solar_terms_complete.ts 생성 완료');
  console.log(`📊 총 ${allTerms.length}개 항목 (2020-2030년, 11년 × 24절기)`);
}

main().catch(console.error);
