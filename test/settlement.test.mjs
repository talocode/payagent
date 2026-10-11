import assert from "node:assert/strict";
import test from "node:test";
import { tcodeFee, tcodeSettlement } from "../src/settlement.mjs";

test("fee is one percent of the quoted price, converted at the given price", () => {
  const fee = tcodeFee({ amountUsd: 0.02, priceUsd: 0.01 });
  assert.equal(fee.feeUsd, 0.0002);
  assert.equal(fee.amountRaw, "20000");
  assert.equal(fee.amountTcode, 0.02);
});

test("a missing price does not pretend dollars are tokens", () => {
  const settlement = tcodeSettlement({ amountUsd: 0.02 });
  assert.equal(settlement.feeUsd, 0.0002);
  assert.equal(settlement.amountTcode, null);
  assert.equal(settlement.amountRaw, null);
});
