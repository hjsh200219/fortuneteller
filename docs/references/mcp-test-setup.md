# MCP 서버 테스트 설정

## Claude Desktop 연동

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "saju": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/fortuneteller/src/index.ts"]
    }
  }
}
```

## 빌드 후 테스트

`npm run build` 실행 후:

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

## 지연 로딩 모드

```json
{
  "mcpServers": {
    "saju": {
      "command": "node",
      "args": ["/path/to/fortuneteller/dist/index.js"],
      "env": {
        "SAJU_LAZY_LOAD_SCHEMAS": "true"
      }
    }
  }
}
```

- `false` (기본값): 서버 시작 시 모든 도구 스키마 로드
- `true`: Tool Discovery 요청 시에만 스키마 생성 (메모리 효율적)
