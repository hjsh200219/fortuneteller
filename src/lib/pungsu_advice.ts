/**
 * 풍수(風水) 조언 라이브러리
 *
 * 방위, 공간 배치, 인테리어 조언
 */

import type {
  HeavenlyStem,
  EarthlyBranch,
  SajuData,
  WuXing
} from '../types/index.js';
import { getEarthlyBranchFromYear } from './helpers.js';

/**
 * 방위 (8방위)
 */
export type Direction =
  | '동' | '서' | '남' | '북'
  | '동북' | '동남' | '서북' | '서남';

/**
 * 공간 유형
 */
export type SpaceType =
  | '침실' | '거실' | '부엌' | '욕실' | '서재'
  | '사무실' | '상점' | '공장' | '창고';

/**
 * 풍수 분석 결과
 */
export interface PungsuAnalysis {
  // 개인 길흉 방위
  luckyDirections: {
    direction: Direction;
    element: WuXing;
    fortune: string;
    uses: string[]; // 적합한 용도
  }[];

  unluckyDirections: {
    direction: Direction;
    reason: string;
    avoid: string[]; // 피해야 할 배치
  }[];

  // 공간별 조언
  spaceAdvice: {
    spaceType: SpaceType;
    bestDirection: Direction;
    layout: string;
    colors: string[];
    furniture: string[];
    plants?: string[];
    avoid: string[];
  }[];

  // 연도별 방위 (구성)
  yearlyDirections: {
    year: number;
    luckyDirection: Direction;
    unluckyDirection: Direction;
    description: string;
  };

  // 오행별 인테리어
  elementalDecor: {
    element: WuXing;
    colors: string[];
    materials: string[];
    shapes: string[];
    items: string[];
  }[];

  // 종합 조언
  generalAdvice: {
    priority: string[]; // 우선순위 조언
    warnings: string[]; // 경고사항
    enhancements: string[]; // 개선 제안
  };
}

/**
 * 풍수 분석
 */
export function analyzePungsu(
  saju: SajuData,
  currentYear: number
): PungsuAnalysis {
  // 1. 개인 길흉 방위 결정
  const luckyDirections = determineLuckyDirections(saju);
  const unluckyDirections = determineUnluckyDirections(saju);

  // 2. 공간별 조언
  const spaceAdvice = generateSpaceAdvice(saju);

  // 3. 연도별 방위
  const yearlyDirections = analyzeYearlyDirections(currentYear);

  // 4. 오행별 인테리어
  const elementalDecor = generateElementalDecor();

  // 5. 종합 조언
  const generalAdvice = generateGeneralAdvice(
    saju,
    luckyDirections,
    unluckyDirections
  );

  return {
    luckyDirections,
    unluckyDirections,
    spaceAdvice,
    yearlyDirections,
    elementalDecor,
    generalAdvice,
  };
}

/**
 * 길한 방위 결정
 */
function determineLuckyDirections(saju: SajuData): PungsuAnalysis['luckyDirections'] {
  const dayElement = getElementFromStem(saju.day.stem);

  // 오행별 길한 방위
  const elementDirections: Record<WuXing, {
    primary: Direction;
    secondary: Direction;
  }> = {
    '목': { primary: '동', secondary: '동남' },
    '화': { primary: '남', secondary: '동남' },
    '토': { primary: '서남', secondary: '동북' },
    '금': { primary: '서', secondary: '서북' },
    '수': { primary: '북', secondary: '서북' },
  };

  const dirs = elementDirections[dayElement];

  return [
    {
      direction: dirs.primary,
      element: dayElement,
      fortune: '대길',
      uses: ['침실 배치', '책상 방향', '중요 공간'],
    },
    {
      direction: dirs.secondary,
      element: getGeneratingElement(dayElement),
      fortune: '길',
      uses: ['보조 공간', '휴식 공간'],
    },
  ];
}

/**
 * 흉한 방위 결정
 */
function determineUnluckyDirections(saju: SajuData): PungsuAnalysis['unluckyDirections'] {
  const dayElement = getElementFromStem(saju.day.stem);
  const controllingElement = getControllingElement(dayElement);

  // 극하는 오행의 방위
  const elementDirections: Record<WuXing, Direction> = {
    '목': '서',
    '화': '북',
    '토': '북',
    '금': '남',
    '수': '남',
  };

  return [
    {
      direction: elementDirections[controllingElement],
      reason: `${controllingElement} 오행이 ${dayElement}를 극함`,
      avoid: ['침실', '서재', '주요 활동 공간'],
    },
  ];
}

