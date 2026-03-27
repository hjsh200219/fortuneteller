# Development Patterns

> 이 프로젝트의 코딩 패턴 및 주의사항

## 새 MCP 도구 추가 패턴

1. `src/tools/new_tool.ts`에 타입 인터페이스 + 핸들러 생성
2. `src/core/tool-definitions.ts`의 `TOOL_DEFINITIONS`에 스키마 추가
3. `src/core/tool-handler.ts`의 `handleToolCall()` switch에 case 추가
4. `src/tools/index.ts`에서 export
5. 재빌드 및 테스트

## 스키마-핸들러 일관성

스키마의 `properties` 필드와 핸들러 `Args` 인터페이스가 1:1 대응해야 함.
`default` 있는 필드는 인터페이스에서 optional(`?`) + destructuring 기본값.

```typescript
// 스키마: default: 'solar'
calendar?: CalendarType;           // optional
const { calendar = 'solar' } = args; // 기본값
```

## 날짜/시간 파싱 검증 필수

문자열 파싱 시 반드시 형식/범위 검증:
- YYYY-MM: `split('-')` 후 length 2 확인, month 1-12
- YYYY-MM-DD HH:mm: `split(' ')` 후 length 2, hour 0-23
- 에러 메시지는 한국어 + 올바른 형식 안내

## 오행 관계 API (`src/data/wuxing.ts`)

- `getGeneratingElement()` - 생(生)하는 오행
- `getGeneratedElement()` - 생(生)받는 오행
- `getControllingElement()` - 극(克)하는 오행
- `getControlledElement()` - 극(克)받는 오행
- `getWeakeningElement()` - 설(洩)하는 오행

## 달력 변환 API (`src/lib/calendar.ts`)

동기 함수 (외부 API 없음, 로컬 테이블 1900-2200):
```typescript
const result = convertCalendar('2025-01-01', 'solar', 'lunar');
```

직접 테이블 사용:
```typescript
import { solarToLunarLocal, lunarToSolarLocal } from '../data/lunar_table.js';
const lunar = solarToLunarLocal(2025, 1, 1);       // → { year, month, day, isLeapMonth }
const solar = lunarToSolarLocal(2025, 1, 1, false); // → { year, month, day }
```
