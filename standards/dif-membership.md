# DIF (Decentralized Identity Foundation) — Associate Membership Guide

DIF is the primary non-W3C ecosystem body for decentralized identity. Associate tier is **free for individuals** and gives you:

- Access to DIF Slack (hundreds of DID/VC practitioners).
- Voting rights in working groups you join.
- Invitations to weekly WG calls.
- Listing on the DIF membership page (nice social proof for the project).

## Signup

1. Go to https://identity.foundation/membership/.
2. Click "Join DIF".
3. Select "**Associate Member**" tier — free for individuals, no corporate sponsorship needed.
4. Fill the form:
   - Name
   - Email (use one you'll actually check — DIF has real email traffic)
   - Organization (can be "Independent" or "Icaro Holding")
   - GitHub handle
   - Areas of interest — check at least:
     - Working Group: Applied Crypto
     - Working Group: Identifiers & Discovery
     - Working Group: Claims & Credentials
     - (agent-identity isn't a named WG yet — that's coming)

5. Submit. You're in within hours; Slack invite arrives via email.

## After joining

### Join the right channels

On DIF Slack:

- `#general` — lurk first, understand tone.
- `#working-group-ids-and-discovery` — DID resolvers, methods, registries.
- `#working-group-claims-and-credentials` — VC Data Model chatter.
- `#wg-creds-and-presentations` — presentation exchange protocols.
- `#applied-crypto` — low-level primitives.

### Introduce EtereCitizen

Post a short intro in `#general` once you've lurked for a week:

> Hi — I'm Michele, working on EtereCitizen (https://github.com/icaroholding/EtereCitizen), an open protocol for AI-agent identity, trust, and commerce. It uses did:ethr + W3C VCs + an on-chain reputation contract, with a conformance suite and two reference implementations (TypeScript + Python). I'm drafting a W3C Community Group proposal for agent-identity standards. Happy to share the spec for feedback, and keen to liaise with any DIF work that touches agent use cases.

Pin the tab to the GitHub repo.

### Open a liaison thread

In `#working-group-ids-and-discovery`, open a thread:

> We've published a protocol note on `did:ethr` usage for autonomous AI agents — full spec + conformance vectors at [GitHub link]. Looking for:
> - Feedback on the agent-specific VC types we defined (see §6.3–6.8 of SPEC.md).
> - Interest in a joint DIF/W3C CG on agent identity.
> - Cross-pollination with existing DIF DID method work.

### Attend working group calls

All WG calls are on the DIF calendar. Pick one WG to attend regularly (suggest Identifiers & Discovery — closest to agent-identity work). Listen first, contribute after 2-3 meetings.

## What DIF gives EtereCitizen

- **Credibility.** Being listed at identity.foundation/members alongside Microsoft, Consensys, IBM, Mattr, etc. is real social proof.
- **Discovery.** DIF working-group members are the exact people who decide what standards to adopt internally.
- **Feedback loop.** Direct conversations with implementers of adjacent DID methods who catch spec issues faster than any automated audit can.

## What EtereCitizen gives DIF

- A concrete, well-documented example of applying decentralized identity to AI agents — a use case DIF has acknowledged as important but has relatively little prior art on.
- Open-source reference implementations other DIF members can learn from.
- An active contributor.

## Timing

DIF membership pairs naturally with the W3C CG submission. Order:

1. Submit W3C CG (public event, a bit of noise).
2. Within the same week, join DIF and post the intro.
3. Reference the W3C CG in your DIF intro ("we're proposing a CG and welcome DIF participation").

This sequence gets you into the most relevant rooms within ~2 weeks of starting.
