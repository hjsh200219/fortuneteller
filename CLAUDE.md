# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code (claude.ai/code)에게 제공되는 가이드입니다.

**⚠️ 중요: 이 프로젝트에서는 모든 응답을 한국어로 작성해야 합니다.**

## 프로젝트 개요

한국 전통 사주팔자를 계산하고 운세를 분석하는 MCP(Model Context Protocol) 서버입니다.

**기술 스택**: TypeScript (ES2022), Node.js 18+, MCP SDK, 엄격한 타입 체크

## 개발 명령어

```bash
# TypeScript → JavaScript 빌드
npm run build

# 핫 리로드 개발 모드
npm run watch

# 빌드된 서버 실행
npm start

# 테스트 실행
npm test

# TypeScript 린트
npm run lint

# 코드 포맷팅
npm run format
```

## MCP 서버 아키텍처

### 진입점
[src/index.ts](src/index.ts) - `@modelcontextprotocol/sdk`로 7개 통합 도구가 등록된 MCP 서버

### 도구 등록 패턴
1. `src/tools/*.ts`에서 핸들러 import
2. `core/tool-definitions.ts`에 도구 스키마 등록
3. `CallToolRequestSchema` switch문에서 도구 호출 라우팅
4. `{ content: [{ type: 'text', text: result }] }` 형태로 반환

### 7개 통합 MCP 도구

1. **analyze_saju** - 사주 분석 통합 (basic/fortune/yongsin/school_compare/yongsin_method)
2. **check_compatibility** - 두 사람의 궁합 분석
3. **convert_calendar** - 양력 ↔ 음력 변환 (로컬 테이블 1900-2200)
4. **get_daily_fortune** - 특정 날짜의 일일 운세
5. **get_dae_un** - 10년 단위 대운(大運) 조회
6. **get_fortune_by_period** - 시간대별 운세 (year/month/hour/multi-year)
7. **manage_settings** - 해석 설정 관리 (get/set)

### 사주팔자 조회 전 사용자 확인 (대화 에이전트·클라이언트)

**사주 계산·운세 도구(`analyze_saju`, `get_dae_un`, `get_daily_fortune`, `get_fortune_by_period`, `check_compatibility` 등)를 호출하기 전에** 사용자에게 아래를 **반드시** 물어본다. 한 번에 못 받으면 순서대로 나눠서 받는다.

| 항목 | 설명 |
|------|------|
| 이름(한글) | 호칭·기록용 |
| 한자 이름 | **선택**. 알면 받고, 모르면 생략 가능하다고 안내 |
| 양력/음력 | `calendar`: solar / lunar |
| 생년월일·시각 | `birthDate` YYYY-MM-DD, `birthTime` HH:mm |
| 음력 윤달 | 음력일 때만 `isLeapMonth` |
| 성별 | `gender`: male / female |
| 태어난 곳 | 시군구 한글명(예: 서울, 부산, 제주). `birthCity` — [longitude_table.ts](src/data/longitude_table.ts) 키에 맞출 것. 생략 시 서울 경도로 보정 |

이름·한자는 **계산 엔진 입력에는 없고** 대화 맥락용이다. 도구 호출에는 생년월일시·달력·성별·출생지 등 **스키마에 정의된 필드만** 넘긴다.

### 명리 해석 프롬프트 (도구 결과 기반 서술)

`analyze_saju`(analysisType: `basic` 등)로 **사주 데이터(JSON)**를 받은 뒤, 사용자에게 풀이·상담 문장을 쓸 때 아래를 **명리학 전문가 관점**에서 상세히 다룬다. **도구가 반환한 필드만** 근거로 삼고, 수치·십성·격국·용신 등은 **없는 내용을 지어내지 않는다.**

