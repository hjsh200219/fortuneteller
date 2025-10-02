/**
 * analyze_yong_sin 도구 핸들러
 * 용신(用神) 상세 분석 및 조언 제공
 */

import { calculateSaju } from '../lib/saju.js';
import { selectYongSin, generateYongSinAdvice } from '../lib/yong_sin.js';
import type { CalendarType, Gender } from '../types/index.js';

export interface AnalyzeYongSinArgs {
  birthDate: string;
  birthTime: string;
  calendar: CalendarType;
  isLeapMonth: boolean;
  gender: Gender;
}

export function handleAnalyzeYongSin(args: AnalyzeYongSinArgs): string {
  try {
    const { birthDate, birthTime, calendar, isLeapMonth, gender } = args;

    // 1. 사주 계산
    const sajuData = calculateSaju(birthDate, birthTime, calendar, isLeapMonth, gender);

    // 2. 용신 분석
    const yongSinAnalysis = selectYongSin(sajuData);

    // 3. 결과 포맷팅
    let result = `# 용신(用神) 분석 결과\n\n`;

    result += `## 일간 강약\n`;
    result += `**레벨**: ${
      yongSinAnalysis.dayMasterStrength === 'very_strong'
        ? '매우 강함'
        : yongSinAnalysis.dayMasterStrength === 'strong'
        ? '강함'
        : yongSinAnalysis.dayMasterStrength === 'medium'
        ? '중화'
        : yongSinAnalysis.dayMasterStrength === 'weak'
        ? '약함'
        : '매우 약함'
    }\n\n`;

    result += `## 용신 선정\n\n`;
    result += `### 주 용신: ${yongSinAnalysis.primaryYongSin} 오행\n`;
    if (yongSinAnalysis.secondaryYongSin) {
      result += `### 보조 용신: ${yongSinAnalysis.secondaryYongSin} 오행\n`;
    }
    result += `\n**선정 이유**: ${yongSinAnalysis.reasoning}\n\n`;

    result += `### 희신(喜神) - 용신을 돕는 오행\n`;
    result += yongSinAnalysis.xiSin.join(', ') + '\n\n';

    result += `### 기신(忌神) - 피해야 할 오행\n`;
    result += yongSinAnalysis.jiSin.join(', ') + '\n\n';

    result += `### 수신(仇神) - 용신을 극하는 오행\n`;
    result += yongSinAnalysis.chouSin.join(', ') + '\n\n';

    result += `## 용신 기반 추천사항\n\n`;

    result += `### 🎨 길한 색상\n`;
    result += yongSinAnalysis.recommendations.colors.map((c) => `- ${c}`).join('\n') + '\n\n';

    result += `### 🧭 유리한 방향\n`;
    result += yongSinAnalysis.recommendations.directions.map((d) => `- ${d}`).join('\n') + '\n\n';

    result += `### 💼 적합한 직업\n`;
    result +=
      yongSinAnalysis.recommendations.careers.map((c) => `- ${c}`).join('\n') + '\n\n';

    result += `### ✨ 권장 활동\n`;
    result +=
      yongSinAnalysis.recommendations.activities.map((a) => `- ${a}`).join('\n') + '\n\n';

    result += `### ⚠️ 주의사항\n`;
    result +=
      yongSinAnalysis.recommendations.cautions.map((c) => `- ${c}`).join('\n') + '\n\n';

    result += `## 종합 조언\n\n`;
    const adviceList = generateYongSinAdvice(yongSinAnalysis);
    result += adviceList.map((advice) => `- ${advice}`).join('\n');

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return `오류가 발생했습니다: ${error.message}`;
    }
    return '알 수 없는 오류가 발생했습니다.';
  }
}
