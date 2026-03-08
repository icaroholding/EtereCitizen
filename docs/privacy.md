# Privacy in EtereCitizen

## Core Principle

**Privacy by default, disclosure by choice.**

EtereCitizen is designed so that the minimum information needed for trust verification is public, and everything else requires explicit consent from the agent.

## What Is Public

| Data | Where | Why |
|---|---|---|
| DID | On-chain (ERC-1056) | Identity anchor |
| Verification level (0-3) | On-chain (CitizenReputation) | Trust signal |
| Review scores | On-chain | Reputation |
| Review hashes | On-chain | Verifiability |
| Agent name | IPFS (DID Document) | Discoverability |
| Capabilities | IPFS (DID Document) | Discoverability |

## What Is Private

| Data | Storage | Disclosed Via |
|---|---|---|
| Wallet address | Local encrypted store | Verifiable Presentation (opt-in) |
| Account balance | Never stored | N/A (read from chain only during payment) |
| Creator personal data | Never stored | Level is public, data is not |
| Full review content | IPFS (hash on-chain) | Anyone with CID |
| Verification documents | Off-chain (KYC provider) | Never disclosed |

## Key Design Decisions

### 1. Wallet Address Never in DID Document

On Ethereum/Base, knowing an address means knowing the balance. To prevent financial profiling:

- Wallet addresses are stored in local encrypted storage (AES-256-GCM)
- Wallet connection is proven via WalletOwnership VC (stores challenge hash, not address)
- Actual address shared only during x402 payment negotiation via private VP exchange

### 2. Selective Disclosure via Verifiable Presentations

Agents can choose exactly what to share:

```typescript
// Share only birth certificate and capabilities
const vp = await agent.present({
  fields: ['BirthCertificate', 'Capability'],
});
```

### 3. Creator Verification = Level, Not Data

- Level 0: Unverified (default)
- Level 1: Domain verified (DNS TXT record)
- Level 2: Business verified
- Level 3: KYC verified

The level is stored on-chain. The verification data (documents, business registration, KYC records) stays with the verification provider and is never stored in the protocol.

### 4. Encrypted Local Storage

All sensitive local data is encrypted with AES-256-GCM:

- Key derived via scrypt from user password
- Unique salt + IV per encryption
- Authentication tag prevents tampering

### 5. Review Privacy

- On-chain: review hash, score, category, timestamps
- Off-chain (IPFS): full review VC with optional comment
- The review VC on IPFS is publicly accessible if you have the CID, but CIDs are not indexed publicly

## Threat Model

| Threat | Mitigation |
|---|---|
| Balance snooping | Wallet address never in DID Document |
| Identity correlation | DIDs are pseudonymous (address-based) |
| Review manipulation | On-chain immutability + anti-fraud detection |
| Data breach of local store | AES-256-GCM encryption |
| Creator doxxing | Only verification level is public |
| Replay attacks | SIWE-like challenges with nonce + expiry |
