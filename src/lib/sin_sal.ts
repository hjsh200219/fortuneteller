/**
 * 신살(神殺) 체계
 * 사주에 나타나는 특수한 길흉신
 */

import type {
  SajuData,
  SinSal,
  SinSalInfo,
  HeavenlyStem,
  EarthlyBranch,
} from '../types/index.js';

/**
 * 신살 정보 데이터
 */
export const SIN_SAL_DATA: Record<SinSal, Omit<SinSalInfo, 'sinSal'>> = {
  cheon_eul_gwi_in: {
    name: '천을귀인',
    hanja: '天乙貴人',
    type: 'lucky',
    description: '가장 강력한 길신으로 귀인의 도움을 받는 운',
    effects: [
      '위기 상황에서 귀인의 도움',
      '사회적 명예와 지위 상승',
      '재난과 어려움을 피하는 운',
    ],
    advice: [
      '주변 사람들과의 인연을 소중히 하세요',
      '어려울 때 주저하지 말고 도움을 청하세요',
    ],
  },
  cheon_deok_gwi_in: {
    name: '천덕귀인',
    hanja: '天德貴人',
    type: 'lucky',
    description: '하늘의 덕을 받아 재난을 면하는 운',
    effects: ['자연재해나 사고로부터 보호', '어려운 상황에서 탈출', '건강운 상승'],
    advice: ['감사하는 마음을 가지세요', '선행을 많이 하면 복이 배가됩니다'],
  },
  wol_deok_gwi_in: {
    name: '월덕귀인',
    hanja: '月德貴人',
    type: 'lucky',
    description: '달의 덕으로 평안과 안정을 얻는 운',
    effects: ['가정의 평화', '안정적인 삶', '여성과 인연이 좋음'],
    advice: ['가족과의 시간을 소중히 하세요', '평화로운 환경을 조성하세요'],
  },
  mun_chang_gwi_in: {
    name: '문창귀인',
    hanja: '文昌貴人',
    type: 'lucky',
    description: '학문과 문학적 재능이 뛰어난 운',
    effects: ['학업 성취', '시험 합격운', '문학·예술 재능', '지혜와 총명함'],
    advice: [
      '학문과 교육에 투자하세요',
      '글쓰기나 창작 활동을 시도해보세요',
    ],
  },
  hak_dang_gwi_in: {
    name: '학당귀인',
    hanja: '學堂貴人',
    type: 'lucky',
    description: '배움의 터전, 학업 성취가 높은 운',
    effects: ['학습 능력 향상', '전문가로 성장', '연구 분야 적합'],
    advice: [
      '평생 학습하는 자세를 유지하세요',
      '전문 분야를 깊이 파고드세요',
    ],
  },
  geum_yeo_rok: {
    name: '금여록',
    hanja: '金輿祿',
    type: 'lucky',
    description: '물질적 풍요와 안정된 재물운',
    effects: ['재물운 상승', '안정적인 수입', '부동산운'],
    advice: [
      '부동산이나 안정적인 투자를 고려하세요',
      '재물 관리를 철저히 하세요',
    ],
  },
  hwa_gae_sal: {
    name: '화개살',
    hanja: '華蓋殺',
    type: 'neutral',
    description: '예술적 재능과 종교적 성향, 고독함의 이중성',
    effects: [
      '예술·종교·철학 분야 재능',
      '독창적 사고',
      '고독하고 외로울 수 있음',
      '신비로운 일에 관심',
    ],
    advice: [
      '창작이나 영적 활동에 집중하세요',
      '고독을 즐기되 고립되지 않도록 주의하세요',
    ],
  },
  yang_in_sal: {
    name: '양인살',
    hanja: '羊刃殺',
    type: 'unlucky',
    description: '날카로운 칼날, 폭력성과 사고 위험',
    effects: [
      '성격이 급하고 과격함',
      '사고나 수술 위험',
      '갈등과 충돌 많음',
      '단호함과 결단력 (긍정적 측면)',
    ],
    advice: [
      '감정 조절과 인내심을 기르세요',
      '위험한 일이나 장소를 피하세요',
      '운동이나 무술로 에너지를 분출하세요',
    ],
  },
  do_hwa_sal: {
    name: '도화살',
    hanja: '桃花殺',
    type: 'unlucky',
    description: '복숭아꽃 살, 이성 관계가 복잡하고 유혹 많음',
    effects: [
      '이성에게 인기가 많음',
      '연애나 결혼 문제 복잡',
      '외모가 매력적',
      '유흥이나 향락에 빠질 위험',
    ],
    advice: [
      '이성 관계를 신중히 하세요',
      '유혹에 흔들리지 않도록 주의하세요',
      '배우자에 대한 신의를 지키세요',
    ],
  },
  baek_ho_sal: {
    name: '백호살',
    hanja: '白虎殺',
    type: 'unlucky',
    description: '흰 호랑이 살, 혈광지사와 질병 위험',
    effects: [
      '사고나 부상 위험',
      '수술이나 피를 보는 일',
      '질병에 취약',
      '갑작스런 불행',
    ],
    advice: [
      '건강 관리를 철저히 하세요',
      '위험한 활동을 자제하세요',
      '정기 건강검진을 받으세요',
    ],
  },
  yeok_ma_sal: {
    name: '역마살',
    hanja: '驛馬殺',
    type: 'neutral',
    description: '역참의 말, 이동수가 많고 활동적',
    effects: [
      '이사나 여행이 잦음',
      '직업 변동이 많음',
      '활동적이고 역동적',
      '안정성 부족',
    ],
    advice: [
      '변화를 긍정적으로 받아들이세요',
      '해외 진출이나 이동을 활용하세요',
      '안정이 필요하면 노력이 필요합니다',
    ],
  },
  gwa_suk_sal: {
    name: '고숙살',
    hanja: '孤宿殺',
    type: 'unlucky',
    description: '고독하게 머무르는 살, 외로움과 고립',
    effects: [
      '혼자 있는 시간이 많음',
      '배우자나 가족과 떨어져 지냄',
      '사회성 부족',
      '깊은 사색과 성찰',
    ],
    advice: [
      '사람들과의 교류를 의식적으로 늘리세요',
      '고독을 창조적 활동으로 승화하세요',
      '가족과의 유대를 강화하세요',
    ],
  },
  gong_mang: {
    name: '공망',
    hanja: '空亡',
    type: 'unlucky',
    description: '허공의 망함, 허무함과 상실감',
    effects: [
      '노력해도 성과가 없음',
      '허무함과 공허함',
      '손실과 실패',
      '집착을 버리는 계기 (긍정적 측면)',
    ],
    advice: [
      '욕심을 버리고 평정심을 유지하세요',
      '정신적 성장의 기회로 삼으세요',
      '집착하지 말고 흘러가듯 살아가세요',
    ],
  },
  won_jin_sal: {
    name: '원진살',
    hanja: '元辰殺',
    type: 'unlucky',
    description: '원한과 적대 관계, 갈등과 대립',
    effects: [
      '타인과의 갈등이 잦음',
      '원수나 적이 생기기 쉬움',
      '법적 분쟁 주의',
      '배신이나 배반을 경험',
    ],
    advice: [
      '언행을 조심하고 겸손하세요',
      '분쟁은 조기에 해결하세요',
      '법적 문제에 신중하세요',
    ],
  },
  gwi_mun_gwan_sal: {
    name: '귀문관살',
    hanja: '鬼門關殺',
    type: 'unlucky',
    description: '귀신의 문, 신비롭고 불길한 기운',
    effects: [
      '신비로운 체험',
      '악몽이나 환각',
      '심리적 불안',
      '영적 감수성 (긍정적 측면)',
    ],
    advice: [
      '정신 건강을 잘 관리하세요',
      '신비주의에 지나치게 빠지지 마세요',
      '명상과 수양을 통해 마음을 다스리세요',
    ],
  },
};

