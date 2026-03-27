# Layer Dependency Rules

> 레이어 간 의존성 방향 및 아키텍처 린트 규칙

## 레이어 정의

| 레이어 | 디렉터리 | 역할 |
|--------|----------|------|
| L1 | `src/core/` | MCP 프레임워크 (서버, 스키마, 라우팅) |
| L1.5 | `src/schemas/` | Zod 입력 검증 스키마 |
| L2 | `src/tools/` | 도구 핸들러 (입력 변환 + 결과 직렬화) |
| L3 | `src/lib/` | 비즈니스 로직 (사주 계산, 운세, 궁합) |
| L3.1 | `src/lib/yongsin/` | 용신 알고리즘 서브시스템 |
| L3.2 | `src/lib/interpreters/` | 해석 유파 서브시스템 |
| L4 | `src/data/` | 정적 데이터 테이블 |
| L5 | `src/types/`, `src/utils/` | 공통 타입 + 유틸리티 |

## 의존성 방향 규칙

### 허용되는 import 방향

```
L1 (core) → L2 (tools) 금지
L1 (core) → L4 (data)  허용 (tool-definitions의 스키마 참조)
L1 (core) → L5 (types) 허용

L2 (tools) → L3 (lib)  허용
L2 (tools) → L4 (data) 허용
L2 (tools) → L5 (types) 허용

L3 (lib)   → L4 (data) 허용
L3 (lib)   → L5 (types) 허용
L3 (lib)   → L3 (lib)  허용 (같은 레이어 내)

L4 (data)  → L5 (types) 허용
L4 (data)  → L4 (data) 허용 (같은 레이어 내: lunar_table → lunar_table_*)

L5 (types) → 없음 (최하위 레이어)
```

### 금지되는 import 방향

```
# 역방향 의존 금지
L3 (lib)   → L2 (tools)  금지
L3 (lib)   → L1 (core)   금지
L4 (data)  → L3 (lib)    금지
L4 (data)  → L2 (tools)  금지
L4 (data)  → L1 (core)   금지
L5 (types) → L1~L4       금지

# 레이어 건너뛰기 참조는 허용
L2 (tools) → L4 (data)   허용 (L3 건너뛰기)
```

## 순환 참조 규칙

### 금지
- **레이어 간 순환**: L3 → L4 → L3 같은 레이어 간 순환 절대 금지
- **모듈 간 순환**: `saju.ts ↔ fortune.ts` 같은 직접 순환 금지

### 허용
- **같은 레이어 내 단방향**: `saju.ts → ten_gods.ts`, `saju.ts → sin_sal.ts` (모두 L3)
- **barrel export**: `index.ts`를 통한 re-export (순환 아님)

## 크로스 도메인 접근 규칙

### 도메인 구분

| 도메인 | 모듈 | 설명 |
|--------|------|------|
| 사주 계산 | saju.ts, ten_gods.ts, sin_sal.ts, day_master_strength.ts | 핵심 계산 |
| 격국/용신 | gyeok_guk.ts, yong_sin.ts, yongsin/* | 분석 결정 |
| 운세 | fortune.ts, dae_un.ts, se_un.ts, wol_un.ts, si_un.ts | 시간별 운세 |
| 해석 | interpreters/*, school_comparator.ts, school_interpreter.ts | 유파별 해석 |
| 부가 | career_matcher.ts, compatibility.ts, pungsu_advice.ts 등 | 부가 분석 |
| 달력 | calendar.ts, leap_month_analysis.ts | 달력 변환 |

### 도메인 간 의존 허용 방향

```
달력 ← 사주 계산 ← 격국/용신 ← 운세 ← 해석
                         ↑
                       부가
```

- **사주 계산** 도메인은 모든 분석의 기반 (SajuData 생성)
- **격국/용신** 도메인은 사주 계산 결과에 의존
- **운세** 도메인은 사주 계산 + 격국/용신 결과에 의존
- **해석** 도메인은 모든 데이터를 읽기 전용으로 참조
- **부가** 도메인은 사주 계산 + 격국/용신에 의존

## 코드 리뷰 체크리스트

새 모듈 추가 또는 import 변경 시:

- [ ] import 방향이 상위 → 하위인가?
- [ ] 순환 참조가 발생하지 않는가?
- [ ] 역방향 의존(하위 → 상위)이 없는가?
- [ ] 새 도구 추가 시 `core/tool-definitions.ts` + `core/tool-handler.ts` + `tools/index.ts` 3곳 동시 업데이트했는가?
- [ ] 정적 데이터 변경 시 기존 테스트 통과하는가?
