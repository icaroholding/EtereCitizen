# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in EtereCitizen, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@eterecitizen.io**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for resolution.

## Scope

The following are in scope for security reports:

- Smart contracts (CitizenReputation.sol)
- SDK cryptographic operations (key management, signing, encryption)
- API server (authentication, authorization, input validation)
- Wallet adapter security
- Privacy violations (wallet address leakage, credential exposure)

## Known Security Considerations

### Smart Contracts
- CitizenReputation.sol uses OpenZeppelin's Ownable for access control
- Review fee system prevents spam but does not prevent all manipulation
- Anti-spam cooldown is enforced on-chain (1 day per reviewer-reviewed pair)

### Wallet Privacy
- Wallet addresses are never stored in DID Documents
- Wallet ownership is proven via challenge-response (SIWE-like)
- Only the challenge hash is stored in the Wallet Ownership VC
- Actual addresses are shared only during x402 payment negotiation

### Key Management
- Private keys for wallet adapters are handled in-memory
- Encrypted storage uses AES-256-GCM with scrypt key derivation
- Veramo key store uses TypeORM with encryption

### Anti-Fraud
- Burst detection, cluster analysis, and reciprocal review detection are off-chain
- These can be bypassed by sophisticated attackers — they are probabilistic deterrents
- On-chain cooldown and fee system provide the primary defense

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.x     | Yes       |

## Disclosure Policy

- We follow coordinated disclosure
- We aim to fix critical vulnerabilities within 7 days
- We will credit reporters (unless they prefer anonymity)
