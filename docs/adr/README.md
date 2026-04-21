# Architecture Decision Records

This directory contains the significant architecture decisions for EtereCitizen. Each file is an immutable record of a decision at a point in time: the context, the options considered, the decision taken, and the consequences.

New ADRs are append-only. If a later decision supersedes an earlier one, the older ADR is marked "Superseded by ADR-NNN" but its contents remain intact — the point is to preserve the reasoning trail.

Format follows the Michael Nygard template (slightly adapted).

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [001](./001-use-did-ethr.md) | Use `did:ethr` as the sole DID method in v0.3 | Accepted | 2026-03-15 |
| [002](./002-jwt-proof-format.md) | JWT proof format for Verifiable Credentials | Accepted | 2026-03-15 |
| [003](./003-hash-commitment.md) | On-chain hash commitment, off-chain full VC | Accepted | 2026-03-20 |
| [004](./004-off-chain-decay.md) | Compute temporal decay and antifraud off-chain | Accepted | 2026-03-20 |
| [005](./005-single-owner-initial.md) | Launch with single-owner contract, move to multisig pre-mainnet | Accepted | 2026-03-26 |
| [006](./006-in-memory-registry.md) | Start with in-memory Discovery registry; migrate to ERC-8004 | Accepted | 2026-03-26 |

## When to write a new ADR

Write one if the decision is:

- Hard to reverse (wire format, on-chain interface).
- Non-obvious (someone will wonder "why is it done this way?").
- Controversial (at least one competing alternative was seriously considered).

You do NOT need an ADR for:

- Library version bumps.
- Code-style choices documented in lint/prettier config.
- Refactors that preserve observable behavior.
