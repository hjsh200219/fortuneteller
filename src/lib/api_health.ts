/**
 * API 상태 모니터링 및 Circuit Breaker 시스템
 * KASI API 장애 대응 및 자동 복구
 */

export enum APIStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  DOWN = 'down',
}

export enum CircuitState {
  CLOSED = 'closed', // 정상 동작
  OPEN = 'open', // 차단됨 (실패 많음)
  HALF_OPEN = 'half_open', // 복구 시도 중
}

/**
 * API 상태 정보
 */
export interface APIHealthInfo {
  status: APIStatus;
  lastCheck: Date;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  lastError?: string;
  averageResponseTime: number;
}

/**
 * Circuit Breaker 설정
 */
export interface CircuitBreakerConfig {
  failureThreshold: number; // 연속 실패 횟수 임계값
  successThreshold: number; // Half-Open에서 Closed로 전환할 성공 횟수
  timeout: number; // Open 상태 유지 시간 (ms)
  resetTimeout: number; // 통계 리셋 시간 (ms)
}

/**
 * Circuit Breaker 상태
 */
export interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  nextAttempt: Date;
  lastStateChange: Date;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5, // 5번 연속 실패 시 차단
  successThreshold: 2, // 2번 성공 시 복구
  timeout: 60000, // 1분 후 재시도
  resetTimeout: 300000, // 5분 후 통계 리셋
};

/**
 * API Health Monitor
 */
class APIHealthMonitor {
  private healthInfo: APIHealthInfo = {
    status: APIStatus.HEALTHY,
    lastCheck: new Date(),
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    averageResponseTime: 0,
  };

  private circuitBreaker: CircuitBreakerState = {
    state: CircuitState.CLOSED,
    failureCount: 0,
    successCount: 0,
    nextAttempt: new Date(),
    lastStateChange: new Date(),
  };

  private config: CircuitBreakerConfig;
  private responseTimeHistory: number[] = [];
  private readonly MAX_HISTORY = 100;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * API 호출 전 확인
   */
  canAttempt(): { allowed: boolean; reason?: string } {
    const now = new Date();

    // Circuit이 OPEN 상태이면 차단
    if (this.circuitBreaker.state === CircuitState.OPEN) {
      // timeout 경과 확인
      if (now >= this.circuitBreaker.nextAttempt) {
        // HALF_OPEN으로 전환
        this.transitionTo(CircuitState.HALF_OPEN);
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: `Circuit breaker is OPEN. Next attempt at ${this.circuitBreaker.nextAttempt.toISOString()}`,
      };
    }

    return { allowed: true };
  }

