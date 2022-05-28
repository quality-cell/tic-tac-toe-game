import { expect } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareTicTac, prepareSigners } from "./utils/prepareTicTac"
import { increase, duration } from "./utils/time"
import { prepareWallet } from "./utils/prepareWallet"

describe("tictac", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareTicTac(this, this.bob)
        await prepareWallet(this, this.bob, this.misha)
    })

    it("Create game", async function () {
        const bobBalance1 = await ethers.provider.getBalance(this.bob.address)

        let create = await this.tictac.connect(this.bob).createGame(1, { value: ethers.utils.parseEther("0.1") })
        let wait = await create.wait()
        let fee = wait.effectiveGasPrice.mul(wait.cumulativeGasUsed)

        const bobBalance2 = await ethers.provider.getBalance(this.bob.address)

        expect(bobBalance2).to.equal(bobBalance1.sub(ethers.utils.parseEther("0.1")).sub(fee))

        const game = await this.tictac.getStatGame(0)
        const balance = await ethers.provider.getBalance(this.tictac.address)

        expect(game.player1).to.equal(this.bob.address)
        expect(game.timer).to.equal(1)

        expect(balance).to.equal(ethers.utils.parseEther("0.1"))
        await expect(this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.00001")})).to.be.revertedWith("Insufficient funds")
    })

    it("Join game", async function () {
        const mishaBalance1 = await ethers.provider.getBalance(this.misha.address)

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        let join = await this.tictac.connect(this.misha).join(0, { value: ethers.utils.parseEther("0.1") })
        let wait = await join.wait()
        let fee = wait.effectiveGasPrice.mul(wait.cumulativeGasUsed)
        
        const mishaBalance2 = await ethers.provider.getBalance(this.misha.address)

        expect(mishaBalance2).to.equal(mishaBalance1.sub(ethers.utils.parseEther("0.1")).sub(fee))

        const game = await this.tictac.getStatGame(0)
        const balance = await ethers.provider.getBalance(this.tictac.address)

        expect(game.player2).to.equal(this.misha.address)
        expect(game.timer).to.equal(1)
        expect(balance).to.equal(ethers.utils.parseEther("0.2"))

        await expect(this.tictac.connect(this.anton).join(0, {value: ethers.utils.parseEther("0.1")})).to.be.revertedWith("invalidStatus()")

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})

        await expect(this.tictac.connect(this.bob).join(1, { value: ethers.utils.parseEther("0.1") })).to.be.revertedWith("invalidAddress()")
        await expect(this.tictac.connect(this.bob).join(1, {value: ethers.utils.parseEther("0.00001")})).to.be.revertedWith("Insufficient funds")
    })

    it("Move", async function () {
        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(0, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(0, 1, 0)

        const game = await this.tictac.getStatGame(0)

        expect(game.fields[0]).to.equal(1)

        await expect(this.tictac.connect(this.anton).move(0, 1, 0)).to.be.revertedWith("invalidAddress()")
        await expect(this.tictac.connect(this.bob).move(0, 1, 0)).to.be.revertedWith("Now is not your turn")
        await expect(this.tictac.connect(this.bob).move(0, 2, 0)).to.be.revertedWith("notYourElement()")
        await expect(this.tictac.connect(this.misha).move(0, 1, 0)).to.be.revertedWith("notYourElement()")
        await expect(this.tictac.connect(this.misha).move(9, 2, 0)).to.be.revertedWith("invalidCellOrTicTac()")
        await expect(this.tictac.connect(this.misha).move(0, 2, 0)).to.be.revertedWith("invalidCellOrTicTac()")
        await expect(this.tictac.connect(this.misha).move(1, 0, 0)).to.be.revertedWith("invalidCellOrTicTac()")

        increase(duration.minutes("2"))

        await expect(this.tictac.connect(this.misha).move(0, 2, 0)).to.be.revertedWith("yourTimeIsUp()")
    })

    it("Game finished", async function () {
        await this.tictac.connect(this.bob).createGame(10, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(0, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(0, 1, 0)
        await this.tictac.connect(this.misha).move(3, 2, 0)
        await this.tictac.connect(this.bob).move(1, 1, 0)
        await this.tictac.connect(this.misha).move(6, 2, 0)
        await this.tictac.connect(this.bob).move(2, 1, 0)

        await this.tictac.connect(this.bob).gameFinished(0, 1)

        let player1 = await this.tictac.connect(this.bob).getStatPlayer()
        let player2 = await this.tictac.connect(this.misha).getStatPlayer()

        expect(player1.all).to.equal(1)
        expect(player1.win).to.equal(1)
        expect(player2.all).to.equal(1)
        expect(player2.los).to.equal(1)

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(1, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(0, 1, 1)
        await this.tictac.connect(this.misha).move(3, 2, 1)
        await this.tictac.connect(this.bob).move(1, 1, 1)
        await this.tictac.connect(this.misha).move(6, 2, 1)
        await this.tictac.connect(this.bob).move(2, 1, 1)

        await this.tictac.connect(this.misha).gameFinished(1, 2)

        player1 = await this.tictac.connect(this.bob).getStatPlayer()
        player2 = await this.tictac.connect(this.misha).getStatPlayer()

        expect(player1.all).to.equal(2)
        expect(player1.win).to.equal(2)
        expect(player2.all).to.equal(2)
        expect(player2.los).to.equal(2)

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(2, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(4, 1, 2)
        await this.tictac.connect(this.misha).move(3, 2, 2)
        await this.tictac.connect(this.bob).move(5, 1, 2)
        await this.tictac.connect(this.misha).move(6, 2, 2)
        await this.tictac.connect(this.bob).move(1, 1, 2)
        await this.tictac.connect(this.misha).move(0, 2, 2)

        await this.tictac.connect(this.misha).gameFinished(2, 2)

        player1 = await this.tictac.connect(this.bob).getStatPlayer()
        player2 = await this.tictac.connect(this.misha).getStatPlayer()

        expect(player1.all).to.equal(3)
        expect(player1.los).to.equal(1)
        expect(player2.all).to.equal(3)
        expect(player2.win).to.equal(1)

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(3, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(5, 1, 3)
        await this.tictac.connect(this.misha).move(4, 2, 3)
        await this.tictac.connect(this.bob).move(3, 1, 3)
        await this.tictac.connect(this.misha).move(8, 2, 3)
        await this.tictac.connect(this.bob).move(6, 1, 3)
        await this.tictac.connect(this.misha).move(0, 2, 3)

        await this.tictac.connect(this.bob).gameFinished(3, 1)

        player1 = await this.tictac.connect(this.bob).getStatPlayer()
        player2 = await this.tictac.connect(this.misha).getStatPlayer()

        expect(player1.all).to.equal(4)
        expect(player1.los).to.equal(2)
        expect(player2.all).to.equal(4)
        expect(player2.win).to.equal(2)

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(4, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(4, 1, 4)
        await this.tictac.connect(this.misha).move(1, 2, 4)

        await this.tictac.connect(this.bob).gameFinished(4, 1)

        player1 = await this.tictac.connect(this.bob).getStatPlayer()
        player2 = await this.tictac.connect(this.misha).getStatPlayer()
        let game = await this.tictac.connect(this.misha).getStatGame(4)

        expect(game.status).to.equal(3)
        expect(player1.all).to.equal(4)
        expect(player1.los).to.equal(2)
        expect(player2.all).to.equal(4)
        expect(player2.win).to.equal(2)

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(5, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(1, 1, 5)
        await this.tictac.connect(this.misha).move(0, 2, 5)
        await this.tictac.connect(this.bob).move(2, 1, 5)
        await this.tictac.connect(this.misha).move(5, 2, 5)
        await this.tictac.connect(this.bob).move(3, 1, 5)
        await this.tictac.connect(this.misha).move(6, 2, 5)
        await this.tictac.connect(this.bob).move(4, 1, 5)
        await this.tictac.connect(this.misha).move(7, 2, 5)
        await this.tictac.connect(this.bob).move(8, 1, 5)

        await this.tictac.connect(this.bob).gameFinished(5, 1)

        player1 = await this.tictac.connect(this.bob).getStatPlayer()
        player2 = await this.tictac.connect(this.misha).getStatPlayer()

        expect(player1.all).to.equal(5)
        expect(player1.los).to.equal(2)
        expect(player2.all).to.equal(5)
        expect(player2.win).to.equal(2)

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(6, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(1, 1, 6)
        await this.tictac.connect(this.misha).move(0, 2, 6)
        await this.tictac.connect(this.bob).move(2, 1, 6)

        await this.tictac.connect(this.bob).gameFinished(6, 1)

        player1 = await this.tictac.connect(this.bob).getStatPlayer()
        player2 = await this.tictac.connect(this.misha).getStatPlayer()

        expect(player1.all).to.equal(5)
        expect(player1.los).to.equal(2)
        expect(player2.all).to.equal(5)
        expect(player2.win).to.equal(2)
    })

    it("Time is up", async function () {
        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(0, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(1, 1, 0)
        await this.tictac.connect(this.misha).move(0, 2, 0)
        await this.tictac.connect(this.bob).move(3, 1, 0)
        await this.tictac.connect(this.misha).move(5, 2, 0)
        await this.tictac.connect(this.bob).move(4, 1, 0)
        await this.tictac.connect(this.misha).move(6, 2, 0)
        await this.tictac.connect(this.bob).move(2, 1, 0)

        increase(duration.minutes("2"))

        await this.tictac.connect(this.bob).timeIsUp(0)

        let player1 = await this.tictac.connect(this.bob).getStatPlayer()
        let player2 = await this.tictac.connect(this.misha).getStatPlayer()

        expect(player1.all).to.equal(1)
        expect(player1.win).to.equal(1)
        expect(player2.all).to.equal(1)
        expect(player2.los).to.equal(1)

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(1, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(1, 1, 1)
        await this.tictac.connect(this.misha).move(0, 2, 1)
        await this.tictac.connect(this.bob).move(3, 1, 1)
        await this.tictac.connect(this.misha).move(5, 2, 1)
        await this.tictac.connect(this.bob).move(4, 1, 1)
        await this.tictac.connect(this.misha).move(6, 2, 1)

        increase(duration.minutes("2"))

        await this.tictac.connect(this.misha).timeIsUp(1)

        player1 = await this.tictac.connect(this.bob).getStatPlayer()
        player2 = await this.tictac.connect(this.misha).getStatPlayer()

        expect(player1.all).to.equal(2)
        expect(player2.los).to.equal(1)
        expect(player2.all).to.equal(2)
        expect(player2.win).to.equal(1)

        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(2, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(1, 1, 2)
        await this.tictac.connect(this.misha).move(0, 2, 2)
        await this.tictac.connect(this.bob).move(3, 1, 2)
        await this.tictac.connect(this.misha).move(5, 2, 2)

        await this.tictac.connect(this.misha).timeIsUp(2)

        player1 = await this.tictac.connect(this.bob).getStatPlayer()
        player2 = await this.tictac.connect(this.misha).getStatPlayer()

        expect(player1.all).to.equal(2)
        expect(player2.los).to.equal(1)
        expect(player2.all).to.equal(2)
        expect(player2.win).to.equal(1)
    })

    it("Test for event 'Player1'", async function () {
        const connectedContract = await this.tictac.connect(this.bob)

        await expect(connectedContract.createGame(1, {value: ethers.utils.parseEther("0.1")}))
            .to.emit(this.tictac, "Player1")
            .withArgs(await this.bob.getAddress(), 0, 1, ethers.utils.parseEther("0.1"))
    })

    it("Test for event 'Player2'", async function () {
        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})

        const connectedContract = await this.tictac.connect(this.misha)

        await expect(connectedContract.join(0, {value: ethers.utils.parseEther("0.2")}))
            .to.emit(this.tictac, "Player2")
            .withArgs(await this.misha.getAddress(), 0, 1, ethers.utils.parseEther("0.2"))
    })

    it("Test for event 'Move'", async function () {
        await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(0, {value: ethers.utils.parseEther("0.1")})

        const move = await this.tictac.connect(this.bob).move(0, 1, 0)

        await expect(move)
            .to.emit(this.tictac, "Move")
            .withArgs(await this.bob.getAddress(), 0, 1)
    })

    it("Test for event 'GameFinished'", async function () {
        await this.tictac.connect(this.bob).createGame(10, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(0, {value: ethers.utils.parseEther("0.1")})

        await this.tictac.connect(this.bob).move(0, 1, 0)
        await this.tictac.connect(this.misha).move(3, 2, 0)
        await this.tictac.connect(this.bob).move(1, 1, 0)
        await this.tictac.connect(this.misha).move(6, 2, 0)
        await this.tictac.connect(this.bob).move(2, 1, 0)

        let win = await this.tictac.connect(this.bob).gameFinished(0, 1)

        await expect(win)
            .to.emit(this.tictac, "GameFinished")
            .withArgs(await this.bob.getAddress(), 0)
    })

    it("withdraw", async function () {
        await this.tictac.connect(this.bob).createGame(10, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(0, { value: ethers.utils.parseEther("0.1") })

        await this.tictac.connect(this.bob).move(0, 1, 0)
        await this.tictac.connect(this.misha).move(3, 2, 0)
        await this.tictac.connect(this.bob).move(1, 1, 0)
        await this.tictac.connect(this.misha).move(6, 2, 0)
        await this.tictac.connect(this.bob).move(2, 1, 0)

        await this.tictac.connect(this.bob).gameFinished(0, 1)
        await this.tictac.connect(this.bob).pickUpTheWinnings(0)

        await this.tictac.connect(this.bob).withdraw(this.wallet.address)

        expect(await this.wallet.getBalance()).to.equal(ethers.utils.parseEther("0.02"))
        
        await this.tictac.connect(this.bob).createGame(10, { value: ethers.utils.parseEther("0.1") })

        increase(duration.minutes("4320"))

        await expect(this.tictac.connect(this.misha).withdraw(this.wallet.address)).to.be.revertedWith("Invalid address")
        await this.tictac.connect(this.bob).pickUpTheWinnings(1)

        await this.tictac.connect(this.bob).withdraw(this.wallet.address)

        expect(await this.wallet.getBalance()).to.equal(ethers.utils.parseEther("0.02").add(ethers.utils.parseEther("0.01")))

        let message = ethers.utils.solidityKeccak256(
            [
                "uint256",
                "uint256",
                "address",
            ],
            [
                ethers.utils.parseEther("0.01"),
                2,
                this.bob.address,
            ]
        )
        let bytesArray = ethers.utils.arrayify(message);
        let realSignature = await this.bob.signMessage(bytesArray)
        await this.wallet.connect(this.bob).approveWithdraw(ethers.utils.parseEther("0.01"), 2, realSignature)

        message = ethers.utils.solidityKeccak256(
            [
                "uint256",
                "uint256",
                "address",
            ],
            [
                ethers.utils.parseEther("0.01"),
                2,
                this.misha.address,
            ]
        )
        bytesArray = ethers.utils.arrayify(message);
        realSignature = await this.misha.signMessage(bytesArray)
        await this.wallet.connect(this.misha).approveWithdraw(ethers.utils.parseEther("0.01"), 2, realSignature)
        await this.wallet.connect(this.misha).withdraw(ethers.utils.parseEther("0.01"), this.bob.address)

        expect(await this.wallet.getBalance()).to.equal(ethers.utils.parseEther("0.02"))
    })

    it("pickUpTheWinnings", async function () {
        let bobBalance = await ethers.provider.getBalance(this.bob.address)

        let create = await this.tictac.connect(this.bob).createGame(10, {value: ethers.utils.parseEther("0.1")})
        await this.tictac.connect(this.misha).join(0, { value: ethers.utils.parseEther("0.1") })
        let pick = await this.tictac.connect(this.bob).pickUpTheWinnings(0)

        let waitCreate = await create.wait()
        let feeCreate = waitCreate.effectiveGasPrice.mul(waitCreate.cumulativeGasUsed)
        let waitPick = await pick.wait()
        let feePick = waitPick.effectiveGasPrice.mul(waitPick.cumulativeGasUsed)

        expect(await ethers.provider.getBalance(this.bob.address)).to.equal(bobBalance
            .sub(ethers.utils.parseEther("0.1"))
            .sub(feePick)
            .sub(feeCreate))
        
        
        bobBalance = await ethers.provider.getBalance(this.bob.address)

        let move1 = await this.tictac.connect(this.bob).move(0, 1, 0)
        await this.tictac.connect(this.misha).move(3, 2, 0)
        let move2 = await this.tictac.connect(this.bob).move(1, 1, 0)
        await this.tictac.connect(this.misha).move(6, 2, 0)
        let move3 = await this.tictac.connect(this.bob).move(2, 1, 0)

        let finish = await this.tictac.connect(this.bob).gameFinished(0, 1)

        await expect(this.tictac.connect(this.misha).pickUpTheWinnings(0)).to.be.revertedWith("youAreNotWinner()")

        let pick1 = await this.tictac.connect(this.bob).pickUpTheWinnings(0)  

        move1 = await move1.wait()
        move2 = await move2.wait()
        move3 = await move3.wait()
        pick1 = await pick1.wait()
        finish = await finish.wait()

        move1 = move1.effectiveGasPrice.mul(move1.cumulativeGasUsed)
        move2 = move2.effectiveGasPrice.mul(move2.cumulativeGasUsed)
        move3 = move3.effectiveGasPrice.mul(move3.cumulativeGasUsed)
        pick1 = pick1.effectiveGasPrice.mul(pick1.cumulativeGasUsed)
        finish = finish.effectiveGasPrice.mul(finish.cumulativeGasUsed)

        expect(await ethers.provider.getBalance(this.bob.address)).to.equal(bobBalance
            .add(ethers.utils.parseEther("0.18"))
            .sub(move1)
            .sub(move2)
            .sub(move3)
            .sub(pick1)
            .sub(finish))
        
        bobBalance = await ethers.provider.getBalance(this.bob.address)
        
        create = await this.tictac.connect(this.bob).createGame(10, { value: ethers.utils.parseEther("0.1") })
        waitCreate = await create.wait()
        feeCreate = waitCreate.effectiveGasPrice.mul(waitCreate.cumulativeGasUsed)

        increase(duration.minutes("4320"))

        pick1 = await this.tictac.connect(this.bob).pickUpTheWinnings(1)
        pick1 = await pick1.wait()
        pick1 = pick1.effectiveGasPrice.mul(pick1.cumulativeGasUsed)

        expect(await ethers.provider.getBalance(this.bob.address)).to.equal(bobBalance
            .sub(ethers.utils.parseEther("0.01"))
            .sub(feeCreate)
            .sub(pick1))

    }) 

    it("Test for event 'Status'", async function () {
        let create = await this.tictac.connect(this.bob).createGame(1, {value: ethers.utils.parseEther("0.1")})

        await expect(create)
            .to.emit(this.tictac, "Status")
            .withArgs(0, 1)
        
        let join = await this.tictac.connect(this.misha).join(0, { value: ethers.utils.parseEther("0.1") })
        
        await expect(join)
            .to.emit(this.tictac, "Status")
            .withArgs(0, 3)
    })

    it("comisionChang", async function () {
        await this.tictac.connect(this.bob).comisionChang(20)

        await expect(this.tictac.connect(this.misha).comisionChang(20)).to.be.revertedWith("Invalid address")
    })
})
