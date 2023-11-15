import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { EclipseNs } from "../target/types/eclipse_ns";

describe("eclipse_ns", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.eclipse_ns as Program<EclipseNs>;

  it("Creates new domain records with '.eclipse' domain", async () => {
    console.log("Starting to create new domains");
    console.time("Creating new domains");

    for (let i = 0; i < 100; i++) {
      try {
        const nameRecordOwner = Keypair.generate();
        const domainName = `mydomain${i}.eclipse`;
        const initialOwner = Keypair.generate().publicKey; 

        await program.methods
          .new(domainName, initialOwner)
          .accounts({
            dataAccount: nameRecordOwner.publicKey,
            payer: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([nameRecordOwner])
          .rpc();

        console.log(`Created domain ${i}: ${domainName}`);
      } catch (error) {
        console.error(`Error creating domain ${i}:`, error);
        break;
      }
    }

    console.timeEnd("Creating new domains");
    console.log("Finished creating new domains");
  });
});