1. **일간·일주 중심** — 일간과 일주를 중심으로 본연의 기질과 중심 성격을 설명한다.
2. **월지 기운·십성 흐름** — 월지에 배정된 기운과 전체적인 십성의 흐름을 바탕으로, 이 사주가 사회에서 어떤 환경에 놓이기 쉬우며 어떤 방식으로 역량을 발휘하는지 분석한다.
3. **십성 구성의 장단점·인생 흐름** — 주어진 십성 구성에서 나타나는 특징적인 장단점과 그에 따른 인생 흐름의 특성을 분석한다.
4. **오행 분포·실생활 보완** — `wuxingCount` 등 **제공된 오행 분포 수치**를 일관된 근거로 삼아, 부족하거나 과한 기운을 조절할 수 있는 실생활 보완책(색상, 습관 등)을 제안한다.
5. **주요 영역 종합** — 재물운, 연애·결혼운, 직업 적성, 건강운 등을 **주어진 데이터**에 근거하여 종합 해석한다.
6. **균형·삶의 태도** — 전체적인 사주 구성의 균형을 맞추기 위해 이 사주가 지향해야 할 삶의 태도와 핵심적인 조언을 제시한다.

#### 기존 엔진·자동 해석과의 관계 (충돌·주의)

아래를 알고 해석하면, 사용자 프롬프트와 코드 동작이 엇갈리지 않는다.

| 이슈 | 설명 |
|------|------|
| 오행 수치의 의미 | `wuxingCount`는 사주 **사기둥의 천간·지지 오행 개수** 합이다. 지장간 가중·통근·계절 등 **다른 학파의 무게 체계**와는 다를 수 있다. 항목 4의 「제공 수치」는 **이 엔진이 준 숫자를 근거로 삼는다**는 뜻으로 쓰고, 「우주의 절대 진리」가 아님을 필요 시 한 줄로 짚는다. |
| `fortune` 도구 문장 | `analyze_saju` + `fortune`은 [fortune.ts](src/lib/fortune.ts)가 **템플릿 문장**을 생성한다. 위 6항은 **서술 구조·전문가 톤**을 위한 것이므로, 엔진 문장과 **문장이 겹치면** 6항목 순으로 **재구성·요약**하거나, 엔진 결과를 **인용한 뒤** 심화 해석을 덧붙인다. |
| 용신·격국 | [yong_sin.ts](src/lib/yong_sin.ts)·[gyeok_guk.ts](src/lib/gyeok_guk.ts) 등이 **자동 결정**한다. 항목 6은 엔진의 `yongSin`·`gyeokGuk`과 **모순되지 않게** 조언을 쓴다. 유파별 상이한 해석이 필요하면 `school_compare` 결과를 참고한다. |
| 십성 분포 | `tenGods`·`tenGodsDistribution`은 엔진 규칙에 따른다. 항목 2·3은 **다른 명리 이론서의 십성 정의**와 표현이 다를 수 있으므로, **반환 JSON의 십성 필드**를 우선한다. |

## 핵심 아키텍처 패턴

### 출생 시각 보정 (진태양시)

**중요**: [src/lib/saju.ts](src/lib/saju.ts)의 사주 계산은 [src/utils/date.ts](src/utils/date.ts)의 `getAdjustedBirthInstantForSaju`로 출생 순간을 만든다.

- 한국 표준시 벽시계 시각에 **역사적 썸머타임**(`Asia/Seoul`) 반영
- 출생지 [경도 보정](src/data/longitude_table.ts)(동경 135° 기준, `birthCity`로 시군구 해석)
- `birthCity` 미입력·미등록 시 **서울** 경도로 보정

4기둥(년·월·일·시) 계산은 이 보정된 순간을 사용한다.

### 사주 계산 파이프라인
[src/lib/saju.ts](src/lib/saju.ts)가 전체 계산을 조율합니다:

```
1. 달력 변환 (음력 → 양력, 필요시)
2. 출생 벽시계 + 썸머타임 + 경도 보정(진태양시)
3. 4기둥 계산 (년 → 월 → 일 → 시)
4. 절기별 지장간 세력 계산
5. 오행(五行) 개수 세기
6. 십성(十星) 분석
7. 신살(神殺) 탐지
8. 일간 강약 평가
9. 격국(格局) 결정
10. 용신(用神) 선정
```

각 단계는 이전 결과에 의존합니다. **단계를 건너뛰거나 실행 순서를 변경하면 안 됩니다**.

### 지장간 세력 시스템
[src/data/earthly_branches.ts](src/data/earthly_branches.ts) - `calculateJiJangGanStrength()` 함수가 절기 관계에 따라 장간 세력을 계산합니다:

