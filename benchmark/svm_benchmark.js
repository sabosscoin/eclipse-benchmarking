const anchor = require("@coral-xyz/anchor");
const { Keypair, Connection, PublicKey } = require("@solana/web3.js");
const fs = require("fs");

// IDL file 
const idl = JSON.parse(fs.readFileSync("eclipse_svm.json", "utf8"));

// Eclipse RPC
const network = "https://staging-rpc.dev.eclipsenetwork.xyz";
const connection = new Connection(network, "processed");

// Set the program ID of your smart contract
const programId = new PublicKey("3FeFUn3mng4psjHTwWwQUZPvisxVVxZ3UVPAtVBfKG6b");

// Set up your wallet
const homedir = require("os").homedir();
const keypairPath = `${homedir}/.config/solana/id.json`;
// Load keypair generated from the standard Solana CLI
// Make sure to fund wallet with tokens before running this script
// 100 is reccomended for multiple runs of this script
// solana config set --url https://staging-rpc.dev.eclipsenetwork.xyz
// solana airdrop 100
const payer = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(keypairPath, "utf8")))
);

// Create an Anchor provider
const provider = new anchor.AnchorProvider(
  connection,
  new anchor.Wallet(payer),
  {
    preflightCommitment: "processed",
  }
);

// Create the program instance
const program = new anchor.Program(idl, programId, provider);

// Number of domains
const numDomains = 100;

// Moon phases for animation: Only for aesthetics. Does not impact performance
const moonPhases = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

async function mintDomains() {
  console.log("🚀 Starting the domain minting process...");

  // Initialize moon phase index
  let moonPhaseIndex = 0;

  // Set an interval for moon phase animation
  const moonInterval = setInterval(() => {
    process.stdout.write(
      `\rMinting in progress ${
        moonPhases[moonPhaseIndex % moonPhases.length]
      } `
    );
    moonPhaseIndex++;
  }, 200); // Change moon phase every 200 milliseconds

  const startTime = new Date();

  const domainNames = [];
  for (let i = 1; i <= numDomains; i++) {
    domainNames.push(`test${i}.ecl`);
  }

  const mintPromises = domainNames.map(async () => {
    const nameRecordOwner = Keypair.generate();
    const initialOwner = Keypair.generate().publicKey;

    await program.methods
      .new(initialOwner)
      .accounts({
        dataAccount: nameRecordOwner.publicKey,
        payer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([nameRecordOwner])
      .rpc();
  });

  await Promise.all(mintPromises);

  // Clear the moon phase interval after minting is done
  clearInterval(moonInterval);

  console.log(`\r🌑  Minted Domains ${numDomains}!`);
  const endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000; // Time in seconds
  console.log(`🎉 ${numDomains} domains minted in ${timeTaken} seconds! ✨`);
}

mintDomains().catch((error) => {
  console.error("❌ An error occurred:", error);
});
