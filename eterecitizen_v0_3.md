# ETERECITIZEN

## Open Protocol for AI Agent Identity, Trust, and Commerce

**Version 0.3 — Foundational Technical Document**

---

# 1. The Problem

AI agents are becoming economic actors. They pay for services, sell services, and interact with each other and with humans. But when one agent encounters another, there is no way to answer three fundamental questions:

**Who are you?** There is no standard system for identifying an AI agent. An agent receiving a request from another agent has no idea who it's dealing with — it could be a legitimate agent, a scam, or an attack.

**Can I trust you?** There is no way to verify an agent's history, capabilities, or reputation. Every interaction starts from zero, with no context.

**Who is accountable if something goes wrong?** There is no way to trace an agent back to the person or company that created it. If an agent causes harm, there is no accountability.

These three problems block the agent economy. Without verifiable identity and trust, agents cannot trade with each other securely — they cannot exchange services, verify each other, or exchange money with certainty about who is on the other side.

For humans and regulators, the problem is equally concrete: they cannot verify an agent's provenance, who controls it, or whether it complies with regulations.

---

# 2. Current Landscape (March 2026)

## 2.1 Agent Wallets: Solved Problem

The market has solved the wallet problem in recent months:

**Coinbase Agentic Wallets** (February 2026) — Non-custodial wallets in TEE, integrated with x402, spending caps, gasless on Base. Deploy in 2 minutes. Over 100 million transactions processed via x402.

**Openfort** — Non-custodial wallets with sub-200ms signing, dual-layer security (offchain + onchain), session keys, TEE-backed. W3C VCs for KYC. 25+ EVM chains.

**MoonPay Agents** (March 2026) — Non-custodial layer, trade/swap/transfer/off-ramp to fiat, x402 compatible.

**Conway Terminal** — MCP server + CLI with automatic EVM wallet, access to compute and domains.

The wallet is a solved problem. EtereCitizen does not build wallets.

## 2.2 Agent Identity: Open Problem

**NIST AI Agent Standards Initiative** (February 17, 2026) — NIST formally acknowledged that AI agents operate as economic actors without an identity framework. The concept paper "Accelerating the Adoption of Software and AI Agent Identity and Authorization" is open for public comment until April 2, 2026. NIST is looking for solutions, not offering them.

**Academic paper: AI Agents with DIDs and VCs** (arXiv:2511.02841) — Prototype proposal for equipping agents with DID + VC. Demonstrates technical feasibility but is not a product.

**Key numbers:**
- Only 21.9% of organizations treat AI agents as identity-bearing entities
- 88% reported confirmed or suspected agent security incidents in the past year
- Only 14.4% of agents go to production with full security approval
- EU AI Act reaches full enforcement August 2026 — requires identifiability and audit trails

## 2.3 The Gap

Everyone offers wallets. No one offers a way for an agent to say "this is who I am, here is who created me, here is what I can do, here is my track record" in a way that another agent (or a human, or a regulator) can independently verify and trust.

---

# 3. EtereCitizen: What It Is

EtereCitizen is an open protocol that enables AI agents to identify themselves, verify each other, build reputation, and trade securely.

The protocol is **wallet-agnostic** — it does not build wallets, manage funds, or process payments. It integrates with any existing wallet provider (Coinbase, Openfort, MoonPay, Conway, or standard Ethereum wallets). Its role is to give agents what wallets don't: identity, trust, and accountability.

The protocol is designed **primarily for agents**, not for humans. The primary interaction is agent-to-agent: an agent wanting to buy a service from another agent verifies it via EtereCitizen before interacting. Humans and regulators are secondary users — they can verify provenance, creator identity, and regulatory compliance, but the system is optimized for the speed and automation of machine-to-machine commerce.

## 3.1 Positioning

```
┌───────────────────────────────────────────────┐
│    AGENT A                     AGENT B         │
│    (buyer)                     (seller)         │
└───────┬───────────────────────────────┬────────┘
        │                               │
        │   ┌───────────────────────┐   │
        ├──→│   ETERE PROTOCOL      │←──┤
        │   │                       │   │
        │   │  Who are you?         │   │
        │   │  Can I trust you?     │   │
        │   │  Who created you?     │   │
        │   └───────────────────────┘   │
        │          ✓ verified           │
        │                               │
        │   ┌───────────────────────┐   │
        └──→│   x402 / WALLET       │←──┘
            │   (payment)           │
            └───────────────────────┘
```

