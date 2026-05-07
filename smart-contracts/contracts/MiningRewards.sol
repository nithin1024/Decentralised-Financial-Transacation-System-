// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MiningRewards is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable dst;
    address public rewardSigner;

    mapping(bytes32 => bool) public claimed;

    event RewardClaimed(address indexed miner, uint256 amount, uint256 indexed blockIndex);

    constructor(address initialOwner, IERC20 _dst, address _rewardSigner) Ownable(initialOwner) {
        dst = _dst;
        rewardSigner = _rewardSigner;
    }

    function setRewardSigner(address s) external onlyOwner {
        rewardSigner = s;
    }

    function claim(uint256 blockIndex, uint256 amount, bytes32 nonce) external {
        bytes32 key = keccak256(abi.encode(msg.sender, blockIndex, amount, nonce));
        require(!claimed[key], "already claimed");
        claimed[key] = true;
        dst.safeTransfer(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount, blockIndex);
    }
}

