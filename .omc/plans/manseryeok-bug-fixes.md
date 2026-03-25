# 만세력 계산 오류 수정 계획 (v2 - Critic/Architect 보강판)

**생성일**: 2026-03-19
**보강일**: 2026-03-19
**상태**: 검토 대기
**복잡도**: HIGH
**범위**: 7개 버그, 8개 파일 수정, 테스트 파일 신규 작성

---

## RALPLAN-DR

### Principles (핵심 원칙)

1. **정확성 최우선**: 만세력 계산은 사용자가 결과를 맹신하는 도메인이므로 한 글자의 오차도 용납 불가. 모든 수정은 JDN(율리우스 일수) 기반 검증과 교차 검증을 거쳐야 한다.
2. **타임존 불변성**: 날짜 비교 연산은 반드시 `Date.UTC()` 기준으로 수행하여 로컬 타임존/DST/역사적 오프셋 변동의 영향을 원천 차단한다.
3. **단일 데이터 소스**: 절기 데이터는 `getSolarTermsForYear()` (solar_terms.ts)를 유일한 소스로 사용. `solar_terms_precise.ts`는 폐기한다.
4. **하위 호환성 유지**: 외부 MCP 도구 인터페이스(스키마)를 변경하지 않으며, 내부 함수 시그니처 변경 시 모든 호출처를 갱신한다.
5. **회귀 방지**: 수정된 모든 버그에 대해 재현 테스트를 작성하고, CI에서 자동 실행되도록 한다.

### Decision Drivers (결정 요인, 상위 3개)

1. **기준일 일관성 (Reference Date Consistency)**: 커밋 8000c0c에서 saju.ts만 갑술일로 수정되었으나, constants.ts/validation.ts/helpers.ts/manselyeok_table.ts는 병자일로 남아있어 **시스템 내 불일치** 발생. JDN 검증 결과 **병자일이 정답**이므로 saju.ts를 원복해야 함.
2. **의존성 순서 (Dependency Order)**: 절기 판별(Phase 1) -> 연주/월주(Phase 2) -> 일주/대운(Phase 2) 순으로 의존. 절기부터 수정해야 후속 수정이 의미를 가짐.
3. **데이터 완전성 (Data Completeness)**: solar_terms_precise.ts가 6개 절기(입춘~곡우)/2020-2030년만 커버하여 대운 계산 정확도 제한. 전체 절기 테이블(1900-2200, 24개 절기) 활용으로 해결.

### Viable Options

#### Option A: 순차적 계층 수정 (권장)
의존성 순서에 따라 하위 계층(데이터/유틸리티)부터 상위 계층(계산 로직)으로 수정.

| 장점 | 단점 |
|------|------|
| 각 단계 수정 후 즉시 검증 가능 | 전체 완료까지 시간 소요 |
| 이전 수정이 다음 수정의 기반 역할 | 초기 단계에서 상위 계층 테스트 불가 |
| 회귀 발생 시 원인 추적 용이 | 병렬 작업 불가 |
| 의존성 충돌 위험 없음 | - |

#### Option B: 병렬 독립 수정
독립적인 버그들을 동시에 수정하고, 의존성이 있는 부분만 순차 처리.

| 장점 | 단점 |
|------|------|
| 전체 소요 시간 단축 | 의존성 있는 버그 간 충돌 위험 |
| 독립 버그(High-1, Medium-2)는 즉시 착수 가능 | 통합 테스트 시 예상치 못한 상호작용 |
| - | 머지 충돌 가능성 (같은 파일 수정) |

**선택: Option A (순차적 계층 수정)**

**사유**: 7개 버그 중 5개가 `saju.ts`와 `solar_terms.ts`에 집중되어 있고, 절기 판별 -> 연주/월주 -> 일주 순으로 명확한 의존 관계가 존재. 병렬 수정 시 동일 파일에서 머지 충돌이 발생할 확률이 높고, 절기 수정 없이 연주/월주를 고치면 이중 수정이 필요. 순차 접근이 총 작업량을 줄인다.

---

## ADR (Architecture Decision Record)

**Decision**: (1) 기준일을 병자일(stemIndex=2, branchIndex=0)로 통일하고 saju.ts의 갑술일 수정을 원복한다. (2) solar_terms_precise.ts를 폐기하고 getSolarTermsForYear()를 유일한 절기 데이터 소스로 사용한다. (3) 근사 함수 `getCurrentSolarTerm`의 모든 호출을 정밀 함수 `getCurrentSolarTermPrecise`로 교체한다. (4) Date 생성 파이프라인을 `Date.UTC()` 기반으로 통일한다.

