import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    console.log(`Deployer: ${deployer}`)

    const holder1 = '0x0badCBdaE2D2842A59f368dDA474F5c22a9693B7'
    const holder2 = '0x8f4cd2b41534836e6c803c45a0017576c32a8163'

    await deploy("Wallet", {
        args: [
            holder1,
            holder2
        ],
        from: deployer,
        log: true,
    })
}

module.exports.tags = ["Wallet"]