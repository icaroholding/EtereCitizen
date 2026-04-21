# ADR-005: Launch with single-owner contract, move to multisig pre-mainnet

**Status:** Accepted
**Date:** 2026-03-26

## Context

The Reputation Contract has four privileged operations:

- `setReviewFee(newFee)`
- `withdrawFees(to)`
- `addVerifier(address)` / `removeVerifier(address)`
- `setVerificationLevel(agent, level)` (indirectly, via authorized verifiers)

These are guarded by OpenZeppelin's `Ownable`. In v0.3 the owner is a single externally-owned account (EOA).

## Decision

**Keep single-owner EOA control for testnet. Transfer ownership to a Gnosis Safe multisig (2-of-3 minimum) before any Base mainnet deployment.**

Further, before mainnet, a meaningful DAO or token-holder governance layer SHOULD be evaluated; this is tracked in Phase 3.

## Rationale

- **Operational velocity during beta.** Testnet bug fixes, fee adjustments, and verifier onboarding benefit from fast iteration. A multisig adds coordination overhead that is not justified for testnet value ($0).
- **Security posture for mainnet.** A single hot wallet controlling review fees, verifier authorization, and verification levels is an unacceptable single point of failure for production value.
- **Well-understood migration path.** OpenZeppelin's `Ownable` supports `transferOwnership(newOwner)`, and Gnosis Safe can be the `newOwner` address without any contract change.

## Consequences

**Positive:**
- Fast iteration during the testnet phase where no value is at risk.
- Clean migration: a single `transferOwnership` call moves governance to a multisig, no redeployment needed.

**Negative:**
- Until the multisig is live, anyone who compromises the single key has full administrative control.
- The operator needs to remember to do the handoff. Mitigation: this is tracked in `TODOS.md` Phase 1 as a mainnet prerequisite.

## Forward path

- **Phase 2** (3-6 months post-mainnet): introduce DAO governance for verifier authorization. Fee decisions remain with the core team initially.
- **Phase 3** (6-12 months): full on-chain governance including fee parameters and contract upgrades (if a proxy pattern is adopted).
