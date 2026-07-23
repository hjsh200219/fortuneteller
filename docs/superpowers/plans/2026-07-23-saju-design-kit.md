# Saju Design Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `get_design_template` MCP tool that returns a self-contained visual design kit (CSS tokens, slot components, Korean usage guide) so client LLMs can render Saju results as designed HTML artifacts.

**Architecture:** A new `src/core/design-kit.ts` module is the single source for tokens, components, guide, and server-instruction blurb. The tool is wired through the existing factory pattern (`tool-definitions.ts` → `tool-handler.ts` → `tools/`), excluded from dramaturgy, and its instructions are appended to the server's initialization instructions.

**Tech Stack:** TypeScript ES2022 strict mode, Node.js 18+, `@modelcontextprotocol/sdk` (installed 1.27.x), Jest 29 with ts-jest ESM, ESLint 9

**Spec:** `docs/superpowers/specs/2026-07-23-saju-design-kit-design.md`

## Global Constraints

- Preserve the immutable 10-step Saju calculation pipeline; do not touch calculation code or data tables (`solar_terms_*.ts`, `lunar_table_*.ts`, `src/lib/saju.ts`).
- Add no external dependency; the kit is fully self-contained (no fonts/CDN/scripts/images).
- Do not use `eslint-disable`, `@ts-ignore`, or weaken TypeScript strictness.
- Keep existing calculation tool JSON payloads unchanged.
- All user-facing text in Korean.
- The server does NOT generate finished HTML pages — the kit provides structure only; data injection is the client LLM's job.
- Render timing rule (must appear in kit guide and instructions): full screens only at consultation wrap-up or on explicit user request; during staged reveal, only partial components for the current beat.
- `get_design_template` is a utility: it joins `DRAMATURGY_EXCLUDED_TOOLS` and its description must NOT reference the dramaturgy prompt.
- Prefix every shell command with `rtk`.
- Full-suite jest hangs after completion (pre-existing open-handles issue): always run the full suite as `rtk npx jest --runInBand --forceExit`.
- Commit only the paths named by each task.

## File Map

| File | Responsibility |
|------|----------------|
| `src/core/design-kit.ts` | Single source: tool name, CSS tokens, 6 slot components, Korean guide, `buildDesignKit()`, server-instruction blurb |
| `src/tools/get_design_template.ts` | Tool handler returning `buildDesignKit()` |
| `src/tools/index.ts` | Export the new handler |
| `src/core/tool-handler.ts` | Route `get_design_template` calls |
| `src/core/tool-definitions.ts` | 8th tool schema (no dramaturgy suffix) |
| `src/core/dramaturgy-prompt.ts` | Add tool to `DRAMATURGY_EXCLUDED_TOOLS` |
| `src/core/server.ts` | Append `DESIGN_KIT_INSTRUCTIONS` to initialization instructions |
| `tests/design-kit.test.ts` | Kit content contract tests |
| `tests/server-design-kit.test.ts` | Tool wiring over in-memory MCP transports |
| `tests/server-prompts.test.ts` | Update instructions assertion to cover both blocks |
| `README.md` | Tool count 7→8, design-kit section (KR) + feature bullet (EN) |

---

### Task 1: Design Kit Module

**Files:**
- Create: `src/core/design-kit.ts`
- Create: `tests/design-kit.test.ts`

**Interfaces:**
- Consumes: nothing (pure constants + one builder function).
- Produces: `DESIGN_KIT_TOOL_NAME` (`'get_design_template'`), `DESIGN_KIT_CSS_TOKENS: string`, `DESIGN_KIT_COMPONENTS: string`, `DESIGN_KIT_GUIDE: string`, `DESIGN_KIT_INSTRUCTIONS: string`, `buildDesignKit(): string`.

- [ ] **Step 1: Write the failing unit tests**

Create `tests/design-kit.test.ts`:

