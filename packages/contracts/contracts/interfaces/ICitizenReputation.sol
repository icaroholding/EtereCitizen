// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/// @title ICitizenReputation
/// @notice Interface for the EtereCitizen Reputation contract
interface ICitizenReputation {
    struct ReviewRecord {
        bytes32 reviewHash;
        address reviewer;
        address reviewed;
        bytes32 txHash;
        string category;
        uint8 rating;
        uint256 timestamp;
    }

    event ReviewSubmitted(
        address indexed reviewer,
        address indexed reviewed,
        bytes32 reviewHash,
        string category,
        uint8 rating,
        uint256 timestamp
    );

    event VerificationLevelSet(address indexed agent, uint8 level, address setBy);

    function submitReview(
        address reviewed,
        bytes32 reviewHash,
        bytes32 txHash,
        string calldata category,
        uint8 rating
    ) external payable;

    function getAggregateScore(
        address agent,
        string calldata category
    ) external view returns (uint256 totalScore, uint256 count);

    function getReviewCount(address agent) external view returns (uint256);

    function getReviews(
        address agent,
        uint256 offset,
        uint256 limit
    ) external view returns (ReviewRecord[] memory);

    function setVerificationLevel(address agent, uint8 level) external;

    function getVerificationLevel(address agent) external view returns (uint8);

    function getTotalTasksCompleted(address agent) external view returns (uint256);
}
