/**
 * 운(세운·월운·일진) 간지 평가 — 원국 일간·용신·일지 기준
 *
 * 들어오는 간지의 천간과 지지 정기를 일간 기준 십신으로 바꾸고, 그 오행이 용신·희신 쪽인지 기신 쪽인지로
 * 유불리를 정한다. 일지와의 충(沖)·육합(六合)은 가까운 관계·건강 신호로 따로 본다.
 * 문장은 이 사실들에서만 만든다 — 난수·날짜 숫자·고정 달 목록을 쓰지 않는다.
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, TenGod, WuXing } from '../types/index.js';
import { getHeavenlyStemByKorean } from '../data/heavenly_stems.js';
import { extractJiJangGan } from '../data/earthly_branches.js';
import { calculateTenGod } from './ten_gods.js';
import { selectYongSin } from './yong_sin.js';

export type TenGodGroup = '비겁' | '식상' | '재성' | '관성' | '인성';
export type LuckVerdict = 'favorable' | 'mixed' | 'neutral' | 'unfavorable';

export interface GanJiLuck {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemTenGod: TenGod;
  /** 지지 정기(正氣)의 십신 */
  branchTenGod: TenGod;
  /** +1 용신·희신 오행, -1 기신·구신 오행, 0 그 밖 */
  stemFavor: -1 | 0 | 1;
  branchFavor: -1 | 0 | 1;
  clashWithDayBranch: boolean;
  harmonyWithDayBranch: boolean;
  verdict: LuckVerdict;
  /** 0-100. 50=중립 */
  score: number;
}

const CLASH: Record<EarthlyBranch, EarthlyBranch> = {
  자: '오', 오: '자', 축: '미', 미: '축', 인: '신', 신: '인',
  묘: '유', 유: '묘', 진: '술', 술: '진', 사: '해', 해: '사',
};

const HARMONY: Record<EarthlyBranch, EarthlyBranch> = {
  자: '축', 축: '자', 인: '해', 해: '인', 묘: '술', 술: '묘',
  진: '유', 유: '진', 사: '신', 신: '사', 오: '미', 미: '오',
};

export function tenGodGroup(tenGod: TenGod): TenGodGroup {
  switch (tenGod) {
    case '비견':
    case '겁재':
      return '비겁';
    case '식신':
    case '상관':
      return '식상';
    case '편재':
    case '정재':
      return '재성';
    case '편관':
    case '정관':
      return '관성';
    default:
      return '인성';
  }
}

/** 용신·희신 오행과 기신·구신 오행 (겹치면 유리 쪽 우선) */
export function getFavorSets(sajuData: SajuData): { favorable: WuXing[]; unfavorable: WuXing[] } {
  const ys = selectYongSin(sajuData);
  const favorable = [...new Set<WuXing>([ys.primaryYongSin, ...(ys.secondaryYongSin ? [ys.secondaryYongSin] : []), ...ys.xiSin])];
  const unfavorable = [...new Set<WuXing>([...ys.jiSin, ...ys.chouSin])].filter((e) => !favorable.includes(e));
  return { favorable, unfavorable };
}

function favorOf(element: WuXing, sets: { favorable: WuXing[]; unfavorable: WuXing[] }): -1 | 0 | 1 {
  if (sets.favorable.includes(element)) return 1;
  if (sets.unfavorable.includes(element)) return -1;
  return 0;
}

export function evaluateGanJi(
  sajuData: SajuData,
  stem: HeavenlyStem,
  branch: EarthlyBranch,
  sets: { favorable: WuXing[]; unfavorable: WuXing[] } = getFavorSets(sajuData)
): GanJiLuck {
  const dayStem = sajuData.day.stem;
  const branchMain = extractJiJangGan(branch)[0]!;
  const stemFavor = favorOf(getHeavenlyStemByKorean(stem)!.element, sets);
  const branchFavor = favorOf(getHeavenlyStemByKorean(branchMain)!.element, sets);
  const clashWithDayBranch = CLASH[sajuData.day.branch] === branch;
  const harmonyWithDayBranch = HARMONY[sajuData.day.branch] === branch;

  // 지지가 천간보다 오래·깊게 작용한다(개두·절각 논의와 무관한 기본 가중)
  let score = 50 + stemFavor * 15 + branchFavor * 20;
  if (harmonyWithDayBranch) score += 5;
  if (clashWithDayBranch) score -= 10;
  score = Math.max(10, Math.min(95, score));

  const total = stemFavor + branchFavor;
  let verdict: LuckVerdict;
  if (stemFavor !== 0 && branchFavor !== 0 && stemFavor !== branchFavor) verdict = 'mixed';
  else if (total > 0) verdict = 'favorable';
  else if (total < 0) verdict = 'unfavorable';
  else verdict = 'neutral';

  return {
    stem,
    branch,
    stemTenGod: calculateTenGod(dayStem, stem),
    branchTenGod: calculateTenGod(dayStem, branchMain),
    stemFavor,
    branchFavor,
    clashWithDayBranch,
    harmonyWithDayBranch,
    verdict,
    score,
  };
}

const GROUP_THEME: Record<TenGodGroup, string> = {
  비겁: '동료·경쟁자와 얽히고 돈이 나뉘기 쉬운',
  식상: '말·표현·새 일 벌이기에 힘이 실리는',
  재성: '돈과 현실 문제가 앞에 나서는',
  관성: '책임·평가·조직의 압력이 커지는',
  인성: '배움·문서·도움을 받는 일이 늘어나는',
};

