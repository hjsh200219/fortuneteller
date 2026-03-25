/**
 * Railway 배포용 HTTP 서버 엔트리포인트
 * SSE(Server-Sent Events) 트랜스포트를 사용한 MCP 서버
 */

import http from 'node:http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMCPServer } from './core/server.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

// 활성 트랜스포트 추적
const transports = new Map<string, SSEServerTransport>();

const httpServer = http.createServer(async (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 헬스 체크
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'saju-mcp-server' }));
    return;
  }

  // SSE 연결 (GET /sse)
  if (req.method === 'GET' && req.url === '/sse') {
    const server = createMCPServer();
    const transport = new SSEServerTransport('/messages', res);
    transports.set(transport.sessionId, transport);

    res.on('close', () => {
      transports.delete(transport.sessionId);
    });

    await server.connect(transport);
    return;
  }

  // 메시지 수신 (POST /messages)
  if (req.method === 'POST' && req.url?.startsWith('/messages')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId || !transports.has(sessionId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '유효하지 않은 세션입니다' }));
      return;
    }

    const transport = transports.get(sessionId)!;
    await transport.handlePostMessage(req, res);
    return;
  }

  // 루트 경로 안내
  if (req.method === 'GET' && (req.url === '/' || req.url === '')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'saju-mcp-server',
      description: '한국 전통 사주팔자 운세 분석 MCP 서버',
      endpoints: {
        sse: '/sse',
        messages: '/messages',
        health: '/health',
      },
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`사주 MCP 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`SSE 엔드포인트: http://0.0.0.0:${PORT}/sse`);
});

process.on('SIGINT', () => {
  httpServer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  httpServer.close();
  process.exit(0);
});