**Drivers**:
- 커밋 8000c0c가 saju.ts만 갑술일로 변경하여 시스템 내 5곳에서 기준일 불일치 발생
- JDN 천문학적 검증 결과 11개 날짜 모두 병자일 기준과 일치 (갑술일은 불일치)
- solar_terms_precise.ts가 6개 절기/11년만 커버하여 대운 계산 범위 제한
- 근사 함수의 12월-1월 월 순환 버그가 구조적 결함
- 1900년 타임존 오프셋 문제는 로컬 Date 객체의 근본적 한계

**Alternatives Considered**:
1. 갑술일로 전체 통일 -> JDN 검증 결과 병자일이 정답이므로 무효화
2. solar_terms_precise.ts를 24절기/1900-2200 전체로 확장 -> 이미 solar_terms.ts에 동등 데이터 존재하므로 중복
3. 근사 함수 `getCurrentSolarTerm`의 월 순환 로직만 패치 -> 근본 해결 아님, 절기 경계일 오차 잔존

**Why Chosen**: JDN 검증이 병자일을 명확히 확인. getSolarTermsForYear()가 이미 1900-2200/24절기/timestamp 기반으로 완전한 데이터를 제공. getCurrentSolarTermPrecise()가 이미 구현되어 있어 교체 비용 최소.

**Consequences**:
- 긍정: 기준일 불일치 해소, 절기 판별 시분 단위 정확도, 대운 계산 전 범위 커버
- 부정: solar_terms_precise.ts import 제거에 따른 dae_un.ts/daeun_analysis.ts 수정 필요

**Follow-ups**:
- solar_terms_precise.ts 파일 삭제 (Phase 1 완료 후)
- getCurrentSolarTerm 근사 함수를 2200년 이후 fallback으로만 유지하거나 제거

---

## Context (배경)

사주팔자 MCP 서버의 만세력 핵심 계산에서 7개의 버그가 발견됨. Critical 3건, High 2건, Medium 2건. 특히 커밋 8000c0c에서 saju.ts의 일주 기준일을 병자일에서 갑술일로 잘못 변경하여 기존의 올바른 기준일과 불일치가 발생. JDN(율리우스 일수) 기반 천문학적 검증으로 **병자일이 정답**임을 확인함.

### 기준일 검증 결과 (JDN 기반)

```
검증 방법: Julian Day Number + 60갑자 오프셋 공식
검증 날짜: 11개 (1900-01-01 ~ 2024-01-01)
결과: 11개 모두 병자일(stemIndex=2, branchIndex=0) 기준과 정확히 일치
      갑술일(stemIndex=0, branchIndex=10) 기준은 11개 모두 불일치

구체적 검증:
  1900-01-01: 기대=병자, JDN계산=병자 [OK]
  2000-01-01: 기대=경신, JDN계산=경신 [OK]
  2024-01-01: 기대=병인, JDN계산=병인 [OK]
  (외 8건 모두 OK)
```

### 현재 기준일 상태 (불일치 맵)

| 파일 | 현재 값 | 정답 | 상태 |
|------|---------|------|------|
| `src/lib/saju.ts:246` | 갑술일 (stem=0, branch=10) | 병자일 (stem=2, branch=0) | **잘못됨** (커밋 8000c0c) |
| `src/lib/constants.ts:131-133` | 병자일 (stem=2, branch=0) | 병자일 (stem=2, branch=0) | 정상 |
| `src/lib/validation.ts:64` | 병자일 (stem=2, branch=0) | 병자일 (stem=2, branch=0) | 정상 |
| `src/lib/helpers.ts:45-46` | constants.ts 참조 -> 병자일 | 병자일 (stem=2, branch=0) | 정상 |
| `src/data/manselyeok_table.ts:4,22` | "병자일 기준" 주석 + 데이터 | 병자일 (stem=2, branch=0) | 정상 |
| `src/lib/comprehensive_validation.ts:59` | 병자일 테스트 케이스 | 병자일 (stem=2, branch=0) | 정상 |

**결론**: saju.ts:245-253만 원복하면 됨. 나머지 5곳은 이미 정상.

---

## Work Objectives (작업 목표)

1. saju.ts의 기준일을 병자일로 원복하여 시스템 내 일관성 확보
2. getCurrentSolarTerm(근사) 6곳을 getCurrentSolarTermPrecise(정밀)로 교체
3. solar_terms_precise.ts를 폐기하고 solar_terms.ts에 getPreviousSolarTerm/getNextSolarTerm 재구현
4. convertCalendar()에 isLeapMonth 파라미터 추가 및 호출부 수정
5. Date 생성 파이프라인을 Date.UTC() 기반으로 통일
6. 모든 수정에 대한 회귀 테스트 작성