```typescript
import {
  DESIGN_KIT_COMPONENTS,
  DESIGN_KIT_CSS_TOKENS,
  DESIGN_KIT_GUIDE,
  DESIGN_KIT_INSTRUCTIONS,
  DESIGN_KIT_TOOL_NAME,
  buildDesignKit,
} from '../src/core/design-kit.js';

describe('사주 시각화 디자인 킷 계약', () => {
  test('도구 이름이 고정되어 있다', () => {
    expect(DESIGN_KIT_TOOL_NAME).toBe('get_design_template');
  });

  test('CSS 토큰에 오행 5색과 바탕·먹색·다크 대응이 있다', () => {
    const requiredTokens = [
      '--saju-wood',
      '--saju-fire',
      '--saju-earth',
      '--saju-metal',
      '--saju-water',
      '--saju-bg',
      '--saju-ink',
    ];

    for (const token of requiredTokens) {
      expect(DESIGN_KIT_CSS_TOKENS).toContain(token);
    }
    expect(DESIGN_KIT_CSS_TOKENS).toContain('prefers-color-scheme: dark');
  });

  test('컴포넌트 6종 마커가 모두 있다', () => {
    const requiredMarkers = [
      'saju-pillars',
      'saju-wuxing',
      'saju-gauge',
      'saju-tags',
      'saju-daeun',
      'saju-card',
    ];

    for (const marker of requiredMarkers) {
      expect(DESIGN_KIT_COMPONENTS).toContain(marker);
    }
  });

  test('지침에 매핑·부분 렌더·자립형·외부 리소스 금지 규칙이 있다', () => {
    const requiredPhrases = ['필드 매핑', '부분 컴포넌트만 렌더', '자립형 HTML', '외부', '오행 색'];

    for (const phrase of requiredPhrases) {
      expect(DESIGN_KIT_GUIDE).toContain(phrase);
    }
  });

  test('빌드 결과가 토큰·컴포넌트·지침을 모두 포함한다', () => {
    const kit = buildDesignKit();

    expect(kit).toContain(DESIGN_KIT_CSS_TOKENS);
    expect(kit).toContain(DESIGN_KIT_COMPONENTS);
    expect(kit).toContain(DESIGN_KIT_GUIDE);
  });

  test('서버 지침 안내가 도구 이름과 타이밍 규칙을 담는다', () => {
    expect(DESIGN_KIT_INSTRUCTIONS).toContain(DESIGN_KIT_TOOL_NAME);
    expect(DESIGN_KIT_INSTRUCTIONS).toContain('마무리 정리');
    expect(DESIGN_KIT_INSTRUCTIONS).toContain('부분 컴포넌트');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the Red state**

Run:

```powershell
rtk npx jest tests/design-kit.test.ts --runInBand
```

Expected: FAIL because `src/core/design-kit.ts` does not exist.

- [ ] **Step 3: Implement the design kit module**

Create `src/core/design-kit.ts`:

```typescript
/**
 * 사주 시각화 디자인 킷
 * 기본 디자인 구조(토큰·컴포넌트·지침)의 단일 소스.
 * 서버는 구조만 제공하고, 데이터 주입과 확장은 클라이언트 LLM이 수행한다.
 */

export const DESIGN_KIT_TOOL_NAME = 'get_design_template' as const;

export const DESIGN_KIT_CSS_TOKENS = `:root {
  --saju-bg: #faf6ee;
  --saju-surface: #fffdf7;
  --saju-ink: #2b2620;
  --saju-ink-soft: #6b6257;
  --saju-line: #d9d0bf;
  --saju-accent: #8c1f28;
  --saju-wood: #2e7d4f;
  --saju-fire: #c0392b;
  --saju-earth: #b8860b;
  --saju-metal: #8a8f98;
  --saju-water: #1f5fa8;
  --saju-radius: 12px;
  --saju-gap: 16px;
  --saju-font: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --saju-bg: #1c1a17;
    --saju-surface: #26231f;
    --saju-ink: #ece5d8;
    --saju-ink-soft: #a89e90;
    --saju-line: #453f37;
    --saju-accent: #d4737b;
    --saju-metal: #aab0b8;
  }
}` as const;

