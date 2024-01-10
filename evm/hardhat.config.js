require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    conduit: {
      url: "https://l1-charming-salmon-swordfish-5erk8fvo2s.t.conduit.xyz",
      chainId: 900,
      accounts: [
        "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      ],
    },
    localnet: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
      accounts: [
        "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0",
      ],
    },
  },
};