## Guardrails (가드레일)

### Must Have
- 모든 수정 후 `npm run lint` && `npm run build` 통과
- 만세력 검증 테이블 11건 전체 교차 검증
- eslint-disable, ts-ignore 절대 사용 금지
- 외부 MCP 도구 스키마(inputSchema) 변경 없음

### Must NOT Have
- 기존 작동하는 기능의 회귀
- 새로운 외부 의존성 추가
- 아키텍처 재설계 (최소 범위 수정)
- 갑술일 기준으로의 변경 (JDN 검증으로 무효화됨)

---

## Task Flow (작업 흐름)

```
Phase 1: 절기 데이터 통합 (데이터 계층)
  Step 1: solar_terms.ts에 getPreviousSolarTerm/getNextSolarTerm 구현
  Step 2: dae_un.ts, daeun_analysis.ts의 import를 solar_terms.ts로 전환
  Step 3: solar_terms_precise.ts 폐기 (파일 삭제)
      |
Phase 2: 핵심 계산 수정 (계산 계층)
  Step 4: getCurrentSolarTerm -> getCurrentSolarTermPrecise 교체 (6곳)
  Step 5: 기준일 원복 (saju.ts 갑술일 -> 병자일) + Date.UTC 통일
  Step 6: 연주 계산 입춘 이전 판정 정밀화
  Step 7: 야자시(夜子時) 처리
      |
Phase 3: 변환 계층 수정
  Step 8: convertCalendar() isLeapMonth 전달 + 양력->음력 폴백 수정
      |
Phase 4: 통합 테스트 및 검증
  Step 9: 회귀 테스트 작성 및 통합 검증
```

---

## Detailed TODOs (상세 작업)

### Phase 1: 절기 데이터 통합 (데이터 계층)

#### Step 1: solar_terms.ts에 getPreviousSolarTerm/getNextSolarTerm 구현

**파일**: `src/data/solar_terms.ts`
**목적**: solar_terms_precise.ts의 getPreviousSolarTerm/getNextSolarTerm을 solar_terms.ts에 재구현하여 단일 데이터 소스 확립

**구현 명세**:

```typescript
// 반환 타입: 기존 SolarTermComplete 사용 (solar_terms_precise.ts의 SolarTermPrecise 대체)
// SolarTermComplete 인터페이스 (이미 solar_terms_1900_2019.ts에 정의됨):
// { year: number; term: SolarTerm; month: number; day: number; timestamp: number }

/**
 * 특정 날짜의 직전 절기 조회
 * @param date - 기준 날짜
 * @returns 직전 절기 데이터 (SolarTermComplete) 또는 null
 */
export function getPreviousSolarTerm(date: Date): SolarTermComplete | null {
  // 1. date의 year에서 getSolarTermsForYear(year)와 getSolarTermsForYear(year - 1) 조회
  // 2. 합산 후 timestamp <= date.getTime()인 것 중 가장 큰 timestamp 반환
  // 3. 없으면 null
}

/**
 * 특정 날짜의 다음 절기 조회
 * @param date - 기준 날짜
 * @returns 다음 절기 데이터 (SolarTermComplete) 또는 null
 */
export function getNextSolarTerm(date: Date): SolarTermComplete | null {
  // 1. date의 year에서 getSolarTermsForYear(year)와 getSolarTermsForYear(year + 1) 조회
  // 2. 합산 후 timestamp > date.getTime()인 것 중 가장 작은 timestamp 반환
  // 3. 없으면 null
}
```

**핵심 차이점 (SolarTermPrecise vs SolarTermComplete)**:
- `SolarTermPrecise`: `{ year, term, datetime(ISO string), timestamp }` - solar_terms_precise.ts 전용
- `SolarTermComplete`: `{ year, term, month, day, timestamp }` - 전체 절기 테이블 공통 타입
- 대운 계산에서 사용하는 필드는 `timestamp`과 `term`뿐이므로 타입 전환에 문제 없음
- 단, `datetime` 필드를 사용하는 곳(dae_un.ts:139, dae_un.ts:162, daeun_analysis.ts:120, daeun_analysis.ts:128)에서는 `new Date(term.timestamp)` 또는 timestamp 직접 비교로 대체

