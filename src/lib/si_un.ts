/**
 * 시운(時運) 계산 시스템
 * 시간대별 운세 분석 - 매 시진(2시간)의 천간지지와 그에 따른 운세
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, WuXing } from '../types/index.js';
import { getHeavenlyStemByIndex } from '../data/heavenly_stems.js';
import { getEarthlyBranchByIndex } from '../data/earthly_branches.js';
import { analyzeElementInteraction } from '../data/wuxing.js';

/**
 * 시운(時運) 시간대 정보
 */
export interface SiUnHour {
  date: string; // 날짜 (YYYY-MM-DD)
  hour: number; // 시작 시각 (0-23)
  hourRange: string; // 시간대 (예: "23:00-01:00")
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: WuXing;
  branchElement: WuXing;
  ganjiName: string; // 간지명 (예: "갑자시")
  branchName: string; // 시진명 (예: "자시")
  interaction: {
    withDayMaster: string; // 일간과의 관계
    withYongSin: string; // 용신과의 관계
  };
  fortune: {
    activity: string; // 활동 적합도
    decision: string; // 의사결정 적합도
    meeting: string; // 미팅/만남 적합도
    rest: string; // 휴식 적합도
  };
  advice: string; // 시간대별 조언
  luckyActivity?: string; // 추천 활동
}

/**
 * 시지(時支) - 12시진
 */
const HOUR_BRANCHES: { branch: EarthlyBranch; startHour: number; name: string }[] = [
  { branch: '자', startHour: 23, name: '자시' }, // 23:00-01:00
  { branch: '축', startHour: 1, name: '축시' }, // 01:00-03:00
  { branch: '인', startHour: 3, name: '인시' }, // 03:00-05:00
  { branch: '묘', startHour: 5, name: '묘시' }, // 05:00-07:00
  { branch: '진', startHour: 7, name: '진시' }, // 07:00-09:00
  { branch: '사', startHour: 9, name: '사시' }, // 09:00-11:00
  { branch: '오', startHour: 11, name: '오시' }, // 11:00-13:00
  { branch: '미', startHour: 13, name: '미시' }, // 13:00-15:00
  { branch: '신', startHour: 15, name: '신시' }, // 15:00-17:00
  { branch: '유', startHour: 17, name: '유시' }, // 17:00-19:00
  { branch: '술', startHour: 19, name: '술시' }, // 19:00-21:00
  { branch: '해', startHour: 21, name: '해시' }, // 21:00-23:00
];

/**
 * 시간으로부터 시지 계산
 */
function getHourBranch(hour: number): { branch: EarthlyBranch; name: string; hourRange: string } {
  // 자시는 23:00부터 시작

  for (let i = 0; i < HOUR_BRANCHES.length; i++) {
    const current = HOUR_BRANCHES[i]!;
    const next = HOUR_BRANCHES[(i + 1) % 12];

    if (current.startHour === 23) {
      // 자시 특수 처리
      if (hour >= 23 || hour < 1) {
        return {
          branch: current.branch,
          name: current.name,
          hourRange: '23:00-01:00',
        };
      }
    } else {
      const endHour = next!.startHour;
      if (hour >= current.startHour && hour < endHour) {
        return {
          branch: current.branch,
          name: current.name,
          hourRange: `${String(current.startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`,
        };
      }
    }
  }

  // 기본값 (자시)
  return { branch: '자', name: '자시', hourRange: '23:00-01:00' };
}

/**
 * 시간(時干) 계산
 * 일간에 따라 정해진 규칙으로 계산
 */
function getHourStem(dayStem: HeavenlyStem, hourBranch: EarthlyBranch): HeavenlyStem {
  // 일간에 따른 자시(子時) 천간 결정
  const firstHourStems: Record<HeavenlyStem, HeavenlyStem> = {
    갑: '갑',
    을: '병',
    병: '무',
    정: '경',
    무: '임',
    기: '갑',
    경: '병',
    신: '무',
    임: '경',
    계: '임',
  };

  const firstHourStem = firstHourStems[dayStem]!;
  const firstHourStemIndex = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'].indexOf(
    firstHourStem
  );

  // 자시부터 순서대로 천간 배정
  const hourBranchIndex = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'].indexOf(
    hourBranch
  );
  const hourStemIndex = (firstHourStemIndex + hourBranchIndex) % 10;

  return ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'][
    hourStemIndex
  ] as HeavenlyStem;
}

/**
 * 시운 분석
 */
export function analyzeSiUn(
  sajuData: SajuData,
  targetDate: string,
  targetHour: number
): SiUnHour {
  const hourBranchInfo = getHourBranch(targetHour);
  const hourStem = getHourStem(sajuData.day.stem, hourBranchInfo.branch);

  const stemData = getHeavenlyStemByIndex(
    ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'].indexOf(hourStem)
  );
  const branchData = getEarthlyBranchByIndex(
    ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'].indexOf(
      hourBranchInfo.branch
    )
  );

  // 일간과의 관계 분석
  const dayMasterInteraction = analyzeElementInteraction(
    sajuData.day.stemElement,
    stemData.element
  );

  // 용신과의 관계 분석
  const yongSinElement = sajuData.yongSin?.primaryYongSin || sajuData.day.stemElement;
  const yongSinInteraction = analyzeElementInteraction(yongSinElement, stemData.element);

  // 운세 분석
  const fortune = analyzeHourFortune(
    sajuData,
    stemData.element,
    branchData.element,
    targetHour,
    dayMasterInteraction,
    yongSinInteraction
  );

  // 조언 및 추천 활동
  const { advice, luckyActivity } = generateHourAdvice(
    sajuData,
    stemData.element,
    yongSinInteraction,
    targetHour
  );

  return {
    date: targetDate,
    hour: targetHour,
    hourRange: hourBranchInfo.hourRange,
    stem: hourStem,
    branch: hourBranchInfo.branch,
    stemElement: stemData.element,
    branchElement: branchData.element,
    ganjiName: `${hourStem}${hourBranchInfo.branch}시`,
    branchName: hourBranchInfo.name,
    interaction: {
      withDayMaster: dayMasterInteraction,
      withYongSin: yongSinInteraction,
    },
    fortune,
    advice,
    luckyActivity,
  };
}

