"""Antifraud detection (burst / cluster / reciprocal flags). See SPEC §10.5."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Final, Iterable


BURST_THRESHOLD: Final[int] = 5
BURST_WINDOW_MS: Final[int] = 24 * 60 * 60 * 1000  # 24h
CLUSTER_TIME_WINDOW_MS: Final[int] = 60 * 60 * 1000  # 1h
CLUSTER_MIN_REVIEWS: Final[int] = 3


@dataclass
class Review:
    reviewerDID: str
    reviewedDID: str
    timestamp: str          # ISO 8601
    rating: int
    category: str


@dataclass
class AntifraudFlags:
    isBurst: bool = False
    isCluster: bool = False
    isReciprocal: bool = False
    suspicionScore: float = 0.0
    details: list[str] = field(default_factory=list)


def _parse_ts_ms(iso: str) -> int:
    # Accept ISO 8601 with or without a trailing 'Z'.
    if iso.endswith("Z"):
        iso = iso[:-1] + "+00:00"
    return int(datetime.fromisoformat(iso).timestamp() * 1000)


def detect_antifraud_flags(reviews: Iterable[dict | Review]) -> AntifraudFlags:
    """Compute the three flags and cap the suspicion score at 1.0. SPEC §10.5.

    Accepts either :class:`Review` dataclasses or dict literals with the same
    keys — the conformance vectors use dicts.
    """
    flags = AntifraudFlags()

    reviews_list: list[Review] = []
    for r in reviews:
        if isinstance(r, Review):
            reviews_list.append(r)
        else:
            reviews_list.append(Review(
                reviewerDID=r["reviewerDID"],
                reviewedDID=r["reviewedDID"],
                timestamp=r["timestamp"],
                rating=r["rating"],
                category=r["category"],
            ))

    if not reviews_list:
        return flags

    # --- Burst: >= BURST_THRESHOLD reviews from same reviewer within 24h.
    by_reviewer: dict[str, list[int]] = {}
    for r in reviews_list:
        by_reviewer.setdefault(r.reviewerDID, []).append(_parse_ts_ms(r.timestamp))
    for reviewer, timestamps in by_reviewer.items():
        timestamps.sort()
        window_start = 0
        for i, ts in enumerate(timestamps):
            while ts - timestamps[window_start] > BURST_WINDOW_MS:
                window_start += 1
            if i - window_start + 1 >= BURST_THRESHOLD:
                flags.isBurst = True
                flags.suspicionScore += 0.3
                flags.details.append(
                    f"Burst: {i - window_start + 1} reviews from {reviewer} within 24h"
                )
                break

    # --- Cluster: >= CLUSTER_MIN_REVIEWS reviews across all reviewers within 1h.
    all_ts = sorted(_parse_ts_ms(r.timestamp) for r in reviews_list)
    for i in range(len(all_ts) - CLUSTER_MIN_REVIEWS + 1):
        window_end = all_ts[i] + CLUSTER_TIME_WINDOW_MS
        count = 0
        for j in range(i, len(all_ts)):
            if all_ts[j] > window_end:
                break
            count += 1
        if count >= CLUSTER_MIN_REVIEWS:
            flags.isCluster = True
            flags.suspicionScore += 0.2
            flags.details.append(f"Cluster: {count} reviews within 1 hour")
            break

    # --- Reciprocal: A→B and B→A both present.
    seen_pairs: set[str] = set()
    for r in reviews_list:
        pair = f"{r.reviewerDID}->{r.reviewedDID}"
        reverse = f"{r.reviewedDID}->{r.reviewerDID}"
        if reverse in seen_pairs:
            flags.isReciprocal = True
            flags.suspicionScore += 0.4
            flags.details.append(
                f"Reciprocal: {r.reviewerDID} and {r.reviewedDID} reviewed each other"
            )
        seen_pairs.add(pair)

    flags.suspicionScore = min(flags.suspicionScore, 1.0)
    return flags
