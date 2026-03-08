# EtereCitizen: An Open Protocol for AI Agent Identity, Trust, and Commerce

**Public Comment Submission to the National Institute of Standards and Technology (NIST)**

**Date:** March 2026
**Authors:** Icaro Holding
**License:** Apache 2.0
**Repository:** https://github.com/icaroholding/EtereCitizen

---

## 1. Executive Summary

EtereCitizen is an open protocol that provides AI agents with self-sovereign identity, verifiable trust, and accountable commerce capabilities. As AI agents increasingly operate autonomously — executing tasks, interacting with services, and transacting on behalf of humans — the lack of standardized identity and trust mechanisms creates significant risks: impersonation, reputation fraud, unaccountable agent behavior, and privacy violations.

EtereCitizen addresses these risks through a three-layer architecture built on open standards:

1. **Identity Layer** — Decentralized Identifiers (DIDs) anchored on Base (Ethereum L2) with W3C Verifiable Credentials
2. **Trust Layer** — On-chain reputation with temporal decay, anti-fraud detection, and category-segmented ratings
3. **Accountability Layer** — Creator verification levels (0-3) with privacy-preserving disclosure

The protocol is fully operational on Base Sepolia testnet with 7 interoperable packages, 140+ automated tests, and comprehensive documentation.

---

## 2. Problem Statement

### 2.1 The AI Agent Identity Gap

Current AI systems lack standardized mechanisms for:

- **Self-identification**: Agents cannot prove who they are to other agents or services
- **Trust establishment**: No verifiable way to assess an agent's reliability before interaction
- **Accountability tracing**: When an agent causes harm, tracing responsibility to the creator is difficult
- **Privacy-preserving commerce**: Agents need to transact without exposing unnecessary data

### 2.2 Existing Approaches and Their Limitations

| Approach | Limitation |
|---|---|
| API keys / tokens | Centralized, no interoperability, no reputation |
| OAuth / OpenID Connect | Designed for human users, not autonomous agents |
| Custom agent registries | Vendor lock-in, no cross-platform trust |
| Blockchain wallets alone | No identity metadata, no credential framework |

### 2.3 Why Standards Matter Now

The proliferation of autonomous AI agents (coding assistants, research agents, trading bots, customer service agents) creates an urgent need for interoperable identity standards. Without them, each platform builds proprietary solutions that fragment the ecosystem and reduce trust.

---

## 3. Protocol Architecture

### 3.1 Layer 1 — Agent Sovereign Identity

**Standard:** W3C Decentralized Identifiers (DIDs) v1.0
**Method:** `did:ethr` (ERC-1056) on Base (Ethereum L2)
**Credentials:** W3C Verifiable Credentials Data Model v2.0

Each agent receives a DID upon creation:
```
did:ethr:0x14a34:0xabc123...
```

The DID is anchored on-chain via the EthereumDIDRegistry (ERC-1056), already deployed on Base. The full DID Document is stored on IPFS with only the content hash on-chain, minimizing gas costs while maintaining verifiability.

**Verifiable Credentials issued automatically:**
- **Birth Certificate VC** — Proves agent creation time, immutable
- **Capability VCs** — Declares what the agent can do (e.g., code-generation, document-analysis)
- **Wallet Ownership VC** — Proves wallet control without exposing the address publicly

**Privacy guarantee:** Wallet addresses never appear in the DID Document. They are shared only during private x402 payment negotiations via Verifiable Presentations.

### 3.2 Layer 2 — Verifiable Trust

**On-chain contract:** CitizenReputation.sol (deployed on Base Sepolia)
**Review model:** Hybrid — hash + score on-chain, full review VC off-chain (IPFS)

Trust is established through:

1. **Review submission** — Only possible with a real on-chain transaction hash (prevents fake reviews)
2. **Category-segmented ratings** — Each capability has independent scores (1-5)
3. **Temporal decay** — Recent reviews weigh more (configurable half-life, default 90 days)
4. **Anti-fraud detection** — Burst detection, cluster analysis, reciprocal review detection
5. **Anti-spam** — 1-day cooldown per reviewer-reviewed pair, configurable review fee

**Verification flow:**
```
Agent A                          Agent B
   |                                |
   |  1. Resolve DID Document       |
   |  2. Verify VC signatures       |
   |  3. Check on-chain reputation  |
   |  4. Calculate trust score      |
   |  5. Proceed or decline         |
   |                                |
```

### 3.3 Layer 3 — Accountability

**Creator verification levels:**

| Level | Name | Requirement | Trust Implication |
|---|---|---|---|
| 0 | Unverified | Default | Low trust, suitable for testing |
| 1 | Domain | did:web / DNS TXT verification | Creator has a verifiable web presence |
| 2 | Business | Business registration verification | Creator is a registered legal entity |
| 3 | KYC | Identity verification | Creator identity is known to a trusted party |

**Key principle:** The verification level is public. The verification data is private. A Level 3 agent proves its creator was KYC-verified without revealing the creator's personal information.

---

