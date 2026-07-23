#!/usr/bin/env node
/**
 * .mcpb 번들 빌드
 * 사용: npm run build:mcpb
 * 산출: saju-mcp-server-<version>.mcpb (리포 루트)
 */
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const staging = join(root, '.mcpb-staging');

function run(cmd, cwd = root) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// 1. TypeScript 빌드
run('npm run build');

// 2. 스테이징 폴더 구성
rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });

// dist 복사 — 소스맵·타입 선언·벤치마크는 실행에 불필요
cpSync(join(root, 'dist'), join(staging, 'dist'), {
  recursive: true,
  filter: (src) => {
    if (src.endsWith('.map') || src.endsWith('.d.ts')) return false;
    if (src.split(sep).includes('benchmark')) return false;
    return true;
  },
});

for (const f of ['package.json', 'package-lock.json']) {
  cpSync(join(root, f), join(staging, f));
}

// manifest 복사 + 실제 버전 주입
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
manifest.version = pkg.version;
writeFileSync(join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

// 3. 프로덕션 의존성만 설치 (postinstall 등 스크립트 실행 안 함)
run('npm ci --omit=dev --ignore-scripts', staging);

// 4. 검증 후 패킹
run('npx mcpb validate .mcpb-staging/manifest.json');
const output = `saju-mcp-server-${pkg.version}.mcpb`;
run(`npx mcpb pack .mcpb-staging ${output}`);

if (!existsSync(join(root, output))) {
  console.error(`오류: ${output} 생성 실패`);
  process.exit(1);
}
console.log(`\n완료: ${output}`);
