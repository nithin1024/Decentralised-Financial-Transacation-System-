// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOGovernance is Ownable {
    IERC20 public immutable dst;
    uint256 public proposalCount;
    uint256 public quorumBps = 200; // 2% of token supply

    struct Proposal {
        string title;
        string description;
        uint256 start;
        uint256 end;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public voted;

    event ProposalCreated(uint256 indexed id, string title, uint256 start, uint256 end);
    event Voted(uint256 indexed id, address indexed voter, bool support, uint256 weight);
    event Executed(uint256 indexed id);
    event ParamsUpdated(uint256 quorumBps);

    constructor(address initialOwner, IERC20 _dst) Ownable(initialOwner) {
        dst = _dst;
    }

    function setQuorum(uint256 _quorumBps) external onlyOwner {
        require(_quorumBps <= 2000, "quorum too high");
        quorumBps = _quorumBps;
        emit ParamsUpdated(_quorumBps);
    }

    function createProposal(string calldata title, string calldata description, uint256 durationSeconds) external returns (uint256) {
        require(durationSeconds >= 1 hours && durationSeconds <= 14 days, "bad duration");
        proposalCount += 1;
        uint256 id = proposalCount;
        proposals[id] = Proposal({
            title: title,
            description: description,
            start: block.timestamp,
            end: block.timestamp + durationSeconds,
            forVotes: 0,
            againstVotes: 0,
            executed: false
        });
        emit ProposalCreated(id, title, block.timestamp, block.timestamp + durationSeconds);
        return id;
    }

    function vote(uint256 id, bool support) external {
        Proposal storage p = proposals[id];
        require(p.start != 0, "no proposal");
        require(block.timestamp < p.end, "ended");
        require(!voted[id][msg.sender], "already voted");
        voted[id][msg.sender] = true;
        uint256 weight = dst.balanceOf(msg.sender);
        require(weight > 0, "no power");
        if (support) p.forVotes += weight;
        else p.againstVotes += weight;
        emit Voted(id, msg.sender, support, weight);
    }

    function quorumReached(uint256 id) public view returns (bool) {
        Proposal memory p = proposals[id];
        uint256 total = p.forVotes + p.againstVotes;
        uint256 needed = (dst.totalSupply() * quorumBps) / 10_000;
        return total >= needed;
    }

    function execute(uint256 id) external onlyOwner {
        Proposal storage p = proposals[id];
        require(block.timestamp >= p.end, "not ended");
        require(!p.executed, "executed");
        require(quorumReached(id), "no quorum");
        require(p.forVotes > p.againstVotes, "rejected");
        p.executed = true;
        emit Executed(id);
    }
}

