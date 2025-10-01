/**
 * analyze_fortune 도구 구현
 */

import { analyzeFortune } from '../lib/fortune.js';
import type { SajuData, FortuneAnalysisType } from '../types/index.js';

export interface AnalyzeFortuneArgs {
  sajuData: SajuData;
  analysisType: FortuneAnalysisType;
  targetDate?: string;
}

export function handleAnalyzeFortune(args: AnalyzeFortuneArgs): string {
  // 입력 검증
  if (!args.sajuData) {
    throw new Error('사주 데이터가 필요합니다. 먼저 calculate_saju를 실행하세요.');
  }

  // 운세 분석
  const analysis = analyzeFortune(args.sajuData, args.analysisType, args.targetDate);

  // 결과 포맷팅
  const formatted = `
🔮 ${getAnalysisTypeKorean(args.analysisType)} 분석

📊 운세 점수: ${analysis.score}/100

📝 종합 평가:
${analysis.summary}

✅ 긍정적 요소:
${analysis.details.positive.map((p) => `  • ${p}`).join('\n')}

⚠️ 주의할 점:
${analysis.details.negative.length > 0 ? analysis.details.negative.map((n) => `  • ${n}`).join('\n') : '  • 특별히 주의할 점 없음'}

💡 조언:
${analysis.details.advice.map((a) => `  • ${a}`).join('\n')}

${analysis.luckyElements ? `
🍀 행운의 요소:
  • 색상: ${analysis.luckyElements.colors?.join(', ') || '없음'}
  • 방향: ${analysis.luckyElements.directions?.join(', ') || '없음'}
  • 숫자: ${analysis.luckyElements.numbers?.join(', ') || '없음'}
` : ''}
  `.trim();

  return JSON.stringify(
    {
      success: true,
      data: analysis,
      formatted,
    },
    null,
    2
  );
}

function getAnalysisTypeKorean(type: FortuneAnalysisType): string {
  const map: Record<FortuneAnalysisType, string> = {
    general: '종합 운세',
    career: '직업운',
    wealth: '재물운',
    health: '건강운',
    love: '애정운',
  };
  return map[type];
}

