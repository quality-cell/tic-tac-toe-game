import { task } from "hardhat/config"

task("approve", "Transaction confirmation")
    .addParam("contract", "Сontract address")
    .addParam("amount", "Amount of ether to be transferred")
    .addParam("nonce", "Nonce transaction number")
    .addParam("address", "Owner's address")
    .setAction(async (taskArgs, hre) => {
        const wallet = await hre.ethers.getContractAt("Wallet", taskArgs.contract)
        let message = hre.ethers.utils.solidityKeccak256(
            [
                "uint256",
                "uint256",
                "address",
            ],
            [
                taskArgs.amount,
                taskArgs.nonce,
                taskArgs.address,
            ]
        )
        let bytesArray = hre.ethers.utils.arrayify(message);
        let realSignature = await taskArgs.address.signMessage(bytesArray)

        await wallet.approveWithdraw(taskArgs.amount, taskArgs.nonce, realSignature)

        console.log("Task is done")
})

task("withdrawETH", "Transaction execution")
    .addParam("contract", "Сontract address")
    .addParam("amount", "Amount of ether to be transferred")
    .addParam("address", "Address to transfer")
    .setAction(async (taskArgs, hre) => {
        const wallet = await hre.ethers.getContractAt("Wallet", taskArgs.contract)

        await wallet.withdraw(taskArgs.amount, taskArgs.address)

        console.log("Task is done")
})

task("getBalance", "Transaction execution")
    .addParam("contract", "Сontract address")
    .setAction(async (taskArgs, hre) => {
        const wallet = await hre.ethers.getContractAt("Wallet", taskArgs.contract)

        const balance = await wallet.getBalance()

        console.log(balance)
})