import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferCheckedInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { FEE_ATA, FEE_OWNER, TCODE_DECIMALS, TCODE_MINT, tcodeFee } from "./settlement.mjs";

const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

export async function prepareFeeTransfer({ from, amountUsd, priceUsd, rpc = process.env.SOLANA_RPC || DEFAULT_RPC }) {
  const fee = tcodeFee({ amountUsd, priceUsd });
  if (fee.amountRaw === "0") throw new Error("fee rounds to zero token units");
  const connection = new Connection(rpc, "confirmed");
  const mint = new PublicKey(TCODE_MINT);
  const owner = new PublicKey(from);
  const destination = new PublicKey(FEE_ATA);
  const source = getAssociatedTokenAddressSync(mint, owner);
  const destInfo = await connection.getParsedAccountInfo(destination);
  const info = destInfo.value?.data?.parsed?.info;
  if (!info || info.mint !== TCODE_MINT || info.owner !== FEE_OWNER) {
    throw new Error("fee account is not the official $TCODE account");
  }
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({ feePayer: owner, recentBlockhash: blockhash });
  tx.add(createTransferCheckedInstruction(source, mint, destination, owner, BigInt(fee.amountRaw), TCODE_DECIMALS));
  return {
    signed: false,
    sent: false,
    from,
    sourceAta: source.toBase58(),
    destinationAta: FEE_ATA,
    destinationOwner: FEE_OWNER,
    mint: TCODE_MINT,
    amountUsd,
    priceUsd,
    ...fee,
    recentBlockhash: blockhash,
    unsignedTransaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64"),
  };
}
