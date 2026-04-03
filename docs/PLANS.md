# Execution Plans

> 실행 계획 개요 및 로드맵

## 현재 상태

- **버전**: 1.2.0
- **MCP 도구**: 7개 운영 중
- **데이터 범위**: 1900-2200 (300년)
- **해석 유파**: 5개
- **용신 알고리즘**: 4종

## 활성 계획

> 상세: [exec-plans/active/](exec-plans/active/)

현재 활성 실행 계획 없음. 새 계획은 `exec-plans/active/` 디렉터리에 추가.

## 우선순위 로드맵

### P0 - 필수 (안정성)

1. **핵심 모듈 단위 테스트 추가** - saju.ts, ten_gods.ts, gyeok_guk.ts
   - 현재: 검증 테스트 3개만 존재
   - 목표: 10단계 파이프라인 각 단계별 최소 1개 테스트

2. **fortune.ts 모듈 분할** - 715줄 -> 운세 유형별 분리
   - 현재: 단일 대형 파일
   - 목표: fortune/general.ts, fortune/career.ts 등

### P1 - 중요 (품질)

3. **tool-handler.ts 타입 안전성 강화** - unknown 캐스팅 -> Zod parse
4. **통합 테스트 추가** - 7개 도구 기본 호출 검증
5. **saju.ts 내부 정리** - 파이프라인 단계별 함수 명확 분리

### P2 - 개선 (기능)

6. **추가 해석 유파 확장** - 새 유파 해석기 추가 시 인터페이스 준수
7. **성능 최적화** - 벤치마크 기반 병목 개선
8. **테스트 커버리지 80%** - 장기 목표

## 완료된 계획

> 상세: [exec-plans/completed/](exec-plans/completed/)

(추적 시작 이전 항목 없음)

## 기술 부채

> 상세: [exec-plans/tech-debt-tracker.md](exec-plans/tech-debt-tracker.md)
