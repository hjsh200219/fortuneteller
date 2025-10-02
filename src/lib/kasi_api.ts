/**
 * 한국천문연구원(KASI) Open API 클라이언트
 * 음양력 변환 API 연동
 *
 * Contingency 시스템:
 * 1. Circuit Breaker: API 장애 시 자동 차단 및 복구
 * 2. 캐싱: 중복 요청 방지 및 성능 향상
 * 3. 재시도 로직: 네트워크 일시 장애 대응
 * 4. 로컬 테이블 폴백: API 완전 장애 시 로컬 데이터 사용
 * 5. 타임아웃: 무한 대기 방지
 */

import { kasiAPIMonitor } from './api_health.js';
import {
  solarToLunarCache,
  lunarToSolarCache,
  generateCacheKey,
} from './api_cache.js';
import {
  solarToLunarLocal,
  lunarToSolarLocal,
  isYearSupported,
} from '../data/lunar_table.js';

/**
 * API 응답 타입
 */
export interface KASILunarResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: KASILunarItem[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface KASISolarResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: KASISolarItem[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 음력 정보 아이템
 */
export interface KASILunarItem {
  lunYear: string;
  lunMonth: string;
  lunDay: string;
  lunLeapmonth: string;
  lunNday: string;
  lunSecha: string;
  lunWolgeon: string;
  lunIljin: string;
  solYear: string;
  solMonth: string;
  solDay: string;
  solWeek: string;
  solJd: string;
}

/**
 * 양력 정보 아이템
 */
export interface KASISolarItem {
  solYear: string;
  solMonth: string;
  solDay: string;
  solWeek: string;
  solJd: string;
  lunYear: string;
  lunMonth: string;
  lunDay: string;
  lunLeapmonth: string;
  lunNday: string;
  lunSecha: string;
  lunWolgeon: string;
  lunIljin: string;
}

/**
 * API 설정
 */
const KASI_API_BASE_URL = 'http://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService';
const API_TIMEOUT = 5000; // 5초
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

/**
 * 환경 변수에서 API 키 가져오기
 */
function getAPIKey(): string {
  const apiKey = process.env.KASI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'KASI_API_KEY가 설정되지 않았습니다. .env 파일에 API 키를 추가하세요.\n' +
        'API 키 발급: https://www.data.go.kr/data/15012679/openapi.do'
    );
  }
  return apiKey;
}

/**
 * 타임아웃이 있는 fetch
 */
async function fetchWithTimeout(url: string, timeout: number = API_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`API 요청 타임아웃 (${timeout}ms)`);
    }
    throw error;
  }
}

/**
 * 재시도 로직이 있는 API 호출
 */
async function retryFetch(
  url: string,
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`[KASI API] Attempt ${attempt}/${retries} failed:`, error);

      if (attempt < retries) {
        // 지수 백오프: 1초, 2초, 4초...
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('API 요청 실패');
}

/**
 * 양력 → 음력 변환
 */
export async function solarToLunarKASI(
  solYear: number,
  solMonth: number,
  solDay: number
): Promise<KASISolarItem> {
  // 1. 캐시 확인
  const cacheKey = generateCacheKey(solYear, solMonth, solDay, 'solar');
  const cached = solarToLunarCache.get(cacheKey);
  if (cached) {
    console.log(`[KASI API] Cache hit: ${cacheKey}`);
    return cached;
  }

  // 2. Circuit Breaker 확인
  const canAttempt = kasiAPIMonitor.canAttempt();
  if (!canAttempt.allowed) {
    console.warn(`[KASI API] ${canAttempt.reason}`);
    throw new Error(`Circuit breaker is OPEN: ${canAttempt.reason}`);
  }

  const startTime = Date.now();

  try {
    // 3. API 호출
    const apiKey = getAPIKey();
    const url = new URL(`${KASI_API_BASE_URL}/getSolCalInfo`);

    url.searchParams.append('serviceKey', apiKey);
    url.searchParams.append('solYear', String(solYear));
    url.searchParams.append('solMonth', String(solMonth).padStart(2, '0'));
    url.searchParams.append('solDay', String(solDay).padStart(2, '0'));
    url.searchParams.append('_type', 'json');

    const response = await retryFetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as KASISolarResponse;

    if (data.response.header.resultCode !== '00') {
      throw new Error(`API Error: ${data.response.header.resultMsg}`);
    }

    const items = data.response.body.items.item;
    if (!items || items.length === 0) {
      throw new Error('No results found');
    }

    const result = items[0]!;

    // 4. 성공 기록
    const responseTime = Date.now() - startTime;
    kasiAPIMonitor.recordSuccess(responseTime);

    // 5. 캐시 저장
    solarToLunarCache.set(cacheKey, result);

    console.log(`[KASI API] Success: ${cacheKey} (${responseTime}ms)`);
    return result;
  } catch (error) {
    // 6. 실패 기록
    kasiAPIMonitor.recordFailure(error as Error);
    throw error;
  }
}

/**
 * 음력 → 양력 변환
 */
