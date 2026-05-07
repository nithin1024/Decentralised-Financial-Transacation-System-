// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract EscrowRefund is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Escrow {
        address token; // address(0) for native
        address sender;
        address recipient;
        uint256 amount;
        uint256 createdAt;
        uint256 refundAfter;
        bool released;
        bool refunded;
    }

    mapping(bytes32 => Escrow) public escrows;

    event EscrowCreated(bytes32 indexed escrowId, address indexed sender, address indexed recipient, address token, uint256 amount, uint256 refundAfter);
    event Released(bytes32 indexed escrowId);
    event Refunded(bytes32 indexed escrowId);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createNative(bytes32 escrowId, address recipient, uint256 refundAfterSeconds) external payable nonReentrant {
        require(escrows[escrowId].createdAt == 0, "exists");
        require(msg.value > 0, "amount=0");
        require(refundAfterSeconds >= 1 hours && refundAfterSeconds <= 7 days, "bad refund window");
        escrows[escrowId] = Escrow({
            token: address(0),
            sender: msg.sender,
            recipient: recipient,
            amount: msg.value,
            createdAt: block.timestamp,
            refundAfter: block.timestamp + refundAfterSeconds,
            released: false,
            refunded: false
        });
        emit EscrowCreated(escrowId, msg.sender, recipient, address(0), msg.value, block.timestamp + refundAfterSeconds);
    }

    function createERC20(bytes32 escrowId, IERC20 token, address recipient, uint256 amount, uint256 refundAfterSeconds) external nonReentrant {
        require(escrows[escrowId].createdAt == 0, "exists");
        require(amount > 0, "amount=0");
        require(refundAfterSeconds >= 1 hours && refundAfterSeconds <= 7 days, "bad refund window");
        token.safeTransferFrom(msg.sender, address(this), amount);
        escrows[escrowId] = Escrow({
            token: address(token),
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            createdAt: block.timestamp,
            refundAfter: block.timestamp + refundAfterSeconds,
            released: false,
            refunded: false
        });
        emit EscrowCreated(escrowId, msg.sender, recipient, address(token), amount, block.timestamp + refundAfterSeconds);
    }

    function release(bytes32 escrowId) external onlyOwner nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.createdAt != 0, "missing");
        require(!e.released && !e.refunded, "closed");
        e.released = true;
        if (e.token == address(0)) {
            (bool ok,) = e.recipient.call{value: e.amount}("");
            require(ok, "native transfer fail");
        } else {
            IERC20(e.token).safeTransfer(e.recipient, e.amount);
        }
        emit Released(escrowId);
    }

    function refund(bytes32 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.createdAt != 0, "missing");
        require(!e.released && !e.refunded, "closed");
        require(block.timestamp >= e.refundAfter, "too early");
        e.refunded = true;
        if (e.token == address(0)) {
            (bool ok,) = e.sender.call{value: e.amount}("");
            require(ok, "native transfer fail");
        } else {
            IERC20(e.token).safeTransfer(e.sender, e.amount);
        }
        emit Refunded(escrowId);
    }
}

