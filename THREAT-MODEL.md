# EtereCitizen — Threat Model

**Status:** Draft
**Applies to:** Protocol specification v0.3.0 and reference implementation.
**Last updated:** 2026-04-21

This document catalogs the adversaries, assets, attack surfaces, and mitigations for the EtereCitizen protocol. It is intended to be read alongside [SPEC.md](./SPEC.md) (especially §15 Security Considerations) and is a living artifact — new attacks and mitigations are added as the ecosystem matures.

## 1. Actors

| Actor | Description |
|---|---|
| Agent | Holds its own DID, optionally a wallet, accumulates reputation. Honest or malicious. |
| Issuer | Signs Verifiable Credentials. Can be the Agent itself (self-issued), a third-party service, or an Authorized Verifier. |
| Verifier | Consumes an Agent's DID + VCs + on-chain state to decide whether to trust it. |
| Authorized Verifier | Address allowlisted by the Reputation Contract owner; can set Verification Levels. |
| Contract Owner | Controls fee level, withdraw, verifier list. In v0.3 a single EOA; target is a multisig before mainnet. |
| Observer | Anyone reading public chain state — not privileged but counts as a privacy-relevant actor. |

## 2. Assets

| Asset | Why it matters |
|---|---|
| Agent private key | Forgery of any claim, transfer of payments, impersonation. |
| Reputation score | Directly drives trust decisions and commercial outcomes. |
| Review integrity | A tampered or fabricated review corrupts downstream trust scores. |
| DID document availability | DID resolution failure implies the Agent cannot be verified. |
| Fee pool (contract balance) | Economic loss if drained. |
| Off-chain VC storage (IPFS) | Loss of availability means on-chain hashes become unverifiable. |
| Challenge nonces | Replay of a signed challenge would allow wallet ownership to be impersonated. |

## 3. Adversaries

### A. **External attacker** (no keys)
Wants to drain funds, disrupt service, or tamper with reputation without controlling any Agent identity.

### B. **Malicious Agent**
Controls its own DID and wallet. Wants to inflate its reputation, attack competitors, or steal payments.

### C. **Colluding ring**
N mutually-coordinated Agents that collectively boost each other's reputation (Sybil + collusion).

### D. **Compromised key holder**
An Agent whose private key has leaked. Attacker has temporary full authority over that Agent.

### E. **Malicious or compromised Issuer**
An Authorized Verifier whose private key is compromised, or one acting in bad faith.

### F. **Corrupted infrastructure**
Compromised RPC provider, compromised IPFS pinning service, compromised npm account publishing poisoned packages.

### G. **Network attacker** (MITM)
Can see and tamper with off-chain messages (payment requests, credential exchange) but not forge signatures.

## 4. Threats & mitigations

### 4.1 Review fraud

| Threat | Adversary | Mitigation | Residual risk |
|---|---|---|---|
| **Self-review** (Agent reviews itself) | B | On-chain `require(reviewed != msg.sender)` (§9.4) | None |
| **Replay review** (reuse a txHash to submit same review twice) | B | `_usedTxHashes[txHash]` gate (§9.4) | None on-chain. Off-chain a malicious indexer could lie but §9.6 allows re-hash checks. |
| **Spam reviews from one reviewer to one target** | B | `_lastReviewTime` 24h cooldown per (reviewer, reviewed) pair (§9.4) | Mitigated to 1/day; many days of spam still possible — §10.5 burst/cluster detection reduces impact. |
| **Sybil boost** (many fresh DIDs review the same target) | B/C | Off-chain antifraud: burst + cluster flags (§10.5). Penalty applied in trust score (§10.3). | Sophisticated attackers with patient cadence can evade. Verifiers SHOULD combine with level-2+ verification. |
| **Reciprocal collusion** (A↔B trading 5-star ratings) | C | Reciprocal flag (§10.5.3) | Can be circumvented with a 3-cycle (A→B→C→A). Future work: graph-based detection. |
| **Fake transaction hash** (txHash not tied to real work) | B | The protocol does NOT verify the txHash references a real on-chain event. This is deliberate: any byte32 works. Verifiers MUST cross-check. | Shifts burden to the Verifier. Accepted trade-off for application-agnostic protocol. |
| **Tampered off-chain VC** | A/F | On-chain `reviewHash` is SHA-256 of the VC; Verifiers MUST re-hash on retrieval (§9.6). | None if Verifier follows spec. |

### 4.2 Identity forgery

| Threat | Adversary | Mitigation | Residual risk |
|---|---|---|---|
| Forging a DID document | A | ERC-1056 requires a signature from the key owner. Attacker cannot write to the registry without the private key. | Equivalent to stealing the key (see D). |
| Forging a VC | A | JWT signature with ES256K tied to issuer DID (§6.2). Verification recovers public key from DID Document (C-113). | Equivalent to stealing the issuer key. |
| Impersonation via lookalike DID | A | DID equality is byte-for-byte; no confusion under the protocol. UI layers MUST display full DIDs or checksum-validated short forms. | UI/UX layer risk, not protocol risk. |

### 4.3 Wallet / payment attacks

| Threat | Adversary | Mitigation | Residual risk |
|---|---|---|---|
| Replay of signed challenge to prove wallet ownership | A/G | 5-minute expiry + single-use nonce (§12.1, C-700-702) | None within spec. |
| Payment address substitution (attacker substitutes their own address in a PaymentResponse) | G | SPEC §12.2 RECOMMENDS signing PaymentResponses (C-721). Without signatures, MITM can swap addresses. | Open against unsigned responses. Implementations SHOULD sign. |
| Front-running the review submission to claim the txHash first | B | No mitigation — whoever submits first claims the txHash. The correct reviewer would see the conflicting review and can surface a complaint. | Low-severity griefing vector; victim's own reputation is unaffected. |

