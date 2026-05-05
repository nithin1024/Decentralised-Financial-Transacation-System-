// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    struct Product {
        uint256 id;
        string name;
        string currentStatus;
        address currentHolder;
        uint256 timestamp;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => string[]) public history;
    uint256 public productCount;

    function addProduct(string memory _name) external {
        productCount++;
        products[productCount] = Product(productCount, _name, "Created", msg.sender, block.timestamp);
        history[productCount].push("Created");
    }

    function updateStatus(uint256 _id, string memory _status, address _newHolder) external {
        require(products[_id].id != 0, "Product does not exist");
        require(products[_id].currentHolder == msg.sender, "Only current holder can update");

        products[_id].currentStatus = _status;
        products[_id].currentHolder = _newHolder;
        products[_id].timestamp = block.timestamp;
        
        history[_id].push(_status);
    }

    function trackProduct(uint256 _id) external view returns (string memory, string memory, address, string[] memory) {
        require(products[_id].id != 0, "Product does not exist");
        return (products[_id].name, products[_id].currentStatus, products[_id].currentHolder, history[_id]);
    }
}
