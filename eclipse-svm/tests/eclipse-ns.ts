import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { EclipseNs } from "../target/types/eclipse_ns";

describe("eclipse_ns", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.eclipse_ns as Program<EclipseNs>;

  it("Mints 1 domain with .ecl", async () => {
    const domainName = 'test.ecl';
    const nameRecordOwner = Keypair.generate();
    const initialOwner = Keypair.generate().publicKey; 

    await program.methods
      .new(initialOwner)
      .accounts({
        dataAccount: nameRecordOwner.publicKey,
        payer: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([nameRecordOwner])
      .rpc();

    console.log(`Domain ${domainName} registered to ${nameRecordOwner.publicKey}`);
  });
});
