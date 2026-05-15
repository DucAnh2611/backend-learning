#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const onWindows = process.platform === 'win32';

const SERVICES = {
  postgres: { volume: 'securevault-postgres-data' },
  redis: { volume: 'securevault-redis-data' },
};
const ACTIONS = new Set(['start', 'stop', 'reset', 'reinstall']);

const [service, action] = process.argv.slice(2);
if (!SERVICES[service] || !ACTIONS.has(action)) {
  console.error(
    `Usage: node scripts/docker-service.mjs <${Object.keys(SERVICES).join('|')}> <${[...ACTIONS].join('|')}>`,
  );
  process.exit(2);
}

const tag = `\x1b[36m[${service}:${action}]\x1b[0m`;
const log = (msg) => console.info(`${tag} ${msg}`);
const die = (msg) => {
  console.error(`\x1b[31m[${service}:${action}]\x1b[0m ${msg}`);
  process.exit(1);
};

const docker = (args, { allowFail = false } = {}) => {
  log(`docker ${args.join(' ')}`);
  const r = spawnSync('docker', args, { stdio: 'inherit', cwd: root, shell: onWindows });
  if (r.status !== 0 && !allowFail) die(`failed (exit ${r.status})`);
  return r.status === 0;
};

switch (action) {
  case 'start':
    docker(['compose', 'up', '-d', service]);
    break;
  case 'stop':
    docker(['compose', 'stop', service]);
    break;
  case 'reset':
    docker(['compose', 'stop', service]);
    docker(['compose', 'rm', '-f', service]);
    docker(['volume', 'rm', '-f', SERVICES[service].volume], { allowFail: true });
    docker(['compose', 'up', '-d', service]);
    break;
  case 'reinstall':
    docker(['compose', 'stop', service]);
    docker(['compose', 'rm', '-f', service]);
    docker(['compose', 'pull', service]);
    docker(['compose', 'up', '-d', service]);
    break;
}

log('done.');
