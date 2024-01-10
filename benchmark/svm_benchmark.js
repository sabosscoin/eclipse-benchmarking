const anchor = require("@coral-xyz/anchor");
const { Keypair, Connection, PublicKey } = require("@solana/web3.js");
const fs = require("fs");

const NETWORK = "https://staging-rpc.dev.eclipsenetwork.xyz";
const CONTRACT_ADDRESS = new PublicKey("FPsPhgLiXVswa5EvCYqa93tzL5t6MLxg9kgptE6WCY6d");
const PRIVATE_KEY = `${require("os").homedir()}/.config/solana/id.json`; 
const N_DOMAINS = 100;
const UNIQUE_PREFIX = "nameprefix";  // This prefix MUST be changed after each run.

const CONTRACT_ABI = JSON.parse(fs.readFileSync("eclipse_svm.json", "utf8"));
const PRIMARY_WALLET = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(PRIVATE_KEY, "utf8")))
);
const PROVIDER = new anchor.AnchorProvider(
  new Connection(NETWORK, "processed"),
  new anchor.Wallet(PRIMARY_WALLET),
  { preflightCommitment: "processed" }
);
const CONTRACT = new anchor.Program(CONTRACT_ABI, CONTRACT_ADDRESS, PROVIDER);

async function runBenchmark() {
  const domainNames = [...Array(N_DOMAINS).keys()].map(
    (i) => `${UNIQUE_PREFIX}${i + 1}.ecl`
  );

  const registrationTxns = domainNames.map(async (domainName) => {
    const nameRecordOwner = Keypair.generate();
    const initialOwner = Keypair.generate().publicKey;

    // FIXME: Where is amount specified?
    return CONTRACT.methods
      .new(domainName, initialOwner)
      .accounts({
        dataAccount: nameRecordOwner.publicKey,
        payer: PROVIDER.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([nameRecordOwner])
      .rpc();
  });

  console.time("name_service_benchmark");
  await Promise.all(registrationTxns);
  console.timeEnd("name_service_benchmark");
  console.log(`${N_DOMAINS} domains registered successfully`);
}

runBenchmark();
