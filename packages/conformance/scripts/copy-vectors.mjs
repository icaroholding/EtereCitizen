#!/usr/bin/env node
// Copy the test vectors from the repo-root spec/ tree into the package so
// they ship inside the published tarball and are discoverable at runtime.

import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '..', '..', '..', 'spec', 'test-vectors');
const dst = resolve(here, '..', 'vectors');

rmSync(dst, { recursive: true, force: true });
mkdirSync(dst, { recursive: true });
cpSync(src, dst, { recursive: true });
console.log(`copied vectors → ${dst}`);
