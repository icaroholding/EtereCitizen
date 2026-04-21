"""Temporal decay of review weights. See SPEC §10.4."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Final, Iterable


@dataclass(frozen=True)
class TemporalDecayConfig:
    halfLifeDays: float
    minWeight: float


DEFAULT_TEMPORAL_DECAY: Final = TemporalDecayConfig(halfLifeDays=90.0, minWeight=0.1)


def calculate_decay_weight(age_days: float, config: TemporalDecayConfig = DEFAULT_TEMPORAL_DECAY) -> float:
    """Exponential decay weight with a floor. SPEC §10.4.2.

    weight(age) = max( 2^(-age / halfLifeDays), minWeight )
    """
    raw = 2.0 ** (-age_days / config.halfLifeDays)
    return max(raw, config.minWeight)


def calculate_decayed_score(
    reviews: Iterable[dict],
    config: TemporalDecayConfig = DEFAULT_TEMPORAL_DECAY,
) -> float:
    """Weighted mean of ratings using decay weights. SPEC §10.4.3.

    Each review SHOULD carry ``rating: int`` and ``ageDays: float`` keys.
    Implementations MAY supply ``timestamp`` instead of ``ageDays`` but this
    reference implementation accepts the age-normalised form used by the
    conformance test vectors.
    """
    reviews_list = list(reviews)
    if not reviews_list:
        return 0.0

    weighted_sum = 0.0
    total_weight = 0.0
    for r in reviews_list:
        w = calculate_decay_weight(r["ageDays"], config)
        weighted_sum += r["rating"] * w
        total_weight += w

    if total_weight == 0:
        return 0.0
    return weighted_sum / total_weight
