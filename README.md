# Requirements
* Node version 17
* solc compiler version 0.8.18
* anchor-cli version 0.29.0

# Sanity Checking the EVM Script

```
$ cd evm
$ npm install --dev
$ npx hardhat test test/eclipse-ns.js
```

# Sanity Checking the SVM Script

First, install the Solana CLI and follow the Eclipse faucet instructions: https://docs.eclipse.builders/building-on-eclipse/faucet-instructions

Deploy and test the name service program:
```
$ cd svm
$ yarn
$ anchor build
$ anchor test
```

# Assess the Diff

The EVM and SVM Solidity scripts are not identical, because there are small differences between compiling with solc vs. Solang. Differences include:

- Enforcing that a function is invoked by a particular account
- You must pre-allocate space for contracts
- Assertions are written differently

You should assess the diff yourself with the following command in the root of the repo:
```
$ diff evm/contracts/NameService.sol svm/solidity/NameService.sol 
```

# Run the Benchmark Script

```
$ cd benchmark
$ npm install
```

Before you run the benchmarks, take a look at `diff evm_benchmark.js svm_benchmark.js` to make sure you agree the benchmark is apples-to-apples.

## SVM Benchmark

For the SVM benchmark, you can update the program ID to specify the program that you deployed when testing the SVM name serivce. We assume that your keypair is located in the default location: `~/.config/solana/id.json`

Run the SVM benchmark on Eclipse Devnet:
```
$ node svm_benchmark.js
```

## EVM Benchmark

For the EVM benchmark, you'll have to deploy the script to the EVM chain you'd like to benchmark. We didn't specify a chain because the benchmark will vary by architecture and based on network congestion.

Go into the `evm` directory to deploy the program. You can run a local EVM network with `npx hardhat node`, or you can specify a network of your choice in `hardhat.config.js`. Deploy to your desired network from `hardhat.config.js`:

```
$ npx hardhat run --network <your-network> scripts/deploy.js
```

In the `benchmark` folder, modify the `evm_benchmark.js` script to specify your new network, contract address, and private key. You also need to update `UNIQUE_PREFIX` to a new prefix for each benchmark run.

Run the EVM benchmark:
```
$ node evm_benchmark.js
```
