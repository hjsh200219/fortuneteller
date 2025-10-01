/**
 * 24절기(二十四節氣) 데이터
 * 사주 계산에서 월주를 정하는데 중요한 기준
 */

import type { SolarTerm } from '../types/index.js';

export interface SolarTermData {
  name: SolarTerm;
  hanja: string;
  month: number; // 양력 대략 월
  description: string;
}

export const SOLAR_TERMS: SolarTermData[] = [
  { name: '입춘', hanja: '立春', month: 2, description: '봄의 시작' },
  { name: '우수', hanja: '雨水', month: 2, description: '눈이 녹아 비가 됨' },
  { name: '경칩', hanja: '驚蟄', month: 3, description: '개구리가 겨울잠에서 깸' },
  { name: '춘분', hanja: '春分', month: 3, description: '낮과 밤의 길이가 같음' },
  { name: '청명', hanja: '淸明', month: 4, description: '날씨가 맑고 따뜻함' },
  { name: '곡우', hanja: '穀雨', month: 4, description: '농사를 시작하는 비' },
  { name: '입하', hanja: '立夏', month: 5, description: '여름의 시작' },
  { name: '소만', hanja: '小滿', month: 5, description: '만물이 점차 자람' },
  { name: '망종', hanja: '芒種', month: 6, description: '곡식의 씨를 뿌림' },
  { name: '하지', hanja: '夏至', month: 6, description: '일년 중 낮이 가장 김' },
  { name: '소서', hanja: '小暑', month: 7, description: '본격적인 더위 시작' },
  { name: '대서', hanja: '大暑', month: 7, description: '가장 더운 시기' },
  { name: '입추', hanja: '立秋', month: 8, description: '가을의 시작' },
  { name: '처서', hanja: '處暑', month: 8, description: '더위가 그침' },
  { name: '백로', hanja: '白露', month: 9, description: '이슬이 맺히기 시작' },
  { name: '추분', hanja: '秋分', month: 9, description: '낮과 밤의 길이가 같음' },
  { name: '한로', hanja: '寒露', month: 10, description: '찬 이슬이 맺힘' },
  { name: '상강', hanja: '霜降', month: 10, description: '서리가 내리기 시작' },
  { name: '입동', hanja: '立冬', month: 11, description: '겨울의 시작' },
  { name: '소설', hanja: '小雪', month: 11, description: '첫눈이 내림' },
  { name: '대설', hanja: '大雪', month: 12, description: '눈이 많이 내림' },
  { name: '동지', hanja: '冬至', month: 12, description: '일년 중 밤이 가장 김' },
  { name: '소한', hanja: '小寒', month: 1, description: '작은 추위' },
  { name: '대한', hanja: '大寒', month: 1, description: '가장 추운 시기' },
];

/**
 * 특정 연도의 24절기 날짜 계산
 * 간략한 근사식 사용 (정확도: ±1일)
 */
export interface SolarTermDate {
  term: SolarTerm;
  date: Date;
}

/**
 * 24절기 대략적인 날짜 (양력)
 * 실제로는 매년 조금씩 달라지므로 정밀한 계산이 필요
 */
export const SOLAR_TERM_APPROXIMATE_DATES: Record<SolarTerm, [number, number]> = {
  입춘: [2, 4],
  우수: [2, 19],
  경칩: [3, 6],
  춘분: [3, 21],
  청명: [4, 5],
  곡우: [4, 20],
  입하: [5, 6],
  소만: [5, 21],
  망종: [6, 6],
  하지: [6, 21],
  소서: [7, 7],
  대서: [7, 23],
  입추: [8, 8],
  처서: [8, 23],
  백로: [9, 8],
  추분: [9, 23],
  한로: [10, 8],
  상강: [10, 23],
  입동: [11, 7],
  소설: [11, 22],
  대설: [12, 7],
  동지: [12, 22],
  소한: [1, 6],
  대한: [1, 20],
};

/**
 * 특정 날짜가 어느 절기와 절기 사이인지 판단
 */
export function getCurrentSolarTerm(date: Date): SolarTerm {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 간단한 방식: 날짜로 절기 추정
  for (let i = 0; i < SOLAR_TERMS.length; i++) {
    const term = SOLAR_TERMS[i]!;
    const [termMonth, termDay] = SOLAR_TERM_APPROXIMATE_DATES[term.name]!;

    const nextIndex = (i + 1) % SOLAR_TERMS.length;
    const nextTerm = SOLAR_TERMS[nextIndex]!;
    const [nextMonth, nextDay] = SOLAR_TERM_APPROXIMATE_DATES[nextTerm.name]!;

    // 현재 절기와 다음 절기 사이인지 확인
    if (month === termMonth && day >= termDay) {
      if (nextMonth === termMonth) {
        if (day < nextDay) {
          return term.name;
        }
      } else {
        return term.name;
      }
    } else if (month === nextMonth && day < nextDay && termMonth < nextMonth) {
      return term.name;
    }
  }

  // 기본값: 입춘
  return '입춘';
}

/**
 * 절기로부터 월주의 지지 인덱스 얻기
 * 입춘부터 시작 (인월, 寅月)
 */
export function getSolarTermMonthIndex(term: SolarTerm): number {
  const termIndex = SOLAR_TERMS.findIndex((t) => t.name === term);
  // 입춘(0)부터 시작, 2개 절기당 1개월
  return Math.floor(termIndex / 2);
}

