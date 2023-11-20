const ethers = require("ethers");
const fs = require("fs");

const NETWORK = "https://l1-charming-salmon-swordfish-5erk8fvo2s.t.conduit.xyz";
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PRIVATE_KEY = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const N_DOMAINS = 100;
const UNIQUE_PREFIX = 'nameprefix';  // This prefix MUST be changed after each run.

const CONTRACT_ABI = JSON.parse(fs.readFileSync("eclipse_evm.json", "utf8"));
const PROVIDER = new ethers.providers.JsonRpcProvider(NETWORK);
const WALLET = new ethers.Wallet(PRIVATE_KEY, PROVIDER);
const CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, WALLET);
const GAS_LIMIT = ethers.BigNumber.from("1000000");
const GAS_MULTIPLIER_PER_TX = ethers.BigNumber.from("3");

async function runBenchmark() {
  const domainNames = [...Array(N_DOMAINS).keys()].map(
    (i) => `${UNIQUE_PREFIX}${i + 1}.ecl`
  );
  let nonce = await PROVIDER.getTransactionCount(WALLET.address);

  console.time("name_service_benchmark");

  const registrationPromises = domainNames.map((domainName, index) => {
    return (async () => {
      const registrationPrice = await CONTRACT.price(domainName);
      const gasPrice = await PROVIDER.getGasPrice();
      const increasedGasPrice = gasPrice.mul(GAS_MULTIPLIER_PER_TX);

      const transaction = {
        value: registrationPrice,
        gasLimit: GAS_LIMIT,
        gasPrice: increasedGasPrice,
        nonce: nonce + index,
      };

      return CONTRACT.register(domainName, WALLET.address, transaction);
    })();
  });

  try {
    await Promise.all(registrationPromises);
    console.log(`${N_DOMAINS} domains registered successfully`);
  } catch (error) {
    console.error(`Error registering domains:`, error);
  }

  console.timeEnd("name_service_benchmark");
}

runBenchmark();
