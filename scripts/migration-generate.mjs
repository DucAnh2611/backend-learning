#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const onWindows = process.platform === 'win32';

const [name] = process.argv.slice(2);
if (!name) {
  console.error('\x1b[31m[migration:gen]\x1b[0m missing name.');
  console.error('');
  console.error('Usage:  npm run migration:gen -- <Name>');
  console.error('Example: npm run migration:gen -- AddRefreshTokens');
  process.exit(2);
}

if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
  console.error(`\x1b[31m[migration:gen]\x1b[0m invalid name "${name}".`);
  console.error('Use PascalCase letters/digits only, e.g. AddRefreshTokens.');
  process.exit(2);
}

const migPath = `src/db/migrations/${name}`;
console.info(`\x1b[36m[migration:gen]\x1b[0m diffing entities → ${migPath}`);

const r = spawnSync(
  onWindows ? 'npm.cmd' : 'npm',
  ['run', 'typeorm', '--', 'migration:generate', migPath, '-d', 'src/db/data-source.ts'],
  { stdio: 'inherit', cwd: root },
);

if (r.status === 0) {
  console.info(
    `\x1b[32m[migration:gen]\x1b[0m done. Review the file, then run \`npm run migration:run\`.`,
  );
}

process.exit(r.status ?? 0);
