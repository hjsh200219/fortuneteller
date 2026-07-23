# 원클릭 설치 (.mcpb 번들) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Claude Desktop 사용자가 `.mcpb` 파일 다운로드 → 더블클릭 → "설치" 클릭만으로 사주 MCP 서버를 설치할 수 있게 한다 (Node.js 설치 불필요).

**Architecture:** 리포 루트에 MCPB manifest를 두고, 빌드 스크립트가 스테이징 폴더에 dist + 프로덕션 의존성만 모아 `mcpb pack`으로 `.mcpb`를 산출한다. GitHub Actions가 `v*` 태그마다 릴리스를 만들고 파일을 첨부한다. 서버 런타임 코드(src/)는 변경하지 않는다.

**Tech Stack:** MCPB(manifest_version 0.3), `@anthropic-ai/mcpb` CLI(devDependency, ^2.1.2), Node ESM 빌드 스크립트, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-07-23-one-click-mcpb-install-design.md`

## Global Constraints

- `manifest_version`은 `"0.3"` 고정
- 번들에는 프로덕션 의존성 5개만 포함: `@modelcontextprotocol/sdk`, `@smithery/sdk`, `date-fns`, `date-fns-tz`, `zod`
- `compatibility.platforms`: `["darwin", "win32"]`, `runtimes.node`: `">=18.0.0"`
- 루트 `manifest.json`의 `version`은 placeholder `"0.0.0"` — 실제 버전은 빌드 시 `package.json`에서 주입
- `@anthropic-ai/mcpb`는 devDependency로만 사용 (전역 설치 요구 금지)
- 서버 코드(src/) 수정 금지
- 이 프로젝트의 jest는 프로세스가 안 죽는 문제가 있음 — CI에서 jest 실행 시 반드시 `--forceExit` 사용
- 릴리스 대상 원격은 origin(`mmdal0857/fortuneteller`)

---

### Task 1: manifest.json 추가 + 프로젝트 설정 갱신

**Files:**
- Create: `manifest.json`
- Modify: `package.json` (devDependency 추가)
- Modify: `.gitignore` (스테이징·산출물 제외)
- Modify: `docs/superpowers/specs/2026-07-23-one-click-mcpb-install-design.md` (도구 개수 7→8 정정)

**Interfaces:**
- Produces: 루트 `manifest.json` — Task 2의 빌드 스크립트가 이 파일을 읽어 `version` 필드만 바꿔 스테이징에 복사한다. `server.entry_point`는 `dist/index.js`, 경로 변수는 `${__dirname}` 사용.

- [ ] **Step 1: devDependency 설치**

```bash
cd F:/Project/saju/fortuneteller
npm install --save-dev @anthropic-ai/mcpb
```

Expected: `package.json` devDependencies에 `"@anthropic-ai/mcpb": "^2.1.2"` (또는 그 이상) 추가됨.

- [ ] **Step 2: manifest.json 작성**

리포 루트에 `manifest.json` 생성 (아래 내용 그대로):

```json
{
  "manifest_version": "0.3",
  "name": "saju-mcp-server",
  "display_name": "사주 운세 (Saju)",
  "version": "0.0.0",
  "description": "한국 전통 사주팔자 운세 분석 — 사주·운세·궁합·대운·음양력 변환",
  "long_description": "생년월일시로부터 사주팔자를 계산하고 운세·궁합·대운·용신을 분석하는 MCP 서버입니다. 1900-2200년 음양력 로컬 테이블을 내장해 외부 API 없이 동작하며, `첫 징후 → 균열 → 반전 → 선택의 문` 구조의 드라마투르기 상담 지침을 제공합니다.",
  "author": {
    "name": "Hoshin"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/mmdal0857/fortuneteller.git"
  },
  "homepage": "https://github.com/mmdal0857/fortuneteller",
  "support": "https://github.com/mmdal0857/fortuneteller/issues",
  "server": {
    "type": "node",
    "entry_point": "dist/index.js",
    "mcp_config": {
      "command": "node",
      "args": ["${__dirname}/dist/index.js"]
    }
  },
  "tools": [
    { "name": "analyze_saju", "description": "사주팔자 통합 분석 (기본 계산·운세·용신·유파 비교)" },
    { "name": "check_compatibility", "description": "두 사람 궁합 분석" },
    { "name": "convert_calendar", "description": "양력↔음력 변환" },
    { "name": "get_daily_fortune", "description": "일일 운세" },
    { "name": "get_dae_un", "description": "10년 단위 대운 조회" },
    { "name": "get_fortune_by_period", "description": "연·월·시간대별 운세" },
    { "name": "manage_settings", "description": "해석 설정 관리" },
    { "name": "get_design_template", "description": "사주 시각화 디자인 템플릿" }
  ],
  "prompts": [
    {
      "name": "dramatic_saju_consultation",
      "description": "드라마투르기 구조(첫 징후→균열→반전→선택의 문)의 사주 상담",
      "arguments": ["focus"],
      "text": "사주 상담을 드라마투르기 구조(첫 징후 → 균열 → 반전 → 선택의 문)로 진행해줘. 지금 가장 궁금한 것: ${arguments.focus}"
    }
  ],
  "keywords": ["saju", "fortune", "korean-astrology", "사주팔자", "운세", "궁합"],
  "license": "MIT",
  "compatibility": {
    "platforms": ["darwin", "win32"],
    "runtimes": {
      "node": ">=18.0.0"
    }
  }
}
```

- [ ] **Step 3: manifest 검증 실행**

```bash
npx mcpb validate manifest.json
```

Expected: `Manifest is valid` (또는 동등한 성공 메시지). 실패 시 오류 메시지의 필드를 수정 후 재실행.

- [ ] **Step 4: .gitignore에 빌드 산출물 추가**

`.gitignore` 끝에 추가:

```
# MCPB bundle build
.mcpb-staging/
*.mcpb
```

- [ ] **Step 5: 스펙 문서 도구 개수 정정**

`docs/superpowers/specs/2026-07-23-one-click-mcpb-install-design.md`에서
`` `tools`: 7개 통합 도구 이름·한 줄 설명 명시 `` →
`` `tools`: 8개 통합 도구 이름·한 줄 설명 명시 (`get_design_template` 포함) `` 로 수정.

- [ ] **Step 6: Commit**

```bash
git add manifest.json package.json package-lock.json .gitignore docs/superpowers/specs/2026-07-23-one-click-mcpb-install-design.md
git commit -m "feat: add mcpb manifest for one-click install"
```

---

### Task 2: 빌드 스크립트 `scripts/build-mcpb.mjs`

**Files:**
- Create: `scripts/build-mcpb.mjs`
- Modify: `package.json` (`scripts.build:mcpb` 추가)

**Interfaces:**
- Consumes: Task 1의 루트 `manifest.json` (version placeholder `0.0.0`)
- Produces: 리포 루트에 `saju-mcp-server-<package.json 버전>.mcpb` 파일. Task 3의 CI가 `npm run build:mcpb` 한 번으로 이 파일을 얻는다. 중간 산출물은 `.mcpb-staging/` (gitignore됨).

- [ ] **Step 1: 빌드 스크립트 작성**

`scripts/build-mcpb.mjs` 생성 (아래 내용 그대로):

```js
#!/usr/bin/env node
/**
 * .mcpb 번들 빌드
 * 사용: npm run build:mcpb
 * 산출: saju-mcp-server-<version>.mcpb (리포 루트)
 */
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const staging = join(root, '.mcpb-staging');

