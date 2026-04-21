import { readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve the root directory of the test-vectors tree. When the package is
 * consumed from source in the monorepo, the vectors live at
 * ../../../spec/test-vectors. When published to npm, vectors ship inside
 * the package at ./vectors (see package.json "files" field and the
 * copy-vectors build step).
 */
function vectorsRoot(): string {
  const published = resolve(__dirname, '..', 'vectors');
  try {
    if (statSync(published).isDirectory()) return published;
  } catch { /* fall through */ }
  return resolve(__dirname, '..', '..', '..', 'spec', 'test-vectors');
}

export type VectorCategory =
  | 'did-parsing'
  | 'trust-score'
  | 'temporal-decay'
  | 'antifraud'
  | 'challenge-serialization';

export interface LoadedVector<T = unknown> {
  path: string;
  name: string;
  category: VectorCategory;
  description: string;
  input: T;
  expected: unknown;
  notes?: string;
}

export function loadVectors<T = unknown>(category: VectorCategory): LoadedVector<T>[] {
  const dir = join(vectorsRoot(), category);
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
  return files.map((f) => {
    const path = join(dir, f);
    const raw = JSON.parse(readFileSync(path, 'utf-8')) as {
      description: string;
      input: T;
      expected: unknown;
      notes?: string;
    };
    return {
      path,
      name: f.replace(/\.json$/, ''),
      category,
      description: raw.description,
      input: raw.input,
      expected: raw.expected,
      notes: raw.notes,
    };
  });
}
