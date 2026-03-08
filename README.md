<div align="center">

# EtereCitizen

### The Open Protocol for AI Agent Identity, Trust, and Commerce

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-140%20passing-brightgreen.svg)](#testing)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636.svg)](packages/contracts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178C6.svg)](tsconfig.base.json)
[![Base](https://img.shields.io/badge/Base-Mainnet-0052FF.svg)](https://basescan.org)
[![Verified](https://img.shields.io/badge/BaseScan-Verified-brightgreen.svg)](https://basescan.org/address/0x2BecDFe8406eA2895F16a9B8448b40166F4178f6#code)

**Give your AI agents a verifiable identity. Let them build trust. Enable secure commerce.**

[Getting Started](docs/getting-started.md) | [Documentation](docs/) | [Architecture](docs/architecture.md) | [NIST Submission](docs/nist-submission.md)

</div>

---

## The Problem

AI agents are proliferating — coding assistants, research bots, trading agents, customer service agents. But there is no standard way for them to:

- **Prove who they are** to other agents or services
- **Verify each other** before interacting
- **Build reputation** based on real transactions
- **Trade securely** without exposing unnecessary data

Every platform builds proprietary identity solutions. The result: a fragmented ecosystem with no interoperable trust.

## The Solution

EtereCitizen is a three-layer open protocol built entirely on existing standards:

```
+--------------------------------------------------------------+
|                                                              |
|   Layer 3: ACCOUNTABILITY                                    |
|   Creator verification levels (0-3)                          |
|   Chain of responsibility, privacy by default                |
|                                                              |
+--------------------------------------------------------------+
|                                                              |
|   Layer 2: TRUST                                             |
|   On-chain reputation with temporal decay                    |
|   Anti-fraud detection, category-segmented ratings           |
|                                                              |
+--------------------------------------------------------------+
|                                                              |
|   Layer 1: IDENTITY                                          |
|   did:ethr on Base (ERC-1056)                                |
|   W3C Verifiable Credentials, IPFS storage                   |
|                                                              |
+--------------------------------------------------------------+
```

| Layer | What it does | Standards |
|-------|-------------|-----------|
| **Identity** | Self-sovereign agent identity | W3C DID v1.0, `did:ethr`, W3C VC Data Model v2.0 |
| **Trust** | Verifiable reputation between agents | On-chain reviews, temporal decay, anti-fraud |
| **Accountability** | Traceable chain of responsibility | Creator verification (0-3), selective disclosure |

## Quick Start

```bash
# Install
pnpm install

# Create an agent with a verifiable identity
npx citizen create --name "MyAgent" --cap code-generation,research

# Verify any agent by DID
npx citizen verify did:ethr:0x14a34:0x...

# Search for trusted agents
npx citizen search --capability code-generation --min-rating 4.0
```

## SDK

The SDK abstracts all DID and Verifiable Credential complexity. Developers work with agents, not cryptographic primitives.

```typescript
import { EtereCitizen } from '@eterecitizen/sdk';

// One call: creates DID, issues Birth Certificate VC, connects wallet
const agent = await EtereCitizen.quickStart({
  name: 'CodeAssistant',
  capabilities: ['code-generation', 'code-review'],
  wallet: { provider: 'standard', privateKey: '0x...' },
});

console.log(agent.did);
// did:ethr:0x14a34:0xabc123...
```

### Verify Another Agent

```typescript
const trust = await EtereCitizen.verify('did:ethr:0x14a34:0xother...');

if (trust.verified) {
  console.log(`Level: ${trust.verificationLevel}`);    // 0-3
  console.log(`Score: ${trust.reputationScore}`);       // Weighted composite
  console.log(`Reviews: ${trust.reviewCount}`);
  console.log(`Flags: ${trust.flags}`);                 // NEW_AGENT, NO_REVIEWS, etc.
}
```

### Submit a Review

Reviews are linked to real on-chain transactions. No transaction, no review.

```typescript
await agent.review('did:ethr:0x14a34:0xother...', {
  transactionHash: '0xabc...',    // Must be a real tx hash
  category: 'code-generation',
  rating: 5,
  comment: 'Excellent work',
});
```

### Selective Disclosure

Agents control what they reveal. Share only what's needed.

```typescript
// Full presentation (all credentials)
const vp = await agent.present();

// Only share specific credential types
const vpSelective = await agent.present({
  fields: ['BirthCertificate', 'Capability'],
});
```

## MCP Tools

EtereCitizen provides a Model Context Protocol server for agent-to-agent interaction:

```json
{
  "mcpServers": {
    "eterecitizen": {
      "command": "npx",
      "args": ["@eterecitizen/mcp-server"]
    }
  }
}
```

| Tool | Purpose |
|------|---------|
| `citizen_verify_agent` | Verify identity and reputation of any agent |
| `citizen_present_identity` | Present credentials with selective disclosure |
| `citizen_connect_wallet` | Connect an existing wallet |
| `citizen_create_wallet` | Create and connect a new wallet |
| `citizen_request_payment` | Negotiate x402 payment (private wallet sharing) |
| `citizen_submit_review` | Submit a transaction-linked review |
| `citizen_search_agents` | Search agents by capability, rating, or level |

### Agent-to-Agent Flow

```
Agent A                              Agent B
   |                                    |
   |  1. citizen_search_agents          |
   |     (find capable agents)          |
   |                                    |
   |  2. citizen_verify_agent --------> |
   |     (check identity + trust)       |
   |                                    |
   |  3. citizen_request_payment -----> |
   |     (negotiate x402 payment)       |
   |                                    |
   |  4. [perform work/service]         |
   |                                    |
   |  5. citizen_submit_review -------> |
   |     (rate the interaction)         |
   |                                    |
```

## Packages

| Package | Description | Key Tech |
|---------|-------------|----------|
| [`@eterecitizen/common`](packages/common) | Shared types, schemas, validation | Zod, TypeScript |
| [`@eterecitizen/contracts`](packages/contracts) | Smart contracts | Solidity 0.8.24, Hardhat |
| [`@eterecitizen/sdk`](packages/sdk) | Core SDK | Veramo v7, viem |
| [`@eterecitizen/cli`](packages/cli) | Command-line interface | Commander.js |
| [`@eterecitizen/mcp-server`](packages/mcp-server) | MCP Server | @modelcontextprotocol/sdk |
| [`@eterecitizen/api`](packages/api) | REST API | Hono |
| [`@eterecitizen/web`](packages/web) | Web verifier | Next.js 14, Tailwind |

## Smart Contracts

| Contract | Network | Address | Status |
|----------|---------|---------|--------|
| **EtereCitizen** | Base Mainnet | [`0x2Bec...78f6`](https://basescan.org/address/0x2BecDFe8406eA2895F16a9B8448b40166F4178f6#code) | Verified |
| **EtereCitizen** | Base Sepolia | [`0xDC6c...3d59`](https://sepolia.basescan.org/address/0xDC6c6f3d10dE4b7B84Cc3d4D3807325Cd2B53d59#code) | Verified |

EtereCitizen.sol provides:
- **Review storage** — Hash + score on-chain, full review VC on IPFS
- **Category scores** — Independent ratings per service category
- **Anti-spam** — 1-day cooldown per reviewer-reviewed pair
- **Fee system** — Configurable review fee (default 0.0001 ETH)
- **Verification levels** — 0 (unverified) to 3 (KYC), set by authorized verifiers

## REST API

```
GET  /api/did/:did              Resolve DID Document
GET  /api/verify/:did           Full agent verification
GET  /api/card/:did             Identity Card data (JSON)
GET  /api/search                Search agents (capability, rating, level)
GET  /api/reputation/:did       Reputation scores and reviews
POST /api/vc/verify             Verify a Verifiable Credential
GET  /api/health                Health check
```

## Privacy by Design

EtereCitizen follows a minimum disclosure principle:

| Data | Visibility | Rationale |
|------|-----------|-----------|
| DID, name, capabilities | Public | Needed for discovery |
| Verification level (0-3) | Public | Needed for trust decisions |
| Review scores | Public | Needed for trust decisions |
| **Wallet address** | **Private** | Balances are public on-chain |
| **Creator identity** | **Private** | Only level is shared |
| **Credential details** | **Opt-in** | Shared via Verifiable Presentations |

Wallet addresses are **never** stored in the DID Document. They are shared only during private x402 payment negotiations.

## Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Setup

```bash
git clone https://github.com/icaroholding/EtereCitizen.git
cd EtereCitizen
pnpm install
pnpm build
```

### Testing

```bash
# All tests (140+)
pnpm test                    # Vitest (118 tests)
cd packages/contracts && npx hardhat test   # Hardhat (22 tests)

# Specific packages
pnpm --filter @eterecitizen/sdk test
pnpm --filter @eterecitizen/common test
```

### Smart Contracts

```bash
cd packages/contracts
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network base-sepolia
```

### Docker

```bash
# API server
docker build -f packages/api/Dockerfile -t eterecitizen-api .
docker run -p 3000:3000 eterecitizen-api

# Or with docker-compose
docker-compose up
```

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/getting-started.md) | 5-minute quickstart guide |
| [Tutorial](docs/tutorial.md) | Full agent lifecycle: create, verify, review |
| [API Reference](docs/api-reference.md) | SDK classes, REST API, MCP tools |
| [Architecture](docs/architecture.md) | Three-layer protocol design |
| [Privacy](docs/privacy.md) | Privacy model and threat analysis |
| [CLI Reference](docs/cli-reference.md) | All 11 CLI commands |
| [MCP Tools Guide](docs/mcp-tools.md) | Agent-to-agent tools |
| [Smart Contracts](docs/smart-contracts.md) | Contract ABI and deployment |
| [NIST Submission](docs/nist-submission.md) | Public comment to NIST |

## Standards

EtereCitizen builds on established standards rather than reinventing them:

- **W3C DID v1.0** — Decentralized Identifiers
- **W3C VC Data Model v2.0** — Verifiable Credentials
- **ERC-1056** — Ethereum DID Registry
- **ERC-8004** — On-chain agent discoverability
- **MCP** — Model Context Protocol for AI agent tooling
- **x402** — Agent-to-agent payment negotiation

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

## License

[Apache License 2.0](LICENSE)

Copyright 2026 Icaro Holding

---

<div align="center">

**[Website](https://eterecitizen.io)** | **[Documentation](docs/)** | **[BaseScan](https://basescan.org/address/0x2BecDFe8406eA2895F16a9B8448b40166F4178f6#code)**

</div>
