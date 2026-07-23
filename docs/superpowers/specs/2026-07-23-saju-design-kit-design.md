# 사주 디자인 킷 설계

작성일: 2026-07-23

## 1. 배경

드라마투르기 계약(2026-07-18)으로 상담의 대화 연출은 정리됐지만, 결과 표현은 여전히 텍스트뿐이다. MCP 클라이언트(Claude Desktop 등)는 아티팩트로 HTML을 렌더링할 수 있으므로, 서버가 시각 표현의 기준을 제공하면 클라이언트 LLM이 결과를 디자인된 화면으로 보여줄 수 있다.

완성형 템플릿을 도구별로 만드는 대신, **기본 디자인 구조(디자인 킷)만 서버가 제공하고 확장·조립은 클라이언트 LLM이 수행**한다. 이 방식은 도구 5종 전부에 별도 템플릿 없이 확장되고, 단계적 공개 연출 중에는 부분 컴포넌트만 렌더하는 유연성도 준다.

## 2. 확정된 제품 결정

- 제공 형태: 완성형 페이지가 아닌 디자인 킷(CSS 토큰 + 컴포넌트 조각 + 사용 지침)
- 전달 방식: 새 MCP 도구 `get_design_template` — LLM이 필요할 때 자율 호출
- 렌더 방식: 클라이언트 LLM이 킷을 확장해 아티팩트(자립형 HTML)로 구성
- 렌더 타이밍: 사용자가 시각화를 요청할 때, 또는 단계적 공개가 끝난 마무리 정리 단계. 단계 중에는 해당 비트의 부분 컴포넌트만 허용
- 드라마투르기 경계: `get_design_template`은 유틸리티로 분류(연출 제외 대상)
- 비주얼 기본 방향: 절제된 전통 한국풍 — 한지 톤 바탕, 오행 전통 5색의 현대화 팔레트, 모던 산세리프. 라이트·다크 모두 대응. LLM이 상황에 맞게 변형 가능하되 오행 색 의미는 유지

## 3. 목표와 비목표

### 목표

1. 클라이언트 LLM이 도구 호출 한 번으로 시각화 기준(토큰·컴포넌트·지침)을 얻는다.
2. 사주판·오행·점수·대운 등 핵심 데이터가 일관된 시각 언어로 표현된다.
3. 킷은 완전 자립형이다 — 외부 폰트·CDN·스크립트 의존 없음.
4. 킷 내용과 도구 배선을 계약 테스트로 회귀 감지한다.
5. 기존 계산 파이프라인·도구 JSON·드라마투르기 계약을 변경하지 않는다.

### 비목표

- 서버가 완성된 HTML 페이지를 생성하지 않는다 (데이터 주입은 LLM 몫).
- MCP Apps(`ui://` 인터랙티브 렌더)는 이번 범위가 아니다 — 킷은 추후 승격 시 재사용 가능하게만 설계.
- 렌더 결과의 픽셀 단위 일관성을 강제하지 않는다 (클라이언트·모델별 차이 허용).
- 차트 라이브러리 등 외부 의존성을 추가하지 않는다.

## 4. 아키텍처

### 새 모듈: `src/core/design-kit.ts`

단일 소스. 다음을 export:

- `DESIGN_KIT_TOOL_NAME = 'get_design_template'`
- `DESIGN_KIT_CSS_TOKENS` — CSS 커스텀 프로퍼티 블록: 오행 5색(목 `--saju-wood`, 화 `--saju-fire`, 토 `--saju-earth`, 금 `--saju-metal`, 수 `--saju-water`), 바탕·먹색·강조 톤, 간격·서체 변수, 라이트/다크 `prefers-color-scheme` 대응
- `DESIGN_KIT_COMPONENTS` — 빈 슬롯이 있는 HTML 조각 6종:
  1. 사주판 4기둥 그리드 (년/월/일/시 × 천간/지지, 오행 색 배지)
  2. 오행 분포 바 (개수 비례 가로 막대)
  3. 점수 게이지 (0-100, 일일 운세·궁합 점수용)
  4. 십성 태그 목록
  5. 대운 타임라인 (10년 구간 가로 스트립)
  6. 섹션 카드 (제목 + 본문 + 근거 필드 각주)
- `DESIGN_KIT_GUIDE` — 한국어 사용 지침: 어떤 도구 결과 필드를 어느 슬롯에 넣는지 매핑 표, 부분 렌더 규칙(단계적 공개 중에는 현재 비트 관련 컴포넌트만), 확장 허용 범위(색 의미 유지, 외부 리소스 금지, 자립형 HTML 유지)
- `buildDesignKit(): string` — 위 세 블록을 하나의 마크다운 문서로 조립
- `DESIGN_KIT_INSTRUCTIONS` — 서버 instructions에 덧붙일 짧은 안내: 시각화 시 `get_design_template` 호출, 렌더 타이밍 규칙

### 도구 배선 (AGENTS.md 체크리스트 준수)

1. `src/tools/get_design_template.ts` — 핸들러: 인자 없음, `buildDesignKit()` 결과 반환
2. `src/core/tool-definitions.ts` — 스키마 추가 (설명은 한국어, 드라마투르기 suffix 미부착)
3. `src/core/tool-handler.ts` — switch case 추가
4. `src/tools/index.ts` — export 추가

### 기존 모듈 변경

- `src/core/dramaturgy-prompt.ts` — `DRAMATURGY_EXCLUDED_TOOLS`에 `get_design_template` 추가 (제외 도구 라인에 자동 반영)
- `src/core/server.ts` — `instructions: DRAMATURGY_INSTRUCTIONS + '\n\n' + DESIGN_KIT_INSTRUCTIONS`로 조합
- `tests/server-prompts.test.ts` — instructions 동일성 단언을 "두 블록을 모두 포함" 단언으로 갱신

### 데이터 흐름

```
사용자 시각화 요청 (또는 상담 마무리)
  → 클라이언트 LLM이 get_design_template 호출
  → 서버가 킷(토큰+컴포넌트+지침) 반환
  → LLM이 이미 보유한 도구 결과 JSON을 슬롯에 채워 자립형 HTML 아티팩트 구성
  → 클라이언트가 아티팩트 렌더
```

## 5. 오류 처리

- `get_design_template`은 입력이 없어 실패 경로가 사실상 없다. 예기치 못한 내부 오류는 기존 `tool-handler` 공통 오류 포맷(한국어 메시지 JSON)을 그대로 따른다.

## 6. 테스트 전략 (TDD)

- `tests/design-kit.test.ts` — 킷 계약: 오행 5색 토큰 전부 존재, 컴포넌트 6종 마커 존재, 지침에 부분 렌더·자립형·외부 리소스 금지 문구 존재, `buildDesignKit()`이 세 블록을 모두 포함
- `tests/tool-definitions-dramaturgy.test.ts` — 기존 `test.each`가 확장된 `DRAMATURGY_EXCLUDED_TOOLS`를 자동 검증 (get_design_template 설명에 프롬프트 참조 없음)
- `tests/server-prompts.test.ts` — instructions가 드라마투르기 계약과 디자인 킷 안내를 모두 포함
- 배선 테스트 — `tools/list`에 8번째 도구 노출, `tools/call`이 킷 텍스트 반환

## 7. 문서

- `README.md` — "7개 통합 도구" → 8개로 갱신, 디자인 킷 사용법 단락 추가
- `docs/references/` — 필요 시 킷 사용 예시는 추후 별도 문서(이번 범위 아님)
