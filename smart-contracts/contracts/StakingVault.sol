// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StakingVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable dst;

    uint256 public apyBps = 1200; // 12%
    uint256 public lockSeconds = 7 days;

    struct Position {
        uint256 amount;
        uint256 start;
        uint256 claimed;
    }

    mapping(address => Position) public positions;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);
    event ParamsUpdated(uint256 apyBps, uint256 lockSeconds);

    constructor(address initialOwner, IERC20 _dst) Ownable(initialOwner) {
        dst = _dst;
    }

    function setParams(uint256 _apyBps, uint256 _lockSeconds) external onlyOwner {
        require(_apyBps <= 5000, "apy too high");
        require(_lockSeconds <= 365 days, "lock too long");
        apyBps = _apyBps;
        lockSeconds = _lockSeconds;
        emit ParamsUpdated(_apyBps, _lockSeconds);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        Position storage p = positions[msg.sender];
        if (p.amount == 0) {
            p.start = block.timestamp;
        }
        dst.safeTransferFrom(msg.sender, address(this), amount);
        p.amount += amount;
        emit Staked(msg.sender, amount);
    }

    function pendingReward(address user) public view returns (uint256) {
        Position memory p = positions[user];
        if (p.amount == 0) return 0;
        uint256 elapsed = block.timestamp - p.start;
        uint256 yearly = (p.amount * apyBps) / 10_000;
        uint256 reward = (yearly * elapsed) / 365 days;
        if (reward <= p.claimed) return 0;
        return reward - p.claimed;
    }

    function withdraw(uint256 amount) external nonReentrant {
        Position storage p = positions[msg.sender];
        require(p.amount >= amount && amount > 0, "bad amount");
        require(block.timestamp >= p.start + lockSeconds, "locked");

        uint256 reward = pendingReward(msg.sender);
        p.claimed += reward;
        p.amount -= amount;
        dst.safeTransfer(msg.sender, amount + reward);
        emit Withdrawn(msg.sender, amount, reward);
    }
}

