import { spawnSync } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const out = 'artifacts/base-dist';
const base = '/test-site/';
const result = spawnSync('npm', ['run', 'build', '--', '--outDir', out], {
  env: { ...process.env, BASE_PATH: base, SITE_URL: 'https://example.invalid' },
  stdio: 'inherit',
});
assert.equal(result.status, 0, 'Subpath build must succeed');
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
let count = 0;
for (const file of (await walk(out)).filter(file => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const targets = [...html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)].map(match => match[1]);
  for (const match of html.matchAll(/srcset="([^"]*)"/g)) targets.push(...match[1].split(',').map(item => item.trim().split(' ')[0]));
  for (const target of targets) {
    if (/^https?:/.test(target)) continue;
    assert(target.startsWith(base), `${file}: unprefixed URL ${target}`);
    const relative = target.slice(base.length).split(/[?#]/)[0];
    const resolved = path.join(out, relative);
    const info = await stat(resolved);
    if (info.isDirectory()) assert((await stat(path.join(resolved, 'index.html'))).isFile());
    count++;
  }
  assert(html.includes('https://example.invalid/test-site/'), `${file}: canonical URL missing`);
}
console.log(`PASS subpath build: ${count} local links/assets resolve, canonical prefix verified`);
