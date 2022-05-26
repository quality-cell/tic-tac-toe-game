import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    console.log(`Deployer: ${deployer}`)

    const owner = '0x0badCBdaE2D2842A59f368dDA474F5c22a9693B7'

    await deploy("TicTacToeGame", {
        args: [owner],
        from: deployer,
        log: true,
    })
}

module.exports.tags = ["TicTac"]
