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

### 절기 (solar_terms_1900_2200.ts)

```typescript
// 24절기 (1899 대설·동지·소한 + 1900-2200) — scripts/generate_solar_terms_skyfield.py 로 생성(JPL DE440)
// 연도 규약: year=Y 는 Y년 1월 대한 ~ Y+1년 1월 소한. 조회는 solar_terms.ts 의 getSolarTermsForYear.
interface SolarTermComplete {
  year: number;
  term: SolarTerm;
  datetime: string;          // ISO 8601 (KST)
  timestamp: number;         // Unix ms
  solarLongitude: number;    // 태양 황경(도)
}
```

### 음력 (lunar_table_1900_2200.ts)

```typescript
// 한국 음력 (1900-2200) — scripts/generate_lunar_table_skyfield.py 로 생성(JPL DE440 합삭·중기)
// 1900-2049 는 KASI 공표 음력과 전부 일치. 조회·변환은 lunar_table.ts.
interface LunarYearData {
  year: number;
  leapMonth: number;         // 0 = 없음, N = N월 뒤에 윤N월
  monthDays: number[];       // 윤달 포함 순서대로 달 일수
  totalDays: number;
  solarNewYear: string;      // 음력 1월 1일의 양력 날짜
}
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
