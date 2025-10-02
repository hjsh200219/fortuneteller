/**
 * 작명(命名) 분석 라이브러리
 *
 * 이름의 오행 분석 및 추천
 */

import type {
  HeavenlyStem,
  SajuData,
  WuXing
} from '../types/index.js';

/**
 * 한글 자음의 오행 분류
 */
const CONSONANT_WUXING: Record<string, WuXing> = {
  // 목(木)
  'ㄱ': '목', 'ㅋ': '목',
  // 화(火)
  'ㄴ': '화', 'ㄷ': '화', 'ㄹ': '화', 'ㅌ': '화',
  // 토(土)
  'ㅁ': '토', 'ㅂ': '토', 'ㅍ': '토',
  // 금(金)
  'ㅅ': '금', 'ㅈ': '금', 'ㅊ': '금',
  // 수(水)
  'ㅇ': '수', 'ㅎ': '수',
};

/**
 * 이름 분석 결과
 */
export interface JakmeongAnalysis {
  name: string;
  characters: {
    char: string;
    strokes: number;
    element: WuXing;
    meaning?: string;
  }[];

  // 오행 구성
  wuxingComposition: {
    elements: WuXing[];
    balance: string;
    isFavorable: boolean;
  };

  // 사주와의 조화
  harmonyWithSaju: {
    score: number; // 0-100
    description: string;
    補益Elements: WuXing[]; // 보완하는 오행
  };

  // 획수 분석 (성명학)
  strokeAnalysis: {
    totalStrokes: number;
    heavenGround: number; // 천격
    personalGround: number; // 인격
    earthGround: number; // 지격
    outerGround: number; // 외격
    totalGround: number; // 총격
    fortune: string;
  };

  // 발음 분석
  pronunciation: {
    rhythm: string; // 음률
    easyToPronounce: boolean;
    easyToWrite: boolean;
  };

  // 종합 평가
  overall: {
    score: number; // 0-100
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
    strengths: string[];
    weaknesses: string[];
  };
}

/**
 * 이름 추천 조건
 */
export interface NameRecommendationRequest {
  surname: string; // 성
  gender: 'male' | 'female';
  saju: SajuData;
  preferredElements?: WuXing[]; // 선호 오행
  avoidElements?: WuXing[]; // 피할 오행
  meaningPreference?: string[]; // 의미 선호 (예: '밝다', '크다')
}

/**
 * 이름 추천 결과
 */
export interface NameRecommendation {
  recommendations: {
    fullName: string;
    givenName: string; // 이름
    analysis: JakmeongAnalysis;
    meanings: string[];
  }[];
  criteria: {
    lackedElements: WuXing[]; // 부족한 오행
    excessElements: WuXing[]; // 과한 오행
    targetElements: WuXing[]; // 목표 오행
  };
}

/**
 * 이름 분석
 */
export function analyzeName(
  fullName: string,
  saju: SajuData
): JakmeongAnalysis {
  // 1. 각 글자 분석
  const chars = fullName.split('');
  const characters = chars.map(char => ({
    char,
    strokes: getStrokeCount(char),
    element: getCharacterElement(char),
    meaning: getCharacterMeaning(char),
  }));

  // 2. 오행 구성
  const elements = characters.map(c => c.element);
  const wuxingComposition = analyzeWuxingComposition(elements, saju);

  // 3. 사주와의 조화
  const harmonyWithSaju = analyzeHarmonyWithSaju(elements, saju);

  // 4. 획수 분석
  const strokes = characters.map(c => c.strokes);
  const strokeAnalysis = analyzeStrokes(strokes);

  // 5. 발음 분석
  const pronunciation = analyzePronunciation(fullName);

  // 6. 종합 평가
  const overall = evaluateOverall(
    wuxingComposition,
    harmonyWithSaju,
    strokeAnalysis,
    pronunciation
  );

  return {
    name: fullName,
    characters,
    wuxingComposition,
    harmonyWithSaju,
    strokeAnalysis,
    pronunciation,
    overall,
  };
}

/**
 * 이름 추천
 */
export function recommendNames(
  request: NameRecommendationRequest,
  count: number = 10
): NameRecommendation {
  // 1. 사주 오행 분석
  const sajuElements = analyzeSajuElements(request.saju);
  const lackedElements = findLackedElements(sajuElements);
  const excessElements = findExcessElements(sajuElements);

  // 2. 목표 오행 결정
  const targetElements = request.preferredElements || lackedElements;

  // 3. 후보 이름 생성
  const candidates = generateNameCandidates(
    request.surname,
    targetElements,
    request.gender,
    count * 3 // 필터링을 위해 더 많이 생성
  );

  // 4. 각 후보 분석 및 점수화
  const scored = candidates.map(name => ({
    fullName: `${request.surname}${name.givenName}`,
    givenName: name.givenName,
    analysis: analyzeName(`${request.surname}${name.givenName}`, request.saju),
    meanings: name.meanings,
  })).sort((a, b) => b.analysis.overall.score - a.analysis.overall.score);

  // 5. 상위 N개 반환
  return {
    recommendations: scored.slice(0, count),
    criteria: {
      lackedElements,
      excessElements,
      targetElements,
    },
  };
}

