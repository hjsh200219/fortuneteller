/**
 * 사주 시각화 디자인 킷
 * 기본 디자인 구조(토큰·컴포넌트·지침)의 단일 소스.
 * 서버는 구조만 제공하고, 데이터 주입과 확장은 클라이언트 LLM이 수행한다.
 */

export const DESIGN_KIT_TOOL_NAME = 'get_design_template' as const;

export const DESIGN_KIT_CSS_TOKENS = `:root {
  --saju-bg: #faf6ee;
  --saju-surface: #fffdf7;
  --saju-ink: #2b2620;
  --saju-ink-soft: #6b6257;
  --saju-line: #d9d0bf;
  --saju-accent: #8c1f28;
  --saju-wood: #2e7d4f;
  --saju-fire: #c0392b;
  --saju-earth: #b8860b;
  --saju-metal: #8a8f98;
  --saju-water: #1f5fa8;
  --saju-radius: 12px;
  --saju-gap: 16px;
  --saju-font: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --saju-bg: #1c1a17;
    --saju-surface: #26231f;
    --saju-ink: #ece5d8;
    --saju-ink-soft: #a89e90;
    --saju-line: #453f37;
    --saju-accent: #d4737b;
    --saju-metal: #aab0b8;
  }
}` as const;

export const DESIGN_KIT_COMPONENTS = `<style>
  body { background: var(--saju-bg); color: var(--saju-ink); font-family: var(--saju-font); margin: 0; padding: var(--saju-gap); }
  .saju-el-wood { color: var(--saju-wood); border-color: var(--saju-wood); }
  .saju-el-fire { color: var(--saju-fire); border-color: var(--saju-fire); }
  .saju-el-earth { color: var(--saju-earth); border-color: var(--saju-earth); }
  .saju-el-metal { color: var(--saju-metal); border-color: var(--saju-metal); }
  .saju-el-water { color: var(--saju-water); border-color: var(--saju-water); }

  .saju-pillars { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--saju-gap); }
  .saju-pillar { background: var(--saju-surface); border: 1px solid var(--saju-line); border-radius: var(--saju-radius); padding: 12px; text-align: center; }
  .saju-pillar-label { display: block; font-size: 12px; color: var(--saju-ink-soft); margin-bottom: 8px; }
  .saju-stem, .saju-branch { display: block; font-size: 28px; font-weight: 700; border-bottom: 3px solid transparent; padding: 4px 0; }

  .saju-wuxing { display: grid; gap: 6px; }
  .saju-wuxing-row { display: grid; grid-template-columns: 64px 1fr 32px; align-items: center; gap: 8px; font-size: 13px; }
  .saju-wuxing-bar { height: 12px; border-radius: 6px; background: currentColor; }

  .saju-gauge { background: var(--saju-surface); border: 1px solid var(--saju-line); border-radius: var(--saju-radius); padding: 12px; }
  .saju-gauge-track { height: 10px; border-radius: 5px; background: var(--saju-line); overflow: hidden; }
  .saju-gauge-fill { height: 100%; background: var(--saju-accent); }

  .saju-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .saju-tag { border: 1px solid var(--saju-line); border-radius: 999px; padding: 3px 10px; font-size: 12px; background: var(--saju-surface); }

  .saju-daeun { display: flex; gap: 6px; overflow-x: auto; }
  .saju-daeun-item { min-width: 72px; text-align: center; border: 1px solid var(--saju-line); border-radius: var(--saju-radius); padding: 8px; background: var(--saju-surface); font-size: 12px; }
  .saju-daeun-item.is-current { border-color: var(--saju-accent); box-shadow: inset 0 0 0 1px var(--saju-accent); }

  .saju-card { background: var(--saju-surface); border: 1px solid var(--saju-line); border-radius: var(--saju-radius); padding: var(--saju-gap); margin: var(--saju-gap) 0; }
  .saju-card-title { margin: 0 0 8px; font-size: 15px; }
  .saju-card-footnote { margin-top: 10px; font-size: 11px; color: var(--saju-ink-soft); }
</style>

<!-- [1] 사주판 4기둥 그리드: 년/월/일/시 순. 천간·지지에 오행 클래스(saju-el-*) 부여 -->
<section class="saju-pillars">
  <div class="saju-pillar">
    <span class="saju-pillar-label"><!-- slot: 년주/월주/일주/시주 --></span>
    <span class="saju-stem"><!-- slot: 천간 한글(한자), class에 saju-el-* 추가 --></span>
    <span class="saju-branch"><!-- slot: 지지 한글(한자), class에 saju-el-* 추가 --></span>
  </div>
  <!-- 기둥 4개 반복 -->
</section>

<!-- [2] 오행 분포 바: wuxingCount 비례. 행 색은 saju-el-* -->
<div class="saju-wuxing">
  <div class="saju-wuxing-row saju-el-wood">
    <span><!-- slot: 오행 이름 --></span>
    <div class="saju-wuxing-bar" style="width: 0%"><!-- slot: width를 (개수/8*100)%로 --></div>
    <span><!-- slot: 개수 --></span>
  </div>
  <!-- 오행 5행 반복 -->
</div>

<!-- [3] 점수 게이지: 0-100 점수(운세·궁합) -->
<div class="saju-gauge">
  <span><!-- slot: 항목 이름 --></span>
  <div class="saju-gauge-track"><div class="saju-gauge-fill" style="width: 0%"><!-- slot: width를 점수%로 --></div></div>
</div>

<!-- [4] 십성 태그 목록 -->
<div class="saju-tags">
  <span class="saju-tag"><!-- slot: 십성 이름 × 개수, 필요한 만큼 반복 --></span>
</div>

<!-- [5] 대운 타임라인: 10년 구간, 현재 구간에 is-current 클래스 -->
<div class="saju-daeun">
  <div class="saju-daeun-item">
    <div><!-- slot: 나이 구간 --></div>
    <div><!-- slot: 간지 --></div>
  </div>
  <!-- 구간 반복 -->
</div>

<!-- [6] 섹션 카드: 해석 본문 + 근거 각주 -->
<article class="saju-card">
  <h3 class="saju-card-title"><!-- slot: 제목 --></h3>
  <p><!-- slot: 본문 --></p>
  <p class="saju-card-footnote"><!-- slot: 근거 필드명 (예: wuxingCount, dayMasterStrength) --></p>
</article>` as const;

