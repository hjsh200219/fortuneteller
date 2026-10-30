/**
 * 기둥 사이 생극·합충형파해 — 원국 6쌍 + 대운·세운 대 원국
 */

import { relateStems, relateBranches, analyzePillarRelations, isKeyRelation } from '../src/lib/pillar_relations.js';
import { calculateSaju } from '../src/lib/saju.js';
import { analyzeBranchRelations } from '../src/data/earthly_branches.js';
import { handleAnalyzeSaju } from '../src/tools/analyze_saju.js';

describe('천간 관계', () => {
  test('갑기는 합(토), 갑이 기를 극한다', () => {
    expect(relateStems('갑', '기')).toEqual(expect.arrayContaining(['합(토)', '갑극기']));
  });
  test('갑경은 충이며 경이 갑을 극한다', () => {
    expect(relateStems('갑', '경')).toEqual(expect.arrayContaining(['충', '경극갑']));
  });
  test('갑병은 갑이 병을 생한다', () => {
    expect(relateStems('병', '갑')).toEqual(['갑생병']);
  });
});

describe('지지 관계 — 합충형파해', () => {
  test('술미는 형이자 파', () => {
    expect(relateBranches('술', '미')).toEqual(expect.arrayContaining(['형', '파']));
  });
  test('진술은 충', () => {
    expect(relateBranches('진', '술')).toContain('충');
  });
  test('오오는 자형', () => {
    expect(relateBranches('오', '오')).toContain('자형');
  });
  test('신해는 해', () => {
    expect(relateBranches('신', '해')).toContain('해');
  });
  test('진해는 원진·귀문', () => {
    expect(relateBranches('진', '해')).toEqual(expect.arrayContaining(['원진', '귀문']));
  });
  test('오해는 지장간 정기 정임합 — 암합', () => {
    expect(relateBranches('오', '해')).toContain('암합');
  });
  test('오술은 왕지가 낀 반합(화)', () => {
    expect(relateBranches('오', '술')).toContain('반합(화)');
  });
  test('해미는 왕지(묘)가 없어 반합이 아니다', () => {
    expect(relateBranches('해', '미').some((r) => r.startsWith('반합'))).toBe(false);
  });
  test('오미는 육합(화)', () => {
    expect(relateBranches('오', '미')).toContain('육합(화)');
  });
  test('인해는 육합이면서 파', () => {
    expect(relateBranches('인', '해')).toEqual(expect.arrayContaining(['육합(목)', '파']));
  });
  test('원국 지지 관계 요약에 파가 들어간다', () => {
    const r = analyzeBranchRelations(['술', '미', '자', '인']);
    expect(r.yukPa).toEqual([['술', '미']]);
    expect(r.summary).toContain('술미 파');
  });
});

describe('원국·대운·세운 관계', () => {
  const saju = calculateSaju('1990-05-15', '10:30', 'solar', false, 'male', '서울');

  test('원국은 4기둥 6쌍', () => {
    const r = analyzePillarRelations(saju);
    expect(r.natal).toHaveLength(6);
    expect(r.daeUn).toBeUndefined();
    expect(r.seUn).toBeUndefined();
  });

  test('targetYear 를 주면 대운(원국 4쌍)과 세운(원국 4쌍 + 대운 1쌍)이 붙는다', () => {
    const r = analyzePillarRelations(saju, 2027);
    expect(r.seUn?.ganji).toBe('정미');
    expect(r.seUn?.pairs).toHaveLength(5);
    expect(r.daeUn?.pairs).toHaveLength(4);
    expect(r.seUn?.pairs.map((p) => p.b)).toContain('대운');
  });

  test('요약 판정은 관계 이름이 정확히 맞을 때만 — 해극오(생극)는 해(害)가 아니다', () => {
    expect(isKeyRelation('해')).toBe(true);
    expect(isKeyRelation('합(토)')).toBe(true);
    expect(isKeyRelation('반합(화)')).toBe(true);
    expect(isKeyRelation('해극오')).toBe(false);
    expect(isKeyRelation('해생목')).toBe(false);
  });

  test('요약은 합·충·형·파·해·원진이 걸린 쌍만 담는다', () => {
    const r = analyzePillarRelations(saju, 2027);
    expect(r.summary.length).toBeGreaterThan(0);
    for (const line of r.summary) expect(line).toMatch(/합|충|형|파|해|원진|귀문/);
  });

  test('analyze_saju relations 타입으로 호출된다', async () => {
    const out = JSON.parse(
      await handleAnalyzeSaju({
        birthDate: '1990-05-15',
        birthTime: '10:30',
        gender: 'male',
        analysisType: 'relations',
        targetYear: 2026,
      })
    );
    expect(out.seUn.ganji).toBe('병오');
    expect(out.natal).toHaveLength(6);
  });
});
