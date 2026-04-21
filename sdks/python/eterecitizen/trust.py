"""Trust score computation. See SPEC §10.3."""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Final, Optional

from .antifraud import AntifraudFlags


TRUST_WEIGHTS: Final[dict[str, float]] = {
    "reputation": 0.40,
    "verificationLevel": 0.25,
    "agentAge": 0.15,
    "reviewCount": 0.10,
    "walletConnected": 0.10,
}


@dataclass(frozen=True)
class TrustInput:
    """Input to :func:`calculate_trust_score`. Mirrors SPEC §10.1."""
    verified: bool
    reputationScore: float
    verificationLevel: int
    agentAge: int  # days
    reviewCount: int
    walletConnected: bool
    flags: list[str] = field(default_factory=list)
    antifraud: Optional[AntifraudFlags] = None


def calculate_trust_score(r: TrustInput) -> float:
    """Deterministic trust-score computation in [0.0, 1.0]. SPEC §10.3 C-500."""
    if not r.verified:
        return 0.0

    score = 0.0
    score += (r.reputationScore / 5.0) * TRUST_WEIGHTS["reputation"]
    score += (r.verificationLevel / 3.0) * TRUST_WEIGHTS["verificationLevel"]
    score += min(r.agentAge / 365.0, 1.0) * TRUST_WEIGHTS["agentAge"]
    score += min(math.log10(r.reviewCount + 1) / 2.0, 1.0) * TRUST_WEIGHTS["reviewCount"]
    score += (1.0 if r.walletConnected else 0.0) * TRUST_WEIGHTS["walletConnected"]

    if "NEW_AGENT" in r.flags:
        score *= 0.9
    if "NO_REVIEWS" in r.flags:
        score *= 0.85
    if r.antifraud is not None and r.antifraud.suspicionScore > 0.5:
        score *= 1.0 - r.antifraud.suspicionScore * 0.5

    return max(0.0, min(1.0, score))
