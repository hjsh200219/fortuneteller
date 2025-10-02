/**
 * 사주팔자 계산 핵심 로직
 */

import type { SajuData, Pillar, Gender, CalendarType, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex, analyzeBranchRelations, checkWolRyeong, calculateJiJangGanStrength } from '../data/earthly_branches.js';
import { getCurrentSolarTerm, getSolarTermMonthIndex } from '../data/solar_terms.js';
import { convertCalendarSync } from './calendar.js';
import { calculateTenGodsDistribution, generateTenGodsList } from './ten_gods.js';
import { findSinSals } from './sin_sal.js';
import { analyzeDayMasterStrength } from './day_master_strength.js';
import { determineGyeokGuk } from './gyeok_guk.js';
import { selectYongSin } from './yong_sin.js';
import { sajuCache, generateSajuCacheKey } from './performance_cache.js';

/**
 * 생년월일시로부터 사주팔자 계산 (캐싱 적용)
 */
export function calculateSaju(
  birthDate: string,
  birthTime: string,
  calendar: CalendarType,
  isLeapMonth: boolean,
  gender: Gender
): SajuData {
  // 캐시 체크
  const cacheKey = generateSajuCacheKey(birthDate, birthTime, calendar, isLeapMonth, gender);
  const cached = sajuCache.get(cacheKey);
  if (cached) {
    return cached as SajuData;
  }

  // 음력을 양력으로 변환 (동기 버전 사용)
  let solarDate = birthDate;
  if (calendar === 'lunar') {
    const conversion = convertCalendarSync(birthDate, 'lunar', 'solar');
    solarDate = conversion.convertedDate;
  }

  const date = new Date(solarDate);
  const [hours, minutes] = birthTime.split(':').map(Number);
  date.setHours(hours!, minutes!);

  // 한국 진태양시 보정 (KST는 UTC+9이지만 실제 천문시와 약 30분 차이)
  // 사주 계산은 진태양시 기준이므로 30분을 빼야 함
  const adjustedDate = new Date(date.getTime() - 30 * 60 * 1000);

  // 연주 계산
  const yearPillar = calculateYearPillar(adjustedDate);

  // 월주 계산
  const monthPillar = calculateMonthPillar(adjustedDate, yearPillar);

  // 일주 계산
  const dayPillar = calculateDayPillar(adjustedDate);

  // 시주 계산
  const hourPillar = calculateHourPillar(adjustedDate, dayPillar);

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

  const sajuData: SajuData = {
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
    tenGods: [], // 임시
    dominantElements: strongElements,
    weakElements,
  };

  // 십성 계산
  sajuData.tenGods = generateTenGodsList(sajuData);
  sajuData.tenGodsDistribution = calculateTenGodsDistribution(sajuData);

  // 신살 계산
  sajuData.sinSals = findSinSals(sajuData);

  // 지지 관계 분석
  const branches = [yearPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch];
  sajuData.branchRelations = analyzeBranchRelations(branches);

  // 지장간 세력 계산
  const currentSolarTerm = getCurrentSolarTerm(adjustedDate);
  const monthIndex = getSolarTermMonthIndex(currentSolarTerm);
  sajuData.jiJangGan = {
    year: calculateJiJangGanStrength(yearPillar.branch, monthIndex),
    month: calculateJiJangGanStrength(monthPillar.branch, monthIndex),
    day: calculateJiJangGanStrength(dayPillar.branch, monthIndex),
    hour: calculateJiJangGanStrength(hourPillar.branch, monthIndex),
  };

  // 월령 득실 판단
  sajuData.wolRyeong = checkWolRyeong(dayPillar.stem, monthPillar.branch);

  // 일간 강약 분석
  sajuData.dayMasterStrength = analyzeDayMasterStrength(sajuData);

  // 격국 판단
  const gyeokGukAnalysis = determineGyeokGuk(sajuData);
  sajuData.gyeokGuk = {
    gyeokGuk: gyeokGukAnalysis.gyeokGuk,
    name: gyeokGukAnalysis.name,
    hanja: gyeokGukAnalysis.hanja,
    description: gyeokGukAnalysis.description,
  };

  // 용신 선정
  const yongSinAnalysis = selectYongSin(sajuData);
  sajuData.yongSin = {
    primaryYongSin: yongSinAnalysis.primaryYongSin,
    secondaryYongSin: yongSinAnalysis.secondaryYongSin,
    reasoning: yongSinAnalysis.reasoning,
  };

  // 캐시에 저장
  sajuCache.set(cacheKey, sajuData);

  return sajuData;
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
 * 정확한 기준일: 1900년 1월 1일 = 병자일(丙子日)
 */
function calculateDayPillar(date: Date): Pillar {
  // 기준일: 1900년 1월 1일 = 병자일 (stemIndex=2, branchIndex=0)
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  // 60갑자 순환
  // 병(丙) = 2, 자(子) = 0에서 시작
  const stemIndex = (2 + diffDays) % 10;
  const branchIndex = (0 + diffDays) % 12;

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
  // 십성 분포 문자열 생성
  let tenGodsStr = '';
  if (saju.tenGodsDistribution) {
    const tenGodsList = Object.entries(saju.tenGodsDistribution)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => `${name}: ${count}개`)
      .join(', ');
    tenGodsStr = tenGodsList || '없음';
  }

  // 신살 문자열 생성
  let sinSalsStr = '없음';
  if (saju.sinSals && saju.sinSals.length > 0) {
    // 신살을 한글 이름으로 매핑
    const sinSalNames: Record<string, string> = {
      cheon_eul_gwi_in: '천을귀인',
      cheon_deok_gwi_in: '천덕귀인',
      wol_deok_gwi_in: '월덕귀인',
      mun_chang_gwi_in: '문창귀인',
      hak_dang_gwi_in: '학당귀인',
      geum_yeo_rok: '금여록',
      hwa_gae_sal: '화개살',
      yang_in_sal: '양인살',
      do_hwa_sal: '도화살',
      baek_ho_sal: '백호살',
      yeok_ma_sal: '역마살',
      gwa_suk_sal: '고숙살',
      gong_mang: '공망',
    };
    sinSalsStr = saju.sinSals.map((s) => sinSalNames[s] || s).join(', ');
  }

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

십성 분석:
  ${tenGodsStr}

신살 분석:
  ${sinSalsStr}

지지 관계:
  ${saju.branchRelations?.summary || '특별한 지지 관계가 없습니다'}

월령 분석:
  ${saju.wolRyeong?.reason || '월령 정보 없음'}
  득령 여부: ${saju.wolRyeong?.isDeukRyeong ? '득령(得令)' : '실령(失令)'}

일간 강약:
  레벨: ${
    saju.dayMasterStrength?.level === 'very_strong' ? '매우 강함' :
    saju.dayMasterStrength?.level === 'strong' ? '강함' :
    saju.dayMasterStrength?.level === 'medium' ? '중화' :
    saju.dayMasterStrength?.level === 'weak' ? '약함' :
    saju.dayMasterStrength?.level === 'very_weak' ? '매우 약함' : '미분석'
  }
  점수: ${saju.dayMasterStrength?.score || 0}/100
  분석: ${saju.dayMasterStrength?.analysis || '분석 정보 없음'}

격국(格局):
  ${saju.gyeokGuk?.name || '미분석'} (${saju.gyeokGuk?.hanja || ''})
  ${saju.gyeokGuk?.description || ''}

용신(用神):
  주 용신: ${saju.yongSin?.primaryYongSin || '미분석'}${saju.yongSin?.secondaryYongSin ? `, 보조 용신: ${saju.yongSin.secondaryYongSin}` : ''}
  ${saju.yongSin?.reasoning || ''}

특징:
  강한 오행: ${saju.dominantElements?.join(', ') || '없음'}
  약한 오행: ${saju.weakElements?.join(', ') || '없음'}
  `.trim();
}

