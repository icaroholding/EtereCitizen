"""DID (did:ethr) parsing and construction. See SPEC §5."""
from __future__ import annotations

import re
from typing import Optional

from .constants import DID_METHOD_PREFIX, NETWORKS

_ADDRESS_RE = re.compile(r"^0x[a-fA-F0-9]{40}$")


def address_to_did(address: str, network: str = "base-sepolia") -> str:
    """Construct a did:ethr identifier from an address and network name.

    SPEC §5.5.1 — the chain ID is emitted as a lowercase hex string without
    leading zeros, prefixed with ``0x``.
    """
    if network not in NETWORKS:
        raise KeyError(f"unknown network: {network!r}")
    chain_id = NETWORKS[network]["chainId"]
    return f"{DID_METHOD_PREFIX}:0x{chain_id:x}:{address}"


def did_to_address(did: str) -> Optional[str]:
    """Extract the address component of a did:ethr, or return None if the
    prefix is not ``did:ethr:``. Does NOT validate the address shape — see
    :func:`is_valid_did`. SPEC §5.5.2.
    """
    parts = did.split(":")
    if len(parts) < 4 or parts[0] != "did" or parts[1] != "ethr":
        return None
    return parts[-1]


def did_to_network(did: str) -> Optional[str]:
    """Map a did:ethr's embedded chain ID hex to a supported network name,
    or return None if no known network matches. SPEC §5.5.3.
    """
    parts = did.split(":")
    if len(parts) < 4 or parts[0] != "did" or parts[1] != "ethr":
        return None
    hex_chain = parts[2]
    try:
        chain_id = int(hex_chain, 16)
    except ValueError:
        return None
    for name, cfg in NETWORKS.items():
        if cfg["chainId"] == chain_id:
            return name
    return None


def is_valid_did(did: str) -> bool:
    """Structural validation of a did:ethr. SPEC §5.2 C-011, C-012, C-013."""
    parts = did.split(":")
    if len(parts) < 4:
        return False
    if parts[0] != "did":
        return False
    if parts[1] != "ethr":
        return False
    return _ADDRESS_RE.match(parts[-1]) is not None


def is_valid_ethereum_address(address: str) -> bool:
    """True iff the input is a 40-char 0x-prefixed hex string."""
    return _ADDRESS_RE.match(address) is not None