export const DESIGN_KIT_COMPONENTS = `<style>
  body { background: var(--saju-bg); color: var(--saju-ink); font-family: var(--saju-font); margin: 0; padding: var(--saju-gap); }
  .saju-el-wood { color: var(--saju-wood); border-color: var(--saju-wood); }
  .saju-el-fire { color: var(--saju-fire); border-color: var(--saju-fire); }
  .saju-el-earth { color: var(--saju-earth); border-color: var(--saju-earth); }
  .saju-el-metal { color: var(--saju-metal); border-color: var(--saju-metal); }
  .saju-el-water { color: var(--saju-water); border-color: var(--saju-water); }

  .saju-pillars { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--saju-gap); }
  .saju-pillar { background: var(--saju-surface); border: 1px solid var(--saju-line); border-radius: var(--saju-radius); padding: 12px; text-align: center; }
  .saju-pillar-label { display: block; font-size: 12px; color: var(--saju-ink-soft); margin-bottom: 8px; }
  .saju-stem, .saju-branch { display: block; font-size: 28px; font-weight: 700; border-bottom: 3px solid transparent; padding: 4px 0; }

  .saju-wuxing { display: grid; gap: 6px; }
  .saju-wuxing-row { display: grid; grid-template-columns: 64px 1fr 32px; align-items: center; gap: 8px; font-size: 13px; }
  .saju-wuxing-bar { height: 12px; border-radius: 6px; background: currentColor; }

  .saju-gauge { background: var(--saju-surface); border: 1px solid var(--saju-line); border-radius: var(--saju-radius); padding: 12px; }
  .saju-gauge-track { height: 10px; border-radius: 5px; background: var(--saju-line); overflow: hidden; }
  .saju-gauge-fill { height: 100%; background: var(--saju-accent); }

  .saju-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .saju-tag { border: 1px solid var(--saju-line); border-radius: 999px; padding: 3px 10px; font-size: 12px; background: var(--saju-surface); }

  .saju-daeun { display: flex; gap: 6px; overflow-x: auto; }
  .saju-daeun-item { min-width: 72px; text-align: center; border: 1px solid var(--saju-line); border-radius: var(--saju-radius); padding: 8px; background: var(--saju-surface); font-size: 12px; }
  .saju-daeun-item.is-current { border-color: var(--saju-accent); box-shadow: inset 0 0 0 1px var(--saju-accent); }

  .saju-card { background: var(--saju-surface); border: 1px solid var(--saju-line); border-radius: var(--saju-radius); padding: var(--saju-gap); margin: var(--saju-gap) 0; }
  .saju-card-title { margin: 0 0 8px; font-size: 15px; }
  .saju-card-footnote { margin-top: 10px; font-size: 11px; color: var(--saju-ink-soft); }
</style>

<!-- [1] 사주판 4기둥 그리드: 년/월/일/시 순. 천간·지지에 오행 클래스(saju-el-*) 부여 -->
<section class="saju-pillars">
  <div class="saju-pillar">
    <span class="saju-pillar-label"><!-- slot: 년주/월주/일주/시주 --></span>
    <span class="saju-stem"><!-- slot: 천간 한글(한자), class에 saju-el-* 추가 --></span>
    <span class="saju-branch"><!-- slot: 지지 한글(한자), class에 saju-el-* 추가 --></span>
  </div>
  <!-- 기둥 4개 반복 -->
</section>

<!-- [2] 오행 분포 바: wuxingCount 비례. 행 색은 saju-el-* -->
<div class="saju-wuxing">
  <div class="saju-wuxing-row saju-el-wood">
    <span><!-- slot: 오행 이름 --></span>
    <div class="saju-wuxing-bar" style="width: 0%"><!-- slot: width를 (개수/8*100)%로 --></div>
    <span><!-- slot: 개수 --></span>
  </div>
  <!-- 오행 5행 반복 -->
</div>

<!-- [3] 점수 게이지: 0-100 점수(운세·궁합) -->
<div class="saju-gauge">
  <span><!-- slot: 항목 이름 --></span>
  <div class="saju-gauge-track"><div class="saju-gauge-fill" style="width: 0%"><!-- slot: width를 점수%로 --></div></div>
</div>

<!-- [4] 십성 태그 목록 -->
<div class="saju-tags">
  <span class="saju-tag"><!-- slot: 십성 이름 × 개수, 필요한 만큼 반복 --></span>
</div>

<!-- [5] 대운 타임라인: 10년 구간, 현재 구간에 is-current 클래스 -->
<div class="saju-daeun">
  <div class="saju-daeun-item">
    <div><!-- slot: 나이 구간 --></div>
    <div><!-- slot: 간지 --></div>
  </div>
  <!-- 구간 반복 -->
</div>

<!-- [6] 섹션 카드: 해석 본문 + 근거 각주 -->
<article class="saju-card">
  <h3 class="saju-card-title"><!-- slot: 제목 --></h3>
  <p><!-- slot: 본문 --></p>
  <p class="saju-card-footnote"><!-- slot: 근거 필드명 (예: wuxingCount, dayMasterStrength) --></p>
</article>` as const;

