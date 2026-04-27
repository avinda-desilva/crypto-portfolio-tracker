# Phase 5: Ethereum Balance Module - Pattern Map

**Mapped:** 2026-04-27
**Files analyzed:** 2 (1 new, 1 modified)
**Analogs found:** 2 / 2

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `lib/ethereum.ts` | service | request-response | `app/api/portfolio/route.ts` | role-partial / best available |
| `app/api/portfolio/route.ts` | route | request-response | self (existing file) | exact — in-place modification |

**Note on analog quality:** No `lib/` directory exists yet; `lib/ethereum.ts` is the first service-layer module. The route file (`app/api/portfolio/route.ts`) is the single closest analog for TypeScript style, import conventions, named exports, and error handling shape. `types/wallet.ts` provides the type contract analog.

---

## Pattern Assignments

### `lib/ethereum.ts` (service, request-response)

**Primary analog:** `app/api/portfolio/route.ts`
**Type contract analog:** `types/wallet.ts`

#### Imports pattern

Sourced from `app/api/portfolio/route.ts` lines 1-2 and `types/wallet.ts` lines 13-14.

The project uses:
- Named imports only (no default imports from project files)
- Relative paths without path aliases for cross-directory imports (`../types/wallet` not `@/types/wallet` — confirm with tsconfig `@/*` alias if preferred)
- SDK/framework imports first, then internal types

```typescript
// SDK imports first, then internal types — follow this order
import { Alchemy, Network } from "alchemy-sdk";
import type { PortfolioResult } from "../types/wallet";
```

#### Module-level singleton pattern

No direct codebase analog exists. Per D-05, a module-level instance is required. Pattern is standard Node.js module singleton — initialize once at module scope, reuse across calls:

```typescript
// Module-level singleton — created once, reused across Next.js requests
const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});
```

#### Core function pattern — named export, async, returns primitive

Sourced from `app/api/portfolio/route.ts` lines 20-21 (named async export shape) and decisions D-01/D-02/D-14.

```typescript
// Named export only — no default export (matches types/wallet.ts and route.ts convention)
export async function getEthereumBalance(address: string): Promise<number> {
  // ... implementation
}
```

#### Error handling pattern — try/catch returning 0

Sourced from `app/api/portfolio/route.ts` lines 22-30 (try/catch structure) adapted for D-10/D-11/D-12.

The route uses try/catch with early returns on failure. The lib module follows the same shape but returns `0` instead of an HTTP error response:

```typescript
// From app/api/portfolio/route.ts lines 22-30 — try/catch with explicit failure path
try {
  body = await request.json();
} catch {
  return NextResponse.json(
    { error: "Invalid JSON body" },
    { status: 400 }
  );
}

// Adapt for lib/ethereum.ts — same try/catch skeleton, return 0 instead of HTTP error
export async function getEthereumBalance(address: string): Promise<number> {
  try {
    // ... fetch and convert
    return balance;
  } catch (err) {
    console.error(`[ethereum] getEthereumBalance failed for address ${address}:`, err);
    return 0;
  }
}
```

#### Wei conversion pattern

No codebase analog — new arithmetic per D-09:

```typescript
const balanceInWei = await alchemy.core.getBalance(address);
return Number(balanceInWei) / 1e18;
```

#### Full assembled pattern for `lib/ethereum.ts`

```typescript
import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

export async function getEthereumBalance(address: string): Promise<number> {
  try {
    const balanceInWei = await alchemy.core.getBalance(address);
    return Number(balanceInWei) / 1e18;
  } catch (err) {
    console.error(`[ethereum] getEthereumBalance failed for address ${address}:`, err);
    return 0;
  }
}
```

---

### `app/api/portfolio/route.ts` (route, request-response) — modification only

**Analog:** self — existing file read above

This is a targeted in-place edit. The only change is in the `getMockBalance` function, `case "ethereum":` branch (lines 8-10).

#### Current stub (lines 8-10):

```typescript
case "ethereum":
  // TODO: Phase 5 — replace with lib/ethereum.ts call
  return { address: wallet.address, chain: wallet.chain, balance: 1.23 };
```

#### Target pattern — import and call site:

Add import at top of file (after existing imports, lines 1-2):

```typescript
import { getEthereumBalance } from "../../../lib/ethereum";
```

Replace stub in `getMockBalance`. Because `getMockBalance` is currently synchronous but `getEthereumBalance` is async, the function signature and call site in `POST` must both become async:

```typescript
// getMockBalance becomes async
async function getEthBalance(wallet: Wallet): Promise<PortfolioResult> {
  const balance = await getEthereumBalance(wallet.address);
  return { address: wallet.address, chain: wallet.chain, balance };
}
```

