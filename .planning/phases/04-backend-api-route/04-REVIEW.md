---
phase: 04-backend-api-route
reviewed: 2026-04-26T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - app/api/portfolio/route.ts
  - __tests__/api/portfolio-route.test.ts
  - jest.config.js
findings:
  critical: 1
  warning: 6
  info: 4
  total: 11
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-04-26
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 4 introduces `POST /api/portfolio` with JSON-body validation and a mock balance response, plus 8 Jest unit tests. The implementation handles the primary happy paths and error cases correctly. However, there is one blocker (no request size limit — DoS vector that will worsen in phases 5-7 with real chain calls), six warnings covering validation gaps, a test that misses the branch it claims to exercise, and tooling inconsistencies in the Jest config, plus four informational items.

---

## Critical Issues

### CR-01: No upper bound on `wallets` array — unbounded server iteration (DoS)

**File:** `app/api/portfolio/route.ts:47`
**Issue:** The `wallets` array is iterated and `.map()`-ed without any length check. An unauthenticated caller can POST `{"wallets": [...millions of items...]}` and force the server to allocate and process the entire array. When real chain calls replace the mock in phases 5-7 this becomes unbounded outbound I/O fan-out. There is no guard at all.
**Fix:**
```typescript
const MAX_WALLETS = 100; // tune to product requirements

const wallets: unknown[] = (body as Record<string, unknown>).wallets as unknown[];

if (wallets.length > MAX_WALLETS) {
  return NextResponse.json(
    { error: `wallets array must contain at most ${MAX_WALLETS} entries` },
    { status: 400 }
  );
}
```
Insert the guard immediately after line 44, before the per-item validation loop.

---

## Warnings

### WR-01: Whitespace-only address strings pass validation

**File:** `app/api/portfolio/route.ts:53`
**Issue:** The empty-address check is `=== ""`. A string like `"   "` (all spaces) passes the guard and is accepted as a valid address. When real balance-fetch functions replace the mock in phases 5-7, a blank-after-trim address will be forwarded to an external RPC endpoint, producing an upstream error that leaks back to the caller or causes an unhandled rejection.
**Fix:**
```typescript
// Replace the === "" check with:
((item as Record<string, unknown>).address as string).trim() === ""
```

### WR-02: No explicit `typeof` guard on `chain` before `VALID_CHAINS.includes()`

**File:** `app/api/portfolio/route.ts:54-56`
**Issue:** The validation checks `typeof item.address !== "string"` but does not check `typeof item.chain !== "string"` before casting to `(typeof VALID_CHAINS)[number]` and calling `includes()`. At runtime `includes()` returns `false` for non-string values (null, number, object), so the 400 path is reached — but the explicit type guard is absent. If a future reviewer changes the `includes` call to a `Set.has()` or enum comparison without noticing the missing guard, non-string `chain` values will pass undetected.
**Fix:**
```typescript
typeof (item as Record<string, unknown>).chain !== "string" ||
!VALID_CHAINS.includes(
  (item as Record<string, unknown>).chain as (typeof VALID_CHAINS)[number]
)
```
Add the `typeof .chain !== "string"` line before the `VALID_CHAINS.includes()` check.

### WR-03: `getMockBalance` has no `default` exhaustiveness guard — silent `undefined` on new chain

**File:** `app/api/portfolio/route.ts:6-18`
**Issue:** The `switch` covers all three current `Chain` values, so TypeScript does not flag it today. However there is no `default` branch. If a new value is added to `VALID_CHAINS` and `Chain` without a corresponding `case`, the function returns `undefined` at runtime. Because the caller is `validWallets.map(getMockBalance)`, `results` will silently contain `undefined` entries serialized as `null` in the JSON response — no compile error, no runtime throw.
**Fix:**
```typescript
default: {
  const _exhaustive: never = wallet.chain;
  throw new Error(`Unhandled chain: ${_exhaustive}`);
}
```
Add as the final case of the switch. TypeScript will flag any future `Chain` extension that is not handled.

### WR-04: `VALID_CHAINS` and the `Chain` type are defined independently and can silently diverge

