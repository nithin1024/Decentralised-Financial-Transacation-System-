// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoanSystem {
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 dueDate;
        bool approved;
        bool repaid;
        address lender;
    }

    mapping(uint256 => Loan) public loans;
    uint256 public loanCounter;

    function requestLoan(uint256 _amount, uint256 _interestRate, uint256 _durationSeconds) external {
        loanCounter++;
        loans[loanCounter] = Loan({
            borrower: msg.sender,
            amount: _amount,
            interestRate: _interestRate,
            dueDate: block.timestamp + _durationSeconds,
            approved: false,
            repaid: false,
            lender: address(0)
        });
    }

    function approveLoan(uint256 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(!loan.approved, "Already approved");
        require(msg.value == loan.amount, "Must fund exact amount");

        loan.approved = true;
        loan.lender = msg.sender;
        
        // Transfer to borrower
        payable(loan.borrower).transfer(msg.value);
    }

    function repayLoan(uint256 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(loan.approved, "Not approved");
        require(!loan.repaid, "Already repaid");
        require(msg.sender == loan.borrower, "Only borrower can repay");
        
        uint256 totalDue = loan.amount + ((loan.amount * loan.interestRate) / 100);
        require(msg.value >= totalDue, "Insufficient repayment amount");

        loan.repaid = true;
        
        // Pay lender
        payable(loan.lender).transfer(totalDue);
        
        // Refund excess
        if(msg.value > totalDue) {
            payable(msg.sender).transfer(msg.value - totalDue);
        }
    }
}
