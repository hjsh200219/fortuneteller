/**
 * 사주팔자 계산 핵심 로직
 */

import type { SajuData, Pillar, Gender, CalendarType, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { getCurrentSolarTerm, getSolarTermMonthIndex } from '../data/solar_terms.js';
import { convertCalendar } from './calendar.js';

/**
 * 생년월일시로부터 사주팔자 계산
 */
export function calculateSaju(
  birthDate: string,
  birthTime: string,
  calendar: CalendarType,
  isLeapMonth: boolean,
  gender: Gender
): SajuData {
  // 음력을 양력으로 변환
  let solarDate = birthDate;
  if (calendar === 'lunar') {
    const conversion = convertCalendar(birthDate, 'lunar', 'solar');
    solarDate = conversion.convertedDate;
  }

  const date = new Date(solarDate);
  const [hours, minutes] = birthTime.split(':').map(Number);
  date.setHours(hours!, minutes!);

  // 연주 계산
  const yearPillar = calculateYearPillar(date);

  // 월주 계산
  const monthPillar = calculateMonthPillar(date, yearPillar);

  // 일주 계산
  const dayPillar = calculateDayPillar(date);

  // 시주 계산
  const hourPillar = calculateHourPillar(date, dayPillar);

  // 오행 개수 세기
  const wuxingCount: Record<WuXing, number> = {
    목: 0,
    화: 0,
    토: 0,
    금: 0,
    수: 0,
  };

  // 사주 사기둥의 오행 카운트
  [yearPillar, monthPillar, dayPillar, hourPillar].forEach((pillar) => {
    wuxingCount[pillar.stemElement]++;
    wuxingCount[pillar.branchElement]++;
  });

  // 강약 분석
  const strongElements: WuXing[] = [];
  const weakElements: WuXing[] = [];
  const average = 8 / 5; // 총 8개 / 5개 오행

  for (const [element, count] of Object.entries(wuxingCount) as [WuXing, number][]) {
    if (count > average * 1.5) {
      strongElements.push(element);
    } else if (count === 0 || count < average * 0.5) {
      weakElements.push(element);
    }
  }

  return {
    birthDate,
    birthTime,
    calendar,
    isLeapMonth,
    gender,
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    wuxingCount,
    tenGods: [], // TODO: 십성 계산
    dominantElements: strongElements,
    weakElements,
  };
}

/**
 * 연주(年柱) 계산
 */
function calculateYearPillar(date: Date): Pillar {
  const year = date.getFullYear();

  // 입춘 이전이면 전년도로 계산
  const solarTerm = getCurrentSolarTerm(date);
  const month = date.getMonth() + 1;
  let sajuYear = year;

  // 1월이나 2월 초에 입춘 이전이면 전년도
  if (month <= 2 && solarTerm === '대한') {
    sajuYear = year - 1;
  }

  // 갑자(甲子)년 기준: 1984년, 1924년, 1864년...
  // 60갑자 순환
  const stemIndex = (sajuYear - 4) % 10;
  const branchIndex = (sajuYear - 4) % 12;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);

  return {
    stem: stem.korean,
    branch: branch.korean,
    stemElement: stem.element,
    branchElement: branch.element,
    yinYang: stem.yinYang,
  };
}

/**
 * 월주(月柱) 계산
 */
function calculateMonthPillar(date: Date, yearPillar: Pillar): Pillar {
  const solarTerm = getCurrentSolarTerm(date);
  const monthIndex = getSolarTermMonthIndex(solarTerm);

  // 월지 계산: 인월부터 시작 (입춘)
  const branchIndex = (monthIndex + 2) % 12; // 인(寅)월부터

  // 월간 계산: 연간에 따라 결정
  // 갑기년은 병인월부터 시작
  const yearStem = getHeavenlyStemByIndex(
    ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'].indexOf(yearPillar.stem)
  );

  // 월간 공식: (연간 × 2 + 월지) % 10
  const stemIndex = (yearStem.index * 2 + branchIndex) % 10;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);

  return {
    stem: stem.korean,
    branch: branch.korean,
    stemElement: stem.element,
    branchElement: branch.element,
    yinYang: stem.yinYang,
  };
}

/**
 * 일주(日柱) 계산
 */
function calculateDayPillar(date: Date): Pillar {
  // 기준일: 1900년 1월 1일 = 갑자일
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  // 60갑자 순환
  const stemIndex = diffDays % 10;
  const branchIndex = diffDays % 12;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);

  return {
    stem: stem.korean,
    branch: branch.korean,
    stemElement: stem.element,
    branchElement: branch.element,
    yinYang: stem.yinYang,
  };
}

/**
 * 시주(時柱) 계산
 */
function calculateHourPillar(date: Date, dayPillar: Pillar): Pillar {
  const hours = date.getHours();

  // 시지 계산 (2시간 단위)
  // 23-01시: 자시, 01-03시: 축시, ...
  let branchIndex: number;
  if (hours >= 23 || hours < 1) {
    branchIndex = 0; // 자
  } else {
    branchIndex = Math.floor((hours + 1) / 2);
  }

  // 시간 계산: 일간에 따라 결정
  const dayStem = getHeavenlyStemByIndex(
    ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'].indexOf(dayPillar.stem)
  );

  // 시간 공식: (일간 × 2 + 시지) % 10
  const stemIndex = (dayStem.index * 2 + branchIndex) % 10;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);

  return {
    stem: stem.korean,
    branch: branch.korean,
    stemElement: stem.element,
    branchElement: branch.element,
    yinYang: stem.yinYang,
  };
}

/**
 * 사주를 문자열로 포맷팅
 */
export function formatSaju(saju: SajuData): string {
  return `
사주팔자:
  연주(年柱): ${saju.year.stem}${saju.year.branch} (${saju.year.stemElement}/${saju.year.branchElement})
  월주(月柱): ${saju.month.stem}${saju.month.branch} (${saju.month.stemElement}/${saju.month.branchElement})
  일주(日柱): ${saju.day.stem}${saju.day.branch} (${saju.day.stemElement}/${saju.day.branchElement})
  시주(時柱): ${saju.hour.stem}${saju.hour.branch} (${saju.hour.stemElement}/${saju.hour.branchElement})

오행 분석:
  목(木): ${saju.wuxingCount.목}개
  화(火): ${saju.wuxingCount.화}개
  토(土): ${saju.wuxingCount.토}개
  금(金): ${saju.wuxingCount.금}개
  수(水): ${saju.wuxingCount.수}개

특징:
  강한 오행: ${saju.dominantElements?.join(', ') || '없음'}
  약한 오행: ${saju.weakElements?.join(', ') || '없음'}
  `.trim();
}