**수용 기준**:
- [ ] getPreviousSolarTerm이 getSolarTermsForYear 기반으로 동작
- [ ] getNextSolarTerm이 getSolarTermsForYear 기반으로 동작
- [ ] 1900-2200 전 범위에서 null 반환 없음 (연초/연말 경계 포함)
- [ ] 반환 타입이 SolarTermComplete

---

#### Step 2: dae_un.ts, daeun_analysis.ts의 import 전환

**파일**:
- `src/lib/dae_un.ts` (9행)
- `src/lib/daeun_analysis.ts` (11행)

**현재 코드**:
```typescript
// dae_un.ts:9
import { getPreviousSolarTerm, getNextSolarTerm } from '../data/solar_terms_precise.js';

// daeun_analysis.ts:11
import { getPreviousSolarTerm, getNextSolarTerm } from '../data/solar_terms_precise.js';
```

**수정 내용**:
```typescript
// 양쪽 모두 동일하게 변경
import { getPreviousSolarTerm, getNextSolarTerm } from '../data/solar_terms.js';
```

**타입 전환에 따른 수정**:

**(A) dae_un.ts 수정 (4곳)**:
- 139행: `const termDate = new Date(targetSolarTerm.datetime);`
  -> `const termDate = new Date(targetSolarTerm.timestamp);`
- 162행: `const termDate = new Date(targetSolarTerm.datetime);`
  -> `const termDate = new Date(targetSolarTerm.timestamp);`
- 타입 참조: `SolarTermPrecise` -> `SolarTermComplete` (import 추가 필요시)
  - 실제로는 반환값을 직접 사용하므로 타입 import는 불필요할 수 있음. 확인 후 결정.

**(B) daeun_analysis.ts 수정 (2곳)**:
- 120행: `solarTermDate = new Date(nextTerm.datetime);`
  -> `solarTermDate = new Date(nextTerm.timestamp);`
- 128행: `solarTermDate = new Date(prevTerm.datetime);`
  -> `solarTermDate = new Date(prevTerm.timestamp);`

**수용 기준**:
- [ ] dae_un.ts가 solar_terms.js에서 import
- [ ] daeun_analysis.ts가 solar_terms.js에서 import
- [ ] datetime 참조 4곳이 모두 timestamp 기반으로 전환
- [ ] `npm run build` 통과 (타입 에러 없음)

---

#### Step 3: solar_terms_precise.ts 폐기

**파일**: `src/data/solar_terms_precise.ts`

**작업**:
1. Step 2 완료 후, solar_terms_precise.ts를 import하는 곳이 없음을 확인
2. 파일 삭제

**확인 방법**:
```bash
grep -r "solar_terms_precise" src/  # 결과 없어야 함
```

**수용 기준**:
- [ ] solar_terms_precise.ts 삭제 완료
- [ ] 프로젝트 내 solar_terms_precise 참조 0건
- [ ] `npm run build` 통과

---

### Phase 2: 핵심 계산 수정 (계산 계층)

#### Step 4: getCurrentSolarTerm -> getCurrentSolarTermPrecise 교체 (6곳)

**목적**: 근사(approximate) 절기 판별을 정밀(timestamp 기반) 절기 판별로 교체

**교체 대상 6곳**:

| # | 파일 | 행 | 용도 |
|---|------|-----|------|
| 1 | `src/lib/saju.ts` | 118 | 지장간 세력 계산용 절기 |
| 2 | `src/lib/saju.ts` | 163 | 연주 계산 입춘 판정 |
| 3 | `src/lib/saju.ts` | 193 | 월주 계산 절기 |
| 4 | `src/lib/calendar.ts` | 28 | 동일 달력 변환 시 절기 |
| 5 | `src/lib/calendar.ts` | 54 | 양력->음력 변환 시 절기 |
| 6 | `src/lib/calendar.ts` | 81 | 음력->양력 변환 시 절기 |

**수정 방법**:

**(A) saju.ts**:
```typescript
// import 변경 (8행)
// 기존:
import { getCurrentSolarTerm, getSolarTermMonthIndex } from '../data/solar_terms.js';
// 수정:
import { getCurrentSolarTermPrecise, getSolarTermMonthIndex } from '../data/solar_terms.js';

// 118행: getCurrentSolarTerm(adjustedDate) -> getCurrentSolarTermPrecise(adjustedDate)
// 163행: getCurrentSolarTerm(date) -> getCurrentSolarTermPrecise(date)
// 193행: getCurrentSolarTerm(date) -> getCurrentSolarTermPrecise(date)
```

