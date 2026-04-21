# arXiv paper — EtereCitizen outline

Academic-style paper establishing the protocol in the scholarly citation graph. Target: arXiv cs.CR (cryptography & security) or cs.MA (multi-agent systems). ~15-20 pages double-column, or 25-30 single-column.

## Title (working)

**EtereCitizen: A Trust Layer for Autonomous Agent Commerce**

Alternative titles:
- "Decentralized Identity and Reputation for Autonomous Software Agents"
- "A Protocol for Agent-to-Agent Trust without a Central Authority"

## Authors

Michele Trani (Icaro Holding). Add any collaborators with written consent.

## Abstract (~200 words)

```
Autonomous software agents — AI models deployed as service providers,
automated trading bots, multi-agent orchestration frameworks — increasingly
transact with each other without human-in-the-loop supervision. These
interactions require verifiable identity, cryptographic attestation of
capabilities, reputation grounded in prior conduct, and the ability to
negotiate payment privately. No single existing standard provides all four.

We present EtereCitizen, an open protocol that layers W3C Verifiable
Credentials and an EVM reputation contract on top of the ERC-1056 Ethereum
DID method. Six credential types encode agent-specific attestations; an
on-chain hash-commitment scheme anchors reviews without exposing their
payloads; a deterministic trust-score formula combines reputation with
verification level, agent age, review volume, and antifraud indicators.
A wallet-ownership challenge derived from EIP-4361 allows payment
negotiation without publishing wallet addresses in the DID document.

We describe the threat model, specify the protocol normatively in RFC-2119
language, and provide reference implementations in TypeScript and Python,
both passing a suite of canonical test vectors. The protocol is deployed
on Base Sepolia and released under Apache 2.0.
```

## Structure (section-by-section)

### 1. Introduction (1.5 pages)

- Problem statement: agent proliferation + absence of trust primitives.
- Why existing solutions (OAuth, X.509, platform-specific identity) don't fit.
- Contributions:
  1. First complete open protocol for AI-agent identity + reputation + payment.
  2. Normative specification with numbered conformance clauses.
  3. Two-language reference implementations passing 23/23 canonical vectors.
  4. Threat model mapping adversary classes to mitigations.

### 2. Background (1.5 pages)

- W3C DID Core
- W3C Verifiable Credentials Data Model 2.0
- ERC-1056 Ethereum DID method
- EIP-4361 Sign-in with Ethereum
- x402 payment protocol
- Prior work: BrightID, Gitcoin Passport, Lens Protocol (reputation for humans); DIF Aries protocols (credential exchange).

### 3. Protocol design (5 pages)

Condense SPEC.md §3–12 into a readable exposition:
- Architecture diagram (6-layer stack).
- Identity via did:ethr; DID Document shape.
- Six credential types, with one example per type.
- Reputation contract: state, events, review flow.
- Trust score formula with weights (Equation 1).
- Temporal decay (Equation 2).
- Antifraud detection (burst, cluster, reciprocal) with thresholds.
- Wallet ownership challenge ceremony.
- Payment negotiation flow.

### 4. Security analysis (3 pages)

Condense THREAT-MODEL.md:
- Adversary taxonomy (external, malicious-agent, colluding ring, compromised key, malicious issuer, compromised infra, network MITM).
- Review-fraud mitigations and residual risks.
- Sybil-resistance non-goals — discuss why and how to bolt on.
- Privacy analysis: what leaks from did:ethr, what doesn't.

### 5. Implementation (2 pages)

- TypeScript reference: package layout, Veramo integration.
- Python port: deterministic-only, zero runtime dependencies.
- Cross-language vector-based conformance testing (1e-12 float tolerance).
- Code metrics: LOC, test counts, CI integration.
- On-chain deployment: Base Sepolia contract address, event indexing.

### 6. Evaluation (2 pages)

- **Interoperability:** 23/23 vectors pass on both implementations with zero divergence.
- **Gas cost:** register-agent and submit-review costs (measured on Base Sepolia).
- **Trust-score properties:** agreement with intuition across scenarios (perfect agent → 1.0; new agent → ≤ 0.75; antifraud-flagged → penalty applied).
- **Antifraud recall:** synthetic test on injected fraud patterns (need to run for paper).
- **Contract security:** Slither clean at medium+ severity.

### 7. Related work (1 page)

- Compare with BrightID, Worldcoin, Gitcoin Passport (human reputation).
- Compare with ERC-8004 (draft), Lens Protocol (on-chain social identity).
- Compare with DIF agent frameworks (Aries).
- Position vs Anthropic MCP, OpenAI Assistants API, LangChain agents.

### 8. Discussion and future work (1.5 pages)

- Known limitations: JSON canonicalization, no graph-based collusion detection, single-chain reputation.
- Planned v0.4: RFC 8785 JCS adoption, ERC-8004 integration, wallet-address rotation.
- Governance: single-owner → multisig → DAO roadmap.

### 9. Conclusion (0.5 page)

### References (1 page)

~20 references. Key ones:
- W3C DID Core, VC Data Model (citable URLs).
- ERC-1056, EIP-4361, EIP-191.
- Relevant academic work on reputation systems (Resnick 2000s work, EigenTrust).
- Multi-agent system identity surveys.

## Figures

1. Six-layer architecture.
2. Credential issuance + verification sequence.
3. Review submission flow (off-chain + on-chain).
4. Trust score formula visual breakdown.
5. Temporal decay curve.
6. Adversary taxonomy matrix.

## Submission checklist

- [ ] Draft sections 1, 5, 6 first (factual, based on existing docs).
- [ ] Draft sections 2, 3, 4 second (technical exposition).
- [ ] Draft sections 7, 8, 9 last.
- [ ] Generate plots with Matplotlib / TikZ.
- [ ] Run the antifraud synthetic benchmark — need code.
- [ ] Get at least one external reader before submission.
- [ ] Submit to arXiv cs.CR as primary, cs.MA as cross-list.
- [ ] Link from SPEC.md and docs site to the arXiv URL after acceptance.

## Timeline estimate

- Week 1: outline → full first draft of sections 1, 5, 6.
- Week 2: sections 2, 3, 4 (technical meat).
- Week 3: security analysis, related work, conclusion.
- Week 4: figure polish, external review, revise, submit.

Total ~4 weeks of focused part-time writing. Can compress to 2 weeks of full-time effort.
