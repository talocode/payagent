import { randomUUID } from "node:crypto";

const SUPPORTED = ["base", "solana", "eip155:8453", "solana:mainnet"];

export function decide({ amountUsd, network, maxUsd }) {
  if (!Number.isFinite(amountUsd)) return { decision: "needs_price", reason: "payment response had no numeric price" };
  if (amountUsd > maxUsd) return { decision: "over_cap", reason: `price ${amountUsd} is above cap ${maxUsd}` };
  if (network && !SUPPORTED.some((item) => String(network).toLowerCase().includes(item.split(":")[0]))) {
    return { decision: "unsupported_network", reason: `network ${network} is not Base or Solana` };
  }
  return { decision: "approve_for_wallet", reason: "under cap; user wallet must sign" };
}

export async function quote({ url, maxUsd = 0.05 }) {
  const response = await fetch(url, { headers: { "user-agent": "talocode-payagent/0.1" } });
  const paymentHeader = response.headers.get("payment-required") || response.headers.get("x-payment-required");
  let payment = null;
  if (paymentHeader) {
    try { payment = JSON.parse(paymentHeader); } catch { payment = { raw: paymentHeader }; }
  }
  const amountUsd = Number(payment?.maxAmountRequired || payment?.amountUsd || payment?.price || NaN);
  const network = payment?.network || payment?.acceptedNetworks?.[0] || null;
  const decision = response.status === 402 ? decide({ amountUsd, network, maxUsd }) : { decision: "no_payment", reason: "server did not require payment" };
  return {
    id: `pay_${randomUUID()}`,
    product: "@talocode/payagent",
    url,
    status: response.status,
    maxUsd,
    payment,
    ...decision,
    signed: false,
  };
}
