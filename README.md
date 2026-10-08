# Talocode Pay Agent

An MCP agent that reads an HTTP 402, checks a spend cap, and settles the Talocode fee in $TCODE.

The merchant can still request USDC on Base or Solana. The Talocode fee is 1 percent of the quoted price and is quoted in $TCODE, mint `6ptxwABxQz8zMhwhiPeVgRgWjGMdVcEBFBv8v8C3ory`. The user wallet signs. The agent does not hold a key.

```bash
node bin/payagent.mjs quote --url=https://example.com --max-usd=0.05
```
