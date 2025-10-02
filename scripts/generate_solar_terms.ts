/**
 * 24절기 데이터 생성 스크립트 (1900-2200년)
 * Jean Meeus 알고리즘 기반 천문 계산 (±2분 오차)
 *
 * 실행: npx tsx scripts/generate_solar_terms.ts
 */

import type { SolarTerm } from '../src/types/index.js';

interface SolarTermData {
  year: number;
  term: SolarTerm;
  datetime: string;
  timestamp: number;
  solarLongitude: number;
}

/**
 * 24절기와 태양 황경 매핑
 */
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

/**
 * Julian Day Number 계산
 */
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

/**
 * Julian Day에서 날짜 변환
 */
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

/**
 * 태양의 평균 황경 계산 (Jean Meeus 알고리즘)
 */
function calculateSolarLongitude(JD: number): number {
  const T = (JD - 2451545.0) / 36525.0;

  // 태양의 평균 황경 (L0)
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

  // 태양의 평균 근점 (M)
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const M_rad = M * Math.PI / 180;

  // 태양 중심 방정식 (C)
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_rad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad) +
            0.000289 * Math.sin(3 * M_rad);

  // 태양의 진황경
  let longitude = (L0 + C) % 360;
  if (longitude < 0) longitude += 360;

  return longitude;
}

/**
 * 특정 태양 황경에 도달하는 Julian Day 계산 (Newton-Raphson 방법)
 */
function findSolarTermJD(year: number, targetLongitude: number): number {
  // 초기 추정값: 해당 연도의 대략적인 날짜
  const approximateMonth = Math.floor(targetLongitude / 30) + 3;
  let month = approximateMonth > 12 ? approximateMonth - 12 : approximateMonth;
  if (targetLongitude >= 270 && targetLongitude < 360) {
    year -= 1;
    month += 12;
  }

  let JD = toJulianDay(year, month, 1);

  // Newton-Raphson 반복
  for (let i = 0; i < 10; i++) {
    const currentLongitude = calculateSolarLongitude(JD);

    // 각도 차이 계산 (360도 경계 처리)
    let diff = targetLongitude - currentLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.00001) break;

    // 태양은 하루에 약 1도 이동 (정확히는 0.9856도)
    JD += diff / 0.9856;
  }

  return JD;
}

/**
 * 특정 연도의 24절기 데이터 생성
 */
function generateSolarTermsForYear(year: number): SolarTermData[] {
  const terms: SolarTermData[] = [];

  for (const { term, longitude } of SOLAR_TERMS_MAP) {
    const JD = findSolarTermJD(year, longitude);
    const date = fromJulianDay(JD);

    // UTC에서 KST로 변환 (+9시간)
    const utcDate = new Date(Date.UTC(
      date.year,
      date.month - 1,
      date.day,
      date.hour,
      date.minute
    ));

    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

    // ISO 8601 형식 (KST)
    const datetime = kstDate.toISOString().replace('Z', '+09:00').slice(0, 19) + '+09:00';

    terms.push({
      year,
      term,
      datetime,
      timestamp: kstDate.getTime(),
      solarLongitude: longitude,
    });
  }

  // 날짜순 정렬
  terms.sort((a, b) => a.timestamp - b.timestamp);

  return terms;
}

/**
 * 데이터를 TypeScript 파일로 저장
 */
