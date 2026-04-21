"""Wallet-ownership challenge serialization. See SPEC §12.1.2."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ChallengeMessage:
    domain: str
    address: str
    statement: str
    nonce: str
    issuedAt: str   # ISO 8601
    expiresAt: str  # ISO 8601
    chainId: int


def challenge_to_message(challenge: ChallengeMessage | dict) -> str:
    """Canonical serialization. Lines are separated by LF (\\n). Blank lines
    separate the header, statement, and parameter block. SPEC §12.1.2.
    """
    if isinstance(challenge, dict):
        c = challenge
    else:
        c = {
            "domain": challenge.domain,
            "address": challenge.address,
            "statement": challenge.statement,
            "nonce": challenge.nonce,
            "issuedAt": challenge.issuedAt,
            "expiresAt": challenge.expiresAt,
            "chainId": challenge.chainId,
        }

    return "\n".join([
        f"{c['domain']} wants you to sign in with your Ethereum account:",
        c["address"],
        "",
        c["statement"],
        "",
        f"Chain ID: {c['chainId']}",
        f"Nonce: {c['nonce']}",
        f"Issued At: {c['issuedAt']}",
        f"Expiration Time: {c['expiresAt']}",
    ])
