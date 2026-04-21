---
id: python
title: Python SDK
sidebar_label: Python
sidebar_position: 2
---

# eterecitizen (Python)

Python implementation of the EtereCitizen protocol's deterministic, off-chain surface.

- **Source**: [`sdks/python/`](https://github.com/icaroholding/EtereCitizen/tree/main/sdks/python)
- **License**: Apache 2.0
- **Conformance**: 23 / 23 canonical test vectors pass on Python 3.10, 3.11, 3.12, 3.13
- **Runtime dependencies**: none (standard library only)

## Status

The Python SDK covers the deterministic-compute portion of the `core` conformance profile:

- DID parsing (`did:ethr` construct / parse / validate / network resolve)
- Trust score formula
- Temporal decay
- Antifraud detection (burst / cluster / reciprocal flags)
- Wallet-ownership challenge serialization

Not yet covered (planned for 0.2.0):

- On-chain DID resolution via ERC-1056
- Verifiable Credential JWT signing / verification
- On-chain reputation contract reads/writes
- Agent registry client

## Install

```bash
# From PyPI (once published)
pip install eterecitizen

# From source (monorepo)
pip install -e ./sdks/python/
```

## Quick start

```python
from eterecitizen import (
    address_to_did,
    is_valid_did,
    calculate_trust_score,
    TrustInput,
    detect_antifraud_flags,
)

did = address_to_did("0x1234567890123456789012345678901234567890", "base-sepolia")
assert is_valid_did(did)

score = calculate_trust_score(TrustInput(
    verified=True,
    reputationScore=4.2,
    verificationLevel=2,
    agentAge=120,
    reviewCount=15,
    walletConnected=True,
))
print(f"trust = {score:.4f}")
```

## Running the conformance suite locally

```bash
python3 sdks/python/scripts/run_conformance.py
# eterecitizen (Python) conformance: 23/23 passed, 0 failed
```

Or via pytest:

```bash
cd sdks/python
pip install -e '.[test]'
pytest -v
```

The CI workflow `python-sdk.yml` runs the same vectors on every pull request against Python 3.10 through 3.13.
