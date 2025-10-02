/**
 * 일진(日辰) 분석 라이브러리
 *
 * 매일의 길흉화복 분석
 */

import type {
  HeavenlyStem,
  EarthlyBranch,
  SajuData,
  WuXing
} from '../types/index.js';
import {
  SIX_HARMONY,
  EARTHLY_CONFLICTS,
  TWELVE_GODS,
  TWELVE_GODS_INFO,
  EARTHLY_BRANCHES,
  TIME_RANGES,
} from './constants.js';
import { getDayPillar } from './helpers.js';

/**
 * 일진 분석 결과
 */
export interface IljinAnalysis {
  date: Date;
  dayStem: HeavenlyStem;
  dayBranch: EarthlyBranch;
  dayPillar: string; // 일주

  // 일진 등급
  rating: '대길일' | '길일' | '평일' | '흉일' | '대흉일';
  score: number; // 0-100

  // 십이신살 (十二神煞)
  twelveGods: {
    name: string; // 건(建), 제(除), 만(滿), 평(平), 정(定), 집(執), 파(破), 위(危), 성(成), 수(收), 개(開), 폐(閉)
    description: string;
    isAuspicious: boolean;
  };

  // 28수(宿) 길흉
  constellation: {
    name: string; // 각(角), 항(亢), 저(氐), 방(房), 심(心), 미(尾), 기(箕) 등
    element: WuXing;
    fortune: string;
  };

  // 일진과 사주의 관계
  relationWithSaju: {
    harmony: boolean; // 조화 여부
    conflict: boolean; // 충돌 여부
    description: string;
  };

  // 길한 시간대
  luckyHours: {
    hour: string; // 예: "23:00-01:00 (자시)"
    branch: EarthlyBranch;
    reason: string;
  }[];

  // 주의할 시간대
  cautiousHours: {
    hour: string;
    branch: EarthlyBranch;
    reason: string;
  }[];

  // 적합한 활동
  suitableActivities: string[];

  // 피해야 할 활동
  unsuitableActivities: string[];

  // 운세 항목별
  aspects: {
    general: string; // 종합운
    career: string; // 사업/직장운
    money: string; // 재물운
    health: string; // 건강운
    relationship: string; // 대인관계운
    study: string; // 학업운
    travel: string; // 이동/여행운
  };

  // 특별한 의미
  specialMeaning?: {
    isSpecialDay: boolean;
    reason: string;
  };
}

/**
 * 일진 분석
 */
export function analyzeIljin(
  date: Date,
  saju: SajuData
): IljinAnalysis {
  // 1. 일주 구하기
  const { stem: dayStem, branch: dayBranch } = getDayPillar(date);
  const dayPillar = `${dayStem}${dayBranch}`;

  // 2. 십이신살 계산
  const twelveGods = calculateTwelveGods(date, dayBranch);

  // 3. 28수 계산
  const constellation = calculateConstellation(date);

  // 4. 사주와의 관계
  const relationWithSaju = analyzeRelationWithSaju(
    dayStem,
    dayBranch,
    saju
  );

  // 5. 점수 계산
  const score = calculateDayScore(
    twelveGods,
    constellation,
    relationWithSaju
  );

  // 6. 등급 결정
  const rating = determineDayRating(score);

  // 7. 길흉 시간대
  const luckyHours = findLuckyHours(dayBranch, saju);
  const cautiousHours = findCautiousHours(dayBranch, saju);

  // 8. 적합한 활동
  const suitableActivities = determineSuitableActivities(
    twelveGods,
    rating,
    dayStem
  );
  const unsuitableActivities = determineUnsuitableActivities(
    twelveGods,
    rating
  );

  // 9. 세부 운세
  const aspects = analyzeAspects(
    dayPillar,
    twelveGods,
    constellation,
    score
  );

  // 10. 특별한 의미
  const specialMeaning = checkSpecialMeaning(date, dayBranch, saju);

  return {
    date,
    dayStem,
    dayBranch,
    dayPillar,
    rating,
    score,
    twelveGods,
    constellation,
    relationWithSaju,
    luckyHours,
    cautiousHours,
    suitableActivities,
    unsuitableActivities,
    aspects,
    specialMeaning,
  };
}

/**
 * 여러 날의 일진 분석
 */
export function analyzeMultipleDays(
  startDate: Date,
  days: number,
  saju: SajuData
): IljinAnalysis[] {
  const results: IljinAnalysis[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    results.push(analyzeIljin(date, saju));
  }

  return results;
}

/**
 * 십이신살 계산
 */
function calculateTwelveGods(
  date: Date,
  dayBranch: EarthlyBranch
): IljinAnalysis['twelveGods'] {
  // 월지 기준으로 십이신 결정 (간단화)
  const month = date.getMonth(); // 0-11
  const monthBranchIndex = (month + 2) % 12; // 1월=인월
  const dayBranchIndex = EARTHLY_BRANCHES.indexOf(dayBranch);

  const godIndex = (dayBranchIndex - monthBranchIndex + 12) % 12;
  const godName = TWELVE_GODS[godIndex] || '건';

  const info = TWELVE_GODS_INFO[godName] || { desc: '미상', lucky: true };

  return {
    name: godName || '건',
    description: info.desc,
    isAuspicious: info.lucky,
  };
}