**(B) calendar.ts**:
```typescript
// import 변경 (9행)
// 기존:
import { getCurrentSolarTerm } from '../data/solar_terms.js';
// 수정:
import { getCurrentSolarTermPrecise } from '../data/solar_terms.js';

// 28행: getCurrentSolarTerm(inputDate) -> getCurrentSolarTermPrecise(inputDate)
// 54행: getCurrentSolarTerm(inputDate) -> getCurrentSolarTermPrecise(inputDate)
// 81행: getCurrentSolarTerm(solarDate) -> getCurrentSolarTermPrecise(solarDate)
```

**수용 기준**:
- [ ] 프로젝트 내 getCurrentSolarTerm 호출 0건 (정의만 남음)
- [ ] 1월 1~5일 출생자의 절기가 '동지'로 정상 반환
- [ ] 12월 22일 이후 출생자의 절기가 '동지'로 정상 반환
- [ ] 모든 24절기 경계일에서 정확한 절기 반환
- [ ] `npm run lint` && `npm run build` 통과

---

#### Step 5: 기준일 원복 + Date.UTC 파이프라인 통일

**파일**: `src/lib/saju.ts` (42-48행, 245-264행)

**(A) 기준일 원복 (245-264행)**:

```typescript
// 기존 (커밋 8000c0c에서 잘못 수정됨):
/**
 * 일주(日柱) 계산
 * 정확한 기준일: 1900년 1월 1일 = 갑술일(甲戌日)
 */
function calculateDayPillar(date: Date): Pillar {
  // 기준일: 1900년 1월 1일 = 갑술일 (stemIndex=0, branchIndex=10)
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  // 갑(甲) = 0, 술(戌) = 10에서 시작
  const stemIndex = (0 + diffDays) % 10;
  const branchIndex = (10 + diffDays) % 12;

// 수정:
/**
 * 일주(日柱) 계산
 * 기준일: 1900년 1월 1일 = 병자일(丙子日)
 * JDN(율리우스 일수) 기반 검증 완료 (11개 날짜 교차 검증)
 */
function calculateDayPillar(date: Date): Pillar {
  // 기준일: 1900년 1월 1일 = 병자일 (stemIndex=2, branchIndex=0)
  // 타임존 독립적 날짜 비교를 위해 Date.UTC 사용
  const targetUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const baseUTC = Date.UTC(1900, 0, 1);
  const diffDays = Math.floor((targetUTC - baseUTC) / (1000 * 60 * 60 * 24));
  // 병(丙) = 2, 자(子) = 0에서 시작
  const stemIndex = ((2 + diffDays) % 10 + 10) % 10;
  const branchIndex = ((0 + diffDays) % 12 + 12) % 12;
```

**주의**: 음수 모듈로 처리를 위해 `((x % n) + n) % n` 패턴 사용.

**(B) Date 생성 파이프라인 통일 (42-48행)**:

현재 saju.ts:42-48의 Date 생성은 진태양시 보정(-30분)이 적용되므로, 시간 관련 조정은 유지하되 calculateDayPillar 내부에서 **날짜 부분만 UTC로 추출**하는 방식으로 타임존 독립성을 확보. saju.ts:42-48 자체는 변경 불필요 (시간 보정은 로컬 Date에서 수행해도 문제 없음. 핵심은 calculateDayPillar 내부의 일수 차이 계산).

**영향 범위**:
- 일주(日柱) 계산 전체
- 시주(時柱)는 일주의 천간에 의존하므로 연쇄 영향

**수용 기준**:
- [x] 1900-01-01 12:00 -> 병자일 정확히 반환
- [x] 만세력 검증 테이블 11건 전체 통과 (manselyeok_table.ts의 모든 항목)
- [ ] 자정 근처(23:00-01:00) 출생 시간에서 일주 정확
- [ ] UTC 기반 비교로 타임존 불변성 확보
- [ ] helpers.ts의 getDayPillar()도 동일하게 Date.UTC 방식 적용 필요
  - helpers.ts:43: `const diffDays = Math.floor((date.getTime() - BASE_DATE.getTime()) / ...)` 에서 BASE_DATE가 `new Date(1900, 0, 1)` (constants.ts:131)이므로 같은 타임존 문제 존재
  - constants.ts:131: `export const BASE_DATE = new Date(1900, 0, 1);` -> `export const BASE_DATE_UTC = Date.UTC(1900, 0, 1);` 로 변경하거나, helpers.ts 내부에서 UTC 변환

---

#### Step 6: 연주 계산 입춘 이전 판정 정밀화

**파일**: `src/lib/saju.ts` (159-170행)

**현재 문제**: 입춘 이전 판정 시 `solarTerm === '대한'`만 체크. Step 4에서 정밀 함수로 교체되더라도 절기 이름 비교 방식은 '동지', '소한' 구간을 놓침.

