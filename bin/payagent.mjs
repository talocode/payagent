#!/usr/bin/env node
import { quote } from "../src/agent.mjs";
import { startMcp } from "../src/mcp.mjs";
import { fetchTcodePrice } from "../src/price.mjs";
import { prepareFeeTransfer } from "../src/transfer.mjs";

const [cmd, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.filter((a) => a.startsWith("--")).map((a) => {
  const [k, v] = a.slice(2).split("=");
  return [k, v ?? true];
}));

if (cmd === "mcp") startMcp();
else if (cmd === "quote") {
  const receipt = await quote({ url: flags.url, maxUsd: Number(flags["max-usd"] || process.env.PAYAGENT_MAX_USD || 0.05), amountUsd: flags["amount-usd"] ? Number(flags["amount-usd"]) : undefined });
  process.stdout.write(JSON.stringify(receipt, null, 2) + "\n");
  process.exit(receipt.decision === "over_cap" ? 2 : 0);
} else if (cmd === "transfer") {
  if (!flags.from || !flags["amount-usd"]) {
    process.stderr.write("Usage: talocode-payagent transfer --from=<pubkey> --amount-usd=<number>\n");
    process.exit(2);
  }
  const price = await fetchTcodePrice();
  const receipt = await prepareFeeTransfer({ from: flags.from, amountUsd: Number(flags["amount-usd"]), priceUsd: price.priceUsd });
  process.stdout.write(JSON.stringify({ ...receipt, priceSource: price.source }, null, 2) + "\n");
} else {
  process.stderr.write("Usage: talocode-payagent quote --url=... | transfer --from=<pubkey> --amount-usd=<number> | mcp\n");
  process.exit(2);
}
