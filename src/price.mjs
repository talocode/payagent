import { TCODE_DECIMALS, TCODE_MINT } from "./settlement.mjs";

export async function fetchTcodePrice() {
  const url = `https://lite-api.jup.ag/tokens/v2/search?query=${TCODE_MINT}`;
  const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "talocode-payagent/0.2" } });
  if (!response.ok) throw new Error(`price lookup failed: ${response.status}`);
  const rows = await response.json();
  const asset = Array.isArray(rows) ? rows.find((row) => row.id === TCODE_MINT) : null;
  if (!asset || !(Number(asset.usdPrice) > 0)) throw new Error("official mint price was not returned");
  if (asset.decimals !== TCODE_DECIMALS) throw new Error("official mint decimals were not 6");
  return { mint: TCODE_MINT, priceUsd: Number(asset.usdPrice), source: "jupiter" };
}