## 4. Technical Implementation

### 4.1 Package Architecture

```
@eterecitizen/common      — Shared types, schemas, validation (Zod)
@eterecitizen/contracts    — Solidity smart contracts (Hardhat)
@eterecitizen/sdk          — Core TypeScript SDK (Veramo v7, viem)
@eterecitizen/cli          — Command-line interface (Commander.js)
@eterecitizen/mcp-server   — MCP Server for agent-to-agent tools
@eterecitizen/api          — REST API (Hono)
@eterecitizen/web          — Web verifier (Next.js)
```

### 4.2 Standards Compliance

| Standard | Usage |
|---|---|
| W3C DID v1.0 | Agent identity anchoring |
| W3C VC Data Model v2.0 | Credential issuance and verification |
| ERC-1056 | DID registry on Ethereum/Base |
| ERC-8004 | On-chain agent discoverability |
| IPFS | Decentralized document storage |
| x402 | Agent-to-agent payment negotiation |
| MCP (Model Context Protocol) | AI agent tool interoperability |

### 4.3 Smart Contracts

**CitizenReputation.sol** — Custom contract for on-chain reputation:
- Review records with hash, reviewer, reviewed, transaction hash, category, rating, timestamp
- Aggregate score per agent per category
- Verification level management (owner/verifier controlled)
- Anti-spam cooldown (1 day between reviews of same agent)
- Configurable review fee (default 0.0001 ETH)

**EthereumDIDRegistry (ERC-1056)** — Pre-deployed on Base for DID anchoring.

### 4.4 SDK Design Philosophy

The SDK abstracts all DID/VC complexity:

```typescript
// One-call agent creation (no DID/VC knowledge required)
const agent = await EtereCitizen.quickStart({
  name: 'My Agent',
  capabilities: ['code-generation'],
  wallet: { provider: 'standard', privateKey: '0x...' },
});

// Verify any agent in one call
const trust = await EtereCitizen.verify('did:ethr:0x14a34:0x...');
```

Developers interact with agents, not DIDs. The protocol handles identity anchoring, credential issuance, IPFS storage, and on-chain reputation transparently.

### 4.5 Wallet Agnosticism

The protocol defines a minimal `WalletAdapter` interface:

```typescript
interface WalletAdapter {
  readonly provider: WalletProvider;
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>;
  negotiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
}
```

Any wallet provider can implement this interface. Current adapters:
- **Standard** (viem/private key) — Fully functional
- **Coinbase CDP** — Interface defined, pending API integration
- **Openfort** — Interface defined, pending API integration
- **MoonPay** — Interface defined, pending API integration
- **Conway** — Interface defined, pending API integration

---

## 5. Privacy Model

### 5.1 Privacy by Default

EtereCitizen follows a "minimum disclosure" principle:

| Data | Visibility | Rationale |
|---|---|---|
| DID | Public | Needed for identity resolution |
| Agent name/capabilities | Public | Needed for discoverability |
| Verification level (0-3) | Public | Needed for trust decisions |
| Review scores | Public | Needed for trust decisions |
| Wallet address | Private | Balances are public on-chain |
| Creator identity | Private | Only verification level is shared |
| Credential details | Opt-in | Shared via Verifiable Presentations |

### 5.2 Selective Disclosure

Agents control what they share through Verifiable Presentations:

```typescript
// Full presentation (all credentials)
const vp = await agent.present();

// Selective disclosure (only specific types)
const vp = await agent.present({
  fields: ['BirthCertificate', 'Capability'],
});
```

### 5.3 Wallet Privacy

Wallet addresses are never stored in the DID Document because:
1. On-chain balances are publicly visible
2. Transaction history reveals behavioral patterns
3. Cross-referencing wallets can de-anonymize agents

Instead, wallet ownership is proven via a Wallet Ownership VC that stores only a challenge hash. The actual address is shared only during private x402 payment negotiations.

---

## 6. Anti-Fraud Mechanisms

### 6.1 Review Integrity

- **Transaction-linked reviews** — Every review must reference a real on-chain transaction hash
- **Cooldown periods** — 1-day minimum between reviews of the same agent by the same reviewer
- **Review fees** — Small fee (0.0001 ETH) per review to prevent spam
- **On-chain immutability** — Review hashes stored on-chain cannot be altered

### 6.2 Pattern Detection (Off-chain)

- **Burst detection** — Flags agents receiving many reviews in a short time window
- **Cluster analysis** — Identifies groups of reviewers that only review each other
- **Reciprocal detection** — Flags mutual review patterns (A reviews B, B reviews A)
- **Temporal anomaly** — Detects unusual timing patterns in review submission

### 6.3 Temporal Decay

Reputation scores decay over time using exponential decay:

```
weight(age) = 0.5 ^ (age_days / half_life_days)
```

Default half-life: 90 days. This ensures:
- Recent performance matters more than historical performance
- Agents cannot rest on past reputation indefinitely
- Recovery from bad reviews is possible through consistent good performance

---

## 7. Interoperability

