export const TCODE_MINT = "6ptxwABxQz8zMhwhiPeVgRgWjGMdVcEBFBv8v8C3ory";
export const TCODE_DECIMALS = 6;
export const FEE_RATE = 0.01;

export function tcodeSettlement({ amountUsd }) {
  const feeUsd = Math.round(amountUsd * FEE_RATE * 10000) / 10000;
  return {
    asset: "TCODE",
    mint: TCODE_MINT,
    chain: "solana",
    feeRate: FEE_RATE,
    feeUsd,
    amountTcode: feeUsd,
    note: "Talocode agent fee settles in $TCODE. The merchant x402 charge stays in the asset the server requested.",
  };
}
