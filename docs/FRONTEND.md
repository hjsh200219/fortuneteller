# Frontend / Interface

> fortuneteller는 MCP 프로토콜 서버로, 전통적인 프론트엔드 UI가 없음

## 인터페이스 방식

이 프로젝트는 프론트엔드 애플리케이션이 아닌 **MCP(Model Context Protocol) 도구 서버**이다.
사용자 인터페이스는 MCP 클라이언트(Claude Desktop, 기타 AI 어시스턴트)가 제공한다.

## MCP 프로토콜 인터페이스

### 지원 트랜스포트

| 트랜스포트 | 진입점 | 용도 |
|-----------|--------|------|
| stdio | `src/index.ts` | 로컬 실행 (Claude Desktop 연동) |
| HTTP/SSE | `src/server-http.ts` | 원격 배포 (Railway) |
| Smithery | `src/smithery.ts` | Smithery 플랫폼 배포 |

### 도구 스키마 (Tool Schema)

7개 MCP 도구는 `src/core/tool-definitions.ts`에서 Zod 기반 JSON Schema로 정의된다.
MCP 클라이언트는 `ListTools` 요청으로 도구 목록과 입력 스키마를 자동 탐색한다.

### 응답 형식

모든 도구 응답은 JSON 문자열로 직렬화되어 반환된다:

```json
{
  "content": [{ "type": "text", "text": "{...JSON결과...}" }]
}
```

에러 시:

```json
{
  "content": [{ "type": "text", "text": "{\"error\":true,\"message\":\"한국어 에러 메시지\"}" }],
  "isError": true
}
```

## HTTP 엔드포인트 (server-http.ts)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 서버 정보 + 엔드포인트 안내 |
| GET | `/health` | 헬스 체크 |
| GET | `/sse` | SSE 연결 시작 |
| POST | `/messages?sessionId=...` | MCP 메시지 수신 |

## 클라이언트 설정

> 상세: [references/mcp-test-setup.md](references/mcp-test-setup.md)

Claude Desktop 연동 설정 예시:
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
