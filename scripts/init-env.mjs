#!/usr/bin/env node
import { existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const envFile = resolve(root, '.env');
const exampleFile = resolve(root, '.env.example');

if (existsSync(envFile)) {
  console.info('.env already exists — leaving it alone.');
  process.exit(0);
}

if (!existsSync(exampleFile)) {
  console.warn('.env.example missing — nothing to copy.');
  process.exit(0);
}

copyFileSync(exampleFile, envFile);
console.info('.env created from .env.example.');
