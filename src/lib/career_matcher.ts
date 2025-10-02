/**
 * 현대 직업 매칭 엔진
 * Modern Career Matching Engine
 *
 * 사주 + 십성 + 오행 + 용신을 기반으로 최적 직업 추천
 */

import type { SajuData, TenGod, WuXing } from '../types/index.js';
import type { UserInterpretationSettings } from '../types/interpretation.js';
import { MODERN_CAREERS_DB, type CareerInfo } from '../data/modern_careers.js';
import { YongSinSelector } from './yongsin/selector.js';

/**
 * 직업 매칭 결과
 */
export interface CareerMatch {
  /** 직업 정보 */
  career: CareerInfo;
  /** 매칭 점수 (0-100) */
  matchScore: number;
  /** 매칭 이유 */
  matchReasons: string[];
  /** 십성 일치도 */
  tenGodMatch: number;
  /** 오행 일치도 */
  elementMatch: number;
  /** 용신 일치도 */
  yongSinMatch: number;
  /** 현대성 점수 */
  modernityScore: number;
}

/**
 * 직업 매칭 옵션
 */
export interface CareerMatchOptions {
  /** 원격 근무 선호 */
  preferRemote?: boolean;
  /** 글로벌 기회 선호 */
  preferGlobal?: boolean;
  /** 최소 매칭 점수 */
  minScore?: number;
  /** 최대 결과 수 */
  maxResults?: number;
  /** 카테고리 필터 */
  categoryFilter?: string[];
}

/**
 * 직업 매칭 엔진
 */
export class CareerMatcher {
  /**
   * 사주 기반 직업 추천
   */
  static matchCareers(
    sajuData: SajuData,
    settings: UserInterpretationSettings,
    options: CareerMatchOptions = {}
  ): CareerMatch[] {
    const {
      preferRemote = false,
      preferGlobal = false,
      minScore = 60,
      maxResults = 20,
      categoryFilter,
    } = options;

    // 용신 결정
    const yongSinResult = YongSinSelector.select(sajuData, settings.yongSinMethod);

    // 십성 분포 계산
    const tenGodDistribution = this.calculateTenGodDistribution(sajuData);

    // 필터링된 직업 목록
    let careers = MODERN_CAREERS_DB;

    if (categoryFilter && categoryFilter.length > 0) {
      careers = careers.filter((c) => categoryFilter.includes(c.category));
    }

    // 각 직업 매칭 점수 계산
    const matches: CareerMatch[] = careers.map((career) => {
      const tenGodMatch = this.calculateTenGodMatch(career, tenGodDistribution);
      const elementMatch = this.calculateElementMatch(career, sajuData.wuxingCount, yongSinResult.primaryYongSin);
      const yongSinMatch = this.calculateYongSinMatch(career, yongSinResult.primaryYongSin, yongSinResult.secondaryYongSin);
      const modernityScore = this.calculateModernityScore(career, settings);

      // 가중 평균 계산
      let matchScore =
        tenGodMatch * 0.35 +
        elementMatch * 0.25 +
        yongSinMatch * 0.2 +
        modernityScore * 0.2;

      // 원격/글로벌 선호도 반영
      if (preferRemote && career.remoteWorkPossible) {
        matchScore += 5;
      }
      if (preferGlobal && career.globalOpportunity) {
        matchScore += 5;
      }

      // 매칭 이유 생성
      const matchReasons = this.generateMatchReasons(
        career,
        tenGodMatch,
        elementMatch,
        yongSinMatch,
        tenGodDistribution
      );

      return {
        career,
        matchScore: Math.min(100, matchScore),
        matchReasons,
        tenGodMatch,
        elementMatch,
        yongSinMatch,
        modernityScore,
      };
    });

    // 점수 기준 정렬 및 필터링
    return matches
      .filter((m) => m.matchScore >= minScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults);
  }

  /**
   * 십성 분포 계산
   */
  private static calculateTenGodDistribution(sajuData: SajuData): Record<TenGod, number> {
    const distribution = sajuData.tenGodsDistribution;
    if (distribution) {
      return distribution;
    }

    // 분포가 없으면 빈 객체 반환
    return {
      비견: 0,
      겁재: 0,
      식신: 0,
      상관: 0,
      편재: 0,
      정재: 0,
      편관: 0,
      정관: 0,
      편인: 0,
      정인: 0,
    };
  }

