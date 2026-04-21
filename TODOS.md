# TODOS

Items identified during the CEO Plan Review (2026-03-26). Status updated 2026-04-21.

## Phase 1 — Production Readiness

### Done
- [DONE] Fix EtereCitizen.sol v2 (CEI pattern, txHash uniqueness, refund, capability bound)
- [DONE] Implement VC cryptographic verification
- [DONE] Add custom error types (EtereCitizenError hierarchy)
- [DONE] Add structured logging (pino)
- [DONE] API → SDK integration + auth + error sanitization
- [DONE] CLI + MCP integration tests (+90 tests)
- [DONE] Web package cleanup (common types, all 16 categories, loading states)
- [DONE] Badge SVG endpoint
- [DONE] CLI `citizen whoami` command
- [DONE] `npx @eterecitizen/create` scaffolder
- [DONE] QR code on web identity card
- [DONE] Verification level progression bar
- [DONE] Deploy EtereCitizen.sol v2 to Base Sepolia (`0xf0fe3326cCab970F62F9639eCdeec028F050261d`)
- [DONE] Publish `@eterecitizen/sdk` to npm (v0.1.0)
- [DONE] Publish `@eterecitizen/cli` to npm (v0.1.0)
- [DONE] Publish `@eterecitizen/common` to npm (v0.1.0)
- [DONE] Publish `@eterecitizen/create` to npm (v0.1.0)
- [DONE] Publish `@eterecitizen/mcp-server` to npm (v0.1.0)
- [DONE] Deploy API to Fly.io (`api.eterecitizen.io`)
- [DONE] Configure DNS (api.eterecitizen.io, eterecitizen.io)
- [DONE] Deploy Web to Vercel (`eterecitizen.io`)

### Still to do
- [ ] Deploy EtereCitizen.sol v2 to Base Mainnet (blocked on audit)
- [ ] **Security audit of smart contracts** — prerequisite for mainnet
- [ ] Transfer contract ownership to Gnosis Safe multisig (before mainnet)
- [ ] Add AbortController timeouts (10s) on all RPC/IPFS calls
- [ ] Deprecate CitizenReputation.sol (mark as legacy, remove from active dev)
- [ ] Commit veramo-init.ts secret key persistence fix
- [ ] **Configure npm Trusted Publishers** on npmjs.com for each `@eterecitizen/*` package (manual step, see `.github/workflows/release.yml`)
- [ ] Add Sentry for error monitoring (API + Web)
- [ ] Add status page (Better Stack / UptimeRobot) at `status.eterecitizen.io`

## Phase 2 — Ecosystem Growth (3-6 months)

- [ ] ERC-8004 on-chain agent registry (replace in-memory Map)
- [ ] Coinbase CDP wallet adapter
- [ ] Openfort wallet adapter
- [ ] On-chain antifraud scoring
- [ ] API versioning (v1/)
- [ ] DID revocation support
- [ ] Redis-based rate limiting (replace in-memory, e.g., Upstash)
- [ ] Caching layer (DID resolution, contract reads)
- [ ] Contract proxy upgrade pattern
- [ ] Changesets-based versioning for npm packages
- [ ] Demo app showing end-to-end flow (public)

## Phase 3 — Standard Adoption (6-12 months)

- [ ] Multi-chain support (did:key, did:web)
- [ ] Governance DAO for verifier authorization
- [ ] Fee redistribution to verifiers
- [ ] Mobile SDK (React Native)
- [ ] NIST formal alignment
- [ ] EU AI Act compliance toolkit
