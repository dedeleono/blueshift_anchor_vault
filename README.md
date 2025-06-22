# Blueshift Anchor Vault

An Anchor-based Solana escrow vault program, part of the Blueshift Pinocchio challenge series.
This repository demonstrates how to use Anchor’s declarative accounts, PDAs, and CPIs to implement a secure on-chain escrow vault in TypeScript and Rust.

Features
--------
- make: Initialize an escrow PDA and its associated token vault
- take: Execute a swap—transfer tokens from the vault to the taker
- refund: Return tokens from the vault back to the maker
- Clean Anchor patterns: #[derive(Accounts)], #[account(init)], CPI to the SPL Token program
- Auto-generated IDL: Use Anchor’s IDL for client integrations

Prerequisites
-------------
- Rust (stable toolchain)
- Solana CLI (v1.14+)
- Anchor CLI (v0.27+)
- Node.js (v16+) & Yarn or npm

Repository Layout
----------------
```text
.
├── Anchor.toml                         # Anchor workspace configuration
├── Cargo.toml                          # Anchor-program manifest
├── programs/
│   └── blueshift_anchor_vault/         # On-chain Anchor program
│       ├── src/
│       │   ├── lib.rs                  # entrypoint & instruction handlers
│       │   ├── state.rs                # Escrow state account definition
│       │   └── instructions/           # make.rs, take.rs, refund.rs
│       └── Cargo.toml
├── migrations/                         # Anchor deployment scripts
├── tests/                              # TypeScript integration tests
│   └── vault.ts
├── tsconfig.json                       # TypeScript compiler options
├── package.json                        # Test dependencies
└── README.md                           # This file
```

Getting Started
---------------
1. Clone the repo:
   git clone https://github.com/dedeleono/blueshift_anchor_vault.git
   cd blueshift_anchor_vault

2. Install dependencies:
   yarn install

3. Build & deploy:
   # Start a local validator in one terminal:
   solana-test-validator --reset

   # In another terminal:
   anchor build
   anchor deploy

   After deployment, the program .so and keypair are placed into target/deploy/

4. Run tests:
   anchor test

Usage
-----
Use the generated IDL at target/idl/blueshift_anchor_vault.json with your preferred client:

```ts
import * as anchor from "@project-serum/anchor";
import idl from "../target/idl/blueshift_anchor_vault.json";

const provider = anchor.AnchorProvider.local();
const program  = new anchor.Program(idl, idl.metadata.address, provider);

// Example: make a new escrow
await program.methods
  .make(seed, receiveAmount, depositAmount)
  .accounts({
    maker: provider.wallet.publicKey,
    escrow: escrowPda,
    mintA: mintA,
    mintB: mintB,
    makerAtaA: makerAtaA,
    vaultAta: vaultAta,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  })
  .rpc();
```

Refer to tests/vault.ts for full examples of make, take, and refund.