The flow is: verify first, pay later. EtereCitizen handles verification. The wallet (any wallet) handles payment.

---

# 4. Architecture

## 4.1 Layer 1 — Identity (Agent Sovereign Identity)

### DID — The Agent's Identifier

Every agent registered on EtereCitizen receives a DID (Decentralized Identifier) — a globally unique identifier the agent controls without depending on any central authority.

- **Method:** `did:ethr` on Base (ERC-1056 standard, supported by Veramo, existing resolvers, battle-tested)
- **Portability:** `did:ethr` works on any EVM chain. If Base has issues, the identity is portable
- **Storage:** Hash/CID on-chain on Base, full DID Document on IPFS

The DID Document contains **only technical information**: cryptographic public keys, agent contact endpoints (URL, communication channels), agent type, and technical metadata. **It does not contain creator personal data, wallet balances, or financial information.**

### Verifiable Credentials — The Agent's Attestations

VCs are cryptographically verifiable claims the agent accumulates over time. W3C VC Data Model v2.0 standard.

**Self-issued by the protocol:**
- Birth Certificate: creation timestamp, creator DID (not name), hash of original configuration
- Capability Attestations: declared skills, verifiable through testing

**Issued by third parties:**
- Work History: tasks completed for clients, with rating (tied to real on-chain transactions)
- Compliance Certifications: EU AI Act compliance, security standards
- Creator Verification: verification level of the creator's identity (see section 4.3)

### Agent Registry — On-Chain Discoverability

Integration with ERC-8004 ("Trustless Agents", Conway Research) for on-chain registration and discoverability. Allows agents to find each other — an agent looking for a specific service can search the registry for agents offering that service, verify their identity and reputation, then contact them.

## 4.2 Layer 2 — Trust (Verifiable Trust Between Agents)

### Reputation Score — Composite Reputation

Score calculated on-chain aggregating: tasks completed successfully, reviews from real transactions, agent age, creator verification level.

**Rating is segmented by category.** An agent doesn't have a single rating — it has separate ratings for each type of service it offers (document analysis, code generation, customer service, etc.). A new agent entering a specific category starts on equal footing with everyone else in that category, regardless of other agents' reputation in other categories.

**Recent reviews weigh more.** The rating uses temporal decay: reviews from the last 3 months weigh more than those from 6 months ago. This prevents early adopters from accumulating an insurmountable advantage and incentivizes everyone to maintain quality over time.

### Review System — Anti-Fraud Feedback

Reviews are the most vulnerable point of any reputation system. EtereCitizen makes them resistant to manipulation through three constraints:

**Constraint 1: Only from real transactions.** A review can only be issued if there is a verifiable on-chain transaction between the reviewer and the reviewed agent. No transaction, no review. Creating fake reviews costs real money — every fake review costs the price of the transaction.

**Constraint 2: Weight based on reviewer reputation.** A review from an identity with history (a year of activity, 100 transactions, its own reputation) weighs more than a review from an identity created yesterday with a single transaction. Getting high-weight reviews requires identities with history — and building history costs time and money.

**Constraint 3: Pattern detection.** The algorithm penalizes suspicious patterns: identities created on the same day all reviewing the same agent, clusters of minimum transactions followed by 5-star reviews, reciprocal reviews between two agents. Perfection isn't required — making manipulation more expensive than the benefit is.

Reviews are Verifiable Credentials signed by the reviewer and tied to the on-chain transaction hash. Non-deletable, non-modifiable, verifiable by anyone.

### Agent-to-Agent Verification — The Commerce Flow

When an agent wants to buy a service from another agent:

