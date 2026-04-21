"""Protocol constants. See SPEC §5.6 and §6.9."""
from __future__ import annotations

from enum import IntEnum
from typing import Final, TypedDict


class NetworkConfig(TypedDict):
    chainId: int
    name: str
    rpcUrl: str
    explorerUrl: str
    erc1056Address: str


NETWORKS: Final[dict[str, NetworkConfig]] = {
    "base": {
        "chainId": 8453,
        "name": "Base",
        "rpcUrl": "https://mainnet.base.org",
        "explorerUrl": "https://basescan.org",
        "erc1056Address": "0xd1D374DDE031075157fDb64536eF5cC13Ae75000",
    },
    "base-sepolia": {
        "chainId": 84532,
        "name": "Base Sepolia",
        "rpcUrl": "https://sepolia.base.org",
        "explorerUrl": "https://sepolia.basescan.org",
        "erc1056Address": "0xd1D374DDE031075157fDb64536eF5cC13Ae75000",
    },
}

DEFAULT_NETWORK: Final[str] = "base-sepolia"

DID_METHOD_PREFIX: Final[str] = "did:ethr"


class VerificationLevel(IntEnum):
    """Verification levels. SPEC §8.4."""
    UNVERIFIED = 0
    DOMAIN = 1
    BUSINESS = 2
    KYC = 3


SERVICE_CATEGORIES: Final[frozenset[str]] = frozenset({
    "document-analysis",
    "code-generation",
    "code-review",
    "data-analysis",
    "translation",
    "content-creation",
    "image-generation",
    "research",
    "customer-support",
    "financial-analysis",
    "legal-analysis",
    "medical-analysis",
    "education",
    "creative-writing",
    "summarization",
    "general",
})