const VERDICT_TAIL: Record<LuckVerdict, string> = {
  favorable: '용신 쪽 기운이라 적극적으로 살려도 좋습니다.',
  mixed: '천간과 지지의 유불리가 엇갈려, 앞서 나가되 뒷감당을 같이 계산해야 합니다.',
  neutral: '용신·기신 어느 쪽도 뚜렷하지 않아 평소 흐름대로 갑니다.',
  unfavorable: '기신 쪽 기운이라 무리하게 키우면 부담이 됩니다.',
};

function favorWord(f: -1 | 0 | 1): string {
  return f > 0 ? '유리' : f < 0 ? '불리' : '중립';
}

/**
 * 평가 결과를 분야별 문장으로 — scope 는 '해'·'달'·'날'
 */
export function describeLuck(
  luck: GanJiLuck,
  sajuData: SajuData,
  scope: '해' | '달' | '날'
): { overall: string; career: string; wealth: string; health: string; relationship: string } {
  const sg = tenGodGroup(luck.stemTenGod);
  const bg = tenGodGroup(luck.branchTenGod);
  const groups = new Set<TenGodGroup>([sg, bg]);
  const favorFor = (g: TenGodGroup): -1 | 0 | 1 => {
    const fs: number[] = [];
    if (sg === g) fs.push(luck.stemFavor);
    if (bg === g) fs.push(luck.branchFavor);
    const sum = fs.reduce((a, b) => a + b, 0);
    return sum > 0 ? 1 : sum < 0 ? -1 : 0;
  };

  const themes = sg === bg ? GROUP_THEME[sg] : `${GROUP_THEME[sg]}(천간 ${luck.stemTenGod}) 동시에 ${GROUP_THEME[bg]}(지지 ${luck.branchTenGod})`;
  const overall = `${luck.stem}${luck.branch}은 일간 기준 천간 ${luck.stemTenGod}(${favorWord(luck.stemFavor)}), 지지 ${luck.branchTenGod}(${favorWord(luck.branchFavor)})입니다. ${themes} ${scope}이며, ${VERDICT_TAIL[luck.verdict]}`;

  const career = groups.has('관성')
    ? favorFor('관성') >= 0
      ? '관성이 들어와 맡는 책임과 평가가 커집니다. 자리·직함 이동을 받아들이기 좋은 흐름입니다.'
      : '관성이 기신 쪽으로 들어와 윗선·규정의 압박이 커집니다. 맞서기보다 절차를 지키는 쪽이 안전합니다.'
    : groups.has('식상')
      ? '식상이 들어와 기획·발표·새 일을 벌이는 데 힘이 실립니다.' +
        (luck.stemTenGod === '상관' || luck.branchTenGod === '상관' ? ' 상관이라 말이 날카로워지기 쉬우니 윗사람 앞에서 표현을 다듬으세요.' : '')
      : groups.has('인성')
        ? '인성이 들어와 배우고 자격·문서를 갖추는 일이 잘 풀립니다.'
        : '직업 쪽 십신(관성·식상)이 직접 들어오지 않아 큰 변동 신호는 약합니다.';

  const wealth = groups.has('재성')
    ? favorFor('재성') >= 0
      ? '재성이 들어와 돈이 움직입니다. 벌 기회로 쓰기 좋은 흐름입니다.'
      : '재성이 기신 쪽으로 들어와 돈 문제가 커지기 쉽습니다. 큰 지출·투자는 한도를 먼저 정하세요.'
    : groups.has('비겁')
      ? '비겁이 들어와 돈을 나누거나 남에게 쓰는 일이 늘어납니다. 보증·동업 제안은 신중히.'
      : '재물 쪽 십신(재성)이 직접 들어오지 않아 수입 변동 신호는 약합니다.';

  const health = luck.clashWithDayBranch
    ? `${scope} 지지 ${luck.branch}이(가) 일지 ${sajuData.day.branch}와 충(沖)합니다. 생활 리듬·거처가 흔들리기 쉬우니 무리한 일정을 줄이세요.`
    : luck.verdict === 'unfavorable'
      ? '기신 쪽 기운이 강해 피로가 쌓이기 쉽습니다. 쉬는 시간을 먼저 확보하세요.'
      : '건강 쪽 특별한 충돌 신호는 없습니다.';

  // 배우자성: 남자는 재성, 여자는 관성
  const spouseGroup: TenGodGroup = sajuData.gender === 'male' ? '재성' : '관성';
  const relationship = luck.harmonyWithDayBranch
    ? `${scope} 지지 ${luck.branch}이(가) 일지(배우자궁) ${sajuData.day.branch}와 육합합니다. 가까운 관계가 가까워지기 쉬운 흐름입니다.`
    : luck.clashWithDayBranch
      ? `일지(배우자궁)를 충하므로 가까운 관계에서 거리·일정 문제로 부딪히기 쉽습니다.`
      : groups.has(spouseGroup)
        ? `배우자성(${spouseGroup})이 들어와 이성·배우자 관련 일이 앞에 나옵니다.`
        : groups.has('비겁')
          ? '비겁이 들어와 친구·동료와 어울릴 일이 많아지고, 관계에서 주도권 다툼이 생기기 쉽습니다.'
          : '관계 쪽 특별한 합·충 신호는 없습니다.';

  return { overall, career, wealth, health, relationship };
}
