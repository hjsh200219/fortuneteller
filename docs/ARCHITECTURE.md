# Architecture

> fortuneteller - 한국 전통 사주팔자 MCP 서버

## 도메인 맵

```
fortuneteller/
├── src/
│   ├── index.ts              # 진입점 (stdio transport)
│   ├── server-http.ts        # HTTP transport (Railway 배포)
│   ├── smithery.ts           # Smithery 통합
│   │
│   ├── core/                 # [L1] MCP 프레임워크 레이어
│   │   ├── server.ts         #   서버 인스턴스 생성 + 핸들러 등록
│   │   ├── tool-definitions.ts #  7개 도구 스키마 정의
│   │   └── tool-handler.ts   #   도구 이름 → 핸들러 라우팅
│   │
│   ├── schemas/              # [L1.5] Zod 스키마 (입력 검증)
│   │   └── index.ts
│   │
│   ├── tools/                # [L2] 도구 핸들러 레이어 (7개)
│   │   ├── analyze_saju.ts   #   사주 분석 통합 (basic/fortune/yongsin/school_compare/yongsin_method)
│   │   ├── check_compatibility.ts
│   │   ├── convert_calendar.ts
│   │   ├── get_daily_fortune.ts
│   │   ├── get_dae_un.ts
│   │   ├── get_fortune_by_period.ts
│   │   ├── manage_settings.ts
│   │   └── index.ts          #   통합 export
│   │
│   ├── lib/                  # [L3] 비즈니스 로직 레이어
│   │   ├── saju.ts           #   ** 메인 조율자 ** (10단계 파이프라인)
│   │   ├── calendar.ts       #   음양력 변환
│   │   ├── ten_gods.ts       #   십성 계산
│   │   ├── sin_sal.ts        #   신살 탐지
│   │   ├── day_master_strength.ts # 일간 강약
│   │   ├── gyeok_guk.ts      #   격국 결정
│   │   ├── yong_sin.ts       #   용신 선정
│   │   ├── dae_un.ts         #   대운 계산
│   │   ├── fortune.ts        #   운세 해석
│   │   ├── compatibility.ts  #   궁합 분석
│   │   ├── career_matcher.ts #   직업 매칭
│   │   ├── career_recommendation.ts # 직업 추천
│   │   ├── school_comparator.ts #  유파 비교
│   │   ├── school_interpreter.ts # 유파 해석 인터페이스
│   │   ├── interpretation_settings.ts # 설정 (싱글톤)
│   │   ├── daeun_analysis.ts #   대운 분석
│   │   ├── seyun_analysis.ts #   세운 분석
│   │   ├── wolun_analysis.ts #   월운 분석
│   │   ├── iljin_analysis.ts #   일진 분석
│   │   ├── se_un.ts          #   세운 계산
│   │   ├── wol_un.ts         #   월운 계산
│   │   ├── si_un.ts          #   시운 계산
│   │   ├── taekil_recommendation.ts # 택일
│   │   ├── jakmeong_analysis.ts #  작명
│   │   ├── pungsu_advice.ts  #   풍수
│   │   ├── timing_advice.ts  #   시기 조언
│   │   ├── leap_month_analysis.ts # 윤달
│   │   ├── unified_data_query.ts # 통합 데이터 쿼리
│   │   ├── jijanggan_precise.ts # 지장간 정밀 계산
│   │   ├── comprehensive_validation.ts # 종합 검증
│   │   ├── validation.ts     #   입력 검증
│   │   ├── constants.ts      #   상수
│   │   ├── helpers.ts        #   공통 유틸
│   │   ├── error_handler.ts  #   에러 처리
│   │   ├── api_cache.ts      #   API 캐시
│   │   ├── performance_cache.ts # 성능 캐시
│   │   │
│   │   ├── yongsin/          # [L3.1] 용신 알고리즘 서브시스템
│   │   │   ├── base.ts       #   공통 인터페이스
│   │   │   ├── strength_algorithm.ts  # 강약용신
│   │   │   ├── seasonal_algorithm.ts  # 조후용신
│   │   │   ├── mediation_algorithm.ts # 통관용신
│   │   │   ├── disease_algorithm.ts   # 병약용신
│   │   │   ├── selector.ts   #   통합 선택기
│   │   │   └── index.ts
│   │   │
│   │   └── interpreters/     # [L3.2] 해석 유파 서브시스템
│   │       ├── ziping_interpreter.ts  # 자평명리
│   │       ├── modern_interpreter.ts  # 현대명리
│   │       └── index.ts      #   적천수, 궁통보감, 신살중심 포함
│   │
│   ├── data/                 # [L4] 정적 데이터 레이어
│   │   ├── heavenly_stems.ts #   천간 10개
│   │   ├── earthly_branches.ts # 지지 12개 + 지장간
│   │   ├── wuxing.ts         #   오행 관계
│   │   ├── solar_terms.ts    #   절기 통합 (1900-2200)
│   │   ├── lunar_table.ts    #   음력 통합 (1900-2200)
│   │   ├── longitude_table.ts # 162개 시군구 경도
│   │   ├── modern_careers.ts #   500+ 직업 DB
│   │   ├── school_presets.ts #   유파 프리셋
│   │   ├── daeun_reference_table.ts # 대운 참조
│   │   ├── jijanggan_strength_table.ts # 지장간 세력
│   │   ├── manselyeok_table.ts # 만세력
│   │   └── (연도별 분할 테이블 8개)
│   │
│   ├── types/                # [L5] 타입 정의 레이어
│   │   ├── index.ts          #   SajuData, Pillar, 리터럴 타입
│   │   └── interpretation.ts #   해석 관련 타입
│   │
│   ├── utils/                # [L5] 유틸리티 레이어
│   │   └── date.ts           #   진태양시 보정
│   │
│   ├── benchmark/            # 성능 벤치마크
│   │   └── index.ts
│   │
│   └── scripts/              # 검증/생성 스크립트
│       ├── generate_verification_data.ts
│       ├── performance_test.ts
│       ├── validate_accuracy.ts
│       └── validate_comprehensive.ts
│
├── tests/                    # 테스트
│   ├── jdn-verification.test.ts
│   ├── kasi-anchor-verification.test.ts
│   └── solar-terms-verification.test.ts
│
├── examples/                 # 사용 예시
├── dist/                     # 빌드 출력 (ES2022)
└── docs/                     # 문서 (이 디렉터리)
```

