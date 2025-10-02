/**
 * Phase 3.3: 성능 최적화 캐싱 시스템
 * LRU 캐시 기반 계산 결과 캐싱으로 성능 향상
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

/**
 * LRU (Least Recently Used) 캐시 구현
 */
export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 1000, ttlMinutes: number = 60) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * 캐시에서 값 가져오기
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // TTL 체크
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Hit count 증가
    entry.hits++;
    entry.timestamp = now;

    // LRU: 최근 사용한 항목을 맨 뒤로 이동
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * 캐시에 값 저장
   */
  set(key: K, value: V): void {
    // 이미 존재하면 업데이트
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 캐시가 가득 찼으면 가장 오래된 항목 제거
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    // 새 항목 추가
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * 캐시 클리어
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 캐시 통계
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    entries: number;
  } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }

    const entries = this.cache.size;
    const hitRate = entries > 0 ? totalHits / entries : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      totalHits,
      entries,
    };
  }

  /**
   * 만료된 항목 정리
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * 전역 캐시 인스턴스
 */
export const sajuCache = new LRUCache<string, any>(1000, 60); // 1000개, 60분 TTL
export const daeUnCache = new LRUCache<string, any>(500, 120); // 500개, 120분 TTL
export const yongSinCache = new LRUCache<string, any>(500, 120); // 500개, 120분 TTL

/**
 * 캐시 키 생성 헬퍼
 */
export function generateSajuCacheKey(
  birthDate: string,
  birthTime: string,
  calendar: string,
  isLeapMonth: boolean,
  gender: string
): string {
  return `saju:${birthDate}:${birthTime}:${calendar}:${isLeapMonth}:${gender}`;
}

export function generateDaeUnCacheKey(
  birthDate: string,
  yearStem: string,
  monthStem: string,
  gender: string
): string {
  return `daeun:${birthDate}:${yearStem}:${monthStem}:${gender}`;
}

export function generateYongSinCacheKey(sajuKey: string): string {
  return `yongsin:${sajuKey}`;
}

/**
 * 자동 캐시 정리 (1시간마다)
 */
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const sajuCleaned = sajuCache.cleanup();
      const daeUnCleaned = daeUnCache.cleanup();
      const yongSinCleaned = yongSinCache.cleanup();

      if (sajuCleaned + daeUnCleaned + yongSinCleaned > 0) {
        console.log(
          `[Cache Cleanup] 만료된 캐시 ${sajuCleaned + daeUnCleaned + yongSinCleaned}개 정리 완료`
        );
      }
    },
    60 * 60 * 1000
  ); // 1시간마다
}

/**
 * 캐시 통계 출력
 */
export function logCacheStats(): void {
  const sajuStats = sajuCache.getStats();
  const daeUnStats = daeUnCache.getStats();
  const yongSinStats = yongSinCache.getStats();

  console.log('\n=== 캐시 통계 ===');
  console.log(
    `사주 캐시: ${sajuStats.size}/${sajuStats.maxSize} (히트율: ${(sajuStats.hitRate * 100).toFixed(1)}%, 총 히트: ${sajuStats.totalHits})`
  );
  console.log(
    `대운 캐시: ${daeUnStats.size}/${daeUnStats.maxSize} (히트율: ${(daeUnStats.hitRate * 100).toFixed(1)}%, 총 히트: ${daeUnStats.totalHits})`
  );
  console.log(
    `용신 캐시: ${yongSinStats.size}/${yongSinStats.maxSize} (히트율: ${(yongSinStats.hitRate * 100).toFixed(1)}%, 총 히트: ${yongSinStats.totalHits})`
  );
  console.log('================\n');
}
