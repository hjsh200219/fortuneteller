/**
 * 기둥 사이 생극·합충형파해
 * 원국 4기둥 6쌍, 그리고 targetYear 를 주면 그해 대운·세운이 원국(세운은 대운까지)과 맺는 관계를 쌍마다 나열한다.
 */

import type { SajuData, HeavenlyStem, EarthlyBranch, WuXing } from '../types/index.js';
import { getHeavenlyStemByKorean } from '../data/heavenly_stems.js';
import {
  getEarthlyBranchByKorean,
  SAM_HAP,
  YUK_HAP,
  YUK_CHUNG,
  YUK_HAE,
  YUK_PA,
  JI_JANG_GAN,
} from '../data/earthly_branches.js';
import { isGenerating, isDestroying } from '../data/wuxing.js';
import { WON_JIN_PAIRS, GWI_MUN_PAIRS } from './sin_sal.js';
import { getDaeUnAtAge } from './dae_un.js';
import { analyzeSeUn } from './se_un.js';
import { getManAgeForFortuneYear } from '../utils/date.js';

/** 천간합과 합화 오행 */
const STEM_HAP: { pair: [HeavenlyStem, HeavenlyStem]; element: WuXing }[] = [
  { pair: ['갑', '기'], element: '토' },
  { pair: ['을', '경'], element: '금' },
  { pair: ['병', '신'], element: '수' },
  { pair: ['정', '임'], element: '목' },
  { pair: ['무', '계'], element: '화' },
];
/** 천간충 */
const STEM_CHUNG: [HeavenlyStem, HeavenlyStem][] = [['갑', '경'], ['을', '신'], ['병', '임'], ['정', '계']];
/** 두 글자 형(인사신·축술미의 두 글자, 자묘) — 같은 글자 자형은 SELF_HYEONG */
const HYEONG: [EarthlyBranch, EarthlyBranch][] = [
  ['인', '사'], ['사', '신'], ['인', '신'], ['축', '술'], ['술', '미'], ['축', '미'], ['자', '묘'],
];
const SELF_HYEONG: EarthlyBranch[] = ['진', '오', '유', '해'];

const isPair = <T>(pairs: [T, T][], a: T, b: T) => pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
const findPair = <T, P extends { pair: [T, T] }>(table: P[], a: T, b: T) => table.find(({ pair }) => isPair([pair], a, b));

/** 오행 생극 — 같은 오행이면 비화 */
function wuxingFlow<T extends string>(a: T, ea: WuXing, b: T, eb: WuXing): string[] {
  if (ea === eb) return a === b ? [] : ['비화'];
  if (isGenerating(ea, eb)) return [`${a}생${b}`];
  if (isGenerating(eb, ea)) return [`${b}생${a}`];
  if (isDestroying(ea, eb)) return [`${a}극${b}`];
  if (isDestroying(eb, ea)) return [`${b}극${a}`];
  return [];
}

export function relateStems(a: HeavenlyStem, b: HeavenlyStem): string[] {
  const out: string[] = [];
  const hap = findPair(STEM_HAP, a, b);
  if (hap) out.push(`합(${hap.element})`);
  if (isPair(STEM_CHUNG, a, b)) out.push('충');
  return out.concat(wuxingFlow(a, getHeavenlyStemByKorean(a)!.element, b, getHeavenlyStemByKorean(b)!.element));
}