  /**
   * API 호출 성공 기록
   */
  recordSuccess(responseTime: number): void {
    this.healthInfo.successCount++;
    this.healthInfo.consecutiveFailures = 0;
    this.healthInfo.lastCheck = new Date();

    // 응답 시간 기록
    this.responseTimeHistory.push(responseTime);
    if (this.responseTimeHistory.length > this.MAX_HISTORY) {
      this.responseTimeHistory.shift();
    }
    this.updateAverageResponseTime();

    // Circuit Breaker 상태 업데이트
    if (this.circuitBreaker.state === CircuitState.HALF_OPEN) {
      this.circuitBreaker.successCount++;
      if (this.circuitBreaker.successCount >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    } else if (this.circuitBreaker.state === CircuitState.OPEN) {
      // OPEN에서 직접 성공하면 CLOSED로
      this.transitionTo(CircuitState.CLOSED);
    }

    this.updateStatus();
  }

  /**
   * API 호출 실패 기록
   */
  recordFailure(error: Error): void {
    this.healthInfo.failureCount++;
    this.healthInfo.consecutiveFailures++;
    this.healthInfo.lastCheck = new Date();
    this.healthInfo.lastError = error.message;

    // Circuit Breaker 상태 업데이트
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.successCount = 0;

    if (this.circuitBreaker.state === CircuitState.HALF_OPEN) {
      // HALF_OPEN에서 실패하면 바로 OPEN
      this.transitionTo(CircuitState.OPEN);
    } else if (this.circuitBreaker.state === CircuitState.CLOSED) {
      // CLOSED에서 임계값 초과 시 OPEN
      if (this.healthInfo.consecutiveFailures >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
      }
    }

    this.updateStatus();
  }

  /**
   * Circuit Breaker 상태 전환
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.circuitBreaker.state;
    this.circuitBreaker.state = newState;
    this.circuitBreaker.lastStateChange = new Date();

    if (newState === CircuitState.OPEN) {
      this.circuitBreaker.nextAttempt = new Date(Date.now() + this.config.timeout);
      console.warn(
        `[KASI API] Circuit breaker OPEN. Next retry at ${this.circuitBreaker.nextAttempt.toISOString()}`
      );
    } else if (newState === CircuitState.HALF_OPEN) {
      this.circuitBreaker.failureCount = 0;
      this.circuitBreaker.successCount = 0;
      console.info('[KASI API] Circuit breaker HALF_OPEN. Testing connection...');
    } else if (newState === CircuitState.CLOSED) {
      this.circuitBreaker.failureCount = 0;
      this.circuitBreaker.successCount = 0;
      console.info('[KASI API] Circuit breaker CLOSED. API recovered.');
    }

    console.log(`[KASI API] Circuit state transition: ${oldState} → ${newState}`);
  }

  /**
   * API 상태 업데이트
   */
  private updateStatus(): void {
    const totalCalls = this.healthInfo.successCount + this.healthInfo.failureCount;
    if (totalCalls === 0) {
      this.healthInfo.status = APIStatus.HEALTHY;
      return;
    }

    const successRate = this.healthInfo.successCount / totalCalls;

    if (this.circuitBreaker.state === CircuitState.OPEN) {
      this.healthInfo.status = APIStatus.DOWN;
    } else if (successRate < 0.5 || this.healthInfo.consecutiveFailures >= 3) {
      this.healthInfo.status = APIStatus.DEGRADED;
    } else {
      this.healthInfo.status = APIStatus.HEALTHY;
    }
  }

  /**
   * 평균 응답 시간 업데이트
   */
  private updateAverageResponseTime(): void {
    if (this.responseTimeHistory.length === 0) {
      this.healthInfo.averageResponseTime = 0;
      return;
    }

    const sum = this.responseTimeHistory.reduce((a, b) => a + b, 0);
    this.healthInfo.averageResponseTime = sum / this.responseTimeHistory.length;
  }

  /**
   * 현재 상태 조회
   */
  getHealthInfo(): APIHealthInfo {
    return { ...this.healthInfo };
  }

  /**
   * Circuit Breaker 상태 조회
   */
  getCircuitState(): CircuitBreakerState {
    return { ...this.circuitBreaker };
  }

  /**
   * 통계 리셋
   */
  reset(): void {
    this.healthInfo = {
      status: APIStatus.HEALTHY,
      lastCheck: new Date(),
      successCount: 0,
      failureCount: 0,
      consecutiveFailures: 0,
      averageResponseTime: 0,
    };

    this.circuitBreaker = {
      state: CircuitState.CLOSED,
      failureCount: 0,
      successCount: 0,
      nextAttempt: new Date(),
      lastStateChange: new Date(),
    };

    this.responseTimeHistory = [];
    console.info('[KASI API] Health monitor reset.');
  }

  /**
   * 상태 보고서 생성
   */
  getStatusReport(): string {
    const health = this.getHealthInfo();
    const circuit = this.getCircuitState();
    const totalCalls = health.successCount + health.failureCount;
    const successRate = totalCalls > 0 ? (health.successCount / totalCalls) * 100 : 0;

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 KASI API 상태 보고서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 API 상태: ${health.status.toUpperCase()}
🔌 Circuit Breaker: ${circuit.state.toUpperCase()}

📈 통계:
  - 총 요청: ${totalCalls}회
  - 성공: ${health.successCount}회
  - 실패: ${health.failureCount}회
  - 성공률: ${successRate.toFixed(1)}%
  - 연속 실패: ${health.consecutiveFailures}회

⏱️  성능:
  - 평균 응답 시간: ${health.averageResponseTime.toFixed(0)}ms

${health.lastError ? `❌ 최근 오류: ${health.lastError}` : ''}
${circuit.state === CircuitState.OPEN ? `⏳ 다음 재시도: ${circuit.nextAttempt.toISOString()}` : ''}

마지막 확인: ${health.lastCheck.toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
  }
}

// 싱글톤 인스턴스
export const kasiAPIMonitor = new APIHealthMonitor();
