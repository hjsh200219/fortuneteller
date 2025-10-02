# PRD: 사주명리 해석 유파 선택 시스템

**문서 버전**: 1.0
**작성일**: 2025-10-02
**상태**: Draft

---

## 📋 목차

1. [문제 정의](#1-문제-정의)
2. [목표 및 범위](#2-목표-및-범위)
3. [해결 방안](#3-해결-방안)
4. [기술 설계](#4-기술-설계)
5. [구현 계획](#5-구현-계획)
6. [성공 지표](#6-성공-지표)

---

## 1. 문제 정의

### 1.1 핵심 문제

사주명리학은 **다양한 해석 유파**가 존재하며, 유파별로 해석 방법과 결과가 상이합니다. 현재 시스템은 단일 해석 방식만 제공하여 사용자의 다양한 요구를 충족하지 못합니다.

### 1.2 구체적 문제점

| 문제 영역 | 현재 상황 | 문제점 |
|----------|----------|--------|
| **용신 선택** | 단일 알고리즘 (강약 기반) | 조후용신, 통관용신, 병약용신 등 다양한 선택법 미지원 |
| **해석 유파** | 고정된 해석 방식 | 자평명리, 적천수, 궁통보감, 현대 명리 등 유파별 차이 반영 불가 |
| **시대 반영** | 전통 직업/환경 중심 | 현대 직업(IT, 금융공학 등), 다국적 환경 등 미반영 |
| **우선순위** | 고정된 가중치 | 사용자별 중요 요소(건강/재물/명예) 우선순위 조정 불가 |
| **대운/세운 해석** | 단일 방식 | 대운 중심 vs 세운 중심 등 해석 철학 차이 미반영 |

### 1.3 영향받는 사용자

- **전문가**: 특정 유파를 학습한 명리학자
- **학습자**: 다양한 유파를 비교 학습하려는 사람
- **일반 사용자**: 여러 관점의 해석을 원하는 사람
- **개발자**: MCP 서버를 통합하는 애플리케이션 개발자

---

## 2. 목표 및 범위

### 2.1 목표

**주요 목표**: 사용자가 원하는 해석 유파와 우선순위를 선택할 수 있는 **유연한 설정 시스템** 구축

**세부 목표**:
1. 5개 이상의 주요 해석 유파 지원
2. 용신 선택 알고리즘 3가지 이상 제공
3. 사용자 맞춤형 우선순위 설정 기능
4. 현대 직업/환경 데이터베이스 확장
5. 유파별 비교 분석 기능

### 2.2 범위

#### In Scope ✅
- 용신 선택 방식 다양화
- 해석 유파별 알고리즘 구현
- 사용자 설정 시스템
- 현대 직업/환경 데이터베이스
- 비교 분석 API

#### Out of Scope ❌
- GUI 인터페이스 (MCP 서버는 API만 제공)
- 유료 프리미엄 유파 (초기 버전)
- 실시간 AI 학습 기반 해석
- 외국어 해석 (한국어만)

### 2.3 성공 기준

- 3개 이상 유파 선택 가능
- 용신 선택 정확도 85% 이상 (전문가 평가)
- API 응답 시간 <500ms (복잡 분석 <2s)
- 사용자 설정 영속성 보장

---

## 3. 해결 방안

### 3.1 해석 유파 체계

#### 3.1.1 지원 유파 목록

| 유파명 | 영문 코드 | 특징 | 중점 요소 |
|--------|----------|------|----------|
| **자평명리** | `ziping` | 전통 정통파, 균형 중시 | 용신, 격국, 조후 |
| **적천수** | `dts` | 천간 중심, 십신 관계 | 천간합, 십신 상호작용 |
| **궁통보감** | `qtbj` | 조후용신 중심 | 계절, 온도, 습도 |
| **현대 명리** | `modern` | 실용적, 통계 기반 | 직업, 건강, 인간관계 |
| **신살 중심** | `shensha` | 신살 해석 중시 | 공망, 도화, 역마 등 |

#### 3.1.2 유파별 해석 차이

```typescript
interface SchoolInterpretation {
  yongSinMethod: 'strength' | 'seasonal' | 'mediation' | 'disease';
  priorityElements: ('health' | 'wealth' | 'career' | 'relationship' | 'fame')[];
  geokGukWeight: number; // 격국 중요도 (0-1)
  daeunWeight: number; // 대운 가중치 (0-1)
  seyunWeight: number; // 세운 가중치 (0-1)
  modernAdaptation: boolean; // 현대 적용 여부
}
```

**예시**:
```typescript
const SCHOOLS: Record<SchoolCode, SchoolInterpretation> = {
  ziping: {
    yongSinMethod: 'strength',
    priorityElements: ['career', 'wealth', 'health', 'relationship', 'fame'],
    geokGukWeight: 0.8,
    daeunWeight: 0.6,
    seyunWeight: 0.4,
    modernAdaptation: false,
  },
  modern: {
    yongSinMethod: 'strength',
    priorityElements: ['career', 'health', 'relationship', 'wealth', 'fame'],
    geokGukWeight: 0.3,
    daeunWeight: 0.5,
    seyunWeight: 0.5,
    modernAdaptation: true,
  },
  // ... 기타 유파
};
```

### 3.2 용신 선택 알고리즘

#### 3.2.1 4가지 용신 선택법

| 방법 | 코드 | 적용 기준 | 알고리즘 |
|------|------|----------|----------|
| **강약용신** | `strength` | 일간 강약 기반 | 현재 구현 방식 유지 |
| **조후용신** | `seasonal` | 계절별 한열조습 | 계절 → 필요 오행 매핑 |
| **통관용신** | `mediation` | 오행 충돌 시 | 충돌 오행 사이 중재자 |
| **병약용신** | `disease` | 특정 문제 해결 | 사주 내 병(病) 진단 후 약(藥) |

#### 3.2.2 조후용신 예시

```typescript
// 계절별 조후 원칙
const SEASONAL_YONGSIN = {
  spring_wood: { avoid: ['목'], prefer: ['금', '토'] }, // 봄 목왕 → 금/토로 제어
  summer_fire: { avoid: ['화'], prefer: ['수', '금'] }, // 여름 화왕 → 수/금으로 냉각
  autumn_metal: { avoid: ['금'], prefer: ['화', '목'] }, // 가을 금왕 → 화/목으로 온난
  winter_water: { avoid: ['수'], prefer: ['화', '토'] }, // 겨울 수왕 → 화/토로 온난
};

function selectSeasonalYongSin(sajuData: SajuData): WuXing {
  const birthMonth = sajuData.month.branch;
  const season = getSeason(birthMonth);
  const dayElement = sajuData.day.stemElement;

  // 계절 + 일간 조합으로 용신 결정
  const seasonalRule = SEASONAL_YONGSIN[`${season}_${dayElement}`];
  return findStrongestElement(seasonalRule.prefer, sajuData);
}
```

### 3.3 사용자 설정 시스템

#### 3.3.1 설정 구조

```typescript
interface UserInterpretationSettings {
  // 유파 선택
  school: SchoolCode; // 'ziping' | 'dts' | 'qtbj' | 'modern' | 'shensha'

  // 용신 선택 방법
  yongSinMethod: YongSinMethod; // 'strength' | 'seasonal' | 'mediation' | 'disease'

  // 우선순위 (1-5, 낮을수록 중요)
  priorities: {
    health: number;
    wealth: number;
    career: number;
    relationship: number;
    fame: number;
  };

  // 시대 반영
  eraAdaptation: {
    modernCareer: boolean; // 현대 직업 반영
    globalContext: boolean; // 다국적 환경 반영
    techIndustry: boolean; // IT/기술 산업 특화
  };

  // 대운/세운 가중치 (합 1.0)
  fortuneWeights: {
    daeun: number; // 0.0-1.0
    seyun: number; // 0.0-1.0
  };

  // 고급 설정
  advanced: {
    includeGeokGuk: boolean; // 격국 분석 포함
    includeShensha: boolean; // 신살 분석 포함
    detailLevel: 'basic' | 'standard' | 'detailed' | 'expert';
  };
}
```

#### 3.3.2 기본 프리셋

```typescript
const DEFAULT_PRESETS: Record<string, UserInterpretationSettings> = {
  traditional: {
    school: 'ziping',
    yongSinMethod: 'strength',
    priorities: { career: 1, wealth: 2, health: 3, relationship: 4, fame: 5 },
    eraAdaptation: { modernCareer: false, globalContext: false, techIndustry: false },
    fortuneWeights: { daeun: 0.7, seyun: 0.3 },
    advanced: { includeGeokGuk: true, includeShensha: true, detailLevel: 'standard' },
  },

  modern_professional: {
    school: 'modern',
    yongSinMethod: 'strength',
    priorities: { career: 1, health: 2, relationship: 3, wealth: 4, fame: 5 },
    eraAdaptation: { modernCareer: true, globalContext: true, techIndustry: true },
    fortuneWeights: { daeun: 0.5, seyun: 0.5 },
    advanced: { includeGeokGuk: false, includeShensha: false, detailLevel: 'detailed' },
  },

  health_focused: {
    school: 'qtbj',
    yongSinMethod: 'seasonal',
    priorities: { health: 1, career: 2, relationship: 3, wealth: 4, fame: 5 },
    eraAdaptation: { modernCareer: true, globalContext: false, techIndustry: false },
    fortuneWeights: { daeun: 0.6, seyun: 0.4 },
    advanced: { includeGeokGuk: true, includeShensha: true, detailLevel: 'detailed' },
  },
};
```

### 3.4 현대 직업/환경 데이터베이스 확장

#### 3.4.1 현대 직업 카테고리

```typescript
const MODERN_CAREERS: Record<WuXing, string[]> = {
  목: [
    // 전통
    '교육', '출판', '섬유', '목재',
    // 현대
    '콘텐츠 크리에이터', 'UX 디자이너', '환경 엔지니어', '바이오 연구원',
    '에듀테크 개발자', '온라인 강사', 'ESG 컨설턴트'
  ],
  화: [
    // 전통
    '요리', '전기', '광고', '방송',
    // 현대
    'AI 엔지니어', '데이터 과학자', 'DevOps 엔지니어', '디지털 마케터',
    '유튜버', '인플루언서', '게임 개발자', '블록체인 개발자'
  ],
  토: [
    // 전통
    '건설', '부동산', '농업', '중개',
    // 현대
    '프로덕트 매니저', '프로젝트 매니저', '스크럼 마스터', '부동산 테크',
    '물류 플랫폼 운영', '클라우드 아키텍트'
  ],
  금: [
    // 전통
    '금융', '은행', '법조', '금속',
    // 현대
    '핀테크 개발자', '퀀트 애널리스트', '블록체인 감사', '사이버 보안 전문가',
    '규제 준수 담당자', '리스크 매니저'
  ],
  수: [
    // 전통
    '물류', '유통', '무역', '연구',
    // 현대
    '데이터 애널리스트', '클라우드 엔지니어', '원격 근무 컨설턴트',
    '해외 영업', '글로벌 마케터', '번역/통역 AI 개발자'
  ],
};
```

#### 3.4.2 글로벌 환경 고려

```typescript
interface GlobalCareerContext {
  remoteWork: boolean; // 원격 근무 적합성
  internationalBusiness: boolean; // 국제 업무 적합성
  culturalAdaptability: WuXing; // 문화 적응력 관련 오행
  timeZoneFlexibility: boolean; // 시차 유연성
  languageSkills: string[]; // 언어 능력 추천
}
```

### 3.5 비교 분석 기능

#### 3.5.1 다중 유파 비교 API

```typescript
interface SchoolComparison {
  schools: SchoolCode[];
  saju: SajuData;
  comparisonAspects: ('yongSin' | 'career' | 'fortune' | 'health' | 'relationship')[];
}

interface SchoolComparisonResult {
  schools: {
    school: SchoolCode;
    yongSin: YongSinAnalysis;
    careerRecommendation: CareerRecommendation;
    fortuneAnalysis: FortuneAnalysis;
    agreements: string[]; // 일치하는 해석
    differences: string[]; // 차이나는 해석
  }[];
  consensus: {
    commonYongSin?: WuXing; // 공통 용신
    commonCareers: string[]; // 공통 직업 추천
    strongestAgreements: string[]; // 가장 강한 합의
  };
  divergences: {
    aspect: string;
    interpretations: Record<SchoolCode, string>;
    reasoning: string;
  }[];
}
```

---

## 4. 기술 설계

### 4.1 아키텍처

```
┌─────────────────────────────────────────┐
│         MCP Server API Layer            │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │  Settings Manager                │   │
│  │  - Load/Save user settings       │   │
│  │  - Validate settings             │   │
│  │  - Apply presets                 │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  School Interpretation Engine    │   │
│  │  - School selection              │   │
│  │  - Algorithm routing             │   │
│  │  - Weight application            │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  YongSin Selection Algorithms    │   │
│  │  - Strength-based (current)      │   │
│  │  - Seasonal (new)                │   │
│  │  - Mediation (new)               │   │
│  │  - Disease (new)                 │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  Modern Career Database          │   │
│  │  - Traditional careers           │   │
│  │  - Modern careers (IT, Finance)  │   │
│  │  - Global context                │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  Comparison Engine               │   │
│  │  - Multi-school analysis         │   │
│  │  - Consensus detection           │   │
│  │  - Difference highlighting       │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 4.2 주요 모듈

#### 4.2.1 Settings Manager (`src/lib/interpretation_settings.ts`)

```typescript
export class InterpretationSettings {
  private settings: UserInterpretationSettings;
  private static instance: InterpretationSettings;

  static getInstance(): InterpretationSettings;
  loadPreset(presetName: string): void;
  loadCustom(settings: Partial<UserInterpretationSettings>): void;
  getSettings(): UserInterpretationSettings;
  validate(settings: UserInterpretationSettings): boolean;
  saveToFile(path: string): Promise<void>;
  loadFromFile(path: string): Promise<void>;
}
```

#### 4.2.2 School Interpreter (`src/lib/school_interpreter.ts`)

```typescript
export class SchoolInterpreter {
  constructor(
    private school: SchoolCode,
    private settings: UserInterpretationSettings
  );

  interpretSaju(saju: SajuData): SajuInterpretation;
  selectYongSin(saju: SajuData): YongSinAnalysis;
  recommendCareer(saju: SajuData): CareerRecommendation;
  analyzeFortune(saju: SajuData, targetDate: Date): FortuneAnalysis;
}
```

#### 4.2.3 YongSin Algorithms (`src/lib/yongsin_algorithms/`)

```
yongsin_algorithms/
├── strength_based.ts      // 현재 구현 (강약용신)
├── seasonal.ts            // 조후용신
├── mediation.ts           // 통관용신
├── disease.ts             // 병약용신
└── index.ts               // 통합 인터페이스
```

#### 4.2.4 Modern Career DB (`src/data/modern_careers.ts`)

```typescript
export interface ModernCareerData {
  traditional: Record<WuXing, string[]>;
  modern: Record<WuXing, string[]>;
  tech: Record<WuXing, string[]>;
  global: Record<WuXing, string[]>;
  remote: Record<WuXing, string[]>;
}

export const MODERN_CAREERS: ModernCareerData;
```

#### 4.2.5 Comparison Engine (`src/lib/school_comparison.ts`)

```typescript
export function compareSchools(
  saju: SajuData,
  schools: SchoolCode[],
  aspects: ComparisonAspect[]
): SchoolComparisonResult;

export function findConsensus(
  results: SchoolInterpretationResult[]
): ConsensusAnalysis;

export function highlightDifferences(
  results: SchoolInterpretationResult[]
): DivergenceAnalysis;
```

### 4.3 데이터 구조

#### 4.3.1 Settings 저장 형식 (JSON)

```json
{
  "version": "1.0",
  "school": "modern",
  "yongSinMethod": "strength",
  "priorities": {
    "health": 2,
    "wealth": 4,
    "career": 1,
    "relationship": 3,
    "fame": 5
  },
  "eraAdaptation": {
    "modernCareer": true,
    "globalContext": true,
    "techIndustry": true
  },
  "fortuneWeights": {
    "daeun": 0.5,
    "seyun": 0.5
  },
  "advanced": {
    "includeGeokGuk": false,
    "includeShensha": false,
    "detailLevel": "detailed"
  }
}
```

### 4.4 API 설계

#### 4.4.1 새로운 MCP Tools

**1. `set_interpretation_settings`**
```typescript
{
  name: "set_interpretation_settings",
  description: "사주 해석 유파 및 설정 변경",
  inputSchema: {
    type: "object",
    properties: {
      preset: { type: "string", enum: ["traditional", "modern_professional", "health_focused"] },
      custom: { type: "object" }, // UserInterpretationSettings
    }
  }
}
```

**2. `get_interpretation_settings`**
```typescript
{
  name: "get_interpretation_settings",
  description: "현재 해석 설정 조회",
  inputSchema: { type: "object", properties: {} }
}
```

**3. `compare_schools`**
```typescript
{
  name: "compare_schools",
  description: "여러 유파의 해석 비교",
  inputSchema: {
    type: "object",
    properties: {
      birthDate: { type: "string" },
      birthTime: { type: "string" },
      schools: { type: "array", items: { type: "string" } },
      aspects: { type: "array", items: { type: "string" } }
    },
    required: ["birthDate", "birthTime", "schools"]
  }
}
```

**4. `analyze_with_yongsin_method`**
```typescript
{
  name: "analyze_with_yongsin_method",
  description: "특정 용신 선택법으로 분석",
  inputSchema: {
    type: "object",
    properties: {
      birthDate: { type: "string" },
      birthTime: { type: "string" },
      method: { type: "string", enum: ["strength", "seasonal", "mediation", "disease"] }
    },
    required: ["birthDate", "birthTime", "method"]
  }
}
```

#### 4.4.2 기존 Tool 업데이트

기존 `analyze_saju`, `get_career_recommendation` 등의 tool은 현재 설정을 자동으로 적용하도록 수정.

---

## 5. 구현 계획

### 5.1 Phase 1: 기반 구축 (Week 1-2)

**목표**: 설정 시스템 및 유파 구조 구축

- [ ] `InterpretationSettings` 클래스 구현
- [ ] 기본 프리셋 3개 작성
- [ ] Settings 저장/로드 기능
- [ ] `SchoolInterpreter` 인터페이스 정의
- [ ] 유파별 기본 가중치 정의

**산출물**:
- `src/lib/interpretation_settings.ts`
- `src/lib/school_interpreter.ts`
- `src/data/school_presets.ts`
- 단위 테스트

### 5.2 Phase 2: 용신 알고리즘 확장 (Week 3-4)

**목표**: 4가지 용신 선택법 구현

- [ ] 강약용신 (현재 코드 리팩토링)
- [ ] 조후용신 알고리즘 구현
- [ ] 통관용신 알고리즘 구현
- [ ] 병약용신 알고리즘 구현
- [ ] 알고리즘 통합 인터페이스

**산출물**:
- `src/lib/yongsin_algorithms/strength_based.ts`
- `src/lib/yongsin_algorithms/seasonal.ts`
- `src/lib/yongsin_algorithms/mediation.ts`
- `src/lib/yongsin_algorithms/disease.ts`
- `src/lib/yongsin_algorithms/index.ts`
- 각 알고리즘별 테스트

### 5.3 Phase 3: 현대 데이터베이스 확장 (Week 5)

**목표**: 현대 직업 및 환경 데이터 추가

- [ ] 현대 직업 카테고리 500개 이상 수집
- [ ] IT/기술 산업 특화 직업 100개
- [ ] 글로벌 환경 고려 데이터
- [ ] 원격 근무 관련 데이터
- [ ] 직업-오행 매핑 정확도 검증

**산출물**:
- `src/data/modern_careers.ts`
- `src/data/global_careers.ts`
- 데이터 검증 스크립트

### 5.4 Phase 4: 유파별 해석 구현 (Week 6-7)

**목표**: 5개 유파 해석 엔진 구현

- [ ] 자평명리 해석기
- [ ] 적천수 해석기
- [ ] 궁통보감 해석기
- [ ] 현대 명리 해석기
- [ ] 신살 중심 해석기
- [ ] 유파별 직업 추천 커스터마이징
- [ ] 유파별 운세 분석 차별화

**산출물**:
- `src/lib/schools/ziping_interpreter.ts`
- `src/lib/schools/dts_interpreter.ts`
- `src/lib/schools/qtbj_interpreter.ts`
- `src/lib/schools/modern_interpreter.ts`
- `src/lib/schools/shensha_interpreter.ts`
- 통합 테스트

### 5.5 Phase 5: 비교 분석 기능 (Week 8)

**목표**: 다중 유파 비교 시스템

- [ ] `compareSchools()` 함수 구현
- [ ] 합의 탐지 알고리즘
- [ ] 차이점 강조 로직
- [ ] 비교 결과 포맷팅
- [ ] 시각화 데이터 생성

**산출물**:
- `src/lib/school_comparison.ts`
- 비교 분석 예제
- 통합 테스트

### 5.6 Phase 6: MCP Tool 통합 (Week 9)

**목표**: MCP Server API 업데이트

- [ ] `set_interpretation_settings` tool
- [ ] `get_interpretation_settings` tool
- [ ] `compare_schools` tool
- [ ] `analyze_with_yongsin_method` tool
- [ ] 기존 tool 업데이트
- [ ] API 문서 업데이트

**산출물**:
- `src/tools/set_interpretation_settings.ts`
- `src/tools/get_interpretation_settings.ts`
- `src/tools/compare_schools.ts`
- `src/tools/analyze_with_yongsin_method.ts`
- API 문서

### 5.7 Phase 7: 검증 및 문서화 (Week 10)

**목표**: 품질 보증 및 문서 완성

- [ ] 전문가 검증 (명리학자 3명 이상)
- [ ] 엣지 케이스 테스트
- [ ] 성능 최적화
- [ ] 사용자 가이드 작성
- [ ] 개발자 문서 작성
- [ ] 예제 코드 작성

**산출물**:
- 검증 보고서
- 성능 테스트 결과
- `docs/USER_GUIDE_SCHOOLS.md`
- `docs/DEVELOPER_GUIDE_SCHOOLS.md`
- `examples/school_comparison_demo.ts`

---

## 6. 성공 지표

### 6.1 정량적 지표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| **지원 유파 수** | ≥5개 | 코드 검증 |
| **용신 알고리즘 수** | ≥4개 | 코드 검증 |
| **현대 직업 수** | ≥500개 | 데이터베이스 카운트 |
| **용신 정확도** | ≥85% | 전문가 평가 (100샘플) |
| **API 응답 시간** | <500ms (단일), <2s (비교) | 성능 테스트 |
| **테스트 커버리지** | ≥80% | Jest/Vitest |

### 6.2 정성적 지표

- [ ] 명리학 전문가 3명 이상의 긍정 평가
- [ ] 사용자 피드백 긍정률 ≥80%
- [ ] 유파별 해석 차이 명확성
- [ ] 문서 완성도 (개발자 + 사용자)
- [ ] 코드 가독성 및 유지보수성

### 6.3 비즈니스 지표

- [ ] MCP 서버 통합 애플리케이션 ≥3개
- [ ] 월간 API 호출 ≥1,000회
- [ ] 개발자 커뮤니티 피드백 수집

---

## 7. 리스크 및 완화 방안

### 7.1 기술적 리스크

| 리스크 | 영향도 | 확률 | 완화 방안 |
|--------|--------|------|----------|
| **용신 알고리즘 복잡도** | 높음 | 중간 | 단계적 구현, 전문가 자문 |
| **성능 저하** | 중간 | 낮음 | 캐싱, 비동기 처리, 최적화 |
| **유파 간 충돌** | 중간 | 중간 | 명확한 인터페이스, 독립적 구현 |
| **데이터 정확성** | 높음 | 중간 | 전문가 검증, 다중 소스 확인 |

### 7.2 비즈니스 리스크

| 리스크 | 영향도 | 확률 | 완화 방안 |
|--------|--------|------|----------|
| **사용자 혼란** | 중간 | 높음 | 기본 프리셋 제공, 명확한 가이드 |
| **전문가 비판** | 높음 | 중간 | 사전 자문, 검증 과정 공개 |
| **유지보수 부담** | 중간 | 중간 | 모듈화, 명확한 문서화 |

---

## 8. 부록

### 8.1 참고 문헌

- **자평진전(子平眞詮)** - 명리학 정통 이론
- **적천수(滴天髓)** - 천간 중심 해석
- **궁통보감(窮通寶鑑)** - 조후용신 이론
- **현대 명리학 연구** - 통계 기반 명리학
- **신살론** - 신살 해석 체계

### 8.2 용어 사전

- **용신(用神)**: 사주의 불균형을 조절하는 핵심 오행
- **희신(喜神)**: 용신을 돕는 오행
- **기신(忌神)**: 피해야 할 해로운 오행
- **조후(調候)**: 계절의 한열조습을 조절함
- **통관(通關)**: 충돌하는 오행 사이를 중재함
- **격국(格局)**: 사주의 구조적 패턴

### 8.3 FAQ

**Q1: 왜 5개 유파만 지원하나요?**
A: 초기 버전에서는 대표적이고 검증 가능한 유파를 우선 지원합니다. 사용자 피드백에 따라 확장 예정입니다.

**Q2: 어떤 유파를 선택해야 하나요?**
A: 일반 사용자는 `modern_professional` 프리셋을, 전통을 중시하는 분은 `traditional` 프리셋을 권장합니다.

**Q3: 여러 유파의 해석이 다를 때 어떻게 판단하나요?**
A: `compare_schools` tool을 사용하여 합의점과 차이점을 확인하고, 본인의 상황과 가치관에 맞는 해석을 선택하시면 됩니다.

---

**문서 이력**

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2025-10-02 | Claude Code | 초안 작성 |