/**
 * 천을귀인 판단표 (일간 기준)
 */
const CHEON_EUL_GWI_IN_TABLE: Record<HeavenlyStem, EarthlyBranch[]> = {
  갑: ['축', '미'],
  을: ['자', '신'],
  병: ['해', '유'],
  정: ['해', '유'],
  무: ['축', '미'],
  기: ['자', '신'],
  경: ['축', '미'],
  신: ['인', '오'],
  임: ['사', '묘'],
  계: ['사', '묘'],
};

/**
 * 도화살 판단 (지지 조합)
 */
function checkDoHwaSal(branches: EarthlyBranch[]): boolean {
  const branchSet = new Set(branches);

  // 인오술 → 묘
  if (
    (branchSet.has('인') || branchSet.has('오') || branchSet.has('술')) &&
    branchSet.has('묘')
  ) {
    return true;
  }

  // 사유축 → 오
  if (
    (branchSet.has('사') || branchSet.has('유') || branchSet.has('축')) &&
    branchSet.has('오')
  ) {
    return true;
  }

  // 신자진 → 유
  if (
    (branchSet.has('신') || branchSet.has('자') || branchSet.has('진')) &&
    branchSet.has('유')
  ) {
    return true;
  }

  // 해묘미 → 자
  if (
    (branchSet.has('해') || branchSet.has('묘') || branchSet.has('미')) &&
    branchSet.has('자')
  ) {
    return true;
  }

  return false;
}