### 4.4 Contract-level attacks

| Threat | Adversary | Mitigation | Residual risk |
|---|---|---|---|
| Reentrancy on fee refund | A | CEI order: all state mutations precede the `call{value: ...}` (§9.5 step 8). | None under CEI. |
| Integer overflow on score aggregation | A | Solidity 0.8.x native overflow checks. `_categoryTotalScore` stored as `uint256`. | None with 0.8.x; would require ~2^254 reviews. |
| Fee drain by owner | Owner | Owner CAN withdraw fees at any time — this is intentional admin capability. | Mitigate by transferring ownership to a multisig before mainnet. |
| Owner maliciously sets arbitrary Verification Levels | Owner/Authorized Verifier | Not mitigated in v0.3. Authorized Verifiers are trusted by the contract. | Requires social/legal trust in the operator; multisig governance reduces risk. |
| Authorized Verifier abuse | E | Same as above plus owner can remove. | Bounded by time-to-detect + time-to-remove. |
| Gas-grief via capability spam | B | `MAX_CAPABILITIES = 50` (§7.3) caps array size. | Mostly mitigated; still 50 slots of 32-byte storage. |
| Re-push of DID registration with altered capabilities | B | `updateAgent` requires prior registration and only updates `name`; capabilities are add-only. | Cannot remove capabilities from on-chain record; historical integrity preserved. |

### 4.5 Infrastructure attacks

| Threat | Adversary | Mitigation | Residual risk |
|---|---|---|---|
| Compromised RPC endpoint lies about on-chain state | F | Verifiers SHOULD use multiple independent RPCs or archive nodes. | Limited by operator's RPC diversity. |
| IPFS pinning service loses content | F | Off-chain VC becomes unverifiable (§9.6 re-hash check fails). | Implementations SHOULD pin to multiple services. |
| Malicious npm package (supply-chain) publishing a compromised SDK | F | Published packages carry GitHub Actions provenance (trusted publishing) — consumers MAY verify. | Verification is opt-in; most users won't. |
| Compromised npm account | F | npm trusted publishing does not require a long-lived token on the publisher's machine. Write access to npm still goes through 2FA-gated sessions. | Reduced; not eliminated. |
| Key leak from reference implementation key store | F | AES-256-GCM + scrypt at rest (§15.4). Implementations MUST NOT persist plaintext keys. | Depends on implementation correctness. |

### 4.6 Privacy attacks

| Threat | Adversary | Mitigation | Residual risk |
|---|---|---|---|
| Wallet address ↔ DID linkage | Observer | **Accepted**: inherent to did:ethr. DID *is* the address. | Cannot be fixed without moving off did:ethr (§17.1). |
| Task description exposure via public IPFS | Observer | Work History VCs on public IPFS are readable by anyone with the CID. | Mitigate by using permissioned storage (§16.2 C-1000). |
| Challenge plaintext reveals wallet interaction history | Observer | Challenge is signed but not published. `challengeHash` stored in VC (§6.5 C-140) is irreversible. | Mitigated. |
| Correlation across chains (same agent DID cross-deployment) | Observer | An Agent's address is deterministic across EVM chains; cross-chain correlation is trivial. | Accepted; use separate agents per chain to prevent linking. |

## 5. Invariants

These are protocol-level properties any conforming implementation MUST preserve.

- **I1**: Once submitted and included on-chain, a review's `reviewHash` and rating are immutable.
- **I2**: Only the owner of the private key corresponding to an address may sign credentials as that DID.
- **I3**: A `txHash` may be used at most once across all reviews ever accepted by the Reputation Contract.
- **I4**: A Verifier computing the Trust Score from identical inputs MUST produce an identical output (modulo 1e-12 float tolerance).
- **I5**: The contract balance is never less than `totalFeesCollected` minus legitimate withdrawals (fees are neither lost nor created).

## 6. Non-goals

The protocol does NOT attempt to:

- Prevent the same human from operating many Agents (Sybil). Verifiers must bolt on external Sybil-resistance layers.
- Guarantee completeness of off-chain data retrieval.
- Provide transactional guarantees spanning reviewer and reviewed actions (e.g., payment and review in one atomic step).
- Conceal that a given DID has been active (on-chain activity is public by design).
- Verify the factual content of reviews (rating accuracy is a social, not cryptographic, property).

## 7. Open problems

The following are known gaps we expect to address in future protocol revisions.

- **No JSON canonicalization**: SPEC §9.2 acknowledges reliance on insertion-order `JSON.stringify`; this will be replaced with [RFC 8785 JCS](https://www.rfc-editor.org/rfc/rfc8785) in a minor version update.
- **No graph-based collusion detection**: Reciprocal flag only catches 2-cycles. 3+ cycles are undetected today.
- **No contract upgradability**: Bug fixes require redeployment. Proxy pattern deferred to Phase 2.
- **No wallet-address rotation**: An Agent's DID is tied 1:1 to an Ethereum address for life. Rotation requires migrating to a new DID and losing reputation history.
- **Cross-chain reputation portability**: Not defined.

## 8. Incident response

Security vulnerabilities MUST be reported per [SECURITY.md](./SECURITY.md) and NOT via public issues.

Upon validated report:

1. Reporter contacted within 72 hours.
2. Impact assessed; mitigations drafted.
3. If contract-level and live funds at risk, fee withdrawals paused via owner key; contract redeployment prepared.
4. Coordinated disclosure scheduled (90-day default, shorter for active exploitation).
5. Post-incident summary published alongside fix.

## 9. Change log

- **2026-04-21** — Initial draft alongside SPEC.md v0.3.0.
