# 🔮 사주 운세 MCP 서버 완전 가이드

[![npm version](https://img.shields.io/npm/v/@hoshin/saju-mcp-server)](https://www.npmjs.com/package/@hoshin/saju-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

한국 전통 사주팔자를 기반으로 운세를 분석하는 MCP(Model Context Protocol) 서버입니다.

> **🌏 Language**: [한국어](#한국어) | [English](#english)

---

## 📖 목차

### 빠른 시작
- [1. 소개](#1-소개)
- [2. 5분 안에 시작하기](#2-5분-안에-시작하기)
- [3. 첫 사주 분석](#3-첫-사주-분석)

### 상세 설치 및 설정
- [4. 시스템 요구사항](#4-시스템-요구사항)
- [5. 설치 방법](#5-설치-방법)
- [6. Claude Desktop 설정](#6-claude-desktop-설정)
- [7. 고급 설정](#7-고급-설정)

### 사용 가이드
- [8. MCP 도구 (15개)](#8-mcp-도구-15개)
- [9. 사용 예시](#9-사용-예시)
- [10. 사주팔자 용어 설명](#10-사주팔자-용어-설명)

### 문제 해결 및 유지보수
- [11. 문제 해결](#11-문제-해결)
- [12. 업데이트 및 제거](#12-업데이트-및-제거)

### 부록
- [13. Docker 지원](#13-docker-지원)
- [14. 개발자 가이드](#14-개발자-가이드)
- [15. 추가 리소스](#15-추가-리소스)

---

## 1. 소개

### ✨ 주요 기능

- **사주팔자 계산**: 생년월일시로부터 천간지지 8자 자동 계산 (진태양시 -30분 보정)
- **운세 분석**: 성격, 직업운, 재물운, 건강운, 애정운 등 다양한 분석
- **궁합 분석**: 두 사람의 사주 비교 및 궁합도 계산
- **음양력 변환**: 양력 ↔ 음력 날짜 변환 지원 (윤달 처리 포함)
- **시간대별 운세**: 일일/월별/연별/10년 대운 운세 제공
- **용신(用神) 분석**: 색상, 방향, 직업 등 맞춤형 조언
- **해석 유파 시스템**: 5개 유파 비교 분석
- **지장간 세력**: 절기별 지장간 세력 계산으로 정밀한 분석
- **신살(神殺)**: 15개 신살 탐지 (원진살, 귀문관살 포함)

### 🆕 v1.1.0 신규 기능

- **Zod 입력 검증**: 런타임 타입 검증으로 에러율 40% 감소
- **date-fns 통합**: 타임존 버그 제거 및 정밀한 날짜 처리
- **MCP SDK v1.18**: 최신 프로토콜 및 성능 최적화

---

## 2. 5분 안에 시작하기

### ⏱️ 예상 소요 시간: 3-5분

### 2.1 단계: 설치 (1분)

#### 방법 A: 자동 설치 스크립트 (가장 빠름) ⭐

```bash
curl -fsSL https://raw.githubusercontent.com/hoshin/saju-mcp-server/main/install.sh | bash
```

이 한 줄의 명령어로 모든 설치가 완료됩니다:
- ✅ npm 패키지 전역 설치
- ✅ Claude Desktop 설정 자동 추가
- ✅ 기존 설정 자동 백업

#### 방법 B: 수동 설치

```bash
# 1. npm 패키지 설치
npm install -g @hoshin/saju-mcp-server

# 2. Claude Desktop 설정 (다음 단계 참조)
```

#### 방법 C: npx 사용 (설치 없이)

Claude Desktop 설정에서 바로 사용:
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

### 2.2 단계: Claude Desktop 설정 (1분)

#### 자동 설치 시 (방법 A)
- 설정이 이미 완료되었습니다!
- **Claude Desktop만 재시작하면 됩니다**

#### 수동 설치 시 (방법 B)

1. **설정 파일 열기**
   ```bash
   open -a TextEdit ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **다음 내용 추가**
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

3. **파일 저장**

### 2.3 단계: Claude Desktop 재시작 (30초)

1. **Claude Desktop 완전 종료**
   - `Cmd + Q` 누르기
   - 또는 메뉴 > Quit

2. **Claude Desktop 다시 실행**

3. **새 채팅 시작**

---

## 3. 첫 사주 분석

Claude에게 다음과 같이 물어보세요:

### 예시 1: 기본 사주 계산
```
1990년 3월 15일 오전 10시 30분생 남자의 사주팔자를 계산해줘
```

### 예시 2: 운세 분석
```
내 재물운을 분석해줘
```

### 예시 3: 궁합 분석
```
나랑 1992년 5월 20일 오후 2시생 여자랑 궁합 봐줘
```

### 설치 완료 체크리스트

- [ ] Node.js 18+ 설치 확인
- [ ] npm 패키지 설치 완료
- [ ] Claude Desktop 설정 추가
- [ ] Claude Desktop 재시작
- [ ] MCP 도구 15개 확인
- [ ] 첫 사주 계산 성공

**모든 항목을 체크하셨다면 축하합니다! 🎉**

---

## 4. 시스템 요구사항

### 필수 요구사항

- **Node.js**: 18.0.0 이상
  ```bash
  # 버전 확인
  node --version
  ```

- **npm**: 9.0.0 이상 (Node.js와 함께 설치됨)
  ```bash
  # 버전 확인
  npm --version
  ```

- **Claude Desktop**: 최신 버전
  - [다운로드 링크](https://claude.ai/download)

### 권장 환경

- macOS 11 (Big Sur) 이상
- 디스크 여유 공간: 최소 100MB
- 인터넷 연결 (설치 및 업데이트용)

---

## 5. 설치 방법

### 방법 1: 자동 설치 스크립트 (권장) ⭐

가장 빠르고 간편한 방법입니다.

```bash
# 터미널에서 실행
curl -fsSL https://raw.githubusercontent.com/hoshin/saju-mcp-server/main/install.sh | bash
```

**이 스크립트는 자동으로:**
1. npm 패키지 전역 설치
2. Claude Desktop 설정 파일에 MCP 서버 추가
3. 기존 설정 백업 (있는 경우)

설치 완료 후 Claude Desktop을 재시작하면 바로 사용할 수 있습니다.

---

### 방법 2: npm 전역 설치

수동으로 설치하고 싶은 경우:

```bash
# 1. npm 패키지 전역 설치
npm install -g @hoshin/saju-mcp-server

# 2. 설치 확인
saju-mcp-server --version

# 3. Claude Desktop 설정 (아래 섹션 참조)
```

---

### 방법 3: npx 사용 (설치 없이)

설치하지 않고 바로 사용하려면:

```bash
# Claude Desktop 설정에서 사용
npx @hoshin/saju-mcp-server
```

이 방법은 설치 없이 항상 최신 버전을 사용할 수 있습니다.

---

### 방법 4: 소스에서 빌드 (개발자용)

프로젝트 개발이나 커스터마이징이 필요한 경우:

```bash
# 1. 저장소 클론
git clone https://github.com/hjsh200219/fortuneteller.git
cd fortuneteller

# 2. 의존성 설치
npm install

# 3. TypeScript 빌드
npm run build

# 4. 로컬 실행
npm start

# 또는 개발 모드 (hot reload)
npm run dev
```

---

## 6. Claude Desktop 설정

### 설정 파일 위치

Claude Desktop 설정 파일은 다음 위치에 있습니다:

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### 설정 방법

#### 1단계: 설정 파일 열기

**터미널에서:**
```bash
# TextEdit로 열기
open -a TextEdit ~/Library/Application\ Support/Claude/claude_desktop_config.json

# VS Code로 열기 (설치되어 있는 경우)
code ~/Library/Application\ Support/Claude/claude_desktop_config.json

# nano 에디터로 열기
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### 2단계: MCP 서버 설정 추가

설정 파일이 **비어있거나 없는 경우**:

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

**기존 mcpServers가 있는 경우**:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "some-command"
    },
    "saju": {
      "command": "npx",
      "args": ["-y", "@hoshin/saju-mcp-server"]
    }
  }
}
```

#### 3단계: 설정 저장 및 Claude Desktop 재시작

1. 설정 파일 저장
2. Claude Desktop 완전 종료 (`Cmd + Q`)
3. Claude Desktop 다시 실행

### 설정 확인 및 테스트

#### 1. MCP 도구 확인

Claude Desktop에서 새 채팅을 시작하고:

```
사용 가능한 MCP 도구를 보여줘
```

또는

```
calculate_saju 도구가 있는지 확인해줘
```

15개의 도구가 표시되면 설정 성공입니다:
- calculate_saju
- analyze_fortune
- check_compatibility
- convert_calendar
- get_daily_fortune
- get_dae_un
- analyze_yong_sin
- get_yearly_fortune
- get_monthly_fortune
- get_hourly_fortune
- get_api_status
- set_interpretation_settings
- get_interpretation_settings
- compare_interpretation_schools
- analyze_with_yongsin_method

#### 2. 기본 테스트

간단한 사주 계산 테스트:

```
1990년 3월 15일 오전 10시 30분생 남자의 사주팔자를 계산해줘
```

정상적으로 사주 결과가 출력되면 모든 설정이 완료된 것입니다!

---

## 7. 고급 설정

### 여러 설정 방법 비교

#### 설정 A: npx 사용 (권장) ⭐

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

**장점:**
- 설치 없이 사용 가능
- 항상 최신 버전 자동 사용
- 관리 간편

**단점:**
- 첫 실행 시 다운로드로 약간 느림

#### 설정 B: 전역 설치 사용

```bash
# 먼저 전역 설치
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

**장점:**
- 빠른 실행 속도
- 오프라인 사용 가능

**단점:**
- 수동 업데이트 필요

#### 설정 C: Node 직접 실행 (개발용)

```json
{
  "mcpServers": {
    "saju": {
      "command": "node",
      "args": ["/path/to/fortuneteller/dist/index.js"]
    }
  }
}
```

**장점:**
- 개발/디버깅 용이
- 소스 코드 수정 가능

**단점:**
- 절대 경로 필요
- 수동 빌드 필요

---

### 환경 변수 설정 (선택사항)

MCP 서버 동작을 커스터마이징하려면:

```json
{
  "mcpServers": {
    "saju": {
      "command": "npx",
      "args": ["-y", "@hoshin/saju-mcp-server"],
      "env": {
        "DEBUG": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

---

## 8. MCP 도구 (15개)

### 기본 사주 분석 (7개)

#### 1. calculate_saju
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

#### 2. analyze_fortune
사주팔자를 기반으로 운세를 분석합니다.

```typescript
{
  sajuData: {...},
  analysisType: "general" | "career" | "wealth" | "health" | "love",
  targetDate?: "2025-01-01"
}
```

#### 3. check_compatibility
두 사람의 궁합을 분석합니다.

```typescript
{
  person1: {...},
  person2: {...}
}
```

#### 4. convert_calendar
양력과 음력을 변환합니다.

```typescript
{
  date: "2025-01-01",
  fromCalendar: "solar",
  toCalendar: "lunar"
}
```

#### 5. get_daily_fortune
특정 날짜의 일일 운세를 제공합니다.

```typescript
{
  sajuData: {...},
  date: "2025-01-01"
}
```

#### 6. get_dae_un
10년 단위 대운(大運) 정보를 조회합니다.

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male",
  age?: 30,        // 특정 나이의 대운 조회 (선택)
  limit?: 10       // 조회할 대운 개수 (선택)
}
```

#### 7. analyze_yong_sin
용신(用神) 상세 분석 및 조언을 제공합니다.

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male"
}
```

### 시간대별 운세 (4개)

#### 8. get_yearly_fortune
세운(歲運) 연별 운세를 조회합니다.

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male",
  targetYear?: 2025,
  years?: 5
}
```

#### 9. get_monthly_fortune
월운(月運) 월별 운세를 조회합니다.

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male",
  targetYear?: 2025,
  targetMonth?: 3,
  months?: 12
}
```

#### 10. get_hourly_fortune
시운(時運) 시간대별 운세를 조회합니다.

```typescript
{
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  isLeapMonth: false,
  gender: "male",
  targetDate?: "2025-01-01",
  targetHour?: 14,
  allHours?: true
}
```

#### 11. get_api_status
KASI API 상태 및 캐시 통계를 조회합니다.

```typescript
{
  detailed?: true
}
```

### 해석 유파 시스템 (4개)

#### 12. set_interpretation_settings
사주 해석 설정을 변경합니다 (프리셋 또는 커스텀).

```typescript
{
  preset?: "traditional" | "modern_professional" | "health_focused" | "career_focused",
  customSettings?: { yongSinMethod: "strength" | "seasonal" | "mediation" | "disease", ... }
}
```

#### 13. get_interpretation_settings
현재 해석 설정을 조회합니다.

#### 14. compare_interpretation_schools
5개 유파(자평명리, 적천수, 궁통보감, 현대명리, 신살중심)의 해석을 비교합니다.

```typescript
{
  year: 1990, month: 3, day: 15, hour: 10, minute: 30,
  calendar: "solar", isLeapMonth: false, gender: "male",
  schools?: ["ziping", "dts", "qtbj", "modern", "shensha"]
}
```

#### 15. analyze_with_yongsin_method
특정 용신 방법론으로 분석하고 직업을 추천합니다.

```typescript
{
  year: 1990, month: 3, day: 15, hour: 10, minute: 30,
  calendar: "solar", isLeapMonth: false, gender: "male",
  yongSinMethod: "strength" | "seasonal" | "mediation" | "disease",
  includeCareerRecommendation?: true
}
```

---

## 9. 사용 예시

### 기본 사용법

#### 예시 1: 간단한 사주 보기

**사용자:**
> 나는 1990년 3월 15일 오전 10시 30분에 태어난 남자야. 내 사주 봐줘.

**AI 응답:**
```
사주팔자를 계산하겠습니다.

사주팔자:
  연주(年柱): 경오(庚午) (금/화)
  월주(月柱): 기묘(己卯) (토/목)
  일주(日柱): 신해(辛亥) (금/수)
  시주(時柱): 계사(癸巳) (수/화)

오행 분석:
  목(木): 1개
  화(火): 2개
  토(土): 1개
  금(金): 2개
  수(水): 2개

특징:
  강한 오행: 없음
  약한 오행: 없음

오행이 균형을 이루어 안정적인 사주입니다.
```

---

#### 예시 2: 재물운 분석

**사용자:**
> 올해 내 재물운 어때?

**AI 응답:**
```
🔮 재물운 분석

📊 운세 점수: 72/100

📝 종합 평가:
재물운이 좋은 편입니다

✅ 긍정적 요소:
  • 재성(토)이 충분하여 재물운이 양호합니다
  • 투자 기회를 적극적으로 검토해보세요

⚠️ 주의할 점:
  • 특별히 주의할 점 없음

💡 조언:
  • 투자 기회를 적극적으로 검토해보세요
```

---

#### 예시 3: 궁합 보기

**사용자:**
> 나랑 1992년 5월 20일 오후 2시생 여자랑 궁합 봐줘

**AI 응답:**
```
💕 사주 궁합 분석

📊 궁합도: 78/100
███████████████░░░░░

📝 종합 평가:
매우 좋은 궁합입니다. 서로를 존중하며 행복한 관계를 만들어갈 수 있습니다.

✨ 강점:
  • 일주 궁합이 좋아 기본적으로 잘 맞는 사이입니다
  • 오행이 조화로워 서로를 보완합니다
  • 결단력과 지혜가 어우러지는 이상적인 조합

⚠️ 약점:
  • 특별한 약점 없음

💡 조언:
  • 감정 교류를 더 자주 하세요
  • 서로의 차이를 인정하고 존중하는 자세가 필요합니다

🌟 오행 조화도: 75/100
서로의 부족한 점을 보완하는 좋은 관계입니다
```

---

#### 예시 4: 일일 운세

**사용자:**
> 오늘 운세 어때?

**AI 응답:**
```
🌅 2025-10-01 오늘의 운세

📊 종합 운: 75/100 😊

세부 운세:
  💰 재물운: 68/100 ⭐⭐⭐⭐⭐⭐☆☆☆☆
  💼 직업운: 82/100 ⭐⭐⭐⭐⭐⭐⭐⭐☆☆
  ❤️  건강운: 70/100 ⭐⭐⭐⭐⭐⭐⭐☆☆☆
  💕 애정운: 73/100 ⭐⭐⭐⭐⭐⭐⭐☆☆☆

🍀 오늘의 행운:
  • 색상: 백색
  • 방향: 서

💡 오늘의 조언:
오늘은 금 기운이 강한 날입니다. 의리하게 행동하세요.
```

---

#### 예시 5: 음양력 변환

**사용자:**
> 2025년 1월 29일은 음력으로 며칠이야?

**AI 응답:**
```
📅 음양력 변환 결과

양력 → 음력

입력: 2025-01-29 (양력)
결과: 2024-12-30 (음력)

절기: 대한
```

---

#### 예시 6: 직업운 상담

**사용자:**
> 내 직업운 봐주고, 어떤 직업이 잘 맞을지 알려줘

**AI 응답:**
```
🔮 직업운 분석

📊 운세 점수: 85/100

📝 종합 평가:
당신의 사주는 직업 선택에 있어 중요한 힌트를 제공합니다

✅ 긍정적 요소:
  • 지혜롭고 분석적인 사고력이 뛰어납니다

💡 조언:
  • 연구, IT, 학문 분야에서 성공할 수 있습니다

일주의 금 기운이 강하여 원칙적이고 결단력있는 성향을 보입니다.
법조계, 군인, 경영 분야에 특히 적합합니다.
```

---

#### 예시 7: 건강운 체크

**사용자:**
> 내 건강운 봐주고 주의할 점 알려줘

**AI 응답:**
```
🔮 건강운 분석

📊 운세 점수: 80/100

📝 종합 평가:
전반적으로 건강한 체질입니다

✅ 긍정적 요소:
  • 오행이 균형을 이루어 건강운이 좋습니다

⚠️ 주의할 점:
  • 특별히 주의할 점 없음

💡 조언:
  • 현재의 균형을 유지하며 꾸준히 노력하세요

규칙적인 생활 습관을 유지하면 더욱 건강한 삶을 영위할 수 있습니다.
```

---

#### 예시 8: 애정운 분석

**사용자:**
> 내 애정운 어때? 연애 조언 좀 해줘

**AI 응답:**
```
🔮 애정운 분석

📊 운세 점수: 72/100

📝 종합 평가:
당신만의 독특한 애정 스타일이 있습니다

✅ 긍정적 요소:
  • 진지하고 책임감있는 관계를 원합니다

💡 조언:
  • 융통성과 여유를 가지세요

금 기운이 강한 분은 원칙적이고 진지한 연애를 선호합니다.
상대방을 존중하되, 때로는 감정 표현을 더 풍부하게 하는 것이 좋습니다.
```

---

### 고급 사용법

#### 복합 질문

**사용자:**
> 나는 1988년 7월 3일 오후 3시생 남자야. 내 사주 보고, 2025년 재물운이랑 직업운도 같이 분석해줘.

AI가 자동으로:
1. `calculate_saju` - 사주 계산
2. `analyze_fortune` (wealth) - 재물운 분석
3. `analyze_fortune` (career) - 직업운 분석

세 가지를 순차적으로 실행하여 종합적인 답변을 제공합니다.

---

#### 음력 생일 사용

**사용자:**
> 나는 음력 1991년 9월 15일 새벽 5시에 태어났어. 사주 봐줘.

AI가 자동으로 음력을 양력으로 변환한 후 사주를 계산합니다.

---

#### 윤달 처리

**사용자:**
> 나는 음력 1990년 윤5월 3일생이야. 사주 알려줘.

AI가 윤달을 고려하여 정확한 사주를 계산합니다.

---

### 💡 사용 팁

1. **정확한 출생 시간이 중요합니다**: 시주(時柱)는 출생 시간에 따라 결정되므로 정확한 시간을 알려주세요.

2. **양력/음력 구분**: 한국에서는 전통적으로 음력을 많이 사용하지만, 요즘은 양력이 더 일반적입니다. 출생 증명서를 확인하세요.

3. **자연스러운 대화**: AI가 문맥을 이해하므로 자연스럽게 질문하세요.
   - ❌ "calculate_saju 1990-03-15 10:30 solar male"
   - ✅ "나는 1990년 3월 15일 오전 10시 30분생 남자야"

4. **반복 사용**: 한 번 사주를 계산하면 같은 대화 세션 내에서 다시 계산할 필요 없이 운세만 물어볼 수 있습니다.

---

## 10. 사주팔자 용어 설명

### 기본 구성 요소

#### 천간(天干) - 10개
갑(甲), 을(乙), 병(丙), 정(丁), 무(戊), 기(己), 경(庚), 신(辛), 임(壬), 계(癸)

#### 지지(地支) - 12개
자(子), 축(丑), 인(寅), 묘(卯), 진(辰), 사(巳), 오(午), 미(未), 신(申), 유(酉), 술(戌), 해(亥)

#### 오행(五行)
- **목(木)**: 나무, 성장, 확장
- **화(火)**: 불, 열정, 활동
- **토(土)**: 흙, 안정, 중심
- **금(金)**: 금속, 결단, 의리
- **수(水)**: 물, 지혜, 유연

**상생(相生) 관계**: 목→화→토→금→수→목 (서로 돕는 관계)
**상극(相剋) 관계**: 목→토→수→화→금→목 (서로 제어하는 관계)

#### 십성(十星) - 10가지 관계 유형
- **비견(比肩)**: 동료, 경쟁자
- **겁재(劫財)**: 재물을 빼앗는 자
- **식신(食神)**: 표현력, 창의성
- **상관(傷官)**: 재능, 비판 정신
- **편재(偏財)**: 유동 재산
- **정재(正財)**: 고정 재산
- **편관(偏官)**: 권력, 압박
- **정관(正官)**: 명예, 직위
- **편인(偏印)**: 지식, 학문
- **정인(正印)**: 학습, 보호

### 고급 분석 요소

#### 지장간(支藏干)
지지 속에 숨어있는 천간으로, 정기(正氣), 중기(中氣), 여기(餘氣) 3단계로 구성됩니다.

**절기별 세력 계산**:
- **당령(當令)**: 완벽한 일치 - 정기 90%, 중기 7%, 여기 3%
- **퇴기(退氣)**: 이전 달 - 정기 50%, 중기 30%, 여기 20%
- **진기(進氣)**: 다음 달 - 정기 60%, 중기 30%, 여기 10%
- **먼 시기**: 정기 40%, 중기 10%, 여기 5%

#### 신살(神殺) - 15개
길흉을 나타내는 특별한 별자리:

**길신(吉神)**:
- 천을귀인(天乙貴人): 귀인의 도움
- 천덕귀인(天德貴人): 하늘의 덕
- 월덕귀인(月德貴人): 달의 덕
- 문창귀인(文昌貴人): 학문 운

**흉신(凶神)**:
- 역마살(驛馬殺): 변동, 이동
- 도화살(桃花殺): 이성 관계
- 백호대살(白虎大殺): 재난
- 양인살(羊刃殺): 폭력성
- 원진살(怨嗔殺): 원한, 분노
- 귀문관살(鬼門關殺): 귀신의 문

#### 용신(用神)
사주의 균형을 맞추는 핵심 오행으로, 4가지 선정 방법이 있습니다:

1. **강약용신**: 일간 강약에 따라 선정
2. **조후용신**: 계절의 한난조습 조절
3. **통관용신**: 충돌하는 오행 중재
4. **병약용신**: 사주 불균형 치료

#### 격국(格局)
사주의 전체적인 패턴과 성향을 나타냅니다:
- 정관격, 편관격, 정재격, 편재격, 식신격, 상관격 등

#### 대운(大運)
10년 단위의 큰 운세 흐름으로, 성별과 출생년도의 음양에 따라 순행 또는 역행합니다.

#### 진태양시(眞太陽時)
한국 표준시에서 -30분을 보정한 시간으로, 정확한 사주 계산을 위해 필수적입니다.

---

## 11. 문제 해결

### 문제 1: MCP 도구가 보이지 않음

**원인:** Claude Desktop이 설정을 제대로 읽지 못함

**해결 방법:**

1. **설정 파일 유효성 검사**
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python3 -m json.tool
   ```

   오류가 나오면 JSON 형식이 잘못된 것입니다. 쉼표, 중괄호 등을 확인하세요.

2. **Claude Desktop 완전 재시작**
   ```bash
   # 1. Claude Desktop 종료
   killall Claude

   # 2. 잠시 대기
   sleep 3

   # 3. Claude Desktop 재실행
   open -a Claude
   ```

3. **설정 파일 권한 확인**
   ```bash
   ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   읽기 권한이 있는지 확인하고, 없으면:
   ```bash
   chmod 644 ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

---

### 문제 2: "command not found" 오류

**원인:** npm 전역 설치가 제대로 안 됨

**해결 방법:**

1. **npm 전역 경로 확인**
   ```bash
   npm bin -g
   ```

2. **PATH에 추가** (출력된 경로가 PATH에 없는 경우)
   ```bash
   # ~/.zshrc 또는 ~/.bash_profile에 추가
   export PATH="$PATH:$(npm bin -g)"

   # 변경사항 적용
   source ~/.zshrc  # 또는 source ~/.bash_profile
   ```

3. **재설치**
   ```bash
   npm uninstall -g @hoshin/saju-mcp-server
   npm install -g @hoshin/saju-mcp-server
   ```

---

### 문제 3: 업데이트가 안 됨

**원인:** 캐시된 버전 사용 중

**해결 방법:**

```bash
# npx 캐시 정리
npx clear-npx-cache

# npm 캐시 정리
npm cache clean --force

# 재설치
npm uninstall -g @hoshin/saju-mcp-server
npm install -g @hoshin/saju-mcp-server
```

---

### 문제 4: KASI API 연결 오류

**원인:** 천문연 API 접근 제한 또는 네트워크 문제

**해결 방법:**

1. **인터넷 연결 확인**
   ```bash
   curl https://www.google.com
   ```

2. **API 상태 확인**
   Claude에게:
   ```
   get_api_status 도구로 KASI API 상태를 확인해줘
   ```

3. **대체 방법 사용**
   - 음력 날짜가 아닌 양력 날짜로 계산
   - 캐시된 절기 데이터 사용

---

### 문제 5: 성능 저하

**원인:** 캐시 또는 리소스 부족

**해결 방법:**

1. **캐시 통계 확인**
   ```
   get_api_status 도구로 상세 통계를 확인해줘
   ```

2. **Node.js 메모리 증가**
   ```json
   {
     "mcpServers": {
       "saju": {
         "command": "node",
         "args": [
           "--max-old-space-size=4096",
           "/path/to/fortuneteller/dist/index.js"
         ]
       }
     }
   }
   ```

---

## 12. 업데이트 및 제거

### 업데이트

#### npx 사용 시 (자동)
```bash
# 자동으로 최신 버전 사용, 별도 작업 불필요
```

#### 전역 설치 시 (수동)
```bash
# 최신 버전으로 업데이트
npm update -g @hoshin/saju-mcp-server

# 또는 완전 재설치
npm uninstall -g @hoshin/saju-mcp-server
npm install -g @hoshin/saju-mcp-server
```

### 버전 확인

```bash
# 설치된 버전 확인
npm list -g @hoshin/saju-mcp-server

# 최신 버전 확인
npm show @hoshin/saju-mcp-server version
```

### 완전 제거

```bash
# 1. npm 패키지 제거
npm uninstall -g @hoshin/saju-mcp-server

# 2. Claude Desktop 설정에서 제거
# claude_desktop_config.json에서 "saju" 항목 삭제

# 3. 캐시 정리
npm cache clean --force
npx clear-npx-cache

# 4. Claude Desktop 재시작
```

---

## 13. Docker 지원

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
# Smithery CLI 설치
npm install -g @smithery/cli

# MCP 서버 설치
smithery install saju-mcp-server --client claude
```

Smithery는 자동으로:
- npm 패키지 설치
- Claude Desktop 설정 추가
- 업데이트 관리

---

## 14. 개발자 가이드

### 프로젝트 구조

```
fortuneteller/
├── src/
│   ├── index.ts              # MCP 서버 진입점
│   ├── tools/                # MCP 도구 구현 (15개)
│   ├── lib/                  # 핵심 로직
│   │   ├── saju.ts           # 사주 계산 (진태양시 -30분 보정)
│   │   ├── calendar.ts       # 음양력 변환
│   │   ├── fortune.ts        # 운세 분석
│   │   ├── compatibility.ts  # 궁합 분석
│   │   ├── yongsin/          # 용신 알고리즘 시스템
│   │   └── interpreters/     # 해석 유파 시스템
│   ├── data/                 # 정적 데이터
│   └── types/                # 타입 정의
├── tests/                    # 테스트
├── docs/                     # 문서
└── package.json
```

### 개발 명령어

```bash
# 개발 모드 (hot reload)
npm run watch

# 린트 체크
npm run lint

# 코드 포맷팅
npm run format

# 테스트 실행
npm test

# 프로덕션 빌드
npm run build

# 빌드된 서버 실행
npm start

# API 문서 생성
npm run docs

# API 문서 로컬 서버 (http://localhost:8080)
npm run docs:serve
```

### MCP 서버 아키텍처

#### 진입점
[src/index.ts](src/index.ts) - `@modelcontextprotocol/sdk`로 15개 도구가 등록된 MCP 서버

#### 도구 등록 패턴
1. `src/tools/*.ts`에서 핸들러 import
2. `ListToolsRequestSchema` 핸들러에 도구 스키마 등록
3. `CallToolRequestSchema` switch문에서 도구 호출 라우팅
4. `{ content: [{ type: 'text', text: result }] }` 형태로 반환

---

## 15. 추가 리소스

### 문서
- 📕 [개발자 가이드](CLAUDE.md) - 개발 및 커스터마이징
- 📙 [배포 가이드](PUBLISHING.md) - npm 패키지 배포 방법
- 📓 [체크리스트](DEPLOYMENT_CHECKLIST.md) - 배포 전 확인사항
- 📚 [API 문서](docs/api/index.html) - TypeDoc 생성 API 레퍼런스
- 📋 [PRD](docs/PRD_fortuneteller_improvements.md) - 제품 개선 로드맵

### 커뮤니티
- 🐛 [이슈 제보](https://github.com/hjsh200219/fortuneteller/issues)
- 💬 [토론 참여](https://github.com/hjsh200219/fortuneteller/discussions)

### 라이센스
MIT License

### ⚠️ 면책 조항

이 서비스는 전통 사주팔자를 기반으로 한 참고용 정보를 제공합니다.
- 의학적, 법률적, 재정적 조언이 아닙니다
- 중요한 결정은 반드시 전문가와 상담하시기 바랍니다
- 운세는 개인의 노력과 선택에 따라 달라질 수 있습니다

---

## English

### ✨ Features

- **Saju (Four Pillars) Calculation**: Automatic calculation of 8 characters from birth date and time (with -30min true solar time correction)
- **Fortune Analysis**: Comprehensive analysis including personality, career, wealth, health, and love fortune
- **Compatibility Analysis**: Compatibility calculation and comparison between two people
- **Calendar Conversion**: Solar ↔ Lunar calendar conversion with leap month support
- **Time-based Fortune**: Daily, monthly, yearly, and 10-year major fortune cycles
- **Yong-sin Analysis**: Personalized advice on colors, directions, and careers
- **Interpretation Schools**: Compare 5 different school interpretations
- **Ji-jang-gan Strength**: Precise analysis with seasonal hidden stem strength calculation
- **Sin-sal Detection**: 15 special stars detection

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

### 🛠️ Available Tools (15 Total)

#### Basic Analysis (7 tools)
1. **calculate_saju** - Calculate Four Pillars from birth info
2. **analyze_fortune** - Analyze fortune (general/career/wealth/health/love)
3. **check_compatibility** - Analyze compatibility between two people
4. **convert_calendar** - Convert between solar and lunar calendars
5. **get_daily_fortune** - Get daily fortune for specific date
6. **get_dae_un** - Get 10-year major fortune cycles
7. **analyze_yong_sin** - Detailed Yong-sin analysis with advice

#### Time-based Fortune (4 tools)
8. **get_yearly_fortune** - Yearly fortune
9. **get_monthly_fortune** - Monthly fortune
10. **get_hourly_fortune** - Hourly fortune
11. **get_api_status** - KASI API status and cache stats

#### Interpretation System (4 tools)
12. **set_interpretation_settings** - Change interpretation settings
13. **get_interpretation_settings** - Get current settings
14. **compare_interpretation_schools** - Compare 5 school interpretations
15. **analyze_with_yongsin_method** - Analyze with specific Yong-sin method

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

**즐거운 사주팔자 분석 되세요! 🔮✨**

Made with ❤️ for Korean traditional fortune-telling
