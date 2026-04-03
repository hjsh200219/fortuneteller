# Architecture Overview

> fortuneteller - 한국 전통 사주팔자 MCP(Model Context Protocol) 서버

## System Context

```
[Claude Desktop / MCP Client]
        |
        | MCP Protocol (stdio / SSE)
        v
[fortuneteller MCP Server]
        |
        +-- src/index.ts         (stdio transport - 로컬)
        +-- src/server-http.ts   (SSE transport - Railway 배포)
        +-- src/smithery.ts      (Smithery 통합)
```

## Layer Architecture

```
[진입점] index.ts / server-http.ts / smithery.ts
    |
[L1] src/core/           MCP 프레임워크
    |   server.ts            서버 인스턴스 + 핸들러 등록
    |   tool-definitions.ts  7개 도구 Zod 스키마
    |   tool-handler.ts      도구 이름 -> 핸들러 라우팅
    |
[L1.5] src/schemas/      Zod 입력 검증 스키마
    |
[L2] src/tools/           도구 핸들러 (7개)
    |   입력 변환 + lib 호출 + 결과 JSON 직렬화
    |
[L3] src/lib/             비즈니스 로직 (~30개 모듈)
    |   saju.ts              10단계 파이프라인 조율자 (핵심)
    |   +-- yongsin/         용신 알고리즘 4종
    |   +-- interpreters/    해석 유파 5종
    |
[L4] src/data/            정적 데이터 테이블
    |   천간, 지지, 오행, 절기(1900-2200), 음력(1900-2200)
    |   경도(162개 시군구), 직업 DB(500+)
    |
[L5] src/types/ + utils/  타입 정의 + 유틸리티
```

**의존성 규칙**: 상위 -> 하위 방향만 허용. 역방향/순환 참조 절대 금지.

> 상세: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md)

## Core Pipeline: 사주 계산 10단계

```
입력 -> [1] 음력->양력 변환 -> [2] 진태양시 보정
     -> [3] 4기둥 계산 -> [4] 지장간 세력 -> [5] 오행 집계
     -> [6] 십성 분석 -> [7] 신살 탐지 -> [8] 일간 강약
     -> [9] 격국 결정 -> [10] 용신 선정 -> SajuData 출력
```

**불변 규칙**: 각 단계는 이전 단계 결과에 의존. 순서 변경/건너뛰기 절대 금지.

## 7 MCP Tools

| 도구 | 설명 | 주요 의존 모듈 |
|------|------|---------------|
| `analyze_saju` | 사주 분석 통합 (5가지 분석 유형) | saju.ts, fortune.ts, yongsin/* |
| `check_compatibility` | 궁합 분석 | compatibility.ts |
| `convert_calendar` | 양력/음력 변환 | calendar.ts |
| `get_daily_fortune` | 일일 운세 | fortune.ts |
| `get_dae_un` | 대운(10년) 조회 | dae_un.ts |
| `get_fortune_by_period` | 시간대별 운세 | se_un.ts, wol_un.ts, si_un.ts |
| `manage_settings` | 해석 설정 관리 | interpretation_settings.ts |

## External Dependencies

| 패키지 | 용도 |
|--------|------|
| `@modelcontextprotocol/sdk` | MCP 프로토콜 (stdio + SSE) |
| `@smithery/sdk` | Smithery 배포 통합 |
| `date-fns` / `date-fns-tz` | 날짜 처리 + 타임존 |
| `zod` | 입력 스키마 검증 |

외부 API 의존성: **없음** (모든 데이터 로컬 테이블 기반, 1900-2200)

## Deployment

- **로컬**: stdio transport (`npm start`)
- **Railway**: HTTP/SSE transport (`npm run start:http`)
- **Smithery**: `smithery.ts` 통합
- **빌드**: TypeScript -> ES2022 (`dist/`)
