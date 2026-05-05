// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TransactionContract {
    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
    }

    Transaction[] private transactions;

    event Transfer(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    function sendTransaction(address receiver) external payable {
        require(receiver != address(0), "Invalid receiver address");
        require(msg.value > 0, "Eth amount must be greater than 0");

        (bool success, ) = payable(receiver).call{value: msg.value}("");
        require(success, "Failed to send Ether");

        transactions.push(Transaction({
            sender: msg.sender,
            receiver: receiver,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit Transfer(msg.sender, receiver, msg.value, block.timestamp);
    }

    function getAllTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }
}
