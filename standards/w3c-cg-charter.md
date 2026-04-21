# W3C Community Group Proposal — Agent Identity and Trust CG

**Status:** Draft ready for submission.
**Submission URL:** https://www.w3.org/community/groups/propose/
**Contact:** TBD — project lead (Michele Trani / Icaro Holding).

This document is the canonical draft of the Community Group charter you submit to W3C. Copy the sections below into the corresponding fields of the W3C proposal form.

---

## 1. Group name

**Agent Identity and Trust Community Group**

Alternative working titles (pick one on submission):
- AI Agent Identity CG
- Autonomous Agent Trust CG

## 2. Short description (for the W3C index)

> An open forum for specifying interoperable identity, capability attestation, trust, and payment-negotiation primitives for autonomous software agents — especially AI agents. Works on top of existing W3C standards (DID Core, VC Data Model) and aligns with parallel Ethereum and identity-foundation efforts.

## 3. Scope

The Group specifies:

1. How autonomous software agents (AI or otherwise) SHOULD express identity using W3C Decentralized Identifiers.
2. How agents SHOULD attest to their capabilities using W3C Verifiable Credentials.
3. How third parties SHOULD verify agent identity, capability, and reputation without depending on a central authority.
4. How agents SHOULD negotiate payments with cryptographic proof of wallet control.
5. How these primitives integrate with adjacent standards (DID Method Registry, VC Data Model v2, EIP-4361 Sign-in with Ethereum, x402 payment protocol, ERC-8004 agent registry).

The Group does NOT specify:

- Agent execution runtimes or orchestration frameworks.
- Economic or token models.
- Content moderation or alignment policies for AI agents.
- Sybil-resistance primitives (those belong to adjacent groups such as Gitcoin's).

## 4. Deliverables

The Group commits to producing at least:

1. **"Agent Identity Protocol" specification** — a Community Group Report describing the baseline protocol (initial source: EtereCitizen v0.3).
2. **Conformance test suite** — machine-checkable vectors and reference harness.
3. **DID method profile notes** — guidance on applying existing DID methods (`did:ethr`, `did:key`, `did:web`) to agent contexts.
4. **Liaison notes** — periodic position papers aligning with DIF, Ethereum ERC community, and the W3C DID WG.

Stretch goals:

5. **Agent Verifiable Credential types registry** — namespaced VC types for birth certificate, capability, wallet ownership, work history, creator verification, compliance.
6. **Payment Negotiation Protocol** — formal specification of an agent-to-agent payment handshake compatible with x402.

## 5. Rationale

Autonomous software agents are multiplying rapidly. Every major AI platform is deploying "agent" abstractions that need identity, capability attestation, reputation, and payment primitives. Today each platform solves these privately, leading to fragmentation and the exact vendor lock-in that W3C DID and VC work has aimed to prevent.

The Group's value is to:

- Prevent the ossification of proprietary agent-identity systems.
- Give existing standards (DID Core, VC Data Model) a concrete, high-profile application domain.
- Offer implementers a pre-validated, reference-tested protocol rather than inventing from scratch.

## 6. Initial seed material

The EtereCitizen project (https://github.com/icaroholding/EtereCitizen) contributes:

- A full protocol specification (`SPEC.md`) with RFC-2119 normative language and 120+ numbered conformance clauses.
- 12 JSON Schemas for every wire-format payload.
- 23 canonical test vectors.
- Two reference implementations — TypeScript and Python — passing 23/23 vectors with zero divergence.
- A threat model and six Architecture Decision Records documenting design rationale.
- Open-source under Apache 2.0 license.

The Group adopts this material as input but is not bound by it; the final CG Report can evolve the content freely under the standard IPR terms.

## 7. Membership

Open to all. W3C Community Groups require:

- One or more W3C members or five or more individual participants with W3C accounts.
- Participants agree to the [W3C Community Contributor License Agreement (CLA)](https://www.w3.org/community/about/agreements/cla/).

Initial expected participants (confirm availability before submission):

- Michele Trani (Icaro Holding) — primary editor.
- _[Add 4 more supporters before submission. They can be any individuals with W3C accounts — no affiliation needed.]_

## 8. Chairs and editors

- **Chair (proposed):** Michele Trani (Icaro Holding).
- **Editor (proposed):** Michele Trani.

Additional chairs/editors welcome; proposed at the kickoff meeting.

## 9. Meetings

- **Cadence:** Bi-weekly 60-minute teleconference (Thursdays, 15:00 UTC proposed — adjust to participants).
- **Venue:** W3C's standard tooling (Jitsi or Meet). Minutes posted to the Group's public wiki.
- **Asynchronous:** GitHub issues + discussions at https://github.com/icaroholding/EtereCitizen for pre-charter work; migrating to a W3C-hosted repository after CG is approved.
- **Face-to-face:** Opportunistic alignment at relevant conferences (EthCC, IETF, W3C TPAC, NeurIPS workshops).

## 10. Communication

- Public mailing list: `public-agent-identity@w3.org` (W3C provisions on approval).
- Public GitHub repository under `w3c/agent-identity-cg` (provisioned on approval).
- Public wiki for meeting minutes.

## 11. Decision policy

Rough consensus of participants in attendance at meetings. Disagreements escalated to the Chair, who consults mailing list before deciding. Formal objections follow W3C CG Process §5.

## 12. IPR policy

Standard W3C Community Contributor License Agreement. All contributions licensed such that they can be included in future Working Group work without friction. The seed material from EtereCitizen is already Apache 2.0, which is compatible.

## 13. Dependencies / liaisons

This Group liaises with:

- **W3C Decentralized Identifiers WG** — for DID Core alignment.
- **W3C Verifiable Credentials WG** — for VC Data Model alignment.
- **Decentralized Identity Foundation (DIF)** — for broader ecosystem consistency.
- **Ethereum Community (EthMagicians, EIP editors)** — for ERC-8004, EIP-4361, ERC-1056 liaison.
- **Coinbase x402 team** — for payment-negotiation compatibility.

---

## Submission notes

On the W3C proposal form (https://www.w3.org/community/groups/propose/), map the fields:

| Form field | Value |
|---|---|
| Name | Agent Identity and Trust Community Group |
| Short description | (copy §2) |
| Mission | Short paraphrase of §3 |
| Success criteria | "CG Report published describing the Agent Identity Protocol v1, with at least three independent implementations passing the conformance suite." |
| Chairs | Michele Trani |
| Supporters | 5 individuals with W3C accounts (confirm availability first) |

After submitting, the W3C team replies within ~1 week. No review board — it's a community proposal, not a Working Group.

Once approved, W3C provisions:

- `https://www.w3.org/community/agent-identity/` landing page
- `public-agent-identity@w3.org` mailing list
- GitHub repository at `https://github.com/w3c/agent-identity-cg`

Migrate the `SPEC.md` content into that repository as the Group's first Editor's Draft.
