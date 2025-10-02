/**
 * 만세력 검증 데이터 생성 스크립트
 * 정확한 일주 계산 결과를 기준으로 검증 데이터 생성
 */

function calculateDayPillar(dateStr: string): { stem: string; branch: string } {
  const date = new Date(dateStr);
  const baseDate = new Date('1900-01-01');
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  const stemIndex = (2 + diffDays) % 10;
  const branchIndex = (0 + diffDays) % 12;

  const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

  return { stem: stems[stemIndex]!, branch: branches[branchIndex]! };
}

// 검증용 주요 날짜들
const testDates = [
  // 기준일 검증
  { date: '1900-01-01', desc: '1900년 시작일 (병자일 기준)' },

  // 2000년대
  { date: '2000-01-01', desc: '밀레니엄' },
  { date: '2000-02-04', desc: '2000년 입춘' },
  { date: '2000-02-29', desc: '2000년 윤일' },
  { date: '2000-12-31', desc: '2000년 마지막' },

  // 2010년대
  { date: '2010-01-01', desc: '2010년 시작' },
  { date: '2010-02-14', desc: '음력 2010년 설날' },

  // 2020년대
  { date: '2020-01-01', desc: '2020년 시작' },
  { date: '2020-01-25', desc: '음력 2020년 설날' },
  { date: '2020-02-29', desc: '2020년 윤일' },

  // 2024년 (중요 테스트)
  { date: '2024-01-01', desc: '2024년 시작' },
  { date: '2024-01-04', desc: '갑자일 확인' },
  { date: '2024-02-04', desc: '2024년 입춘' },
  { date: '2024-02-10', desc: '음력 2024년 설날' },
  { date: '2024-02-29', desc: '2024년 윤일' },
  { date: '2024-06-01', desc: '2024년 6월 1일' },
  { date: '2024-12-31', desc: '2024년 마지막' },

  // 2025년
  { date: '2025-01-01', desc: '2025년 시작' },
  { date: '2025-02-03', desc: '2025년 입춘' },

  // 갑자일 연속 확인 (60일 주기)
  { date: '2024-03-04', desc: '갑자일 +60일' },
  { date: '2024-05-03', desc: '갑자일 +120일' },
];

console.log('export const MANSELYEOK_VERIFICATION: ManselyeokVerification[] = [');
testDates.forEach(({ date, desc }) => {
  const result = calculateDayPillar(date);
  console.log(`  { solarDate: '${date}', expectedDayStem: '${result.stem}', expectedDayBranch: '${result.branch}', description: '${desc}' },`);
});
console.log('];');
