/**
 * 현대명리(現代命理) 해석기
 * Modern Practical School Interpreter
 *
 * 특징:
 * - 현대 직업과 라이프스타일 반영
 * - 병약용신 선호
 * - 구체적이고 실천 가능한 조언
 * - 직업과 재물 중시
 */

import type { SajuPillars } from '../../types/index.js';
import type { UserInterpretationSettings, SchoolCode } from '../../types/interpretation.js';
import { BaseSchoolInterpreter } from '../school_interpreter.js';
import { YongSinSelector } from '../yongsin/selector.js';

export class ModernInterpreter extends BaseSchoolInterpreter {
  readonly schoolCode: SchoolCode = 'modern';
  readonly schoolName = '현대명리';

  determineYongSin(pillars: SajuPillars, method: UserInterpretationSettings['yongSinMethod']): string {
    const sajuData = this.pillarsToSajuData(pillars);
    // 현대명리는 병약용신 선호
    const preferredMethod = method === 'strength' ? 'disease' : method;
    const result = YongSinSelector.select(sajuData, preferredMethod);
    return result.primaryYongSin;
  }

  interpretHealth(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `현대 의학과 결합하여 ${yongSin} 기운을 보강하는 식습관과 운동을 권장합니다. 정기 건강검진을 통해 예방에 힘쓰세요.`;
  }

  interpretWealth(_pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string {
    let interpretation = `재물 운은 ${yongSin} 관련 투자와 수익 모델에서 좋습니다.`;

    if (settings.eraAdaptation.techIndustry) {
      interpretation += ' IT, 핀테크, 암호화폐 등 기술 기반 투자를 고려하세요.';
    }

    if (settings.eraAdaptation.globalContext) {
      interpretation += ' 글로벌 시장과 해외 투자 기회도 검토하세요.';
    }

    return interpretation;
  }

  interpretCareer(_pillars: SajuPillars, yongSin: string, settings: UserInterpretationSettings): string {
    let careers: string[] = [];

    if (yongSin === '수' || yongSin === '금') {
      careers = ['소프트웨어 개발자', '데이터 사이언티스트', '퀀트 애널리스트', '핀테크 전문가'];
    } else if (yongSin === '화') {
      careers = ['UX 디자이너', '디지털 마케터', '콘텐츠 크리에이터', 'AI 엔지니어'];
    } else if (yongSin === '목') {
      careers = ['교육 플랫폼 운영', '헬스케어 전문가', '환경 컨설턴트', '바이오 연구원'];
    } else {
      careers = ['프로젝트 매니저', '경영 컨설턴트', '부동산 개발', '스타트업 창업'];
    }

    let interpretation = `${yongSin} 오행과 관련된 현대 직업: ${careers.join(', ')}`;

    if (settings.eraAdaptation.modernCareer) {
      interpretation += '. 원격 근무와 유연한 업무 환경을 적극 활용하세요.';
    }

    return interpretation;
  }

  interpretRelationship(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `현대 관계에서는 소통과 이해가 중요합니다. ${yongSin} 기운과 조화로운 파트너와의 관계에서 발전 가능성이 높습니다. SNS와 온라인 커뮤니티를 통한 네트워킹도 유리합니다.`;
  }

  interpretFame(_pillars: SajuPillars, yongSin: string, _settings: UserInterpretationSettings): string {
    return `개인 브랜딩과 전문성 구축이 명예로 이어집니다. ${yongSin} 분야의 전문가로 성장하고, SNS와 블로그를 통해 영향력을 키우세요.`;
  }

  private pillarsToSajuData(pillars: SajuPillars): import('../../types/index.js').SajuData {
    return {
      day: pillars.day,
      month: pillars.month,
      year: pillars.year,
      hour: pillars.hour,
      wuxingCount: { 목: 2, 화: 2, 토: 2, 금: 2, 수: 2 },
      dayMasterStrength: { level: 'medium', score: 50, analysis: '' },
      birthDate: '1990-01-01',
      birthTime: '00:00',
      calendar: 'solar' as const,
      isLeapMonth: false,
      gender: 'male' as const,
      tenGods: [],
    };
  }
}
