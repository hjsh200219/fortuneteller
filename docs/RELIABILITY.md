# Reliability Standards

> fortuneteller MCP 서버 신뢰성 기준

## 데이터 정확성

### 사주 계산 정확성
- **목표**: 만세력 기준 99.9% 일치
- **검증 방법**: KASI(한국천문연구원) 앵커 데이터와 대조
- **현재 테스트**: `kasi-anchor-verification.test.ts`, `solar-terms-verification.test.ts`, `jdn-verification.test.ts`

### 달력 변환 정확성
- **지원 범위**: 1900-2200 (300년)
- **음력 테이블**: 4개 연도 범위로 분할, 자동 분기
- **절기 데이터**: 4개 연도 범위로 분할, 분 단위 정밀도

### 진태양시 보정
- **경도 보정**: 동경 135도 기준, 162개 시군구 지원
- **썸머타임**: `Asia/Seoul` 타임존 (date-fns-tz) 자동 반영
- **폴백**: 미등록 도시는 서울 경도 사용

## 런타임 안정성

### 에러 격리
- MCP 도구 호출은 `try-catch`로 감싸여 서버 크래시 방지
- 에러 발생 시 `isError: true` + 한국어 메시지 반환
- 개별 도구 실패가 다른 도구에 영향 없음

### 입력 검증
- 날짜/시간 문자열 형식 검증 필수 (YYYY-MM-DD, HH:mm, YYYY-MM)
- 범위 검증 (월 1-12, 시 0-23)
- 잘못된 입력 시 구체적 한국어 에러 메시지

### 메모리 관리
- 지연 로딩 모드 (`SAJU_LAZY_LOAD_SCHEMAS=true`)로 초기 메모리 절감
- `performance_cache.ts`로 반복 계산 캐싱
- 정적 데이터 테이블은 모듈 로드 시 1회만 파싱

## 변경 시 검증 절차

### 필수 검증
1. `npm run lint` - ESLint 에러 0건
2. `npm run build` - TypeScript 컴파일 성공
3. `npm test` - 기존 테스트 통과

### 권장 검증
4. 사주 계산 변경 시: `validate_accuracy.ts` 스크립트 실행
5. 절기/음력 데이터 변경 시: KASI 앵커 테스트 확인
6. 대형 모듈 변경 시: `performance_test.ts` 벤치마크

## 계산 불변량 (절대 위반 금지)

1. **파이프라인 순서 보존**: 10단계 사주 계산 순서 변경/건너뛰기 금지
2. **지장간 세력 비율 보존**: 당령/퇴기/진기 비율 변경 시 전체 정확도 영향
3. **데이터 테이블 무결성**: `solar_terms_*.ts`, `lunar_table_*.ts` 수동 편집 금지
4. **로컬 테이블 의존**: 외부 API 의존성 추가 금지 (오프라인 동작 보장)

## 배포 안정성

### 빌드 출력
- `dist/` 디렉터리에 ES2022 모듈로 컴파일
- 소스맵 포함 (디버깅용)
- 선언 파일 (.d.ts) 포함 (타입 체크용)

### 지원 환경
- Node.js >= 18.0.0
- MCP SDK stdio 및 HTTP transport
- Railway, Smithery 배포 지원
