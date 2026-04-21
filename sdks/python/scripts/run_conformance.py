#!/usr/bin/env python
"""Standalone conformance runner — produces a human-readable report.

Use this when you want a quick "does my Python implementation still match
the spec?" check without invoking pytest. Exit code is non-zero if any
vector fails.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from eterecitizen import (
    address_to_did,
    did_to_address,
    did_to_network,
    is_valid_did,
    calculate_trust_score,
    TrustInput,
    AntifraudFlags,
    calculate_decay_weight,
    calculate_decayed_score,
    TemporalDecayConfig,
    detect_antifraud_flags,
    challenge_to_message,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
VECTORS_ROOT = REPO_ROOT / "spec" / "test-vectors"

FLOAT_TOL = 1e-12


def approx(a: float, b: float) -> bool:
    if not (math.isfinite(a) and math.isfinite(b)):
        return a == b
    return abs(a - b) <= FLOAT_TOL * max(1.0, abs(a), abs(b))


def run() -> int:
    total, passed, failed = 0, 0, 0
    failures: list[str] = []

    for category_dir in sorted(VECTORS_ROOT.iterdir()):
        if not category_dir.is_dir():
            continue
        for vector_path in sorted(category_dir.glob("*.json")):
            total += 1
            vec = json.loads(vector_path.read_text())
            rel = vector_path.relative_to(REPO_ROOT)
            try:
                if category_dir.name == "did-parsing":
                    check_did(vec)
                elif category_dir.name == "trust-score":
                    check_trust(vec)
                elif category_dir.name == "temporal-decay":
                    check_decay(vec)
                elif category_dir.name == "antifraud":
                    check_antifraud(vec)
                elif category_dir.name == "challenge-serialization":
                    check_challenge(vec)
                passed += 1
                print(f"  PASS  {rel}")
            except AssertionError as e:
                failed += 1
                failures.append(f"{rel}: {e}")
                print(f"  FAIL  {rel}  — {e}")

    print()
    print(f"eterecitizen (Python) conformance: {passed}/{total} passed, {failed} failed")
    return 0 if failed == 0 else 1


def check_did(vec: dict) -> None:
    inp, expected = vec["input"], vec["expected"]
    if "did" in inp:
        if "isValidDID" in expected:
            assert is_valid_did(inp["did"]) == expected["isValidDID"], "isValidDID"
        if "didToAddress" in expected:
            assert did_to_address(inp["did"]) == expected["didToAddress"], "didToAddress"
        if "didToNetwork" in expected:
            assert did_to_network(inp["did"]) == expected["didToNetwork"], "didToNetwork"
    if "address" in inp and "network" in inp and "addressToDID" in expected:
        assert address_to_did(inp["address"], inp["network"]) == expected["addressToDID"], "addressToDID"


def check_trust(vec: dict) -> None:
    inp = vec["input"]
    af = None
    if inp.get("antifraud"):
        a = inp["antifraud"]
        af = AntifraudFlags(
            isBurst=a.get("isBurst", False),
            isCluster=a.get("isCluster", False),
            isReciprocal=a.get("isReciprocal", False),
            suspicionScore=a["suspicionScore"],
        )
    got = calculate_trust_score(TrustInput(
        verified=inp["verified"],
        reputationScore=inp["reputationScore"],
        verificationLevel=inp["verificationLevel"],
        agentAge=inp["agentAge"],
        reviewCount=inp["reviewCount"],
        walletConnected=inp["walletConnected"],
        flags=inp.get("flags", []),
        antifraud=af,
    ))
    want = vec["expected"]["trustScore"]
    assert approx(got, want), f"trustScore got {got}, want {want}"


def check_decay(vec: dict) -> None:
    inp = vec["input"]
    cfg = TemporalDecayConfig(halfLifeDays=inp["halfLifeDays"], minWeight=inp["minWeight"])
    if "ages" in inp:
        for age in inp["ages"]:
            got = calculate_decay_weight(age, cfg)
            want = vec["expected"]["weights"][str(age)]
            assert approx(got, want), f"weight(age={age}) got {got}, want {want}"
    if "reviews" in inp:
        got = calculate_decayed_score(inp["reviews"], cfg)
        want = vec["expected"]["decayedScore"]
        assert approx(got, want), f"decayedScore got {got}, want {want}"


def check_antifraud(vec: dict) -> None:
    got = detect_antifraud_flags(vec["input"]["reviews"])
    expected = vec["expected"]
    assert got.isBurst == expected["isBurst"], "isBurst"
    assert got.isCluster == expected["isCluster"], "isCluster"
    assert got.isReciprocal == expected["isReciprocal"], "isReciprocal"
    assert approx(got.suspicionScore, expected["suspicionScore"]), "suspicionScore"


def check_challenge(vec: dict) -> None:
    got = challenge_to_message(vec["input"])
    want = vec["expected"]["serialized"]
    assert got == want, f"serialization mismatch\n  got:  {got!r}\n  want: {want!r}"


if __name__ == "__main__":
    sys.exit(run())
