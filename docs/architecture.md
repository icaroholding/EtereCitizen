# EtereCitizen Architecture

## Overview

EtereCitizen is a three-layer protocol for AI agent identity, trust, and commerce.

```
┌─────────────────────────────────────────────────┐
│  Layer 3 — Accountability                       │
│  Creator verification (0-3), chain of custody   │
├─────────────────────────────────────────────────┤
│  Layer 2 — Trust                                │
│  On-chain reputation, reviews, temporal decay   │
├─────────────────────────────────────────────────┤
│  Layer 1 — Identity                             │
│  DID:ethr on Base, Verifiable Credentials       │
└─────────────────────────────────────────────────┘
```

## Layer 1: Identity

### DID (Decentralized Identifier)

Every agent gets a `did:ethr` identifier anchored on Base (ERC-1056).

```
did:ethr:0x14a34:0x1234567890abcdef1234567890abcdef12345678
         └──────┘ └──────────────────────────────────────────┘
         chain ID  Ethereum address
         (hex)
```

- **DID Document**: Stored on IPFS (Pinata), hash referenced on-chain
- **Resolution**: Via Veramo + ethr-did-resolver against Base RPC
- **Verification Methods**: EcdsaSecp256k1RecoveryMethod2020

### Verifiable Credentials (W3C VC Data Model v2.0)

| Credential | Issued When | Purpose |
|---|---|---|
| Birth Certificate | Agent creation | Proves creation time, network, protocol version |
| Capability | Self-attestation or third-party | Declares agent capabilities |
| Wallet Ownership | Challenge-response | Proves wallet control (SIWE-like) |
| Work History | After reviewed transaction | Records completed work |
| Creator Verification | Manual verification | Links agent to verified creator |
| Compliance | Regulatory check | Compliance certification |

VCs are issued as JWT proofs via Veramo's CredentialPlugin.

## Layer 2: Trust

### On-Chain Reputation (CitizenReputation.sol)

```
Reviews: hash + score on-chain, full VC on IPFS
         ┌──────────────────────────────────────┐
         │  reviewHash (bytes32)                 │
         │  reviewer (address)                   │
         │  reviewed (address)                   │
         │  txHash (bytes32) — linked to real tx │
         │  category (string)                    │
         │  rating (1-5)                         │
         │  timestamp                            │
         └──────────────────────────────────────┘
```

**Key features:**
- Category-segmented scores (code-generation, document-analysis, etc.)
- Anti-spam: 1-day cooldown per reviewer-reviewed pair
- Review fee: 0.0001 ETH (configurable, can be set to 0)
- Verification levels (0-3) set by authorized verifiers

### Temporal Decay

Recent reviews weigh more. Exponential decay with configurable half-life (default 90 days):

```
weight = 2^(-ageDays / halfLifeDays)
```

### Anti-Fraud Detection (Off-Chain)

- **Burst**: >5 reviews from same reviewer in 24h
- **Cluster**: >3 reviews arriving within 1 hour
- **Reciprocal**: A reviewed B and B reviewed A
- Suspicion score (0-1) penalizes trust score

### Trust Score Calculation

```
Score = reputation(40%) + level(25%) + age(15%) + reviews(10%) + wallet(10%)
        - penalties(NEW_AGENT, NO_REVIEWS, antifraud)
```

## Layer 3: Accountability

### Creator Verification Levels

| Level | Name | How Verified |
|---|---|---|
| 0 | Unverified | Default — no verification |
| 1 | Domain | DNS TXT record with DID |
| 2 | Business | Business registration |
| 3 | KYC | Know Your Customer |

Level is public. Verification data is private.

## Privacy Model

- Wallet address **never** in DID Document (balances are public on-chain)
- Wallet shared only during x402 payment negotiation via Verifiable Presentation
- Creator personal data never stored in DID Document
- All disclosure beyond verification level is opt-in via VP + selective disclosure

## Package Architecture

```
@eterecitizen/common    — Types, schemas, constants, utilities
@eterecitizen/contracts — Solidity smart contracts (CitizenReputation.sol)
@eterecitizen/sdk       — Core SDK (identity, credentials, wallet, reputation, trust)
@eterecitizen/cli       — Commander.js CLI
@eterecitizen/mcp-server — MCP tools for agent-to-agent
@eterecitizen/api       — Hono REST API
@eterecitizen/web       — Next.js web verifier
```

## Tech Stack

| Component | Technology |
|---|---|
| Identity | Veramo v7 + did:ethr + ERC-1056 |
| Credentials | W3C VC + JWT proofs |
| Blockchain | Base (L2) via viem |
| IPFS | Pinata |
| Local Storage | SQLite (better-sqlite3) |
| Encryption | AES-256-GCM with scrypt KDF |
| Smart Contracts | Solidity 0.8.24 + Hardhat |
| API | Hono |
| Web | Next.js 14 + Tailwind |
| CLI | Commander.js + chalk |
| MCP | @modelcontextprotocol/sdk |
