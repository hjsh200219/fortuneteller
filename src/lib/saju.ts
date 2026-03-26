/**
 * 사주팔자 계산 핵심 로직
 */

import { differenceInCalendarDays } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import type { SajuData, Pillar, Gender, CalendarType, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex, analyzeBranchRelations, checkWolRyeong, calculateJiJangGanStrength } from '../data/earthly_branches.js';
import { getCurrentSolarTerm, getSolarTermMonthIndex } from '../data/solar_terms.js';
import { WUXING_DATA } from '../data/wuxing.js';
import { convertCalendar } from './calendar.js';
import { getAdjustedBirthInstantForSaju } from '../utils/date.js';
import { resolveBirthCityForSaju } from '../data/longitude_table.js';
import { calculateTenGodsDistribution, generateTenGodsList } from './ten_gods.js';
import { findSinSals } from './sin_sal.js';
import { analyzeDayMasterStrength } from './day_master_strength.js';
import { determineGyeokGuk } from './gyeok_guk.js';
import { selectYongSin } from './yong_sin.js';
import { sajuCache, generateSajuCacheKey } from './performance_cache.js';

const SEOUL_TZ = 'Asia/Seoul';

/**
 * 생년월일시로부터 사주팔자 계산 (캐싱 적용)
 */
export function calculateSaju(
  birthDate: string,
  birthTime: string,
  calendar: CalendarType,
  isLeapMonth: boolean,
  gender: Gender,
  birthCity?: string
): SajuData {
  const resolvedBirthCity = resolveBirthCityForSaju(birthCity);

  // 캐시 체크
  const cacheKey = generateSajuCacheKey(
    birthDate,
    birthTime,
    calendar,
    isLeapMonth,
    gender,
    resolvedBirthCity
  );
  const cached = sajuCache.get(cacheKey);
  if (cached) {
    return cached as SajuData;
  }

  // 음력을 양력으로 변환
  let solarDate = birthDate;
  if (calendar === 'lunar') {
    const conversion = convertCalendar(birthDate, 'lunar', 'solar');
    solarDate = conversion.convertedDate;
  }

  // 출생 벽시계(썸머타임) + 출생지 경도 보정(동경 135° 대비)
  const adjustedDate = getAdjustedBirthInstantForSaju(solarDate, birthTime, resolvedBirthCity);

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
    birthCity: resolvedBirthCity,
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
  // 입춘 이전 절기: 동지, 소한, 대한
  if (month <= 2 && (solarTerm === '동지' || solarTerm === '소한' || solarTerm === '대한')) {
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

  // 월간 계산: 연간에 따라 결정 (전통적인 월간 기산법)
  const yearStem = getHeavenlyStemByIndex(
    ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'].indexOf(yearPillar.stem)
  );

  const yearStemIndex = yearStem.index;
  let monthStemStart: number;

  // 연간에 따른 월간 시작점 결정
  if (yearStemIndex === 0 || yearStemIndex === 5) { 
    // 갑년(甲), 기년(己): 병인월(丙寅月)부터
    monthStemStart = 2; // 병(丙)
  } else if (yearStemIndex === 1 || yearStemIndex === 6) { 
    // 을년(乙), 경년(庚): 무인월(戊寅月)부터
    monthStemStart = 4; // 무(戊)
  } else if (yearStemIndex === 2 || yearStemIndex === 7) { 
    // 병년(丙), 신년(辛): 경인월(庚寅月)부터
    monthStemStart = 6; // 경(庚)
  } else if (yearStemIndex === 3 || yearStemIndex === 8) { 
    // 정년(丁), 임년(壬): 임인월(壬寅月)부터
    monthStemStart = 8; // 임(壬)
  } else { 
    // 무년(戊), 계년(癸): 갑인월(甲寅月)부터
    monthStemStart = 0; // 갑(甲)
  }

  // 인월(寅月, 지지 인덱스 2)부터 시작하므로, 월수 차이를 계산
  const monthOffset = branchIndex >= 2 ? branchIndex - 2 : branchIndex + 10;
  const stemIndex = (monthStemStart + monthOffset) % 10;

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
 * 정확한 기준일: 1900년 1월 1일 = 갑술일(甲戌日) (만세력 원전 대조 완료)
 * 출생 순간을 대한민국 달력 일(Asia/Seoul)로 두고 기준일과의 일수 차를 쓴다(UTC 일수 나눗셈·서버 타임존 의존 방지).
 */
function calculateDayPillar(date: Date): Pillar {
  const birthKoreaDateStr = formatInTimeZone(date, SEOUL_TZ, 'yyyy-MM-dd');
  const base = toDate('1900-01-01T12:00:00', { timeZone: SEOUL_TZ });
  const birth = toDate(`${birthKoreaDateStr}T12:00:00`, { timeZone: SEOUL_TZ });
  const diffDays = differenceInCalendarDays(birth, base);

  // 60갑자 순환
  // 갑(甲) = 0, 술(戌) = 10에서 시작
  const stemIndex = ((0 + diffDays) % 10 + 10) % 10;
  const branchIndex = ((10 + diffDays) % 12 + 12) % 12;

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
  const hours = parseInt(formatInTimeZone(date, SEOUL_TZ, 'H'), 10);

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
 * 사주를 설명적으로 포맷팅
 */
export function formatSaju(saju: SajuData): string {
  const sections: string[] = [];

  // 1. 사주팔자 기본 정보
  sections.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 사주팔자 (四柱八字) - 당신의 타고난 운명 설계도
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

사주팔자는 출생 연월일시를 천간(天干)과 지지(地支)로 표현한 것으로,
당신의 타고난 성격, 재능, 그리고 인생의 흐름을 나타냅니다.

  출생지(경도 보정): ${saju.birthCity}

  연주(年柱): ${saju.year.stem}${saju.year.branch} (${saju.year.stemElement}/${saju.year.branchElement}) - 조상과 초년운(0-15세)
  월주(月柱): ${saju.month.stem}${saju.month.branch} (${saju.month.stemElement}/${saju.month.branchElement}) - 부모와 청년운(16-30세)
  일주(日柱): ${saju.day.stem}${saju.day.branch} (${saju.day.stemElement}/${saju.day.branchElement}) - 자신과 배우자, 중년운(31-45세)
  시주(時柱): ${saju.hour.stem}${saju.hour.branch} (${saju.hour.stemElement}/${saju.hour.branchElement}) - 자녀와 말년운(46세 이후)
  `);

  // 2. 오행 분석
  const wuxingAnalysis = analyzeWuXingDistribution(saju);
  sections.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌿 오행(五行) 분석 - 우주의 다섯 가지 기운
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

오행은 목(木), 화(火), 토(土), 금(金), 수(水)로 이루어진 우주의 기본 에너지입니다.
각 오행의 균형이 당신의 성격, 건강, 적성을 결정합니다.

  목(木 - 나무): ${saju.wuxingCount.목}개 ${getWuXingBar(saju.wuxingCount.목)}
    → 봄의 기운, 성장과 창의성을 상징 (방위: 동쪽, 색상: 청색/녹색)

  화(火 - 불): ${saju.wuxingCount.화}개 ${getWuXingBar(saju.wuxingCount.화)}
    → 여름의 기운, 열정과 활동성을 상징 (방위: 남쪽, 색상: 적색/주황)

  토(土 - 흙): ${saju.wuxingCount.토}개 ${getWuXingBar(saju.wuxingCount.토)}
    → 환절기의 기운, 안정과 포용을 상징 (방위: 중앙, 색상: 황색/갈색)

  금(金 - 쇠): ${saju.wuxingCount.금}개 ${getWuXingBar(saju.wuxingCount.금)}
    → 가을의 기운, 의리와 결단력을 상징 (방위: 서쪽, 색상: 백색/금색)

  수(水 - 물): ${saju.wuxingCount.수}개 ${getWuXingBar(saju.wuxingCount.수)}
    → 겨울의 기운, 지혜와 깊이를 상징 (방위: 북쪽, 색상: 흑색/청색)

${wuxingAnalysis}
  `);

  // 3. 십성 분석
  const tenGodsAnalysis = analyzeTenGodsDistribution(saju);
  sections.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ 십성(十星) 분석 - 인간관계와 역할의 지도
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

십성은 일간(자신)을 기준으로 다른 천간·지지와의 관계를 나타냅니다.
이를 통해 성격, 적성, 인간관계 유형을 알 수 있습니다.

${tenGodsAnalysis}
  `);

  // 4. 신살 분석
  if (saju.sinSals && saju.sinSals.length > 0) {
    const sinSalAnalysis = analyzeSinSals(saju);
    sections.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ 신살(神殺) 분석 - 특별한 별자리의 축복과 경고
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

신살은 사주에 나타나는 특수한 별자리로, 길흉화복의 징조를 나타냅니다.

${sinSalAnalysis}
    `);
  }

  // 5. 일간 강약
  const strengthAnalysis = analyzeDayMasterStrengthDetailed(saju);
  sections.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💪 일간(日干) 강약 - 당신의 내면적 힘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

일간은 사주의 중심이자 '나' 자신을 의미합니다.
일간의 강약은 자존감, 추진력, 스트레스 대처 능력을 나타냅니다.

${strengthAnalysis}
  `);

  // 6. 격국과 용신
  const gyeokGukAnalysis = analyzeGyeokGukDetailed(saju);
  sections.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 격국(格局)과 용신(用神) - 인생의 방향성
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${gyeokGukAnalysis}
  `);

  return sections.join('\n');
}

