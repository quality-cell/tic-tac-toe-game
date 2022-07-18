// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

/**
 * @title Tic-tac-toe game version 2.0
 * @author Anton Malko
 * @notice Achievements added
 */
contract TicTacToeGameV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable{
    uint256 public id;
    uint256 public period;
    uint256 public percent;
    address ownerAddress;
    uint256 private comission;
    uint256 private comissionERC20;
    address addErc20Mock;
    address addWallet;
    string name;

    enum TicTac {
        no,
        zero,
        cross
    }

    enum GameStatus {
        no,
        created,
        createdERC20,
        started,
        finished
    }

    struct Game {
        GameStatus status;
        address winner;
        uint256 deadline;
        uint256 timer;
        uint256 amount;
        uint256 comision;
        uint256 lastMove;
        address player1;
        address player2;
        uint256 countMove;
        address lastPlayer;
        TicTac[9] fields;
        bool erc20;
    }

    struct Player {
        uint256 all;
        uint256 win;
        uint256 los;
    }

    struct Achievement {
        bool winner;
        bool creator;
    }

    error invalidStatus();
    error invalidAddress();
    error invalidCellOrTicTac();
    error yourTimeIsUp();
    error notYourElement();
    error youAreNotWinner();

    mapping(uint256 => Game) public games;
    mapping(address => Player) private players;
    mapping(address => uint256) private balance;
    mapping(address => Achievement) private achievements;

    /**
     * @notice This event contains the data entered by the user, his address and game id
     * @dev Called in the createGame function
     * @param player1 Address of the player who created the game
     * @param id Id of the game created by player 1
     * @param timer The time it takes to make a move
     */
    event Player1(
        address indexed player1, 
        uint256 indexed id, 
        uint256 timer,
        uint256 amount
    );

    /**
     * @notice This event contains the data of the game the player is joining and their address.
     * @dev Called in the join function
     * @param player2 The address of the player who joined the game
     * @param id Id of the game
     * @param timer The time it takes to make a move
     */
    event Player2(
        address indexed player2, 
        uint256 indexed id, 
        uint256 timer,
        uint256 amount
    );

    /**
     * @notice This event contains the data entered by the user and his address
     * @dev Called in the move function
     * @param player The address of the player who makes the move
     * @param cell The number of the cell that the player goes to
     * @param tictac The element that the player walks
     */
    event Move(
        address indexed player, 
        uint256 indexed cell, 
        TicTac tictac
    );

    /**
     * @notice This event contains the address of the player who won the game
     * @dev Called in the gameWin, timeIsUp function
     * @param win The address of the player who won the game
     * @param id Id of the game
     */
    event GameFinished(
        address indexed win, 
        uint256 indexed id
    );

    /**
     * @notice This event contains the game id and its status
     * @dev Called in the createGame, createGameERC20, join, joinERC20, changeStat function
     * @param id Id of the game
     * @param status The amount of funds transferred
     */
    event Status(
        uint256 indexed id, 
        GameStatus indexed status
    );

    /**
     * @notice This event contains the address of the player and the status of his achievements.
     * @dev Called in the addAchievement function
     * @param player Address of the player
     * @param winner Achievement that is awarded if the user has 100 wins
     * @param creator Achievement that is awarded if the player created the game
     */
    event Achievements(
        address indexed player,  
        bool winner,
        bool creator
    );

    modifier atStatus(uint256 _id, GameStatus _status) {
        Game storage game = games[_id];

        if (game.status != _status) {
            revert invalidStatus();
        }

        _;
    }

    modifier addressPlayer(uint256 _id, address _player) {
        if (_player != games[_id].player1) {
            if (_player != games[_id].player2) {
                revert invalidAddress();
            }
        }

        _;
    }

    modifier timeWait(uint256 _id) {
        if ((block.timestamp - games[_id].lastMove) / 1 minutes > games[_id].timer) {
            revert yourTimeIsUp();
        }

        _;

        games[_id].lastMove = block.timestamp;
    }

    modifier element(uint256 _id, address _player, TicTac _tictac) {
        if (_player == games[_id].player1 && _tictac == TicTac.cross) {
            revert notYourElement();
        } else if (_player == games[_id].player2 && _tictac == TicTac.zero) {
                revert notYourElement();
        }

        _;
    }

    /**
     * @notice A function that acts as a constructor
     * @param _owner Owner's address
     * @param _addErc20Mock contract address ERC20Mock
     * @param _addWallet contract address Wallet
     */
    function initialize(address _owner, address _addErc20Mock, address _addWallet, string memory _name) 
        public 
        initializer
    {
        ownerAddress = _owner;
        addErc20Mock = _addErc20Mock;
        addWallet = _addWallet;
        id = 0;
        period = 2 days;
        percent = 10;
        name = _name;

        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    /**
     * @notice This feature replenishes the player's balance
     * @param _amount Amount of ether to be transferred
     */
    function refill(uint256 _amount) external {
        require(_amount < 1e60, "Invalid amount");

        IERC20(addErc20Mock).transferFrom(msg.sender, address(this), _amount);
        balance[msg.sender] += _amount;
    }

    /**
     * @notice This function creates a game with ERC20
     * @dev You can set the waiting time the same for all
     * @param _timeWait The time it takes to make a move
     * @param _amount Number of tokens to transfer
     */
    function createGameERC20(uint256 _timeWait, uint256 _amount) external {
        require(balance[msg.sender] >= _amount && _amount > 0, "Invalid balance");

        Game storage game = games[id];

        game.status = GameStatus.createdERC20;
        game.player1 = msg.sender;
        game.timer = _timeWait;
        balance[msg.sender] -= _amount;
        game.amount += _amount;
        game.deadline = block.timestamp + period;
        game.comision = game.amount * percent / 100;
        game.erc20 = true;

        id++;

        emit Player1(
            game.player1, 
            id - 1, 
            game.timer,
            game.amount
        );

        emit Status(
            id - 1,
            game.status
        );
    }

    /**
     * @notice This function creates a game
     * @dev You can set the waiting time the same for all
     * @param _timeWait The time it takes to make a move
     */
    function createGame(uint256 _timeWait) external payable {
        require(msg.value > 0.001 ether, "Insufficient funds");
        
        Game storage game = games[id];

        game.status = GameStatus.created;
        game.player1 = msg.sender;
        game.timer = _timeWait;
        game.amount += msg.value;
        game.deadline = block.timestamp + period;
        game.comision = game.amount * percent / 100;

        id++;

        emit Player1(
            game.player1, 
            id - 1, 
            game.timer,
            game.amount
        );

        emit Status(
            id - 1,
            game.status
        );
    }

    /**
     * @notice This function allows another player to join the game with ERC20
     * @dev There is a modifier that checks that the game has already been created,
     * also inside the function there is a check that the player
     * who joins is not the player who created the game
     * @param _id Id of the game created by player 1
     * @param _amount Number of tokens to transfer
     */
    function joinERC20(uint256 _id, uint256 _amount) 
        external 
        atStatus(_id, GameStatus.createdERC20) 
    {
       require(balance[msg.sender] >= _amount && _amount > 0, "Invalid balance");
        if (msg.sender == games[_id].player1) {
            revert invalidAddress();
        }

        Game storage game = games[_id];

        game.player2 = msg.sender;
        game.status = GameStatus.started;
        game.lastMove = block.timestamp;
        game.lastPlayer = game.player2;
        balance[msg.sender] -= _amount;
        game.amount += _amount;
        game.comision = game.amount * percent / 100;

        emit Player2(
            game.player2, 
            _id, 
            game.timer,
            _amount
        );

        emit Status(
            _id,
            game.status
        );
    }

    /**
     * @notice This function allows another player to join the game
     * @dev There is a modifier that checks that the game has already been created,
     * also inside the function there is a check that the player
     * who joins is not the player who created the game
     * @param _id Id of the game created by player 1
     */
    function join(uint256 _id) 
        external 
        payable
        atStatus(_id, GameStatus.created) 
    {
        require(msg.value > 0.001 ether, "Insufficient funds");
        if (msg.sender == games[_id].player1) {
            revert invalidAddress();
        }

        Game storage game = games[_id];

        game.player2 = msg.sender;
        game.status = GameStatus.started;
        game.lastMove = block.timestamp;
        game.lastPlayer = game.player2;
        game.amount += msg.value;
        game.comision = game.amount * percent / 100;

        emit Player2(
            game.player2, 
            _id, 
            game.timer,
            msg.value
        );

        emit Status(
            _id,
            game.status
        );
    }

    /**
     * @notice This feature allows players to make a move
     * @dev The first atStatus modifier checks whether the game is running or not.
     * The second modifier addressPlayer checks the address of the one
     * who calls the function and requires that they be equal to the address of the game creator or
     * the address of the one who joined the game.
     * The third timeWait modifier checks if the time allotted for a move has expired.
     * The fourth turn Element modifier determines the element that the player can control.
     * @param _cell The number of the cell that the player goes to
     * @param _tictac The element that the player walks
     * @param _id Id of the game
     */
    function move(uint256 _cell, TicTac _tictac, uint256 _id) 
        external 
        atStatus(_id, GameStatus.started) 
        addressPlayer(_id, msg.sender) 
        timeWait(_id) 
        element(_id, msg.sender, _tictac) 
    {
        require(games[_id].lastPlayer != msg.sender, "Now is not your turn");
        if ((_cell > 8) || (_tictac == TicTac.no) || 
                (games[_id].fields[_cell] != TicTac.no)) {
            revert invalidCellOrTicTac();
        }

        Game storage game = games[_id];

        game.fields[_cell] = _tictac;
        game.lastPlayer = msg.sender;
        game.countMove++;

        emit Move(
            msg.sender, 
            _cell, 
            _tictac
        );
    }

    /**
     * @notice The function ends the game
     * @dev There three are  modifiers, one of them checks that the game is running,
     * and the other checks that the move was made by the player who created the game or joined.
     * The latter checks the entered element assigned to the player.
     * Inside there is a check for a draw
     * @param _id Id of the game
     * @param _tictac The element that the player walks
     */
    function gameFinished(uint256 _id, TicTac _tictac) 
        external 
        atStatus(_id, GameStatus.started) 
        addressPlayer(_id, msg.sender) 
        element(_id, msg.sender, _tictac) 
    {
        Game storage game = games[_id];
        
        win(game, _tictac, _id);        
    }

    /**
     * @notice Function that checks if the opponent has run out of the time
     * @dev There are two modifiers, one of them checks that the game is running,
     * and the other checks that the move was made by the player who created the game or joined
     * @param _id Id of the game
     */
    function timeIsUp(uint256 _id) 
        external 
        atStatus(_id, GameStatus.started) 
        addressPlayer(_id, msg.sender) 
    {
        Game storage game = games[_id];

        if (game.lastMove + game.timer < block.timestamp) {
            if (game.lastPlayer == game.player1) {
                changeStat(game.player1, game.player2, _id);

                emit GameFinished(
                    game.winner, 
                    _id
                );
            } else {
                changeStat(game.player2, game.player1, _id);

                emit GameFinished(
                    game.winner, 
                    _id
                );
            }
        }
    }

    /**
     * @notice The function credits the winnings to the balance of the winner in ERC20
     * @dev There is a modifier that checks the address of the one who calls the function
     * Also inside there is a check that checks what the bet was made in
     * @param _id Id of the game
     */
    function pickUpTheWinningsERC20(uint256 _id) 
        external 
        addressPlayer(_id, msg.sender)
    {
        require(games[_id].erc20 == true, "Invalid func");
        
        Game storage game = games[_id];
        uint256 amount = game.amount;

        if(game.status == GameStatus.finished) {
            if(game.winner == msg.sender) {
                game.amount = 0;
                balance[msg.sender] += (amount - game.comision);
            } else {
                revert youAreNotWinner();
            }
        } else if(game.status == GameStatus.createdERC20 && block.timestamp > game.deadline ) {
            game.amount = 0;
            balance[msg.sender] += amount;
        }
    }

    /**
     * @notice The function displays the winnings to the winner
     * @dev There is a modifier that checks the address of the one who calls the function
     * @param _id Id of the game
     */
    function pickUpTheWinnings(uint256 _id) 
        external 
        addressPlayer(_id, msg.sender)
    {
        require(games[_id].erc20 != true, "Invalid func");

        Game storage game = games[_id];
        uint256 amount = game.amount;

        if(game.status == GameStatus.finished) {
            if(games[_id].winner == msg.sender) {
                game.amount = 0;

                payable(msg.sender).transfer(amount - game.comision);
            } else {
                revert youAreNotWinner();
            }
        } else if(game.status == GameStatus.created && block.timestamp > game.deadline ) {
            game.amount = 0;

            payable(msg.sender).transfer(amount);
        }
    }

    /**
     * @notice This function outputs ERC20
     * @param _amount Amount of tokens to be transferred
     * @param _add address contract with token ERC20
     */
    function withdrawERC20(uint256 _amount, address _add) 
        external 
    {
        require(balance[msg.sender] >= _amount,"Invalid balance");

        balance[msg.sender] -= _amount;
        IERC20(_add).transfer(msg.sender, _amount);
    }

    /**
     * @notice This function withdraws the commission to the wallet
     * @dev The function can only be called by the owner of the contract
     */
    function withdraw() 
        external 
    {
        require(msg.sender == ownerAddress, "Invalid address");
        uint256 amount = comission;
        comission = 0;

        payable(addWallet).transfer(amount);
    }

    /**
     * @notice This function withdraws the commission ERC20 to the wallet
     * @dev The function can only be called by the owner of the contract
     */
    function withdrawComissionERC20() 
        external 
    {
        require(msg.sender == ownerAddress, "Invalid address");
        uint256 amount = comissionERC20;
        comissionERC20 = 0;

        IERC20(addErc20Mock).approve(addWallet, amount);
    }

    /**
     * @notice This function changes the commission percentage
     * @dev The function can only be called by the owner of the contract
     * @param _fee Game Commission
     * @param _v Includes a chain identifier as specified in EIP-155.
     * @param _r Contains bytes 0....64
     * @param _s Contains bytes 64....128
     */
    function comisionChang(uint256 _fee, uint8 _v, bytes32 _r, bytes32 _s) 
        external 
    {
        require(ownerAddress == verify(hash(_fee), _v, _r, _s), "Invalid address");
        
        percent = _fee;
    }

    /**
     * @notice This function changes statistics
     * @dev The function is internal
     * @param _winner Winner's address
     * @param _loser Loser's address
     * @param _id Id of the game
     */
    function changeStat(address _winner, address _loser, uint256 _id) internal {
        Game storage game = games[_id];
        Player storage player1 = players[_winner];
        Player storage player2 = players[_loser];

        player1.win++;
        player2.los++;
        player1.all++;
        player2.all++;

        game.winner = game.player1;
        game.status = GameStatus.finished;

        if (game.erc20 == true) {
             comissionERC20 += game.comision;
        } else {
            comission += game.comision;
        }

        emit Status(
            _id,
            game.status
        );
    }

    /**
     * @dev Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
     * {upgradeTo} and {upgradeToAndCall}.
     */
    function _authorizeUpgrade(address _newImplementation) internal override onlyOwner {}

    /**
     * @notice This function checks whether the player has won or not.
     * @dev You can change the algorithm
     * @param _id Id of the game
     * @param _tictac The element that the player walks
     * @param _game Structure that stores game data
     */
    function win(Game storage _game, TicTac _tictac, uint256 _id) internal {
        if ((!winVertically(_game, _tictac) || !winDiagonally(_game, _tictac) || !winHorizontally(_game, _tictac)) && 
                (winVertically(_game, TicTac.cross) || winDiagonally(_game, TicTac.cross) || winHorizontally(_game, TicTac.cross))) {
            changeStat(_game.player2, _game.player1, _id);
            addAchievements(_game.player2, _id);

            emit GameFinished(
                _game.winner, 
                _id
            );
        } else if ((!winVertically(_game, _tictac) || !winDiagonally(_game, _tictac) || !winHorizontally(_game, _tictac)) && 
                (winVertically(_game, TicTac.zero) || winDiagonally(_game, TicTac.zero) || winHorizontally(_game, TicTac.zero))) {
            changeStat(_game.player1, _game.player2, _id);
            addAchievements(_game.player1, _id);

            emit GameFinished(
                _game.winner, 
                _id
            );
        } else if (_game.countMove == 9) {
            Player storage player1 = players[_game.player2];
            Player storage player2 = players[_game.player1];
            player1.all++;
            player2.all++;
            _game.winner = address(0);
            _game.status = GameStatus.finished;

            emit GameFinished(
                _game.winner, 
                _id
            );
        }
    }

    /**
     * @notice The function adds an achievement to the address if the condition is true.
     * @param _id Id of the game
     * @param _player Player's address
     */
    function addAchievements(address _player, uint256 _id) internal {
        Achievement storage achiev = achievements[_player];
        Player storage player = players[_player];
        Game storage game = games[_id];

        if(achiev.winner != true && player.win == 100 ) {
            achiev.winner = true;
        }

        if(achiev.creator != true && game.player1 == _player) {
            achiev.creator = true;
        }

        emit Achievements(
            _player,
            achiev.winner,
            achiev.creator
        );
    }

    /**
     * @notice This function returns achievement statistics
     * @dev Returns a structure Achievement
     * @return All attributes of the Achievement struct
     */
    function getAchievement() 
        external
        view 
        returns (Achievement memory) 
    {
        return achievements[msg.sender];
    }

    /**
     * @notice This function returns player statistics
     * @dev Returns a structure Player
     * @return All attributes of the Player struct
     */
    function getStatPlayer() 
        external
        view 
        returns (Player memory) 
    {
        return players[msg.sender];
    }

    /**
     * @notice Displays commission balance
     * @dev Returns comission
     * @return uint256 Comission
     */
    function getComission() 
        external
        view 
        returns (uint256) 
    {
        require(msg.sender == ownerAddress, "Invalid address");

        return comission;
    }

    /**
     * @notice Displays commission balance ERC20
     * @dev Returns comission ERC20
     * @return uint256 Comission
     */
    function getComissionERC20() 
        external
        view 
        returns (uint256) 
    {
        require(msg.sender == ownerAddress, "Invalid address");

        return comissionERC20;
    }

    /**
     * @notice This function returns the player's balance
     * @return uint256 balance
     */
    function getBalancePlayer() 
        external
        view 
        returns (uint256)
    {
        return balance[msg.sender];
    }

    /**
     * @notice This function returns the statistics of a specific game.
     * @dev Returns a structure Game
     * @param _id Game number for which statistics will be displayed
     * @return All attributes of the Game struct
     */
    function getStatGame(uint256 _id) 
        external 
        view
        returns (Game memory) 
    {
        return games[_id];
    }

    /**
     * @notice This feature checks winning combinations vertically
     * @dev You can change the algorithm for finding the winning combination
     * @param _game Structure that stores game data
     * @param _tictac The element that the player walks
     * @return Boolean Value that indicates the presence of a winning combination
     */
    function winVertically(Game storage _game, TicTac _tictac) 
        internal 
        view 
        returns (bool) 
    {
        if ((_game.fields[0] == _tictac && _game.fields[3] == _tictac && _game.fields[6] == _tictac) ||
                 (_game.fields[1] == _tictac && _game.fields[4] == _tictac && _game.fields[7] == _tictac) || 
                 (_game.fields[2] == _tictac && _game.fields[5] == _tictac && _game.fields[8] == _tictac)) {
            return true;
        }

        return false;
    }

    /**
     * @notice This feature checks winning combinations horizontally
     * @dev You can change the algorithm for finding the winning combination
     * @param _game Structure that stores game data
     * @param _tictac The element that the player walks
     * @return Boolean Value that indicates the presence of a winning combination
     */
    function winHorizontally(Game storage _game, TicTac _tictac) 
        internal 
        view 
        returns (bool) 
    {
        if ((_game.fields[0] == _tictac && _game.fields[1] == _tictac && _game.fields[2] == _tictac) || 
                (_game.fields[3] == _tictac && _game.fields[4] == _tictac && _game.fields[5] == _tictac) || 
                (_game.fields[6] == _tictac && _game.fields[7] == _tictac && _game.fields[8] == _tictac)) {
            return true;
        }

        return false;
    }

    /**
     * @notice This feature checks winning combinations diagonally.
     * @dev You can change the algorithm for finding the winning combination
     * @param _game Structure that stores game data
     * @param _tictac The element that the player walks
     * @return Boolean Value that indicates the presence of a winning combination
     */
    function winDiagonally(Game storage _game, TicTac _tictac) 
        internal 
        view 
        returns (bool) 
    {
        if ((_game.fields[0] == _tictac && _game.fields[4] == _tictac && _game.fields[8] == _tictac) || 
                (_game.fields[2] == _tictac && _game.fields[4] == _tictac && _game.fields[6] == _tictac)) {
            return true;
        }

        return false;
    }

    /**
     * @notice This function hashes the signed data
     * @dev The data that is hashed must match the data that is signed
     * @param _fee Game Commission
     */
    function hash(uint256 _fee) 
        internal 
        view 
        returns (bytes32)
    {
        bytes32 DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,address verifyingContract)");
        bytes32 PERMIT_TYPEHASH = keccak256("Permit(address participant,uint256 value)");
        bytes32 domainSeparator = keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256(bytes(name)), address(this)));
        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, msg.sender, _fee));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));

        return digest;
    }

    /**
     * @notice This function verifies data that has been signed
     * @dev This function will return the address of the person who signed the data, 
     * if the hashed data and the data that was signed are the same, 
     * otherwise it will return either a zero address or some other address different from the signer
     */
    function verify(bytes32 _hash, uint8 _v, bytes32 _r, bytes32 _s)
        internal 
        pure 
        returns (address)
    {
        return ECDSAUpgradeable.recover(_hash, _v, _r, _s);
    }
}