- **당령(當令)** - 완벽한 일치: 정기 90%, 중기 7%, 여기 3%
- **퇴기(退氣)** - 이전 달: 정기 50%, 중기 30%, 여기 20%
- **진기(進氣)** - 다음 달: 정기 60%, 중기 30%, 여기 10%
- **먼 시기**: 정기 40%, 중기 10%, 여기 5%

이 시스템은 정확한 일간 강약 평가와 용신 선정에 필수적입니다.

## 데이터 레이어 아키텍처

### 정적 데이터 모듈 (`src/data/`)
- [heavenly_stems.ts](src/data/heavenly_stems.ts) - 10개 천간(天干)과 오행, 음양
- [earthly_branches.ts](src/data/earthly_branches.ts) - 12개 지지(地支)와 지장간 매핑
- [wuxing.ts](src/data/wuxing.ts) - 오행(五行) 관계(상생/상극/설기)
- [solar_terms.ts](src/data/solar_terms.ts) - 24절기(節氣) 통합 (1900-2200, 4개 테이블 자동 분기)
- [lunar_table.ts](src/data/lunar_table.ts) - 음력 테이블 통합 (1900-2200, 4개 테이블 자동 분기)
- [longitude_table.ts](src/data/longitude_table.ts) - 전국 162개 시군구 경도 데이터
- [modern_careers.ts](src/data/modern_careers.ts) - 500+ 현대 직업 데이터베이스 (십성/오행 매핑, 원격근무/글로벌 기회 포함)

**연도별 데이터 테이블**:
- [lunar_table_1900_2019.ts](src/data/lunar_table_1900_2019.ts) - 음력 데이터 (1900-2019)
- [lunar_table_extended.ts](src/data/lunar_table_extended.ts) - 음력 데이터 (2020-2030)
- [lunar_table_2031_2100.ts](src/data/lunar_table_2031_2100.ts) - 음력 데이터 (2031-2100)
- [lunar_table_2101_2200.ts](src/data/lunar_table_2101_2200.ts) - 음력 데이터 (2101-2200)
- [solar_terms_1900_2019.ts](src/data/solar_terms_1900_2019.ts) - 절기 데이터 (1900-2019)
- [solar_terms_complete.ts](src/data/solar_terms_complete.ts) - 절기 데이터 (2020-2030)
- [solar_terms_2031_2100.ts](src/data/solar_terms_2031_2100.ts) - 절기 데이터 (2031-2100)
- [solar_terms_2101_2200.ts](src/data/solar_terms_2101_2200.ts) - 절기 데이터 (2101-2200)

### 분석 라이브러리 (`src/lib/`)

#### 핵심 계산 엔진
- [saju.ts](src/lib/saju.ts) - **메인 조율자** - 사주팔자 계산
- [calendar.ts](src/lib/calendar.ts) - 양력 ↔ 음력 변환 및 윤달 처리
- [ten_gods.ts](src/lib/ten_gods.ts) - 간 관계 기반 십성(十星) 계산
- [sin_sal.ts](src/lib/sin_sal.ts) - 15개 신살(神殺) 탐지 및 길흉 분류
- [day_master_strength.ts](src/lib/day_master_strength.ts) - 일간(日干) 강약 평가
- [gyeok_guk.ts](src/lib/gyeok_guk.ts) - 격국(格局) 결정
- [yong_sin.ts](src/lib/yong_sin.ts) - 균형을 위한 용신(用神) 선정
- [dae_un.ts](src/lib/dae_un.ts) - 성별 기반 10년 대운 계산
- [fortune.ts](src/lib/fortune.ts) - 운세 해석 및 조언
- [compatibility.ts](src/lib/compatibility.ts) - 궁합 점수 계산

#### 용신(用神) 알고리즘 시스템 (`src/lib/yongsin/`)
- [strength_algorithm.ts](src/lib/yongsin/strength_algorithm.ts) - 강약용신 (일간 강약 기준)
- [seasonal_algorithm.ts](src/lib/yongsin/seasonal_algorithm.ts) - 조후용신 (계절 한난조습 조절)
- [mediation_algorithm.ts](src/lib/yongsin/mediation_algorithm.ts) - 통관용신 (충돌 오행 중재)
- [disease_algorithm.ts](src/lib/yongsin/disease_algorithm.ts) - 병약용신 (사주 불균형 진단 및 치료)
- [selector.ts](src/lib/yongsin/selector.ts) - 통합 선택기 (자동/수동 용신 선택)