export const DESIGN_KIT_GUIDE = `## 사용 지침

### 필드 매핑
| 도구 | 결과 필드 | 컴포넌트 |
|------|-----------|----------|
| analyze_saju | year/month/day/hour (stem·branch·stemElement·branchElement) | 사주판 4기둥 그리드 |
| analyze_saju | wuxingCount | 오행 분포 바 |
| analyze_saju | tenGodsDistribution | 십성 태그 목록 |
| analyze_saju | dayMasterStrength, gyeokGuk, yongSin | 섹션 카드 |
| check_compatibility | elementHarmony.harmony | 점수 게이지 |
| check_compatibility | strengths, weaknesses | 섹션 카드 |
| get_daily_fortune | overallLuck, careerLuck, loveLuck 등 점수 필드 | 점수 게이지 |
| get_dae_un | 10년 구간 목록 | 대운 타임라인 |
| get_fortune_by_period | 기간별 점수·해석 | 점수 게이지 + 섹션 카드 |

### 규칙
- 자립형 HTML 하나로 구성한다. 외부 폰트·CDN·스크립트·이미지를 추가하지 않는다.
- 오행 색의 의미(목=초록, 화=빨강, 토=황토, 금=회백, 수=파랑)를 유지한다. 그 외 레이아웃·구성은 자유롭게 확장한다.
- 단계적 공개 중에는 현재 비트와 관련된 부분 컴포넌트만 렌더한다. 전체 화면은 상담 마무리 정리 단계나 사용자가 시각화를 요청할 때 구성한다.
- 모든 수치는 도구가 반환한 필드 값만 사용하고, 섹션 카드 각주에 근거 필드명을 남긴다.` as const;

export function buildDesignKit(): string {
  return [
    '# 사주 시각화 디자인 킷',
    '기본 디자인 구조다. 아래 토큰과 컴포넌트를 바탕으로 상황에 맞게 확장해 자립형 HTML 아티팩트를 구성한다.',
    '## CSS 토큰\n```css\n' + DESIGN_KIT_CSS_TOKENS + '\n```',
    '## 컴포넌트\n```html\n' + DESIGN_KIT_COMPONENTS + '\n```',
    DESIGN_KIT_GUIDE,
  ].join('\n\n');
}

export const DESIGN_KIT_INSTRUCTIONS = [
  '## 시각화 디자인 킷',
  `- 사용자가 시각화를 요청하거나 단계적 공개가 끝난 마무리 정리 단계에서는 ${DESIGN_KIT_TOOL_NAME} 도구로 디자인 킷을 받아 자립형 HTML 아티팩트를 구성한다.`,
  '- 단계적 공개 중에는 현재 비트와 관련된 부분 컴포넌트만 렌더한다.',
  '- 킷의 오행 색 의미를 유지하고 외부 리소스를 추가하지 않는다.',
].join('\n');
```

- [ ] **Step 4: Run the focused tests and confirm Green**

Run:

```powershell
rtk npx jest tests/design-kit.test.ts --runInBand
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Run lint and build**

Run:

