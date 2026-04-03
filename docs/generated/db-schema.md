# Data Schema

> 정적 데이터 테이블 구조 (자동 생성 참조 문서)
> 이 프로젝트는 외부 DB를 사용하지 않으며, 모든 데이터는 TypeScript 정적 테이블로 내장됨

## 데이터 테이블 목록

### 천간 (heavenly_stems.ts)

```typescript
// 10개 천간 데이터
interface HeavenlyStemData {
  name: HeavenlyStem;        // '갑' | '을' | ... | '계'
  hanja: string;             // 한자
  element: WuXing;           // 오행
  yinYang: YinYang;          // 음양
  number: number;            // 순번 (0-9)
}
```

### 지지 (earthly_branches.ts)

```typescript
// 12개 지지 데이터 + 지장간
interface EarthlyBranchData {
  name: EarthlyBranch;       // '자' | '축' | ... | '해'
  hanja: string;
  element: WuXing;
  yinYang: YinYang;
  number: number;            // 순번 (0-11)
  jiJangGan: {               // 지장간 (숨은 천간)
    primary: HeavenlyStem;   // 정기
    secondary?: HeavenlyStem; // 중기
    residual?: HeavenlyStem; // 여기
  };
}
```

### 오행 관계 (wuxing.ts)

```typescript
// 5개 오행 간 상생/상극 관계
interface WuXingData {
  name: WuXing;              // '목' | '화' | '토' | '금' | '수'
  generates: WuXing;         // 생(生)하는 오행
  controls: WuXing;          // 극(克)하는 오행
  generatedBy: WuXing;       // 생(生)받는 오행
  controlledBy: WuXing;      // 극(克)받는 오행
}
```

### 절기 (solar_terms_*.ts)

```typescript
// 24절기 데이터 (1900-2200, 4개 파일로 분할)
// solar_terms_1900_2019.ts, solar_terms.ts (2020-2030)
// solar_terms_2031_2100.ts, solar_terms_2101_2200.ts
// + solar_terms_complete.ts (통합 조회)
type SolarTermEntry = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  term: SolarTerm;           // 24절기 중 하나
};
```

### 음력 (lunar_table_*.ts)

```typescript
// 음력 데이터 (1900-2200, 4개 파일로 분할)
// lunar_table_1900_2019.ts, lunar_table.ts (2020-2030)
// lunar_table_2031_2100.ts, lunar_table_2101_2200.ts
// + lunar_table_extended.ts (통합)
type LunarEntry = {
  year: number;
  months: number[];          // 각 월의 일수
  leapMonth: number;         // 윤달 (0이면 없음)
};
```

### 경도 (longitude_table.ts)

```typescript
// 162개 시군구 경도 데이터
// 진태양시 보정에 사용 (동경 135도 기준)
Record<string, number>       // { '서울': 126.978, '부산': 129.075, ... }
```

### 직업 DB (modern_careers.ts)

```typescript
// 500+ 직업 데이터
interface CareerData {
  name: string;              // 직업명
  elements: WuXing[];        // 관련 오행
  category: string;          // 분류
}
```

### 유파 프리셋 (school_presets.ts)

```typescript
// 5개 명리 해석 유파 설정
interface SchoolPreset {
  name: string;              // 유파명
  yongsinWeight: Record<string, number>;
  interpretationStyle: string;
}
```

### 대운 참조 (daeun_reference_table.ts)

```typescript
// 대운 계산 참조 테이블
// 만세력 기준 대운 시작점 데이터
```

### 지장간 세력 (jijanggan_strength_table.ts)

```typescript
// 지장간 당령/퇴기/진기 세력 비율 테이블
Record<EarthlyBranch, {
  primary: number;           // 정기 비율
  secondary?: number;        // 중기 비율
  residual?: number;         // 여기 비율
}>
```

### 만세력 (manselyeok_table.ts)

```typescript
// 만세력 테이블 (일주 계산용)
// 연도별 천간/지지 매핑
```

## 데이터 범위 요약

| 데이터 | 범위 | 파일 수 |
|--------|------|---------|
| 절기 | 1900-2200 | 5 |
| 음력 | 1900-2200 | 5 |
| 경도 | 162개 시군구 | 1 |
| 직업 | 500+ | 1 |
| 천간/지지/오행 | 고정 | 3 |