export async function lunarToSolarKASI(
  lunYear: number,
  lunMonth: number,
  lunDay: number,
  isLeapMonth: boolean = false
): Promise<KASILunarItem> {
  // 1. 캐시 확인
  const cacheKey = generateCacheKey(lunYear, lunMonth, lunDay, 'lunar', isLeapMonth);
  const cached = lunarToSolarCache.get(cacheKey);
  if (cached) {
    console.log(`[KASI API] Cache hit: ${cacheKey}`);
    return cached;
  }

  // 2. Circuit Breaker 확인
  const canAttempt = kasiAPIMonitor.canAttempt();
  if (!canAttempt.allowed) {
    console.warn(`[KASI API] ${canAttempt.reason}`);
    throw new Error(`Circuit breaker is OPEN: ${canAttempt.reason}`);
  }

  const startTime = Date.now();

  try {
    // 3. API 호출
    const apiKey = getAPIKey();
    const url = new URL(`${KASI_API_BASE_URL}/getLunCalInfo`);

    url.searchParams.append('serviceKey', apiKey);
    url.searchParams.append('lunYear', String(lunYear));
    url.searchParams.append('lunMonth', String(lunMonth).padStart(2, '0'));
    url.searchParams.append('lunDay', String(lunDay).padStart(2, '0'));
    url.searchParams.append('lunLeapmonth', isLeapMonth ? '윤달' : '평달');
    url.searchParams.append('_type', 'json');

    const response = await retryFetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as KASILunarResponse;

    if (data.response.header.resultCode !== '00') {
      throw new Error(`API Error: ${data.response.header.resultMsg}`);
    }

    const items = data.response.body.items.item;
    if (!items || items.length === 0) {
      throw new Error('No results found');
    }

    const result = items[0]!;

    // 4. 성공 기록
    const responseTime = Date.now() - startTime;
    kasiAPIMonitor.recordSuccess(responseTime);

    // 5. 캐시 저장
    lunarToSolarCache.set(cacheKey, result);

    console.log(`[KASI API] Success: ${cacheKey} (${responseTime}ms)`);
    return result;
  } catch (error) {
    // 6. 실패 기록
    kasiAPIMonitor.recordFailure(error as Error);
    throw error;
  }
}

/**
 * 양력 → 음력 변환 (로컬 테이블 폴백 포함)
 */
export async function solarToLunarWithFallback(
  solYear: number,
  solMonth: number,
  solDay: number
): Promise<KASISolarItem> {
  try {
    // 1차: KASI API 시도
    return await solarToLunarKASI(solYear, solMonth, solDay);
  } catch (apiError) {
    console.warn('[KASI API] Failed, trying local table...', apiError);

    // 2차: 로컬 테이블 시도
    if (isYearSupported(solYear)) {
      const localResult = solarToLunarLocal(solYear, solMonth, solDay);
      if (localResult) {
        console.log('[Local Table] Success');
        // KASISolarItem 형식으로 변환
        return {
          solYear: String(solYear),
          solMonth: String(solMonth).padStart(2, '0'),
          solDay: String(solDay).padStart(2, '0'),
          solWeek: '',
          solJd: '',
          lunYear: String(localResult.year),
          lunMonth: String(localResult.month).padStart(2, '0'),
          lunDay: String(localResult.day).padStart(2, '0'),
          lunLeapmonth: localResult.isLeapMonth ? '윤달' : '평달',
          lunNday: '',
          lunSecha: '',
          lunWolgeon: '',
          lunIljin: '',
        };
      }
    }

    // 3차: 로컬 테이블도 실패하면 원래 에러 전파
    throw apiError;
  }
}

/**
 * 음력 → 양력 변환 (로컬 테이블 폴백 포함)
 */
export async function lunarToSolarWithFallback(
  lunYear: number,
  lunMonth: number,
  lunDay: number,
  isLeapMonth: boolean = false
): Promise<KASILunarItem> {
  try {
    // 1차: KASI API 시도
    return await lunarToSolarKASI(lunYear, lunMonth, lunDay, isLeapMonth);
  } catch (apiError) {
    console.warn('[KASI API] Failed, trying local table...', apiError);

    // 2차: 로컬 테이블 시도
    if (isYearSupported(lunYear)) {
      const localResult = lunarToSolarLocal(lunYear, lunMonth, lunDay, isLeapMonth);
      if (localResult) {
        console.log('[Local Table] Success');
        // KASILunarItem 형식으로 변환
        return {
          lunYear: String(lunYear),
          lunMonth: String(lunMonth).padStart(2, '0'),
          lunDay: String(lunDay).padStart(2, '0'),
          lunLeapmonth: isLeapMonth ? '윤달' : '평달',
          lunNday: '',
          lunSecha: '',
          lunWolgeon: '',
          lunIljin: '',
          solYear: String(localResult.year),
          solMonth: String(localResult.month).padStart(2, '0'),
          solDay: String(localResult.day).padStart(2, '0'),
          solWeek: '',
          solJd: '',
        };
      }
    }

    // 3차: 로컬 테이블도 실패하면 원래 에러 전파
    throw apiError;
  }
}

/**
 * 간지(干支) 정보 추출
 */
export function extractGanJiInfo(item: KASISolarItem | KASILunarItem): {
  yearGanJi: string;
  monthGanJi: string;
  dayGanJi: string;
} {
  return {
    yearGanJi: item.lunSecha || '',
    monthGanJi: item.lunWolgeon || '',
    dayGanJi: item.lunIljin || '',
  };
}

/**
 * API 상태 조회
 */
export function getAPIStatus() {
  return {
    health: kasiAPIMonitor.getHealthInfo(),
    circuit: kasiAPIMonitor.getCircuitState(),
  };
}

/**
 * 통합 상태 보고서
 */
export function getStatusReport(): string {
  return `
${kasiAPIMonitor.getStatusReport()}

${solarToLunarCache.getReport()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 음력→양력 캐시
${lunarToSolarCache.getReport()}
`.trim();
}