### 7.1 MCP Integration

EtereCitizen provides an MCP (Model Context Protocol) server with 7 tools for agent-to-agent interaction:

| Tool | Purpose |
|---|---|
| `citizen_verify_agent` | Verify identity and reputation |
| `citizen_present_identity` | Present credentials with selective disclosure |
| `citizen_connect_wallet` | Connect an existing wallet |
| `citizen_create_wallet` | Create and connect a new wallet |
| `citizen_request_payment` | Negotiate x402 payment |
| `citizen_submit_review` | Submit a transaction-linked review |
| `citizen_search_agents` | Search by capability, rating, or level |

### 7.2 REST API

Public API endpoints enable third-party integration:

```
GET  /api/did/:did          — Resolve DID Document
GET  /api/verify/:did       — Full agent verification
GET  /api/card/:did         — Identity Card data (JSON)
GET  /api/search            — Search agents
GET  /api/reputation/:did   — Reputation scores and reviews
POST /api/vc/verify         — Verify a Verifiable Credential
GET  /api/health            — Health check
```

### 7.3 CLI

Full command-line interface for developers:

```bash
citizen create --name "MyAgent" --cap code-generation
citizen verify did:ethr:0x14a34:0x...
citizen wallet connect --provider standard --key 0x...
citizen review did:ethr:0x14a34:0x... --tx 0x... --rating 5
citizen search --capability code-generation --min-rating 4.0
```

---

## 8. Threat Model

| Threat | Mitigation |
|---|---|
| Sybil attacks (fake agents) | Review fees, transaction-linked reviews, creator verification |
| Reputation manipulation | Anti-fraud detection, temporal decay, cooldown periods |
| Identity theft | DID private key management, challenge-response wallet proofs |
| Privacy leakage | Wallet address never in DID Document, selective disclosure |
| Smart contract exploit | OpenZeppelin Ownable, access control, audit-ready code |
| Denial of service | Rate limiting, review fees, cooldown periods |

---

## 9. Current Status and Roadmap

### 9.1 Current Status (March 2026)

- 7 packages implemented and building successfully
- 140+ automated tests (118 Vitest + 22 Hardhat)
- Smart contracts deployed on Base Sepolia
- Veramo v7 integration for DID/VC operations
- Full E2E test: create DID -> issue VCs -> connect wallet -> verify -> review
- 8 documentation files covering all aspects of the protocol
- Apache 2.0 open-source license

### 9.2 Roadmap

| Milestone | Status |
|---|---|
| Protocol specification | Complete |
| Core SDK implementation | Complete |
| Smart contract deployment (testnet) | Complete |
| CLI, MCP Server, API | Complete |
| Web verifier | Complete |
| Documentation | Complete |
| Base mainnet deployment | Planned |
| Additional wallet adapter integrations | Planned |
| Security audit | Planned |
| Community governance framework | Planned |

---

## 10. Relevance to NIST AI Standards

EtereCitizen directly addresses several NIST AI Risk Management Framework (AI RMF) categories:

### 10.1 Trustworthy AI Characteristics

- **Accountable and Transparent** — Creator verification levels trace responsibility. On-chain reviews are immutable and auditable.
- **Privacy-Enhanced** — Minimum disclosure principle. Selective credential sharing. Wallet privacy by design.
- **Secure and Resilient** — Anti-fraud detection, anti-spam measures, temporal decay against stale reputation.
- **Fair** — Category-segmented ratings prevent unfair global scores. Temporal decay enables reputation recovery.

### 10.2 AI Agent Identity Standards

We propose that NIST consider:

1. **Standardized agent identity** based on W3C DIDs — enabling interoperability across platforms
2. **Verifiable capability attestation** — agents should declare and prove what they can do
3. **On-chain reputation** — tamper-resistant, publicly verifiable trust metrics
4. **Privacy-preserving verification** — proving trust level without revealing personal data
5. **Creator accountability** — tiered verification linking agents to responsible entities

### 10.3 Recommendations

1. **Adopt DID-based identity** for AI agents as an interoperability standard
2. **Require capability disclosure** — agents should declare their functions via verifiable credentials
3. **Establish minimum reputation frameworks** — on-chain, category-segmented, with temporal decay
4. **Mandate creator verification** — at minimum Level 1 (domain) for production agents
5. **Protect agent wallet privacy** — wallet addresses should never be in public identity documents

---

## 11. Conclusion

EtereCitizen demonstrates that a practical, standards-based protocol for AI agent identity, trust, and commerce is achievable today. By building on existing W3C and Ethereum standards, we avoid reinventing the wheel while addressing the unique challenges of autonomous AI agents.

The protocol is open-source (Apache 2.0), fully functional on testnet, and designed for production deployment. We welcome feedback from NIST and the broader community on how to improve these mechanisms as AI agents become increasingly prevalent in digital infrastructure.

---

**Contact:** https://github.com/icaroholding/EtereCitizen
**Website:** https://eterecitizen.io
**License:** Apache 2.0
**Protocol Version:** 0.3
