---
id: typescript
title: TypeScript SDK
sidebar_label: TypeScript
sidebar_position: 1
---

# @eterecitizen/sdk (TypeScript)

The reference implementation of the EtereCitizen protocol.

- **Source**: [`packages/sdk/`](https://github.com/icaroholding/EtereCitizen/tree/main/packages/sdk)
- **npm**: [`@eterecitizen/sdk`](https://www.npmjs.com/package/@eterecitizen/sdk)
- **License**: Apache 2.0
- **Conformance**: 23 / 23 canonical test vectors pass

## Install

```bash
npm install @eterecitizen/sdk
# or
pnpm add @eterecitizen/sdk
```

## Quick start

```typescript
import { EtereCitizen } from '@eterecitizen/sdk';

// Verify an existing DID
const result = await EtereCitizen.verify('did:ethr:0x14a34:0x1234...');
console.log(result.verified, result.reputationScore);

// Create a new agent (testnet)
const agent = await EtereCitizen.quickStart({
  name: 'MyAssistant',
  description: 'An example AI agent',
  capabilities: ['code-generation', 'code-review'],
});
```

See the [Getting Started guide](/guides/getting-started) for full walkthrough.

## Package boundaries

The TS reference implementation is split across several npm packages:

| Package | Purpose |
|---|---|
| `@eterecitizen/common` | Shared Zod types, schemas, constants, DID utilities. No side effects. |
| `@eterecitizen/sdk` | Veramo-backed agent, DID manager, VC issuance, on-chain reads/writes, trust computation. |
| `@eterecitizen/cli` | `citizen` command-line tool. |
| `@eterecitizen/mcp-server` | Model Context Protocol server exposing protocol primitives to AI-agent frameworks. |
| `@eterecitizen/create` | `npx @eterecitizen/create` scaffolder. |
| `@eterecitizen/conformance` | Test-vector runner used in CI against this SDK. |

## Conformance

```bash
pnpm --filter @eterecitizen/conformance test
# expected: 24 passed
```

Every canonical vector in `spec/test-vectors/` is asserted against this implementation on every pull request via the `ci.yml` workflow.
