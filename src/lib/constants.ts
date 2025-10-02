/**
 * 사주 분석 공통 상수
 *
 * 여러 라이브러리에서 공통으로 사용되는 상수들을 정의
 */

import type { EarthlyBranch, HeavenlyStem } from '../types/index.js';

/**
 * 육합 (六合) - 지지의 조화
 */
export const SIX_HARMONY: Record<EarthlyBranch, EarthlyBranch> = {
  '자': '축', '인': '해', '묘': '술', '진': '유',
  '사': '신', '오': '미', '축': '자', '해': '인',
  '술': '묘', '유': '진', '신': '사', '미': '오',
} as const;

/**
 * 지지 충 (地支沖) - 지지의 충돌
 */
export const EARTHLY_CONFLICTS: Record<EarthlyBranch, EarthlyBranch> = {
  '자': '오', '축': '미', '인': '신', '묘': '유',
  '진': '술', '사': '해', '오': '자', '미': '축',
  '신': '인', '유': '묘', '술': '진', '해': '사',
} as const;

/**
 * 삼합 (三合) - 지지의 삼합 그룹
 */
export const TRIPLE_HARMONY: Record<string, EarthlyBranch[]> = {
  '목국': ['인', '묘', '진'],
  '화국': ['사', '오', '미'],
  '금국': ['신', '유', '술'],
  '수국': ['해', '자', '축'],
} as const;

/**
 * 천간합 (天干合) - 천간의 조화
 */
export const HEAVENLY_HARMONY: Record<HeavenlyStem, HeavenlyStem> = {
  '갑': '기', '을': '경', '병': '신', '정': '임', '무': '계',
  '기': '갑', '경': '을', '신': '병', '임': '정', '계': '무',
} as const;

/**
 * 십이신살 (十二神煞) 이름
 */
export const TWELVE_GODS = [
  '건', '제', '만', '평', '정', '집', '파', '위', '성', '수', '개', '폐'
] as const;

/**
 * 십이신살 설명
 */
export const TWELVE_GODS_INFO: Record<string, { desc: string; lucky: boolean }> = {
  '건': { desc: '만사 시작에 길하나 이사는 불길', lucky: true },
  '제': { desc: '액막이, 청소, 치료에 길함', lucky: true },
  '만': { desc: '모든 일이 가득 차니 새 일은 불길', lucky: false },
  '평': { desc: '평온하여 일상적 일은 무난', lucky: true },
  '정': { desc: '정착, 계약, 혼인에 길함', lucky: true },
  '집': { desc: '집착하니 소송, 싸움 조심', lucky: false },
  '파': { desc: '파괴의 날, 모든 일 불길', lucky: false },
  '위': { desc: '위험한 날, 조심해야 함', lucky: false },
  '성': { desc: '성취, 개업, 취업에 길함', lucky: true },
  '수': { desc: '수확, 거래, 매매에 길함', lucky: true },
  '개': { desc: '개통, 개업, 시작에 대길', lucky: true },
  '폐': { desc: '폐쇄, 마무리에는 좋으나 시작은 불길', lucky: false },
} as const;

/**
 * 지지 배열
 */
export const EARTHLY_BRANCHES: readonly EarthlyBranch[] = [
  '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'
] as const;

/**
 * 천간 배열
 */
export const HEAVENLY_STEMS: readonly HeavenlyStem[] = [
  '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'
] as const;

/**
 * 시간대 범위 (12시진)
 */
export const TIME_RANGES = [
  '23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00',
  '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
  '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00',
] as const;

/**
 * 월별 지지 (입춘 기준)
 */
export const MONTH_BRANCHES: readonly EarthlyBranch[] = [
  '인', '묘', '진', '사', '오', '미',
  '신', '유', '술', '해', '자', '축',
] as const;

/**
 * 운세 등급
 */
export const FORTUNE_RATINGS = {
  EXCELLENT: '대길',
  GOOD: '길',
  NORMAL: '평',
  BAD: '흉',
  TERRIBLE: '대흉',
} as const;

/**
 * 일진 등급
 */
export const DAY_RATINGS = {
  EXCELLENT: '대길일',
  GOOD: '길일',
  NORMAL: '평일',
  BAD: '흉일',
  TERRIBLE: '대흉일',
} as const;

/**
 * 기준 년도 (갑자년 계산용)
 */
export const BASE_YEAR = 4;

/**
 * 기준 날짜 (일주 계산용 - 1900년 1월 1일 = 병자일)
 */
export const BASE_DATE = new Date(1900, 0, 1);
export const BASE_DAY_STEM_INDEX = 2; // 병(丙)
export const BASE_DAY_BRANCH_INDEX = 0; // 자(子)

/**
 * 점수 범위 상수
 */
export const SCORE_RANGES = {
  MAX: 100,
  MIN: 0,
  EXCELLENT_THRESHOLD: 80,
  GOOD_THRESHOLD: 60,
  NORMAL_THRESHOLD: 40,
  BAD_THRESHOLD: 20,
} as const;
