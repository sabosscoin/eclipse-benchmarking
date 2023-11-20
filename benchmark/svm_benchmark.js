const anchor = require("@coral-xyz/anchor");
const { Keypair, Connection, PublicKey } = require("@solana/web3.js");
const fs = require("fs");

const NETWORK = "https://staging-rpc.dev.eclipsenetwork.xyz";
const CONTRACT_ADDRESS = new PublicKey(
  "3FeFUn3mng4psjHTwWwQUZPvisxVVxZ3UVPAtVBfKG6b"
);
const PRIVATE_KEY = `${require("os").homedir()}/.config/solana/id.json`; 
const N_DOMAINS = 100;
const UNIQUE_PREFIX = "nameprefix";

const CONTRACT_ABI = JSON.parse(fs.readFileSync("eclipse_svm.json", "utf8"));
const WALLET = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(PRIVATE_KEY, "utf8")))
);
const PROVIDER = new anchor.AnchorProvider(
  new Connection(NETWORK, "processed"),
  new anchor.Wallet(WALLET),
  { preflightCommitment: "processed" }
);
const CONTRACT = new anchor.Program(CONTRACT_ABI, CONTRACT_ADDRESS, PROVIDER);

async function runBenchmark() {
  const domainNames = [...Array(N_DOMAINS).keys()].map(
    (i) => `${UNIQUE_PREFIX}${i + 1}.ecl`
  );

  console.time("name_service_benchmark");

  const mintPromises = domainNames.map(async (domainName) => {
    const nameRecordOwner = Keypair.generate();
    const initialOwner = Keypair.generate().publicKey;

    await CONTRACT.methods
      .new(domainName, initialOwner)
      .accounts({
        dataAccount: nameRecordOwner.publicKey,
        payer: PROVIDER.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([nameRecordOwner])
      .rpc()
      .then(() => {
        console.log(
          `Domain ${domainName} registered to ${nameRecordOwner.publicKey.toBase58()}`
        );
      })
      .catch((error) => {
        console.error(`Error registering domain ${domainName}:`, error);
      });
  });

  await Promise.all(mintPromises);

  console.timeEnd("name_service_benchmark");
  console.log(`${N_DOMAINS} domains registered`);
}

runBenchmark();
