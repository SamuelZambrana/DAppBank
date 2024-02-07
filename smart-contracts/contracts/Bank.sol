// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bank {
    address admin;

    mapping(address => uint256) private balances;
    mapping(address => uint256) private totalInterest;
    mapping(address => uint256) private lastInterestTime;

    uint256 private annualInterestRate = 5;

    constructor() {
        admin = tx.origin;
    }

    function setInterestRate(uint256 newRate) public {
        // Sets the Interest Rate

        require(msg.sender == admin, "UNAUTHORIZED");
        annualInterestRate = newRate;
    }

    function getMyBalance() public view returns (uint256) {
        // Returns the user balance

        uint256 interest = calculateInterest(msg.sender, block.timestamp);
        return balances[msg.sender] + interest;
    }

    function getUserBalance(address user) public view returns (uint256) {
        // Returns the user balance

        require(msg.sender == admin, "UNAUTHORIZED");

        uint256 interest = calculateInterest(user, block.timestamp);
        return balances[user] + interest;
    }

    function getMyInterest() public view returns (uint256) {
        uint256 interest = calculateInterest(msg.sender, block.timestamp);
        return totalInterest[msg.sender] + interest;
    }

    function deposit() public payable {
        // Deposit funds

        uint256 interest = calculateInterest(msg.sender, block.timestamp);

        if (interest > 0) {
            balances[msg.sender] += interest;
            totalInterest[msg.sender] += interest;
        }

        require(msg.value > 0, "MIN_ETHER_NOT_MET");
        balances[msg.sender] += msg.value;
        lastInterestTime[msg.sender] = block.timestamp;
    }

    function withdraw(uint256 amount) public {
        // Withdraw funds

        uint256 interest = calculateInterest(msg.sender, block.timestamp);

        if (interest > 0) {
            balances[msg.sender] += interest;
            totalInterest[msg.sender] += interest;
        }

        require(balances[msg.sender] >= amount, "INSUFFICIENT_BALANCE");
        payable(msg.sender).transfer(amount);
        balances[msg.sender] -= amount;
        lastInterestTime[msg.sender] = block.timestamp;
    }

    function calculateInterest(
        address user,
        uint256 timestamp
    ) internal view returns (uint256) {
        // Help Function to Calculate interest

        if (lastInterestTime[user] == 0 || timestamp < lastInterestTime[user]) {
            return 0;
        }

        uint256 timeElapsed = timestamp - lastInterestTime[user];
        uint256 userInterest = ((balances[user] * annualInterestRate) / 100);
        uint256 overTime = (userInterest * timeElapsed);
        uint256 yearly = overTime / 365 days;

        return yearly;
    }
}
