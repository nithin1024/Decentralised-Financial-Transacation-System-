// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    address public payer;
    address public payee;
    address public arbiter;
    uint256 public amount;
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED }
    State public currentState;

    constructor(address _payee, address _arbiter) {
        payer = msg.sender;
        payee = _payee;
        arbiter = _arbiter;
        currentState = State.AWAITING_PAYMENT;
    }

    function deposit() external payable {
        require(msg.sender == payer, "Only payer can deposit");
        require(currentState == State.AWAITING_PAYMENT, "Already paid");
        amount = msg.value;
        currentState = State.AWAITING_DELIVERY;
    }

    function releaseFunds() external {
        require(msg.sender == arbiter || msg.sender == payer, "Only arbiter or payer can release");
        require(currentState == State.AWAITING_DELIVERY, "Cannot release");
        currentState = State.COMPLETE;
        payable(payee).transfer(amount);
    }

    function refund() external {
        require(msg.sender == arbiter, "Only arbiter can refund");
        require(currentState == State.AWAITING_DELIVERY, "Cannot refund");
        currentState = State.REFUNDED;
        payable(payer).transfer(amount);
    }
}
