import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareERC20Tokens, prepareSigners } from "./utils/prepare"
import { prepareTicTac} from "./utils/prepareTicTac"

use(waffle.solidity)

describe("ERC20 mock contract", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareERC20Tokens(this, this.bob)
        prepareTicTac(this, this.bob)
    })

    describe("Deployment", function () {
        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await this.token1.balanceOf(this.bob.address)
            expect(await this.token1.totalSupply()).to.equal(ownerBalance)
        })
    })

    describe("Transactions", function () {
        it("Should transfer tokens", async function () {
            const transferAmount = ethers.utils.parseUnits("100", 6)

            await this.token1.connect(this.bob).approve(this.bob.address, transferAmount)
            await this.token1.connect(this.bob).transferFrom(this.bob.address, this.tictac.address, transferAmount)

            const tictacBalance = await this.token1.balanceOf(this.tictac.address)
            expect(tictacBalance).to.equal(transferAmount)
        })

        it("Should fail if sender doesn’t have enough allowance", async function () {
            const initialOwnerBalance = await this.token1.balanceOf(this.bob.address)
            await expect(this.token1.connect(this.misha).transferFrom(this.bob.address,this.tictac.address, 1)).to.be.revertedWith(
                "ERC20: insufficient allowance"
            )

            // Owner balance shouldn't have changed.
            expect(await this.token1.balanceOf(this.bob.address)).to.equal(initialOwnerBalance)
        })

        it("Should fail if sender doesn’t have enough tokens", async function () {
            const initialOwnerBalance = await this.token1.balanceOf(this.bob.address)

            await this.token1.connect(this.misha).approve(this.misha.address, 1)
            await expect(this.token1.connect(this.misha).transferFrom(this.misha.address,this.tictac.address, 1)).to.be.revertedWith(
                "ERC20: transfer amount exceeds balance"
            )

            // Owner balance shouldn't have changed.
            expect(await this.token1.balanceOf(this.bob.address)).to.equal(initialOwnerBalance)
        })

        it("Should update balances after transfers", async function () {
            const initialOwnerBalance = await this.token1.balanceOf(this.bob.address)

            const transferToAmount = ethers.utils.parseUnits("100", 6)
            await this.token1.connect(this.bob).approve(this.bob.address, transferToAmount)
            await this.token1.connect(this.bob).transferFrom(this.bob.address, this.tictac.address, transferToAmount)

            const finalOwnerBalance = await this.token1.balanceOf(this.bob.address)
            expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(transferToAmount))
        })
    })
})
