#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const onWindows = process.platform === 'win32';

const log = (msg) => console.info(`\x1b[36m[docker:setup]\x1b[0m ${msg}`);
const ok = (msg) => console.info(`\x1b[32m[docker:setup]\x1b[0m ${msg}`);
const die = (msg) => {
  console.error(`\x1b[31m[docker:setup]\x1b[0m ${msg}`);
  process.exit(1);
};

const run = (args) => {
  const r = spawnSync('docker', args, { stdio: 'inherit', cwd: root, shell: onWindows });
  if (r.status !== 0) die(`\`docker ${args.join(' ')}\` failed (exit ${r.status}).`);
};

// 1. docker CLI available?
try {
  execSync('docker --version', { stdio: 'ignore' });
} catch {
  die('Docker CLI not found. Install Docker Desktop (Windows/macOS) or Docker Engine (Linux).');
}

// 2. docker daemon running?
try {
  execSync('docker info', { stdio: 'ignore' });
} catch {
  die('Docker daemon is not running. Start Docker Desktop and re-run this script.');
}

// 3. ensure .env exists (so compose substitution picks up overrides)
const envFile = resolve(root, '.env');
const exampleFile = resolve(root, '.env.example');
if (!existsSync(envFile) && existsSync(exampleFile)) {
  copyFileSync(exampleFile, envFile);
  ok('.env created from .env.example');
}

// 4. pull images (cached on subsequent runs)
log('Pulling images...');
run(['compose', 'pull', 'postgres', 'redis']);

// 5. start services
log('Starting postgres + redis...');
run(['compose', 'up', '-d', 'postgres', 'redis']);

// 6. wait for healthchecks
log('Waiting for services to become healthy (up to 60s)...');
const containers = ['securevault-postgres', 'securevault-redis'];
const deadline = Date.now() + 60_000;

const statusOf = (name) => {
  try {
    return execSync(`docker inspect --format "{{.State.Health.Status}}" ${name}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'missing';
  }
};

while (Date.now() < deadline) {
  const statuses = containers.map((c) => [c, statusOf(c)]);
  if (statuses.every(([, s]) => s === 'healthy')) {
    ok('All services healthy.');
    ok('postgres → localhost:5432    redis → localhost:6379');
    ok('Next: `npm run dev`');
    process.exit(0);
  }
  log(statuses.map(([c, s]) => `${c}=${s}`).join('   '));
  await sleep(2000);
}

die('Timed out waiting for healthchecks. Inspect with `npm run db:logs`.');
