#!/usr/bin/env node
// Copies canonical markdown documents from the repository root into the
// Docusaurus docs/ tree, adding frontmatter where needed so Docusaurus can
// render them with the correct sidebar position and title. This keeps the
// canonical artefacts (SPEC.md, CONFORMANCE.md, …) in the repo root as the
// single source of truth and re-materialises them for the site on every build.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const docsOut = resolve(here, '..', 'docs');

function copyWithFrontmatter(src, dstRel, frontmatter) {
  const srcPath = resolve(repoRoot, src);
  const body = readFileSync(srcPath, 'utf-8');
  const dstPath = resolve(docsOut, dstRel);
  mkdirSync(dirname(dstPath), { recursive: true });

  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`)
    .join('\n');

  // Strip any leading h1 heading since Docusaurus's frontmatter provides the title.
  const stripped = body.replace(/^#\s+.*?\n+/, '');

  writeFileSync(dstPath, `---\n${fm}\n---\n\n${stripped}`);
  console.log(`  synced ${src} → docs/${dstRel}`);
}

// Specification artefacts
copyWithFrontmatter('SPEC.md', 'specification/spec.md', {
  title: 'Protocol Specification',
  sidebar_label: 'Full Specification',
  sidebar_position: 1,
});

copyWithFrontmatter('CONFORMANCE.md', 'specification/conformance.md', {
  title: 'Conformance',
  sidebar_label: 'Conformance',
  sidebar_position: 2,
});

copyWithFrontmatter('THREAT-MODEL.md', 'specification/threat-model.md', {
  title: 'Threat Model',
  sidebar_label: 'Threat Model',
  sidebar_position: 3,
});

// ADRs — rebuild index page + sync each record
const adrSrcDir = resolve(repoRoot, 'docs', 'adr');
const adrFiles = readdirSync(adrSrcDir)
  .filter((f) => f.endsWith('.md') && f !== 'README.md')
  .sort();

copyWithFrontmatter('docs/adr/README.md', 'adr/index.md', {
  title: 'Architecture Decision Records',
  sidebar_label: 'Overview',
  sidebar_position: 0,
});

adrFiles.forEach((f, i) => {
  const match = f.match(/^(\d+)-(.+)\.md$/);
  if (!match) return;
  const [, number, slug] = match;
  copyWithFrontmatter(`docs/adr/${f}`, `adr/${f}`, {
    title: `ADR-${number}: ${slug.replace(/-/g, ' ')}`,
    sidebar_label: `ADR-${number}`,
    sidebar_position: i + 1,
  });
});

// Existing guides
const guideFiles = [
  ['getting-started.md', 'Getting Started', 10],
  ['tutorial.md', 'Tutorial', 20],
  ['api-reference.md', 'API Reference', 30],
  ['cli-reference.md', 'CLI Reference', 40],
  ['mcp-tools.md', 'MCP Tools', 50],
  ['smart-contracts.md', 'Smart Contracts', 60],
  ['architecture.md', 'Architecture', 70],
  ['privacy.md', 'Privacy', 80],
  ['nist-submission.md', 'NIST Submission', 90],
];

for (const [file, title, pos] of guideFiles) {
  const srcPath = resolve(repoRoot, 'docs', file);
  if (!existsSync(srcPath)) continue;
  copyWithFrontmatter(`docs/${file}`, `guides/${file}`, {
    title,
    sidebar_label: title,
    sidebar_position: pos,
  });
}

console.log('\nDocs sync complete.');
