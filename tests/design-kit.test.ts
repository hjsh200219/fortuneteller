import {
  DESIGN_KIT_COMPONENTS,
  DESIGN_KIT_CSS_TOKENS,
  DESIGN_KIT_GUIDE,
  DESIGN_KIT_INSTRUCTIONS,
  DESIGN_KIT_TOOL_NAME,
  buildDesignKit,
} from '../src/core/design-kit.js';

describe('사주 시각화 디자인 킷 계약', () => {
  test('도구 이름이 고정되어 있다', () => {
    expect(DESIGN_KIT_TOOL_NAME).toBe('get_design_template');
  });

  test('CSS 토큰에 오행 5색과 바탕·먹색·다크 대응이 있다', () => {
    const requiredTokens = [
      '--saju-wood',
      '--saju-fire',
      '--saju-earth',
      '--saju-metal',
      '--saju-water',
      '--saju-bg',
      '--saju-ink',
    ];

    for (const token of requiredTokens) {
      expect(DESIGN_KIT_CSS_TOKENS).toContain(token);
    }
    expect(DESIGN_KIT_CSS_TOKENS).toContain('prefers-color-scheme: dark');
  });

  test('컴포넌트 6종 마커가 모두 있다', () => {
    const requiredMarkers = [
      'saju-pillars',
      'saju-wuxing',
      'saju-gauge',
      'saju-tags',
      'saju-daeun',
      'saju-card',
    ];

    for (const marker of requiredMarkers) {
      expect(DESIGN_KIT_COMPONENTS).toContain(marker);
    }
  });

  test('지침에 매핑·부분 렌더·자립형·외부 리소스 금지 규칙이 있다', () => {
    const requiredPhrases = ['필드 매핑', '부분 컴포넌트만 렌더', '자립형 HTML', '외부', '오행 색'];

    for (const phrase of requiredPhrases) {
      expect(DESIGN_KIT_GUIDE).toContain(phrase);
    }
  });

  test('빌드 결과가 토큰·컴포넌트·지침을 모두 포함한다', () => {
    const kit = buildDesignKit();

    expect(kit).toContain(DESIGN_KIT_CSS_TOKENS);
    expect(kit).toContain(DESIGN_KIT_COMPONENTS);
    expect(kit).toContain(DESIGN_KIT_GUIDE);
  });

  test('서버 지침 안내가 도구 이름과 타이밍 규칙을 담는다', () => {
    expect(DESIGN_KIT_INSTRUCTIONS).toContain(DESIGN_KIT_TOOL_NAME);
    expect(DESIGN_KIT_INSTRUCTIONS).toContain('마무리 정리');
    expect(DESIGN_KIT_INSTRUCTIONS).toContain('부분 컴포넌트');
  });
});
