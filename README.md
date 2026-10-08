# Talocode Pay Agent

An MCP agent for the payment part of the agent story.

It requests a URL. If the server returns HTTP 402, it reads the payment requirement, checks it against a spend cap, and writes a receipt. It does not hold a key and it does not launch a token.

## CLI

```bash
node bin/payagent.mjs quote --url=https://example.com --max-usd=0.05
```

## MCP

```bash
node bin/payagent.mjs mcp
```

Tools: `payagent_quote`, `payagent_decide`.

`PAYAGENT_MAX_USD` defaults to `0.05`. A quote above the cap returns `over_cap` and does not approve payment.

Supported networks in the receipt are Base and Solana, which are the networks named in the AWS and Coinbase x402 announcements. Signing is a separate step owned by the user wallet.