/**
 * 시간대별 운세 분석
 */
function analyzeHourFortune(
  _sajuData: SajuData,
  _hourStemElement: WuXing,
  _hourBranchElement: WuXing,
  hour: number,
  dayMasterInteraction: string,
  yongSinInteraction: string
): SiUnHour['fortune'] {
  const isYongSinHour = yongSinInteraction.includes('생') || yongSinInteraction.includes('비화');
  const isDayMasterSupported = dayMasterInteraction.includes('생');

  // 시간대별 기본 활동성
  const isActiveHour = hour >= 6 && hour < 22; // 06:00-22:00
  const isPeakHour = hour >= 9 && hour < 17; // 09:00-17:00

  return {
    activity: isActiveHour && isYongSinHour
      ? '활동하기 좋은 시간입니다. 적극적으로 일을 추진하세요.'
      : '조용히 내실을 다지는 시간입니다. 무리한 활동은 피하세요.',

    decision: isDayMasterSupported && isPeakHour
      ? '중요한 결정을 내리기 좋은 시간입니다. 판단력이 명확합니다.'
      : '중요한 결정은 다른 시간으로 미루는 것이 좋습니다.',

    meeting: isYongSinHour
      ? '미팅이나 만남에 적합한 시간입니다. 좋은 인연이나 기회를 만날 수 있습니다.'
      : '미팅보다는 개인 시간을 갖는 것이 좋습니다.',

    rest: !isActiveHour || !isYongSinHour
      ? '휴식을 취하기 좋은 시간입니다. 몸과 마음을 충전하세요.'
      : '활동적으로 움직이되 과로하지 않도록 주의하세요.',
  };
}

/**
 * 시간대별 조언 생성
 */
function generateHourAdvice(
  _sajuData: SajuData,
  _hourStemElement: WuXing,
  yongSinInteraction: string,
  hour: number
): { advice: string; luckyActivity?: string } {
  let advice = '';
  let luckyActivity: string | undefined;

  if (yongSinInteraction.includes('생')) {
    advice = '용신이 들어오는 좋은 시간입니다. 이 시간을 활용하여 중요한 일을 처리하세요.';
  } else if (yongSinInteraction.includes('극')) {
    advice = '조심스럽게 행동하세요. 충동적인 결정이나 행동은 피하는 것이 좋습니다.';
  }

  // 시간대별 추천 활동
  if (hour >= 5 && hour < 7) {
    luckyActivity = '아침 운동이나 명상';
    advice += ' 하루를 시작하는 시간입니다. 긍정적인 마음가짐을 가지세요.';
  } else if (hour >= 7 && hour < 9) {
    luckyActivity = '아침 식사와 출근 준비';
    advice += ' 활기찬 하루의 시작입니다. 영양가 있는 식사를 하세요.';
  } else if (hour >= 9 && hour < 12) {
    luckyActivity = '중요한 업무 처리';
    advice += ' 집중력이 높은 시간입니다. 중요한 일을 우선 처리하세요.';
  } else if (hour >= 12 && hour < 14) {
    luckyActivity = '점심 식사와 휴식';
    advice += ' 식사 후 충분한 휴식을 취하세요.';
  } else if (hour >= 14 && hour < 17) {
    luckyActivity = '회의나 협업';
    advice += ' 사람들과 소통하기 좋은 시간입니다.';
  } else if (hour >= 17 && hour < 19) {
    luckyActivity = '가벼운 운동이나 산책';
    advice += ' 하루를 마무리하며 몸을 풀어주세요.';
  } else if (hour >= 19 && hour < 21) {
    luckyActivity = '저녁 식사와 가족 시간';
    advice += ' 가족이나 사랑하는 사람과 시간을 보내세요.';
  } else if (hour >= 21 && hour < 23) {
    luckyActivity = '독서나 취미 활동';
    advice += ' 하루를 정리하고 내일을 준비하세요.';
  } else {
    luckyActivity = '수면과 휴식';
    advice += ' 충분한 수면을 취하여 내일을 준비하세요.';
  }

  return { advice, luckyActivity };
}

/**
 * 하루 전체(12시진)의 시운 조회
 */
export function getDailySiUn(sajuData: SajuData, targetDate: string): SiUnHour[] {
  const results: SiUnHour[] = [];

  // 12시진 모두 조회
  for (const hourInfo of HOUR_BRANCHES) {
    results.push(analyzeSiUn(sajuData, targetDate, hourInfo.startHour));
  }

  return results;
}

/**
 * 현재 시간의 시운 조회
 */
export function getCurrentSiUn(sajuData: SajuData): SiUnHour {
  const now = new Date();
  const targetDate = now.toISOString().split('T')[0]!;
  const targetHour = now.getHours();

  return analyzeSiUn(sajuData, targetDate, targetHour);
}
