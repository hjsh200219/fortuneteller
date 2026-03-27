# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code에게 제공되는 가이드입니다.

**모든 응답을 한국어로 작성해야 합니다.**

## 프로젝트 개요

한국 전통 사주팔자 MCP(Model Context Protocol) 서버.
**기술 스택**: TypeScript (ES2022, strict), Node.js 18+, MCP SDK, Zod, date-fns

## 개발 명령어

```bash
npm run build    # TypeScript → dist/ 빌드
npm run watch    # 핫 리로드 개발
npm start        # 빌드된 서버 실행
npm test         # Jest 테스트
npm run lint     # ESLint 검사
npm run format   # Prettier 포맷팅
```

## 아키텍처 요약

> 상세: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

```
[진입점] src/index.ts
    ↓
[L1] src/core/        MCP 서버 + 도구 스키마 + 라우팅
    ↓
[L2] src/tools/       7개 도구 핸들러
    ↓
[L3] src/lib/         비즈니스 로직 (saju.ts 중심 10단계 파이프라인)
    ↓                  ├── yongsin/      용신 4종 알고리즘
    ↓                  └── interpreters/ 해석 유파 5종
[L4] src/data/        정적 데이터 (절기, 음력, 경도 - 1900~2200)
    ↓
[L5] src/types/ + utils/  타입 정의 + 진태양시 보정
```

**의존성 규칙**: 상위 → 하위만 허용. 역방향/순환 참조 금지.
상세 규칙: [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md)

## 7개 MCP 도구

| 도구 | 설명 |
|------|------|
| `analyze_saju` | 사주 분석 통합 (basic/fortune/yongsin/school_compare/yongsin_method) |
| `check_compatibility` | 궁합 분석 |
| `convert_calendar` | 양력/음력 변환 |
| `get_daily_fortune` | 일일 운세 |
| `get_dae_un` | 대운(10년) 조회 |
| `get_fortune_by_period` | 시간대별 운세 |
| `manage_settings` | 해석 설정 관리 |

## 핵심 불변 규칙

1. **사주 파이프라인 순서 보존**: 10단계 순서 변경/건너뛰기 절대 금지
2. **ESLint Disable 절대 금지**: `eslint-disable`, `@ts-ignore` 등 사용 금지. 코드 수정으로만 해결
3. **코드 수정 후**: 반드시 `npm run lint` 실행, 에러 0건 확인
4. **데이터 테이블 수동 편집 금지**: `solar_terms_*.ts`, `lunar_table_*.ts` 직접 수정 금지
5. **외부 API 의존성 추가 금지**: 모든 데이터는 로컬 테이블 기반
6. **에러 메시지 한국어**: 모든 에러 메시지는 한국어 + 올바른 형식 안내

## 사주 도구 호출 전 확인 사항

> 상세: [docs/references/interpretation-guide.md](docs/references/interpretation-guide.md)

사주 도구 호출 전 사용자에게 반드시 확인: 이름, 양력/음력, 생년월일시, 성별, 출생지.
이름/한자는 대화 맥락용이며 도구에는 스키마 필드만 전달.

## 도구 추가/수정 시 체크리스트

> 상세: [docs/references/development-patterns.md](docs/references/development-patterns.md)

1. `src/tools/new_tool.ts` - 핸들러 생성
2. `src/core/tool-definitions.ts` - 스키마 추가
3. `src/core/tool-handler.ts` - switch case 추가
4. `src/tools/index.ts` - export 추가
5. 스키마 properties와 핸들러 Args 인터페이스 1:1 대응 확인

## 문서 맵

> 전체 문서 맵: [AGENTS.md](AGENTS.md)

| 문서 | 내용 |
|------|------|
| [AGENTS.md](AGENTS.md) | 에이전트 맵 (전체 문서 인덱스) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 시스템 아키텍처 개요 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 도메인 맵, 레이어 구조, 의존성, 파이프라인 |
| [docs/DESIGN.md](docs/DESIGN.md) | 설계 원칙, 기술 결정 근거 |
| [docs/QUALITY.md](docs/QUALITY.md) | 도메인/레이어별 A-F 품질 평가 |
| [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) | 정량적 품질 점수 추적 |
| [docs/RELIABILITY.md](docs/RELIABILITY.md) | 신뢰성 기준, 계산 불변량, 검증 절차 |
| [docs/SECURITY.md](docs/SECURITY.md) | 보안 고려사항, 입력 검증 |
| [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) | 제품 감각, 도메인 지식 |
| [docs/PLANS.md](docs/PLANS.md) | 실행 계획, 로드맵 |
| [docs/FRONTEND.md](docs/FRONTEND.md) | MCP 프로토콜 인터페이스 |
| [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) | 레이어 의존성 규칙 |
| [docs/design-docs/core-beliefs.md](docs/design-docs/core-beliefs.md) | 핵심 설계 신념 |
| [docs/exec-plans/tech-debt-tracker.md](docs/exec-plans/tech-debt-tracker.md) | 기술 부채 추적 |
| [docs/generated/db-schema.md](docs/generated/db-schema.md) | 데이터 스키마 (정적 테이블) |
| [docs/references/interpretation-guide.md](docs/references/interpretation-guide.md) | 명리 해석 6항목, 엔진 충돌 방지 |
| [docs/references/development-patterns.md](docs/references/development-patterns.md) | 코딩 패턴, API 사용법 |
| [docs/references/glossary.md](docs/references/glossary.md) | 사주 용어집 (한/한자/영) |
| [docs/references/mcp-test-setup.md](docs/references/mcp-test-setup.md) | Claude Desktop 연동 설정 |

## 응답 언어 규칙

모든 응답을 한국어로 작성. 기술 용어는 한국어 우선, 필요시 영문 병기.
