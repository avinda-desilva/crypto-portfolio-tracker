---
phase: 05-ethereum-balance-module
fixed_at: 2026-04-27T00:00:00Z
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 05: Code Review Fix Report

**Fixed:** 2026-04-27T00:00:00Z
**Scope:** critical_warning (Critical + Warning findings)
**Findings in scope:** 7 (3 critical, 4 warning)
**Fixed:** 7
**Skipped:** 0
**Status:** all_fixed

## Fixes Applied

### CR-01: BigNumber precision loss — `lib/ethereum.ts`

**Commit:** fix(05): CR-01/WR-01/WR-04

Replaced `Number(balanceInWei) / 1e18` with `parseFloat(Utils.formatUnits(balanceInWei, 18))`. The `Utils.formatUnits` function from `alchemy-sdk` handles ethers.js `BigNumber` correctly and returns a human-readable decimal string, eliminating silent precision loss for wallets holding more than ~0.009 ETH.

---

### CR-02: Hardcoded stubs for BTC/SOL — `app/api/portfolio/route.ts` + `types/wallet.ts`

**Commit:** fix(05): CR-02

Changed `balance: 1.23` stubs to `balance: null, error: "not_implemented"` for Bitcoin and Solana cases. Updated `PortfolioResult` type to allow `balance: number | null` and an optional `error?: string` field so callers are never silently misled by fabricated data.

---

### CR-03: Wrong mock type in ethereum tests — `__tests__/lib/ethereum.test.ts`

**Commit:** fix(05): CR-03

Updated jest mock to use `jest.requireActual("alchemy-sdk")` (preserving `Utils`, `Network`, etc.) and `Utils.parseUnits("2", 18)` to return a real ethers.js `BigNumber` matching what the SDK actually returns. Added a precision boundary test (10 ETH) to catch silent float truncation above the ~0.009 ETH threshold.

---

### WR-01: Missing env var guard — `lib/ethereum.ts`

**Commit:** fix(05): CR-01/WR-01/WR-04 (same commit as CR-01)

Added startup warning when `ALCHEMY_API_KEY` is not set so operators can distinguish "wallet has zero balance" from "API key is missing."

---

### WR-02: Stub test passes for wrong reason — `__tests__/api/portfolio-route.test.ts`

**Commit:** fix(05): WR-02

Updated Test 8 to assert `balance: null` + `error: "not_implemented"` explicitly instead of matching the magic number `1.23` that coincidentally matched both the mock and the stub literal. Test now verifies the actual not-implemented contract.

---

### WR-03: ts-jest/jest version mismatch — `package.json`

**Commit:** fix(05): WR-03

Bumped `ts-jest` from `^29.4.9` to `^30.0.0` for Jest 30 compatibility. ts-jest 29.x only officially supports Jest 27–29; Jest 30 introduced breaking transformer API changes.

---

### WR-04: Log injection via unsanitized address — `lib/ethereum.ts`

**Commit:** fix(05): CR-01/WR-01/WR-04 (same commit as CR-01)

Added `address.replace(/[^\w.:-]/g, "?")` before interpolating the address into the error log message to prevent log injection via crafted newline/ANSI sequences.

---

## Verification

All 13 tests pass after fixes:

```
Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
```

The new precision boundary test (10 ETH) is included in the 13.
