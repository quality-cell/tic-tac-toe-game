import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"

export async function prepareSigners(thisObject: Mocha.Context) {
    thisObject.signers = await ethers.getSigners()
    thisObject.bob = thisObject.signers[0]
    thisObject.misha = thisObject.signers[1]
    thisObject.anton = thisObject.signers[2]
}

export async function prepareWallet(thisObject: Mocha.Context, signer1: SignerWithAddress, signer2: SignerWithAddress) {
    const Factory = await ethers.getContractFactory("Wallet")
    const wallet = await Factory.connect(signer1).deploy(signer1.address, signer2.address)
    await wallet.deployed()
    thisObject.wallet = wallet
}
