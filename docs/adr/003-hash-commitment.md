# ADR-003: On-chain hash commitment, off-chain full VC

**Status:** Accepted
**Date:** 2026-03-20

## Context

Every Review in EtereCitizen contains:

- A task description (human-readable, potentially long).
- A category, rating, reviewer DID, reviewed DID, transaction hash, completion timestamp, optional comment.

Storing all of this on-chain is expensive (gas), public (privacy problem for sensitive task descriptions), and wasteful (most Reviews will never be queried individually).

## Decision

**On-chain: store SHA-256 hash of the full Work History Credential plus its minimal aggregation fields (reviewer, reviewed, category, rating, timestamp, txHash). Off-chain: store the full signed VC at a content-addressable location (IPFS).**

The Reputation Contract's `ReviewRecord` struct contains only:

```solidity
struct ReviewRecord {
    bytes32 reviewHash;   // SHA-256 of the VC JSON
    address reviewer;
    address reviewed;
    bytes32 txHash;
    string  category;
    uint8   rating;
    uint256 timestamp;
}
```

Verifiers reconstruct the full VC by retrieving from IPFS using the CID (obtained out-of-band or via a discovery service) and **MUST** re-hash the retrieved VC to confirm it matches `reviewHash`. Mismatch → discard.

## Rationale

- **Gas efficiency.** Storing a 32-byte hash costs ~20k gas; storing a 500-byte task description costs ~50k+ gas per 32-byte slot. 16× savings on the variable-length portion.
- **Privacy flexibility.** Task descriptions may reveal business-sensitive information. Storing them off-chain allows permissioned storage (§16.2) if needed, without changing the on-chain protocol.
- **Integrity preserved.** The hash commits to the VC; re-hashing on retrieval detects any tampering.
- **Censorship resistance via content-addressing.** The CID is deterministic from the VC, so multiple pinning services can host the same content.

## Consequences

**Positive:**
- On-chain cost per review is bounded and predictable.
- Verifiers can choose their preferred storage backend.
- The on-chain record is self-consistent even if off-chain storage fails — the aggregate score and the rating histogram still work.

**Negative:**
- Off-chain data loss is possible. Mitigations: multiple pinning services, or in-house pinning.
- Verifiers doing detailed review inspection must reach off-chain storage; a purely-on-chain Verifier sees only the aggregates.
- JSON canonicalization becomes a protocol concern: the hash must be stable across re-serializations. See [§19 open problems](../../SPEC.md#19-versioning-and-evolution) — we currently rely on insertion-order `JSON.stringify` and plan to migrate to RFC 8785 JCS.

## Forward path

We will migrate to [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785) in a minor version bump before any meaningful on-chain history accumulates. Until then, conformance vectors fix the canonicalization semantics.
