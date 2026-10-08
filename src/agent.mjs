import { randomUUID } from "node:crypto";
import { tcodeSettlement } from "./settlement.mjs";

const SUPPORTED = ["base", "solana", "eip155:8453", "solana:mainnet"];

export function decide({ amountUsd, network, maxUsd }) {
  if (!Number.isFinite(amountUsd)) return { decision: "needs_price", reason: "payment response had no numeric price" };
  if (amountUsd > maxUsd) return { decision: "over_cap", reason: `price ${amountUsd} is above cap ${maxUsd}` };
  if (network && !SUPPORTED.some((item) => String(network).toLowerCase().includes(item.split(":")[0]))) {
    return { decision: "unsupported_network", reason: `network ${network} is not Base or Solana` };
  }
  return { decision: "approve_for_wallet", reason: "under cap; user wallet must sign" };
}

export async function quote({ url, maxUsd = 0.05, amountUsd, network }) {
  let status = 402;
  let payment = null;
  if (url) {
    const response = await fetch(url, { headers: { "user-agent": "talocode-payagent/0.1" } });
    status = response.status;
    const paymentHeader = response.headers.get("payment-required") || response.headers.get("x-payment-required");
    if (paymentHeader) {
      try { payment = JSON.parse(paymentHeader); } catch { payment = { raw: paymentHeader }; }
    }
  }
  const price = Number(amountUsd || payment?.maxAmountRequired || payment?.amountUsd || payment?.price || NaN);
  const chain = network || payment?.network || payment?.acceptedNetworks?.[0] || "solana";
  const decision = status === 402 || Number.isFinite(price) ? decide({ amountUsd: price, network: chain, maxUsd }) : { decision: "no_payment", reason: "server did not require payment" };
  return {
    id: `pay_${randomUUID()}`,
    product: "@talocode/payagent",
    url,
    status,
    maxUsd,
    payment,
    ...decision,
    settlement: Number.isFinite(price) ? tcodeSettlement({ amountUsd: price }) : null,
    signed: false,
  };
}
