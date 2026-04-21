---
id: conformance
title: Conformance Suite
sidebar_label: Conformance Suite
sidebar_position: 3
---

# @eterecitizen/conformance

The conformance suite is how any implementation — present or future — proves it agrees with the [protocol specification](/specification/spec).

- **Source**: [`packages/conformance/`](https://github.com/icaroholding/EtereCitizen/tree/main/packages/conformance)
- **npm**: `@eterecitizen/conformance` (Node adapter)
- **Test vectors**: 23 canonical JSON files in [`spec/test-vectors/`](https://github.com/icaroholding/EtereCitizen/tree/main/spec/test-vectors)

## How it works

1. You provide an object that implements any subset of these functions:

   - `isValidDID`, `didToAddress`, `didToNetwork`, `addressToDID` (DID parsing)
   - `calculateTrustScore`
   - `calculateDecayWeight`, `calculateDecayedScore`
   - `detectAntifraudFlags`
   - `challengeToMessage`

2. The suite loads every canonical test vector and compares your outputs to the expected values with a 1e-12 floating-point tolerance.

3. You get back a report: `{passed, failed, skipped, results}`.

Missing methods cause that vector category to be **skipped**, not failed. This is intentional: partial implementations are still useful.

## Using from TypeScript

```typescript
import { runConformance, type ConformanceAdapter } from '@eterecitizen/conformance';
import * as myImpl from 'my-eterecitizen-implementation';

const adapter: ConformanceAdapter = {
  name: 'my-impl',
  isValidDID: myImpl.isValidDID,
  didToAddress: myImpl.didToAddress,
  calculateTrustScore: myImpl.calculateTrustScore,
};

const report = runConformance(adapter);
console.log(`${report.summary.passed}/${report.summary.total} passed`);
```

## Using from other languages

Since the test vectors are plain JSON, any language can run them:

```python
# sdks/python/tests/test_conformance.py is a working example.
import json, pathlib
for vec in pathlib.Path("spec/test-vectors/did-parsing").glob("*.json"):
    data = json.loads(vec.read_text())
    assert my_impl.is_valid_did(data["input"]["did"]) == data["expected"]["isValidDID"]
```

## Adding your implementation to the registry

See [CONFORMANCE.md](/specification/conformance) for the full procedure. In short:

1. Implement the core deterministic surface.
2. Run all 23 vectors — achieve 23 / 23.
3. Wire your CI to run the suite on every change.
4. Open a pull request adding your implementation to the table in `CONFORMANCE.md`.
