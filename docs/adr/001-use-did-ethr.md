# ADR-001: Use `did:ethr` as the sole DID method in v0.3

**Status:** Accepted
**Date:** 2026-03-15
**Deciders:** core protocol team
**Supersedes:** —
**Superseded by:** —

## Context

The protocol needs a DID method for Agent identifiers. The W3C DID Method Registry lists over 200 methods. We must pick one for v0.3 and leave room for more.

Key constraints:

- **On-chain writes are cheap enough for testnet, acceptable on an L2 mainnet.** We have an EVM-backed reputation contract anyway.
- **Wallet-address binding is desirable.** The protocol ties reputation and payments to an Ethereum-addressable party; a DID method that embeds the address saves a lookup step.
- **Existing tooling matters.** ES256K signing, ethr-did-resolver, and Veramo all implement `did:ethr` out of the box.
- **Interoperability with the broader DID ecosystem.** Anything we pick should resolve via standard resolvers.

## Options considered

### A. `did:ethr` (ERC-1056)
- Address-embedding: YES (DID *is* `did:ethr:<network>:<address>`).
- Resolution: on-chain via Ethereum DID Registry at `0xd1D374DDE031075157fDb64536eF5cC13Ae75000`.
- Signing: secp256k1 / ES256K.
- Wallet privacy: None — wallet address is the DID.

### B. `did:key`
- Self-contained (no registry).
- Excellent privacy (no address disclosure).
- Static — no way to publish DID document updates on-chain without a second layer.
- No natural binding to on-chain reputation. Would require a mapping contract.

### C. `did:web`
- Rooted in DNS / HTTPS.
- Centralized by design (domain owner controls).
- Still needs a separate mechanism to tie an Agent to an Ethereum address.

### D. `did:pkh` (Public Key Hash)
- Similar to `did:ethr` but method-agnostic.
- Still embeds the address; no tooling advantage over `did:ethr`.

## Decision

**Use `did:ethr` as the sole DID method in protocol v0.3.**

The protocol's core value proposition (on-chain reputation + payment negotiation) already assumes an Ethereum-addressable party, so there is no wallet-address-privacy to preserve. `did:ethr` gives us resolution, signing, and tooling for free.

## Consequences

**Positive:**
- Zero new plumbing needed; Veramo + ethr-did-resolver work out of the box.
- DIDs, wallets, and on-chain reputation share a single identity key.
- Battle-tested: `did:ethr` has been in the W3C registry since 2018.

**Negative:**
- Wallet address disclosure is inherent — there is no way to hide it while using this method.
- Wallet key rotation requires a new DID (and loses reputation history).

## Forward path

Future protocol revisions (see [ADR-006](./006-in-memory-registry.md) and SPEC §17.1) MAY add `did:web` and/or `did:key` to support Agents that need wallet-address privacy or operate off-chain. Any such additions will require defining a mapping from the new method's identifier to an Ethereum address for reputation linkage.
