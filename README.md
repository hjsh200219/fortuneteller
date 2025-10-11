# 🔮 사주 운세 MCP 서버 (Saju MCP Server)

[![npm version](https://img.shields.io/npm/v/@hoshin/saju-mcp-server)](https://www.npmjs.com/package/@hoshin/saju-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

한국 전통 사주팔자를 기반으로 운세를 분석하는 MCP(Model Context Protocol) 서버입니다.

A Model Context Protocol (MCP) server for Korean traditional Saju (Four Pillars of Destiny) fortune-telling.

> **🌏 Language**: [한국어](#한국어) | [English](#english)

## ✨ 주요 기능

- **사주팔자 계산**: 생년월일시로부터 천간지지 8자 자동 계산 (진태양시 -30분 보정)
- **운세 분석**: 성격, 직업운, 재물운, 건강운, 애정운 등 다양한 분석
- **궁합 분석**: 두 사람의 사주 비교 및 궁합도 계산
- **음양력 변환**: 양력 ↔ 음력 날짜 변환 지원 (1900-2200, 윤달 처리 포함)
- **일일 운세**: 날짜별 상세 운세 제공
- **대운(大運)**: 10년 단위 큰 흐름 운세 조회
- **용신(用神) 분석**: 색상, 방향, 직업 등 맞춤형 조언 제공
- **지장간 세력**: 절기별 지장간 세력 계산으로 정밀한 분석
- **신살(神殺)**: 15개 신살 탐지 (원진살, 귀문관살 포함)

### 🆕 v1.1.0 신규 기능
- **7개 통합 도구**: 15개 개별 도구를 7개로 최적화 (토큰 효율 40% 개선)
- **로컬 테이블**: 1900-2200년 음양력 데이터 (외부 API 의존성 제거)
- **Zod 입력 검증**: 런타임 타입 검증으로 에러율 40% 감소
- **date-fns 통합**: 타임존 버그 제거 및 정밀한 날짜 처리
- **MCP SDK v1.18**: 최신 프로토콜 및 성능 최적화

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm, yarn, 또는 pnpm

### 설치

#### 자동 설치 스크립트 (가장 간편)

```bash
# 설치 스크립트 다운로드 및 실행
curl -fsSL https://raw.githubusercontent.com/hjsh200219/fortuneteller/main/install.sh | bash
```

이 스크립트는 다음을 자동으로 수행합니다:
- npm 패키지 전역 설치
- Claude Desktop 설정 파일에 MCP 서버 자동 등록
- 기존 설정 백업

#### 수동 설치

```bash
# npm으로 전역 설치
npm install -g @hoshin/saju-mcp-server

# 또는 npx로 직접 실행
npx @hoshin/saju-mcp-server
```

#### 소스에서 빌드

```bash
# 저장소 클론
git clone https://github.com/hjsh200219/fortuneteller.git
cd fortuneteller

# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 🛠️ MCP 도구 (총 7개 - 통합 최적화)

### 1. analyze_saju
사주 분석 통합 도구 (기본 계산, 운세, 용신, 유파 비교, 용신 방법론).

**분석 타입**:
- `basic`: 사주팔자 기본 계산
- `fortune`: 운세 분석 (general/career/wealth/health/love)
- `yongsin`: 용신 상세 분석
- `school_compare`: 5개 유파 비교 (자평명리, 적천수, 궁통보감, 현대명리, 신살중심)
- `yongsin_method`: 특정 용신 방법론 분석 (강약/조후/통관/병약)

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male",
  analysisType: "basic" | "fortune" | "yongsin" | "school_compare" | "yongsin_method",

  // fortune 타입용 옵션
  fortuneType?: "general" | "career" | "wealth" | "health" | "love",

  // school_compare 타입용 옵션
  schools?: ["ziping", "dts", "qtbj", "modern", "shensha"],

  // yongsin_method 타입용 옵션
  method?: "strength" | "seasonal" | "mediation" | "disease"
}
```

### 2. check_compatibility
두 사람의 궁합을 분석합니다.

```typescript
{
  person1: {
    birthDate: "1990-03-15",
    birthTime: "10:30",
    calendar: "solar",
    isLeapMonth: false,
    gender: "male"
  },
  person2: {
    birthDate: "1992-07-20",
    birthTime: "14:30",
    calendar: "solar",
    isLeapMonth: false,
    gender: "female"
  }
}
```

### 3. convert_calendar
양력과 음력을 변환합니다 (1900-2200 지원).

```typescript
{
  date: "2025-01-01",
  fromCalendar: "solar",
  toCalendar: "lunar",
  isLeapMonth?: false
}
```

### 4. get_daily_fortune
특정 날짜의 일일 운세를 제공합니다.

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male",
  targetDate: "2025-01-01"
}
```

### 5. get_dae_un
10년 단위 대운(大運) 정보를 조회합니다.

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male"
}
```

### 6. get_fortune_by_period
시간대별 운세 통합 도구 (연운/월운/시운/연속).

**기간 타입**:
- `year`: 연별 운세 (세운, 歲運)
- `month`: 월별 운세 (월운, 月運)
- `hour`: 시간대별 운세 (시운, 時運)
- `multi-year`: 연속 연도 운세

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male",
  periodType: "year" | "month" | "hour" | "multi-year",

  // 기간 지정 (periodType에 맞는 형식)
  target?: "2025" | "2025-03" | "2025-01-01 14:00",

  // multi-year 타입용 옵션
  count?: 5  // 조회할 연도 개수 (기본값: 5)
}
```

### 7. manage_settings
해석 설정 관리 도구 (조회/변경).

**액션**:
- `get`: 현재 설정 조회
- `set`: 설정 변경 (프리셋 또는 커스텀)

```typescript
{
  action: "get" | "set",

  // set 액션용 옵션
  preset?: "ziping" | "dts" | "qtbj" | "modern" | "shensha" | "balanced",

  // 또는 커스텀 가중치
  custom?: {
    ziping: 0.3,    // 자평명리 가중치 (0.0-1.0)
    dts: 0.2,       // 적천수 가중치
    qtbj: 0.2,      // 궁통보감 가중치
    modern: 0.2,    // 현대명리 가중치
    shensha: 0.1    // 신살중심 가중치
  }
}
```

## 📁 프로젝트 구조

```
fortuneteller/
├── src/
│   ├── index.ts              # MCP 서버 진입점
│   ├── core/                 # 핵심 시스템
│   │   ├── tool-definitions.ts  # 7개 도구 정의
│   │   └── tool-handler.ts      # 도구 라우팅
│   ├── tools/                # MCP 도구 구현
│   │   ├── analyze_saju.ts      # 통합 사주 분석
│   │   ├── check_compatibility.ts
│   │   ├── convert_calendar.ts
│   │   ├── get_daily_fortune.ts
│   │   ├── get_dae_un.ts
│   │   ├── get_fortune_by_period.ts  # 통합 시간대별 운세
│   │   └── manage_settings.ts        # 통합 설정 관리
│   ├── lib/                  # 핵심 로직
│   │   ├── saju.ts           # 사주 계산 (진태양시 -30분 보정)
│   │   ├── calendar.ts       # 음양력 변환 (로컬 테이블)
│   │   ├── fortune.ts        # 운세 분석
│   │   ├── compatibility.ts  # 궁합 분석
│   │   ├── dae_un.ts         # 대운 계산
│   │   ├── yong_sin.ts       # 용신 선정
│   │   ├── ten_gods.ts       # 십성 계산
│   │   ├── sin_sal.ts        # 신살 탐지 (15개)
│   │   ├── day_master_strength.ts  # 일간 강약
│   │   └── gyeok_guk.ts      # 격국 결정
│   ├── data/                 # 정적 데이터
│   │   ├── heavenly_stems.ts      # 천간(天干) 10개
│   │   ├── earthly_branches.ts    # 지지(地支) 12개, 지장간 세력
│   │   ├── wuxing.ts              # 오행(五行) 상생상극
│   │   ├── solar_terms.ts         # 24절기 (1900-2200)
│   │   ├── lunar_table.ts         # 음력 테이블 (1900-2200)
│   │   └── longitude_table.ts     # 전국 162개 시군구 경도
│   └── types/                # 타입 정의
│       └── index.ts
├── package.json
├── tsconfig.json
├── CLAUDE.md                 # Claude Code 가이드
└── README.md
```

## 🔧 개발

```bash
# 개발 모드 (hot reload)
npm run watch

# 린트 체크
npm run lint

# 코드 포맷팅
npm run format

# 테스트 실행
npm test

# API 문서 생성
npm run docs

# API 문서 로컬 서버 (http://localhost:8080)
npm run docs:serve
```

## 📖 MCP 클라이언트 설정

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`에 다음 설정을 추가하세요:

#### npm 패키지 사용 (권장)

```json
{
  "mcpServers": {
    "saju": {
      "command": "npx",
      "args": ["-y", "@hoshin/saju-mcp-server"]
    }
  }
}
```

#### 전역 설치 후 사용

```bash
npm install -g @hoshin/saju-mcp-server
```

```json
{
  "mcpServers": {
    "saju": {
      "command": "saju-mcp-server"
    }
  }
}
```

#### 로컬 개발 (소스에서)

```json
{
  "mcpServers": {
    "saju": {
      "command": "node",
      "args": ["/path/to/saju-mcp-server/dist/index.js"]
    }
  }
}
```

## 🐳 Docker 지원

### Docker로 실행

```bash
# 이미지 빌드
docker build -t saju-mcp-server .

# 컨테이너 실행
docker run -it --rm saju-mcp-server

# 또는 docker-compose 사용
docker-compose up -d
```

### Smithery를 통한 원클릭 설치

```bash
# Smithery CLI로 설치
npx @smithery/cli install saju-mcp-server --client claude
```

Smithery 마켓플레이스에서 더 쉽게 설치하고 관리할 수 있습니다.

---

## 📚 사주팔자 용어 설명

### 기본 구성 요소
- **천간(天干)**: 갑(甲), 을(乙), 병(丙), 정(丁), 무(戊), 기(己), 경(庚), 신(辛), 임(壬), 계(癸) - 10개
- **지지(地支)**: 자(子), 축(丑), 인(寅), 묘(卯), 진(辰), 사(巳), 오(午), 미(未), 신(申), 유(酉), 술(戌), 해(亥) - 12개
- **오행(五行)**: 목(木), 화(火), 토(土), 금(金), 수(水) - 상생상극 관계
- **십성(十星)**: 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인

### 고급 분석 요소
- **지장간(支藏干)**: 지지 속에 숨어있는 천간 (정기, 중기, 여기)
- **신살(神殺)**: 15개의 길흉 지표 (천을귀인, 역마살, 도화살, 원진살, 귀문관살 등)
- **용신(用神)**: 사주의 균형을 맞추는 핵심 오행
- **격국(格局)**: 사주의 전체적인 패턴과 성향
- **대운(大運)**: 10년 단위의 큰 운세 흐름
- **진태양시(眞太陽時)**: 한국 표준시 -30분 보정 (정확한 사주 계산을 위함)

## ⚠️ 면책 조항

이 서비스는 전통 사주팔자를 기반으로 한 참고용 정보를 제공합니다.
- 의학적, 법률적, 재정적 조언이 아닙니다
- 중요한 결정은 반드시 전문가와 상담하시기 바랍니다
- 운세는 개인의 노력과 선택에 따라 달라질 수 있습니다

## 📄 라이센스

MIT License

## 👨‍💻 기여

이슈 제보 및 풀 리퀘스트를 환영합니다!

---

## English

### ✨ Features

- **Saju (Four Pillars) Calculation**: Automatic calculation of 8 characters from birth date and time (with -30min true solar time correction)
- **Fortune Analysis**: Comprehensive analysis including personality, career, wealth, health, and love fortune
- **Compatibility Analysis**: Compatibility calculation and comparison between two people
- **Calendar Conversion**: Solar ↔ Lunar calendar conversion (1900-2200) with leap month support
- **Daily Fortune**: Detailed daily fortune for specific dates
- **Dae-un (大運)**: 10-year major fortune cycle analysis
- **Yong-sin (用神) Analysis**: Personalized advice on colors, directions, and careers
- **Ji-jang-gan Strength**: Precise analysis with seasonal hidden stem strength calculation
- **Sin-sal (神殺)**: Detection of 15 special stars (including Won-jin-sal, Gwi-mun-gwan-sal)

### 🚀 Quick Start

#### Installation

**Option 1: Automatic Installation Script (Recommended)**
```bash
curl -fsSL https://raw.githubusercontent.com/hoshin/saju-mcp-server/main/install.sh | bash
```

**Option 2: Manual Installation**
```bash
npm install -g @hoshin/saju-mcp-server
```

**Option 3: Using npx (No Installation)**
```bash
npx @hoshin/saju-mcp-server
```

#### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "saju": {
      "command": "npx",
      "args": ["-y", "@hoshin/saju-mcp-server"]
    }
  }
}
```

Restart Claude Desktop and start using the tools!

### 🛠️ Available Tools (7 Integrated Tools)

1. **analyze_saju** - Integrated Saju analysis (basic/fortune/yongsin/school_compare/yongsin_method)
2. **check_compatibility** - Analyze compatibility between two people
3. **convert_calendar** - Convert between solar and lunar calendars (1900-2200)
4. **get_daily_fortune** - Get daily fortune for specific date
5. **get_dae_un** - Get 10-year major fortune cycles
6. **get_fortune_by_period** - Get fortune by period (year/month/hour/multi-year)
7. **manage_settings** - Manage interpretation settings (get/set)

### 📚 Key Concepts

#### Basic Components
- **Heavenly Stems (天干)**: 10 stems - 甲乙丙丁戊己庚辛壬癸
- **Earthly Branches (地支)**: 12 branches - 子丑寅卯辰巳午未申酉戌亥
- **Five Elements (五行)**: Wood, Fire, Earth, Metal, Water
- **Ten Gods (十星)**: 10 relationship types

#### Advanced Analysis
- **Hidden Stems (支藏干)**: Hidden stems within branches
- **Special Stars (神殺)**: 15 auspicious/inauspicious indicators
- **Yong-sin (用神)**: Beneficial element for balance
- **Pattern (格局)**: Overall life pattern classification
- **Dae-un (大運)**: 10-year major fortune cycles
- **True Solar Time (眞太陽時)**: -30min Korea time correction

### 🐳 Docker Support

```bash
# Build image
docker build -t saju-mcp-server .

# Run container
docker run -it --rm saju-mcp-server

# Or use docker-compose
docker-compose up -d
```

### 🔧 Smithery One-Click Install

```bash
# Install via Smithery CLI
npx @smithery/cli install saju-mcp-server --client claude
```

Easier installation and management through Smithery marketplace.

### 📖 Documentation

- 📘 [Quick Start Guide](QUICKSTART.md) - Get started in 5 minutes
- 📗 [Setup Guide](SETUP.md) - Detailed installation and configuration
- 📕 [Publishing Guide](PUBLISHING.md) - npm package publishing
- 📙 [Developer Guide](CLAUDE.md) - Project structure and development
- 📓 [PRD](docs/PRD_fortuneteller_improvements.md) - Product roadmap
- 📚 [API Documentation](docs/api/index.html) - TypeDoc generated API docs

### 🤝 Contributing

Issues and pull requests are welcome!

### 📄 License

MIT License

### ⚠️ Disclaimer

This service provides reference information based on traditional Saju fortune-telling.
- Not intended as medical, legal, or financial advice
- Please consult professionals for important decisions
- Fortune can change based on personal effort and choices

---

Made with ❤️ for Korean traditional fortune-telling