/**
 * 글자의 획수 구하기 (간단화 - 실제로는 한자 획수 DB 필요)
 */
function getStrokeCount(char: string): number {
  // 간단한 근사치 (실제로는 정확한 한자 획수 데이터 필요)
  const code = char.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    // 한글
    return ((code - 0xAC00) % 28) + 3; // 3-30 사이
  }
  // 한자나 기타 - 임의값
  return 10;
}

/**
 * 글자의 오행 구하기
 */
function getCharacterElement(char: string): WuXing {
  // 한글 초성 기준
  const chosung = extractChosung(char);
  return CONSONANT_WUXING[chosung] || '토';
}

/**
 * 한글 초성 추출
 */
function extractChosung(char: string): string {
  const chosungs = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return 'ㅇ';
  return chosungs[Math.floor(code / 588)] || 'ㅇ';
}

/**
 * 글자 의미 (간단한 예시)
 */
function getCharacterMeaning(char: string): string | undefined {
  const meanings: Record<string, string> = {
    '민': '민첩, 백성',
    '준': '준수, 뛰어남',
    '서': '서쪽, 책',
    '우': '비, 은혜',
    '지': '지혜',
    '윤': '윤택, 빛',
    '은': '은혜',
    '하': '크다',
    '아': '아름답다',
    '영': '꽃, 영롱',
  };
  return meanings[char];
}

/**
 * 오행 구성 분석
 */
function analyzeWuxingComposition(
  elements: WuXing[],
  saju: SajuData
): JakmeongAnalysis['wuxingComposition'] {
  const sajuElements = analyzeSajuElements(saju);
  const combined = [...sajuElements, ...elements];

  const counts = countElements(combined);
  const isBalanced = Object.values(counts).every(count =>
    count >= 1 && count <= 3
  );

  return {
    elements,
    balance: isBalanced ? '균형잡힘' : '불균형',
    isFavorable: isBalanced,
  };
}

/**
 * 사주 오행 분석
 */
function analyzeSajuElements(saju: SajuData): WuXing[] {
  const stemToElement: Record<HeavenlyStem, WuXing> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
  };

  return [
    stemToElement[saju.year.stem],
    stemToElement[saju.month.stem],
    stemToElement[saju.day.stem],
    stemToElement[saju.hour.stem],
  ];
}

/**
 * 오행 개수 세기
 */
function countElements(elements: WuXing[]): Record<WuXing, number> {
  return elements.reduce((acc, elem) => {
    acc[elem] = (acc[elem] || 0) + 1;
    return acc;
  }, {} as Record<WuXing, number>);
}

/**
 * 부족한 오행 찾기
 */
function findLackedElements(sajuElements: WuXing[]): WuXing[] {
  const counts = countElements(sajuElements);
  const allElements: WuXing[] = ['목', '화', '토', '금', '수'];

  return allElements.filter(elem => (counts[elem] || 0) === 0);
}

/**
 * 과한 오행 찾기
 */
function findExcessElements(sajuElements: WuXing[]): WuXing[] {
  const counts = countElements(sajuElements);

  return Object.entries(counts)
    .filter(([_, count]) => count >= 3)
    .map(([elem, _]) => elem as WuXing);
}

/**
 * 사주와의 조화 분석
 */
function analyzeHarmonyWithSaju(
  nameElements: WuXing[],
  saju: SajuData
): JakmeongAnalysis['harmonyWithSaju'] {
  const sajuElements = analyzeSajuElements(saju);
  const lackedElements = findLackedElements(sajuElements);

  const beneficialElements = nameElements.filter(elem =>
    lackedElements.includes(elem)
  );

  const score = beneficialElements.length > 0 ? 80 : 50;

  let description = '';
  if (beneficialElements.length > 0) {
    description = `부족한 ${beneficialElements.join(', ')} 오행을 보완하여 좋음`;
  } else {
    description = '사주와 무난한 관계';
  }

  return {
    score,
    description,
    補益Elements: beneficialElements,
  };
}

/**
 * 획수 분석 (성명학)
 */
