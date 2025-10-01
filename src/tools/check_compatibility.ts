/**
 * check_compatibility 도구 구현
 */

import { checkCompatibility } from '../lib/compatibility.js';
import type { SajuData } from '../types/index.js';

export interface CheckCompatibilityArgs {
  person1: SajuData;
  person2: SajuData;
}

export function handleCheckCompatibility(args: CheckCompatibilityArgs): string {
  // 입력 검증
  if (!args.person1 || !args.person2) {
    throw new Error('두 사람의 사주 데이터가 모두 필요합니다.');
  }

  // 궁합 분석
  const compatibility = checkCompatibility(args.person1, args.person2);

  // 결과 포맷팅
  const formatted = `
💕 사주 궁합 분석

📊 궁합도: ${compatibility.compatibilityScore}/100
${getScoreBar(compatibility.compatibilityScore)}

📝 종합 평가:
${compatibility.summary}

✨ 강점:
${compatibility.strengths.map((s) => `  • ${s}`).join('\n')}

⚠️ 약점:
${compatibility.weaknesses.length > 0 ? compatibility.weaknesses.map((w) => `  • ${w}`).join('\n') : '  • 특별한 약점 없음'}

💡 조언:
${compatibility.advice.map((a) => `  • ${a}`).join('\n')}

🌟 오행 조화도: ${compatibility.elementHarmony.harmony}/100
${compatibility.elementHarmony.description}
  `.trim();

  return JSON.stringify(
    {
      success: true,
      data: compatibility,
      formatted,
    },
    null,
    2
  );
}

function getScoreBar(score: number): string {
  const filled = Math.floor(score / 5);
  const empty = 20 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

