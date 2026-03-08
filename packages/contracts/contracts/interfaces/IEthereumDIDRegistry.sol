// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/// @title IEthereumDIDRegistry
/// @notice Interface for the ERC-1056 Ethereum DID Registry (already deployed on Base)
interface IEthereumDIDRegistry {
    event DIDOwnerChanged(address indexed identity, address owner, uint previousChange);
    event DIDDelegateChanged(
        address indexed identity,
        bytes32 delegateType,
        address delegate,
        uint validTo,
        uint previousChange
    );
    event DIDAttributeChanged(
        address indexed identity,
        bytes32 name,
        bytes value,
        uint validTo,
        uint previousChange
    );

    function identityOwner(address identity) external view returns (address);
    function changed(address identity) external view returns (uint);
    function nonce(address identity) external view returns (uint);

    function changeOwner(address identity, address newOwner) external;
    function changeOwnerSigned(
        address identity,
        uint8 sigV,
        bytes32 sigR,
        bytes32 sigS,
        address newOwner
    ) external;

    function addDelegate(
        address identity,
        bytes32 delegateType,
        address delegate,
        uint validity
    ) external;

    function revokeDelegate(address identity, bytes32 delegateType, address delegate) external;

    function setAttribute(
        address identity,
        bytes32 name,
        bytes calldata value,
        uint validity
    ) external;

    function revokeAttribute(address identity, bytes32 name, bytes calldata value) external;
}