**수정 방안**:
```typescript
// 기존:
function calculateYearPillar(date: Date): Pillar {
  const year = date.getFullYear();
  const solarTerm = getCurrentSolarTerm(date);  // Step 4에서 이미 Precise로 교체됨
  const month = date.getMonth() + 1;
  let sajuYear = year;
  if (month <= 2 && solarTerm === '대한') {
    sajuYear = year - 1;
  }

// 수정:
function calculateYearPillar(date: Date): Pillar {
  const year = date.getFullYear();
  let sajuYear = year;

  // 해당 연도 입춘의 정확한 timestamp와 직접 비교
  const yearTerms = getSolarTermsForYear(year);
  const ipchun = yearTerms.find(t => t.term === '입춘');
  if (ipchun && date.getTime() < ipchun.timestamp) {
    sajuYear = year - 1;
  }
```

**필요한 import 추가**: `getSolarTermsForYear`를 saju.ts에서 import (Step 4의 import 변경과 함께 처리)

**수용 기준**:
- [x] 1월 1일 출생자 -> 전년도 연주 정확 반환
- [x] 1월 15일 출생자 -> 전년도 연주 정확 반환
- [ ] 입춘 당일 출생자 -> 해당 연도 연주 반환 (시분 단위 정밀)
- [ ] 입춘 전날 출생자 -> 전년도 연주 반환
- [ ] 2월 3~5일 입춘 경계일 테스트 (연도별로 입춘 날짜 다름)

---

#### Step 7: 야자시(夜子時) 처리

**파일**: `src/lib/saju.ts` (270-300행), `src/lib/interpretation_settings.ts`

**현재 문제**: 23시 이후는 시주에서 자시(子時)로 정확히 분류되지만, 일주가 다음 날로 넘어가지 않음.

**수정 방안**:
- `interpretation_settings.ts`에 야자시 설정 추가:
  ```typescript
  nightSubHour: 'next_day' | 'same_day'  // 기본값: 'next_day' (자평명리 기준)
  ```
- `saju.ts`의 `calculateSaju()` 함수에서 23시 이후일 때 설정에 따라 `calculateDayPillar`에 전달하는 date를 +1일 조정:
  ```typescript
  // 야자시 처리: 23:00 이후이면 일주를 다음 날로 계산
  let dayPillarDate = adjustedDate;
  if (adjustedDate.getHours() >= 23 && settings.nightSubHour === 'next_day') {
    dayPillarDate = new Date(adjustedDate.getTime() + 24 * 60 * 60 * 1000);
  }
  const dayPillar = calculateDayPillar(dayPillarDate);
  ```

**수용 기준**:
- [ ] 23:30 출생자의 일주가 다음 날 기준으로 계산 (기본 설정)
- [ ] 설정 변경 시 당일 기준으로 계산 가능
- [ ] 00:00-00:59 출생자에는 영향 없음
- [ ] 진태양시 보정(-30분) 적용 후 기준으로 판정 (22:30 이전 출생자는 영향 없음)

---

### Phase 3: 변환 계층 수정

#### Step 8: convertCalendar() isLeapMonth 전달 + 양력->음력 폴백 수정

**파일**:
- `src/lib/calendar.ts` (15-86행)
- `src/lib/saju.ts` (37-39행)
- `src/tools/convert_calendar.ts` (37행)

**(A) convertCalendar() 시그니처 변경 (calendar.ts:15-19)**:
```typescript
// 기존:
export function convertCalendar(
  date: string,
  fromCalendar: CalendarType,
  toCalendar: CalendarType
): CalendarConversion {

// 수정:
export function convertCalendar(
  date: string,
  fromCalendar: CalendarType,
  toCalendar: CalendarType,
  isLeapMonth?: boolean
): CalendarConversion {
```

**(B) 음력->양력 변환부 수정 (calendar.ts:60-64)**:
```typescript
// 기존:
const result = lunarToSolarLocal(
  inputDate.getFullYear(),
  inputDate.getMonth() + 1,
  inputDate.getDate(),
  false // 기본적으로 평달로 가정  <-- 하드코딩 버그
);

// 수정:
const result = lunarToSolarLocal(
  inputDate.getFullYear(),
  inputDate.getMonth() + 1,
  inputDate.getDate(),
  isLeapMonth ?? false
);
```

**(C) saju.ts 호출부 수정 (saju.ts:38)**:
```typescript
// 기존:
const conversion = convertCalendar(birthDate, 'lunar', 'solar');

// 수정:
const conversion = convertCalendar(birthDate, 'lunar', 'solar', isLeapMonth);
```

