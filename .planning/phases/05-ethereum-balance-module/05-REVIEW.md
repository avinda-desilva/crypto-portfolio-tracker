---
phase: 05-ethereum-balance-module
reviewed: 2026-04-27T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - lib/ethereum.ts
  - __tests__/lib/ethereum.test.ts
  - app/api/portfolio/route.ts
  - __tests__/api/portfolio-route.test.ts
  - package.json
findings:
  critical: 3
  warning: 4
  info: 0
  total: 7
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-04-27T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files were reviewed covering the Ethereum balance module (`lib/ethereum.ts`), the portfolio API route (`app/api/portfolio/route.ts`), their unit tests, and `package.json`. Three blockers were found: a silent numeric precision loss that will corrupt balances above ~0.009 ETH, hardcoded stub balances returned to callers with no signal that the data is fake, and a test suite that validates the wrong type in the critical conversion path. Four warnings cover missing environment validation, a test that passes for the wrong reason, an incorrect test type, and a Jest/ts-jest version incompatibility.

## Critical Issues

### CR-01: `Number(balanceInWei)` silently loses precision for real-world balances

**File:** `lib/ethereum.ts:14`

**Issue:** The Alchemy SDK returns an ethers.js `BigNumber` object, not a native `BigInt`. Calling `Number()` on an ethers.js `BigNumber` that wraps a value exceeding `Number.MAX_SAFE_INTEGER` (2^53 − 1 ≈ 9.007 × 10^15, which equals ~0.009 ETH in wei) produces a silently incorrect floating-point result. Any wallet holding more than ~0.009 ETH will have its balance silently corrupted. Because the catch block swallows errors and returns 0, the caller has no way to detect the corruption.

The correct approach is to use the BigNumber's own string conversion before dividing:

**Fix:**
```typescript
// Use formatUnits from ethers (re-exported by alchemy-sdk) to avoid precision loss
import { Utils } from "alchemy-sdk";

export async function getEthereumBalance(address: string): Promise<number> {
  try {
    const balanceInWei = await alchemy.core.getBalance(address);
    // formatUnits returns a decimal string; parseFloat is safe here because
    // the result is already a human-readable ETH value (e.g. "1.234567")
    return parseFloat(Utils.formatUnits(balanceInWei, 18));
  } catch (err) {
    console.error(`[ethereum] getEthereumBalance failed for address ${address}:`, err);
    return 0;
  }
}
```

Alternatively, if alchemy-sdk re-exports ethers utilities:
```typescript
// balanceInWei is ethers.BigNumber — use .toString() then divide via string math
import { BigNumber } from "@ethersproject/bignumber";
const ethValue = parseFloat(ethers.utils.formatEther(balanceInWei));
```

---

### CR-02: Hardcoded stub balances for Bitcoin and Solana returned to callers with no indication they are fake

**File:** `app/api/portfolio/route.ts:63,66`

**Issue:** The route returns `balance: 1.23` for every Bitcoin and Solana wallet. This is identical to the mock value used in tests, making it indistinguishable from real data in any environment — including production if these stubs are ever deployed. The API contract (`PortfolioResult`) has no `stub` or `estimated` field, so callers have no way to detect they are receiving fabricated values. If this route is deployed before Phases 6/7 are complete, real users will see incorrect balances for every non-Ethereum wallet.

**Fix:** Return `null` or omit the balance, or add an explicit `error` field for unsupported chains, so callers are never silently misled:
```typescript
case "bitcoin":
  // Phase 6 not yet implemented — signal this explicitly
  return { address: wallet.address, chain: wallet.chain, balance: null, error: "not_implemented" };
case "solana":
  return { address: wallet.address, chain: wallet.chain, balance: null, error: "not_implemented" };
```

Or return HTTP 501 for unsupported chains until the implementation is complete:
```typescript
case "bitcoin":
case "solana":
  return NextResponse.json({ error: `${wallet.chain} support not yet implemented` }, { status: 501 });
```

Also update `PortfolioResult` in `types/wallet.ts` to allow `balance: number | null`.

---

### CR-03: Unit test validates native `BigInt` conversion, not the actual ethers.js `BigNumber` path

**File:** `__tests__/lib/ethereum.test.ts:32`

**Issue:** The test mocks `getBalance` to resolve with `BigInt("2000000000000000000")` (native JS BigInt). The real Alchemy SDK returns an ethers.js `BigNumber` object. These two types behave differently under `Number()`:

- `Number(BigInt("2000000000000000000"))` → `2000000000000000000` (correct for this small value)
- `Number(ethers.BigNumber.from("2000000000000000000"))` → `NaN` or incorrect because `BigNumber` is a class instance, and `Number()` of a plain object returns `NaN`

