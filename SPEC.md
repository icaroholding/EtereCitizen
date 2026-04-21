# EtereCitizen Protocol Specification

**Version:** 0.3.0
**Status:** Draft
**Latest revision:** 2026-04-21
**Editor:** Michele Trani — Icaro Holding
**License:** [Apache License, Version 2.0](./LICENSE)

---

## Abstract

EtereCitizen is an open protocol providing decentralized identity, verifiable capability attestation, on-chain reputation, and trust-based payment negotiation for autonomous software agents — including but not limited to AI agents. It layers W3C Verifiable Credentials and an EVM reputation contract on top of the [ERC-1056](https://eips.ethereum.org/EIPS/eip-1056) Ethereum DID method (`did:ethr`), yielding a deployment-ready substrate for agent-to-agent commerce and trust without a central intermediary.

This document specifies the normative wire formats, algorithms, storage layout, and conformance requirements that any interoperable implementation of the protocol MUST satisfy.

## Status of this Document

This is a Draft specification intended for public review. It is not currently endorsed by any standards-setting body. Submissions to the [W3C DID Methods Registry](https://www.w3.org/TR/did-spec-registries/) and the [Ethereum ERC process](https://ercs.ethereum.org/) are planned after community review.

Comments and issues SHOULD be filed at [https://github.com/icaroholding/EtereCitizen/issues](https://github.com/icaroholding/EtereCitizen/issues).

## Copyright and License

Copyright 2026 Icaro Holding — Michele Trani.

This specification is licensed under the [Apache License, Version 2.0](./LICENSE). Reference implementations in this repository are licensed under the same terms unless otherwise noted.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Terminology](#2-terminology)
3. [Conformance Keywords](#3-conformance-keywords)
4. [Protocol Architecture](#4-protocol-architecture)
5. [Identity Layer](#5-identity-layer)
6. [Verifiable Credentials](#6-verifiable-credentials)
7. [Agent Registration](#7-agent-registration)
8. [Reputation Contract](#8-reputation-contract)
9. [Review Submission Protocol](#9-review-submission-protocol)
10. [Trust Score Computation](#10-trust-score-computation)
11. [Verification Flow](#11-verification-flow)
12. [Payment Negotiation](#12-payment-negotiation)
13. [Agent Discovery](#13-agent-discovery)
14. [Cryptographic Requirements](#14-cryptographic-requirements)
15. [Security Considerations](#15-security-considerations)
16. [Privacy Considerations](#16-privacy-considerations)
17. [Extension Points](#17-extension-points)
18. [Conformance Profiles](#18-conformance-profiles)
19. [Versioning and Evolution](#19-versioning-and-evolution)
20. [IANA / Registry Considerations](#20-iana--registry-considerations)

- [Appendix A: JSON Schemas](#appendix-a-json-schemas)
- [Appendix B: Test Vectors](#appendix-b-test-vectors)
- [Appendix C: Normative References](#appendix-c-normative-references)
- [Appendix D: Informative References](#appendix-d-informative-references)
- [Appendix E: Change Log](#appendix-e-change-log)

---

## 1. Introduction

### 1.1 Motivation

Autonomous software agents — AI assistants, automated trading bots, IoT devices, multi-agent orchestration frameworks — increasingly transact with each other without human-in-the-loop verification. These interactions require:

1. A way for an agent to **prove who it is** in a cryptographically verifiable manner.
2. A way for an agent to **attest to its capabilities** (e.g., "this agent is authorized to perform translation tasks").
3. A way to **measure trustworthiness** based on prior conduct, without a central arbiter.
4. A way to **negotiate payment** privately, without leaking the agent's wallet address to the public DID document.

No single existing standard solves all four problems. W3C DIDs and VCs cover identity and attestation. Ethereum and similar chains cover permissionless value transfer. But the glue layer — agent-specific credential types, a non-Sybil-resistant-but-reputation-grounded scoring model, and a payment negotiation ceremony — is absent.

EtereCitizen provides this glue.

### 1.2 Goals

- **G1**: Permissionless — any party MAY deploy, implement, or participate without approval from a gatekeeper.
- **G2**: Decentralized — no single service is required for an agent to exist, make claims, or be verified.
- **G3**: Interoperable — built on W3C Verifiable Credentials, ERC-1056, JSON-LD, and JWT.
- **G4**: Privacy-preserving — wallet addresses are not stored in the public DID document; private challenge values are not persisted.
- **G5**: Reimplementable — this specification is sufficient to build an independent implementation in any language.

### 1.3 Non-goals

- **NG1**: This protocol does NOT prescribe a specific economic or token model.
- **NG2**: This protocol does NOT attempt to prevent all forms of Sybil attacks. It provides detectable indicators of suspicious behavior; mitigation is left to application policy.
- **NG3**: This protocol does NOT define an agent-execution runtime, only agent identity and reputation semantics.
- **NG4**: This protocol does NOT require an AI model; human-operated or fully deterministic agents MAY participate identically.

### 1.4 Relationship to Other Standards

| Standard | Relationship |
|---|---|
| W3C DID Core 1.0 | EtereCitizen agents are identified by DIDs conforming to DID Core. |
| W3C VC Data Model 2.0 | All credential types defined here are Verifiable Credentials. |
| ERC-1056 Ethereum DID Method (`did:ethr`) | The REQUIRED default DID method for v0.3. |
| RFC 7519 JSON Web Token | REQUIRED proof format for credentials. |
| EIP-4361 Sign-in with Ethereum | The wallet-ownership challenge ceremony is derived from this format. |
| ERC-8004 Agent Registry (draft) | EtereCitizen aims for compatibility once ERC-8004 is finalized. |
| Coinbase x402 Payments | Payment responses are compatible with x402-style payment flows. |

---

## 2. Terminology

The following terms are used normatively throughout this document.

- **Agent**: A software entity (autonomous or semi-autonomous) identified by a DID and capable of participating in the protocol as an issuer, holder, verifier, or counterparty.
- **Agent DID**: The W3C DID that uniquely identifies an Agent. See §5.
- **Issuer**: An Agent or other party that cryptographically signs and issues a Verifiable Credential.
- **Holder**: An Agent that possesses one or more Verifiable Credentials about itself.
- **Verifier**: An Agent, service, or end-user that inspects an Agent's DID and credentials to decide whether to trust it.
- **Verifiable Credential (VC)**: A W3C VC as defined in [VC-DATA-MODEL]. See §6.
- **Review**: A structured statement by one Agent about another Agent's performance on a specific transaction, with a rating of 1–5.
- **Reputation Contract**: The canonical EVM smart contract storing on-chain review hashes and aggregate scores. See §8.
- **Reputation Score**: A score in the range [0.0, 5.0] representing the reviewed Agent's weighted average rating. See §10.
- **Trust Score**: A scalar in the range [0.0, 1.0] computed by a Verifier from multiple signals including reputation, verification level, age, and antifraud flags. See §10.
- **Verification Level**: An integer in {0,1,2,3} indicating a human-operator-backed claim about the Agent's identity. See §8.4.
- **Authorized Verifier**: An Ethereum address permitted by the Reputation Contract owner to set Verification Levels.
- **Transaction Hash (txHash)**: A 32-byte identifier uniquely binding a Review to a specific off-protocol work transaction, typically the hash of an on-chain payment transaction. Used for anti-replay (§9.4).
- **IPFS**: The InterPlanetary File System used for off-chain VC storage.
- **CID**: A Content Identifier as used by IPFS.
- **Network**: An EVM-compatible blockchain on which the Reputation Contract is deployed. See §5.6.
- **Capability**: A short string label (and matching Category, §6.6) describing a service an Agent claims to provide.

---

## 3. Conformance Keywords

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119] and [RFC 8174] when, and only when, they appear in all capitals, as shown here.

Conformance clauses in this specification are marked with explicit identifiers of the form **[C-NNN]** to facilitate automated checking.

---

## 4. Protocol Architecture

EtereCitizen is organized as five cooperating layers. An implementation MAY implement any subset, subject to the conformance profiles in §18.

```
+--------------------------------------------------------+
|  Layer 5: Discovery    (off-chain registry / index)    |
+--------------------------------------------------------+
|  Layer 4: Payment      (x402 / wallet challenge)       |
+--------------------------------------------------------+
|  Layer 3: Trust        (trust-score formula + flags)   |
+--------------------------------------------------------+
|  Layer 2: Reputation   (on-chain EtereCitizen.sol)     |
+--------------------------------------------------------+
|  Layer 1: Credentials  (W3C VCs: birth/capability/...) |
+--------------------------------------------------------+
|  Layer 0: Identity     (did:ethr via ERC-1056)         |
+--------------------------------------------------------+
```

**[C-001]** An implementation claiming the `core` conformance profile (§18.1) MUST implement Layers 0, 1, 2, and 3.
**[C-002]** An implementation claiming the `full` conformance profile MUST implement all six layers.

---

## 5. Identity Layer

### 5.1 DID Method

**[C-010]** Implementations MUST use the `did:ethr` DID method as defined by [ERC-1056] for Agent identifiers in v0.3 of this protocol.

Future versions MAY introduce additional DID methods; see §17.1.

### 5.2 DID Syntax

An Agent DID MUST conform to the following ABNF (RFC 5234):

```
did              = "did:ethr:" network-id ":" eth-address
network-id       = "0x" 1*HEXDIG
eth-address      = "0x" 40(HEXDIG)
```

Where:

- `network-id` is the hexadecimal representation of the EVM chain ID, lowercase, without leading zeros.
- `eth-address` is the lowercase hexadecimal Ethereum address, exactly 20 bytes (40 hex digits), 0x-prefixed.

**[C-011]** Parsers MUST accept both lowercase and mixed-case hex in `eth-address` and `network-id` but implementations generating DIDs SHOULD emit lowercase.
**[C-012]** A DID with fewer than four colon-separated parts, or whose `parts[0]` is not `did` or whose `parts[1]` is not `ethr`, MUST be rejected as invalid.
**[C-013]** The last colon-separated part of a DID MUST match the regular expression `/^0x[a-fA-F0-9]{40}$/`.

#### 5.2.1 Examples

Base Sepolia (chain ID 84532 = 0x14b32):
```
did:ethr:0x14b32:0x1234567890123456789012345678901234567890
```

Base Mainnet (chain ID 8453 = 0x20b5):
```
did:ethr:0x20b5:0x1234567890123456789012345678901234567890
```

### 5.3 DID Document

**[C-020]** Agent DID Documents MUST conform to [DID-CORE].
**[C-021]** An Agent DID Document MUST contain at least the following members:

| Member | Type | Requirement |
|---|---|---|
| `@context` | `string[]` | MUST include `"https://www.w3.org/ns/did/v1"` |
| `id` | `string` | MUST equal the Agent DID |
| `verificationMethod` | `array` | MUST contain at least one `EcdsaSecp256k1RecoveryMethod2020` entry |
| `authentication` | `array` | MUST contain at least one reference to a verificationMethod |
| `assertionMethod` | `array` | SHOULD contain at least one reference to a verificationMethod |

**[C-022]** An Agent DID Document MAY contain a `service` array advertising endpoints such as IPFS gateways for retrieving the Agent's credentials. Service entries SHOULD follow [DID-CORE] §5.4 and SHOULD NOT disclose the Agent's wallet address beyond what is derivable from the DID itself.

### 5.4 DID Resolution

**[C-030]** DID resolution MUST be performed via an ERC-1056-compatible resolver reading from the chain's Ethereum DID Registry contract.
**[C-031]** The canonical ERC-1056 registry address on the supported networks (§5.6) is:
```
0xd1D374DDE031075157fDb64536eF5cC13Ae75000
```
**[C-032]** Implementations MUST NOT rely on off-chain resolver state that has not been verified against on-chain registry state.

### 5.5 Parsing Utilities

The following procedures are normative.

#### 5.5.1 `address_to_did(address, network) -> did`

Input: an Ethereum address (0x-prefixed 20-byte hex), a network name.
Output: a DID string.

1. Look up the chain ID for `network`.
2. Format chain ID as lowercase hex without leading zeros: `hex_chain_id = hex(chain_id)[2:].lower()`.
3. Return the string `"did:ethr:0x" || hex_chain_id || ":" || address.lower()`.

#### 5.5.2 `did_to_address(did) -> address_or_null`

1. Split `did` by `:`.
2. If there are fewer than 4 parts, or `parts[0] != "did"`, or `parts[1] != "ethr"`, return null.
3. Return `parts[len(parts) - 1]`.

#### 5.5.3 `did_to_network(did) -> network_name_or_null`

1. Split `did` by `:`.
2. If there are fewer than 4 parts, or `parts[0] != "did"`, or `parts[1] != "ethr"`, return null.
3. Parse `parts[2]` as a hexadecimal integer (without the `0x` prefix handled as a hex parse).
4. For each known network in the implementation's registry, if its chain ID equals the parsed integer, return the network name. Otherwise return null.

### 5.6 Supported Networks

In v0.3, the following EVM networks are supported:

| Network name | Chain ID | Explorer | Notes |
|---|---|---|---|
| `base-sepolia` | 84532 (0x14b32) | sepolia.basescan.org | Default for testing |
| `base` | 8453 (0x20b5) | basescan.org | Production (requires audit before use) |

**[C-040]** Implementations MUST reject DIDs whose embedded chain ID does not correspond to a supported network.
**[C-041]** Implementations MAY add additional networks; see §17.3.
**[C-042]** The default network for implementations providing a user-facing defaulting behavior MUST be `base-sepolia` unless explicitly overridden.

---

## 6. Verifiable Credentials

EtereCitizen defines six credential types. All are W3C Verifiable Credentials.

### 6.1 Common Structure

**[C-100]** Every EtereCitizen VC MUST be a valid W3C Verifiable Credential per [VC-DATA-MODEL].
**[C-101]** Every EtereCitizen VC MUST include in its `@context`:
```
"https://www.w3.org/2018/credentials/v1"
```
as the first entry, and the type-specific context URI (listed in §6.3–6.8) as the second entry.

**[C-102]** The `type` array MUST start with `"VerifiableCredential"` and MUST include exactly one EtereCitizen-specific type name (listed in §6.3–6.8).

**[C-103]** The `issuer` member MUST be either a DID string conforming to §5.2 or an object containing an `id` field that is such a DID string.

**[C-104]** The `issuanceDate` member MUST be an ISO 8601 UTC date-time string.

**[C-105]** If an `expirationDate` member is present, it MUST be an ISO 8601 UTC date-time string and MUST be later than `issuanceDate`.

**[C-106]** Every VC MUST carry a cryptographic proof. In v0.3, the proof format is JWT per §6.2.

### 6.2 Proof Format

**[C-110]** EtereCitizen VCs MUST be signed using a JSON Web Token as defined in [RFC 7519].
**[C-111]** The JWT signing algorithm MUST be `ES256K` (ECDSA using secp256k1 and SHA-256) per [RFC 8812].
**[C-112]** The JWT MUST include `iss` (issuer DID), `sub` (subject DID, if applicable), `nbf` (not-before, corresponding to `issuanceDate`), and `vc` (the credential payload minus the proof) claims.
**[C-113]** Verification MUST follow [did-jwt-vc] semantics: recover the signer's public key via the DID Document's `verificationMethod`, and confirm the JWT signature.

### 6.3 Birth Certificate Credential

Attests to the creation of an Agent.

- **Type**: `"EtereCitizenBirthCertificate"`
- **Context URI**: `"https://eterecitizen.ai/ns/vc/birth-certificate/v1"`
- **Issuer**: The Agent itself (self-issued) or its creator.
- **Subject**: The Agent.

#### 6.3.1 `credentialSubject` members

| Member | Type | Requirement |
|---|---|---|
| `id` | DID string | REQUIRED — equals the subject DID |
| `name` | string | REQUIRED — human-readable agent name, 1–64 UTF-8 bytes |
| `createdAt` | ISO 8601 string | REQUIRED — agent creation timestamp |
| `network` | string | REQUIRED — one of the network names in §5.6 |
| `protocolVersion` | string | REQUIRED — MUST equal `"0.3"` for this specification |

**[C-120]** Implementations MUST reject a Birth Certificate whose `protocolVersion` does not match a version they support.
**[C-121]** An Agent SHOULD have exactly one valid Birth Certificate.

### 6.4 Capability Credential

Attests that an Agent is able to perform a specific kind of work.

- **Type**: `"EtereCitizenCapability"`
- **Context URI**: `"https://eterecitizen.ai/ns/vc/capability/v1"`
- **Issuer**: Either the Agent itself (self-attestation) or a third party endorsing the Agent.
- **Subject**: The Agent whose capability is being declared.

#### 6.4.1 `credentialSubject` members

| Member | Type | Requirement |
|---|---|---|
| `id` | DID string | REQUIRED |
| `capability` | string | REQUIRED — free-text capability name |
| `category` | string | REQUIRED — MUST be one of the Categories in §6.9 |

**[C-130]** An Agent MAY possess multiple Capability Credentials. Verifiers SHOULD treat self-attested capabilities with lower weight than third-party attestations.

### 6.5 Wallet Ownership Credential

Attests that the Agent controls a specific Ethereum address without disclosing the address in the credential itself.

- **Type**: `"EtereCitizenWalletOwnership"`
- **Context URI**: `"https://eterecitizen.ai/ns/vc/wallet-ownership/v1"`
- **Issuer**: The Agent (self-issued following a successful challenge ceremony per §12.1).
- **Subject**: The Agent.

#### 6.5.1 `credentialSubject` members

| Member | Type | Requirement |
|---|---|---|
| `id` | DID string | REQUIRED |
| `walletProvider` | string | REQUIRED — one of `"standard"`, `"coinbase-cdp"`, `"openfort"`, `"moonpay"`, `"conway"` |
| `connectedAt` | ISO 8601 string | REQUIRED |
| `challengeHash` | 0x-prefixed hex string | REQUIRED — SHA-256 hash of the full challenge message used in §12.1 |

**[C-140]** The credential MUST NOT include the wallet address in cleartext; only `challengeHash` is recorded so that the Agent MAY later reveal the underlying address and challenge out-of-band to a Verifier to prove continuity.
**[C-141]** Implementations SHOULD retain the plaintext challenge message encrypted at rest, separate from the credential, to enable future disclosure.

### 6.6 Work History Credential (also known as Review VC)

Attests to a completed transaction between two Agents and records a rating from one to the other. Work History Credentials are the canonical off-chain form of a Review; the on-chain form stores only the SHA-256 hash of this credential (§9).

- **Type**: `"EtereCitizenWorkHistory"`
- **Context URI**: `"https://eterecitizen.ai/ns/vc/work-history/v1"`
- **Issuer**: The reviewing Agent (the Agent issuing the rating).
- **Subject**: The reviewed Agent.

#### 6.6.1 `credentialSubject` members

| Member | Type | Requirement |
|---|---|---|
| `id` | DID string | REQUIRED — subject (reviewed) DID |
| `taskDescription` | string | REQUIRED — short description of the work performed |
| `category` | string | REQUIRED — MUST be one of the Categories in §6.9 |
| `rating` | integer | REQUIRED — integer in the inclusive range [1, 5] |
| `transactionHash` | 0x-prefixed hex string | REQUIRED — 32-byte identifier of the underlying transaction, unique per reviewer/reviewed pair |
| `completedAt` | ISO 8601 string | REQUIRED |
| `reviewerDID` | DID string | REQUIRED — MUST equal the issuer DID |
| `comment` | string | OPTIONAL |

### 6.7 Creator Verification Credential

Attests that an authorized Verifier has verified the Agent's operator/creator identity (e.g., domain control, business registration, KYC).

- **Type**: `"EtereCitizenCreatorVerification"`
- **Issuer**: An Authorized Verifier (§8.4).
- **Subject**: The Agent.

#### 6.7.1 `credentialSubject` members

| Member | Type | Requirement |
|---|---|---|
| `id` | DID string | REQUIRED |
| `creatorDID` | DID string | REQUIRED — DID of the verifying entity |
| `verificationLevel` | integer | REQUIRED — 0, 1, 2, or 3 (see §8.4) |
| `verifiedAt` | ISO 8601 string | REQUIRED |
| `verificationMethod` | string | REQUIRED — human-readable description of the verification method used |

**[C-160]** A Creator Verification Credential MUST NOT set `verificationLevel` higher than the level the issuer is on-chain authorized to set.

### 6.8 Compliance Credential

Attests that the Agent meets a named compliance standard (e.g., a sector-specific certification).

- **Type**: `"EtereCitizenCompliance"`
- **Issuer**: Any entity the Verifier considers authoritative for the compliance standard.
- **Subject**: The Agent.

#### 6.8.1 `credentialSubject` members

| Member | Type | Requirement |
|---|---|---|
| `id` | DID string | REQUIRED |
| `standard` | string | REQUIRED — name/identifier of the compliance standard |
| `issuedBy` | string | REQUIRED |
| `validUntil` | ISO 8601 string | REQUIRED |
| `scope` | string | OPTIONAL |

### 6.9 Service Categories

EtereCitizen defines the following closed enumeration of Categories. Every Capability and Work History Credential MUST have a `category` drawn from this list.

```
document-analysis      code-generation        code-review
data-analysis          translation            content-creation
image-generation       research               customer-support
financial-analysis     legal-analysis         medical-analysis
education              creative-writing       summarization
general
```

**[C-170]** Implementations MUST reject credentials whose `category` is not one of the above.
**[C-171]** The enumeration MAY be extended in a future protocol version via §17.2; extensions MUST be namespaced and MUST NOT collide with the above names.

---

## 7. Agent Registration

Agent Registration is the act of making an Agent's identity and capabilities known on-chain.

### 7.1 On-Chain Registration

**[C-200]** On-Chain Registration is performed by invoking the `registerAgent(string name, string[] capabilities)` function on the Reputation Contract (§8.2) from the Ethereum address corresponding to the Agent's DID.

**[C-201]** The transaction sender's address MUST match the address component of the Agent DID.

#### 7.1.1 Preconditions

The call MUST revert if:

- The sender is already registered (enforced by `_registered[msg.sender]`).
- `name.length == 0` (empty name).
- `name.length > 64` (name too long in UTF-8 bytes).

#### 7.1.2 Postconditions

On success:

- `_agents[sender]` stores an `AgentIdentity` struct containing `name`, `capabilities`, `createdAt = block.timestamp`, `active = true`.
- `_registered[sender]` is set to `true`.
- `totalAgents` is incremented.
- Event `AgentRegistered(address agent, string name, uint256 timestamp)` is emitted.

### 7.2 Off-Chain Registration (Discovery Index)

**[C-210]** Implementations MAY operate an additional off-chain registry (see §13) for efficient discovery, but such registries MUST NOT be the authoritative source of Agent state. On-chain data is the canonical source.

### 7.3 Capabilities and Updates

**[C-220]** An Agent MAY add a capability via `addCapability(string capability)`, subject to:
- Sender MUST be registered.
- `capability.length > 0`.
- The resulting number of capabilities MUST NOT exceed `MAX_CAPABILITIES = 50`.

**[C-221]** An Agent MAY update its name via `updateAgent(string name)` subject to the same 1–64 byte constraint.
**[C-222]** An Agent MAY soft-delete itself via `deactivateAgent()`, setting `active = false`. Verifiers MUST honor this flag.

---

## 8. Reputation Contract

### 8.1 Overview

The Reputation Contract is the canonical on-chain anchor for EtereCitizen identity and reputation. Every conforming deployment SHALL deploy a contract implementing the interface specified in this section.

**[C-300]** The Reputation Contract MUST implement the `IEtereCitizen` interface defined in Appendix A.
**[C-301]** The Reputation Contract MUST use the Checks-Effects-Interactions pattern for all state-changing functions that perform external calls.

### 8.2 Interface

```solidity
interface IEtereCitizen {
    struct AgentIdentity {
        string name;
        string[] capabilities;
        uint256 createdAt;
        bool active;
    }

    struct ReviewRecord {
        bytes32 reviewHash;
        address reviewer;
        address reviewed;
        bytes32 txHash;
        string category;
        uint8 rating;
        uint256 timestamp;
    }

    event AgentRegistered(address indexed agent, string name, uint256 timestamp);
    event AgentUpdated(address indexed agent, string name);
    event CapabilityAdded(address indexed agent, string capability);
    event AgentDeactivated(address indexed agent);
    event ReviewSubmitted(
        address indexed reviewer,
        address indexed reviewed,
        bytes32 reviewHash,
        string category,
        uint8 rating,
        uint256 timestamp
    );
    event VerificationLevelSet(address indexed agent, uint8 level, address indexed verifier);
    event ReviewFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    function registerAgent(string calldata name, string[] calldata capabilities) external;
    function updateAgent(string calldata name) external;
    function addCapability(string calldata capability) external;
    function deactivateAgent() external;
    function submitReview(
        address reviewed,
        bytes32 reviewHash,
        bytes32 txHash,
        string calldata category,
        uint8 rating
    ) external payable;
    function setVerificationLevel(address agent, uint8 level) external;
    function setReviewFee(uint256 newFee) external;
    function withdrawFees(address payable to) external;
    function addVerifier(address verifier) external;
    function removeVerifier(address verifier) external;

    function getAgent(address agent) external view returns (AgentIdentity memory);
    function isRegistered(address agent) external view returns (bool);
    function getReviewCount(address agent) external view returns (uint256);
    function getReviews(address agent, uint256 offset, uint256 limit) external view returns (ReviewRecord[] memory);
    function getAggregateScore(address agent, string calldata category) external view returns (uint256 totalScore, uint256 count);
    function getTotalTasksCompleted(address agent) external view returns (uint256);
    function getVerificationLevel(address agent) external view returns (uint8);

    function totalAgents() external view returns (uint256);
    function reviewFee() external view returns (uint256);
    function totalFeesCollected() external view returns (uint256);
    function authorizedVerifiers(address) external view returns (bool);
    function REVIEW_COOLDOWN() external view returns (uint256);
    function MAX_CAPABILITIES() external view returns (uint256);
}
```

### 8.3 Constants

| Constant | Value | Rationale |
|---|---|---|
| `REVIEW_COOLDOWN` | 1 day (86400 s) | Per-pair anti-spam window |
| `MAX_CAPABILITIES` | 50 | Gas-bounded per-agent capability list |
| `reviewFee` (default) | 0.0001 ETH | Economic friction; updatable by owner |

**[C-310]** `REVIEW_COOLDOWN` and `MAX_CAPABILITIES` MUST be `constant` in the contract source (not upgradable via state).

### 8.4 Verification Levels

Verification Levels encode the level of out-of-band identity verification performed on the Agent's human operator (if any).

| Level | Name | Meaning |
|---|---|---|
| 0 | Unverified | No verification performed (default) |
| 1 | Domain | Verifier has proven the Agent is operated by a party controlling a specific DNS domain |
| 2 | Business | Verifier has confirmed the Agent is operated by a legally registered business entity |
| 3 | KYC | Verifier has performed individual identity verification on the human operator |

**[C-320]** `setVerificationLevel` MUST revert unless the caller is either the contract `owner()` or listed in `authorizedVerifiers`.
**[C-321]** `setVerificationLevel` MUST revert if `level > 3`.
**[C-322]** The contract owner MAY add or remove Authorized Verifiers via `addVerifier` / `removeVerifier`. Upgrading to a multisig owner is STRONGLY RECOMMENDED before production mainnet use.

### 8.5 Access Control

**[C-330]** The functions `setReviewFee`, `withdrawFees`, `addVerifier`, and `removeVerifier` MUST be callable only by the contract owner.
**[C-331]** `submitReview`, `registerAgent`, `updateAgent`, `addCapability`, and `deactivateAgent` MUST be callable by any externally-owned account.
**[C-332]** All `view` functions MUST be callable by any party.

### 8.6 Events and Indexing

**[C-340]** Implementations SHOULD index events to allow Agent discovery without private RPC access. All events in §8.2 are suitable for indexing by standard tools (The Graph, Ponder, etc.).

---

## 9. Review Submission Protocol

The Review Submission Protocol binds an off-chain Work History Credential (§6.6) to an on-chain ReviewRecord (§8.2).

### 9.1 Overview

The full review, including the reviewer's comment and any private context, lives off-chain as a Work History Credential. Only a commitment — a SHA-256 hash — plus the numeric rating and category live on-chain. This minimizes gas, preserves privacy, and maintains verifiability: any party with the off-chain credential MAY re-hash it and confirm the on-chain record.

### 9.2 Off-Chain Steps

Given a `ReviewInput` of the form:

```
{
  reviewedDID:       string (DID)
  taskDescription:   string
  category:          string (one of §6.9)
  rating:            integer in [1, 5]
  transactionHash:   0x-prefixed 32-byte hex
  comment:           string (optional)
}
```

the submitting Agent (hereafter "reviewer") MUST perform the following steps:

1. **Validate inputs** per the constraints of §6.6 and §8.2.
2. **Resolve** the reviewed DID to its Ethereum address using §5.5.2.
3. **Construct** a Work History Credential per §6.6 with:
   - `issuer` = reviewer DID
   - `credentialSubject.id` = reviewed DID
   - `credentialSubject.reviewerDID` = reviewer DID
   - all other fields populated from the input
4. **Sign** the credential as a JWT per §6.2. Call the result `VC_JWT`.
5. **Upload** the full credential (the JSON form including the signed proof) to IPFS. Call the returned CID `review_cid`.
6. **Compute** `reviewHash = SHA-256(canonical_json(credential))`, emitted as a 32-byte `bytes32`.
7. Proceed to §9.3.

**[C-400]** The canonical JSON form used for hashing MUST be derived by `JSON.stringify(credential)` with keys in insertion order as defined by the credential-construction procedure. Implementations SHOULD document their exact canonicalization.

*Note: This specification acknowledges that non-canonicalized JSON.stringify is fragile. A future protocol revision SHOULD adopt [RFC 8785] JCS (JSON Canonicalization Scheme). See §19.*

### 9.3 On-Chain Transaction

The reviewer MUST submit an Ethereum transaction invoking:

```
submitReview(
  reviewed,            // address derived from reviewed DID
  reviewHash,          // bytes32 from §9.2 step 6
  txHash,              // bytes32 from input
  category,            // string from input
  rating               // uint8 from input
) payable
```

with `msg.value >= reviewFee()`.

### 9.4 Preconditions (contract-enforced)

The contract MUST revert if any of:

- `msg.value < reviewFee`
- `reviewed == address(0)`
- `reviewed == msg.sender` (no self-review)
- `rating < 1 || rating > 5`
- `category.length == 0`
- `reviewHash == bytes32(0)`
- `txHash == bytes32(0)`
- `_usedTxHashes[txHash] == true` (replay protection)
- `block.timestamp < _lastReviewTime[msg.sender][reviewed] + REVIEW_COOLDOWN` (per-pair cooldown)

### 9.5 State Changes (contract-enforced)

On success, the contract MUST, in order:

1. Set `_usedTxHashes[txHash] = true`.
2. Append a `ReviewRecord` to `_reviews[reviewed]`.
3. Add `rating` to `_categoryTotalScore[reviewed][category]`.
4. Increment `_categoryReviewCount[reviewed][category]`.
5. Increment `_totalTasksCompleted[reviewed]`.
6. Set `_lastReviewTime[msg.sender][reviewed] = block.timestamp`.
7. Emit `ReviewSubmitted(msg.sender, reviewed, reviewHash, category, rating, block.timestamp)`.
8. Refund `msg.value - reviewFee` to `msg.sender` if positive (CEI order preserved: all state is updated before this external call).

### 9.6 Verifier Re-Hash Check

**[C-410]** A Verifier inspecting a stored ReviewRecord MAY re-hash the off-chain Work History Credential retrieved from IPFS and compare it to the on-chain `reviewHash`. A mismatch MUST be treated as a corrupted or tampered review; the Verifier SHOULD discard it from trust computations.

### 9.7 IPFS Retrieval

**[C-420]** Implementations SHOULD pin off-chain Work History Credentials via IPFS (or an equivalent content-addressed storage) to preserve long-term verifiability. Implementations MAY use a pinning service (Pinata, Filebase, web3.storage) as a convenience, but the content-address (CID) is the canonical locator.

---

## 10. Trust Score Computation

The Trust Score is a deterministic function from on-chain + off-chain observables to a scalar in [0, 1]. Verifiers use the Trust Score to decide whether to transact with an Agent.

### 10.1 Inputs

The Trust Score function takes a `TrustResult` struct:

```
TrustResult {
  verified:            boolean
  verificationLevel:   integer in {0, 1, 2, 3}
  reputationScore:     float in [0.0, 5.0]  (temporally decayed, see §10.4)
  agentAge:            integer (days since agent registration)
  reviewCount:         integer (count of on-chain reviews)
  walletConnected:     boolean
  flags:               string[]  (zero or more of: NEW_AGENT, NO_REVIEWS, …)
  antifraud:           AntifraudFlags | null
}
```

### 10.2 Weights

The following weights are normative for v0.3:

```
W_reputation          = 0.40
W_verificationLevel   = 0.25
W_agentAge            = 0.15
W_reviewCount         = 0.10
W_walletConnected     = 0.10
```

The sum equals 1.0.

### 10.3 Computation

**[C-500]** Given a `TrustResult` `r`, `trust_score(r)` MUST be computed as follows:

```
if not r.verified:
    return 0.0

score = 0.0
score += (r.reputationScore / 5.0)                         * 0.40    # R1
score += (r.verificationLevel / 3.0)                       * 0.25    # R2
score += min(r.agentAge / 365.0, 1.0)                      * 0.15    # R3
score += min(log10(r.reviewCount + 1) / 2.0, 1.0)          * 0.10    # R4
score += (1.0 if r.walletConnected else 0.0)               * 0.10    # R5

# Penalties
if "NEW_AGENT" in r.flags:       score *= 0.9
if "NO_REVIEWS" in r.flags:      score *= 0.85
if r.antifraud and r.antifraud.suspicionScore > 0.5:
    score *= 1.0 - (r.antifraud.suspicionScore * 0.5)

return max(0.0, min(1.0, score))
```

**[C-501]** Implementations MUST return exactly 0 when `r.verified` is false.
**[C-502]** The `log10` used in R4 is the base-10 logarithm. The expression `r.reviewCount + 1` guarantees the argument is ≥ 1 so the log is non-negative; `log10(0+1) = 0`.
**[C-503]** Implementations MAY report intermediate sub-scores (R1–R5) alongside the final score for auditability but MUST NOT round sub-scores before summation.

### 10.4 Reputation Score (Temporal Decay)

The `reputationScore` input to §10.3 is the temporally-decayed weighted mean of the reviewed Agent's ratings.

#### 10.4.1 Parameters

```
HALF_LIFE_DAYS = 90
MIN_WEIGHT     = 0.1
```

**[C-510]** These values MAY be configurable by the Verifier. Implementations MUST use these defaults when no configuration is provided.

#### 10.4.2 Weight function

For a review with timestamp `t_review`, observed at `t_now`:

```
age_days  = (t_now - t_review) / 86400
weight    = max( 2^(-age_days / HALF_LIFE_DAYS), MIN_WEIGHT )
```

#### 10.4.3 Aggregate score

Given reviews `R1, ..., Rn` (each with `rating` and `timestamp`):

```
reputationScore =
    sum(R_i.rating * weight(R_i.timestamp)) /
    sum(weight(R_i.timestamp))
```

If `n == 0`, `reputationScore = 0`.

### 10.5 Antifraud Flags

**[C-520]** Given a reviewer's list of reviews, the antifraud detector MUST compute flags as follows:

#### 10.5.1 Burst flag

Thresholds: `BURST_THRESHOLD = 5`, `BURST_WINDOW_MS = 86_400_000` (24h).

Algorithm:
1. Partition reviews by `reviewerDID`.
2. For each partition, sort by timestamp ascending.
3. Use a sliding window. If any 24h window contains ≥ 5 reviews from that reviewer, set `isBurst = true` and add `0.3` to `suspicionScore`. Break after the first such window (one burst flag per partition).

#### 10.5.2 Cluster flag

Thresholds: `CLUSTER_MIN_REVIEWS = 3`, `CLUSTER_TIME_WINDOW_MS = 3_600_000` (1h).

Algorithm:
1. Collect all review timestamps, sort ascending.
2. If any 1-hour window across all reviews (regardless of reviewer) contains ≥ 3 reviews, set `isCluster = true` and add `0.2` to `suspicionScore`. Break after the first.

#### 10.5.3 Reciprocal flag

Algorithm:
1. Maintain a set of observed `(reviewer → reviewed)` pairs.
2. If the reverse `(reviewed → reviewer)` pair is already present, set `isReciprocal = true` and add `0.4` to `suspicionScore`.

#### 10.5.4 Cap

**[C-521]** After all rules are evaluated, `suspicionScore = min(suspicionScore, 1.0)`.
**[C-522]** `details` MAY carry human-readable strings describing each triggered flag; consumers MUST NOT parse these strings for trust decisions.

### 10.6 Flags from Identity State

Beyond antifraud flags, the Verifier MAY set additional flags based on Agent state:

- **`NEW_AGENT`**: set when `agentAge < 7` days.
- **`NO_REVIEWS`**: set when `reviewCount == 0`.

**[C-530]** Flag names MUST be UPPER_SNAKE_CASE strings; unknown flags MUST be preserved but MUST NOT contribute to the trust score computation in §10.3.

---

## 11. Verification Flow

This section describes the canonical procedure a Verifier MUST follow to assess an Agent.

### 11.1 Inputs

A Verifier receives, at minimum, an Agent DID.

### 11.2 Procedure

1. **Validate DID syntax** per §5.2 / §5.5.
2. **Resolve DID Document** per §5.4. If resolution fails, set `verified = false` and return.
3. **Resolve network** per §5.5.3.
4. **Read on-chain state** from the Reputation Contract for the Agent's Ethereum address:
   - `isRegistered(address)`
   - `getAgent(address)` → `AgentIdentity`
   - `getVerificationLevel(address)` → uint8
   - `getReviewCount(address)` → uint256
   - For each Category encountered in the Agent's credentials or dashboard display, `getAggregateScore(address, category)`.
5. **Optionally** fetch off-chain Work History Credentials from the Discovery layer for temporal-decay computation (§10.4). If unavailable, the Verifier MAY fall back to the naive on-chain `totalScore/count` aggregate per category.
6. **Run antifraud detection** (§10.5) on retrieved reviews.
7. **Compute** the final Trust Score per §10.3.
8. **Return** a `TrustResult` with all inputs, plus the computed score.

**[C-600]** Verifiers MUST honor the `active` flag on `AgentIdentity`. A deactivated Agent SHOULD be treated as `verified = false`.
**[C-601]** Verifiers SHOULD cache on-chain reads with a TTL no greater than 60 seconds to avoid stale trust decisions during attacks.

### 11.3 TrustResult Schema

```
TrustResult {
  did:                 string
  verified:            boolean
  verificationLevel:   integer
  reputationScore:     number
  agentAge:            integer (days)
  reviewCount:         integer
  walletConnected:     boolean
  categoryRatings:     CategoryRating[]
  antifraud:           AntifraudFlags
  flags:               string[]
}

CategoryRating {
  category:            string
  averageScore:        number  (unweighted mean in [0, 5])
  count:               integer
  decayedScore:        number  (optional; §10.4)
}
```

---

## 12. Payment Negotiation

### 12.1 Wallet Ownership Challenge

An Agent MUST prove ownership of the Ethereum address in its DID before issuing a Wallet Ownership Credential (§6.5) or negotiating a payment.

#### 12.1.1 Challenge Construction

Given the Agent's `address` and the target `chainId`:

```
ChallengeMessage {
  domain:      "eterecitizen.ai"
  address:     "0x..." (40 hex lowercase)
  statement:   "Sign this message to prove ownership of this wallet for EtereCitizen protocol."
  nonce:       hex(random_bytes(16))           # 32 hex chars
  issuedAt:    ISO8601(now)
  expiresAt:   ISO8601(now + 300_000 ms)        # 5 minutes
  chainId:     integer
}
```

**[C-700]** `nonce` MUST be generated from a cryptographically secure random source.
**[C-701]** `expiresAt - issuedAt` MUST equal exactly 5 minutes in v0.3.
**[C-702]** The challenge MUST NOT be reusable; implementations MUST track consumed nonces at least until their `expiresAt`.

#### 12.1.2 Serialization for Signing

The canonical serialization MUST be:

```
{domain} wants you to sign in with your Ethereum account:
{address}

{statement}

Chain ID: {chainId}
Nonce: {nonce}
Issued At: {issuedAt}
Expiration Time: {expiresAt}
```

(Newlines are LF. A blank line separates the header, statement, and parameter block.)

This is compatible with [EIP-4361] Sign-in with Ethereum subject to domain/statement overrides.

#### 12.1.3 Signature

The Agent signs the serialized message using `personal_sign` (EIP-191) with the wallet corresponding to `address`.

#### 12.1.4 Verification

**[C-710]** Verifiers MUST:
1. Reconstruct the canonical serialization from the stored ChallengeMessage.
2. Recover the signing address from the signature using `ecrecover`.
3. Compare the recovered address to `ChallengeMessage.address`. If they differ, reject.
4. Confirm `now < ChallengeMessage.expiresAt`. If not, reject.

### 12.2 Payment Request/Response

Payment negotiation happens out-of-band (typically as an RPC call between two Agent processes). The canonical payload shapes are:

```
PaymentRequest {
  recipientDID:     string (DID of receiving agent)
  amount:           string  (decimal string, e.g. "0.5")
  currency:         string  ("ETH", "USDC", ...)
  network:          string  (one of §5.6 network names or a custom code)
  description:      string  (optional)
}

PaymentResponse {
  address:          string  (0x-prefixed 20-byte hex; the payment target)
  amount:           string
  currency:         string
  network:          string
  expiresAt:        ISO8601 (optional)
  paymentId:        string (optional; implementation-defined tracking identifier)
}
```

**[C-720]** The `address` in a PaymentResponse MUST correspond to the address embedded in the `recipientDID`, unless the recipient is explicitly delegating payment to another address via signed delegation (out of scope for v0.3).
**[C-721]** Implementations SHOULD sign PaymentResponses using the recipient's key such that the requester can verify the response originated from the claimed recipient.

### 12.3 Compatibility with x402

PaymentResponses are compatible with the [x402 HTTP payment protocol] provided the `address`, `amount`, and `currency` fields are mapped into x402's `accepts` payload.

---

## 13. Agent Discovery

### 13.1 Overview

Discovery is an optional protocol layer enabling Verifiers to find Agents by capability, rating, or verification level without scanning the entire registry.

**[C-800]** Discovery services MUST NOT be the authoritative source of Agent identity or reputation. All authoritative reads MUST be verifiable against on-chain state per §8.

### 13.2 Registry Entry

```
AgentRegistryEntry {
  did:                 string
  name:                string
  capabilities:        string[]
  verificationLevel:   integer in {0,1,2,3}
  overallScore:        number  (reputation, 0-5)
  totalReviews:        integer
  registeredAt:        ISO8601
  updatedAt:           ISO8601 (optional)
  active:              boolean
}
```

### 13.3 Search Filters

```
SearchFilters {
  capability:   string           (exact match against a declared capability)
  minRating:    number           (inclusive lower bound on overallScore)
  minLevel:     integer          (inclusive lower bound on verificationLevel)
  name:         string           (optional substring match)
  active:       boolean          (default true)
  limit:        integer          (default implementation-defined; SHOULD be ≤ 100)
  offset:       integer
}

SearchResult {
  agents:  AgentRegistryEntry[]
  total:   integer
  offset:  integer
  limit:   integer
}
```

**[C-810]** Filters MUST be combined conjunctively (AND semantics).
**[C-811]** Implementations MUST bound `limit` to prevent DoS. The RECOMMENDED maximum is 100.

---

## 14. Cryptographic Requirements

**[C-900]** All hash computations in this specification use **SHA-256** unless explicitly stated otherwise.
**[C-901]** All signatures use **ECDSA over secp256k1** as defined in [SEC1], with JWT signing algorithm `ES256K` ([RFC 8812]) or EIP-191 `personal_sign` (where specified, e.g., §12.1.3).
**[C-902]** Random values (nonces, challenge IDs) MUST be generated from a cryptographically secure random source with at least 128 bits of entropy.
**[C-903]** Implementations MUST NOT accept signatures produced by algorithms other than those enumerated above.

---

## 15. Security Considerations

### 15.1 Replay Protection

- On-chain review replay is prevented by `_usedTxHashes` (§9.4).
- Wallet ownership challenge replay is prevented by the 5-minute expiry and single-use nonce (§12.1).
- VCs SHOULD include `expirationDate` where appropriate to bound their validity.

### 15.2 Sybil Resistance

**This protocol does not provide Sybil resistance.** A single human operator MAY create arbitrarily many Agents, each with its own DID. Verifiers seeking Sybil-resistant trust decisions MUST combine EtereCitizen signals with external Sybil-resistance layers (e.g., BrightID, Gitcoin Passport, Farcaster connectedness, or requiring a Verification Level ≥ 2).

### 15.3 Review Fraud

The antifraud detector (§10.5) catches only the most obvious patterns (burst, cluster, reciprocal). Sophisticated attackers MAY circumvent these. Verifiers SHOULD:

- Weight reviews from Verification Level ≥ 2 Agents more heavily.
- Apply temporal decay (§10.4) to discount stale or one-time-boost behaviour.
- Cross-reference `txHash` with on-chain transactions they trust.

### 15.4 Key Management

An Agent's cryptographic material MUST be stored encrypted at rest. The reference implementation uses AES-256-GCM with scrypt key derivation. Implementations MUST NOT persist private keys in plaintext on disk or in network-accessible storage.

### 15.5 Smart Contract Risks

The Reputation Contract in v0.3 is single-owner with the ability to:

- Set the review fee.
- Withdraw accumulated fees.
- Add or remove Authorized Verifiers.
- Set any Agent's Verification Level (through Authorized Verifiers).

Production deployments on mainnet SHOULD transfer ownership to a multisignature wallet (e.g., Gnosis Safe) with at least 2-of-3 threshold before handling meaningful value. Production deployments SHOULD undergo a third-party security audit. §15 is not a substitute for such an audit.

### 15.6 Upgradability

v0.3 does not include a proxy upgrade pattern. Fixing a bug on-chain requires deploying a new contract and migrating. Implementations MUST NOT hard-code contract addresses; addresses MUST be configurable per-deployment.

---

## 16. Privacy Considerations

### 16.1 Wallet Address Disclosure

An Agent's Ethereum address is *derivable from its DID*. This is an inherent property of `did:ethr` and cannot be avoided while using this DID method. Parties concerned with wallet-address privacy SHOULD await future protocol revisions introducing `did:web` or `did:key` with separate payment-address delegation (§17.1).

### 16.2 Off-Chain Credentials

Work History Credentials contain potentially sensitive `taskDescription` and `comment` fields. Implementations MUST either:

- Store them on public IPFS (public by default), accepting the privacy implications; or
- Store them on a permissioned store and provide the CID only to authorized Verifiers.

**[C-1000]** Implementations that choose permissioned storage MUST still emit the on-chain `reviewHash`; otherwise the reputation is unverifiable.

### 16.3 Challenge Hash Rather Than Challenge

The Wallet Ownership Credential stores only `SHA-256(challenge_message)`, not the plaintext. This prevents replay on a different verifier while allowing the Agent to later disclose the plaintext and signature to prove ownership history.

---

## 17. Extension Points

### 17.1 Additional DID Methods

Future protocol revisions MAY support additional DID methods (e.g., `did:web`, `did:key`). Such support MUST:

- Define a concrete mapping from the new DID method to an Ethereum address for on-chain reputation linkage, or
- Define a parallel on-chain registry keyed by the new DID method.

Any new method MUST be registered in the W3C DID Methods Registry before being declared normative.

### 17.2 Additional Credential Types

Additional credential types MAY be defined by any party. To claim conformance:

- The context URI MUST resolve (HTTPS) to a machine-readable JSON-LD vocabulary.
- The type name MUST be namespaced (e.g., `MyOrgKYCCredential` rather than `KYCCredential`).
- The type MUST NOT conflict with the six types in §6.

### 17.3 Additional Networks

Additional EVM networks MAY be supported per deployment. The following information MUST be documented:

- Network name (canonical identifier).
- Chain ID (decimal and hex).
- RPC URL used by the reference implementation (or state that users must supply their own).
- Reputation Contract deployment address on that network.
- ERC-1056 registry address on that network (or a declaration that `did:ethr` is unsupported there).

---

## 18. Conformance Profiles

Implementations claim conformance by declaring a profile. Three profiles are defined:

### 18.1 `core` Profile

**[C-1100]** An implementation conforming to the `core` profile MUST:
- Correctly parse and emit Agent DIDs per §5.
- Correctly construct, sign, and verify all six VC types per §6.
- Correctly compute Trust Score per §10.3, including temporal decay (§10.4) and all antifraud flags (§10.5).
- Correctly issue and verify Wallet Ownership Challenges per §12.1.

The `core` profile does NOT require:
- Any on-chain capability.
- Discovery layer support.

### 18.2 `issuer` Profile

**[C-1110]** An implementation conforming to the `issuer` profile MUST meet `core` and additionally:
- Correctly execute Review Submission per §9, including both off-chain VC creation and on-chain transaction.
- Correctly interact with the Reputation Contract per §8.

### 18.3 `verifier` Profile

**[C-1120]** An implementation conforming to the `verifier` profile MUST meet `core` and additionally:
- Correctly resolve DID Documents per §5.4.
- Correctly execute the full Verification Flow per §11.
- Correctly compute Trust Scores from real on-chain + off-chain state.

### 18.4 `full` Profile

**[C-1130]** The `full` profile requires meeting all of `core`, `issuer`, `verifier`, plus:
- Discovery layer support per §13.
- Payment Request/Response per §12.2.

### 18.5 Claiming Conformance

Implementations SHOULD:

- Pass the reference conformance test suite published alongside this specification (package `@eterecitizen/conformance`).
- Declare in their documentation the profile(s) they claim.
- Publish any deviations from this specification.

---

## 19. Versioning and Evolution

This specification uses semantic versioning.

- **Major** version bumps indicate breaking wire-format or contract-interface changes.
- **Minor** version bumps add new credential types, flags, or RPC methods in a backward-compatible way.
- **Patch** version bumps clarify wording without altering normative behavior.

Reference implementations SHOULD tag their NPM versions and contract deployments with the matching specification version in their release notes.

### 19.1 Change Windows

After a new version is published:

- Implementations SHOULD support both the old and new wire formats for at least 90 days to allow ecosystem migration.
- The Reputation Contract on-chain interface MUST NOT change between minor versions; only extensions (new functions, new events) are allowed.

### 19.2 Deprecation

Deprecated features MUST be documented with:
- The version in which they were deprecated.
- The version in which they are scheduled for removal.
- A migration path.

---

## 20. IANA / Registry Considerations

This specification does not request any IANA allocations at this time.

Public EtereCitizen context URIs are published under `eterecitizen.ai/ns/vc/*` and are owned by Icaro Holding. These URIs SHALL remain stable for the lifetime of this version of the specification.

---

## Appendix A: JSON Schemas

Canonical JSON Schemas for every payload defined in this document are published in the repository at `/spec/schemas/`. Implementations MAY validate payloads against these schemas.

Non-normative summary of available schemas:

- `spec/schemas/did-document.schema.json` — Agent DID Document
- `spec/schemas/vc-birth-certificate.schema.json`
- `spec/schemas/vc-capability.schema.json`
- `spec/schemas/vc-wallet-ownership.schema.json`
- `spec/schemas/vc-work-history.schema.json`
- `spec/schemas/vc-creator-verification.schema.json`
- `spec/schemas/vc-compliance.schema.json`
- `spec/schemas/payment-request.schema.json`
- `spec/schemas/payment-response.schema.json`
- `spec/schemas/challenge-message.schema.json`
- `spec/schemas/trust-result.schema.json`
- `spec/schemas/search-filters.schema.json`

## Appendix B: Test Vectors

Canonical test vectors for all deterministic computations defined in this specification are published at `/spec/test-vectors/`. Each vector is a JSON file containing an `input` object and the corresponding `expected` output. Conformant implementations MUST produce the `expected` output when given the `input`.

Required vector sets:

- `spec/test-vectors/did-parsing/*.json` — inputs and expected results for §5.5.
- `spec/test-vectors/trust-score/*.json` — §10.3 computations.
- `spec/test-vectors/temporal-decay/*.json` — §10.4 computations.
- `spec/test-vectors/antifraud/*.json` — §10.5 computations.
- `spec/test-vectors/challenge-serialization/*.json` — §12.1.2 strings.

## Appendix C: Normative References

- **[RFC 2119]** S. Bradner. *Key words for use in RFCs to Indicate Requirement Levels*. BCP 14. March 1997.
- **[RFC 8174]** B. Leiba. *Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words*. BCP 14. May 2017.
- **[RFC 5234]** D. Crocker, Ed., P. Overell. *Augmented BNF for Syntax Specifications: ABNF*. January 2008.
- **[RFC 7519]** M. Jones, J. Bradley, N. Sakimura. *JSON Web Token (JWT)*. May 2015.
- **[RFC 8812]** M. Jones, L. Campbell. *CBOR Object Signing and Encryption (COSE) and JSON Object Signing and Encryption (JOSE) Registrations for Web Authentication (WebAuthn) Algorithms*. February 2020 — specifically ES256K.
- **[RFC 8785]** A. Rundgren, B. Jordan, S. Erdtman. *JSON Canonicalization Scheme (JCS)*. June 2020.
- **[DID-CORE]** *Decentralized Identifiers (DIDs) v1.0*. W3C Recommendation, 19 July 2022. https://www.w3.org/TR/did-core/
- **[VC-DATA-MODEL]** *Verifiable Credentials Data Model v2.0*. W3C Working Draft. https://www.w3.org/TR/vc-data-model-2.0/
- **[ERC-1056]** P. Braendgaard, J. Torstensson. *EIP-1056: Ethereum Lightweight Identity*. https://eips.ethereum.org/EIPS/eip-1056
- **[EIP-4361]** W. Wang, G. Brent, G. Sporny, O. Terbu, J. Camenisch, S. Waite. *EIP-4361: Sign-In with Ethereum*. https://eips.ethereum.org/EIPS/eip-4361
- **[EIP-191]** M. Swende, N. Jameson. *EIP-191: Signed Data Standard*. https://eips.ethereum.org/EIPS/eip-191
- **[SEC1]** *Standards for Efficient Cryptography 1: Elliptic Curve Cryptography*. Version 2.0. Certicom Research. May 2009.

## Appendix D: Informative References

- **[did-jwt-vc]** *did-jwt-vc: Create and verify JWT-encoded Verifiable Credentials*. https://github.com/decentralized-identity/did-jwt-vc
- **[ERC-8004]** *Ethereum Improvement Proposal 8004: Agent Registry*. (Draft as of 2026-04)
- **[x402]** Coinbase. *x402 Payment Protocol*. https://www.x402.org
- **[Gnosis-Safe]** Gnosis. *Safe Multisig Wallet*. https://safe.global/

## Appendix E: Change Log

### v0.3.0 (2026-04-21) — Draft

- Initial public draft of the protocol specification.
- Documents six VC types, one Reputation Contract, trust score and temporal decay algorithms, antifraud flags, wallet ownership challenge ceremony, payment negotiation payloads.
- Codifies all constants, weights, thresholds, and enumerated values observable in the v0.3.x reference implementation.

### Previous (unpublished) versions

- v0.1, v0.2: pre-public iteration history preserved in git.

---

*End of specification.*
