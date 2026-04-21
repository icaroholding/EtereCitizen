"""EtereCitizen protocol — Python reference implementation.

This module implements the deterministic, off-chain portions of the protocol
as specified in SPEC.md v0.3 in the EtereCitizen repository. See:
https://github.com/icaroholding/EtereCitizen/blob/main/SPEC.md

Passing all vectors in the repository's ``spec/test-vectors/`` tree is a
necessary (but not sufficient) condition for conformance with the ``core``
profile defined in SPEC §18.1.
"""

__version__ = "0.1.0"
__spec_version__ = "0.3.0"

from .constants import (
    NETWORKS,
    DEFAULT_NETWORK,
    DID_METHOD_PREFIX,
    SERVICE_CATEGORIES,
    VerificationLevel,
)
from .did import (
    address_to_did,
    did_to_address,
    did_to_network,
    is_valid_did,
    is_valid_ethereum_address,
)
from .trust import (
    TrustInput,
    calculate_trust_score,
    TRUST_WEIGHTS,
)
from .decay import (
    TemporalDecayConfig,
    DEFAULT_TEMPORAL_DECAY,
    calculate_decay_weight,
    calculate_decayed_score,
)
from .antifraud import (
    Review,
    AntifraudFlags,
    detect_antifraud_flags,
)
from .challenge import (
    ChallengeMessage,
    challenge_to_message,
)

__all__ = [
    "__version__",
    "__spec_version__",
    # constants
    "NETWORKS",
    "DEFAULT_NETWORK",
    "DID_METHOD_PREFIX",
    "SERVICE_CATEGORIES",
    "VerificationLevel",
    # did
    "address_to_did",
    "did_to_address",
    "did_to_network",
    "is_valid_did",
    "is_valid_ethereum_address",
    # trust
    "TrustInput",
    "calculate_trust_score",
    "TRUST_WEIGHTS",
    # decay
    "TemporalDecayConfig",
    "DEFAULT_TEMPORAL_DECAY",
    "calculate_decay_weight",
    "calculate_decayed_score",
    # antifraud
    "Review",
    "AntifraudFlags",
    "detect_antifraud_flags",
    # challenge
    "ChallengeMessage",
    "challenge_to_message",
]
