// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Icaro Holding — Michele Trani
// https://eterecitizen.io
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEtereCitizen.sol";

/// @title EtereCitizen
/// @notice Unified on-chain identity and reputation for AI agents.
///         Identity: register agents with name + capabilities.
///         Reputation: on-chain review hashes + scores; full VCs on IPFS.
///         Temporal decay and anti-fraud detection happen off-chain in the SDK.
contract EtereCitizen is IEtereCitizen, Ownable {
    // ===================== Identity =====================

    mapping(address => AgentIdentity) private _agents;
    mapping(address => bool) private _registered;
    uint256 public totalAgents;

    // ===================== Reputation =====================

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

    // Anti-duplicate: txHash => already used
    mapping(bytes32 => bool) private _usedTxHashes;

    // Capability limit per agent
    uint256 public constant MAX_CAPABILITIES = 50;

    // ===================== Fees =====================

    uint256 public reviewFee = 0.0001 ether;
    uint256 public totalFeesCollected;

    event ReviewFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ===================== Modifiers =====================

    modifier onlyVerifier() {
        require(
            msg.sender == owner() || authorizedVerifiers[msg.sender],
            "Not authorized verifier"
        );
        _;
    }

    modifier onlyRegistered() {
        require(_registered[msg.sender], "Agent not registered");
        _;
    }

    // ===================== Constructor =====================

    constructor() Ownable(msg.sender) {}

    // ===================== Admin =====================

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
        require(to != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        // Checks-Effects-Interactions: update state before external call
        totalFeesCollected += balance;
        emit FeesWithdrawn(to, balance);
        (bool success, ) = to.call{value: balance}("");
        require(success, "Transfer failed");
    }

    // ===================== Identity =====================

    /// @notice Register a new agent with name and capabilities
    function registerAgent(
        string calldata name,
        string[] calldata capabilities
    ) external {
        require(!_registered[msg.sender], "Already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= 64, "Name too long");

        _agents[msg.sender] = AgentIdentity({
            name: name,
            capabilities: capabilities,
            createdAt: block.timestamp,
            active: true
        });
        _registered[msg.sender] = true;
        totalAgents++;

        emit AgentRegistered(msg.sender, name, block.timestamp);
    }

    /// @notice Update agent name
    function updateAgent(string calldata name) external onlyRegistered {
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= 64, "Name too long");
        _agents[msg.sender].name = name;
        emit AgentUpdated(msg.sender, name);
    }

    /// @notice Add a capability to the agent
    function addCapability(string calldata capability) external onlyRegistered {
        require(bytes(capability).length > 0, "Capability required");
        require(_agents[msg.sender].capabilities.length < MAX_CAPABILITIES, "Too many capabilities");
        _agents[msg.sender].capabilities.push(capability);
        emit CapabilityAdded(msg.sender, capability);
    }

    /// @notice Deactivate agent (soft delete)
    function deactivateAgent() external onlyRegistered {
        _agents[msg.sender].active = false;
        emit AgentDeactivated(msg.sender);
    }

    /// @notice Get agent identity data
    function getAgent(address agent) external view returns (AgentIdentity memory) {
        return _agents[agent];
    }

    /// @notice Check if an address is a registered agent
    function isRegistered(address agent) external view returns (bool) {
        return _registered[agent];
    }

    // ===================== Reputation =====================

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
        require(!_usedTxHashes[txHash], "Transaction already reviewed");

        // Cooldown check
        require(
            block.timestamp >= _lastReviewTime[msg.sender][reviewed] + REVIEW_COOLDOWN,
            "Review cooldown active"
        );

        // Mark txHash as used
        _usedTxHashes[txHash] = true;

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

        // Refund excess ETH
        uint256 excess = msg.value - reviewFee;
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            require(success, "Refund failed");
        }
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

    // ===================== Verification Level =====================

    function setVerificationLevel(address agent, uint8 level) external onlyVerifier {
        require(level <= 3, "Invalid verification level");
        _verificationLevel[agent] = level;
        emit VerificationLevelSet(agent, level, msg.sender);
    }

    function getVerificationLevel(address agent) external view returns (uint8) {
        return _verificationLevel[agent];
    }
}
