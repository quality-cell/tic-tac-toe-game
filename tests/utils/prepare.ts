import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers, upgrades } from "hardhat"
import { TicTacToeGame__factory } from "../../build/typechain"
import { TicTacToeGameV2__factory } from "../../build/typechain"

export async function prepareSigners(thisObject: Mocha.Context) {
    thisObject.signers = await ethers.getSigners()
    thisObject.owner = thisObject.signers[0]
    thisObject.alice = thisObject.signers[1]
    thisObject.bob = thisObject.signers[2]
    thisObject.carol = thisObject.signers[3]
    thisObject.anton = thisObject.signers[4]
    thisObject.misha = thisObject.signers[5]
}

export async function prepareContracts(thisObject: Mocha.Context, signer: SignerWithAddress, signer1: SignerWithAddress) {
    const tokenFactory = await ethers.getContractFactory("ERC20Mock")
    const walletFactory = await ethers.getContractFactory("Wallet")
    const ticTacFactory: TicTacToeGame__factory = await ethers.getContractFactory("TicTacToeGame")
    const TicTacToeGameV2: TicTacToeGameV2__factory = await ethers.getContractFactory("TicTacToeGameV2")

    const token1 = await tokenFactory.connect(signer).deploy("Token1", "TKN1", ethers.utils.parseUnits("100000", 6))
    await token1.deployed()
    thisObject.token1 = token1

    const token2 = await tokenFactory.connect(signer1).deploy("Token1", "TKN1", ethers.utils.parseUnits("100000", 6))
    await token2.deployed()
    thisObject.token2 = token2

    const token3 = await tokenFactory.connect(signer).deploy("Token1", "TKN1", ethers.utils.parseUnits("100000", 6))
    await token3.deployed()
    thisObject.token3 = token3

    const wallet = await walletFactory.connect(signer).deploy(signer.address, signer1.address)
    await wallet.deployed()
    thisObject.wallet = wallet

    const tictac = await upgrades.deployProxy(ticTacFactory.connect(signer), [signer.address, token1.address, wallet.address, "TicTac"], {
        initializer: "initialize"
    })
    await tictac.deployed()
    const tictacv2 = await upgrades.upgradeProxy(tictac.address, TicTacToeGameV2.connect(signer));
    thisObject.tictac = tictacv2

}
