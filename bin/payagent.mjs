#!/usr/bin/env node
import { quote } from "../src/agent.mjs";
import { startMcp } from "../src/mcp.mjs";

const [cmd, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.filter((a) => a.startsWith("--")).map((a) => {
  const [k, v] = a.slice(2).split("=");
  return [k, v ?? true];
}));

if (cmd === "mcp") startMcp();
else if (cmd === "quote") {
  const receipt = await quote({ url: flags.url, maxUsd: Number(flags["max-usd"] || process.env.PAYAGENT_MAX_USD || 0.05) });
  process.stdout.write(JSON.stringify(receipt, null, 2) + "\n");
  process.exit(receipt.decision === "over_cap" ? 2 : 0);
} else {
  process.stderr.write("Usage: talocode-payagent quote --url=... | mcp\n");
  process.exit(2);
}
