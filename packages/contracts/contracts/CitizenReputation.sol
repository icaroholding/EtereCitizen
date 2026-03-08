// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICitizenReputation.sol";

/// @title CitizenReputation
/// @notice On-chain reputation for EtereCitizen AI agents.
///         Stores review hashes + scores on-chain; full review VCs live on IPFS.
///         Temporal decay and anti-fraud detection happen off-chain in the SDK.
contract CitizenReputation is ICitizenReputation, Ownable {
    // --- Storage ---
    mapping(address => ReviewRecord[]) private _reviews;
    mapping(address => mapping(string => uint256)) private _categoryTotalScore;
    mapping(address => mapping(string => uint256)) private _categoryReviewCount;
    mapping(address => uint256) private _totalTasksCompleted;
    mapping(address => uint8) private _verificationLevel;

    // Authorized verifiers (can set verification levels)
    mapping(address => bool) public authorizedVerifiers;

    // Anti-spam: reviewer => reviewed => last review timestamp
    mapping(address => mapping(address => uint256)) private _lastReviewTime;
    uint256 public constant REVIEW_COOLDOWN = 1 days;

    // --- Fee ---
    uint256 public reviewFee = 0.0001 ether;
    uint256 public totalFeesCollected;

    event ReviewFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // --- Modifiers ---
    modifier onlyVerifier() {
        require(
            msg.sender == owner() || authorizedVerifiers[msg.sender],
            "Not authorized verifier"
        );
        _;
    }

    // --- Constructor ---
    constructor() Ownable(msg.sender) {}

    // --- Admin ---
    function addVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = true;
    }

    function removeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
    }

    function setReviewFee(uint256 newFee) external onlyOwner {
        emit ReviewFeeUpdated(reviewFee, newFee);
        reviewFee = newFee;
    }

    function withdrawFees(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        totalFeesCollected += balance;
        to.transfer(balance);
        emit FeesWithdrawn(to, balance);
    }

    // --- Reviews ---
    function submitReview(
        address reviewed,
        bytes32 reviewHash,
        bytes32 txHash,
        string calldata category,
        uint8 rating
    ) external payable {
        require(msg.value >= reviewFee, "Insufficient fee");
        require(reviewed != address(0), "Invalid reviewed address");
        require(reviewed != msg.sender, "Cannot review yourself");
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(bytes(category).length > 0, "Category required");
        require(reviewHash != bytes32(0), "Review hash required");
        require(txHash != bytes32(0), "Transaction hash required");

        // Cooldown check
        require(
            block.timestamp >= _lastReviewTime[msg.sender][reviewed] + REVIEW_COOLDOWN,
            "Review cooldown active"
        );

        ReviewRecord memory record = ReviewRecord({
            reviewHash: reviewHash,
            reviewer: msg.sender,
            reviewed: reviewed,
            txHash: txHash,
            category: category,
            rating: rating,
            timestamp: block.timestamp
        });

        _reviews[reviewed].push(record);
        _categoryTotalScore[reviewed][category] += rating;
        _categoryReviewCount[reviewed][category] += 1;
        _totalTasksCompleted[reviewed] += 1;
        _lastReviewTime[msg.sender][reviewed] = block.timestamp;

        emit ReviewSubmitted(msg.sender, reviewed, reviewHash, category, rating, block.timestamp);
    }

    function getAggregateScore(
        address agent,
        string calldata category
    ) external view returns (uint256 totalScore, uint256 count) {
        return (_categoryTotalScore[agent][category], _categoryReviewCount[agent][category]);
    }

    function getReviewCount(address agent) external view returns (uint256) {
        return _reviews[agent].length;
    }

    function getReviews(
        address agent,
        uint256 offset,
        uint256 limit
    ) external view returns (ReviewRecord[] memory) {
        ReviewRecord[] storage allReviews = _reviews[agent];
        uint256 total = allReviews.length;

        if (offset >= total) {
            return new ReviewRecord[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - offset;
        ReviewRecord[] memory result = new ReviewRecord[](resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allReviews[offset + i];
        }
        return result;
    }

    function getTotalTasksCompleted(address agent) external view returns (uint256) {
        return _totalTasksCompleted[agent];
    }

    // --- Verification Level ---
    function setVerificationLevel(address agent, uint8 level) external onlyVerifier {
        require(level <= 3, "Invalid verification level");
        _verificationLevel[agent] = level;
        emit VerificationLevelSet(agent, level, msg.sender);
    }

    function getVerificationLevel(address agent) external view returns (uint8) {
        return _verificationLevel[agent];
    }
}