```powershell
rtk npm run lint
rtk npm run build
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit only the design kit paths**

Run:

```powershell
rtk git add -- src/core/design-kit.ts tests/design-kit.test.ts
rtk git commit --only -m "feat: add saju visual design kit module" -- src/core/design-kit.ts tests/design-kit.test.ts
```

Expected: one commit containing only the two named files.

---

### Task 2: Tool Wiring and Dramaturgy Boundary

**Files:**
- Create: `src/tools/get_design_template.ts`
- Modify: `src/tools/index.ts` (add one export)
- Modify: `src/core/tool-handler.ts` (add import + switch case)
- Modify: `src/core/tool-definitions.ts` (add one factory)
- Modify: `src/core/dramaturgy-prompt.ts` (extend `DRAMATURGY_EXCLUDED_TOOLS`)
- Create: `tests/server-design-kit.test.ts`

**Interfaces:**
- Consumes: `buildDesignKit()`, `DESIGN_KIT_TOOL_NAME`, `DESIGN_KIT_CSS_TOKENS` from Task 1; `createMCPServer()` from `src/core/server.ts`.
- Produces: `handleGetDesignTemplate(): string`; `get_design_template` registered in tool discovery and call routing; `DRAMATURGY_EXCLUDED_TOOLS` = `['convert_calendar', 'manage_settings', 'get_design_template']`.

- [ ] **Step 1: Write the failing integration tests**

Create `tests/server-design-kit.test.ts`:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { DESIGN_KIT_CSS_TOKENS, DESIGN_KIT_TOOL_NAME } from '../src/core/design-kit.js';
import { createMCPServer } from '../src/core/server.js';

describe('디자인 킷 도구 배선', () => {
  let client: Client;
  let server: ReturnType<typeof createMCPServer>;

  beforeEach(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    server = createMCPServer();
    client = new Client(
      { name: 'design-kit-test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  test('tools/list에 get_design_template이 노출된다', async () => {
    const result = await client.listTools();
    const names = result.tools.map((tool) => tool.name);

    expect(names).toContain(DESIGN_KIT_TOOL_NAME);
  });

  test('tools/call이 킷 문서를 반환한다', async () => {
    const result = (await client.callTool({
      name: DESIGN_KIT_TOOL_NAME,
      arguments: {},
    })) as CallToolResult;
    const content = result.content[0];

    if (!content || content.type !== 'text') {
      throw new Error('디자인 킷 결과가 텍스트가 아닙니다.');
    }

    expect(content.text).toContain(DESIGN_KIT_CSS_TOKENS);
    expect(content.text).toContain('saju-pillars');
  });

  test('도구 설명이 드라마투르기 프롬프트를 참조하지 않는다', async () => {
    const result = await client.listTools();
    const kitTool = result.tools.find((tool) => tool.name === DESIGN_KIT_TOOL_NAME);

    expect(kitTool).toBeDefined();
    expect(kitTool?.description).not.toContain('dramatic_saju_consultation');
  });
});
```

- [ ] **Step 2: Run the integration test and confirm the Red state**

Run:

```powershell
rtk npx jest tests/server-design-kit.test.ts --runInBand
```

Expected: FAIL — `tools/list` does not contain `get_design_template`.

- [ ] **Step 3: Create the tool handler**

Create `src/tools/get_design_template.ts`:

```typescript
/**
 * 시각화 디자인 킷 반환 도구
 */

import { buildDesignKit } from '../core/design-kit.js';

export function handleGetDesignTemplate(): string {
  return buildDesignKit();
}
```

- [ ] **Step 4: Export the handler**

In `src/tools/index.ts`, append after the `handleGetFortuneByPeriod` export:

```typescript
export { handleGetDesignTemplate } from './get_design_template.js';
```

- [ ] **Step 5: Route the tool call**

In `src/core/tool-handler.ts`, add `handleGetDesignTemplate` to the import list from `'../tools/index.js'`, then add this case above `default:`:

```typescript
    case 'get_design_template':
      return handleGetDesignTemplate();
```

- [ ] **Step 6: Register the tool schema**

In `src/core/tool-definitions.ts`, add this factory after the `manage_settings` entry (before the closing `};` of `toolSchemaFactories`). Do NOT append `DRAMATURGY_TOOL_DESCRIPTION_SUFFIX`:

```typescript
  get_design_template: () => ({
    name: 'get_design_template',
    description:
      '사주 시각화 디자인 킷(CSS 토큰·컴포넌트·사용 지침) 반환. 결과를 아티팩트로 구성할 때 기준으로 사용. 인자 없음.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  }),
```

