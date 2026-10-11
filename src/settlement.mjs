export const TCODE_MINT = "6ptxwABxQz8zMhwhiPeVgRgWjGMdVcEBFBv8v8C3ory";
export const TCODE_DECIMALS = 6;
export const FEE_RATE = 0.01;
export const FEE_OWNER = "FNrpcNyMKmxRQfyuFg1DnY3ixK4suzym9SkM2vCCWzrN";
export const FEE_ATA = "4z379ogRNL1TkFY59ZmU6d69SSn3eDN23pZh248peHkc";

export function tcodeFee({ amountUsd, priceUsd, decimals = TCODE_DECIMALS }) {
  if (!Number.isFinite(amountUsd) || amountUsd < 0) throw new Error("amountUsd must be a non-negative number");
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) throw new Error("priceUsd must be a positive number");
  const feeUsd = Math.round(amountUsd * FEE_RATE * 1e8) / 1e8;
  const amountTcode = feeUsd / priceUsd;
  const amountRaw = BigInt(Math.round(amountTcode * 10 ** decimals));
  return { feeUsd, amountTcode, amountRaw: amountRaw.toString(), decimals };
}

export function tcodeSettlement({ amountUsd, priceUsd }) {
  const priced = Number.isFinite(priceUsd) && priceUsd > 0;
  return {
    asset: "TCODE",
    mint: TCODE_MINT,
    chain: "solana",
    feeRate: FEE_RATE,
    destinationOwner: FEE_OWNER,
    destinationAta: FEE_ATA,
    priceUsd: priced ? priceUsd : null,
    feeUsd: Math.round(amountUsd * FEE_RATE * 1e8) / 1e8,
    ...(priced ? tcodeFee({ amountUsd, priceUsd }) : { amountTcode: null, amountRaw: null }),
    note: "Talocode agent fee is 1 percent of the quoted price and settles in official $TCODE. The merchant charge stays in the asset the server requested. The wallet signs. The agent does not hold a key.",
  };
}