export const DESIGN_KIT_GUIDE = `## 사용 지침

### 필드 매핑
| 도구 | 결과 필드 | 컴포넌트 |
|------|-----------|----------|
| analyze_saju | year/month/day/hour (stem·branch·stemElement·branchElement) | 사주판 4기둥 그리드 |
| analyze_saju | wuxingCount | 오행 분포 바 |
| analyze_saju | tenGodsDistribution | 십성 태그 목록 |
| analyze_saju | dayMasterStrength, gyeokGuk, yongSin | 섹션 카드 |
| check_compatibility | elementHarmony.harmony | 점수 게이지 |
| check_compatibility | strengths, weaknesses | 섹션 카드 |
| get_daily_fortune | overallLuck, careerLuck, loveLuck 등 점수 필드 | 점수 게이지 |
| get_dae_un | 10년 구간 목록 | 대운 타임라인 |
| get_fortune_by_period | 기간별 점수·해석 | 점수 게이지 + 섹션 카드 |

### 규칙
- 자립형 HTML 하나로 구성한다. 외부 폰트·CDN·스크립트·이미지를 추가하지 않는다.
- 오행 색의 의미(목=초록, 화=빨강, 토=황토, 금=회백, 수=파랑)를 유지한다. 그 외 레이아웃·구성은 자유롭게 확장한다.
- 단계적 공개 중에는 현재 비트와 관련된 부분 컴포넌트만 렌더한다. 전체 화면은 상담 마무리 정리 단계나 사용자가 시각화를 요청할 때 구성한다.
- 모든 수치는 도구가 반환한 필드 값만 사용하고, 섹션 카드 각주에 근거 필드명을 남긴다.` as const;

export function buildDesignKit(): string {
  return [
    '# 사주 시각화 디자인 킷',
    '기본 디자인 구조다. 아래 토큰과 컴포넌트를 바탕으로 상황에 맞게 확장해 자립형 HTML 아티팩트를 구성한다.',
    '## CSS 토큰\n```css\n' + DESIGN_KIT_CSS_TOKENS + '\n```',
    '## 컴포넌트\n```html\n' + DESIGN_KIT_COMPONENTS + '\n```',
    DESIGN_KIT_GUIDE,
  ].join('\n\n');
}

export const DESIGN_KIT_INSTRUCTIONS = [
  '## 시각화 디자인 킷',
  `- 사용자가 시각화를 요청하거나 단계적 공개가 끝난 마무리 정리 단계에서는 ${DESIGN_KIT_TOOL_NAME} 도구로 디자인 킷을 받아 자립형 HTML 아티팩트를 구성한다.`,
  '- 단계적 공개 중에는 현재 비트와 관련된 부분 컴포넌트만 렌더한다.',
  '- 킷의 오행 색 의미를 유지하고 외부 리소스를 추가하지 않는다.',
].join('\n');
