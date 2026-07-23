import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { DESIGN_KIT_CSS_TOKENS, DESIGN_KIT_TOOL_NAME } from '../src/core/design-kit.js';
import { createMCPServer } from '../src/core/server.js';

describe('디자인 킷 도구 배선', () => {
  let client: Client;
  let server: ReturnType<typeof createMCPServer>;

  beforeEach(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    server = createMCPServer();
    client = new Client(
      { name: 'design-kit-test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  test('tools/list에 get_design_template이 노출된다', async () => {
    const result = await client.listTools();
    const names = result.tools.map((tool) => tool.name);

    expect(names).toContain(DESIGN_KIT_TOOL_NAME);
  });

  test('tools/call이 킷 문서를 반환한다', async () => {
    const result = (await client.callTool({
      name: DESIGN_KIT_TOOL_NAME,
      arguments: {},
    })) as CallToolResult;
    const content = result.content[0];

    if (!content || content.type !== 'text') {
      throw new Error('디자인 킷 결과가 텍스트가 아닙니다.');
    }

    expect(content.text).toContain(DESIGN_KIT_CSS_TOKENS);
    expect(content.text).toContain('saju-pillars');
  });

  test('도구 설명이 드라마투르기 프롬프트를 참조하지 않는다', async () => {
    const result = await client.listTools();
    const kitTool = result.tools.find((tool) => tool.name === DESIGN_KIT_TOOL_NAME);

    expect(kitTool).toBeDefined();
    expect(kitTool?.description).not.toContain('dramatic_saju_consultation');
  });
});
