// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract EclipseNS {
    uint256 constant ERROR_ALREADY_REGISTERED = 1;
    uint256 constant ERROR_INVALID_NAME = 2;
    uint256 constant ERROR_NOT_ENOUGH_ETH = 3;
    uint256 constant ERROR_UNAUTHORIZED = 4;
    uint256 constant ERROR_INVALID_LENGTH = 5;
    uint256 constant ERROR_WITHDRAW_FAILED = 6;
    uint256 constant SMALLEST_GAS_UNIT = 10**16;
    address payable public owner;
    string public tld;
    mapping(string => address) public domains;
    mapping(string => string) public records;
    string[] private registeredNames;
    constructor(string memory _tld, address initial_owner) {
        owner = payable(initial_owner);
        tld = _tld;
    }
    // Register a domain
    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }
    function register(string calldata name, address payer) external payable {
        require(domains[name] == address(0), "Already registered");
        require(valid(name), "Invalid name");
        uint256 _price = price(name);
        require(msg.value >= _price, "Not enough ETH");
        domains[name] = payer;
        registeredNames.push(name);
    }
    function price(string calldata name) public pure returns(uint256) {
        uint len = bytes(name).length;
        require(len > 0, "Invalid length");
        if (len == 3) {
            return 5 * SMALLEST_GAS_UNIT;
        } else if (len == 4) {
            return 3 * SMALLEST_GAS_UNIT;
        } else {
            return 1 * SMALLEST_GAS_UNIT;
        }
    }
    function setRecord(string calldata name, string calldata record) external {
        require(domains[name] == msg.sender, "Unauthorized");
        records[name] = record;
    }
    function getRecord(string calldata name) public view returns(string memory) {
        return records[name];
    }
    function getAllNames() public view returns (string[] memory) {
        return registeredNames;
    }
    function isOwner(address account) public view returns (bool) {
        return account == owner;
    }
    function valid(string calldata name) public pure returns(bool) {
        uint len = bytes(name).length;
        // Length constraints
        if (len < 3 || len > 20) {
            return false;
        }
        // Check if the name ends with ".eclipse"
        return endsWith(name, ".eclipse");
    }
    // Suffix test
    function endsWith(string memory str, string memory suffix) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory suffixBytes = bytes(suffix);
        if (strBytes.length < suffixBytes.length) {
            return false;
        }
        uint suffixStartIndex = strBytes.length - suffixBytes.length;
        for (uint i = 0; i < suffixBytes.length; i++) {
            if (strBytes[i + suffixStartIndex] != suffixBytes[i]) {
                return false;
            }
        }
        return true;
    }
}