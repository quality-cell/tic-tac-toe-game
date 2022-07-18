import { expect } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareContracts, prepareSigners } from "./utils/prepare"
import { increase, duration } from "./utils/time"

describe("Wallet contract", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareContracts(this, this.bob, this.misha)
    })

    it("approveWithdraw", async function () {
        let message = ethers.utils.solidityKeccak256(
            [
                "uint256",
                "uint256",
                "address",
            ],
            [
                0,
                1,
                this.bob.address,
            ]
        )
        let bytesArray = ethers.utils.arrayify(message);
        let realSignature = await this.bob.signMessage(bytesArray)
        await this.wallet.connect(this.bob).approveWithdraw(1, 2, realSignature)

        message = ethers.utils.solidityKeccak256(
            [
                "uint256",
                "uint256",
                "address",
            ],
            [
                0,
                1,
                this.misha.address,
            ]
        )
        bytesArray = ethers.utils.arrayify(message);
        realSignature = await this.misha.signMessage(bytesArray)
        await this.wallet.connect(this.misha).approveWithdraw(1, 2, realSignature)
        
        await expect(this.wallet.connect(this.anton).approveWithdraw(0, 1, realSignature)).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Invalid address'"
        )
    })

    it("withdraw", async function () {
        let message = ethers.utils.solidityKeccak256(
            [
                "uint256",
                "uint256",
                "address",
            ],
            [
                0,
                1,
                this.bob.address,
            ]
        )
        let bytesArray = ethers.utils.arrayify(message);
        let realSignature = await this.bob.signMessage(bytesArray)
        await this.wallet.connect(this.bob).approveWithdraw(1, 2, realSignature)

        await expect(this.wallet.connect(this.misha).withdraw(0, this.anton.address)).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Invalid locked'"
        )

        message = ethers.utils.solidityKeccak256(
            [
                "uint256",
                "uint256",
                "address",
            ],
            [
                0,
                1,
                this.misha.address,
            ]
        )
        bytesArray = ethers.utils.arrayify(message);
        realSignature = await this.misha.signMessage(bytesArray)
        await this.wallet.connect(this.misha).approveWithdraw(1, 2, realSignature)
        
        await expect(this.wallet.connect(this.anton).withdraw(0, this.misha.address)).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with reason string 'Invalid address'"
        )
        
    })
})