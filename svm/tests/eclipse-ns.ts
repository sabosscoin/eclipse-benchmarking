import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { EclipseNs } from "../target/types/eclipse_ns";

describe("eclipse_ns", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.eclipse_ns as Program<EclipseNs>;

  it("Mints 100 domains with .ecl", async () => {
    const promises = [];
    for (let i = 0; i < 100; i++) {
      const domainName = `test${i}.ecl`;
      const nameRecordOwner = Keypair.generate();
      const initialOwner = Keypair.generate().publicKey;

      const promise = program.methods
        .new("ecl", initialOwner)
        .accounts({
          dataAccount: nameRecordOwner.publicKey,
          payer: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([nameRecordOwner])
        .rpc()
        .then(() => {
          console.log(
            `Domain ${domainName} registered to ${nameRecordOwner.publicKey}`
          );
        });

      promises.push(promise);
    }

    // Wait for all promises to resolve
    await Promise.all(promises);
  });
});
