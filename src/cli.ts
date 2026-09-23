/**
 * 로컬 CLI — MCP 서버 없이 도구 핸들러를 직접 호출한다.
 *   node saju.mjs <tool> '<json-args>'
 */
import { handleToolCall } from './core/tool-handler.js';

const [name, raw] = process.argv.slice(2);
if (!name) {
  console.error(
    'usage: saju.mjs <analyze_saju|check_compatibility|get_dae_un|get_fortune_by_period|get_daily_fortune|convert_calendar> <json-args>'
  );
  process.exit(2);
}
handleToolCall(name, raw ? JSON.parse(raw) : {})
  .then((out) => {
    console.log(out);
    process.exit(0);
  })
  .catch((e: Error) => {
    console.error(e.message);
    process.exit(1);
  });