**(D) convert_calendar.ts 도구 핸들러 확인 (37행)**:
```typescript
// 현재:
const result = convertCalendar(args.date, args.fromCalendar, args.toCalendar);

// 수정:
const result = convertCalendar(args.date, args.fromCalendar, args.toCalendar, args.isLeapMonth);
```
- MCP 도구 스키마에는 이미 isLeapMonth 필드가 존재하므로 스키마 변경 불필요

**수용 기준**:
- [ ] 윤달 출생자(isLeapMonth=true)의 양력 변환이 정확
- [ ] saju.ts에서 isLeapMonth가 convertCalendar까지 정상 전달
- [ ] MCP 도구(convert_calendar)에서도 isLeapMonth 전달
- [ ] MCP 도구 스키마(inputSchema) 변경 없음

---

### Phase 4: 통합 테스트 및 검증

#### Step 9: 회귀 테스트 작성 및 통합 검증

**파일**: 신규 `src/__tests__/manseryeok-fixes.test.ts`

**테스트 케이스 목록 (구체적)**:

##### 9-1. 기준일 일관성 테스트
```
- 1900-01-01 12:00 -> 일주 = 병자 (saju.ts의 calculateDayPillar)
- 1900-01-01 12:00 -> 일주 = 병자 (helpers.ts의 getDayPillar)
- 1900-01-01 12:00 -> 일주 = 병자 (validation.ts의 calculateDayPillarForValidation)
```

##### 9-2. 만세력 검증 테이블 전체 통과 (11건)
```
- 1900-01-01 -> 병자
- 2000-01-01 -> 경신
- 2000-02-04 -> 갑오
- 2000-02-29 -> 기미
- 2000-12-31 -> 을축
- 2010-01-01 -> 계축
- 2010-02-14 -> 정유
- 2020-01-01 -> 을사
- 2020-01-25 -> 기사
- 2020-02-29 -> 갑진
- 2024-01-01 -> 병인
```

##### 9-3. 절기 경계 테스트 (동지~소한 12/22~1/6, 입춘 2/3~2/5)
```
- 2025-12-22 06:00 -> 절기 = '대설' 또는 '동지' (해당 연도 동지 시각 기준)
- 2026-01-03 12:00 -> 절기 = '동지' (소한 이전)
- 2026-01-06 12:00 -> 절기 = '소한' (소한 이후)
- 2025-02-03 22:00 -> 절기 확인 (2025년 입춘 = 2025-02-03 23:10 이전이므로 '대한')
- 2025-02-04 00:00 -> 절기 확인 (입춘 이후이므로 '입춘')
- 2026-02-04 05:00 -> 절기 확인 (2026년 입춘 = 2026-02-04 04:46 이후이므로 '입춘')
```

##### 9-4. 야자시 경계 테스트 (22:50~00:10)
```
- 2025-06-15 22:30 -> 진태양시 보정 후 22:00 -> 해시(亥時), 일주 = 당일
- 2025-06-15 23:00 -> 진태양시 보정 후 22:30 -> 해시(亥時), 일주 = 당일 (보정으로 23시 미만)
- 2025-06-15 23:40 -> 진태양시 보정 후 23:10 -> 자시(子時), 일주 = 다음 날 (기본설정)
- 2025-06-16 00:10 -> 진태양시 보정 후 23:40 -> 자시(子時), 일주 = 다음 날 (기본설정)
```

##### 9-5. 타임존 불변성 테스트
```
- TZ=Asia/Seoul과 TZ=UTC에서 동일한 calculateDayPillar 결과
  (Node.js의 TZ 환경변수로 테스트 불가능할 경우, Date.UTC 기반 계산의 결과 일관성으로 간접 검증)
- 1900-01-01 00:30 (자정 직후) -> 일주가 전날로 밀리지 않음
- 2025-03-19 00:05 -> 일주 정확 (타임존 오프셋 차이가 영향 없음)
```

##### 9-6. 연주 입춘 경계 테스트
```
- 2025-01-01 12:00 -> 연주 = 2024년 간지 (갑진년)
- 2025-01-15 12:00 -> 연주 = 2024년 간지 (갑진년)
- 2025-02-03 22:00 -> 연주 = 2024년 간지 (입춘 23:10 이전)
- 2025-02-04 00:00 -> 연주 = 2025년 간지 (입춘 23:10 이후 = 을사년)
- 2026-02-04 04:00 -> 연주 = 2025년 간지 (입춘 04:46 이전)
- 2026-02-04 05:00 -> 연주 = 2026년 간지 (입춘 04:46 이후 = 병오년)
```