#### 해석 유파 시스템 (`src/lib/interpreters/`)
- [ziping_interpreter.ts](src/lib/interpreters/ziping_interpreter.ts) - 자평명리 해석기 (정통 격국 체계)
- [modern_interpreter.ts](src/lib/interpreters/modern_interpreter.ts) - 현대명리 해석기 (실용적 현대 직업 중심)
- [index.ts](src/lib/interpreters/index.ts) - 적천수, 궁통보감, 신살중심 해석기 포함

#### 기타 분석 도구
- [career_matcher.ts](src/lib/career_matcher.ts) - 직업 매칭 엔진 (십성 35%, 오행 25%, 용신 20%, 현대성 20%)
- [school_comparator.ts](src/lib/school_comparator.ts) - 유파 비교 분석 엔진
- [interpretation_settings.ts](src/lib/interpretation_settings.ts) - 해석 설정 관리 (싱글톤)

## 타입 시스템

[src/types/index.ts](src/types/index.ts)에 모든 핵심 타입이 정의되어 있습니다:

### 주요 타입
- `SajuData` - 모든 분석 결과를 포함한 완전한 사주팔자 데이터
- `Pillar` - 단일 기둥 (간 + 지 + 오행 + 음양)
- `HeavenlyStem` - 10개 천간 리터럴 타입
- `EarthlyBranch` - 12개 지지 리터럴 타입
- `WuXing` - 5개 오행 리터럴 타입
- `TenGod` - 10개 십성 리터럴 타입
- `SinSal` - 15개 신살 리터럴 타입 (원진살, 귀문관살 포함)

### SajuData의 중요 필드
- `jiJangGan` - 4기둥 모두의 지장간 세력 (정기/중기/여기 값 포함)
- `branchRelations` - 삼합/삼형/육해 관계
- `dayMasterStrength` - 일간 강약 평가 (매우 약함 → 매우 강함)
- `gyeokGuk` - 격국 분류
- `yongSin` - 희신/기신/수신을 포함한 용신 정보

## MCP 서버 테스트

### Claude Desktop 연동
`~/Library/Application Support/Claude/claude_desktop_config.json`에 추가:

```json
{
  "mcpServers": {
    "saju": {
      "command": "npx",
      "args": ["-y", "tsx", "/Users/hoshin/workspace/fortuneteller/src/index.ts"]
    }
  }
}
```

### 빌드 후 테스트
`npm run build` 실행 후:

```json
{
  "mcpServers": {
    "saju": {
      "command": "node",
      "args": ["/Users/hoshin/workspace/fortuneteller/dist/index.js"]
    }
  }
}
```

### 지연 로딩 모드 활성화
도구 스키마를 Tool Discovery 요청 시에만 로드하려면 환경 변수를 설정:

```json
{
  "mcpServers": {
    "saju": {
      "command": "node",
      "args": ["/Users/hoshin/workspace/fortuneteller/dist/index.js"],
      "env": {
        "SAJU_LAZY_LOAD_SCHEMAS": "true"
      }
    }
  }
}
```

**지연 로딩 모드**:
- `false` (기본값): 서버 시작 시 모든 도구 스키마 로드
- `true`: Tool Discovery 요청 시에만 스키마 생성 (메모리 효율적)

## 일반적인 구현 패턴

### 새 MCP 도구 추가하기
1. `src/tools/new_tool.ts`에 타입 인터페이스와 함께 핸들러 생성
2. [src/core/tool-definitions.ts](src/core/tool-definitions.ts)의 `TOOL_DEFINITIONS` 배열에 도구 스키마 추가
3. [src/core/tool-handler.ts](src/core/tool-handler.ts)의 `handleToolCall()` switch문에 case 추가
4. [src/tools/index.ts](src/tools/index.ts)에서 핸들러 export
5. 재빌드 및 테스트