/**
 * 28수 계산
 */
function calculateConstellation(date: Date): IljinAnalysis['constellation'] {
  const constellations = [
    { name: '각', element: '목' as WuXing, fortune: '길' },
    { name: '항', element: '금' as WuXing, fortune: '흉' },
    { name: '저', element: '토' as WuXing, fortune: '길' },
    { name: '방', element: '화' as WuXing, fortune: '길' },
    { name: '심', element: '목' as WuXing, fortune: '흉' },
    { name: '미', element: '화' as WuXing, fortune: '길' },
    { name: '기', element: '수' as WuXing, fortune: '길' },
    { name: '두', element: '목' as WuXing, fortune: '길' },
    { name: '우', element: '금' as WuXing, fortune: '흉' },
    { name: '녀', element: '토' as WuXing, fortune: '흉' },
    { name: '허', element: '화' as WuXing, fortune: '흉' },
    { name: '위', element: '목' as WuXing, fortune: '흉' },
    { name: '실', element: '화' as WuXing, fortune: '길' },
    { name: '벽', element: '수' as WuXing, fortune: '길' },
    { name: '규', element: '목' as WuXing, fortune: '길' },
    { name: '루', element: '금' as WuXing, fortune: '흉' },
    { name: '위', element: '토' as WuXing, fortune: '길' },
    { name: '묘', element: '화' as WuXing, fortune: '흉' },
    { name: '필', element: '수' as WuXing, fortune: '길' },
    { name: '자', element: '화' as WuXing, fortune: '길' },
    { name: '삼', element: '수' as WuXing, fortune: '길' },
    { name: '정', element: '목' as WuXing, fortune: '길' },
    { name: '귀', element: '금' as WuXing, fortune: '흉' },
    { name: '유', element: '토' as WuXing, fortune: '길' },
    { name: '성', element: '화' as WuXing, fortune: '흉' },
    { name: '장', element: '목' as WuXing, fortune: '길' },
    { name: '익', element: '화' as WuXing, fortune: '길' },
    { name: '진', element: '수' as WuXing, fortune: '길' },
  ];

  // 날짜로부터 28수 계산 (간단화: 28일 주기)
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const index = daysSinceEpoch % 28;

  return constellations[index] || { name: '각', element: '목', fortune: '길' };
}

/**
 * 사주와의 관계 분석
 */
function analyzeRelationWithSaju(
  _dayStem: HeavenlyStem,
  dayBranch: EarthlyBranch,
  saju: SajuData
): IljinAnalysis['relationWithSaju'] {
  let harmony = false;
  let conflict = false;
  let description = '';

  // 일지 육합
  const sixHarmony: Record<EarthlyBranch, EarthlyBranch> = {
    '자': '축', '인': '해', '묘': '술', '진': '유',
    '사': '신', '오': '미', '축': '자', '해': '인',
    '술': '묘', '유': '진', '신': '사', '미': '오',
  };

  if (saju.day.branch === sixHarmony[dayBranch]) {
    harmony = true;
    description = '사주 일지와 육합하여 매우 길한 날';
  }

  // 일지 충
  const conflicts: Record<EarthlyBranch, EarthlyBranch> = {
    '자': '오', '축': '미', '인': '신', '묘': '유',
    '진': '술', '사': '해', '오': '자', '미': '축',
    '신': '인', '유': '묘', '술': '진', '해': '사',
  };

  if (saju.day.branch === conflicts[dayBranch]) {
    conflict = true;
    description = '사주 일지와 충하여 주의가 필요한 날';
  }

  if (!harmony && !conflict) {
    description = '사주와 특별한 관계 없이 평범한 날';
  }

  return { harmony, conflict, description };
}

/**
 * 일진 점수 계산
 */
function calculateDayScore(
  twelveGods: IljinAnalysis['twelveGods'],
  constellation: IljinAnalysis['constellation'],
  relation: IljinAnalysis['relationWithSaju']
): number {
  let score = 50; // 기본

  if (twelveGods.isAuspicious) score += 20;
  else score -= 10;

  if (constellation.fortune === '길') score += 15;
  else score -= 10;

  if (relation.harmony) score += 20;
  if (relation.conflict) score -= 25;

  return Math.min(100, Math.max(0, score));
}

/**
 * 등급 결정
 */
function determineDayRating(score: number): IljinAnalysis['rating'] {
  if (score >= 85) return '대길일';
  if (score >= 65) return '길일';
  if (score >= 40) return '평일';
  if (score >= 20) return '흉일';
  return '대흉일';
}

/**
 * 길한 시간대 찾기
 */
