import { HardhatRuntimeEnvironment } from "hardhat/types"
import { TicTacToeGame__factory } from "../build/typechain/factories/TicTacToeGame__factory"
import { TicTacToeGameV2__factory } from "../build/typechain/factories/TicTacToeGameV2__factory"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
  console.log(`ChainId: ${await hre.getChainId()}`)

  const { deployments, getNamedAccounts, ethers, upgrades } = hre
  const { deploy } = deployments
  const { deployProxy } = upgrades
  const { upgradeProxy } = upgrades

  const { deployer } = await getNamedAccounts()
  const balance = await ethers.provider.getBalance(deployer)

  console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

  //deploy ERC20Mock
  const name = 'ERC20Mock'
  const symbol = 'ERC'
  const totalSupply = 100000000000

  const erc20Mock = await deploy('ERC20Mock', {
      args: [
          name,
          symbol,
          totalSupply
      ],
      from: deployer,
      log: true,
  });

  //deploy Wallet
  const signer = await ethers.getSigners()
  const holder1 = signer[0].address
  const holder2 = signer[1].address

  console.log(`Holder1: ${holder1}, Holder2: ${holder2}`)

  const wallet = await deploy("Wallet", {
      args: [
          holder1,
          holder2
      ],
      from: deployer,
      log: true,
  })

  //deploy TicTacToeGame
  const TicTacToeGame: TicTacToeGame__factory = await ethers.getContractFactory("TicTacToeGame")

  const owner = await ethers.provider._getAddress(deployer)
  const ERC20Mock = erc20Mock.address
  const Wallet = wallet.address

  const tictac = await deployProxy(TicTacToeGame, [owner, ERC20Mock, Wallet, "TicTacToeGame"], {
    initializer: "initialize" 
  })
  await tictac.deployed()

  console.log("TicTacToeGame deployed", tictac.address)

 //upgrade TicTacToeGameV2
  const TicTacToeGameV2: TicTacToeGameV2__factory= await ethers.getContractFactory("TicTacToeGameV2")
  await upgradeProxy(tictac.address, TicTacToeGameV2);

  console.log("TicTacToeGame upgrade")

}

module.exports.tags = ["deploy"]
