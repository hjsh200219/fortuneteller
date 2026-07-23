import {
  DRAMATURGY_EXCLUDED_TOOLS,
  DRAMATURGY_PROMPT_NAME,
  DRAMATURGY_SUPPORTED_TOOLS,
} from '../src/core/dramaturgy-prompt.js';
import { getToolSchema } from '../src/core/tool-definitions.js';

describe('도구 discovery의 드라마투르기 적용 경계', () => {
  test.each(DRAMATURGY_SUPPORTED_TOOLS)('%s 설명은 드라마투르기 prompt를 참조한다', (toolName) => {
    const schema = getToolSchema(toolName);

    expect(schema).toBeDefined();
    expect(schema?.description).toContain(DRAMATURGY_PROMPT_NAME);
  });

  test.each(DRAMATURGY_EXCLUDED_TOOLS)('%s 설명은 드라마투르기 prompt를 참조하지 않는다', (toolName) => {
    const schema = getToolSchema(toolName);

    expect(schema).toBeDefined();
    expect(schema?.description).not.toContain(DRAMATURGY_PROMPT_NAME);
  });
});
