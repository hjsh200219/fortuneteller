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
    "fortuneteller": {
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
    "fortuneteller": {
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
    "fortuneteller": {
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

### 캐싱 활성화

향후 버전에서 사주 계산 결과를 캐싱하여 성능을 개선할 수 있습니다.

### 병렬 처리

여러 도구를 동시에 실행할 수 있도록 비동기 처리가 구현되어 있습니다.

## 보안

- 사주 데이터는 메모리에만 보관되며 영구 저장되지 않습니다
- 개인정보는 로그에 기록되지 않습니다
- MCP 프로토콜은 로컬 시스템에서만 작동합니다

## 다음 단계

1. ✅ 기본 사주 계산 완료
2. ✅ 운세 분석 완료
3. ✅ 궁합 분석 완료
4. 📝 더 정확한 음양력 변환 (한국천문연구원 API 연동)
5. 📝 십성(十星) 분석 추가
6. 📝 대운(大運) 계산 추가
7. 📝 타로, 별자리 등 다른 점술 추가

---

**문의사항이 있으면 이슈를 열어주세요!** 🙏

