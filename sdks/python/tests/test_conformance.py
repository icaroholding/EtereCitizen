"""Conformance tests — load every canonical test vector from
``spec/test-vectors/`` at the repo root and run it against the Python SDK.

Each vector is a standalone test case (one failure does not mask the others).
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Iterable

import pytest

from eterecitizen import (
    address_to_did,
    did_to_address,
    did_to_network,
    is_valid_did,
    calculate_trust_score,
    TrustInput,
    calculate_decay_weight,
    calculate_decayed_score,
    TemporalDecayConfig,
    detect_antifraud_flags,
    challenge_to_message,
)

# Repo root is sdks/python/../../
REPO_ROOT = Path(__file__).resolve().parents[3]
VECTORS_ROOT = REPO_ROOT / "spec" / "test-vectors"

FLOAT_TOLERANCE = 1e-12


def _approx_equal(a: float, b: float) -> bool:
    if not (math.isfinite(a) and math.isfinite(b)):
        return a == b
    return abs(a - b) <= FLOAT_TOLERANCE * max(1.0, abs(a), abs(b))


def _load_vectors(category: str) -> Iterable[tuple[str, dict]]:
    directory = VECTORS_ROOT / category
    for path in sorted(directory.glob("*.json")):
        with path.open(encoding="utf-8") as fh:
            yield str(path.relative_to(REPO_ROOT)), json.load(fh)


@pytest.mark.parametrize("path,vec", list(_load_vectors("did-parsing")))
def test_did_parsing(path: str, vec: dict) -> None:
    inp, expected = vec["input"], vec["expected"]

    if "did" in inp:
        if "isValidDID" in expected:
            assert is_valid_did(inp["did"]) == expected["isValidDID"], f"{path}: isValidDID"
        if "didToAddress" in expected:
            assert did_to_address(inp["did"]) == expected["didToAddress"], f"{path}: didToAddress"
        if "didToNetwork" in expected:
            assert did_to_network(inp["did"]) == expected["didToNetwork"], f"{path}: didToNetwork"

    if "address" in inp and "network" in inp and "addressToDID" in expected:
        assert address_to_did(inp["address"], inp["network"]) == expected["addressToDID"], (
            f"{path}: addressToDID"
        )


@pytest.mark.parametrize("path,vec", list(_load_vectors("trust-score")))
def test_trust_score(path: str, vec: dict) -> None:
    inp = vec["input"]
    antifraud = None
    if inp.get("antifraud"):
        af = inp["antifraud"]
        from eterecitizen import AntifraudFlags
        antifraud = AntifraudFlags(
            isBurst=af.get("isBurst", False),
            isCluster=af.get("isCluster", False),
            isReciprocal=af.get("isReciprocal", False),
            suspicionScore=af["suspicionScore"],
        )

    result = calculate_trust_score(TrustInput(
        verified=inp["verified"],
        reputationScore=inp["reputationScore"],
        verificationLevel=inp["verificationLevel"],
        agentAge=inp["agentAge"],
        reviewCount=inp["reviewCount"],
        walletConnected=inp["walletConnected"],
        flags=inp.get("flags", []),
        antifraud=antifraud,
    ))
    assert _approx_equal(result, vec["expected"]["trustScore"]), (
        f"{path}: got {result}, want {vec['expected']['trustScore']}"
    )


@pytest.mark.parametrize("path,vec", list(_load_vectors("temporal-decay")))
def test_temporal_decay(path: str, vec: dict) -> None:
    inp = vec["input"]
    config = TemporalDecayConfig(
        halfLifeDays=inp["halfLifeDays"],
        minWeight=inp["minWeight"],
    )

    if "ages" in inp:
        for age in inp["ages"]:
            got = calculate_decay_weight(age, config)
            want = vec["expected"]["weights"][str(age)]
            assert _approx_equal(got, want), f"{path}: weight(age={age}): got {got}, want {want}"

    if "reviews" in inp:
        got = calculate_decayed_score(inp["reviews"], config)
        want = vec["expected"]["decayedScore"]
        assert _approx_equal(got, want), f"{path}: decayedScore: got {got}, want {want}"


@pytest.mark.parametrize("path,vec", list(_load_vectors("antifraud")))
def test_antifraud(path: str, vec: dict) -> None:
    got = detect_antifraud_flags(vec["input"]["reviews"])
    expected = vec["expected"]
    assert got.isBurst == expected["isBurst"], f"{path}: isBurst"
    assert got.isCluster == expected["isCluster"], f"{path}: isCluster"
    assert got.isReciprocal == expected["isReciprocal"], f"{path}: isReciprocal"
    assert _approx_equal(got.suspicionScore, expected["suspicionScore"]), (
        f"{path}: suspicionScore: got {got.suspicionScore}, want {expected['suspicionScore']}"
    )


@pytest.mark.parametrize("path,vec", list(_load_vectors("challenge-serialization")))
def test_challenge_serialization(path: str, vec: dict) -> None:
    got = challenge_to_message(vec["input"])
    want = vec["expected"]["serialized"]
    assert got == want, f"{path}:\n  got:  {got!r}\n  want: {want!r}"