/**
 * 공간별 조언
 */
function generateSpaceAdvice(saju: SajuData): PungsuAnalysis['spaceAdvice'] {
  const dayElement = getElementFromStem(saju.day.stem);

  return [
    {
      spaceType: '침실',
      bestDirection: '동',
      layout: '머리는 길한 방위를 향하게, 거울은 침대와 직접 마주하지 않게',
      colors: getElementColors(dayElement),
      furniture: ['편안한 침대', '어두운 커튼', '부드러운 조명'],
      avoid: ['침대 위 보 노출', '침대 밑 수납', '과도한 전자기기'],
    },
    {
      spaceType: '거실',
      bestDirection: '남',
      layout: '밝고 트인 공간, 소파는 출입문을 향하게',
      colors: ['밝은 톤', '따뜻한 색상'],
      furniture: ['편안한 소파', '적절한 테이블', '밝은 조명'],
      plants: ['관엽식물', '공기정화 식물'],
      avoid: ['어두운 분위기', '날카로운 모서리'],
    },
    {
      spaceType: '부엌',
      bestDirection: '동남',
      layout: '화기(가스)와 수기(싱크대)는 적절히 분리',
      colors: ['밝은 흰색', '따뜻한 노란색'],
      furniture: ['정리된 수납장', '깨끗한 작업대'],
      avoid: ['가스레인지와 냉장고 인접', '어두운 조명', '막힌 환기'],
    },
    {
      spaceType: '서재',
      bestDirection: '동북',
      layout: '책상은 문을 볼 수 있으나 직접 마주하지 않게',
      colors: ['차분한 청록색', '갈색', '녹색'],
      furniture: ['견고한 책상', '편한 의자', '충분한 책장'],
      plants: ['작은 관엽식물'],
      avoid: ['등 뒤가 창문', '어지러운 환경', '시끄러운 위치'],
    },
    {
      spaceType: '사무실',
      bestDirection: '서북',
      layout: '책상은 후면 벽, 전면 시야 확보',
      colors: ['전문적인 회색', '포인트 블루'],
      furniture: ['넓은 책상', '좋은 의자', '정리함'],
      avoid: ['등 뒤 문', '혼잡한 동선', '불안정한 구조'],
    },
  ];
}

/**
 * 연도별 방위 분석
 */
function analyzeYearlyDirections(year: number): PungsuAnalysis['yearlyDirections'] {
  // 구성(九星) 방위 (간단화)
  const yearBranch = getEarthlyBranchFromYear(year);

  // 지지별 길흉 방위 (간단한 예시)
  const branchDirections: Record<EarthlyBranch, {
    lucky: Direction;
    unlucky: Direction;
  }> = {
    '자': { lucky: '북', unlucky: '남' },
    '축': { lucky: '동북', unlucky: '서남' },
    '인': { lucky: '동', unlucky: '서' },
    '묘': { lucky: '동', unlucky: '서' },
    '진': { lucky: '동남', unlucky: '서북' },
    '사': { lucky: '남', unlucky: '북' },
    '오': { lucky: '남', unlucky: '북' },
    '미': { lucky: '서남', unlucky: '동북' },
    '신': { lucky: '서', unlucky: '동' },
    '유': { lucky: '서', unlucky: '동' },
    '술': { lucky: '서북', unlucky: '동남' },
    '해': { lucky: '북', unlucky: '남' },
  };

  const dirs = branchDirections[yearBranch];

  return {
    year,
    luckyDirection: dirs.lucky,
    unluckyDirection: dirs.unlucky,
    description: `${year}년에는 ${dirs.lucky} 방향이 길하고 ${dirs.unlucky} 방향은 주의`,
  };
}

/**
 * 오행별 인테리어
 */
