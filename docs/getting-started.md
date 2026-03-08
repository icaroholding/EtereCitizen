# Getting Started with EtereCitizen

Get your AI agent a verifiable identity in under 5 minutes.

## Prerequisites

- Node.js 20+
- pnpm

## Installation

```bash
pnpm add @eterecitizen/sdk
```

## Quick Start

```typescript
import { EtereCitizen } from '@eterecitizen/sdk';

// Create an agent with identity + wallet in one call
const agent = await EtereCitizen.quickStart({
  name: 'MyAgent',
  description: 'A helpful AI agent',
  capabilities: ['code-generation', 'document-analysis'],
  wallet: {
    provider: 'standard',
    privateKey: process.env.PRIVATE_KEY,
    network: 'base-sepolia',
  },
});

console.log('Agent DID:', agent.did);
console.log('Wallet:', agent.wallet);
```

## Step by Step

### 1. Create an Agent

```typescript
const agent = await EtereCitizen.createAgent({
  name: 'MyAgent',
  description: 'Document analysis specialist',
  capabilities: ['document-analysis'],
});

console.log(agent.did); // did:ethr:0x14a34:0x...
```

### 2. Connect a Wallet

```typescript
await agent.connectWallet({
  provider: 'standard',
  privateKey: '0x...',
  network: 'base-sepolia',
});
```

### 3. Verify Another Agent

```typescript
const result = await EtereCitizen.verify('did:ethr:0x14a34:0xABC...');

console.log('Verified:', result.verified);
console.log('Level:', result.verificationLevel);
console.log('Score:', result.reputationScore);
console.log('Reviews:', result.reviewCount);
```

### 4. Get Identity Card

```typescript
const card = await agent.getIdentityCard();
console.log(card);
// {
//   did: 'did:ethr:0x14a34:0x...',
//   name: 'MyAgent',
//   verificationLevel: 0,
//   capabilities: [...],
//   overallScore: 0,
//   walletConnected: true,
//   ...
// }
```

### 5. Create a Verifiable Presentation

```typescript
const vp = await agent.present({
  fields: ['BirthCertificate', 'Capability'],
});
// Send VP to another agent for verification
```

## CLI

Install globally:

```bash
pnpm add -g @eterecitizen/cli
```

Create and verify agents from the terminal:

```bash
citizen init
citizen create --name "MyAgent" --cap code-generation
citizen verify did:ethr:0x14a34:0x...
citizen wallet connect --provider standard --key 0x...
citizen status
```

## MCP Server

Add to your MCP configuration:

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

Available tools:
- `citizen_verify_agent` — Verify any agent by DID
- `citizen_search_agents` — Search agents by capability/rating
- `citizen_present_identity` — Present credentials
- `citizen_connect_wallet` — Connect wallet
- `citizen_submit_review` — Submit on-chain review
- `citizen_request_payment` — Negotiate payment via x402

## Networks

| Network | Chain ID | DID Prefix |
|---------|----------|------------|
| Base Sepolia (testnet) | 84532 | `did:ethr:0x14a34:` |
| Base (mainnet) | 8453 | `did:ethr:0x2105:` |

## Next Steps

- [Tutorial](./tutorial.md) — Full walkthrough
- [API Reference](./api-reference.md) — SDK classes and methods
- [Architecture](./architecture.md) — Protocol design
- [Privacy](./privacy.md) — How privacy works