/**
 * 역마살 판단 (지지 조합)
 */
function checkYeokMaSal(branches: EarthlyBranch[]): boolean {
  const branchSet = new Set(branches);

  // 인오술일주 → 신
  if (
    (branchSet.has('인') || branchSet.has('오') || branchSet.has('술')) &&
    branchSet.has('신')
  ) {
    return true;
  }

  // 사유축일주 → 해
  if (
    (branchSet.has('사') || branchSet.has('유') || branchSet.has('축')) &&
    branchSet.has('해')
  ) {
    return true;
  }

  // 신자진일주 → 인
  if (
    (branchSet.has('신') || branchSet.has('자') || branchSet.has('진')) &&
    branchSet.has('인')
  ) {
    return true;
  }

  // 해묘미일주 → 사
  if (
    (branchSet.has('해') || branchSet.has('묘') || branchSet.has('미')) &&
    branchSet.has('사')
  ) {
    return true;
  }

  return false;
}

/**
 * 공망 판단 (일주 기준 60갑자 순환)
 */
function checkGongMang(dayBranch: EarthlyBranch, branches: EarthlyBranch[]): boolean {
  const gongMangTable: Record<EarthlyBranch, EarthlyBranch[]> = {
    자: ['술', '해'],
    축: ['술', '해'],
    인: ['자', '축'],
    묘: ['자', '축'],
    진: ['인', '묘'],
    사: ['인', '묘'],
    오: ['진', '사'],
    미: ['진', '사'],
    신: ['오', '미'],
    유: ['오', '미'],
    술: ['신', '유'],
    해: ['신', '유'],
  };

  const gongMangBranches = gongMangTable[dayBranch];
  return branches.some((branch) => gongMangBranches.includes(branch));
}

/**
 * 화개살 판단 (지지 조합)
 */
function checkHwaGaeSal(branches: EarthlyBranch[]): boolean {
  const branchSet = new Set(branches);

  // 인오술 → 술
  if (
    (branchSet.has('인') || branchSet.has('오') || branchSet.has('술')) &&
    branchSet.has('술')
  ) {
    return true;
  }

  // 사유축 → 축
  if (
    (branchSet.has('사') || branchSet.has('유') || branchSet.has('축')) &&
    branchSet.has('축')
  ) {
    return true;
  }

  // 신자진 → 진
  if (
    (branchSet.has('신') || branchSet.has('자') || branchSet.has('진')) &&
    branchSet.has('진')
  ) {
    return true;
  }

  // 해묘미 → 미
  if (
    (branchSet.has('해') || branchSet.has('묘') || branchSet.has('미')) &&
    branchSet.has('미')
  ) {
    return true;
  }

  return false;
}

/**
 * 사주에서 신살 찾기
 */
