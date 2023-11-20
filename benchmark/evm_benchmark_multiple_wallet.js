const ethers = require("ethers");
const fs = require("fs");

const NETWORK = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0xd0F350b13465B5251bb03E4bbf9Fa1DbC4a378F3";
const PRIVATE_KEY =
  "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0";
const N_DOMAINS = 100;
const UNIQUE_PREFIX = "namePrefix12"; // Change after each run
const FUND_AMOUNT = ethers.utils.parseEther("0.5");

const CONTRACT_ABI = JSON.parse(fs.readFileSync("eclipse_evm.json", "utf8"));
const PROVIDER = new ethers.providers.JsonRpcProvider(NETWORK);
const PRIMARY_WALLET = new ethers.Wallet(PRIVATE_KEY, PROVIDER);
const CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, PROVIDER);

async function runBenchmark() {
  const domainNames = [...Array(N_DOMAINS).keys()].map(
    (i) => `${UNIQUE_PREFIX}${i + 1}.ecl`
  );
  const newWallets = [];

  // Create new accounts and fund them
  for (let i = 0; i < N_DOMAINS; i++) {
    const wallet = ethers.Wallet.createRandom().connect(PROVIDER);
    newWallets.push(wallet);

    // Send 0.5 ETH to the new wallet
    await PRIMARY_WALLET.sendTransaction({
      to: wallet.address,
      value: FUND_AMOUNT,
    });
  }

  console.time("name_service_benchmark");

  const registrationPromises = domainNames.map((domainName, index) => {
    return (async () => {
      const wallet = newWallets[index];
      const contractWithSigner = CONTRACT.connect(wallet);
      const registrationPrice = await contractWithSigner.price(domainName);

      return contractWithSigner.register(domainName, wallet.address, {
        value: registrationPrice,
        gasLimit: ethers.BigNumber.from("1000000"),
      });
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
