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
const FUND_AMOUNT = ethers.utils.parseEther("0.5");
const REGISTRATION_PRICE = ethers.BigNumber.from("0x2386f26fc10000");

async function runBenchmark() {
  const domainNames = [...Array(N_DOMAINS).keys()].map(
    (i) => `${UNIQUE_PREFIX}${i + 1}.ecl`
  );

  // Fund N_DOMAINS wallets to send the txns
  const wallets = [...Array(N_DOMAINS)].map(
    (_) => ethers.Wallet.createRandom().connect(PROVIDER)
  );
  for (w of wallets) {
    await PRIMARY_WALLET.sendTransaction({
      to: w.address,
      value: FUND_AMOUNT,
    });
  }
  const nonces = wallets.map(async (w) => await PROVIDER.getTransactionCount(w.address));
  await Promise.all(nonces);

  const registrationTxns = domainNames.map(async (domainName, i) => {
      const txn = {
        value: REGISTRATION_PRICE,
        gasLimit: GAS_LIMIT,
        nonce: nonces[i]
      };
      const contractWithSigner = CONTRACT.connect(wallets[i]);
      return contractWithSigner.register(domainName, wallets[i].address, txn);
  });

  console.time("name_service_benchmark");
  await Promise.all(registrationTxns);
  console.timeEnd("name_service_benchmark");
  console.log(`${N_DOMAINS} domains registered successfully`);
}

runBenchmark();
