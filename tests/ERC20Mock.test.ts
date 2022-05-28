import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareERC20Tokens, prepareSigners } from "./utils/prepare"
import { prepareTicTac } from "./utils/prepareTicTac"
import { prepareWallet } from "./utils/prepareWallet"


use(waffle.solidity)

describe("ERC20 mock contract", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareERC20Tokens(this, this.bob, this.misha)
        await prepareTicTac(this, this.bob)
        await prepareWallet(this, this.bob, this.misha)
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

            await this.token1.connect(this.bob).approve(this.tictac.address, transferAmount)
            await this.token2.connect(this.misha).approve(this.tictac.address, transferAmount)

            await this.tictac.connect(this.bob).refill(transferAmount, this.token1.address)
            await this.tictac.connect(this.misha).refill(transferAmount, this.token2.address)

            let bob = await this.tictac.connect(this.bob).getBalancePlayer()
            let misha = await this.tictac.connect(this.misha).getBalancePlayer()

            expect(bob).to.equal(transferAmount)
            expect(misha).to.equal(transferAmount)


            const transferAmount1 = ethers.utils.parseUnits("100", 5)


            await this.tictac.connect(this.bob).createGameERC20(10, transferAmount1 )
            await this.tictac.connect(this.misha).joinERC20(0, transferAmount1)
            await this.tictac.connect(this.bob).pickUpTheWinningsERC20(0)

            let bob1 = await this.tictac.connect(this.bob).getBalancePlayer()
            let misha1 = await this.tictac.connect(this.misha).getBalancePlayer()

            expect(bob1).to.equal(bob
                .sub(transferAmount1))
            expect(misha1).to.equal(misha
                .sub(transferAmount1))
            
            

            await this.tictac.connect(this.bob).move(0, 1, 0)
            await this.tictac.connect(this.misha).move(3, 2, 0)
            await this.tictac.connect(this.bob).move(1, 1, 0)
            await this.tictac.connect(this.misha).move(6, 2, 0)
            await this.tictac.connect(this.bob).move(2, 1, 0)

            await this.tictac.connect(this.bob).gameFinished(0, 1)

            await expect(this.tictac.connect(this.misha).pickUpTheWinningsERC20(0)).to.be.revertedWith("youAreNotWinner()")

            await this.tictac.connect(this.bob).pickUpTheWinningsERC20(0)  

            const transferAmount2 = ethers.utils.parseUnits("180", 5)

            bob1 = await this.tictac.connect(this.bob).getBalancePlayer()

            expect(bob1).to.equal(bob
                .add(transferAmount2)
                .sub(transferAmount1))
            
            const bobBalance = await this.token1.balanceOf(this.bob.address)

            await this.tictac.connect(this.bob).withdrawERC20(transferAmount2, this.token1.address)
            
            expect(await this.token1.balanceOf(this.bob.address)).to.equal(bobBalance.add(transferAmount2))

            await this.tictac.connect(this.bob).createGame(10, {value: ethers.utils.parseEther("0.1")})
            await this.tictac.connect(this.misha).join(1, { value: ethers.utils.parseEther("0.1") })

            await this.tictac.connect(this.bob).move(0, 1, 1)
            await this.tictac.connect(this.misha).move(3, 2, 1)
            await this.tictac.connect(this.bob).move(1, 1, 1)
            await this.tictac.connect(this.misha).move(6, 2, 1)
            await this.tictac.connect(this.bob).move(2, 1, 1)

            await this.tictac.connect(this.bob).gameFinished(1, 1)
            await this.tictac.connect(this.bob).pickUpTheWinnings(1)

            await expect(this.tictac.connect(this.misha).getComission()).to.be.revertedWith(
                "Invalid address"
            )
            expect(await this.tictac.connect(this.bob).getComission()).to.equal(ethers.utils.parseEther("0.02"))

            await expect(this.tictac.connect(this.misha).getComissionERC20()).to.be.revertedWith(
                "Invalid address"
            )
            expect(await this.tictac.connect(this.bob).getComissionERC20()).to.equal(ethers.utils.parseUnits("200", 4))


            await this.tictac.connect(this.bob).withdrawComissionERC20(this.wallet.address, this.token1.address)
            await this.wallet.refill(ethers.utils.parseUnits("200", 4), this.token1.address, this.tictac.address)

            expect(await this.wallet.getBalanceERC20()).to.equal(ethers.utils.parseUnits("200", 4))

            let message = ethers.utils.solidityKeccak256(
                [
                    "uint256",
                    "uint256",
                    "address",
                ],
                [
                    ethers.utils.parseUnits("200", 4),
                    2,
                    this.bob.address,
                ]
            )
            let bytesArray = ethers.utils.arrayify(message);
            let realSignature = await this.bob.signMessage(bytesArray)
            await this.wallet.connect(this.bob).approveWithdraw(ethers.utils.parseUnits("200", 4), 2, realSignature)
    
            message = ethers.utils.solidityKeccak256(
                [
                    "uint256",
                    "uint256",
                    "address",
                ],
                [
                    ethers.utils.parseUnits("200", 4),
                    2,
                    this.misha.address,
                ]
            )
            const bobBalance1 = await this.token1.balanceOf(this.bob.address)

            bytesArray = ethers.utils.arrayify(message);
            realSignature = await this.misha.signMessage(bytesArray)
            await this.wallet.connect(this.misha).approveWithdraw(ethers.utils.parseUnits("200", 4), 2, realSignature)
            await this.wallet.connect(this.bob).withdrawERC20(ethers.utils.parseUnits("200", 4), this.token1.address)

            expect(await this.token1.balanceOf(this.bob.address)).to.equal(bobBalance1.add(ethers.utils.parseUnits("200", 4)))
    
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
