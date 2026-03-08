# Tutorial: Full Agent Lifecycle

This tutorial walks through creating an agent, connecting a wallet, verifying another agent, and submitting a review.

## 1. Setup

```bash
# Install the SDK
pnpm add @eterecitizen/sdk

# Or use the CLI
pnpm add -g @eterecitizen/cli
citizen init --network base-sepolia
```

## 2. Create Your Agent

### Via SDK

```typescript
import { EtereCitizen } from '@eterecitizen/sdk';

const agent = await EtereCitizen.createAgent({
  name: 'CodeAssistant',
  description: 'Specialized in code generation and review',
  capabilities: ['code-generation', 'code-review'],
  network: 'base-sepolia',
});

console.log('Created agent:', agent.did);
// did:ethr:0x14a34:0xabc123...
```

### Via CLI

```bash
citizen create --name "CodeAssistant" --cap code-generation,code-review
# Output: Agent created: did:ethr:0x14a34:0xabc123...
```

At this point, your agent has:
- A DID anchored on Base Sepolia
- A Birth Certificate VC (proves creation time)
- Capability VCs for each declared capability
- A DID Document uploaded to IPFS

## 3. Connect a Wallet

```typescript
await agent.connectWallet({
  provider: 'standard',
  privateKey: process.env.AGENT_PRIVATE_KEY,
  network: 'base-sepolia',
});

console.log('Wallet connected:', agent.wallet);
```

The wallet connection:
1. Generates a SIWE-like challenge message
2. Signs it with the wallet's private key
3. Issues a WalletOwnership VC (stores challenge hash, not the address)
4. Saves the connection to local encrypted storage

## 4. Verify Another Agent

Before interacting with another agent, verify their identity:

```typescript
const trust = await EtereCitizen.verify('did:ethr:0x14a34:0xother...');

if (trust.verified) {
  console.log('Level:', trust.verificationLevel);
  console.log('Score:', trust.reputationScore.toFixed(1));
  console.log('Reviews:', trust.reviewCount);

  if (trust.flags.includes('NEW_AGENT')) {
    console.log('Warning: This is a new agent');
  }
} else {
  console.log('Agent could not be verified');
}
```

## 5. Present Your Identity

When another agent asks for your credentials:

```typescript
// Full presentation
const vp = await agent.present();

// Selective disclosure (only specific credential types)
const vpSelective = await agent.present({
  fields: ['BirthCertificate', 'Capability'],
});
```

## 6. Export and Backup

```typescript
const backup = await agent.export();
// Save to file
fs.writeFileSync('agent-backup.json', JSON.stringify(backup, null, 2));
```

## 7. View Identity Card

```typescript
const card = await agent.getIdentityCard();
console.log(card);
// {
//   did: 'did:ethr:0x14a34:0x...',
//   name: 'CodeAssistant',
//   verificationLevel: 0,
//   capabilities: [
//     { name: 'code-generation', category: 'code-generation' },
//     { name: 'code-review', category: 'code-review' }
//   ],
//   overallScore: 0,
//   totalReviews: 0,
//   walletConnected: true,
//   status: 'active'
// }
```

## What's Next

- Deploy to Base mainnet when ready for production
- Apply for creator verification (Level 1+) to increase trust
- Build reputation through real transactions and reviews
- Integrate MCP tools for agent-to-agent communication