function run(cmd, cwd = root) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// 1. TypeScript 빌드
run('npm run build');

// 2. 스테이징 폴더 구성
rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });

// dist 복사 — 소스맵·타입 선언·벤치마크는 실행에 불필요
cpSync(join(root, 'dist'), join(staging, 'dist'), {
  recursive: true,
  filter: (src) => {
    if (src.endsWith('.map') || src.endsWith('.d.ts')) return false;
    if (src.split(sep).includes('benchmark')) return false;
    return true;
  },
});

for (const f of ['package.json', 'package-lock.json']) {
  cpSync(join(root, f), join(staging, f));
}

// manifest 복사 + 실제 버전 주입
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
manifest.version = pkg.version;
writeFileSync(join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

// 3. 프로덕션 의존성만 설치 (postinstall 등 스크립트 실행 안 함)
run('npm ci --omit=dev --ignore-scripts', staging);

// 4. 검증 후 패킹
run('npx mcpb validate .mcpb-staging/manifest.json');
const output = `saju-mcp-server-${pkg.version}.mcpb`;
run(`npx mcpb pack .mcpb-staging ${output}`);

if (!existsSync(join(root, output))) {
  console.error(`오류: ${output} 생성 실패`);
  process.exit(1);
}
console.log(`\n완료: ${output}`);
```

- [ ] **Step 2: package.json에 스크립트 추가**

`package.json`의 `scripts`에 추가 (`"build"` 항목 바로 아래):

```json
"build:mcpb": "node scripts/build-mcpb.mjs",
```

- [ ] **Step 3: 빌드 실행**

```bash
cd F:/Project/saju/fortuneteller
npm run build:mcpb
```

Expected: 마지막 줄에 `완료: saju-mcp-server-1.2.0.mcpb`. `.mcpb-staging/node_modules/`가 생성되고 그 안에 프로덕션 의존성만 존재.

- [ ] **Step 4: 산출물 검증 — 번들 정보**

```bash
npx mcpb info saju-mcp-server-1.2.0.mcpb
```

Expected: name `saju-mcp-server`, version `1.2.0` (placeholder 0.0.0이 아님) 표시.

- [ ] **Step 5: 산출물 검증 — devDependency 미포함 확인**

```bash
ls .mcpb-staging/node_modules | grep -E "typescript|jest|eslint" || echo "OK: dev deps 없음"
```

Expected: `OK: dev deps 없음`

- [ ] **Step 6: 산출물 검증 — 스테이징 서버 스모크 테스트**

번들에 담긴 그대로의 서버가 뜨는지 확인 (Git Bash):

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0.0"}}}' | node .mcpb-staging/dist/index.js | head -1
```

Expected: `"serverInfo"`가 포함된 JSON-RPC 응답 1줄. (의존성 누락 시 여기서 MODULE_NOT_FOUND로 실패한다)

- [ ] **Step 7: Commit**

```bash
git add scripts/build-mcpb.mjs package.json
git commit -m "feat: add mcpb bundle build script"
```

---

### Task 3: GitHub Actions 릴리스 워크플로

**Files:**
- Create: `.github/workflows/release-mcpb.yml`

**Interfaces:**
- Consumes: Task 2의 `npm run build:mcpb` (산출 파일명 패턴 `saju-mcp-server-*.mcpb`)
- Produces: `v*` 태그 push 시 GitHub Release + `.mcpb` 자산. README(Task 4)의 `releases/latest` 링크가 이 릴리스를 가리킨다.

- [ ] **Step 1: 워크플로 작성**

`.github/workflows/release-mcpb.yml` 생성 (아래 내용 그대로):

```yaml
name: Release MCPB

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: 태그와 package.json 버전 일치 확인
        run: |
          TAG_VERSION="${GITHUB_REF_NAME#v}"
          PKG_VERSION="$(node -p "require('./package.json').version")"
          if [ "$TAG_VERSION" != "$PKG_VERSION" ]; then
            echo "::error::태그 v$TAG_VERSION 와 package.json $PKG_VERSION 불일치"
            exit 1
          fi

      - name: 테스트
        run: npx jest --forceExit

      - name: 번들 빌드
        run: npm run build:mcpb

      - name: 릴리스 생성 및 파일 첨부
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          gh release create "$GITHUB_REF_NAME" \
            --title "사주 MCP 서버 $GITHUB_REF_NAME" \
            --generate-notes \
            saju-mcp-server-*.mcpb
```

- [ ] **Step 2: YAML 문법 검증**

```bash
node -e "const fs=require('fs'); require('./node_modules/js-yaml/index.js').load(fs.readFileSync('.github/workflows/release-mcpb.yml','utf8')); console.log('YAML OK')"
```

Expected: `YAML OK` (js-yaml은 jest 의존성으로 이미 node_modules에 있음. 없으면 `npx js-yaml .github/workflows/release-mcpb.yml`로 대체)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release-mcpb.yml
git commit -m "ci: build and attach mcpb bundle on release tags"
```

---

### Task 4: README 개편 — 초보자용 설치 최상단 배치

**Files:**
- Modify: `README.md:46-92` ("🚀 시작하기" 섹션 전체 교체)

**Interfaces:**
- Consumes: Task 3의 릴리스 URL 규칙 (`https://github.com/mmdal0857/fortuneteller/releases/latest`)

- [ ] **Step 1: "🚀 시작하기" 섹션 교체**

README.md의 `## 🚀 시작하기`부터 `## 🛠️ MCP 도구` 직전까지(기존 "필수 요구사항"·"설치" 소섹션 전체)를 아래로 교체:

```markdown
## 🚀 시작하기

### 원클릭 설치 (초보자용 — Node.js 설치 불필요)

Claude Desktop 앱만 있으면 됩니다. 터미널도, Node.js도, 설정 파일 편집도 필요 없습니다.

1. **[최신 릴리스 페이지](https://github.com/mmdal0857/fortuneteller/releases/latest)** 에서 `saju-mcp-server-x.x.x.mcpb` 파일을 다운로드합니다.
2. 다운로드한 파일을 **더블클릭**합니다. Claude Desktop이 열리며 설치 창이 표시됩니다.
3. **"설치"** 버튼을 클릭합니다.

설치가 끝나면 Claude Desktop 채팅에서 바로 사용할 수 있습니다. 예: *"1990년 3월 15일 오전 10시 30분생 남자 사주 봐줘"*

> Claude Desktop이 없다면 [claude.ai/download](https://claude.ai/download)에서 먼저 설치하세요.

### 개발자용 설치

**필수 요구사항**: Node.js 18 이상, npm/yarn/pnpm

#### npm 설치

```bash
# npm으로 전역 설치
npm install -g @hoshin/saju-mcp-server

# 또는 npx로 직접 실행
npx @hoshin/saju-mcp-server
```

#### 자동 설치 스크립트 (macOS)

```bash
# npm 전역 설치 + Claude Desktop 설정 자동 등록
curl -fsSL https://raw.githubusercontent.com/hjsh200219/fortuneteller/main/install.sh | bash
```

#### 소스에서 빌드

```bash
git clone https://github.com/hjsh200219/fortuneteller.git
cd fortuneteller
npm install

# 개발 모드 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start

# .mcpb 원클릭 설치 파일 빌드
npm run build:mcpb
```
```

주의: 마크다운 내부의 코드블록 중첩에 유의해 기존 문서 포맷이 깨지지 않게 교체할 것. `## 🛠️ MCP 도구` 이후는 건드리지 않는다.

- [ ] **Step 2: 렌더링 확인**

```bash
grep -n "원클릭 설치\|개발자용 설치\|releases/latest" README.md
```

Expected: 세 패턴 모두 46~110행 범위에서 발견. `## 🛠️ MCP 도구` 섹션이 그대로 남아 있는지도 확인:

```bash
grep -n "## 🛠️ MCP 도구" README.md
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: put one-click mcpb install first in readme"
```

---

### Task 5: 최종 검증 및 첫 릴리스 준비

**Files:**
- 없음 (검증·릴리스 절차만)

**Interfaces:**
- Consumes: Task 1~4 전체

- [ ] **Step 1: 클린 빌드 전체 재실행**

```bash
cd F:/Project/saju/fortuneteller
rm -rf .mcpb-staging *.mcpb
npm run build:mcpb
npx mcpb info saju-mcp-server-1.2.0.mcpb
```

Expected: 에러 없이 `.mcpb` 재생성, info에 올바른 name/version.

- [ ] **Step 2: 기존 테스트 통과 확인 (서버 코드 무변경 검증)**

```bash
npx jest --forceExit
```

Expected: 기존 테스트 전부 PASS (이 기능은 src/를 건드리지 않으므로 실패하면 안 됨).

- [ ] **Step 3: 사용자 수동 확인 요청 (자동화 불가)**

사용자에게 안내: 리포 루트의 `saju-mcp-server-1.2.0.mcpb`를 더블클릭해 Claude Desktop 설치 창 확인 → 설치 → 채팅에서 사주 도구 1회 호출 확인.

- [ ] **Step 4: 첫 릴리스 (사용자 승인 후)**

더블클릭 설치가 확인되면:

```bash
npm version minor          # 1.2.0 → 1.3.0, 커밋+태그 v1.3.0 자동 생성
git push origin feat/one-click-mcpb-install --follow-tags
```

Expected: origin에 태그 push → `Release MCPB` 워크플로 실행 → Release에 `saju-mcp-server-1.3.0.mcpb` 첨부. `gh run watch`로 확인 가능.

주의: push는 사용자 승인 후에만 실행한다.