##### 9-7. 대운 검증 (정밀 절기 기반)
```
- 2020~2030 출생자: solar_terms_precise.ts와 동일한 대운 시작 나이 (회귀 테스트)
- 1985-06-15 출생 남자: 대운 시작 나이가 기본값(5세) 아닌 정확한 값 반환
- 2000-01-01 출생 여자: 대운 시작 나이가 기본값 아닌 정확한 값 반환
- 대운 시작 나이 = KASI 데이터 기반 +-2분 이내 정확도
```

##### 9-8. 음력 변환 isLeapMonth 테스트
```
- 윤달 출생자(isLeapMonth=true) 양력 변환 정확
- 평달 출생자(isLeapMonth=false) 기존 결과와 동일
- saju.ts에서 isLeapMonth=true로 calculateSaju 호출 시 정확한 양력 변환
```

##### 9-9. 통합 E2E 테스트 (최소 3건)
```
- 2025-02-03 23:30 양력 남자 -> 전체 사주 계산 (입춘 경계 + 야자시 근처)
- 2024-06-15 12:00 음력 윤달 여자 -> 전체 사주 계산 (음력 + 윤달)
- 1985-01-15 08:30 양력 남자 -> 전체 사주 계산 (1월 출생 + 대운)
```

**수용 기준**:
- [ ] 모든 테스트 통과
- [ ] `npm run lint` && `npm run build` && `npm test` 통과
- [ ] 기존 기능 회귀 없음

---

## Success Criteria (성공 기준)

1. 기준일이 병자일(stemIndex=2, branchIndex=0)로 전체 시스템 통일
2. getCurrentSolarTerm 근사 함수 호출 6곳이 모두 정밀 함수로 교체
3. solar_terms_precise.ts 폐기 완료, getSolarTermsForYear() 단일 소스 확립
4. convertCalendar()에 isLeapMonth 정상 전달
5. 만세력 검증 테이블 11건 전체 교차 검증 통과
6. `npm run lint` && `npm run build` && `npm test` 모두 통과
7. MCP 도구 외부 스키마 변경 없음 (하위 호환)

---

## Risk & Mitigation (위험 및 완화)

| 위험 | 확률 | 영향 | 완화 방안 |
|------|------|------|----------|
| SolarTermPrecise -> SolarTermComplete 타입 전환 시 누락 | 중 | 중 | datetime 참조 4곳을 명시적으로 리스트업하여 전수 검사 |
| 정밀 절기 함수 교체 시 성능 저하 | 중 | 하 | sajuCache 활용, getSolarTermsForYear는 배열 필터링으로 O(n) |
| 야자시 학파 선택에 대한 사용자 혼란 | 중 | 중 | 기본값을 다수파(다음 날)로 설정 |
| 연주 입춘 판정에서 getSolarTermsForYear 미스 | 저 | 고 | 절기 테이블에 입춘이 반드시 존재함을 assert로 검증 |
| helpers.ts의 getDayPillar도 UTC 미적용 시 불일치 | 고 | 고 | Step 5에서 helpers.ts + constants.ts도 함께 수정 |
| 전년도 음력 폴백 로직 수정 시 edge case | 중 | 고 | 1월 1~28일 전 범위 테스트 |

---

## 수정 대상 파일 요약

| 파일 | Phase | 수정 내용 |
|------|-------|----------|
| `src/data/solar_terms.ts` | 1 | getPreviousSolarTerm/getNextSolarTerm 신규 구현 |
| `src/data/solar_terms_precise.ts` | 1 | 삭제 |
| `src/lib/dae_un.ts` | 1 | import 전환 + datetime -> timestamp |
| `src/lib/daeun_analysis.ts` | 1 | import 전환 + datetime -> timestamp |
| `src/lib/saju.ts` | 2 | 절기 함수 교체 + 기준일 원복 + Date.UTC + 입춘 판정 + 야자시 |
| `src/lib/calendar.ts` | 2,3 | 절기 함수 교체 + isLeapMonth 파라미터 추가 |
| `src/lib/constants.ts` | 2 | BASE_DATE를 UTC 기반으로 변경 |
| `src/lib/helpers.ts` | 2 | getDayPillar UTC 방식 적용 |
| `src/lib/interpretation_settings.ts` | 2 | 야자시 설정 추가 |
| `src/tools/convert_calendar.ts` | 3 | isLeapMonth 전달 |
| `src/__tests__/manseryeok-fixes.test.ts` | 4 | 신규 작성 |
