# ADR-002: JWT proof format for Verifiable Credentials

**Status:** Accepted
**Date:** 2026-03-15

## Context

W3C Verifiable Credentials permit multiple proof formats, principally:

1. **JWT** (signed JSON Web Tokens), via `did-jwt-vc`.
2. **Linked Data Proofs** (LD-Proofs, e.g., `Ed25519Signature2020`, `EcdsaSecp256k1Signature2019`), via the `vc-js` / `jsonld-signatures` stack.

These are functionally equivalent for the protocol's purposes — both embed a signature, both reference the issuer's DID, both verify the credential payload.

## Decision

**Use JWT (`JwtProof2020`) with `ES256K` (secp256k1 + SHA-256) as the sole proof format in v0.3.**

## Rationale

- **Signing key material already available.** Our DIDs use secp256k1 (ADR-001), and ES256K is the JWT algorithm matching that curve.
- **No JSON-LD canonicalization required.** LD-Proofs rely on [RDF Dataset Canonicalization](https://www.w3.org/TR/rdf-canon/), which is complex, has multiple implementations, and has had security issues. JWT is a flat base64url-encoded envelope.
- **Library support.** `did-jwt-vc` is mature, widely used, and has a small surface area. LD-Proof libraries tend to be larger and have more transitive dependencies.
- **Debuggability.** A JWT can be decoded by hand; an LD-Proof requires the full JSON-LD + canonicalization machinery.

## Consequences

**Positive:**
- Smaller dependency footprint in the reference SDK.
- Straightforward to port to other languages (any JWT library suffices).
- Lower signature verification latency.

**Negative:**
- Loses some compact JSON-LD semantics for on-the-wire credentials.
- Not directly compatible with LD-Proof-only verifiers — interop requires consumers to support JWT VCs.

## Forward path

A future major version MAY add LD-Proof support alongside JWT. Both would coexist and verifiers would accept either. We do not plan to deprecate JWT.