## 레이어 구조 및 의존성 방향

```
[진입점] index.ts / server-http.ts
    ↓
[L1] core/        MCP 프레임워크 (서버, 스키마 정의, 라우팅)
    ↓
[L2] tools/       도구 핸들러 (입력 변환 + lib 호출 + 결과 직렬화)
    ↓
[L3] lib/         비즈니스 로직 (사주 계산, 운세, 궁합, 해석)
    ↓              ├── yongsin/      용신 알고리즘 4종
    ↓              └── interpreters/ 해석 유파 5종
[L4] data/        정적 데이터 (천간, 지지, 절기, 음력, 경도)
    ↓
[L5] types/ + utils/   타입 정의 + 유틸리티 (모든 레이어에서 참조 가능)
```

**의존성 규칙**: 상위 → 하위 방향만 허용. 같은 레이어 내 참조는 허용.

| From \ To | core | tools | lib | data | types/utils |
|-----------|------|-------|-----|------|-------------|
| core      | -    | x     | x   | O    | O           |
| tools     | x    | -     | O   | O    | O           |
| lib       | x    | x     | O   | O    | O           |
| data      | x    | x     | x   | O    | O           |
| types     | x    | x     | x   | x    | O           |

> `core → data` 참조는 `tool-definitions.ts`가 스키마만 정의하므로 허용.

## 핵심 파이프라인: 사주 계산 (10단계)

```
입력: birthDate, birthTime, calendar, isLeapMonth, gender, birthCity
                                    ↓
[1] calendar.ts          음력 → 양력 변환 (필요시)
                                    ↓
[2] utils/date.ts        진태양시 보정 (썸머타임 + 경도)
                                    ↓
[3] saju.ts              4기둥 계산 (년 → 월 → 일 → 시)
                                    ↓
[4] earthly_branches.ts  지장간 세력 계산 (당령/퇴기/진기)
                                    ↓
[5] saju.ts              오행 개수 집계 (wuxingCount)
                                    ↓
[6] ten_gods.ts          십성 분석
                                    ↓
[7] sin_sal.ts           신살 탐지 (15종)
                                    ↓
[8] day_master_strength.ts 일간 강약 평가
                                    ↓
[9] gyeok_guk.ts         격국 결정
                                    ↓
[10] yong_sin.ts         용신 선정 (4개 알고리즘 → selector)
                                    ↓
출력: SajuData (완전한 사주 분석 결과)
```

**불변 규칙**: 각 단계는 이전 단계 결과에 의존. 순서 변경/건너뛰기 금지.

## 주요 서브시스템

### 용신 알고리즘 (`lib/yongsin/`)
4개 독립 알고리즘이 `selector.ts`에서 통합:
- **강약용신** (strength) - 일간 강약 기반
- **조후용신** (seasonal) - 계절 한난조습 보정
- **통관용신** (mediation) - 충돌 오행 중재
- **병약용신** (disease) - 사주 불균형 치료

### 해석 유파 (`lib/interpreters/`)
5개 유파별 해석기:
- 자평명리 (정통), 현대명리 (실용), 적천수, 궁통보감, 신살중심

### 운세 시스템 (`lib/`)
시간 단위별 독립 모듈:
- 대운(10년) → 세운(연) → 월운 → 일진 → 시운

## 외부 의존성

| 패키지 | 용도 |
|--------|------|
| `@modelcontextprotocol/sdk` | MCP 프로토콜 |
| `@smithery/sdk` | Smithery 배포 |
| `date-fns` / `date-fns-tz` | 날짜 처리 + 타임존 |
| `zod` | 입력 스키마 검증 |

외부 API 의존성: **없음** (모든 데이터 로컬 테이블 기반, 1900-2200)
