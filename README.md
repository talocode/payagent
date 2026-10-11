# Talocode Pay Agent

An MCP agent that reads an HTTP 402, checks a spend cap, and prepares the Talocode fee as an unsigned official `$TCODE` transfer.

The merchant can still request USDC on Base or Solana. The Talocode fee is 1 percent of the quoted price. Token units come from the live Jupiter price of mint `6ptxwABxQz8zMhwhiPeVgRgWjGMdVcEBFBv8v8C3ory`. The fee account is `4z379ogRNL1TkFY59ZmU6d69SSn3eDN23pZh248peHkc`, owned by `FNrpcNyMKmxRQfyuFg1DnY3ixK4suzym9SkM2vCCWzrN`.

The user wallet signs. The agent does not hold a key. This version does not sign and does not send.

```bash
node bin/payagent.mjs quote --amount-usd=0.02 --max-usd=0.05
node bin/payagent.mjs transfer --from=<wallet> --amount-usd=0.02
```

`transfer` prints `signed: false` and `sent: false` plus the unsigned transaction. A signature is real only after the wallet signs that transaction.
