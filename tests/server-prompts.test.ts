import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  DRAMATURGY_INSTRUCTIONS,
  DRAMATURGY_PROMPT_NAME,
} from '../src/core/dramaturgy-prompt.js';
import { createMCPServer } from '../src/core/server.js';

describe('MCP 드라마투르기 prompt 배선', () => {
  let client: Client;
  let server: ReturnType<typeof createMCPServer>;

  beforeEach(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    server = createMCPServer();
    client = new Client(
      { name: 'dramaturgy-test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  test('초기화 결과에 자동 지침과 prompts capability가 있다', () => {
    expect(client.getInstructions()).toBe(DRAMATURGY_INSTRUCTIONS);
    expect(client.getServerCapabilities()).toMatchObject({
      tools: {},
      prompts: {},
    });
  });

  test('prompt 목록에 dramatic_saju_consultation이 노출된다', async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toEqual([
      expect.objectContaining({
        name: DRAMATURGY_PROMPT_NAME,
        arguments: [
          expect.objectContaining({
            name: 'focus',
            required: false,
          }),
        ],
      }),
    ]);
  });

  test('prompt 조회 시 focus를 포함한 텍스트 메시지를 반환한다', async () => {
    const result = await client.getPrompt({
      name: DRAMATURGY_PROMPT_NAME,
      arguments: { focus: '연애 흐름' },
    });
    const message = result.messages[0];

    expect(message?.role).toBe('user');
    expect(message?.content.type).toBe('text');
    if (!message || message.content.type !== 'text') {
      throw new Error('드라마투르기 프롬프트가 텍스트를 반환하지 않았습니다.');
    }
    expect(message.content.text).toContain(JSON.stringify('연애 흐름'));
  });

  test('알 수 없는 prompt 이름은 한국어 오류로 거부한다', async () => {
    await expect(client.getPrompt({ name: 'unknown_prompt' })).rejects.toThrow(
      '알 수 없는 프롬프트: unknown_prompt'
    );
  });

  test('기존 계산 도구 결과는 서사 envelope 없이 원래 JSON을 유지한다', async () => {
    const result = (await client.callTool({
      name: 'analyze_saju',
      arguments: {
        birthDate: '1990-03-15',
        birthTime: '10:30',
        gender: 'male',
        analysisType: 'basic',
      },
    })) as CallToolResult;
    const content = result.content[0];

    if (!content || content.type !== 'text') {
      throw new Error('analyze_saju 결과가 텍스트 JSON이 아닙니다.');
    }

    const parsed = JSON.parse(content.text) as Record<string, unknown>;
    expect(parsed).toHaveProperty('year');
    expect(parsed).toHaveProperty('month');
    expect(parsed).toHaveProperty('day');
    expect(parsed).toHaveProperty('hour');
    expect(parsed).not.toHaveProperty('dramaturgy');
    expect(parsed).not.toHaveProperty('data');
  });
});