function analyzeStrokes(strokes: number[]): JakmeongAnalysis['strokeAnalysis'] {
  if (strokes.length < 3) {
    // 성명이 3글자 미만
    return {
      totalStrokes: strokes.reduce((a, b) => a + b, 0),
      heavenGround: strokes[0] || 0,
      personalGround: 0,
      earthGround: 0,
      outerGround: 0,
      totalGround: 0,
      fortune: '분석 불가',
    };
  }

  const s1 = strokes[0] || 0;
  const s2 = strokes[1] || 0;
  const s3 = strokes[2] || 0;

  const heavenGround = s1 + 1; // 천격 (성 + 1)
  const personalGround = s1 + s2; // 인격 (성 + 이름 첫자)
  const earthGround = s2 + s3; // 지격 (이름 두 자)
  const outerGround = s1 + s3 + 1; // 외격
  const totalGround = s1 + s2 + s3; // 총격

  // 간단한 길흉 판단 (실제로는 더 복잡)
  const isGood = (n: number) => [1, 3, 5, 7, 8, 11, 13, 15, 16, 21, 23, 24, 25, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81].includes(n % 81);

  const goods = [heavenGround, personalGround, earthGround, outerGround, totalGround]
    .filter(isGood).length;

  let fortune = '';
  if (goods >= 4) fortune = '대길';
  else if (goods >= 3) fortune = '길';
  else if (goods >= 2) fortune = '평';
  else fortune = '흉';

  return {
    totalStrokes: totalGround,
    heavenGround,
    personalGround,
    earthGround,
    outerGround,
    totalGround,
    fortune,
  };
}

/**
 * 발음 분석
 */
function analyzePronunciation(name: string): JakmeongAnalysis['pronunciation'] {
  const chars = name.split('');

  // 간단한 발음 평가
  const hasHardConsonants = chars.some(c =>
    ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'].includes(extractChosung(c))
  );

  return {
    rhythm: '자연스러움',
    easyToPronounce: !hasHardConsonants && chars.length <= 4,
    easyToWrite: chars.every(c => getStrokeCount(c) <= 15),
  };
}

/**
 * 종합 평가
 */
function evaluateOverall(
  wuxing: JakmeongAnalysis['wuxingComposition'],
  harmony: JakmeongAnalysis['harmonyWithSaju'],
  strokes: JakmeongAnalysis['strokeAnalysis'],
  pronunciation: JakmeongAnalysis['pronunciation']
): JakmeongAnalysis['overall'] {
  let score = 50;

  if (wuxing.isFavorable) score += 20;
  score += harmony.score * 0.3;

  if (strokes.fortune === '대길') score += 15;
  else if (strokes.fortune === '길') score += 10;
  else if (strokes.fortune === '흉') score -= 10;

  if (pronunciation.easyToPronounce) score += 5;
  if (pronunciation.easyToWrite) score += 5;

  score = Math.min(100, Math.max(0, score));

  let grade: JakmeongAnalysis['overall']['grade'];
  if (score >= 95) grade = 'A+';
  else if (score >= 90) grade = 'A';
  else if (score >= 85) grade = 'B+';
  else if (score >= 80) grade = 'B';
  else if (score >= 75) grade = 'C+';
  else if (score >= 70) grade = 'C';
  else grade = 'D';

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (wuxing.isFavorable) strengths.push('오행 균형');
  if (harmony.score >= 70) strengths.push('사주 보완');
  if (strokes.fortune === '대길' || strokes.fortune === '길') strengths.push('획수 길함');
  if (pronunciation.easyToPronounce) strengths.push('발음 좋음');

  if (!wuxing.isFavorable) weaknesses.push('오행 불균형');
  if (harmony.score < 50) weaknesses.push('사주와 무관');
  if (strokes.fortune === '흉') weaknesses.push('획수 흉');
  if (!pronunciation.easyToPronounce) weaknesses.push('발음 어려움');

  return {
    score,
    grade,
    strengths: strengths.length > 0 ? strengths : ['보통'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['없음'],
  };
}

/**
 * 이름 후보 생성 (간단한 예시)
 */
function generateNameCandidates(
  _surname: string,
  targetElements: WuXing[],
  gender: 'male' | 'female',
  count: number
): { givenName: string; meanings: string[] }[] {
  // 오행별 한글 글자 풀 (간단한 예시)
  const elementChars: Record<WuXing, string[]> = {
    '목': ['경', '규', '근', '기', '건'],
    '화': ['나', '단', '동', '태', '대'],
    '토': ['미', '만', '민', '명', '무'],
    '금': ['서', '성', '소', '수', '승'],
    '수': ['우', '원', '윤', '은', '영'],
  };

  const genderChars = {
    male: ['준', '민', '우', '진', '현', '성', '호', '규', '승'],
    female: ['서', '지', '은', '아', '윤', '하', '유', '예', '나'],
  };

  const candidates: { givenName: string; meanings: string[] }[] = [];

  // 간단하게 조합 생성
  for (let i = 0; i < count; i++) {
    const elem1 = targetElements[i % targetElements.length];

    const char1Pool = elementChars[elem1 || '목'] || genderChars[gender];
    const char2Pool = genderChars[gender];

    const char1 = char1Pool[i % char1Pool.length] || '미';
    const char2 = char2Pool[(i + 1) % char2Pool.length] || '소';

    candidates.push({
      givenName: `${char1}${char2}`,
      meanings: [
        getCharacterMeaning(char1) || '좋은 의미',
        getCharacterMeaning(char2) || '훌륭한 의미',
      ],
    });
  }

  return candidates;
}
