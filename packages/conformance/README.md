# @eterecitizen/conformance

Conformance test suite for implementations of the [EtereCitizen protocol](../../SPEC.md).

Loads the canonical test vectors shipped at `spec/test-vectors/` and runs every vector against an adapter you provide. Use this to prove that a new language SDK, a refactor of the reference TypeScript SDK, or a downstream fork still produces the exact outputs the specification requires.

## Install

```bash
npm install --save-dev @eterecitizen/conformance
```

## Usage — TypeScript example

```typescript
import { runConformance, type ConformanceAdapter } from '@eterecitizen/conformance';
import * as myImpl from 'my-eterecitizen-implementation';

const adapter: ConformanceAdapter = {
  name:               'my-impl',
  isValidDID:         myImpl.isValidDID,
  didToAddress:       myImpl.didToAddress,
  didToNetwork:       myImpl.didToNetwork,
  addressToDID:       myImpl.addressToDID,
  calculateTrustScore: myImpl.calculateTrustScore,
  // ...any subset your implementation provides
};

const report = runConformance(adapter);

console.log(`${report.summary.passed}/${report.summary.total} passed`);
for (const r of report.results) {
  if (!r.passed) console.error(`FAIL  ${r.vectorPath}  ${r.error}`);
}
```

## Adapter interface

An adapter is a plain object with optional methods matching each test category. Missing methods cause that entire category to be skipped — this is intended: partial implementations SHOULD still be runnable.

| Method | Tests category | Notes |
|---|---|---|
| `isValidDID`, `didToAddress`, `didToNetwork`, `addressToDID` | `did-parsing` | See SPEC §5 |
| `calculateTrustScore` | `trust-score` | See SPEC §10.3 |
| `calculateDecayWeight`, `calculateDecayedScore` | `temporal-decay` | See SPEC §10.4 |
| `detectAntifraudFlags` | `antifraud` | See SPEC §10.5 |
| `challengeToMessage` | `challenge-serialization` | See SPEC §12.1.2 |

The full signatures are exported as TypeScript interfaces from the package root.

## Running in the monorepo

From the repository root:

```bash
pnpm --filter @eterecitizen/conformance test
```

Runs every vector against the reference `@eterecitizen/sdk` implementation. Any failure here indicates either (a) a regression in the reference SDK or (b) a bug/ambiguity in the specification — both warrant an issue.

## License

Apache-2.0.