**File:** `app/api/portfolio/route.ts:4`
**Issue:** `VALID_CHAINS` is a local `as const` array. The `Chain` union in `types/wallet.ts` is defined independently as `"ethereum" | "bitcoin" | "solana"`. There is no compile-time enforcement that the two stay in sync. Adding a chain to one without the other causes either accepted-but-unhandled chains (if added to `VALID_CHAINS` only) or rejected-but-typed chains (if added to `Chain` only).
**Fix:** Create a single source of truth by exporting `VALID_CHAINS` from `types/wallet.ts` and deriving `Chain` from it:
```typescript
// types/wallet.ts
export const VALID_CHAINS = ["ethereum", "bitcoin", "solana"] as const;
export type Chain = (typeof VALID_CHAINS)[number];
```
Then import `VALID_CHAINS` in `route.ts` instead of redefining it locally.

### WR-05: Test 7 does not exercise the JSON parse `catch` branch

**File:** `__tests__/api/portfolio-route.test.ts:83-89`
**Issue:** `makeRequest("not-json")` passes the literal string `not-json` as the body. However, `"not-json"` is valid JSON (it is a JSON string value). `request.json()` successfully parses it to the JS string `"not-json"` — no exception is thrown. The handler reaches 400, but via the `typeof body !== "object"` check at line 34, not the `try/catch` at line 25. The actual `catch` block has zero test coverage despite the test name asserting otherwise.
**Fix:** Use a genuinely malformed JSON body:
```typescript
// makeRequest already passes string bodies through without JSON.stringify
const req = makeRequest("{bad-json");
```

### WR-06: `testEnvironment: "node"` with no polyfill for Web Fetch APIs

**File:** `jest.config.js:4`
**Issue:** Tests instantiate `NextRequest`, which extends the Web `Request` class. This global is available in Node.js 18+ but absent in Node 16. The Jest config does not specify a minimum Node version, does not add a `setupFiles` polyfill, and does not use an edge-runtime test environment. On Node 16 CI runners, every test will fail with `ReferenceError: Request is not defined` before any assertion runs.
**Fix:** Either document and enforce Node >= 18 in `package.json`:
```json
"engines": { "node": ">=18" }
```
Or add a polyfill setup file for older Node:
```js
// jest.setup.js
if (!globalThis.Request) {
  const { Request, Response, Headers, fetch } = require("undici");
  Object.assign(globalThis, { Request, Response, Headers, fetch });
}
```
```js
// jest.config.js
setupFiles: ["./jest.setup.js"],
```

---

## Info

### IN-01: Stale "RED phase" comment in test file

**File:** `__tests__/api/portfolio-route.test.ts:10-11`
**Issue:** "POST is not yet implemented — these tests will fail (RED phase)" is a leftover from the TDD scaffolding. The implementation exists; the comment is factually wrong and misleads future readers.
**Fix:** Remove lines 10-11.

### IN-02: No test for whitespace-only address

**File:** `__tests__/api/portfolio-route.test.ts`
**Issue:** No test case covers `{ address: "   ", chain: "ethereum" }`. This is the exact edge case that reveals WR-01. Without a test asserting a 400 response for blank-trimmed addresses, the validation gap is invisible to CI.
**Fix:**
```typescript
it("returns 400 for wallet with whitespace-only address", async () => {
  const req = makeRequest({ wallets: [{ address: "   ", chain: "ethereum" }] });
  const res = await POST(req);
  expect(res.status).toBe(400);
  const json = await res.json();
  expect(json).toHaveProperty("error");
});
```

### IN-03: No test for oversized `wallets` array

**File:** `__tests__/api/portfolio-route.test.ts`
**Issue:** No test exercises an array exceeding the maximum size. After CR-01 is fixed, the size limit needs test coverage.
**Fix:**
```typescript
it("returns 400 when wallets array exceeds maximum length", async () => {
  const tooMany = Array.from({ length: 101 }, (_, i) => ({
    address: `addr${i}`,
    chain: "ethereum",
  }));
  const req = makeRequest({ wallets: tooMany });
  const res = await POST(req);
  expect(res.status).toBe(400);
  const json = await res.json();
  expect(json).toHaveProperty("error");
});
```

### IN-04: Magic number `1.23` repeated in three `case` branches

**File:** `app/api/portfolio/route.ts:10,13,16`
**Issue:** The mock balance `1.23` is duplicated in all three `case` branches. If the mock value needs to change it must be updated in three places.
**Fix:**
```typescript
const MOCK_BALANCE = 1.23;
// ...
return { address: wallet.address, chain: wallet.chain, balance: MOCK_BALANCE };
```

---

_Reviewed: 2026-04-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
