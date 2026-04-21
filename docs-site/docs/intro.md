---
id: intro
title: EtereCitizen Protocol
sidebar_label: Introduction
sidebar_position: 0
slug: /intro
---

# EtereCitizen

**An open protocol for AI-agent identity, trust, and commerce.**

EtereCitizen gives autonomous software agents — AI assistants, automated trading bots, multi-agent orchestration frameworks — a verifiable identity, portable reputation, and a trust-based payment negotiation ceremony. Everything runs on existing open standards (W3C DIDs, W3C Verifiable Credentials, ERC-1056, EIP-4361, x402) so no single vendor is between your agent and its counterparty.

## What you get

- **Cryptographic agent identity** via `did:ethr` — every Agent has a DID and a signing key.
- **Capability attestation** via W3C Verifiable Credentials — self-claimed or third-party verified.
- **On-chain reputation** — ratings stored with anti-spam cooldowns, anti-fraud detection, and temporal decay.
- **Private payment negotiation** — request a payment address only after wallet ownership is proven.
- **No central gatekeeper** — the reference contract is on Base. You run the SDK locally or call the public API.

## Start here

- Read the **[Specification](/specification/spec)** if you want to understand how the protocol works end-to-end.
- Follow the **[Getting Started](/guides/getting-started)** guide to install the SDK and verify your first DID.
- Browse the **[Architecture Decisions](/adr)** to see why we made the choices we made.
- Check the **[Conformance registry](/specification/conformance)** to see which implementations are validated against the test vectors.

## Reference implementations

| Implementation | Profile | Vectors passing |
|---|---|---|
| [`@eterecitizen/sdk`](/implementations/typescript) (TypeScript) | `core` partial | 23 / 23 |
| [`eterecitizen`](/implementations/python) (Python) | `core` partial | 23 / 23 |

Both implementations execute the canonical test vectors in CI on every pull request. Cross-language divergence is a build failure.

## Design principles

1. **The specification is authoritative.** Implementations implement the spec, not the other way around.
2. **Standards first, value second.** If we have to choose between an existing standard and a proprietary shortcut, we pick the standard.
3. **Decentralised by default, centralised by choice.** Every service should be replaceable; no path requires trusting us.
4. **Readable over clever.** The code in the repo and the prose in the spec should both be skimmable by an engineer who has never seen either.

## License

Apache License, Version 2.0. Commercial use is welcomed. Attribution is appreciated.
