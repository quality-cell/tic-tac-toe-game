import { task } from "hardhat/config"

task("create", "Create a game")
    .addParam("contract", "address")
    .addParam("time", "The time it takes to make a move")
    .addParam("eth", "Bid")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.createGame(taskArgs.time, {value: hre.ethers.utils.parseEther(String(taskArgs.eth))})

        console.log("Task is done")
    })

task("createERC20", "Create a game")
    .addParam("contract", "address")
    .addParam("time", "The time it takes to make a move")
    .addParam("erc", "Bid")
    .addParam("power", "ten to the power")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.createGameERC20(taskArgs.time, hre.ethers.utils.parseUnits(String(taskArgs.eth), taskArgs.power))

        console.log("Task is done")
    })

task("join", "Join the game")
    .addParam("contract", "address")
    .addParam("id", "Id of the game")
    .addParam("eth", "Bid")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.join(taskArgs.id, {value: hre.ethers.utils.parseEther(String(taskArgs.eth))})

        console.log("Task is done")
    })

task("joinERC20", "Join the game")
    .addParam("contract", "address")
    .addParam("id", "Id of the game")
    .addParam("erc", "Bid")
    .addParam("power", "ten to the power")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.joinERC20(taskArgs.id, hre.ethers.utils.parseUnits(String(taskArgs.eth), taskArgs.power))

        console.log("Task is done")
    })
task("getStatPlayer", "Get player stats")
    .addParam("contract", "address")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        let player = await tictac.getStatPlayer()

        console.log(player)
    })

task("getStatGame", "Get game statistics")
    .addParam("contract", "address")
    .addParam("id", "Id of the game")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        let game = await tictac.getStatGame(taskArgs.id)

        console.log(game)
    })

task("move", "Make a move")
    .addParam("contract", "address")
    .addParam("cell", "The number of the cell that the player goes to")
    .addParam("tictac", "The element that the player walks")
    .addParam("id", "Id of the game")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.move(taskArgs.cell, taskArgs.tictac, taskArgs.id)

        console.log("Task is done")
    })

task("finished", "Ends the game")
    .addParam("contract", "address")
    .addParam("id", "Id of the game")
    .addParam("tictac", "The element that the player walks")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.gameFinished(taskArgs.id, taskArgs.tictac)

        console.log("Task is done")
    })

task("time", "Checks if the opponent has run out of time")
    .addParam("contract", "address")
    .addParam("id", "Id of the game")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.timeIs(taskArgs.id)

        console.log("Task is done")
    })

task("pickUpTheWinnings", "Withdraw winnings")
    .addParam("contract", "address")
    .addParam("id", "Id of the game")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.pickUpTheWinnings(taskArgs.id)

        console.log("Task is done")
    })

task("pickUpTheWinningsERC20", "Withdraw winnings")
    .addParam("contract", "address")
    .addParam("id", "Id of the game")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.pickUpTheWinningsERC20(taskArgs.id)

        console.log("Task is done")
    })

task("withdrawComission", "Withdraws the commission to the wallet")
    .addParam("contract", "address")
    .addParam("wallet", "Wallet address")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.withdraw(taskArgs.wallet)

        console.log("Task is done")
    })

task("withdrawComissionERC20", "Withdraws the commission ERC20 to the wallet")
    .addParam("contract", "address")
    .addParam("wallet", "Wallet address")
    .addParam("add", "Address contract with token ERC20")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.withdrawComissionERC20(taskArgs.wallet, taskArgs.add)

        console.log("Task is done")
    })

task("withdrawERC20", "This function outputs ERC20")
    .addParam("contract", "address")
    .addParam("amount", "Amount of tokens to be transferred")
    .addParam("add", "Address contract with token ERC20")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.withdrawComissionERC20(taskArgs.amount, taskArgs.add)

        console.log("Task is done")
    })

task("comisionChang", "Changes the commission percentage")
    .addParam("contract", "address")
    .addParam("fee", "Game Commission")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.comisionChang(taskArgs.fee)

        console.log("Task is done")
    })

task("refill", "Replenishes the player's balance")
    .addParam("contract", "address")
    .addParam("address", "Address contract with token ERC20")
    .addParam("amount", "Amount of ether to be transferred")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.refill(taskArgs.amount, taskArgs.address)

        console.log("Task is done")
    })

task("balanceComission", "Commission balance")
    .addParam("contract", "address")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        const balance = await tictac.getComission()

        console.log(balance)
    })

task("balanceComissionERC20", "Commission balance ERC20")
    .addParam("contract", "address")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        const balance = await tictac.getComissionERC20()

        console.log(balance)
    })

 task("balancePlayer", "Player's balance")
    .addParam("contract", "address")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        const balance = await tictac.getBalancePlayer()

        console.log(balance)
    })