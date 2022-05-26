# Tic-Tac-Toe Game

Etherscan: https://rinkeby.etherscan.io/address/0x99bfca09E7b85965661921e3069fC07a1B12aFa8#code
Etherscan: https://rinkeby.etherscan.io/address/0xde1FE614d04a49Dc2231feBf555Fc9Cc3A9485A1#code
Etherscan: https://rinkeby.etherscan.io/address/0xAAA752c45383eEEEDAa09E0981C85A3Df338F0A2#code
Basic implementation of the game tic-tac-toe with test.

## This project has the following features

- Create a game
- Join the game
- Finish the game
- Check if the opponent has run out of time for a move
- Get player and game statistics
- Betting
- Withdraw winnings

## run Tests

npx hardhat test

## deloy ropsten

npm run deploy:ropsten:new

## verify (Instead of brackets, insert what you need !!)

npx hardhat verify --network ropsten (address contract)

## Running tasks (Instead of brackets, insert what you need !!)

npx hardhat create --network ropsten --contract (address contract) --time (waiting time)

npx hardhat join --network ropsten --contract (address contract) --id (Id of the game)

npx hardhat move --network ropsten --contract (address contract) --cell (The number of the cell) --tictac (The element that the player walks) --id (Id of the game)

npx hardhat finished --network ropsten --contract (address contract) --id (Id of the game) --tictac (The element that the player walks)

npx hardhat time --network ropsten --contract (address contract) --id (Id of the game)

npx hardhat getStatPlayer --network ropsten --contract (address contract)

npx hardhat getStatGame --network ropsten --contract (address contract) --id (Id of the game)

npx hardhat pickUpTheWinnings --network ropsten --contract (address contract) --id (Id of the game)

npx hardhat withdraw --network ropsten --contract (address contract) --id (Id of the game) --wallet (Wallet address)

npx hardhat comisionChang --network ropsten --contract (address contract) --fee (Game Commission)

npx hardhat approveERC --network ropsten --contract (address contract) --amount (Amount of ether to be transferred) --address (Owner's address) --mul (ten to the power)

npx hardhat approve --network ropsten --contract (address contract) --amount (Amount of ether to be transferred) --address (Owner's address) --nonce (Nonce transaction numbe)

npx hardhat withdrawETH --network ropsten --contract (address contract) --amount (Amount of ether to be transferred) --address (Owner's address)

npx hardhat withdrawETH --network ropsten --contract (address contract)



