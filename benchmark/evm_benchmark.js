const ethers = require("ethers");
const fs = require("fs");

// Load ABI
const contractAbi = JSON.parse(fs.readFileSync("eclipse_evm.json", "utf8"));

// RPC endpoint
const network = "https://l1-charming-salmon-swordfish-5erk8fvo2s.t.conduit.xyz";
const provider = new ethers.providers.JsonRpcProvider(network);

// Address smart contract deployed to
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Place private key here
const privateKey = "";

const wallet = new ethers.Wallet(privateKey, provider);

// Contract instance
const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

async function registerDomains() {
  console.log("🚀 Starting the domain registration process...");

  const numDomains = 100;
  // Moon phases for animation: Only for aesthetics. Does not impact performance
  const moonPhases = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  let moonPhaseIndex = 0;
  const moonInterval = setInterval(() => {
    process.stdout.write(
      `\rRegistering in progress ${
        moonPhases[moonPhaseIndex % moonPhases.length]
      } `
    );
    moonPhaseIndex++;
  }, 200);

  const startTime = new Date();

  const domainNames = [];
  for (let i = 1; i <= numDomains; i++) {
    domainNames.push(`test${i}.ecl`); // Change this name after each run, domain names have to be unique
  }

  // Get the current nonce for the wallet
  let nonce = await provider.getTransactionCount(wallet.address);

  for (let i = 0; i < domainNames.length; i++) {
    const domainName = domainNames[i];
    const registrationPrice = await contract.price(domainName);

    // Manual gas limit
    const gasLimit = ethers.BigNumber.from("1000000");

    // Get the current gas price from the network and increase it
    const gasPrice = await provider.getGasPrice();
    const increasedGasPrice = gasPrice
      .mul(ethers.BigNumber.from("150")) // Increase this multiplier if minting more domains
      .div(ethers.BigNumber.from("100"));

    const transaction = {
      value: registrationPrice,
      gasLimit: gasLimit,
      gasPrice: increasedGasPrice,
      nonce: nonce++,
    };

    await contract
      .connect(wallet)
      .register(domainName, wallet.address, transaction);
  }

  clearInterval(moonInterval);

  console.log(`\r🌑  Registered Domains ${numDomains}!`);
  const endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000;
  console.log(
    `🎉 ${numDomains} domains registered in ${timeTaken} seconds! ✨`
  );
}

registerDomains().catch((error) => {
  console.error("❌ An error occurred:", error);
});
