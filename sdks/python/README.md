# eterecitizen (Python)

Python reference implementation of the [EtereCitizen protocol](https://github.com/icaroholding/EtereCitizen/blob/main/SPEC.md).

**Status:** Alpha. Implements the deterministic, off-chain portions of the protocol. On-chain interaction (contract calls, credential issuance, DID resolution) is **not yet implemented** — they will come in 0.2.0.

**Conformance:** 23/23 canonical test vectors from [`spec/test-vectors/`](../../spec/test-vectors/) pass against this implementation.

## Scope

| Module | SPEC section | Implemented |
|---|---|---|
| `eterecitizen.constants` | §5.6, §6.9, §8.4 | ✅ Networks, categories, verification levels |
| `eterecitizen.did` | §5 | ✅ `address_to_did`, `did_to_address`, `did_to_network`, `is_valid_did` |
| `eterecitizen.trust` | §10.3 | ✅ Trust score formula with weights, penalties, antifraud factor |
| `eterecitizen.decay` | §10.4 | ✅ Exponential weight, decayed aggregate |
| `eterecitizen.antifraud` | §10.5 | ✅ Burst, cluster, reciprocal flags |
| `eterecitizen.challenge` | §12.1.2 | ✅ Canonical challenge serialization |
| DID resolution (ERC-1056) | §5.4 | ❌ |
| Verifiable Credential issuance / verification | §6 | ❌ |
| On-chain reputation writes | §8, §9 | ❌ |
| Agent registry client | §13 | ❌ |

Once all rows are ✅, this package will claim the `core` conformance profile (SPEC §18.1). Today it covers the deterministic compute surface of that profile.

## Install

```bash
pip install eterecitizen
```

(The package is not yet on PyPI; for now, install from source: `pip install -e ./sdks/python/` from the repo root.)

## Usage

```python
from eterecitizen import (
    address_to_did,
    is_valid_did,
    calculate_trust_score,
    TrustInput,
    detect_antifraud_flags,
)

# Construct an agent DID
did = address_to_did("0x1234567890123456789012345678901234567890", "base-sepolia")
# -> "did:ethr:0x14a34:0x1234567890123456789012345678901234567890"

assert is_valid_did(did)

# Compute a trust score
score = calculate_trust_score(TrustInput(
    verified=True,
    reputationScore=4.2,
    verificationLevel=2,
    agentAge=120,
    reviewCount=15,
    walletConnected=True,
))
print(score)  # 0.0 … 1.0

# Run antifraud heuristics
flags = detect_antifraud_flags([
    {"reviewerDID": "did:ethr:0x14a34:0xAAAA...0001",
     "reviewedDID": "did:ethr:0x14a34:0xBBBB...0001",
     "timestamp": "2026-04-21T10:00:00Z",
     "rating": 5, "category": "code-review"},
    # ...
])
if flags.suspicionScore > 0.5:
    print("Suspicious:", flags.details)
```

## Running the conformance suite

From the repo root:

```bash
python3 sdks/python/scripts/run_conformance.py
```

Expected output ends with:

```
eterecitizen (Python) conformance: 23/23 passed, 0 failed
```

Or via pytest:

```bash
cd sdks/python
pip install -e '.[test]'
pytest
```

## Development

This package deliberately has **no runtime dependencies**. Only the Python standard library. Protocol primitives should remain portable and easy to audit.

## License

Apache-2.0.
