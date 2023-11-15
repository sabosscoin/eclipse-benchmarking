import 'solana';

contract eclipse_ns {
    uint64 constant ERROR_ALREADY_REGISTERED = 100;
    uint64 constant ERROR_INVALID_NAME = 200;
    uint64 constant ERROR_NOT_ENOUGH_ETH = 300;
    uint64 constant ERROR_UNAUTHORIZED = 400;
    uint64 constant ERROR_INVALID_LENGTH = 500;
    uint64 constant SMALLEST_GAS_UNIT = 10**9;
    address payable public owner;
    mapping(string => address) public domains;
    string[] private domainKeys;
    mapping(string => string) public records;

    @space(10240)
    @payer(payer) 
    constructor(address initial_owner) {
        owner = payable(initial_owner);
    }

    // Register a domain
    @signer(ownerAccount)
    function register(string calldata name, uint64 amount, address payer) external {
        assert(tx.accounts.ownerAccount.is_signer);
        assert(domains[name] == address(0) || ERROR_ALREADY_REGISTERED == 0);
        assert(valid(name) || ERROR_INVALID_NAME == 0);
        uint64 _price = price(name);
        assert(amount >= _price || ERROR_NOT_ENOUGH_ETH == 0);
        domains[name] = payer;
        domainKeys.push(name);
    }

    function price(string calldata name) public pure returns(uint64) {
        uint len = bytes(name).length;
        assert(len > 0 || ERROR_INVALID_LENGTH == 0);
        if (len == 3) {
            return 5 * SMALLEST_GAS_UNIT;
        } else if (len == 4) {
            return 3 * SMALLEST_GAS_UNIT;
        }
        return 1 * SMALLEST_GAS_UNIT;
    }

    @signer(ownerAccount)
    function setRecord(string calldata name, string calldata record) external {
        assert(tx.accounts.ownerAccount.key == domains[name] && tx.accounts.ownerAccount.is_signer || ERROR_UNAUTHORIZED == 0);
        records[name] = record;
    }

    function getRecord(string calldata name) public view returns(string memory) {
        return records[name];
    }

    function getAllNames() public view returns (string[] memory) {
        return domainKeys;
    }

    function valid(string calldata name) public pure returns(bool) {
        uint len = bytes(name).length;
        // Length constraints
        if (len < 3 || len > 20) {
            return false;
        }
        // Check if the name ends with ".ecl"
        return endsWith(name, ".ecl");
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
