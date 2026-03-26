# TODOS

Items identified during the CEO Plan Review (2026-03-26). Items marked [DONE] were implemented in the same session.

## Phase 1 — Production Readiness

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
- [ ] Deploy EtereCitizen.sol v2 to Base Sepolia + Mainnet
- [ ] Publish @eterecitizen/sdk to npm
- [ ] Publish @eterecitizen/cli to npm
- [ ] Publish @eterecitizen/mcp-server to npm
- [ ] Deploy API to Fly.io
- [ ] Configure DNS (api.eterecitizen.io)
- [ ] Add AbortController timeouts (10s) on all RPC/IPFS calls
- [ ] Deprecate CitizenReputation.sol (mark as legacy, remove from active dev)
- [ ] Commit veramo-init.ts secret key persistence fix

## Phase 2 — Ecosystem Growth (3-6 months)

- [ ] ERC-8004 on-chain agent registry (replace in-memory Map)
- [ ] Coinbase CDP wallet adapter
- [ ] Openfort wallet adapter
- [ ] On-chain antifraud scoring
- [ ] API versioning (v1/)
- [ ] DID revocation support
- [ ] Redis-based rate limiting (replace in-memory)
- [ ] Caching layer (DID resolution, contract reads)
- [ ] Contract proxy upgrade pattern

## Phase 3 — Standard Adoption (6-12 months)

- [ ] Multi-chain support (did:key, did:web)
- [ ] Governance DAO for verifier authorization
- [ ] Fee redistribution to verifiers
- [ ] Mobile SDK (React Native)
- [ ] NIST formal alignment
- [ ] EU AI Act compliance toolkit