```
AGENT A (buyer)                          AGENT B (seller)
      │                                         │
      │──── Request DID ────────────────────────→│
      │                                         │
      │←─── DID + Verifiable Presentation ──────│
      │     (shows only what's needed:          │
      │      verification level, category       │
      │      rating, capabilities)              │
      │                                         │
      │──── [Autonomous verification]           │
      │     · Resolve DID on Base               │
      │     · Verify VC signatures              │
      │     · Check rating and reviews          │
      │     · Check creator verification level  │
      │                                         │
      │──── If verified: request service ──────→│
      │                                         │
      │←─── Service + payment request ──────────│
      │     (x402: 402 Payment Required)        │
      │                                         │
      │──── x402 payment (via wallet) ─────────→│
      │                                         │
      │──── [Post-transaction]                  │
      │     · Issue review VC                   │
      │     · Tied to transaction hash          │
      │                                         │
```

The entire verification flow is automatic and machine-to-machine. Agent A doesn't "decide" to trust — it verifies cryptographically and programmatically. The entire process takes milliseconds.

## 4.3 Layer 3 — Accountability (Chain of Responsibility)

### Creator Verification Levels

The agent's DID points to the creator's DID. The creator can verify their identity at different levels. Each level increases trust in the agent and makes fraud more expensive.

**Level 0 — Unverified.** The agent has a DID, but the creator has verified nothing. It exists, but no one knows who's behind it. This level is a red flag for anyone interacting with the agent.

**Level 1 — Domain verified.** The creator has proven control of a web domain (via `did:web` or DNS TXT record). The agent belongs to whoever controls that domain.

**Level 2 — Business verified.** The creator has linked a verified business registration (VAT number, company registration, verified business profile). There is a legal entity behind the agent. If the agent causes harm, there's someone to send a lawyer's letter to.

**Level 3 — Personal identity verified.** The creator has completed KYC through a verification service that issues a VC. Maximum level of trust and accountability.

