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

task("join", "Join the game")
    .addParam("contract", "address")
    .addParam("id", "Id of the game")
    .addParam("eth", "Bid")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.join(taskArgs.id, {value: hre.ethers.utils.parseEther(String(taskArgs.eth))})

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

task("withdraw", "Withdraws the commission to the wallet")
    .addParam("contract", "address")
    .addParam("id", "Id of the game")
    .addParam("wallet", "Wallet address")
    .setAction(async (taskArgs, hre) => {
        const tictac = await hre.ethers.getContractAt("TicTacToeGame", taskArgs.contract)

        await tictac.withdraw(taskArgs.id, taskArgs.wallet)

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