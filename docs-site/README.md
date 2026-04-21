# docs.eterecitizen.io

Docusaurus v3 site that presents the EtereCitizen protocol specification, conformance registry, architecture decisions, and per-implementation documentation.

The canonical markdown documents (`SPEC.md`, `CONFORMANCE.md`, `THREAT-MODEL.md`, `docs/adr/*`, `docs/*.md`) live at the repository root. Running `pnpm build` (or `pnpm start`) invokes `scripts/sync-docs.mjs`, which copies those files into `docs-site/docs/` with the Docusaurus frontmatter needed to render them.

## Local development

```bash
cd docs-site
pnpm install
pnpm start
```

The site opens at http://localhost:3000.

Changes you make to the canonical markdown at the repo root are picked up on the next `pnpm start` / `pnpm build`. Changes to files synced into `docs-site/docs/` directly will be **overwritten** on the next sync — always edit the sources.

## Production build

```bash
pnpm build
pnpm serve   # optional, preview the production build locally
```

## Deployment

Configured for Vercel:

- Framework preset: Docusaurus 2.
- Install: `pnpm install`.
- Build: `pnpm build` (runs the sync step before Docusaurus).
- Output: `build/`.

Set the Vercel project to the `docs-site/` subdirectory. Domain: `docs.eterecitizen.io`.

## What's editable vs synced

Editable in this directory:

- `docs-site/docs/intro.md` — the landing page text.
- `docs-site/docs/implementations/*.md` — per-SDK documentation.
- `docs-site/docs/contributing/*.md` — contributor-facing copy.
- Everything under `src/`, `static/`, `sidebars.ts`, `docusaurus.config.ts`, `scripts/`.

Synced automatically (do NOT edit in this directory):

- `docs-site/docs/specification/*`
- `docs-site/docs/adr/*`
- `docs-site/docs/guides/*`

Edit those at the repo root instead.
