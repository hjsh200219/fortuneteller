# 원클릭 설치 (.mcpb 번들) 설계

- 날짜: 2026-07-23
- 상태: 승인됨
- 배경: 초보 사용자 테스트에서 "Node.js부터 설치하라"는 요구가 최대 이탈 지점으로 확인됨. npm 전역 설치·JSON 설정 편집 없이 설치할 수 있는 경로가 필요하다.

## 목표

Claude Desktop 사용자(Windows/macOS)가 **파일 다운로드 → 더블클릭 → "설치" 클릭** 3단계만으로 사주 MCP 서버를 사용할 수 있게 한다.

- Node.js 설치 불필요 — Claude Desktop 내장 Node 런타임 사용
- `claude_desktop_config.json` 편집 불필요 — Claude Desktop이 자동 등록
- 기존 npm/소스 설치 경로는 개발자용으로 유지 (추가 방식, 대체 아님)

## 비목표

- 원격 호스팅 서버(커넥터 URL 등록) 방식 — 호스팅 비용·운영 부담, 초보에게 설정 UI 진입이 오히려 어려움
- 단일 실행파일(.exe) — 코드 서명 없는 exe는 SmartScreen/백신 경고로 초보 이탈 유발
- Claude Desktop 외 클라이언트의 원클릭 지원

## 채택 기술

Anthropic 공식 **MCP Bundle(MCPB, 구 DXT)** 포맷.

- 스펙: https://github.com/anthropics/mcpb (manifest_version `0.3`, 2025-12-02 기준)
- `.mcpb` = 서버 코드 + `node_modules` + `manifest.json`을 담은 zip
- CLI: `@anthropic-ai/mcpb` (`mcpb validate`, `mcpb pack`)
- Claude for macOS/Windows가 더블클릭 설치·자동 업데이트·설치 대화상자를 제공

## 구성 요소

### 1. `manifest.json` (리포 루트)

- `manifest_version: "0.3"`, `name: "saju-mcp-server"`, `display_name: "사주 운세 (Saju)"`
- `version`: 빌드 시 `package.json`에서 자동 주입 (수동 동기화 금지)
- `server`: `type: "node"`, `entry_point: "dist/index.js"`, `mcp_config.command: "node"`, `args: ["${__dirname}/dist/index.js"]`
- `user_config` 없음 — API 키가 필요 없는 서버이므로 설치 창에서 아무것도 묻지 않는다
- `tools`: 7개 통합 도구 이름·한 줄 설명 명시 → 설치 대화상자에 도구 목록 표시
- `prompts`: `dramatic_saju_consultation` 명시
- `compatibility.platforms`: `["darwin", "win32"]`, `runtimes.node: ">=18.0.0"`
- 리포 루트의 manifest는 버전 필드를 placeholder(`0.0.0`)로 두고, 빌드 스크립트가 스테이징 복사본에 실제 버전을 기록한다

### 2. 빌드 스크립트 `scripts/build-mcpb.mjs` (`npm run build:mcpb`)

크로스 플랫폼 Node 스크립트 하나로 처리:

1. `npm run build` (tsc) 실행
2. 스테이징 폴더(`.mcpb-staging/`, gitignore 대상) 구성:
   - `dist/` 복사 (`*.map`, `*.d.ts`, `benchmark/` 등 실행에 불필요한 파일 제외)
   - `manifest.json` 복사 + `version`을 `package.json` 값으로 치환
   - `package.json`, `package-lock.json` 복사
3. 스테이징에서 `npm ci --omit=dev` → 프로덕션 의존성 5개만 설치
   (`@modelcontextprotocol/sdk`, `@smithery/sdk`, `date-fns`, `date-fns-tz`, `zod`)
4. `mcpb validate` 통과 확인 후 `mcpb pack` → `saju-mcp-server-<버전>.mcpb` 산출
5. `@anthropic-ai/mcpb`는 devDependency로 추가 (전역 설치 요구 금지)

### 3. GitHub Actions 릴리스 자동화 (`.github/workflows/release-mcpb.yml`)

- 트리거: `v*` 태그 push
- 잡: checkout → Node 설치 → `npm ci` → `npm run build:mcpb` → GitHub Release 생성 + `.mcpb` 자산 첨부
- 릴리스 대상: origin(`mmdal0857/fortuneteller`)
- 버전 불일치 가드: 태그(`v1.2.0`)와 `package.json` 버전이 다르면 실패

### 4. README 개편

- "🚀 시작하기" 최상단에 **초보자용 설치** 섹션 신설:
  1. `https://github.com/mmdal0857/fortuneteller/releases/latest` 에서 `.mcpb` 다운로드
  2. 다운로드한 파일 더블클릭
  3. Claude Desktop 설치 창에서 "설치" 클릭
- "Node.js 설치 불필요" 명시
- 기존 npm·소스 빌드·install.sh 경로는 "개발자용 설치"로 아래에 이동
- 필수 요구사항에서 초보자 경로는 "Claude Desktop만 있으면 됨"으로 구분

## 오류 처리

- 빌드 스크립트: 각 단계 실패 시 명확한 메시지와 함께 즉시 중단 (`set -e` 동등 동작)
- `mcpb validate` 실패 시 pack을 진행하지 않는다
- CI: 버전 태그·package.json 불일치 시 릴리스 중단

## 검증

- CI에서 `mcpb validate` + pack 성공을 릴리스 전제 조건으로 강제
- 로컬 검증: `npm run build:mcpb` 산출물을 Claude Desktop에서 실제 더블클릭 설치 → 도구 호출 1회 확인 (수동, 최초 1회 및 릴리스 전)
- 기존 테스트 스위트(jest)는 변경 없이 그대로 통과해야 함 — 서버 코드 자체는 수정하지 않는 설계

## 영향 범위

- 서버 런타임 코드(src/) 변경 없음
- 추가 파일: `manifest.json`, `scripts/build-mcpb.mjs`, `.github/workflows/release-mcpb.yml`
- 수정 파일: `package.json`(스크립트·devDependency), `.gitignore`(스테이징·mcpb 산출물), `README.md`