- [ ] **Step 7: Extend the dramaturgy exclusion boundary**

In `src/core/dramaturgy-prompt.ts`, replace:

```typescript
export const DRAMATURGY_EXCLUDED_TOOLS = ['convert_calendar', 'manage_settings'] as const;
```

with:

```typescript
export const DRAMATURGY_EXCLUDED_TOOLS = [
  'convert_calendar',
  'manage_settings',
  'get_design_template',
] as const;
```

- [ ] **Step 8: Run the wiring, kit, and boundary tests**

Run:

```powershell
rtk npx jest tests/server-design-kit.test.ts tests/design-kit.test.ts tests/tool-definitions-dramaturgy.test.ts tests/dramaturgy-prompt.test.ts --runInBand
```

Expected: PASS. `tests/tool-definitions-dramaturgy.test.ts` now runs 8 tests (5 supported + 3 excluded via `test.each`); total 23 tests across the four files (3 + 6 + 8 + 6).

- [ ] **Step 9: Run lint and build**

Run:

```powershell
rtk npm run lint
rtk npm run build
```

Expected: both commands exit 0.

- [ ] **Step 10: Commit only the wiring paths**

Run:

```powershell
rtk git add -- src/tools/get_design_template.ts src/tools/index.ts src/core/tool-handler.ts src/core/tool-definitions.ts src/core/dramaturgy-prompt.ts tests/server-design-kit.test.ts
rtk git commit --only -m "feat: expose design kit through get_design_template tool" -- src/tools/get_design_template.ts src/tools/index.ts src/core/tool-handler.ts src/core/tool-definitions.ts src/core/dramaturgy-prompt.ts tests/server-design-kit.test.ts
```

Expected: one commit containing only the six named files.

---

### Task 3: Server Instructions Composition

**Files:**
- Modify: `src/core/server.ts` (one import + instructions line)
- Modify: `tests/server-prompts.test.ts` (one import + first test)

**Interfaces:**
- Consumes: `DESIGN_KIT_INSTRUCTIONS` from Task 1, existing `DRAMATURGY_INSTRUCTIONS`.
- Produces: initialization instructions containing both blocks, separated by a blank line.

- [ ] **Step 1: Update the instructions test to the composed form**

In `tests/server-prompts.test.ts`, add to the imports:

```typescript
import { DESIGN_KIT_INSTRUCTIONS } from '../src/core/design-kit.js';
```

Then replace the first test:

```typescript
  test('초기화 결과에 자동 지침과 prompts capability가 있다', () => {
    expect(client.getInstructions()).toBe(DRAMATURGY_INSTRUCTIONS);
    expect(client.getServerCapabilities()).toMatchObject({
      tools: {},
      prompts: {},
    });
  });
```

with:

```typescript
  test('초기화 결과에 드라마투르기·디자인 킷 지침과 prompts capability가 있다', () => {
    const instructions = client.getInstructions();

    expect(instructions).toContain(DRAMATURGY_INSTRUCTIONS);
    expect(instructions).toContain(DESIGN_KIT_INSTRUCTIONS);
    expect(client.getServerCapabilities()).toMatchObject({
      tools: {},
      prompts: {},
    });
  });
```

- [ ] **Step 2: Run the test and confirm the Red state**

Run:

```powershell
rtk npx jest tests/server-prompts.test.ts --runInBand
```

Expected: FAIL — instructions do not yet contain `DESIGN_KIT_INSTRUCTIONS`.

- [ ] **Step 3: Compose the instructions in the server**

In `src/core/server.ts`, add below the dramaturgy import block:

```typescript
import { DESIGN_KIT_INSTRUCTIONS } from './design-kit.js';
```

Then replace:

```typescript
      instructions: DRAMATURGY_INSTRUCTIONS,
```

with:

```typescript
      instructions: `${DRAMATURGY_INSTRUCTIONS}\n\n${DESIGN_KIT_INSTRUCTIONS}`,
```

- [ ] **Step 4: Run the prompt and design-kit suites**

Run:

```powershell
rtk npx jest tests/server-prompts.test.ts tests/server-design-kit.test.ts --runInBand
```

