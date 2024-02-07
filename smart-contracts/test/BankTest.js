const { assert, expect } = require('chai')
const { time } = require("@nomicfoundation/hardhat-network-helpers");

function now() {
    return Math.floor(Date.now() / 1000);
}

function oneMonth() {
    const SECONDS_IN_MONTH = 2628288;
    return SECONDS_IN_MONTH
}

describe("Basic Testing", function () {

    before(async function () {

        this.Bank = await ethers.getContractFactory("Bank");

        const [owner, addr1, addr2] = await ethers.getSigners();

        this.owner = owner;
        this.account1 = addr1;
        this.account2 = addr2;
    });

    beforeEach(async function () {

        this.bank = await this.Bank.deploy();
    });

    it("Is Deployed", async function () {

        assert.isTrue(this.bank !== undefined);
    });

    it("Get My Balance works ok", async function () {

        let myBalance1 = await this.bank.connect(this.owner).getMyBalance();
        assert.equal(myBalance1.toString(), "0", "Invalid Balance");

        let myBalance2 = await this.bank.connect(this.account1).getMyBalance();
        assert.equal(myBalance2.toString(), "0", "Invalid Balance");
    });

    it("Get Any User Balance works ok", async function () {

        let userBalance1 = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance1.toString(), "0", "Invalid Balance");

        await expect(this.bank.connect(this.account1).getUserBalance(this.account2))
            .to.be.revertedWith("UNAUTHORIZED");
    });

    it("Deposit fails on value = 0", async function () {

        await expect(this.bank.connect(this.account1).deposit({ value: 0 }))
            .to.be.revertedWith("MIN_ETHER_NOT_MET");
    });

    it("Deposit succeed on value >= 0. Even consecutive ones.", async function () {

        let userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "0", "Invalid Balance");

        await this.bank.connect(this.account1).deposit({ value: 100 });

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "100", "Invalid Balance");

        await this.bank.connect(this.account1).deposit({ value: 100 });

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "200", "Invalid Balance");
    });

    it("Deposit generates interest.", async function () {

        let userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "0", "Invalid Balance");

        await this.bank.connect(this.account1).deposit({ value: 1000000 });

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "1000000", "Invalid Balance");

        // Now we simulate that we query the Balance 1 month after!
        // In a month we generate 4167 of interest

        await time.increase(oneMonth());

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "1004167", "Invalid Balance");
    });

    it("Interest value total works.", async function () {

        let userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "0", "Invalid Balance");

        await this.bank.connect(this.account1).deposit({ value: 1000000 });

        let userInterest = await this.bank.connect(this.account1).getMyInterest(this.account1);
        assert.equal(userInterest.toString(), "0", "Invalid Interest");

        // Simulate Increasing one Month of mining

        await time.increase(oneMonth());

        userInterest = await this.bank.connect(this.account1).getMyInterest(this.account1);
        assert.equal(userInterest.toString(), "4167", "Invalid Interest");
    });

    it("Withdraw fails with no enough balance.", async function () {

        let userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "0", "Invalid Balance");

        await expect(this.bank.connect(this.account1).withdraw(100))
            .to.be.revertedWith("INSUFFICIENT_BALANCE");
    });

    it("Withdraw succeds.", async function () {

        let userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "0", "Invalid Balance");

        await this.bank.connect(this.account1).deposit({ value: 1000000 });

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "1000000", "Invalid Balance");

        await this.bank.connect(this.account1).withdraw(500000);

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "500000", "Invalid Balance");

        // Now we simulate that we query the Balance 1 month after!
        // In a month we generate 2083 of interest

        await time.increase(oneMonth());

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "502083", "Invalid Balance");
    });

    it("Interest Change Works.", async function () {

        await expect(this.bank.connect(this.account1).setInterestRate(10))
            .to.be.revertedWith("UNAUTHORIZED");

        await this.bank.connect(this.owner).setInterestRate(10);

        let userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "0", "Invalid Balance");

        await this.bank.connect(this.account1).deposit({ value: 1000000 });

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "1000000", "Invalid Balance");

        await this.bank.connect(this.account1).withdraw(500000);

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "500000", "Invalid Balance");

        // Now we simulate that we query the Balance 1 month after!
        // In a month we generate 4167 of interest (10%)

        await time.increase(oneMonth());

        userBalance = await this.bank.connect(this.owner).getUserBalance(this.account1);
        assert.equal(userBalance.toString(), "504167", "Invalid Balance");
    });
});