# 🔮 사주 운세 MCP 서버 (FortuneTeller MCP)

한국 전통 사주팔자를 기반으로 운세를 분석하는 MCP(Model Context Protocol) 서버입니다.

## ✨ 주요 기능

- **사주팔자 계산**: 생년월일시로부터 천간지지 8자 자동 계산
- **운세 분석**: 성격, 직업운, 재물운, 건강운, 애정운 등 다양한 분석
- **궁합 분석**: 두 사람의 사주 비교 및 궁합도 계산
- **음양력 변환**: 양력 ↔ 음력 날짜 변환 지원
- **일일 운세**: 날짜별 상세 운세 제공

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm, yarn, 또는 pnpm

### 설치

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 🛠️ MCP 도구

### 1. calculate_saju
생년월일시로부터 사주팔자를 계산합니다.

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male"
}
```

### 2. analyze_fortune
사주팔자를 기반으로 운세를 분석합니다.

```typescript
{
  sajuData: {...},
  analysisType: "general" | "career" | "wealth" | "health" | "love",
  targetDate?: "2025-01-01"
}
```

### 3. check_compatibility
두 사람의 궁합을 분석합니다.

```typescript
{
  person1: {...},
  person2: {...}
}
```

### 4. convert_calendar
양력과 음력을 변환합니다.

```typescript
{
  date: "2025-01-01",
  fromCalendar: "solar",
  toCalendar: "lunar"
}
```

### 5. get_daily_fortune
특정 날짜의 일일 운세를 제공합니다.

```typescript
{
  sajuData: {...},
  date: "2025-01-01"
}
```

## 📁 프로젝트 구조

```
fortuneteller/
├── src/
│   ├── index.ts              # MCP 서버 진입점
│   ├── tools/                # MCP 도구 구현
│   │   ├── calculate_saju.ts
│   │   ├── analyze_fortune.ts
│   │   ├── check_compatibility.ts
│   │   ├── convert_calendar.ts
│   │   └── get_daily_fortune.ts
│   ├── lib/                  # 핵심 로직
│   │   ├── saju.ts          # 사주 계산
│   │   ├── calendar.ts      # 음양력 변환
│   │   ├── fortune.ts       # 운세 분석
│   │   └── compatibility.ts # 궁합 분석
│   ├── data/                # 정적 데이터
│   │   ├── heavenly_stems.ts  # 천간(天干)
│   │   ├── earthly_branches.ts # 지지(地支)
│   │   ├── wuxing.ts        # 오행(五行)
│   │   └── solar_terms.ts   # 24절기
│   └── types/               # 타입 정의
│       └── index.ts
├── package.json
├── tsconfig.json
├── README.md
└── PRD.md
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
```

## 📖 MCP 클라이언트 설정

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fortuneteller": {
      "command": "node",
      "args": ["/Users/hoshin/workspace/fortuneteller/dist/index.js"]
    }
  }
}
```

또는 개발 모드로:

```json
{
  "mcpServers": {
    "fortuneteller": {
      "command": "npx",
      "args": ["-y", "tsx", "/Users/hoshin/workspace/fortuneteller/src/index.ts"]
    }
  }
}
```

## 📚 사주팔자 용어 설명

- **천간(天干)**: 갑(甲), 을(乙), 병(丙), 정(丁), 무(戊), 기(己), 경(庚), 신(辛), 임(壬), 계(癸)
- **지지(地支)**: 자(子), 축(丑), 인(寅), 묘(卯), 진(辰), 사(巳), 오(午), 미(未), 신(申), 유(酉), 술(戌), 해(亥)
- **오행(五行)**: 목(木), 화(火), 토(土), 금(金), 수(水)
- **십성(十星)**: 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인

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

Made with ❤️ for Korean traditional fortune-telling