  /**
   * 십성 매칭 점수 계산
   */
  private static calculateTenGodMatch(
    career: CareerInfo,
    distribution: Record<TenGod, number>
  ): number {
    let score = 0;

    // 주요 십성 매칭 (가중치 높음)
    for (const tenGod of career.primaryTenGods) {
      const count = distribution[tenGod] || 0;
      score += count * 20; // 최대 60점 (3개 * 20)
    }

    // 보조 십성 매칭 (가중치 낮음)
    if (career.secondaryTenGods) {
      for (const tenGod of career.secondaryTenGods) {
        const count = distribution[tenGod] || 0;
        score += count * 10; // 최대 40점
      }
    }

    return Math.min(100, score);
  }

  /**
   * 오행 매칭 점수 계산
   */
  private static calculateElementMatch(
    career: CareerInfo,
    wuxingCount: Record<WuXing, number>,
    primaryYongSin: WuXing
  ): number {
    let score = 0;

    // 주요 오행 매칭
    for (const element of career.primaryElements) {
      const count = wuxingCount[element] || 0;
      score += count * 15;

      // 용신과 일치하면 보너스
      if (element === primaryYongSin) {
        score += 20;
      }
    }

    // 보조 오행 매칭
    if (career.secondaryElements) {
      for (const element of career.secondaryElements) {
        const count = wuxingCount[element] || 0;
        score += count * 8;
      }
    }

    return Math.min(100, score);
  }

  /**
   * 용신 매칭 점수 계산
   */
  private static calculateYongSinMatch(
    career: CareerInfo,
    primaryYongSin: WuXing,
    secondaryYongSin?: WuXing
  ): number {
    let score = 0;

    // 주요 오행과 용신 일치
    if (career.primaryElements.includes(primaryYongSin)) {
      score += 60;
    }

    // 보조 오행과 용신 일치
    if (secondaryYongSin && career.primaryElements.includes(secondaryYongSin)) {
      score += 30;
    }

    // 보조 오행과 용신 일치
    if (career.secondaryElements) {
      if (career.secondaryElements.includes(primaryYongSin)) {
        score += 20;
      }
      if (secondaryYongSin && career.secondaryElements.includes(secondaryYongSin)) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  /**
   * 현대성 점수 계산
   */
  private static calculateModernityScore(
    career: CareerInfo,
    settings: UserInterpretationSettings
  ): number {
    let score = 50; // 기본 점수

    // 현대 직업 DB 활성화
    if (settings.eraAdaptation.modernCareer) {
      score += 20;
    }

    // 글로벌 컨텍스트
    if (settings.eraAdaptation.globalContext && career.globalOpportunity) {
      score += 15;
    }

    // IT/기술 산업
    if (settings.eraAdaptation.techIndustry && career.category === 'IT/기술') {
      score += 15;
    }

    // 현대 트렌드 반영
    if (career.modernTrends && career.modernTrends.length > 0) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * 매칭 이유 생성
   */
  private static generateMatchReasons(
    career: CareerInfo,
    tenGodMatch: number,
    elementMatch: number,
    yongSinMatch: number,
    distribution: Record<TenGod, number>
  ): string[] {
    const reasons: string[] = [];

    // 십성 매칭 이유
    if (tenGodMatch >= 60) {
      const strongTenGods = career.primaryTenGods.filter((tg) => (distribution[tg] || 0) >= 2);
      if (strongTenGods.length > 0) {
        reasons.push(`${strongTenGods.join(', ')} 십성이 강해 이 분야에 적합합니다`);
      }
    }

    // 오행 매칭 이유
    if (elementMatch >= 60) {
      reasons.push(`${career.primaryElements.join(', ')} 오행과 잘 맞습니다`);
    }

    // 용신 매칭 이유
    if (yongSinMatch >= 60) {
      reasons.push('용신과 직업 오행이 일치하여 발전 가능성이 높습니다');
    }

    // 직업 특성
    reasons.push(career.recommendationReason);

    // 현대 트렌드
    if (career.modernTrends && career.modernTrends.length > 0) {
      reasons.push(`현대 트렌드: ${career.modernTrends.slice(0, 2).join(', ')}`);
    }

    return reasons;
  }

  /**
   * 카테고리별 추천 직업
   */
  static getCareersByCategory(category: string): CareerInfo[] {
    return MODERN_CAREERS_DB.filter((c) => c.category === category);
  }

  /**
   * 원격 근무 가능 직업
   */
  static getRemoteCareers(): CareerInfo[] {
    return MODERN_CAREERS_DB.filter((c) => c.remoteWorkPossible);
  }

  /**
   * 글로벌 기회 직업
   */
  static getGlobalCareers(): CareerInfo[] {
    return MODERN_CAREERS_DB.filter((c) => c.globalOpportunity);
  }
}