The `validWallets.map(getMockBalance)` call at line 69 becomes `Promise.all(validWallets.map(...))` to handle async properly:

```typescript
// From route.ts line 69 — current synchronous map
const results: PortfolioResult[] = validWallets.map(getMockBalance);

// Phase 5 modification — async map with Promise.all
const results: PortfolioResult[] = await Promise.all(
  validWallets.map(async (wallet) => {
    switch (wallet.chain) {
      case "ethereum":
        return { address: wallet.address, chain: wallet.chain, balance: await getEthereumBalance(wallet.address) };
      case "bitcoin":
        // TODO: Phase 6 — replace with lib/bitcoin.ts call
        return { address: wallet.address, chain: wallet.chain, balance: 1.23 };
      case "solana":
        // TODO: Phase 7 — replace with lib/solana.ts call
        return { address: wallet.address, chain: wallet.chain, balance: 1.23 };
    }
  })
);
```

---

## Shared Patterns

### Named exports only — no default exports

**Source:** `types/wallet.ts` (all named exports), `app/api/portfolio/route.ts` line 20 (`export async function POST`)
**Apply to:** `lib/ethereum.ts`

```typescript
// types/wallet.ts pattern — named exports throughout
export type Chain = ...
export interface Wallet { ... }
export interface PortfolioResult { ... }

// route.ts pattern — named export function
export async function POST(request: NextRequest): Promise<NextResponse> { ... }

// lib/ethereum.ts must follow same convention
export async function getEthereumBalance(address: string): Promise<number> { ... }
```

### TypeScript strict mode

**Source:** `tsconfig.json` line 8 (`"strict": true`)
**Apply to:** All files including `lib/ethereum.ts`

- No implicit `any`
- `process.env.ALCHEMY_API_KEY` is `string | undefined` — Alchemy SDK accepts this; no cast needed unless TSC complains, in which case use `process.env.ALCHEMY_API_KEY ?? ""`
- Return type must be explicitly declared: `Promise<number>`

### Relative import paths

**Source:** `app/api/portfolio/route.ts` line 2 (`../../../types/wallet`)
**Apply to:** Import of `lib/ethereum.ts` into `route.ts`

```typescript
// route.ts uses deep relative paths — follow same convention
import type { Wallet, PortfolioResult } from "../../../types/wallet";

// Phase 5 addition follows same pattern
import { getEthereumBalance } from "../../../lib/ethereum";
```

### Environment variable access

**Source:** Decision D-07, consistent with project `.env.local` convention
**Apply to:** `lib/ethereum.ts` Alchemy initialization

```typescript
// Never hardcoded — always from process.env
apiKey: process.env.ALCHEMY_API_KEY,
```

### Test file structure

**Source:** `__tests__/api/portfolio-route.test.ts` lines 1-21

Tests in this project:
- Live in `__tests__/` mirroring the source path
- Use `describe` + `it` blocks
- Import via `require()` for CommonJS compatibility with jest
- Use a `makeRequest` helper for setup

```typescript
// __tests__/api/portfolio-route.test.ts lines 8-21 — test file structure to copy
import { NextRequest } from "next/server";
const { POST } = require("../../app/api/portfolio/route");

function makeRequest(body: unknown): NextRequest {
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  return new NextRequest("http://localhost:3000/api/portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyStr,
  });
}

describe("POST /api/portfolio", () => {
  it("...", async () => { ... });
});
```

For `lib/ethereum.ts` tests, the analog pattern is:

```typescript
// __tests__/lib/ethereum.test.ts — inferred from existing test conventions
jest.mock("alchemy-sdk");  // mock SDK at module level
const { getEthereumBalance } = require("../../lib/ethereum");

describe("getEthereumBalance", () => {
  it("returns ETH balance as number", async () => { ... });
  it("returns 0 on SDK error", async () => { ... });
  it("returns 0 for invalid address", async () => { ... });
});
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `lib/ethereum.ts` (module-level singleton) | service | request-response | No `lib/` directory exists; this is the first service-layer module in the project. Singleton initialization pattern has no codebase precedent — use standard Node.js module scope pattern. |

---

## Prerequisite: Package Installation

`alchemy-sdk` is NOT in `package.json`. Planner must include this as the first step:

```bash
npm install alchemy-sdk
```

**Verify install target:** `package.json` `"dependencies"` block (not `devDependencies` — it is a runtime dependency).

---

## Metadata

**Analog search scope:** `/app/`, `/types/`, `/__tests__/`
**Files scanned:** 4 (`route.ts`, `wallet.ts`, `portfolio-route.test.ts`, `wallet-types.test.ts`)
**Pattern extraction date:** 2026-04-27
