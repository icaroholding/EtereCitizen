# Smart Contracts

## Deployments

| Contract | Network | Address |
|---|---|---|
| EtereCitizen | Base Mainnet | `0x2BecDFe8406eA2895F16a9B8448b40166F4178f6` |
| EtereCitizen | Base Sepolia | `0xDC6c6f3d10dE4b7B84Cc3d4D3807325Cd2B53d59` |

## EtereCitizen.sol

Unified identity + reputation contract for EtereCitizen AI agents. Stores review hashes + scores on-chain; full review VCs live on IPFS. Temporal decay and anti-fraud detection happen off-chain in the SDK.

### Architecture

- **Ownable** (OpenZeppelin) — owner can manage verifiers and fees
- **Review storage** — per-agent array of ReviewRecord structs
- **Category scores** — aggregated per agent per category
- **Verification levels** — 0 (unverified) to 3 (KYC)
- **Anti-spam** — 1-day cooldown per reviewer-reviewed pair
- **Fee system** — configurable fee per review (default 0.0001 ETH)

### Structs

```solidity
struct ReviewRecord {
    bytes32 reviewHash;     // SHA-256 hash of the full review VC
    address reviewer;       // Reviewer's address
    address reviewed;       // Reviewed agent's address
    bytes32 txHash;         // Hash of the real transaction being reviewed
    string category;        // Service category (e.g., "code-generation")
    uint8 rating;           // 1-5
    uint256 timestamp;      // Block timestamp
}
```

### Functions

#### Write Functions

```solidity
function submitReview(
    address reviewed,
    bytes32 reviewHash,
    bytes32 txHash,
    string calldata category,
    uint8 rating
) external payable;
```

Submit a review. Requires:
- `msg.value >= reviewFee`
- `reviewed != address(0)`
- `reviewed != msg.sender`
- `rating >= 1 && rating <= 5`
- Category and hashes not empty
- Cooldown elapsed since last review of same agent

```solidity
function setVerificationLevel(address agent, uint8 level) external;  // onlyVerifier
function addVerifier(address verifier) external;                      // onlyOwner
function removeVerifier(address verifier) external;                   // onlyOwner
function setReviewFee(uint256 newFee) external;                       // onlyOwner
function withdrawFees(address payable to) external;                   // onlyOwner
```

#### Read Functions

```solidity
function getReviewCount(address agent) external view returns (uint256);
function getReviews(address agent, uint256 offset, uint256 limit) external view returns (ReviewRecord[] memory);
function getAggregateScore(address agent, string calldata category) external view returns (uint256 totalScore, uint256 count);
function getTotalTasksCompleted(address agent) external view returns (uint256);
function getVerificationLevel(address agent) external view returns (uint8);
function reviewFee() external view returns (uint256);
function totalFeesCollected() external view returns (uint256);
function authorizedVerifiers(address) external view returns (bool);
```

### Events

```solidity
event ReviewSubmitted(
    address indexed reviewer,
    address indexed reviewed,
    bytes32 reviewHash,
    string category,
    uint8 rating,
    uint256 timestamp
);

event VerificationLevelSet(address indexed agent, uint8 level, address setBy);
event ReviewFeeUpdated(uint256 oldFee, uint256 newFee);
event FeesWithdrawn(address indexed to, uint256 amount);
```

## ERC-1056 (EthereumDIDRegistry)

The ERC-1056 registry is already deployed on Base. EtereCitizen uses it for `did:ethr` identity anchoring. We interact with it through Veramo's EthrDIDProvider — no custom deployment needed.

Key functions used:
- `identityOwner(address)` — Get identity owner
- `setAttribute(address, bytes32, bytes, uint256)` — Set DID Document attributes
- `revokeAttribute(address, bytes32, bytes)` — Revoke attributes

## Development

### Compile

```bash
cd packages/contracts
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

### Deploy to Base Sepolia

```bash
npx hardhat run scripts/deploy.ts --network base-sepolia
```

### Verify on BaseScan

```bash
BASESCAN_API_KEY=... CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify.ts --network base-sepolia
```
