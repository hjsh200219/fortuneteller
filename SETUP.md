# 🔧 사주 운세 MCP 서버 설정 가이드

## Claude Desktop에 MCP 서버 추가하기

### 1. MCP 서버 빌드

```bash
cd /Users/hoshin/workspace/fortuneteller
npm install
npm run build
```

### 2. Claude Desktop 설정 파일 열기

macOS:
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

파일이 없다면 생성하세요:
```bash
mkdir -p ~/Library/Application\ Support/Claude
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### 3. MCP 서버 추가

`claude_desktop_config.json`에 다음 내용을 추가하세요:

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

또는 개발 모드로 (hot reload):

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

### 4. Claude Desktop 재시작

설정을 적용하려면 Claude Desktop을 완전히 종료하고 다시 실행하세요.

## 사용 예시

### 1. 사주팔자 계산

```
나는 1990년 3월 15일 오전 10시 30분에 태어난 남자야. 내 사주를 알려줘.
```

AI가 자동으로 `calculate_saju` 도구를 사용하여 사주팔자를 계산합니다.

### 2. 운세 분석

```
내 재물운을 분석해줘
```

AI가 `analyze_fortune` 도구로 재물운을 분석합니다.

### 3. 궁합 보기

```
나랑 1992년 5월 20일 오후 2시생 여자랑 궁합 봐줘
```

AI가 두 사람의 사주를 계산하고 `check_compatibility`로 궁합을 분석합니다.

### 4. 음양력 변환

```
2025년 1월 15일은 음력으로 며칠이야?
```

AI가 `convert_calendar` 도구로 양력을 음력으로 변환합니다.

### 5. 일일 운세

```
오늘 운세 어때?
```

AI가 `get_daily_fortune` 도구로 오늘의 운세를 알려줍니다.

### 6. 대운(大運) 조회

```
내 대운을 보여줘
```

AI가 `get_dae_un` 도구로 10년 단위 대운을 조회합니다.

### 7. 용신(用神) 분석

```
내게 맞는 색상과 방향을 알려줘
```

AI가 `analyze_yong_sin` 도구로 맞춤형 조언(색상, 방향, 직업, 활동 등)을 제공합니다.

### 8. 연별 운세 (세운)

```
2025년 나의 운세를 알려줘
```

AI가 `get_yearly_fortune` 도구로 연별 운세를 조회합니다.

### 9. 월별 운세 (월운)

```
이번 달 운세 어때?
```

AI가 `get_monthly_fortune` 도구로 월별 운세를 조회합니다.

### 10. 시간대별 운세 (시운)

```
오후 2시부터 4시까지 운세 어때?
```

AI가 `get_hourly_fortune` 도구로 시간대별 운세를 조회합니다.

### 11. 해석 유파 비교

```
여러 유파에서 내 사주를 어떻게 해석하는지 비교해줘
```

AI가 `compare_interpretation_schools` 도구로 5개 유파의 해석을 비교합니다.

### 12. 특정 용신 방법으로 분석

```
조후용신 방법으로 내 사주를 분석하고 직업을 추천해줘
```

AI가 `analyze_with_yongsin_method` 도구로 특정 용신 방법론을 적용한 분석과 직업 추천을 제공합니다.

### 13. 해석 설정 변경

```
내 사주 해석을 현대 직업 중심으로 바꿔줘
```

AI가 `set_interpretation_settings` 도구로 해석 설정을 변경합니다.

## 문제 해결

### MCP 서버가 연결되지 않을 때

1. **빌드 확인**
   ```bash
   cd /Users/hoshin/workspace/fortuneteller
   npm run build
   ```

2. **경로 확인**
   - `claude_desktop_config.json`의 경로가 정확한지 확인
   - 절대 경로를 사용하세요

3. **Claude Desktop 로그 확인**
   - macOS: `~/Library/Logs/Claude/`

4. **수동 테스트**
   ```bash
   node /Users/hoshin/workspace/fortuneteller/dist/index.js
   ```
   
   정상적이면 서버가 시작되고 대기 상태가 됩니다.

### 개발 중 코드 변경 시

개발 모드를 사용하면 코드 변경 시 자동으로 재시작됩니다:

```json
{
  "mcpServers": {
    "saju": {
      "command": "npx",
      "args": ["-y", "tsx", "watch", "/Users/hoshin/workspace/fortuneteller/src/index.ts"]
    }
  }
}
```

## 디버깅

### 1. 개발 모드로 실행

```bash
cd /Users/hoshin/workspace/fortuneteller
npm run dev
```

### 2. 로그 확인

MCP 서버는 표준 입출력을 사용하므로, 디버그 정보는 Claude Desktop 로그에서 확인할 수 있습니다.

### 3. VS Code 디버거 사용

VS Code에서 F5를 누르면 디버거가 실행됩니다. (`.vscode/launch.json` 설정 완료)

## 성능 최적화

### 캐싱 시스템

사주 계산 결과 캐싱이 활성화되어 있습니다. 동일한 생년월일시 조회 시 캐시된 결과를 반환합니다.

### 병렬 처리

여러 도구를 동시에 실행할 수 있도록 비동기 처리가 구현되어 있습니다.

## 보안

- 사주 데이터는 메모리에만 보관되며 영구 저장되지 않습니다
- 개인정보는 로그에 기록되지 않습니다
- MCP 프로토콜은 로컬 시스템에서만 작동합니다

## 구현 완료 기능

### 핵심 계산
1. ✅ 사주팔자 계산 (진태양시 -30분 보정)
2. ✅ 음양력 변환 (윤달 처리 포함)
3. ✅ 천간지지, 오행, 음양 분석

### 고급 분석
4. ✅ 십성(十星) 분석 완료
5. ✅ 신살(神殺) 15개 탐지 (원진살, 귀문관살 포함)
6. ✅ 지장간(支藏干) 세력 계산 (절기별)
7. ✅ 일간 강약 평가
8. ✅ 격국(格局) 결정
9. ✅ 용신(用神) 선정

### MCP 도구 (총 15개)

#### 기본 사주 분석 (7개)
10. ✅ calculate_saju - 사주팔자 계산
11. ✅ analyze_fortune - 운세 분석 (전반/직업/재물/건강/애정)
12. ✅ check_compatibility - 궁합 분석
13. ✅ convert_calendar - 양력/음력 변환
14. ✅ get_daily_fortune - 일일 운세
15. ✅ get_dae_un - 대운(大運) 조회
16. ✅ analyze_yong_sin - 용신 상세 분석 및 조언

#### 시간대별 운세 (4개)
17. ✅ get_yearly_fortune - 세운(歲運) 연별 운세
18. ✅ get_monthly_fortune - 월운(月運) 월별 운세
19. ✅ get_hourly_fortune - 시운(時運) 시간대별 운세
20. ✅ get_api_status - KASI API 상태 조회

#### 해석 유파 시스템 (4개)
21. ✅ set_interpretation_settings - 해석 설정 변경
22. ✅ get_interpretation_settings - 현재 설정 조회
23. ✅ compare_interpretation_schools - 5개 유파 비교 (자평명리, 적천수, 궁통보감, 현대명리, 신살중심)
24. ✅ analyze_with_yongsin_method - 4가지 용신 방법론 분석 (강약용신, 조후용신, 통관용신, 병약용신)

### 추가 구현 완료 사항
25. ✅ 500+ 현대 직업 데이터베이스 (십성/오행 매핑)
26. ✅ 직업 매칭 엔진 (가중치 기반 매칭)
27. ✅ 유파별 해석 시스템 (5개 유파)
28. ✅ 4가지 용신 알고리즘
29. ✅ 해석 설정 관리 시스템 (프리셋/커스텀)
30. ✅ 유파 비교 및 추천 엔진

## 향후 개선 사항

1. 📝 더 정확한 음양력 변환 (한국천문연구원 API 개선)
2. 📝 AI 기반 운세 해석 고도화
3. 📝 타로, 별자리 등 다른 점술 추가
4. 📝 사용자별 운세 히스토리 관리

---

**문의사항이 있으면 이슈를 열어주세요!** 🙏

