# DID Method Registry — EtereCitizen usage note

`did:ethr` is already registered in the [W3C DID Method Registry](https://www.w3.org/TR/did-spec-registries/#did-methods) as method #4 (registered by Veramo / uPort).

EtereCitizen does NOT register a new DID method. Instead, we publish a profile note describing how EtereCitizen uses `did:ethr` in the agent-identity domain. This makes EtereCitizen discoverable to anyone auditing the registry for AI-agent use cases, without adding registry noise.

## Submission target

File a pull request against [w3c/did-spec-registries](https://github.com/w3c/did-spec-registries) adding a "Used by" note to the `did:ethr` entry, pointing to EtereCitizen.

Minimal PR content (edits the existing `methods.json`):

```json
{
  "method": "ethr",
  "name": "ETHR DID Method",
  "status": "Current",
  "specification": [
    "https://github.com/decentralized-identity/ethr-did-resolver"
  ],
  "usedBy": [
    {
      "name": "EtereCitizen Protocol",
      "specification": "https://github.com/icaroholding/EtereCitizen/blob/main/SPEC.md",
      "description": "Agent identity and on-chain reputation for autonomous software agents."
    }
  ]
}
```

(Schema may differ — open the current `methods.json` and mirror its convention. The point is to add an `appliedTo` / `usedBy` array that includes an EtereCitizen entry.)

## Rationale for not registering a new method

Early drafts of this protocol considered `did:citizen` as a dedicated method. Rejected because:

1. `did:ethr` already provides the on-chain resolution semantics we need (ERC-1056 registry).
2. A new method would force every DID resolver in the ecosystem to add support — prohibitive friction.
3. The method-specific-identifier format is the same either way (`<chainId>:<address>`), so the method name would only change the namespace label.

See [docs/adr/001-use-did-ethr.md](../docs/adr/001-use-did-ethr.md) for the full reasoning.

## What IF we ever need a distinct method

If a future protocol revision introduces semantics that cannot be expressed via `did:ethr` (e.g., cross-chain portability, rotating keys without a new DID), a new method `did:citizen` could be specified. It would:

- Embed a canonical identifier separate from any single chain.
- Delegate to multiple underlying `did:ethr` documents.
- Be registered separately via the same process.

Tracked in SPEC §17.1.

## Submission checklist

- [ ] Fork https://github.com/w3c/did-spec-registries.
- [ ] Open `methods.json` (or `specs/did-registry.ttl` — check current repo structure).
- [ ] Add the usage entry under `did:ethr`.
- [ ] Reference SPEC.md and the live docs.eterecitizen.io URL (after deployment).
- [ ] Open the PR with title `Add EtereCitizen usage to did:ethr entry`.
- [ ] Link from the PR body to this document and to the W3C CG charter (once the CG is approved).

No committee approval is needed for registry usage notes — the PR is merged once an editor reviews format conformance.
