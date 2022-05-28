# Tic-Tac-Toe Game

Etherscan: https://rinkeby.etherscan.io/address/0xB63c88436b0c9c1a7efD60c87Bd95570c768A4b3#code                                                                        
Etherscan: https://rinkeby.etherscan.io/address/0xB23E2494B18dCed9801Cdc5F5E9f5668Ef0EFA1B#code                                                                         
Etherscan: https://rinkeby.etherscan.io/address/0xAAA752c45383eEEEDAa09E0981C85A3Df338F0A2#code                                                                         
Tic-tac-toe game with the ability to place bets with test.

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

npx hardhat create --network ropsten --contract (address contract) --time (waiting time) --eth (bid)

npx hardhat join --network ropsten --contract (address contract) --id (Id of the game) --eth (bid)

npx hardhat move --network ropsten --contract (address contract) --cell (The number of the cell) --tictac (The element that the player walks) --id (Id of the game)

npx hardhat finished --network ropsten --contract (address contract) --id (Id of the game) --tictac (The element that the player walks)

npx hardhat time --network ropsten --contract (address contract) --id (Id of the game)

npx hardhat getStatPlayer --network ropsten --contract (address contract)

npx hardhat getStatGame --network ropsten --contract (address contract) --id (Id of the game)

npx hardhat pickUpTheWinnings --network ropsten --contract (address contract) --id (Id of the game)

npx hardhat pickUpTheWinningsERC20 --network ropsten --contract (address contract) --id (Id of the game)

npx hardhat withdraw --network ropsten --contract (address contract) --id (Id of the game) --wallet (Wallet address)

npx hardhat comisionChang --network ropsten --contract (address contract) --fee (Game Commission)

npx hardhat approveERC --network ropsten --contract (address contract) --amount (Amount of ether to be transferred) --address (Owner's address) --mul (ten to the power)

npx hardhat approve --network ropsten --contract (address contract) --amount (Amount of ether to be transferred) --address (Owner's address) --nonce (Nonce transaction numbe)

npx hardhat withdrawETH --network ropsten --contract (address contract) --amount (Amount of ether to be transferred) --address (Owner's address)

npx hardhat withdrawComission --network ropsten --contract (address contract) --wallet (Wallet address)

npx hardhat createERC20 --network ropsten --contract (address contract) --time (waiting time) --erc (bid)

npx hardhat joinERC20 --network ropsten --contract (address contract) --id (Id of the game) --erc (bid)

npx hardhat refill --network ropsten --contract (address contract) --amount (Amount of ether to be transferred) --address (Owner's address)

npx hardhat withdrawComissionERC20 --network ropsten --contract (address contract) --wallet (Wallet address) --add (Address contract with token ERC20)

npx hardhat balancePlayer --network ropsten --contract (address contract)

npx hardhat balanceComissionERC20 --network ropsten --contract (address contract)

npx hardhat balanceComission --network ropsten --contract (address contract)

npx hardhat getBalance --network ropsten --contract (address contract)

npx hardhat refillWallet --network ropsten --contract (address contract) --amount (Amount of ether to be transferred) --address (Owner's address) --from (Sender's address)

npx hardhat withdrawETH --network ropsten --contract (address contract) --amount (Amount of ether to be transferred) --address (Owner's address)

npx hardhat getBalanceERC20 --network ropsten --contract (address contract)