**예시**:
```typescript
// 1. src/tools/new_tool.ts
export interface NewToolArgs {
  param1: string;
  param2?: number;
}

export function handleNewTool(args: NewToolArgs): string {
  const { param1, param2 = 10 } = args;
  // 로직 구현
  return JSON.stringify({ result: '...' }, null, 2);
}

// 2. src/core/tool-definitions.ts
export const TOOL_DEFINITIONS: Tool[] = [
  // ... 기존 도구들
  {
    name: 'new_tool',
    description: '새로운 도구 설명',
    inputSchema: {
      type: 'object',
      properties: {
        param1: { type: 'string', description: '파라미터 1' },
        param2: { type: 'number', default: 10 },
      },
      required: ['param1'],
    },
  },
];

// 3. src/core/tool-handler.ts
import { handleNewTool } from '../tools/index.js';

export async function handleToolCall(name: string, args: unknown): Promise<string> {
  switch (name) {
    // ... 기존 case들
    case 'new_tool':
      return handleNewTool(args as Parameters<typeof handleNewTool>[0]);
    // ...
  }
}

// 4. src/tools/index.ts
export { handleNewTool } from './new_tool.js';
```

### MCP 도구 개발 시 주의사항

#### 스키마-핸들러 일관성 (Schema-Handler Consistency)
**중요**: MCP 도구의 스키마 정의와 핸들러 인터페이스는 반드시 일치해야 합니다.

**올바른 패턴**:
```typescript
// ✅ 스키마에서 개별 필드를 정의한 경우
{
  name: 'example_tool',
  inputSchema: {
    type: 'object',
    properties: {
      birthDate: { type: 'string' },
      birthTime: { type: 'string' },
      calendar: { type: 'string', enum: ['solar', 'lunar'], default: 'solar' },
      isLeapMonth: { type: 'boolean', default: false }
    },
    required: ['birthDate', 'birthTime']
  }
}

// ✅ 핸들러 인터페이스도 개별 필드로 정의
export interface ExampleToolArgs {
  birthDate: string;
  birthTime: string;
  calendar?: CalendarType;  // optional, 스키마의 default 값 활용
  isLeapMonth?: boolean;    // optional, 스키마의 default 값 활용
}

// ✅ 핸들러에서 기본값 적용
export function handleExampleTool(args: ExampleToolArgs): string {
  const {
    birthDate,
    birthTime,
    calendar = 'solar',      // 기본값 명시
    isLeapMonth = false,     // 기본값 명시
  } = args;

  // 내부에서 필요시 calculateSaju() 호출
  const sajuData = calculateSaju(birthDate, birthTime, calendar, isLeapMonth, gender);
  // ...
}
```

**잘못된 패턴** (❌):
```typescript
// ❌ 스키마는 개별 필드인데 핸들러는 객체를 받는 경우
export interface WrongArgs {
  sajuData: SajuData;  // 스키마와 불일치!
}
```

#### 기본값(Default) 처리 규칙
스키마에 `default` 값이 있는 필드는:
1. 핸들러 인터페이스에서 **optional**(`?`)로 선언
2. 핸들러 함수에서 **destructuring 시 기본값 명시**

```typescript
// 스키마: default: 'solar'
calendar?: CalendarType;  // optional

// 핸들러: 기본값 적용
const { calendar = 'solar' } = args;
```

#### 날짜/시간 문자열 파싱 시 검증 필수
문자열 형식의 날짜/시간을 파싱할 때는 반드시 검증 로직을 추가해야 합니다:

**YYYY-MM 형식 파싱**:
```typescript
if (targetMonth) {
  const parts = targetMonth.split('-');
  if (parts.length !== 2) {
    throw new Error(`잘못된 월 형식입니다: ${targetMonth}. YYYY-MM 형식을 사용하세요.`);
  }

  const year = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    throw new Error(`유효하지 않은 월입니다: ${targetMonth}`);
  }
}
```

