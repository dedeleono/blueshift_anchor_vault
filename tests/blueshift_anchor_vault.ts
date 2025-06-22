import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlueshiftAnchorVault } from "../target/types/blueshift_anchor_vault";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";

describe("blueshift_anchor_vault", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.BlueshiftAnchorVault as Program<BlueshiftAnchorVault>;
  const provider = anchor.getProvider();

  const user = anchor.web3.Keypair.generate();

  before(async () => {
    const signature = await provider.connection.requestAirdrop(
      user.publicKey,
      3 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
  });

  it("Can deposit lamports into vault", async () => {
    const depositAmount = 0.5 * LAMPORTS_PER_SOL;

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), user.publicKey.toBuffer()],
      program.programId
    );

    const initialUserBalance = await provider.connection.getBalance(user.publicKey);
    const initialVaultBalance = await provider.connection.getBalance(vaultPda);

    console.log(`Initial user balance: ${initialUserBalance} lamports`);
    console.log(`Initial vault balance: ${initialVaultBalance} lamports`);

    const tx = await program.methods
      .vaultAction(true, new anchor.BN(depositAmount))
      .accountsPartial({
        signer: user.publicKey,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Deposit transaction signature:", tx);

    const finalUserBalance = await provider.connection.getBalance(user.publicKey);
    const finalVaultBalance = await provider.connection.getBalance(vaultPda);

    console.log(`Final user balance: ${finalUserBalance} lamports`);
    console.log(`Final vault balance: ${finalVaultBalance} lamports`);

    expect(finalUserBalance).to.be.lessThan(initialUserBalance);
    
    expect(finalVaultBalance).to.equal(depositAmount);
    
    console.log(`User balance changed by: ${finalUserBalance - initialUserBalance} lamports`);
    console.log(`Vault balance changed by: ${finalVaultBalance - initialVaultBalance} lamports`);
  });

  it("Can withdraw lamports from vault", async () => {
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), user.publicKey.toBuffer()],
      program.programId
    );

    const initialUserBalance = await provider.connection.getBalance(user.publicKey);
    const initialVaultBalance = await provider.connection.getBalance(vaultPda);

    console.log(`Before withdraw - User balance: ${initialUserBalance} lamports`);
    console.log(`Before withdraw - Vault balance: ${initialVaultBalance} lamports`);

    const tx = await program.methods
      .vaultAction(false, new anchor.BN(0))
      .accountsPartial({
        signer: user.publicKey,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Withdraw transaction signature:", tx);

    const finalUserBalance = await provider.connection.getBalance(user.publicKey);
    const finalVaultBalance = await provider.connection.getBalance(vaultPda);

    console.log(`After withdraw - User balance: ${finalUserBalance} lamports`);
    console.log(`After withdraw - Vault balance: ${finalVaultBalance} lamports`);

    expect(finalUserBalance).to.be.greaterThan(initialUserBalance);
    
    expect(finalVaultBalance).to.equal(0);
    
    console.log(`User balance changed by: ${finalUserBalance - initialUserBalance} lamports`);
    console.log(`Vault balance changed by: ${finalVaultBalance - initialVaultBalance} lamports`);
  });
});
