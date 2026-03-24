/**
 * API 응답 캐싱 시스템
 * 음양력 변환 결과를 메모리에 캐싱하여 API 호출 최소화
 */

/**
 * 음양력 변환 결과 타입
 */
export interface CalendarConversionResult {
  year: number;
  month: number;
  day: number;
  isLeapMonth?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
}

/**
 * LRU (Least Recently Used) 캐시 구현
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly ttl: number; // Time To Live (ms)
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxSize: number = 1000, ttl: number = 86400000) {
    // 기본: 1000개, 24시간
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * 캐시에서 데이터 조회
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // TTL 확인
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // 히트 카운트 증가
    entry.hits++;
    this.hits++;

    // LRU: 최근 사용 항목을 맨 뒤로 이동
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  /**
   * 캐시에 데이터 저장
   */
  set(key: string, data: T): void {
    // 기존 항목 제거
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 크기 제한 확인
    if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목(첫 번째 항목) 제거
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // 새 항목 추가
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * 캐시 항목 삭제
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 캐시 전체 삭제
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 만료된 항목 정리
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * 캐시 통계 조회
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    let oldestEntry = Date.now();
    let newestEntry = 0;

    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * 캐시 크기 조회
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 캐시 보고서 생성
   */
  getReport(): string {
    const stats = this.getStats();
    const total = stats.hits + stats.misses;

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 캐시 상태 보고서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 캐시 크기: ${stats.size}/${this.maxSize}
⏱️  TTL: ${this.ttl / 1000}초

📊 통계:
  - 총 요청: ${total}회
  - 캐시 히트: ${stats.hits}회
  - 캐시 미스: ${stats.misses}회
  - 히트율: ${stats.hitRate.toFixed(1)}%

${stats.size > 0 ? `⏰ 캐시 기간:
  - 가장 오래된 항목: ${new Date(stats.oldestEntry).toISOString()}
  - 가장 최근 항목: ${new Date(stats.newestEntry).toISOString()}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
  }
}

/**
 * 음양력 변환 캐시 키 생성
 */
export function generateCacheKey(
  year: number,
  month: number,
  day: number,
  type: 'solar' | 'lunar',
  isLeapMonth?: boolean
): string {
  const leap = isLeapMonth ? '_leap' : '';
  return `${type}_${year}_${month}_${day}${leap}`;
}

// 싱글톤 캐시 인스턴스
export const solarToLunarCache = new LRUCache<CalendarConversionResult>(1000, 86400000); // 24시간
export const lunarToSolarCache = new LRUCache<CalendarConversionResult>(1000, 86400000); // 24시간

/**
 * 캐시 정리 스케줄러 (1시간마다)
 */
let cleanupInterval: NodeJS.Timeout | null = null;

export function startCacheCleanup(): void {
  if (cleanupInterval) {
    return; // 이미 실행 중
  }

  cleanupInterval = setInterval(
    () => {
      const solarRemoved = solarToLunarCache.cleanup();
      const lunarRemoved = lunarToSolarCache.cleanup();

      if (solarRemoved > 0 || lunarRemoved > 0) {
        console.log(
          `[Cache Cleanup] Removed ${solarRemoved + lunarRemoved} expired entries`
        );
      }
    },
    3600000 // 1시간
  );
}

export function stopCacheCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

// 자동 시작
startCacheCleanup();