function findLuckyHours(
  dayBranch: EarthlyBranch,
  _saju: SajuData
): IljinAnalysis['luckyHours'] {
  const hours: IljinAnalysis['luckyHours'] = [];

  EARTHLY_BRANCHES.forEach((branch, i) => {
    if (branch === SIX_HARMONY[dayBranch] || _saju.day.branch === SIX_HARMONY[branch]) {
      hours.push({
        hour: `${TIME_RANGES[i]} (${branch}시)`,
        branch,
        reason: '일지와 육합',
      });
    }
  });

  return hours.slice(0, 3); // 상위 3개
}

/**
 * 주의할 시간대 찾기
 */
function findCautiousHours(
  dayBranch: EarthlyBranch,
  _saju: SajuData
): IljinAnalysis['cautiousHours'] {
  const hours: IljinAnalysis['cautiousHours'] = [];

  EARTHLY_BRANCHES.forEach((branch, i) => {
    if (branch === EARTHLY_CONFLICTS[dayBranch]) {
      hours.push({
        hour: `${TIME_RANGES[i]} (${branch}시)`,
        branch,
        reason: '일지와 충',
      });
    }
  });

  return hours.slice(0, 2); // 상위 2개
}

/**
 * 적합한 활동
 */
function determineSuitableActivities(
  twelveGods: IljinAnalysis['twelveGods'],
  rating: IljinAnalysis['rating'],
  _dayStem: HeavenlyStem
): string[] {
  const activities: string[] = [];

  const godActivities: Record<string, string[]> = {
    '건': ['개업', '창업', '이사', '신축'],
    '제': ['청소', '목욕', '치료', '제사'],
    '만': ['결혼', '입학', '취직'],
    '평': ['일상 업무', '회의', '상담'],
    '정': ['혼인', '계약', '매매'],
    '집': ['소송 준비', '문서 작성'],
    '파': [],
    '위': [],
    '성': ['개업', '취업', '계약'],
    '수': ['거래', '매매', '수금'],
    '개': ['개통', '개업', '출행'],
    '폐': ['휴식', '마무리', '정리'],
  };

  const godActivitiesList = godActivities[twelveGods.name];
  if (godActivitiesList) {
    activities.push(...godActivitiesList);
  }

  if (rating === '대길일' || rating === '길일') {
    activities.push('중요한 결정', '새로운 시작');
  }

  return activities.length > 0 ? activities : ['일상적인 활동'];
}

/**
 * 피해야 할 활동
 */
function determineUnsuitableActivities(
  twelveGods: IljinAnalysis['twelveGods'],
  rating: IljinAnalysis['rating']
): string[] {
  const activities: string[] = [];

  if (twelveGods.name === '파') {
    activities.push('모든 중요한 일', '혼인', '개업', '이사');
  } else if (twelveGods.name === '위') {
    activities.push('위험한 일', '고소 위치 작업', '수술');
  } else if (twelveGods.name === '집') {
    activities.push('싸움', '소송', '대립');
  }

  if (rating === '흉일' || rating === '대흉일') {
    activities.push('큰 계약', '중요한 투자', '수술');
  }

  return activities.length > 0 ? activities : ['특별히 피할 일 없음'];
}

/**
 * 세부 운세 분석
 */
function analyzeAspects(
  dayPillar: string,
  twelveGods: IljinAnalysis['twelveGods'],
  constellation: IljinAnalysis['constellation'],
  score: number
): IljinAnalysis['aspects'] {
  const level = score >= 70 ? '좋음' : score >= 40 ? '보통' : '주의';

  return {
    general: `${dayPillar}일, ${twelveGods.name}일로 전반적으로 ${level}`,
    career: twelveGods.name === '성' || twelveGods.name === '개' ? '진전 가능' : '안정 유지',
    money: twelveGods.name === '수' ? '재물운 상승' : '보통',
    health: constellation.fortune === '길' ? '건강 양호' : '건강 주의',
    relationship: score >= 60 ? '원만함' : '신중히 대응',
    study: twelveGods.name === '평' || twelveGods.name === '정' ? '집중 가능' : '보통',
    travel: twelveGods.name === '개' || twelveGods.name === '건' ? '이동 길함' : '주의',
  };
}

/**
 * 특별한 의미 확인
 */
function checkSpecialMeaning(
  date: Date,
  dayBranch: EarthlyBranch,
  saju: SajuData
): IljinAnalysis['specialMeaning'] {
  // 생일
  const birthday = new Date(saju.year.stem + saju.month.stem + saju.day.stem);
  if (date.getMonth() === birthday.getMonth() && date.getDate() === birthday.getDate()) {
    return {
      isSpecialDay: true,
      reason: '생일 - 새로운 시작과 다짐의 날',
    };
  }

  // 사주 일지와 같은 날
  if (dayBranch === saju.day.branch) {
    return {
      isSpecialDay: true,
      reason: '복일(伏日) - 사주 일지와 같은 지지, 특별한 의미',
    };
  }

  return undefined;
}
