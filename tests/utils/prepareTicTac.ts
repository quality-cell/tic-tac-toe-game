import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"

export async function prepareSigners(thisObject: Mocha.Context) {
    thisObject.signers = await ethers.getSigners()
    thisObject.bob = thisObject.signers[0]
    thisObject.misha = thisObject.signers[1]
    thisObject.anton = thisObject.signers[2]
}

export async function prepareTicTac(thisObject: Mocha.Context, signer: SignerWithAddress) {
    const Factory = await ethers.getContractFactory("TicTacToeGame")
    const tictac = await Factory.connect(signer).deploy(signer.address)
    await tictac.deployed()
    thisObject.tictac = tictac
}