export function findSinSals(sajuData: SajuData): SinSal[] {
  const sinSals: SinSal[] = [];
  const dayStem = sajuData.day.stem;
  const dayBranch = sajuData.day.branch;

  // 4기둥의 지지 수집
  const branches: EarthlyBranch[] = [
    sajuData.year.branch,
    sajuData.month.branch,
    sajuData.day.branch,
    sajuData.hour.branch,
  ];

  // 천을귀인 체크
  const cheonEulBranches = CHEON_EUL_GWI_IN_TABLE[dayStem];
  if (branches.some((branch) => cheonEulBranches.includes(branch))) {
    sinSals.push('cheon_eul_gwi_in');
  }

  // 도화살 체크
  if (checkDoHwaSal(branches)) {
    sinSals.push('do_hwa_sal');
  }

  // 역마살 체크
  if (checkYeokMaSal(branches)) {
    sinSals.push('yeok_ma_sal');
  }

  // 공망 체크
  if (checkGongMang(dayBranch, branches)) {
    sinSals.push('gong_mang');
  }

  // 화개살 체크
  if (checkHwaGaeSal(branches)) {
    sinSals.push('hwa_gae_sal');
  }

  // 원진살 체크 (간단한 판단)
  if (checkWonJinSal(branches)) {
    sinSals.push('won_jin_sal');
  }

  // 귀문관살 체크 (간단한 판단)
  if (checkGwiMunGwanSal(branches)) {
    sinSals.push('gwi_mun_gwan_sal');
  }

  // 간단한 휴리스틱으로 다른 신살들도 추가 (실제 판단 로직은 더 복잡함)
  // 여기서는 일부만 구현

  return sinSals;
}

/**
 * 원진살 체크 - 자오충, 묘유충 등 충돌 관계
 */
function checkWonJinSal(branches: EarthlyBranch[]): boolean {
  const branchSet = new Set(branches);

  const chungPairs: [EarthlyBranch, EarthlyBranch][] = [
    ['자', '오'],
    ['축', '미'],
    ['인', '신'],
    ['묘', '유'],
    ['진', '술'],
    ['사', '해'],
  ];

  for (const [b1, b2] of chungPairs) {
    if (branchSet.has(b1) && branchSet.has(b2)) {
      return true;
    }
  }

  return false;
}

/**
 * 귀문관살 체크 - 인, 신, 사, 해가 있을 때
 */
function checkGwiMunGwanSal(branches: EarthlyBranch[]): boolean {
  const branchSet = new Set(branches);
  const gwiMunBranches: EarthlyBranch[] = ['인', '신', '사', '해'];

  // 귀문관살 관련 지지가 2개 이상 있으면
  let count = 0;
  for (const branch of gwiMunBranches) {
    if (branchSet.has(branch)) count++;
  }

  return count >= 2;
}

/**
 * 신살 정보 조회
 */
export function getSinSalInfo(sinSal: SinSal): SinSalInfo {
  return {
    sinSal,
    ...SIN_SAL_DATA[sinSal],
  };
}

/**
 * 신살 기반 특수 해석
 */
export function interpretBySinSal(
  sinSals: SinSal[]
): { warnings: string[]; blessings: string[]; specialAdvice: string[] } {
  const warnings: string[] = [];
  const blessings: string[] = [];
  const specialAdvice: string[] = [];

  sinSals.forEach((sinSal) => {
    const info = getSinSalInfo(sinSal);

    if (info.type === 'lucky') {
      blessings.push(`${info.name}(${info.hanja}): ${info.description}`);
      specialAdvice.push(...info.advice);
    } else if (info.type === 'unlucky') {
      warnings.push(`${info.name}(${info.hanja}): ${info.description}`);
      specialAdvice.push(...info.advice);
    } else {
      // neutral
      blessings.push(`${info.name}(${info.hanja}): ${info.description}`);
      warnings.push(`${info.name}의 부정적 측면에 주의하세요`);
      specialAdvice.push(...info.advice);
    }
  });

  return { warnings, blessings, specialAdvice };
}

/**
 * 모든 신살 정보 가져오기
 */
export function getAllSinSalInfo(sinSals: SinSal[]): SinSalInfo[] {
  return sinSals.map(getSinSalInfo);
}