**YYYY-MM-DD HH:mm 형식 파싱**:
```typescript
if (targetDateTime) {
  const parts = targetDateTime.split(' ');
  if (parts.length !== 2) {
    throw new Error(
      `잘못된 일시 형식입니다: ${targetDateTime}. YYYY-MM-DD HH:mm 형식을 사용하세요.`
    );
  }

  const [datePart, timePart] = parts;
  const hour = parseInt(timePart!.split(':')[0]!, 10);

  if (isNaN(hour) || hour < 0 || hour > 23) {
    throw new Error(`유효하지 않은 시간입니다: ${hour} (0-23 사이여야 합니다)`);
  }
}
```

#### 에러 메시지 작성 규칙
- 모든 에러 메시지는 **한국어**로 작성
- 구체적인 오류 내용과 올바른 형식을 함께 안내
- 예: `throw new Error(\`잘못된 월 형식입니다: ${targetMonth}. YYYY-MM 형식을 사용하세요.\`);`

### 오행 관계 다루기
[src/data/wuxing.ts](src/data/wuxing.ts) 유틸리티 사용:
- `getGeneratingElement()` - 이 오행을 생(生)하는 오행
- `getGeneratedElement()` - 이 오행이 생(生)하는 오행
- `getControllingElement()` - 이 오행을 극(克)하는 오행
- `getControlledElement()` - 이 오행이 극(克)하는 오행
- `getWeakeningElement()` - 이 오행을 설(洩)하는 오행

### 달력 변환
[src/lib/calendar.ts](src/lib/calendar.ts)가 윤달을 포함한 음양력 변환을 처리합니다 (로컬 테이블 기반, 1900-2200):

```typescript
// 동기 함수로 변경됨 (KASI API 제거)
const result = convertCalendar('2025-01-01', 'solar', 'lunar');
// 반환값: {
//   originalDate: string,
//   originalCalendar: CalendarType,
//   convertedDate: string,
//   convertedCalendar: CalendarType,
//   isLeapMonth?: boolean,
//   solarTerm: SolarTerm
// }
```

**로컬 테이블 직접 사용**:
```typescript
import { solarToLunarLocal, lunarToSolarLocal } from '../data/lunar_table.js';

// 양력 → 음력
const lunar = solarToLunarLocal(2025, 1, 1);
// 반환값: { year, month, day, isLeapMonth } | null

// 음력 → 양력
const solar = lunarToSolarLocal(2025, 1, 1, false);
// 반환값: { year, month, day } | null
```

## 사주 용어

핵심 용어 (한글 → 한자 → 영문):
- **사주팔자** (四柱八字) - Four Pillars of Destiny
- **천간** (天干) - Heavenly Stems (10개)
- **지지** (地支) - Earthly Branches (12개)
- **오행** (五行) - Five Elements
- **십성** (十星) - Ten Gods (관계 유형)
- **신살** (神殺) - Special stars (길흉 지표)
- **지장간** (支藏干) - Hidden stems within branches
- **일간** (日干) - Day master (가장 중요한 간)
- **용신** (用神) - Beneficial element for balance
- **격국** (格局) - Life pattern classification
- **대운** (大運) - 10-year major fortune cycles
- **진태양시** (眞太陽時) - True solar time

## 빌드 출력

TypeScript는 다음과 함께 `dist/`로 컴파일됩니다:
- 디버깅용 소스맵
- 타입 체크용 선언 파일 (.d.ts)
- .js 확장자를 가진 ES2022 모듈

## 코드 품질 절대 규칙

- **🚫 ESLint Disable 절대 금지**:
  - `eslint-disable`, `eslint-disable-line`, `eslint-disable-next-line` 절대 사용 금지
  - `// @ts-ignore`, `// @ts-nocheck` 등 TypeScript 체크 비활성화 금지
  - **모든 린트 에러는 반드시 코드 수정으로만 해결**
- 코드 수정 후에는 반드시 `npm run lint` 실행하여 에러 확인 및 수정
- 린트 에러가 있는 상태로 작업 완료 금지

## 응답 언어 규칙

**⚠️ 필수**: 이 프로젝트에서 Claude Code는 **모든 응답을 한국어로 작성**해야 합니다.
- 코드 설명, 에러 메시지, 작업 완료 알림 등 모든 텍스트를 한국어로 작성
- 기술 용어는 한국어 표기를 우선하되, 필요시 영문을 괄호 안에 병기
- 예: "사주팔자(Four Pillars)", "오행(五行, Five Elements)"
