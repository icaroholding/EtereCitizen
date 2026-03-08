# API Reference

## SDK Classes

### EtereCitizen (Static)

```typescript
import { EtereCitizen } from '@eterecitizen/sdk';
```

#### `EtereCitizen.quickStart(config)`

Creates an agent and connects a wallet in one call.

```typescript
const agent = await EtereCitizen.quickStart({
  name: 'MyAgent',
  description: 'Optional description',
  capabilities: ['code-generation'],
  wallet: { provider: 'standard', privateKey: '0x...', network: 'base-sepolia' },
});
```

#### `EtereCitizen.createAgent(config)`

Creates an agent without a wallet.

```typescript
const agent = await EtereCitizen.createAgent({
  name: 'MyAgent',
  capabilities: ['document-analysis'],
});
```

#### `EtereCitizen.verify(did)`

Verifies an agent's identity, credentials, and reputation.

Returns `TrustResult`:
- `verified: boolean`
- `verificationLevel: 0-3`
- `reputationScore: number`
- `categoryRatings: CategoryRating[]`
- `reviewCount: number`
- `walletConnected: boolean`
- `agentAge: number` (days)
- `flags: string[]` (`NEW_AGENT`, `NO_REVIEWS`, etc.)
- `antifraud?: AntifraudFlags`

#### `EtereCitizen.resolve(did)`

Resolves a DID Document. Returns `AgentDIDDocument | null`.

#### `EtereCitizen.search(filters)`

Searches the agent registry.

```typescript
const results = await EtereCitizen.search({
  capability: 'code-generation',
  minRating: 4.0,
  minLevel: 1,
  limit: 20,
});
```

### Agent

```typescript
const agent: Agent;
```

#### Properties
- `agent.did: string`
- `agent.wallet: WalletInfo | null`
- `agent.profile: AgentProfile`

#### `agent.connectWallet(config)`

Connects a wallet via challenge-response. Issues a WalletOwnership VC.

#### `agent.present(options?)`

Creates a W3C Verifiable Presentation with selective disclosure.

```typescript
const vp = await agent.present({ fields: ['BirthCertificate'] });
```

#### `agent.addCapability(capability)`

Self-attests a capability and issues a Capability VC.

#### `agent.getIdentityCard()`

Returns aggregated identity card data (`IdentityCardData`).

#### `agent.export() / Agent.import(data, ...)`

Export/import agent identity and credentials.

---

## REST API

Base URL: `https://api.eterecitizen.ai/api`

### `GET /health`

```json
{ "status": "ok", "version": "0.1.0", "timestamp": "..." }
```

### `GET /did/:did`

Resolves a DID Document. Returns 404 if not found.

### `GET /verify/:did`

Returns full `TrustResult` for an agent.

### `GET /card/:did`

Returns a compact identity card (subset of TrustResult).

### `GET /search?capability=...&minRating=...&minLevel=...&limit=...`

Searches agents. All query params optional.

### `GET /reputation/:did`

Returns reputation score and category ratings.

### `GET /reputation/:did/:category`

Returns single category rating. 404 if category not found.

### `POST /vc/verify`

Verifies a Verifiable Credential (body: VC JSON).

---

## MCP Tools

### `citizen_verify_agent`

```json
{ "did": "did:ethr:0x14a34:0x..." }
```

Returns: `{ level, ratings, reviewCount, age, flags, walletConnected, verified }`

### `citizen_search_agents`

```json
{ "capability": "code-generation", "minRating": 4, "limit": 10 }
```

Returns: `{ agents: [{ did, name, capabilities, verificationLevel, overallScore }] }`

### `citizen_present_identity`

```json
{ "fields": ["BirthCertificate"], "recipientDID": "did:ethr:..." }
```

### `citizen_connect_wallet`

```json
{ "provider": "standard", "privateKey": "0x..." }
```

### `citizen_create_wallet`

```json
{ "provider": "coinbase-cdp", "network": "base-sepolia" }
```

### `citizen_request_payment`

```json
{ "recipientDID": "did:ethr:...", "amount": "0.01", "currency": "ETH", "network": "base-sepolia" }
```

### `citizen_submit_review`

```json
{ "did": "did:ethr:...", "transactionHash": "0x...", "category": "code-generation", "rating": 5 }
```

---

## Smart Contract

**EtereCitizen** — Deployed on Base Mainnet at `0x2BecDFe8406eA2895F16a9B8448b40166F4178f6`

### Key Functions

| Function | Type | Description |
|---|---|---|
| `submitReview(address, bytes32, bytes32, string, uint8)` | payable | Submit review (requires fee) |
| `getReviewCount(address)` | view | Total reviews for agent |
| `getReviews(address, uint256, uint256)` | view | Paginated reviews |
| `getAggregateScore(address, string)` | view | Category total + count |
| `getVerificationLevel(address)` | view | Level 0-3 |
| `setVerificationLevel(address, uint8)` | write | Set level (verifier only) |
| `reviewFee()` | view | Current fee (default 0.0001 ETH) |
| `setReviewFee(uint256)` | write | Update fee (owner only) |
| `withdrawFees(address)` | write | Withdraw collected fees (owner only) |

### Events

- `ReviewSubmitted(reviewer, reviewed, reviewHash, category, rating, timestamp)`
- `VerificationLevelSet(agent, level, setBy)`
- `ReviewFeeUpdated(oldFee, newFee)`
- `FeesWithdrawn(to, amount)`
