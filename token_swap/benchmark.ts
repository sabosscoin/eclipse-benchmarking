import { Keypair, Connection, PublicKey } from "@solana/web3.js";

import {
  approve,
  createMint,
  createAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import {
  TokenSwap,
  CurveType,
} from "@solana/spl-token-swap";
import { newAccountWithLamports } from "./util/new-account-with-lamports";

const TOKEN_SWAP_PROGRAM_ID = new PublicKey(
  "AumnbmraaeRwwiK3PJEHNWWTEWzaHUP8MtcY6qbVhLSy"
);


let connection: Connection;

async function getConnection(): Promise<Connection> {
  if (connection) return connection;

  // RPC and WebSocket URLs
  const rpcURL = 'https://staging-rpc.dev.eclipsenetwork.xyz';
  const wsURL = 'https://staging-rpc.dev.eclipsenetwork.xyz';
  // const rpcURL = "http://127.0.0.1:8899";
  // const wsURL = "ws://127.0.0.1:8900";

  connection = new Connection(rpcURL, {
    commitment: "confirmed",
    wsEndpoint: wsURL,
  });

  const version = await connection.getVersion();

  console.log("Connection to cluster established:", rpcURL, version);
  return connection;
}

const main = async () => {
    console.log("Run test: createTokenSwap (constant price)");
    const constantPrice = new Uint8Array(8);
    constantPrice[0] = 1;
    await createTokenSwap(CurveType.ConstantPrice, constantPrice);
    console.log(
      "Run test: createTokenSwap (constant product)"
    );
    // Pre-create user accounts and transfer authority for swap
    const userAccountA = await createAccount(
      connection,
      payer,
      mintA,
      owner.publicKey,
      Keypair.generate()
    );
    await mintTo(connection, payer, mintA, userAccountA, owner, SWAP_AMOUNT_IN);

    console.log("Run test: benchmark swap");
    await benchmarkSwap(275);

    console.log("Success\n");
}

main().catch((err) => {
  console.error(err);
});

// Globals created for `createTokenSwap` 
// Token swap
let tokenSwap: TokenSwap;
// authority of the token and accounts
let authority: PublicKey;
// bump seed used to generate the authority public key
let bumpSeed: number;
// owner of the user accounts
let owner: Keypair;
// payer for transactions
let payer: Keypair;
// Token pool
let tokenPool: PublicKey;
let tokenAccountPool: PublicKey;
let feeAccount: PublicKey;
// Tokens swapped
let mintA: PublicKey;
const mintAProgramId: PublicKey = TOKEN_PROGRAM_ID;
let mintB: PublicKey;
const mintBProgramId: PublicKey = TOKEN_PROGRAM_ID;
let tokenAccountA: PublicKey;
let tokenAccountB: PublicKey;

// Hard-coded fee address, for testing production mode
const SWAP_PROGRAM_OWNER_FEE_ADDRESS =
  process.env.SWAP_PROGRAM_OWNER_FEE_ADDRESS;

// Adjusted Pool fees
const TRADING_FEE_NUMERATOR = 2n; 
const TRADING_FEE_DENOMINATOR = 10000n;
const OWNER_TRADING_FEE_NUMERATOR = 0n; // No owner trading fee
const OWNER_TRADING_FEE_DENOMINATOR = 10000n;
const OWNER_WITHDRAW_FEE_NUMERATOR = 0n; // No owner withdraw fee
const OWNER_WITHDRAW_FEE_DENOMINATOR = 6n;
const HOST_FEE_NUMERATOR = 1n; 
const HOST_FEE_DENOMINATOR = 100n;

const currentSwapTokenA = 2000000000n;
const currentSwapTokenB = 2000000000n;

const SWAP_AMOUNT_IN = 1000000n; 
const SWAP_AMOUNT_OUT = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 181322n : 181348n; 



export async function createTokenSwap(
  curveType: number,
  curveParameters?: Uint8Array
): Promise<void> {
  const connection = await getConnection();
  payer = await newAccountWithLamports(connection, 10000000000);
  owner = await newAccountWithLamports(connection, 10000000000);
  const tokenSwapAccount = Keypair.generate();

  [authority, bumpSeed] = await PublicKey.findProgramAddress(
    [tokenSwapAccount.publicKey.toBuffer()],
    TOKEN_SWAP_PROGRAM_ID
  );

  console.log("creating pool mint");
  tokenPool = await createMint(
    connection,
    payer,
    authority,
    null,
    2,
    Keypair.generate(),
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log("creating pool account");
  tokenAccountPool = await createAccount(
    connection,
    payer,
    tokenPool,
    owner.publicKey,
    Keypair.generate()
  );
  const ownerKey = SWAP_PROGRAM_OWNER_FEE_ADDRESS || owner.publicKey.toString();
  feeAccount = await createAccount(
    connection,
    payer,
    tokenPool,
    new PublicKey(ownerKey),
    Keypair.generate()
  );

  console.log("creating token A");
  mintA = await createMint(
    connection,
    payer,
    owner.publicKey,
    null,
    2,
    Keypair.generate(),
    undefined,
    mintAProgramId
  );

  console.log("creating token A account");
  tokenAccountA = await createAccount(
    connection,
    payer,
    mintA,
    authority,
    Keypair.generate()
  );
  console.log("minting token A to swap");
  await mintTo(
    connection,
    payer,
    mintA,
    tokenAccountA,
    owner,
    currentSwapTokenA
  );

  console.log("creating token B");
  mintB = await createMint(
    connection,
    payer,
    owner.publicKey,
    null,
    2,
    Keypair.generate(),
    undefined,
    mintBProgramId
  );

  console.log("creating token B account");
  tokenAccountB = await createAccount(
    connection,
    payer,
    mintB,
    authority,
    Keypair.generate()
  );
  console.log("minting token B to swap");
  await mintTo(
    connection,
    payer,
    mintB,
    tokenAccountB,
    owner,
    currentSwapTokenB
  );

  console.log("creating token swap");
  const swapPayer = await newAccountWithLamports(connection, 10000000000);
  tokenSwap = await TokenSwap.createTokenSwap(
    connection,
    swapPayer,
    tokenSwapAccount,
    authority,
    tokenAccountA,
    tokenAccountB,
    tokenPool,
    mintA,
    mintB,
    feeAccount,
    tokenAccountPool,
    TOKEN_SWAP_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    TRADING_FEE_NUMERATOR,
    TRADING_FEE_DENOMINATOR,
    OWNER_TRADING_FEE_NUMERATOR,
    OWNER_TRADING_FEE_DENOMINATOR,
    OWNER_WITHDRAW_FEE_NUMERATOR,
    OWNER_WITHDRAW_FEE_DENOMINATOR,
    HOST_FEE_NUMERATOR,
    HOST_FEE_DENOMINATOR,
    curveType,
    curveParameters
  );

  console.log("loading token swap");
  await TokenSwap.loadTokenSwap(
    connection,
    tokenSwapAccount.publicKey,
    TOKEN_SWAP_PROGRAM_ID,
    swapPayer
  );
}

export async function swap(
  userAccountA: any,
  userAccountB: any,
  userTransferAuthority: any
): Promise<void> {
  await approve(
    connection,
    payer,
    userAccountA,
    userTransferAuthority.publicKey,
    owner,
    SWAP_AMOUNT_IN
  );

  const confirmOptions = {
    skipPreflight: true,
  };
  await tokenSwap.swap(
    userAccountA,
    tokenAccountA,
    tokenAccountB,
    userAccountB,
    tokenSwap.mintA,
    tokenSwap.mintB,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    null,
    userTransferAuthority,
    SWAP_AMOUNT_IN,
    SWAP_AMOUNT_OUT,
    confirmOptions
  );
}

async function benchmarkSwap(iterations: number) {
  const swapPromises: any = [];
  const userTransferAuthority = Keypair.generate();
  const keyPairsA = Array(iterations)
    .fill(null)
    .map(() => Keypair.generate());
  const keyPairsB = Array(iterations)
    .fill(null)
    .map(() => Keypair.generate());
  const userAccountsA: any = [];
  const userAccountsB: any = [];

  // Create all accounts before the loop
  for (let i = 0; i < iterations; i++) {
    userAccountsA.push(
      createAccount(connection, payer, mintA, owner.publicKey, keyPairsA[i])
    );
    userAccountsB.push(
      createAccount(connection, payer, mintB, owner.publicKey, keyPairsB[i])
    );
  }

  // Resolve all promises from account creation
  const accountsA = await Promise.all(userAccountsA);
  const accountsB = await Promise.all(userAccountsB);

  // Mint to all accounts before the loop
  const mintPromises = accountsA.map((account) =>
    mintTo(connection, payer, mintA, account, owner, SWAP_AMOUNT_IN)
  );
  await Promise.all(mintPromises);

  const startTime = Date.now();
  console.log("Starting timer");

  for (let i = 0; i < iterations; i++) {
    swapPromises.push(
      (() => {
        try {
          swap(accountsA[i], accountsB[i], userTransferAuthority);
          return "success";
        } catch (error: any) {
          console.error("Swap failed:", error.message);
          return "failed";
        }
      })()
    );
  }

  const results = await Promise.all(swapPromises);
  const endTime = Date.now();
  

  // Analysis and reporting
  const totalTime = endTime - startTime;
  const successfulSwaps = results.filter(
    (result) => result === "success"
  ).length;
  const failedSwaps = iterations - successfulSwaps;
  const averageTime = totalTime / iterations;

  console.log(
    `Total time: ${totalTime} ms, Average time: ${averageTime} ms, Successful: ${successfulSwaps}, Failed: ${failedSwaps}`
  );
  console.log("Ending timer");
}

