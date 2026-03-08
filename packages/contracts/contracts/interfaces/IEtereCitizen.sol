// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/// @title IEtereCitizen
/// @notice Interface for the unified EtereCitizen identity + reputation contract
interface IEtereCitizen {
    // --- Structs ---

    struct AgentIdentity {
        string name;
        string[] capabilities;
        uint256 createdAt;
        bool active;
    }

    struct ReviewRecord {
        bytes32 reviewHash;
        address reviewer;
        address reviewed;
        bytes32 txHash;
        string category;
        uint8 rating;
        uint256 timestamp;
    }

    // --- Events ---

    event AgentRegistered(
        address indexed agent,
        string name,
        uint256 timestamp
    );

    event AgentUpdated(
        address indexed agent,
        string name
    );

    event AgentDeactivated(address indexed agent);

    event CapabilityAdded(address indexed agent, string capability);
    event CapabilityRemoved(address indexed agent, uint256 index);

    event ReviewSubmitted(
        address indexed reviewer,
        address indexed reviewed,
        bytes32 reviewHash,
        string category,
        uint8 rating,
        uint256 timestamp
    );

    event VerificationLevelSet(address indexed agent, uint8 level, address setBy);

    // --- Identity ---

    function registerAgent(string calldata name, string[] calldata capabilities) external;
    function updateAgent(string calldata name) external;
    function addCapability(string calldata capability) external;
    function deactivateAgent() external;
    function getAgent(address agent) external view returns (AgentIdentity memory);
    function isRegistered(address agent) external view returns (bool);

    // --- Reputation ---

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
