/* Read-only validation of every tracked source, including nested refactor modules. */
import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const names = execFileSync('git', ['ls-files', '-z'], {encoding: 'utf8'}).split('\0').filter(Boolean);
const sources = names.filter(name => /\.(?:js|mjs)$/.test(name));
const tests = names.filter(name => name.startsWith('tools/') && name.endsWith('.test.mjs'));
if (!sources.length || !tests.length) throw new Error('No tracked sources or tests found');
for (const name of names.filter(name => /\.(?:js|mjs|css|html|md|json|yml)$/.test(name))) {
  if (readFileSync(name).length > 25000) throw new Error('File exceeds 25000 bytes: ' + name);
}
for (const source of sources) {
  const check = spawnSync(process.execPath, ['--check', source], {stdio: 'inherit'});
  if (check.error) throw check.error;
  if (check.status !== 0) process.exit(check.status ?? 1);
}
const result = spawnSync(process.execPath, ['--test', ...tests], {stdio: 'inherit'});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