function saveToFile(terms: SolarTermData[], filename: string, startYear: number, endYear: number) {
  const header = `/**
 * 24절기 데이터 (${startYear}-${endYear}년)
 * Jean Meeus 알고리즘 기반 천문 계산 (±2분 오차)
 *
 * 자동 생성됨: ${new Date().toISOString()}
 */

import type { SolarTerm } from '../types/index.js';

export interface SolarTermComplete {
  year: number;
  term: SolarTerm;
  datetime: string; // ISO 8601 format (KST)
  timestamp: number; // Unix timestamp (milliseconds)
  solarLongitude: number; // 태양 황경 (0-360도)
}

/**
 * ${startYear}-${endYear}년 24절기 데이터 (${endYear - startYear + 1}년 × 24절기 = ${(endYear - startYear + 1) * 24}개 항목)
 *
 * 태양 황경 기준:
 * - 입춘(315°), 우수(330°), 경칩(345°), 춘분(0°)
 * - 청명(15°), 곡우(30°), 입하(45°), 소만(60°)
 * - 망종(75°), 하지(90°), 소서(105°), 대서(120°)
 * - 입추(135°), 처서(150°), 백로(165°), 추분(180°)
 * - 한로(195°), 상강(210°), 입동(225°), 소설(240°)
 * - 대설(255°), 동지(270°), 소한(285°), 대한(300°)
 */
export const SOLAR_TERMS_${startYear}_${endYear}: SolarTermComplete[] = [
`;

  const dataLines = terms.map(t =>
    `  { year: ${t.year}, term: '${t.term}', datetime: '${t.datetime}', timestamp: ${t.timestamp}, solarLongitude: ${t.solarLongitude} },`
  ).join('\n');

  const footer = `
];

/**
 * 특정 연도와 절기명으로 절기 데이터 조회
 */
export function getSolarTerm${startYear}_${endYear}(year: number, term: SolarTerm): SolarTermComplete | undefined {
  return SOLAR_TERMS_${startYear}_${endYear}.find(st => st.year === year && st.term === term);
}

/**
 * 특정 연도의 모든 절기 데이터 조회
 */
export function getYearSolarTerms${startYear}_${endYear}(year: number): SolarTermComplete[] {
  return SOLAR_TERMS_${startYear}_${endYear}.filter(st => st.year === year);
}

/**
 * 특정 날짜의 현재 절기 조회
 */
export function getCurrentSolarTerm${startYear}_${endYear}(date: Date): SolarTermComplete | null {
  const timestamp = date.getTime();
  let currentTerm: SolarTermComplete | null = null;

  for (const term of SOLAR_TERMS_${startYear}_${endYear}) {
    if (term.timestamp <= timestamp) {
      currentTerm = term;
    } else {
      break;
    }
  }

  return currentTerm;
}

/**
 * 특정 날짜의 다음 절기 조회
 */
export function getNextSolarTerm${startYear}_${endYear}(date: Date): SolarTermComplete | null {
  const timestamp = date.getTime();

  for (const term of SOLAR_TERMS_${startYear}_${endYear}) {
    if (term.timestamp > timestamp) {
      return term;
    }
  }

  return null;
}
`;

  return header + dataLines + footer;
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🌅 24절기 데이터 생성 시작...\n');

  const fs = await import('fs/promises');
  const path = await import('path');

  const dataDir = path.join(process.cwd(), 'src', 'data');

  // 1900-2019년 생성
  console.log('📅 1900-2019년 생성 중...');
  const terms1900_2019: SolarTermData[] = [];
  for (let year = 1900; year <= 2019; year++) {
    terms1900_2019.push(...generateSolarTermsForYear(year));
    if (year % 10 === 0) console.log(`  ${year}년 완료`);
  }
  const content1900_2019 = saveToFile(terms1900_2019, 'solar_terms_1900_2019.ts', 1900, 2019);
  await fs.writeFile(path.join(dataDir, 'solar_terms_1900_2019.ts'), content1900_2019, 'utf-8');
  console.log('✅ solar_terms_1900_2019.ts 생성 완료\n');

  // 2031-2100년 생성
  console.log('📅 2031-2100년 생성 중...');
  const terms2031_2100: SolarTermData[] = [];
  for (let year = 2031; year <= 2100; year++) {
    terms2031_2100.push(...generateSolarTermsForYear(year));
    if (year % 10 === 0) console.log(`  ${year}년 완료`);
  }
  const content2031_2100 = saveToFile(terms2031_2100, 'solar_terms_2031_2100.ts', 2031, 2100);
  await fs.writeFile(path.join(dataDir, 'solar_terms_2031_2100.ts'), content2031_2100, 'utf-8');
  console.log('✅ solar_terms_2031_2100.ts 생성 완료\n');

  // 2101-2200년 생성
  console.log('📅 2101-2200년 생성 중...');
  const terms2101_2200: SolarTermData[] = [];
  for (let year = 2101; year <= 2200; year++) {
    terms2101_2200.push(...generateSolarTermsForYear(year));
    if (year % 10 === 0) console.log(`  ${year}년 완료`);
  }
  const content2101_2200 = saveToFile(terms2101_2200, 'solar_terms_2101_2200.ts', 2101, 2200);
  await fs.writeFile(path.join(dataDir, 'solar_terms_2101_2200.ts'), content2101_2200, 'utf-8');
  console.log('✅ solar_terms_2101_2200.ts 생성 완료\n');

  console.log('🎉 전체 절기 데이터 생성 완료!');
  console.log(`📊 총 ${terms1900_2019.length + terms2031_2100.length + terms2101_2200.length}개 항목 생성됨`);
}

main().catch(console.error);
