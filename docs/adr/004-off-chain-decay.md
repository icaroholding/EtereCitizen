# ADR-004: Compute temporal decay and antifraud off-chain

**Status:** Accepted
**Date:** 2026-03-20

## Context

The trust model (SPEC §10) has two non-trivial computations:

1. **Temporal decay** — older reviews weigh less (exponential half-life).
2. **Antifraud detection** — burst, cluster, reciprocal flags.

Both could be computed either on-chain (inside the Reputation Contract) or off-chain (inside the Verifier's SDK).

## Options considered

### A. On-chain computation
- Scores returned by `getReputation(did)` already include decay and flags.
- Verifiers trust the chain's output directly.
- Gas cost: every `submitReview` would need to update historical weighted sums; recomputing the sliding window of antifraud flags on each write is O(N).

### B. Off-chain computation (chosen)
- The chain stores raw data: review records (rating, timestamp, reviewer, reviewed).
- Verifiers read the raw data and compute decay + antifraud locally.
- Verifiers MAY apply different policies (different half-life, different flag weights) per application.

### C. Hybrid
- Decay on-chain, antifraud off-chain.
- Inherits the gas cost of decay without fully centralizing the policy.

## Decision

**All decay and antifraud computation happens off-chain, inside the SDK.**

The contract stores only raw review data.

## Rationale

- **Gas efficiency.** Antifraud is O(reviews²) worst case; doing it per-write is quadratic in write count. Off-chain scales freely.
- **Policy flexibility.** Different Verifier applications (e.g., a low-stakes tip jar vs. a high-stakes B2B deal) want different decay half-lives and flag sensitivities. On-chain policy is one-size-fits-all.
- **Upgrade velocity.** Fixing an antifraud bug off-chain ships with the next SDK release; fixing one on-chain requires a contract upgrade.
- **Canonicalization.** Conformance vectors (`spec/test-vectors/`) fix the canonical formula so all Verifiers that run the reference policy produce identical outputs.

## Consequences

**Positive:**
- `submitReview` gas is stable and predictable — no quadratic blowup.
- Verifiers can tune policy without touching the chain.
- Antifraud improvements ship at SDK cadence, not contract cadence.

**Negative:**
- On-chain data alone does not express a trust verdict. A naive direct contract reader gets only raw scores; they must apply a policy.
- Two Verifiers with different policies can compute different scores from the same data, which is valid by design but may confuse users expecting a canonical number.

## Forward path

A future minor version MAY define optional on-chain helpers for common aggregations (e.g., a view function returning total-sum-by-category and count). These MUST NOT replace the off-chain policy, only provide convenience.
