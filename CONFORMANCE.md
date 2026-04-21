# EtereCitizen Protocol — Conformance

This page is the canonical registry of implementations that have demonstrated conformance with the EtereCitizen protocol specification.

- **Specification:** [SPEC.md](./SPEC.md) v0.3.0
- **Test vectors:** [spec/test-vectors/](./spec/test-vectors/) — 23 canonical vectors
- **Conformance profiles:** SPEC §18

An implementation is **conformant** at a given profile when it passes every applicable test vector from the current version of the specification. Profiles are additive: `full` includes `core` + `issuer` + `verifier` + Discovery.

## Conforming implementations

| Implementation | Language | Profile | Version | Vectors | Notes |
|---|---|---|---|---|---|
| [`@eterecitizen/sdk`](./packages/sdk/) | TypeScript | `core` (partial: deterministic compute) | 0.1.x | 23/23 | Reference implementation. Full `core` requires VC issuance + DID resolution, both present; a remaining VC-JWT proof-format regression test is in follow-up. |
| [`eterecitizen`](./sdks/python/) (Python) | Python | `core` (partial: deterministic compute) | 0.1.0 | 23/23 | Zero runtime dependencies. DID resolution, VC issuance/verification, and on-chain writes arrive in 0.2.0. |

Both implementations execute automatically on every pull request via the CI workflows `ci.yml` and `python-sdk.yml`. Divergence in vector output between implementations is a CI failure.

## Conformance claim checklist

To add a new implementation to this registry:

1. Read [SPEC.md](./SPEC.md) in full. In particular §18 (Conformance Profiles).
2. Implement the deterministic protocol surface (`core` profile §18.1) in your target language.
3. Run your implementation against every vector in `spec/test-vectors/`:
    - Either via a thin adapter to [`@eterecitizen/conformance`](./packages/conformance/README.md), if you write a JavaScript-callable bridge.
    - Or natively, by loading each JSON file and asserting your outputs match.
4. Achieve `23/23 passed, 0 failed`. Partial passes are fine for draft status but not for this registry.
5. Open a pull request that:
    - Adds your code under `sdks/<language>/` if hosted in-repo, **or** links to the external repository;
    - Wires CI such that the conformance suite runs on your implementation on every PR;
    - Adds a row to the table above with honest profile claims.

## Conformance floating-point tolerance

All deterministic numeric outputs (trust score, decay weights) MUST match the expected vector value to at least `1e-12` relative tolerance. Divergences in the last bit or two are acceptable provided the implementation documents its floating-point semantics; larger divergences are non-conformant and warrant a specification issue rather than silent deviation.

## Updating vectors

Vectors are generated from the TypeScript reference implementation and locked. They are updated only when SPEC.md changes the underlying semantics — in which case every listed implementation must be updated in the same release window.

Vector update procedure:

1. Open a "Specification issue" explaining the change.
2. Get consensus on the new semantics.
3. Update SPEC.md.
4. Regenerate vectors by running the reference implementation against the new code paths; update the JSON files.
5. Update every implementation listed above in the same pull request chain.
6. Bump the protocol version per SPEC §19.

## Divergences

If a conforming implementation ever produces a different result than the expected vector, one of three things is true:

1. **Bug in the implementation.** Fix the implementation.
2. **Bug in the vector.** Correct the JSON and bump the vectors' revision.
3. **Ambiguity in SPEC.md.** File a "Specification issue" and resolve before correcting either.

The specification is authoritative. The vectors encode the specification. The implementations implement the specification. In that order.
