# AGENTS.md

> fortuneteller - 한국 전통 사주팔자 MCP 서버 에이전트 맵

## Quick Reference

- **언어**: 모든 응답 한국어 (기술 용어는 영문 병기 가능)
- **기술 스택**: TypeScript (ES2022, strict), Node.js 18+, MCP SDK, Zod, date-fns
- **빌드**: `npm run build` | **린트**: `npm run lint` | **테스트**: `npm test`

## Core Rules (절대 불변)

1. 사주 파이프라인 10단계 순서 변경/건너뛰기 절대 금지
2. `eslint-disable`, `@ts-ignore` 사용 절대 금지
3. 코드 수정 후 반드시 `npm run lint` 실행, 에러 0건 확인
4. `solar_terms_*.ts`, `lunar_table_*.ts` 데이터 테이블 수동 편집 금지
5. 외부 API 의존성 추가 금지 (모든 데이터 로컬 테이블 기반)
6. 에러 메시지 한국어 + 올바른 형식 안내

## Document Map

### Architecture & Design
| 문서 | 내용 |
|------|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | 시스템 아키텍처 개요 (진입점) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 도메인 맵, 레이어 구조, 파이프라인 상세 |
| [docs/DESIGN.md](docs/DESIGN.md) | 설계 원칙, 기술 결정 근거 |
| [docs/design-docs/index.md](docs/design-docs/index.md) | 설계 문서 인덱스 |
| [docs/design-docs/core-beliefs.md](docs/design-docs/core-beliefs.md) | 핵심 설계 신념 |
| [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) | 레이어 의존성 규칙 |

### Quality & Reliability
| 문서 | 내용 |
|------|------|
| [docs/QUALITY.md](docs/QUALITY.md) | 도메인/레이어별 A-F 품질 평가 |
| [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) | 정량적 품질 점수 및 추적 |
| [docs/RELIABILITY.md](docs/RELIABILITY.md) | 신뢰성 기준, 계산 불변량, 검증 절차 |
| [docs/SECURITY.md](docs/SECURITY.md) | 보안 고려사항, 입력 검증, 데이터 보호 |

### Product & Planning
| 문서 | 내용 |
|------|------|
| [docs/product-specs/index.md](docs/product-specs/index.md) | 제품 사양 인덱스 |
| [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) | 제품 감각, 사용자 가치, 도메인 지식 |
| [docs/PLANS.md](docs/PLANS.md) | 실행 계획 개요, 로드맵 |
| [docs/FRONTEND.md](docs/FRONTEND.md) | 프론트엔드 해당사항 (MCP 프로토콜 인터페이스) |
| [docs/exec-plans/tech-debt-tracker.md](docs/exec-plans/tech-debt-tracker.md) | 기술 부채 추적 |

### Reference & Generated
| 문서 | 내용 |
|------|------|
| [docs/references/interpretation-guide.md](docs/references/interpretation-guide.md) | 명리 해석 가이드, 도구 호출 전 확인 |
| [docs/references/development-patterns.md](docs/references/development-patterns.md) | 코딩 패턴, API 사용법 |
| [docs/references/glossary.md](docs/references/glossary.md) | 사주 용어집 (한/한자/영) |
| [docs/references/mcp-test-setup.md](docs/references/mcp-test-setup.md) | Claude Desktop 연동 설정 |
| [docs/generated/db-schema.md](docs/generated/db-schema.md) | 데이터 스키마 (정적 테이블 구조) |

## Tool Addition Checklist

1. `src/tools/new_tool.ts` - 핸들러 생성
2. `src/core/tool-definitions.ts` - 스키마 추가
3. `src/core/tool-handler.ts` - switch case 추가
4. `src/tools/index.ts` - export 추가
5. 스키마 properties와 핸들러 Args 인터페이스 1:1 대응 확인

## Pre-Tool-Call Checklist (사주 분석)

사주 도구 호출 전 사용자에게 반드시 확인:
이름, 양력/음력, 생년월일시(YYYY-MM-DD HH:mm), 성별, 출생지(시군구)

> 상세: [docs/references/interpretation-guide.md](docs/references/interpretation-guide.md)

> Be concise. No filler. Straight to the point. Use fewer words.


## TDD 필수

모든 새 기능/로직 변경은 반드시 TDD로 개발한다.
1. Red: 실패하는 테스트 먼저 작성
2. Green: 테스트를 통과하는 최소 코드 작성
3. Refactor: 코드 정리
테스트 없는 코드 변경은 허용하지 않는다.
