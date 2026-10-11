import { decide, quote } from "./agent.mjs";
import { fetchTcodePrice } from "./price.mjs";
import { prepareFeeTransfer } from "./transfer.mjs";

export function startMcp() {
  const send = (message) => process.stdout.write(JSON.stringify(message) + "\n");
  let buffer = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", async (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const msg = JSON.parse(line);
      if (msg.method === "initialize") send({ jsonrpc: "2.0", id: msg.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "talocode-payagent", version: "0.2.0" } } });
      else if (msg.method === "tools/list") send({ jsonrpc: "2.0", id: msg.id, result: { tools: [
        { name: "payagent_quote", description: "Request a URL and return a payment receipt if the server sends HTTP 402. Does not sign or send.", inputSchema: { type: "object", properties: { url: { type: "string" }, maxUsd: { type: "number" } }, required: ["url"] } },
        { name: "payagent_decide", description: "Decide whether a quoted price is under the spend cap.", inputSchema: { type: "object", properties: { amountUsd: { type: "number" }, network: { type: "string" }, maxUsd: { type: "number" } }, required: ["amountUsd", "maxUsd"] } },
        { name: "payagent_prepare_transfer", description: "Build an unsigned official $TCODE fee transfer. The wallet must sign it. This tool does not sign or send.", inputSchema: { type: "object", properties: { from: { type: "string" }, amountUsd: { type: "number" } }, required: ["from", "amountUsd"] } }
      ] } });
      else if (msg.method === "tools/call" && msg.params.name === "payagent_quote") {
        const receipt = await quote(msg.params.arguments);
        send({ jsonrpc: "2.0", id: msg.id, result: { content: [{ type: "text", text: JSON.stringify(receipt) }] } });
      } else if (msg.method === "tools/call" && msg.params.name === "payagent_prepare_transfer") {
        const price = await fetchTcodePrice();
        const receipt = await prepareFeeTransfer({ ...msg.params.arguments, priceUsd: price.priceUsd });
        send({ jsonrpc: "2.0", id: msg.id, result: { content: [{ type: "text", text: JSON.stringify({ ...receipt, priceSource: price.source }) }] } });
      } else if (msg.method === "tools/call") {
        const result = decide(msg.params.arguments);
        send({ jsonrpc: "2.0", id: msg.id, result: { content: [{ type: "text", text: JSON.stringify(result) }] } });
      } else if (msg.id) send({ jsonrpc: "2.0", id: msg.id, result: {} });
    }
  });
}
