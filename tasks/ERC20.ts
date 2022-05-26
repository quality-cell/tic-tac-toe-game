import { task } from "hardhat/config"

task("approveERC", "Transaction confirmation")
    .addParam("contract", "Сontract address")
    .addParam("amount", "Amount of ether to be transferred")
    .addParam("address", "Owner's address")
    .addParam("mul", "ten to the power")
    .setAction(async (taskArgs, hre) => {
        const erc20 = await hre.ethers.getContractAt("ERC20Mock", taskArgs.contract)
        
        await erc20.approve(taskArgs.address, hre.ethers.utils.parseUnits(String(taskArgs.amount), taskArgs.mul))

        console.log("Task is done")
})

task("transferFrom", "Execution of a transaction")
    .addParam("contract", "Сontract address")
    .addParam("amount", "Amount of ether to be transferred")
    .addParam("address", "Owner's address")
    .addParam("to", "Address to transfer")
    .addParam("mul", "ten to the power")
    .setAction(async (taskArgs, hre) => {
        const erc20 = await hre.ethers.getContractAt("ERC20Mock", taskArgs.contract)
        
        await erc20.transferFrom(taskArgs.address, taskArgs.to, hre.ethers.utils.parseUnits(String(taskArgs.amount), taskArgs.mul))

        console.log("Task is done")
})