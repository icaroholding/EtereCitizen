# ADR-006: Start with in-memory Discovery registry; migrate to ERC-8004

**Status:** Accepted
**Date:** 2026-03-26

## Context

SPEC §13 defines an optional Agent Discovery layer: query Agents by capability, minimum rating, verification level. Discovery is NOT the authoritative source of Agent state — on-chain state is — but it provides fast search that the reputation contract itself doesn't support natively.

Two broad approaches:

1. **Off-chain index** — a service that subscribes to on-chain events and maintains a searchable database. Fast, cheap, but centralized (one index, one operator).
2. **On-chain registry** — a contract that stores capability→agent mappings for direct queries. Permissionless, censorship-resistant, but gas-intensive.

The Ethereum community is converging on **ERC-8004** as a standard on-chain agent registry. ERC-8004 is draft as of 2026-04.

## Decision

**Ship v0.3 with an in-memory registry (`ERC8004Client` stub) inside the SDK. When ERC-8004 is finalized and has a canonical deployment, migrate the SDK to read/write that contract.**

The stub already uses the name `ERC8004Client` precisely so the swap is mechanical: the API shape is stable, the implementation is swapped.

## Rationale

- **Unblock early adopters today.** Applications can use Discovery immediately without waiting for ERC-8004's EIP finalization and canonical deployment.
- **Minimize rework on migration.** The SDK's public surface does not change when the implementation swaps from in-memory to on-chain.
- **Respects the authoritative boundary.** Discovery is explicitly not authoritative (§13 C-800). Verifiers always cross-check against the Reputation Contract, which doesn't change.
- **Low near-term demand for decentralized discovery.** Early ecosystem has fewer than a dozen Agents; search performance is trivial. Decentralization of discovery becomes urgent only at thousands-of-Agents scale.

## Consequences

**Positive:**
- Zero on-chain cost for discovery during the ramp-up phase.
- Perfect fidelity between the SDK's public API today and post-migration.
- Follows ecosystem standard once ERC-8004 matures.

**Negative:**
- In-memory registry state is not shared across SDK processes. Two Verifiers on different machines have different indexes. Acceptable because on-chain state is authoritative.
- A future migration will require a one-time crawl of existing on-chain `AgentRegistered` events to populate the ERC-8004 registry. Planned via a migration script, not automated.

## Forward path

- **Now**: `ERC8004Client` is an in-memory map in the SDK.
- **When ERC-8004 reaches Last Call**: implement the on-chain adapter behind the same interface, ship behind a feature flag.
- **When ERC-8004 is Final**: default SDK to the on-chain adapter; deprecate the in-memory fallback.