function generateElementalDecor(): PungsuAnalysis['elementalDecor'] {
  return [
    {
      element: '목',
      colors: ['초록색', '청록색', '연두색'],
      materials: ['나무', '대나무', '라탄'],
      shapes: ['직사각형(세로)', '기둥 형태'],
      items: ['관엽식물', '나무 가구', '그림(숲, 나무)'],
    },
    {
      element: '화',
      colors: ['빨강', '주황', '자주', '분홍'],
      materials: ['양모', '가죽', '폴리에스터'],
      shapes: ['삼각형', '뾰족한 형태'],
      items: ['조명', '캔들', '붉은 소품', '그림(불, 태양)'],
    },
    {
      element: '토',
      colors: ['노랑', '갈색', '베이지', '황토색'],
      materials: ['도자기', '흙', '벽돌', '시멘트'],
      shapes: ['정사각형', '평평한 형태'],
      items: ['도자기', '돌 장식', '흙 화분', '그림(산, 대지)'],
    },
    {
      element: '금',
      colors: ['흰색', '회색', '금색', '은색'],
      materials: ['금속', '유리', '크리스탈'],
      shapes: ['원형', '둥근 형태'],
      items: ['금속 장식', '거울', '시계', '그림(금속, 바위)'],
    },
    {
      element: '수',
      colors: ['파랑', '검정', '남색'],
      materials: ['유리', '수정', '비단'],
      shapes: ['물결 모양', '불규칙 곡선'],
      items: ['수족관', '분수', '물그림', '유리 소품'],
    },
  ];
}

/**
 * 종합 조언
 */
function generateGeneralAdvice(
  saju: SajuData,
  luckyDirs: PungsuAnalysis['luckyDirections'],
  unluckyDirs: PungsuAnalysis['unluckyDirections']
): PungsuAnalysis['generalAdvice'] {
  const dayElement = getElementFromStem(saju.day.stem);

  const priority = [
    `주요 활동 공간은 ${luckyDirs[0]?.direction || '동'} 방향 배치`,
    `${dayElement} 오행을 강화하는 색상과 소재 활용`,
    '깨끗하고 정돈된 환경 유지',
    '자연 채광과 환기 확보',
    '날카로운 모서리나 직선적 동선 피하기',
  ];

  const warnings = [
    `${unluckyDirs[0]?.direction || '서'} 방향에 중요 공간 배치 지양`,
    '과도한 집기나 물건으로 기(氣) 흐름 방해 금지',
    '거울의 무분별한 사용 주의 (특히 침실)',
    '현관과 화장실 문이 직접 마주하는 구조 피하기',
  ];

  const enhancements = [
    '입구는 밝고 넓게 유지하여 좋은 기운 유입',
    '식물을 활용한 공기 정화 및 기운 순환',
    '적절한 조명으로 어두운 곳 없애기',
    '물 흐르는 소품(분수 등)으로 재물운 상승',
    '계절에 맞는 색상과 소재 변화로 활력 유지',
  ];

  return {
    priority,
    warnings,
    enhancements,
  };
}

/**
 * 천간에서 오행 추출
 */
function getElementFromStem(stem: HeavenlyStem): WuXing {
  const map: Record<HeavenlyStem, WuXing> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
  };
  return map[stem];
}

/**
 * 생하는 오행
 */
function getGeneratingElement(element: WuXing): WuXing {
  const map: Record<WuXing, WuXing> = {
    '목': '수', // 수생목
    '화': '목', // 목생화
    '토': '화', // 화생토
    '금': '토', // 토생금
    '수': '금', // 금생수
  };
  return map[element];
}

/**
 * 극하는 오행
 */
function getControllingElement(element: WuXing): WuXing {
  const map: Record<WuXing, WuXing> = {
    '목': '금', // 금극목
    '화': '수', // 수극화
    '토': '목', // 목극토
    '금': '화', // 화극금
    '수': '토', // 토극수
  };
  return map[element];
}

/**
 * 오행별 색상
 */
function getElementColors(element: WuXing): string[] {
  const colors: Record<WuXing, string[]> = {
    '목': ['초록색', '청록색'],
    '화': ['빨강', '주황'],
    '토': ['노랑', '갈색'],
    '금': ['흰색', '금색'],
    '수': ['파랑', '검정'],
  };
  return colors[element];
}

/**
 * 특정 공간에 대한 상세 풍수 조언
 */
export function getDetailedSpaceAdvice(
  saju: SajuData,
  spaceType: SpaceType
): PungsuAnalysis['spaceAdvice'][0] {
  const allAdvice = generateSpaceAdvice(saju);
  const advice = allAdvice.find(a => a.spaceType === spaceType);

  if (!advice) {
    // 기본 조언
    return {
      spaceType,
      bestDirection: '동',
      layout: '깨끗하고 정돈된 공간 유지',
      colors: ['밝은 색상'],
      furniture: ['필요한 가구만 배치'],
      avoid: ['어지러운 환경'],
    };
  }

  return advice;
}
