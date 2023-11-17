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
const CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, PROVIDER);
const GAS_LIMIT = ethers.BigNumber.from("1000000");
// Each txn is submitted with a buffer for gas to anticipate congestion.
const GAS_MULTIPLER_PER_TX = "3";

async function runBenchmark() {
  const domainNames = [...Array(N_DOMAINS).keys()]
    .map((i) => `${UNIQUE_PREFIX}${i + 1}.ecl`);
  // FIXME: This nonce issue will force all txns to be executed sequentially.
  // You might need to create 100 keypairs programatically and send the txns from those.
  // Even with a single wallet, it seems like this code is sending each txn one-by-one.
  let nonce = await PROVIDER.getTransactionCount(WALLET.address);
  console.time('name_service_benchmark');

  for (let i = 0; i < domainNames.length; i++) {
    // console.log(`Registering domain #${i}`);
    const registrationPrice = await CONTRACT.price(domainNames[i]);  // FIXME: Can't this be hardcoded?

    const gasPrice = await PROVIDER.getGasPrice();
    const increasedGasPrice = gasPrice.mul(ethers.BigNumber.from(GAS_MULTIPLER_PER_TX));

    const transaction = {
      value: registrationPrice,
      gasLimit: GAS_LIMIT,
      gasPrice: increasedGasPrice,
      nonce: nonce++,
    };

    await CONTRACT
      .connect(WALLET)
      .register(
        domainNames[i],
        WALLET.address,
        transaction
      );
  }

  console.timeEnd('name_service_benchmark');
  console.log(`${N_DOMAINS} domains registered`)
}

runBenchmark();
