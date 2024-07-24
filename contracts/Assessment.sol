// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    mapping(string => uint256) public items;
    uint256 public itemPrice = 0 ether; 

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event ItemAdded(string itemName, uint256 quantity);
    event ItemRedeemed(string itemName, uint256 quantity);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable onlyOwner {
        uint256 _previousBalance = balance;

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public onlyOwner {
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function addItem(string memory _itemName, uint256 _quantity) public onlyOwner {
        uint256 cost = itemPrice * _quantity;
        require(balance >= cost, "Insufficient balance to add items");

        items[_itemName] += _quantity;
        balance -= cost;

        // emit the event
        emit ItemAdded(_itemName, _quantity);
    }

    function redeemItem(string memory _itemName, uint256 _quantity) public {
        require(items[_itemName] >= _quantity, "Not enough items in stock");

        items[_itemName] -= _quantity;

        // emit the event
        emit ItemRedeemed(_itemName, _quantity);
    }

    function transferOwnership(address payable _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner address is zero address");
        
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}
