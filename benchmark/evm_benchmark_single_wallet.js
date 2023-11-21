const ethers = require("ethers");
const fs = require("fs");

const NETWORK = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0xd0F350b13465B5251bb03E4bbf9Fa1DbC4a378F3";
const PRIVATE_KEY = "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0";
const N_DOMAINS = 100;
const UNIQUE_PREFIX = "nameprefix";  // This prefix MUST be changed after each run.

const CONTRACT_ABI = JSON.parse(fs.readFileSync("eclipse_evm.json", "utf8"));
const PROVIDER = new ethers.providers.JsonRpcProvider(NETWORK);
const PRIMARY_WALLET = new ethers.Wallet(PRIVATE_KEY, PROVIDER);
const CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, PROVIDER);
const GAS_LIMIT = ethers.BigNumber.from("1000000");
const GAS_MULTIPLIER_PER_TX = ethers.BigNumber.from("3");
const REGISTRATION_PRICE = ethers.BigNumber.from("0x2386f26fc10000");

async function runBenchmark() {
  const domainNames = [...Array(N_DOMAINS).keys()].map(
    (i) => `${UNIQUE_PREFIX}${i + 1}.ecl`
  );

  const nonce = await PROVIDER.getTransactionCount(PRIMARY_WALLET.address);

  const registrationTxns = domainNames.map(async (domainName, i) => {
      const gasPrice = await PROVIDER.getGasPrice();
      const increasedGasPrice = gasPrice.mul(GAS_MULTIPLIER_PER_TX);

      const txn = {
        value: REGISTRATION_PRICE,
        gasLimit: GAS_LIMIT,
        gasPrice: increasedGasPrice,
        nonce: nonce + i,
      };
      const contractWithSigner = CONTRACT.connect(PRIMARY_WALLET);
      return contractWithSigner.register(domainName, PRIMARY_WALLET.address, txn);
    });

  console.time("name_service_benchmark");
  await Promise.all(registrationTxns);
  console.timeEnd("name_service_benchmark");
  console.log(`${N_DOMAINS} domains registered successfully`);
}

runBenchmark();