Expected: PASS, 8 tests.

- [ ] **Step 5: Run lint and build**

Run:

```powershell
rtk npm run lint
rtk npm run build
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit only the composition paths**

Run:

```powershell
rtk git add -- src/core/server.ts tests/server-prompts.test.ts
rtk git commit --only -m "feat: inject design kit guidance into server instructions" -- src/core/server.ts tests/server-prompts.test.ts
```

Expected: one commit containing only the two named files.

---

### Task 4: Documentation and Full Verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: the tool behavior delivered by Tasks 1-3.
- Produces: user-facing documentation for the 8th tool.

- [ ] **Step 1: Update the Korean tool count and layout comment**

In `README.md`:
- Replace heading `## 🛠️ MCP 도구 (총 7개 - 통합 최적화)` with `## 🛠️ MCP 도구 (총 8개 - 통합 최적화)`
- In the project-structure tree, replace the comment `# 7개 도구 정의` with `# 8개 도구 정의`
- Do NOT change the historical `v1.2.0 신규 기능` bullet (`7개 통합 도구: 15개 개별 도구를 7개로 최적화...`) — it describes a past release.

- [ ] **Step 2: Add the design kit section (Korean)**

Insert after the `## 🎭 드라마투르기 상담` section (its last line is `표현 품질은 MCP 클라이언트의 prompt 및 server instructions 지원 여부에 따라 달라질 수 있습니다.`), before `## 🚀 시작하기`:

```markdown
## 🎨 시각화 디자인 킷

`get_design_template` 도구는 사주 결과를 시각화할 때 쓰는 기본 디자인 구조(CSS 토큰, 컴포넌트, 사용 지침)를 반환합니다.

- 클라이언트 LLM이 킷을 받아 결과 데이터를 채워 자립형 HTML 아티팩트를 구성합니다.
- 오행 5색 팔레트와 사주판·오행 바·점수 게이지·십성 태그·대운 타임라인·섹션 카드 컴포넌트를 제공합니다.
- 단계적 공개 중에는 부분 컴포넌트만, 전체 화면은 상담 마무리나 시각화 요청 시 구성합니다.
- 외부 폰트·CDN·스크립트 의존이 없는 완전 자립형입니다.
```

- [ ] **Step 3: Add the tool entry to the Korean tool list**

Insert after the `### 7. manage_settings` section's code block ends (before the next `##` heading):

```markdown
### 8. get_design_template
사주 시각화 디자인 킷(CSS 토큰·컴포넌트·사용 지침)을 반환합니다. 인자가 없습니다.
```

- [ ] **Step 4: Add the English feature bullet**

In the `### ✨ Features` list, add directly after the `**Dramaturgic Consultation**` bullet:

```markdown
- **Visual Design Kit**: Base design tokens, components, and usage guide via the `get_design_template` tool for client-rendered HTML artifacts
```

- [ ] **Step 5: Check documentation content and whitespace**

Run:

```powershell
rtk grep "시각화 디자인 킷" README.md
rtk grep "총 8개" README.md
rtk git diff --check
```

Expected: both greps match; `git diff --check` reports no whitespace errors.

- [ ] **Step 6: Run the complete verification suite**

Run:

```powershell
rtk npx jest --runInBand --forceExit
rtk npm run lint
rtk npm run build
```

Expected: all 8 suites pass (152 tests: 142 pre-existing + 6 design-kit + 3 wiring + 1 new excluded-tool boundary case), ESLint 0 errors, build exit 0. The `--forceExit` flag is required (pre-existing open-handles hang).

- [ ] **Step 7: Confirm protected files were not modified**

Run:

```powershell
rtk git diff --name-only HEAD~3
rtk git diff --name-only HEAD~3 -- "src/data/solar_terms_*.ts" "src/data/lunar_table_*.ts" src/lib/saju.ts
```

Expected: the first command lists only files from this plan's File Map; the second prints no paths.

- [ ] **Step 8: Commit only the documentation path**

Run:

```powershell
rtk git add -- README.md
rtk git commit --only -m "docs: document the visual design kit tool" -- README.md
```

Expected: one commit containing only `README.md`.