The test passes with the mock type and would also pass if `Number(realBigNumber)` returned `NaN` divided by `1e18` — it would just fail a different assertion. More critically, if the production conversion is broken (CR-01), this test will not catch it because it is exercising a different code path than production.

**Fix:** The mock should return a value that matches what the SDK actually returns, or the test should use a proper ethers.js BigNumber:
```typescript
import { BigNumber } from "@ethersproject/bignumber";
// ...
alchemySdk.__mockGetBalance.mockResolvedValue(BigNumber.from("2000000000000000000"));
```

Also add a test near the precision boundary (e.g., `"10000000000000000000"` = 10 ETH) to catch silent float truncation.

---

## Warnings

### WR-01: Missing `ALCHEMY_API_KEY` env var check — silent failure returns 0 for all Ethereum balances

**File:** `lib/ethereum.ts:4-7`

**Issue:** The Alchemy client is constructed at module load time using `process.env.ALCHEMY_API_KEY`, which can be `undefined` if the environment variable is not set. The SDK accepts an undefined key and constructs silently. All subsequent `getBalance` calls will fail with an authentication error, which the catch block swallows, returning `0` for every address. There is no startup validation, no logged warning at construction time, and no way for an operator to distinguish "wallet has zero balance" from "API key is missing."

**Fix:** Add a guard at module initialization:
```typescript
const apiKey = process.env.ALCHEMY_API_KEY;
if (!apiKey) {
  // Fail fast at startup rather than silently returning 0 for all balances
  throw new Error("[ethereum] ALCHEMY_API_KEY environment variable is not set");
}
const alchemy = new Alchemy({ apiKey, network: Network.ETH_MAINNET });
```

If a hard fail is undesirable (e.g., to allow running the app without Ethereum support), at minimum log a warning:
```typescript
if (!apiKey) {
  console.warn("[ethereum] ALCHEMY_API_KEY is not set — getEthereumBalance will always return 0");
}
```

---

### WR-02: Bitcoin/Solana stub test passes for the wrong reason

**File:** `__tests__/api/portfolio-route.test.ts:97-110`

**Issue:** Test 8 asserts that Bitcoin and Solana wallets return `balance: 1.23`. The mock at the top of the file mocks `getEthereumBalance` to return `1.23`, but the route does NOT call `getEthereumBalance` for BTC/SOL — it uses the hardcoded literal `1.23` directly. The test passes because the stub and mock share the same magic number, not because any real logic is being exercised. If the stub value in `route.ts` changes to, say, `0`, the test will fail for a reason that has nothing to do with the mock — and if someone removes the mock, the test still passes.

**Fix:** Update the test to be explicit about what it is verifying — that stubs are in place and the shape is correct — and document that the balance assertion is against a known stub value, not a live result:
```typescript
// Stubs return hardcoded values until Phases 6/7 are implemented
expect(json.results[0]).toMatchObject({ address: "addr1", chain: "bitcoin" });
expect(typeof json.results[0].balance).toBe("number");
```

---

### WR-03: `ts-jest` version is incompatible with the declared `jest` version

**File:** `package.json:31,34`

**Issue:** `jest: ^30.3.0` is declared alongside `ts-jest: ^29.4.9`. The `ts-jest` 29.x release line only officially supports Jest 27–29. Jest 30 introduced breaking changes to the transformer and reporter APIs. This mismatch can cause subtle test infrastructure failures (wrong source maps, incorrect coverage, transformer errors) that silently produce false-positive test results or misleading error messages. ts-jest 30.x is required for Jest 30 compatibility.

**Fix:**
```json
"ts-jest": "^30.0.0"
```

Verify the correct compatible version at https://kulshekhar.github.io/ts-jest/docs/getting-started/installation.

---

### WR-04: `console.error` logs raw Ethereum address on every SDK failure — potential log injection

**File:** `lib/ethereum.ts:17`

**Issue:** The `address` parameter is interpolated directly into the log message without sanitization. While not a remote code execution risk in a server log context, a crafted address string containing newline characters (`\n`) or ANSI escape sequences could be used to forge or corrupt log entries (log injection / log forging). For a portfolio tracker processing user-supplied wallet addresses, this is a realistic attack vector.

**Fix:** Sanitize the address before logging, or use a structured logger that handles this automatically:
```typescript
const safeAddress = address.replace(/[^\w.:-]/g, "?");
console.error(`[ethereum] getEthereumBalance failed for address ${safeAddress}:`, err);
```

---

_Reviewed: 2026-04-27T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