export function relateBranches(a: EarthlyBranch, b: EarthlyBranch): string[] {
  const out: string[] = [];
  const hap = findPair(YUK_HAP, a, b);
  if (hap) out.push(`육합(${hap.element})`);
  // 반합: 삼합 두 글자 중 왕지(가운데)가 낀 경우만 — checkSamHap 과 같은 기준
  const samHap = Object.values(SAM_HAP).find(
    ({ branches: g }) => a !== b && g.includes(a) && g.includes(b) && (a === g[1] || b === g[1])
  );
  if (samHap) out.push(`반합(${samHap.element})`);
  // 암합: 지장간 정기끼리 천간합
  if (findPair(STEM_HAP, JI_JANG_GAN[a].primary, JI_JANG_GAN[b].primary)) out.push('암합');
  if (isPair(YUK_CHUNG, a, b)) out.push('충');
  if (isPair(HYEONG, a, b)) out.push('형');
  if (a === b && SELF_HYEONG.includes(a)) out.push('자형');
  if (isPair(YUK_PA, a, b)) out.push('파');
  if (isPair(YUK_HAE, a, b)) out.push('해');
  if (isPair(WON_JIN_PAIRS, a, b)) out.push('원진');
  if (isPair(GWI_MUN_PAIRS, a, b)) out.push('귀문');
  return out.concat(wuxingFlow(a, getEarthlyBranchByKorean(a)!.element, b, getEarthlyBranchByKorean(b)!.element));
}

interface LabeledPillar {
  label: string;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
}

export interface PillarPairRelation {
  a: string;
  b: string;
  ganji: [string, string];
  stem: string[];
  branch: string[];
}

function relate(p: LabeledPillar, q: LabeledPillar): PillarPairRelation {
  return {
    a: p.label,
    b: q.label,
    ganji: [p.stem + p.branch, q.stem + q.branch],
    stem: relateStems(p.stem, q.stem),
    branch: relateBranches(p.branch, q.branch),
  };
}

/** 생극을 뺀 합·충·형·파·해·원진·귀문 — 이름 전체가 맞아야 한다(해극오 같은 생극 표기는 제외) */
export const isKeyRelation = (name: string) => /^(합|육합|반합|암합|충|형|자형|파|해|원진|귀문)(\(.\))?$/.test(name);

export function analyzePillarRelations(
  sajuData: SajuData,
  targetYear?: number
): {
  natal: PillarPairRelation[];
  daeUn?: { ganji: string; startAge: number; endAge: number; pairs: PillarPairRelation[] };
  seUn?: { year: number; ganji: string; pairs: PillarPairRelation[] };
  summary: string[];
} {
  const natalPillars: LabeledPillar[] = [
    { label: '년주', ...sajuData.year },
    { label: '월주', ...sajuData.month },
    { label: '일주', ...sajuData.day },
    { label: '시주', ...sajuData.hour },
  ];
  const natal: PillarPairRelation[] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) natal.push(relate(natalPillars[i]!, natalPillars[j]!));
  }

  let daeUn: ReturnType<typeof analyzePillarRelations>['daeUn'];
  let seUn: ReturnType<typeof analyzePillarRelations>['seUn'];
  if (targetYear !== undefined) {
    const period = getDaeUnAtAge(sajuData, getManAgeForFortuneYear(sajuData.birthDate, targetYear));
    const daeUnPillar: LabeledPillar | null = period ? { label: '대운', stem: period.stem, branch: period.branch } : null;
    if (period && daeUnPillar) {
      daeUn = {
        ganji: period.stem + period.branch,
        startAge: period.startAge,
        endAge: period.endAge,
        pairs: natalPillars.map((p) => relate(daeUnPillar, p)),
      };
    }
    const year = analyzeSeUn(sajuData, targetYear);
    const seUnPillar: LabeledPillar = { label: '세운', stem: year.stem, branch: year.branch };
    seUn = {
      year: targetYear,
      ganji: year.stem + year.branch,
      pairs: [...natalPillars, ...(daeUnPillar ? [daeUnPillar] : [])].map((p) => relate(seUnPillar, p)),
    };
  }

  const summary = [...natal, ...(daeUn?.pairs ?? []), ...(seUn?.pairs ?? [])]
    .map((r) => {
      const keys = [
        ...r.stem.filter(isKeyRelation).map((s) => `천간${s}`),
        ...r.branch.filter(isKeyRelation),
      ];
      return keys.length ? `${r.a} ${r.ganji[0]} ↔ ${r.b} ${r.ganji[1]}: ${keys.join('·')}` : null;
    })
    .filter((line): line is string => line !== null);

  return { natal, daeUn, seUn, summary };
}
