// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title Wallet
 * @author Anton Malko
 * @notice Wallet with confirmation of two addresses
 * @dev All function calls are currently implemented without side effects
 */
contract Wallet {
    using ECDSA for bytes32;
    address holder1;
    address holder2;
    bool locked1 = true;
    bool locked2 = true;
    uint256 balances;

    constructor(address _holder1, address _holder2) {
        holder1 = _holder1;
        holder2 = _holder2;
    }

    receive() external payable {}

    fallback() external payable {}

    /**
     * @notice This feature replenishes the player's balance
     * @param _amount Amount of ether to be transferred
     * @param _add address contract with token ERC20
     * @param _from Sender's address
     */
    function refill(uint256 _amount, address _add, address _from) external {
        require(msg.sender == holder1 || msg.sender == holder2, "Invalid address");
        require(_amount < 1e60, "Invalid amount");

        IERC20(_add).transferFrom(_from, address(this), _amount);
        balances += _amount;
    }

    /**
     * @notice This function executes a transaction with ERC20
     * @dev Inside the function there is a check that checks who is calling the function.
     * and also checks if all addresses confirmed the transaction
     * @param _amount Amount of ether to be transferred
     * @param _add address contract with token ERC20
     */
    function withdrawERC20(uint256 _amount, address _add) external {
        require(msg.sender == holder1 || msg.sender == holder2, "Invalid address");

        if (locked1 == false && locked2 == false) {
            balances -= _amount;
            IERC20(_add).transfer(msg.sender, _amount);
        } else {
            revert("Invalid locked");
        }
    }

    /**
     * @notice This function confirms the execution of a transaction
     * @dev Inside the function there is a check that checks who is calling the function.
     * @param _amount Amount of ether to be transferred
     * @param _nonce Nonce transaction number
     * @param _signature Signature of one of the owners
     */
    function approveWithdraw(uint256 _amount, uint256 _nonce, bytes memory _signature) external returns (bool) {
        require(msg.sender == holder1 || msg.sender == holder2, "Invalid address");

        bytes32 data = keccak256(abi.encodePacked(_amount, _nonce, msg.sender));

        if (msg.sender == holder1) {
             if (_verify(data, holder1, _signature)) {
                locked1 = false;

                return true;
            }
        } else if (msg.sender == holder2) {
            if (_verify(data, holder2, _signature)) {
                locked2 = false;

                return true;
            }
        }

        return false;
    }

    /**
     * @notice This function executes a transaction
     * @dev Inside the function there is a check that checks who is calling the function.
     * and also checks if all addresses confirmed the transaction
     * @param _amount Amount of ether to be transferred
     * @param _to Address to transfer
     */
    function withdraw(uint256 _amount, address payable _to) external {
        require(msg.sender == holder1 || msg.sender == holder2, "Invalid address");

        if (locked1 == false && locked2 == false) {
            _to.transfer(_amount);
        } else {
            revert("Invalid locked");
        }
    }

    /**
     * @notice Returns wallet balance
     */
    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    /**
     * @notice Returns wallet balance ERC20
     */
    function getBalanceERC20() external view returns (uint) {
        return balances;
    }

    /**
     * @notice This function signs the data
     * @dev Function is internal
     * @param _account The address of the signer
     * @param _data The data that is signed
     * @param _signature Signature of one of the owners
     */
    function _verify(bytes32 _data, address _account, bytes memory _signature)internal pure returns (bool) {
        return _data.toEthSignedMessageHash().recover(_signature) == _account;
    }

}