/**
 * 오행 개수를 시각적 바로 표현
 */
function getWuXingBar(count: number): string {
  const max = 5;
  const filled = Math.min(count, max);
  const empty = max - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * 오행 분포 상세 분석
 */
function analyzeWuXingDistribution(saju: SajuData): string {
  const { wuxingCount, dominantElements, weakElements } = saju;
  const average = 8 / 5;
  const analysis: string[] = [];

  analysis.push('💡 오행 균형 해석:');

  // 균형 판단
  const balanced = dominantElements?.length === 0 && weakElements?.length === 0;
  if (balanced) {
    analysis.push('  ✓ 오행이 조화롭게 균형을 이루고 있어 심신이 안정적이고 건강합니다.');
    analysis.push('  ✓ 다양한 분야에서 고르게 능력을 발휘할 수 있는 만능형 재능을 가지고 있습니다.');
  } else {
    if (dominantElements && dominantElements.length > 0) {
      dominantElements.forEach((element) => {
        const data = WUXING_DATA[element];
        const count = wuxingCount[element];
        const ratio = count / average;
        const intensity = ratio >= 2.5 ? '매우 강함' : ratio >= 2.0 ? '강함' : '뚜렷함';

        analysis.push(`  ⚡ ${element}(${data.hanja}) 기운이 ${intensity} (${count}개):
    - 성격: ${data.personality.slice(0, 3).join(', ')}한 경향이 강합니다
    - 장점: ${element === '목' ? '창의적이고 성장지향적' : element === '화' ? '열정적이고 사교적' : element === '토' ? '안정적이고 신뢰할 만함' : element === '금' ? '원칙적이고 결단력 있음' : '지혜롭고 분석적'}
    - 주의: ${element === '목' ? '우유부단할 수 있음' : element === '화' ? '급하고 조급할 수 있음' : element === '토' ? '고집스러울 수 있음' : element === '금' ? '융통성이 부족할 수 있음' : '우울하거나 소극적일 수 있음'}`);
      });
    }

    if (weakElements && weakElements.length > 0) {
      weakElements.forEach((element) => {
        const data = WUXING_DATA[element];
        analysis.push(`  ⚠️  ${element}(${data.hanja}) 기운 부족:
    - 보완 방법: ${data.color.join('/')} 색상 활용, ${data.direction}쪽 방향 중시
    - 추천: ${element === '목' ? '식물 키우기, 독서, 산책' : element === '화' ? '운동, 사회활동, 밝은 환경' : element === '토' ? '규칙적 생활, 요리, 정리정돈' : element === '금' ? '악기 연주, 규율 지키기' : '명상, 수영, 충분한 휴식'}`);
      });
    }
  }

  return analysis.join('\n');
}

/**
 * 십성 분포 상세 분석
 */
function analyzeTenGodsDistribution(saju: SajuData): string {
  if (!saju.tenGodsDistribution) return '  (십성 정보 없음)';

  const analysis: string[] = [];
  const dist = saju.tenGodsDistribution;

  // 십성별 상세 설명
  const tenGodDescriptions: Record<string, { category: string; meaning: string; career: string }> = {
    비견: { category: '자기(自己)', meaning: '자립심, 독립성, 경쟁심', career: '독립 사업, 프리랜서' },
    겁재: { category: '자기(自己)', meaning: '협력, 경쟁, 형제', career: '동업, 팀워크 중시 직업' },
    식신: { category: '표현(表現)', meaning: '창의성, 표현력, 여유', career: '예술, 요리, 서비스업' },
    상관: { category: '표현(表現)', meaning: '재능, 비판력, 자유', career: '창작, 기술, 연구' },
    편재: { category: '재물(財物)', meaning: '유동재산, 사교성, 활동', career: '영업, 무역, 투자' },
    정재: { category: '재물(財物)', meaning: '고정재산, 성실, 안정', career: '회계, 금융, 정규직' },
    편관: { category: '권력(權力)', meaning: '추진력, 도전, 권위', career: '경영, 군인, 경찰' },
    정관: { category: '권력(權力)', meaning: '책임감, 질서, 명예', career: '공무원, 관리직, 법조인' },
    편인: { category: '학문(學問)', meaning: '직관, 특수재능, 종교', career: '철학, 종교, 특수 전문직' },
    정인: { category: '학문(學問)', meaning: '학습, 보호, 명예', career: '교육, 연구, 학자' },
  };

  Object.entries(dist)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .forEach(([name, count]) => {
      const desc = tenGodDescriptions[name];
      if (desc) {
        const intensity = count >= 3 ? '매우 강함' : count >= 1.5 ? '강함' : count >= 0.8 ? '적당함' : '약함';
        analysis.push(`  • ${name}(${desc.category}): ${count.toFixed(1)}개 - ${intensity}
    의미: ${desc.meaning}
    추천 직업: ${desc.career}`);
      }
    });

  return analysis.join('\n\n');
}

/**
 * 신살 상세 분석
 */
function analyzeSinSals(saju: SajuData): string {
  if (!saju.sinSals || saju.sinSals.length === 0) return '';

  const analysis: string[] = [];
  const sinSalDetails: Record<string, { name: string; type: string; meaning: string; advice: string }> = {
    cheon_eul_gwi_in: {
      name: '천을귀인(天乙貴人)',
      type: '길신',
      meaning: '귀인의 도움을 받는 최고의 길성. 어려움이 있어도 주변의 도움으로 해결됩니다.',
      advice: '겸손하게 사람들과 좋은 관계를 유지하세요.',
    },
    hwa_gae_sal: {
      name: '화개살(華蓋殺)',
      type: '중립',
      meaning: '예술적 재능과 영적 감각이 뛰어나지만 고독한 면도 있습니다.',
      advice: '창작이나 종교, 철학 분야에서 재능을 발휘하세요.',
    },
    do_hwa_sal: {
      name: '도화살(桃花殺)',
      type: '중립',
      meaning: '이성에게 인기가 많고 매력적이나, 이성 관계가 복잡해질 수 있습니다.',
      advice: '신중한 이성 관계를 유지하고, 매력을 긍정적으로 활용하세요.',
    },
    yeok_ma_sal: {
      name: '역마살(驛馬殺)',
      type: '중립',
      meaning: '이동수가 많고 활동적이며, 변화를 좋아합니다.',
      advice: '여행, 해외, 영업 등 이동이 많은 분야에 적합합니다.',
    },
  };

  saju.sinSals.forEach((sinSal) => {
    const detail = sinSalDetails[sinSal];
    if (detail) {
      const icon = detail.type === '길신' ? '✨' : detail.type === '흉신' ? '⚠️' : '💫';
      analysis.push(`${icon} ${detail.name} [${detail.type}]
  의미: ${detail.meaning}
  조언: ${detail.advice}`);
    }
  });

  return analysis.join('\n\n');
}

/**
 * 일간 강약 상세 분석
 */
function analyzeDayMasterStrengthDetailed(saju: SajuData): string {
  if (!saju.dayMasterStrength) return '  (분석 정보 없음)';

  const { level, score, analysis } = saju.dayMasterStrength;
  const levelKorean =
    level === 'very_strong'
      ? '매우 강함'
      : level === 'strong'
        ? '강함'
        : level === 'medium'
          ? '중화(中和) - 이상적 균형'
          : level === 'weak'
            ? '약함'
            : '매우 약함';

  const bars = '█'.repeat(Math.floor(score / 10)) + '░'.repeat(10 - Math.floor(score / 10));

  const interpretation =
    level === 'very_strong'
      ? `강한 자존감과 추진력을 가지고 있으나, 때로 고집이 세고 타인의 의견을 받아들이기 어려울 수 있습니다.
  → 조언: 겸손함을 배우고 타인과의 협력을 중시하세요.`
      : level === 'strong'
        ? `적절한 자신감과 독립심을 가지고 있어 자신의 길을 개척할 수 있습니다.
  → 조언: 현재의 균형을 유지하며 꾸준히 노력하세요.`
        : level === 'medium'
          ? `이상적인 중화 상태로, 강하지도 약하지도 않아 어떤 환경에도 적응력이 뛰어납니다.
  → 조언: 현재의 균형을 잘 유지하며 다양한 기회를 탐색하세요.`
          : level === 'weak'
            ? `다소 의존적이거나 소극적일 수 있으나, 협력과 조화를 중시하는 장점이 있습니다.
  → 조언: 자신감을 기르고 주도성을 발휘하는 연습을 하세요.`
            : `매우 약한 일간으로 자신감이 부족하고 스트레스에 취약할 수 있습니다.
  → 조언: 용신(用神)을 활용하여 부족한 기운을 보충하고, 긍정적 마인드를 키우세요.`;

  return `  강약 레벨: ${levelKorean}
  점수: ${score}/100 ${bars}

  📊 상세 분석:
  ${analysis}

  💡 해석 및 조언:
  ${interpretation}`;
}

/**
 * 격국과 용신 상세 분석
 */
function analyzeGyeokGukDetailed(saju: SajuData): string {
  const gyeokGukPart =
    saju.gyeokGuk
      ? `격국(格局): ${saju.gyeokGuk.name} (${saju.gyeokGuk.hanja})

격국은 사주의 구조와 패턴을 나타내며, 인생의 큰 방향성을 제시합니다.

  의미: ${saju.gyeokGuk.description}

  이 격국은 ${
    saju.gyeokGuk.name.includes('정')
      ? '정통적이고 안정적인 길을 걷게 되며, 꾸준한 노력으로 성공할 수 있습니다.'
      : saju.gyeokGuk.name.includes('편')
        ? '특별하고 독특한 길을 걷게 되며, 창의적이고 혁신적인 방식으로 성공할 수 있습니다.'
        : '균형잡힌 발전을 이루며, 다양한 분야에서 능력을 발휘할 수 있습니다.'
  }`
      : '(격국 정보 없음)';

  const yongSinPart =
    saju.yongSin
      ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

용신(用神): ${saju.yongSin.primaryYongSin}${saju.yongSin.secondaryYongSin ? ` (보조: ${saju.yongSin.secondaryYongSin})` : ''}

용신은 사주의 균형을 맞추고 부족한 부분을 보완해주는 가장 중요한 오행입니다.
일생 동안 이 오행의 기운을 활용하면 운세가 크게 개선됩니다.

  선정 이유: ${saju.yongSin.reasoning}

  💡 용신 활용법:
  ${getYongSinAdvice(saju.yongSin.primaryYongSin)}`
      : '';

  return gyeokGukPart + yongSinPart;
}

/**
 * 용신 활용 조언
 */
function getYongSinAdvice(yongSin: WuXing): string {
  const data = WUXING_DATA[yongSin];
  return `  • 색상: ${data.color.join(', ')} 계열의 옷이나 소품을 자주 사용하세요
  • 방향: ${data.direction}쪽 방향으로 활동하거나 중요한 일을 진행하세요
  • 계절: ${data.season}에 중요한 결정이나 시작을 하면 유리합니다
  • 성격: ${data.personality.slice(0, 3).join(', ')}한 태도를 유지하세요
  • 직업: ${yongSin === '목' ? '교육, 예술, 기획' : yongSin === '화' ? '영업, 서비스, 방송' : yongSin === '토' ? '부동산, 금융, 중재' : yongSin === '금' ? '법조, 경영, 군인' : '연구, IT, 학문'} 분야가 유리합니다`;
}