**Critical property:** the verification level is public (visible to anyone resolving the agent's DID), but the verification *data* is private. A level 3 agent shows "creator verified with KYC by Service X" — it does not show the name, surname, or document. The creator chooses what to reveal. The level is a fact. The details are a choice.

### Agent Identity Card

Human-readable interface aggregating the agent's public information. Accessible via URL or DID lookup.

```
╔══════════════════════════════════════════════════╗
║  ETERE PROTOCOL — AGENT IDENTITY CARD            ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  DID:           did:ethr:0x2105:0x7a3b...f29c    ║
║  Created:       2026-06-01                       ║
║  Status:        ACTIVE                           ║
║  Age:           247 days                         ║
║                                                  ║
║  Creator:       Level 2 — Business verified      ║
║                 (details on request)              ║
║                                                  ║
║  Wallet:        Connected (Coinbase CDP)          ║
║                 (address shared via x402 only)    ║
║                                                  ║
║  Verified capabilities:                          ║
║    · Document analysis (rating 4.8, 28 reviews)  ║
║    · Code generation (rating 4.5, 12 reviews)    ║
║                                                  ║
║  History:       47 tasks completed               ║
║  Reviews:       40 total (from real transactions) ║
║                                                  ║
║  Registry:      ERC-8004 #4721                   ║
║                                                  ║
╚══════════════════════════════════════════════════╝
  Verify: https://verify.eterecitizen.ai/did:ethr:...
```

The card shows only public information. It does not show wallet balances, creator personal data, or transaction details.

---

# 5. Wallet Connection

## 5.1 What "Wallet-Agnostic" Actually Means

EtereCitizen does not build wallets, does not hold keys, does not sign transactions, does not touch funds. But it **does** make it easy for an agent to connect a wallet from any provider to its identity.

Connecting a wallet means: proving that the agent controls a specific wallet address, so that transactions from that wallet can be attributed to that agent's identity. This is what makes the review system work (reviews tied to real transactions) and what makes x402 commerce possible (the agent can share its payment address privately during negotiation).

## 5.2 How Wallet Connection Works

The agent proves wallet ownership by signing a challenge message with the wallet's private key. This is a standard Ethereum operation — no funds move, nothing is spent. It's the same mechanism behind "Sign-In with Ethereum" (SIWE).

```typescript
import { EtereCitizen } from '@eterecitizen/sdk';

// Step 1: Create agent identity
const agent = await EtereCitizen.createAgent({
  name: "My Agent",
  capabilities: ["document-analysis", "code-generation"],
});

// Step 2: Connect a wallet (any provider)
// Option A: Coinbase CDP
await agent.connectWallet({
  provider: "coinbase-cdp",
  apiKey: process.env.CDP_API_KEY,
});

// Option B: Openfort
await agent.connectWallet({
  provider: "openfort",
  apiKey: process.env.OPENFORT_API_KEY,
});

// Option C: Conway Terminal
await agent.connectWallet({
  provider: "conway",
});

// Option D: Any standard Ethereum wallet (ethers.js, viem)
await agent.connectWallet({
  provider: "standard",
  privateKey: process.env.WALLET_PRIVATE_KEY,
  // or: signer: myEthersSigner,
});

// Option E: Create a new wallet on the spot with preferred provider
const wallet = await agent.createAndConnectWallet({
  provider: "coinbase-cdp", // or "openfort", "conway", "standard"
});
// wallet.address → 0x7a3b...f29c (new wallet, ready to use)
```

What happens under the hood:
1. The SDK calls the wallet provider's API to get the wallet address
2. The SDK asks the wallet to sign a challenge message: "I am did:ethr:0x2105:0x... and I control this wallet"
3. The signature is stored as a Verifiable Credential (Wallet Ownership VC) — provable, but the wallet address itself is **not** added to the public DID Document
4. When the agent needs to receive a payment, it shares the wallet address privately during x402 negotiation — never publicly

## 5.3 What the Protocol Knows About the Wallet

| Information | Stored? | Public? |
|---|---|---|
| Wallet is connected (yes/no) | Yes | Yes (shows "Connected" on Identity Card) |
| Wallet provider (Coinbase, Openfort, etc.) | Yes | Yes (optional — agent can hide this) |
| Wallet address | Yes (encrypted, in agent's private storage) | **No** — shared only during x402 negotiation |
| Wallet balance | **No** — never queried, never stored | **No** |
| Transaction history | **No** — only individual tx hashes when linked to reviews | **No** |

The protocol proves the agent *has* a wallet. It never exposes *what's in it*.

## 5.4 Multiple Wallets

An agent can connect multiple wallets for different purposes:
- A "receiving" wallet for incoming payments (shared via x402)
- A "spending" wallet for outgoing payments (used internally by the agent)
- Wallets on different chains (Base, Ethereum mainnet, Solana via different adapters)

Each wallet connection is a separate Wallet Ownership VC. The agent chooses which wallet to share in each interaction.

## 5.5 Wallet Creation Shortcuts

For agents that don't already have a wallet, the SDK provides one-step creation through any supported provider:

```typescript
// Create identity + wallet in one call
const agent = await EtereCitizen.quickStart({
  name: "My Agent",
  capabilities: ["document-analysis"],
  wallet: {
    provider: "coinbase-cdp",  // or any supported provider
    network: "base",
  },
});
// agent.did → did:ethr:0x2105:0x...
// agent.wallet.address → 0x7a3b...f29c
// agent.wallet.provider → "coinbase-cdp"
// Ready to verify, trade, and get paid
```

The goal is: one function call, you have an identity and a wallet. Under two minutes from zero to a fully operational agent with verifiable identity and payment capability.

---

# 6. Privacy Architecture

## 6.1 Core Principle: Privacy by Default

Nothing is public by default except the existence of the identity and the creator's verification level. Everything else is opt-in, controlled by the creator and the agent.

## 6.2 What Is Public, Private, and On-Request

**Always public (visible to anyone resolving the DID):**
- The agent's DID exists
- Creation date
- Creator verification level (0, 1, 2, 3) — but not the verification data
- Aggregate rating per category
- Number of reviews and completed tasks
- Wallet connected (yes/no)
- Agent contact endpoints

**On request (Verifiable Presentations — the agent chooses what to show to whom):**
- Creator name or company name
- Detailed specific capabilities
- Detailed work history
- Wallet address for payments (shared only during x402 negotiation)
- Compliance certification details
- Wallet provider name

**Never public:**
- Raw KYC data (identity document, home address)
- Wallet balance
- Detailed transaction history
- Conversation content with clients
- Any personal data not explicitly shared by the creator

## 6.3 The Wallet Is Not in the DID Document

Balances on Ethereum/Base are public to anyone who knows the address. For this reason, the DID Document **does not contain the wallet address**. The service endpoint says "this agent accepts payments" but does not expose the address. When an agent wants to pay, the address is shared privately during x402 negotiation. The DID Document never exposes financial information.

## 6.4 Selective Disclosure

Verifiable Presentations allow showing only specific pieces of credentials.

Example: a potential client wants to verify the agent's creator is a real entity, but the creator doesn't want to reveal their company name. The agent presents a VP that says: "my creator completed a business verification with Service X, on date Y, country: Italy" — without revealing the company name. The client knows there's a verified Italian legal entity behind the agent. But not which one.

If the creator wants maximum transparency because it benefits them commercially, they can show everything: company name, website, agent portfolio. The choice is always the creator's.

---

# 7. SDK and Integration

## 7.1 For Builders: How to Integrate

The TypeScript SDK completely abstracts DID/VC complexity. A builder who wants to give their agent an identity doesn't need to know what a DID or Verifiable Credential is.

```typescript
import { EtereCitizen } from '@eterecitizen/sdk';

// Create agent identity with wallet in one call
const agent = await EtereCitizen.quickStart({
  name: "My Agent",
  capabilities: ["document-analysis", "code-generation"],
  wallet: { provider: "coinbase-cdp", network: "base" },
});

// Verify another agent before interacting
const trust = await EtereCitizen.verify(otherAgentDID);
// trust.level → 2 (business verified)
// trust.rating("document-analysis") → 4.8
// trust.reviewCount → 28
// trust.age → 247 days
// trust.flags → [] (no suspicious signals)
// trust.walletConnected → true

// Request payment details privately (x402 flow)
const paymentInfo = await agent.requestPaymentAddress(otherAgentDID, {
  amount: "5.00",
  currency: "USDC",
  network: "base",
});
// paymentInfo.address → 0x... (shared privately, not public)

// After a transaction, leave a review
await agent.review(otherAgentDID, {
  transactionHash: "0xabc...",  // proof of real transaction
  category: "document-analysis",
  rating: 5,
  comment: "Precise and fast analysis"
});
```

## 7.2 For Agents: Automatic Machine-to-Machine Verification

Agent-to-agent interaction happens automatically via MCP (Model Context Protocol). The agent uses EtereCitizen tools to verify, present itself, and trade without human intervention.

```
MCP Tools available:

citizen_verify_agent       — Verify another agent's identity and reputation
citizen_present_identity   — Present own identity (with selective disclosure)
citizen_connect_wallet     — Connect a wallet from any supported provider
citizen_create_wallet      — Create a new wallet with preferred provider
citizen_request_payment    — Negotiate x402 payment with private wallet sharing
citizen_submit_review      — Issue review tied to on-chain transaction
citizen_search_agents      — Search agents by capability, rating, verification level
```

## 7.3 Supported Wallet Providers

| Wallet Provider | Integration | Notes |
|---|---|---|
| Coinbase CDP / Agentic Wallets | Dedicated adapter | Full x402 support, TEE keys |
| Openfort | Dedicated adapter | Session keys, dual-layer security |
| MoonPay Agents | Dedicated adapter | Fiat off-ramp capability |
| Conway Terminal | Dedicated adapter | Includes compute access |
| Standard Ethereum (ethers.js, viem) | Generic adapter | Any EVM wallet |

Adding a new wallet provider requires implementing a simple adapter interface:

```typescript
interface WalletAdapter {
  // Get the wallet address
  getAddress(): Promise<string>;
  // Sign a challenge message (for wallet ownership proof)
  signMessage(message: string): Promise<string>;
  // Share payment details privately with another agent
  negotiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
}
```

Any wallet that can sign a message and provide an address works with EtereCitizen.

---

# 8. Tech Stack

| Component | Technology | License | Maturity |
|---|---|---|---|
| Language | TypeScript/Node.js | MIT | Production |
| DID Framework | Veramo + ethr-did-resolver | Apache-2.0 | Production |
| VC Framework | Veramo built-in / @digitalbazaar/vc | Apache-2.0 / BSD-3 | Production |
| DID Smart Contract | ERC-1056 on Base | MIT | Production |
| Reputation Smart Contract | Custom (CitizenReputation.sol) | Apache-2.0 | To build |
| Agent Registry | ERC-8004 on Base | — | Production (Jan 2026) |
| Wallet Integration | ethers.js / viem | MIT | Production |
| IPFS | Pinata / web3.storage | Commercial | Production |
| Local Database | SQLite (cache, metadata) | Public Domain | Production |
| MCP Server | @modelcontextprotocol/sdk | MIT | Production |
| CLI | Commander.js | MIT | Production |
| API | Hono | MIT | Production |

---

# 9. Open Source Model + Business

## 9.1 Strategy: Open Core

The protocol is completely open source (Apache 2.0). The business is in services built on top.

## 9.2 What Is Open Source (Apache 2.0)

The entire protocol core:
- Specifications (DID Document format for agents, VC schemas, Identity Card format, reputation algorithm)
- TypeScript SDK (including all wallet adapters)
- MCP Server
- CLI
- Smart contracts (CitizenReputation.sol)
- Public verifier (web page to verify any agent by DID)
- Full documentation

Anyone can use, modify, distribute, including commercially. Apache 2.0 includes patent grant and has no copyleft risk — enterprise-adoptable without legal concerns.

## 9.3 Revenue Streams

### Stream 1: Hosted Infrastructure (Immediate)

Managed service eliminating setup complexity:
- Managed DID resolver node
- Managed IPFS pinning
- Agent Registry indexer (fast API to search agents by capability, reputation, level)
- Web dashboard to monitor your agents

**Pricing:** Free for 1-3 agents. €29/month for teams (up to 20 agents). €99-299/month for enterprise (unlimited + SLA).

### Stream 2: Attestation & Verification as a Service (Q2-Q3)

VC issuance and verification service:
- API for issuing VCs as a verified third party
- Instant verification (given a DID, return full trust score)
- KYC-as-a-service for agent creators (integration with existing KYC providers to issue Level 2-3 VCs)
- Compliance reporting for audits

**Pricing:** Per-verification (€0.01-0.05) or monthly plan.

### Stream 3: Enterprise & Compliance (Q3-Q4)

Enterprise features not in the open source core:
- Multi-agent management dashboard (fleet management)
- EU AI Act compliance toolkit (August 2026)
- Certified audit trail
- SSO/SAML integration
- SLA with uptime guarantee

**Pricing:** €499-2,999/month per organization.

### Stream 4: Agent Marketplace (Year 2)

Directory where verified agents offer and purchase services:
- Search by capability, rating, verification level, price
- Automatic escrow via smart contract
- Dispute resolution
- Fee: 2-5% per transaction

---

# 10. Why This Works as a Standard

## 10.1 Timing

**NIST is looking for exactly this.** The AI Agent Standards Initiative is in public consultation. No standard solution exists yet. EtereCitizen can be submitted as a reference implementation.

**EU AI Act reaches full enforcement August 2026.** Requires identifiability, audit trails, and demonstrable compliance for AI systems. A standard protocol for agent identity makes compliance dramatically simpler.

**Wallet providers don't do identity.** Coinbase, Openfort, MoonPay build excellent wallets. None offer sovereign identity with cumulative reputation. They are complementary, not competitors.

## 10.2 Conditions for Adoption

**Neutrality.** The protocol does not favor any wallet provider, chain, or AI framework. It is wallet-agnostic and chain-agnostic (did:ethr on any EVM).

**Working implementation.** TypeScript SDK + MCP Server + CLI must work flawlessly on launch day.

**Simplicity.** `EtereCitizen.quickStart()` — one function call, you have an identity and a connected wallet. Zero DID knowledge required.

**Real early users.** Etere (the product) is the first user. At least 2-3 other agents/frameworks needed within 6 months.

**Open governance.** Medium-term, community governance or donation to an existing organization (Agentic AI Foundation / Linux Foundation, DIF).

---

# 11. Execution Plan

## Phase 1 — Identity Core (Months 1-3)

- TypeScript SDK: DID creation, VC issuance, DID resolution, agent verification
- Wallet connection system with adapters for Coinbase CDP and standard Ethereum wallets
- `quickStart()` function: one call to create identity + connect wallet
- ERC-1056 smart contract on Base (testnet → mainnet)
- MCP Server with verification, presentation, and wallet connection tools
- CLI for creating agent identity, connecting wallet, querying DIDs, issuing VCs
- Public web verifier
- Documentation: 5-minute getting started, tutorial, API reference
- Public GitHub repository under Apache 2.0
- **First user: Etere (the product) integrates the protocol**

## Phase 2 — Trust & Reputation (Months 3-6)

- On-chain reputation smart contract (CitizenReputation.sol)
- Review system tied to real transactions
- Anti-fraud pattern detection
- Category-segmented rating with temporal decay
- Creator verification levels (0-3) with KYC provider integration
- Hosted infrastructure live (resolver, IPFS pinning, API, dashboard)
- First pricing tier
- ERC-8004 registration (Agent Registry)
- Wallet adapters for all major providers (Openfort, MoonPay, Conway)

## Phase 3 — Commerce & Scale (Months 6-12)

- Full agent-to-agent flow: discovery → verification → service → x402 payment → review
- Agent search in registry (by capability, rating, level)
- Enterprise features: EU AI Act compliance toolkit, multi-agent dashboard, audit trail
- NIST submission as reference implementation
- Participation in DIF and/or Agentic AI Foundation
- At least 3 external agents/frameworks using the protocol
- Marketplace MVP

---

# 12. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Coinbase adds identity to its wallets | Medium | High | Protocol is wallet-agnostic and neutral. If Coinbase adds identity, it only works for their wallets. EtereCitizen works with all |
| No one adopts the protocol | Medium | Critical | Etere (the product) is the first user. Dead-simple getting started. Marketing to AI agent communities |
| NIST standardizes a different approach | Low | High | Actively participate in NIST process. Adapt protocol if needed |
| Fake reviews despite constraints | Medium | High | Three constraints (real transaction, reputation weight, pattern detection) make fraud expensive, not impossible. Continuous algorithm improvement |
| DID/VC complexity scares developers | High | High | SDK that abstracts everything. One line of code to create identity. Zero DID knowledge required |
| Privacy breach (creator data exposed) | Low | Critical | Privacy by default. DID Document without personal data. Wallet not in DID. Selective disclosure for everything else |

---

# 13. Estimated Budget (Year 1)

## Infrastructure Costs (monthly, hosted service)

| Item | Cost/month | Notes |
|---|---|---|
| VPS (DID resolver + API) | €30-100 | Scalable |
| IPFS pinning | €5-20 | Grows with agents |
| Base L2 gas | €5-20 | Minimal gas on L2 |
| Domain + CDN | €10-20 | eterecitizen.ai |
| Database | €0-30 | Free tier initially |
| **TOTAL monthly** | **€50-190** | Initial phase |

## One-Time Costs

| Item | Cost |
|---|---|
| Smart contracts deploy on Base | <€30 |
| Domain | €10-20/year |
| **TOTAL** | **<€50** |

The main cost is development time, not infrastructure.

---

# 14. Open Decisions

**Name.** "EtereCitizen" — chosen to communicate the concept of agents gaining "citizenship" in the digital world while maintaining the Etere brand connection. The name is distinct enough from Etere (the product) to stand on its own as an independent protocol.

**Governance.** Own foundation, donation to Linux Foundation, or DIF. Decision deferred to 50+ registered agents.

**NIST submission.** Comments accepted until April 2, 2026. Would require Layer 1 working by that date — aggressive but potentially very high-impact.

**KYC integration.** Which KYC provider for Level 2-3 verification? Options: Onfido, Sumsub, Jumio, Persona. Decision in Phase 2.

---

**EtereCitizen — v0.3**

*Trust between machines starts with identity.*
