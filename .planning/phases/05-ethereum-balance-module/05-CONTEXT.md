# Phase 5: Ethereum Balance Module - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `lib/ethereum.ts` — a standalone server-side module that fetches a live ETH balance for a given address via the Alchemy SDK and returns a plain `number` (ETH, not wei). No aggregation, no UI, no caching — those are later phases. The route in `app/api/portfolio/route.ts` will replace its Phase-5 TODO stub with a call to this module.

</domain>

<decisions>
## Implementation Decisions

### API and export shape

- **D-01:** Single exported function: `export async function getEthereumBalance(address: string): Promise<number>`
- **D-02:** Return value is always a `number` — the function never throws to the caller
- **D-03:** On any failure (invalid address, network error, missing env var): `console.error` the error and return `0`

### Alchemy SDK

- **D-04:** Use the `alchemy-sdk` npm package (not the legacy `@alch/alchemy-web3`)
- **D-05:** Initialize a module-level singleton `Alchemy` instance so it is created once and reused across calls (avoids re-instantiation on every Next.js request)
- **D-06:** Network: `Network.ETH_MAINNET`
- **D-07:** API key sourced from `process.env.ALCHEMY_API_KEY` — never hardcoded; assume `.env.local` exists

### Address validation

- **D-08:** No client-side regex validation — let the Alchemy SDK throw for invalid addresses; the `try/catch` catches it and returns `0`. This keeps address validation consistent: all errors follow the same path.

### Wei conversion

- **D-09:** Convert with standard floating-point division: `Number(balanceInWei) / 1e18`. Sufficient precision for personal portfolio display.

### Error handling

- **D-10:** Wrap the entire function body in `try/catch`
- **D-11:** Log with `console.error` — include the address and the error so it's debuggable in server logs
- **D-12:** Return `0` on failure — do NOT re-throw (the API route must not crash)

### Module style

- **D-13:** Clean, minimal module — no abstraction beyond one exported function and one module-level client instance
- **D-14:** No default export — named export only (consistent with `types/wallet.ts` pattern)

### Claude's Discretion

- Exact error message format in `console.error` call
- Whether to name the module-level instance `alchemy` or `alchemyClient`
- Import order (SDK imports before internal types)

</decisions>

<specifics>
## Specific Ideas

From user's inline spec (verbatim):

```
Use Alchemy SDK
Initialize client with: process.env.ALCHEMY_API_KEY
Export: async function getEthereumBalance(address: string): Promise<number>
Call getBalance(address) → convert wei → ETH (divide by 1e18) → return number
If address is invalid: return 0 (consistent with error handling rule)
Wrap in try/catch, console.error on failure, return 0
Do NOT hardcode API key
Assume .env.local exists
Clean, minimal module with one exported function
```

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Types
- `types/wallet.ts` — `PortfolioResult` shape that callers expect; confirms `balance: number` field

### Integration target
- `app/api/portfolio/route.ts` — Phase 4 route stub contains `// TODO: Phase 5 — replace with lib/ethereum.ts call` in the `case "ethereum":` branch; this is the exact call site Phase 5 must satisfy

### No external specs
No ADRs or design docs for this phase — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `types/wallet.ts` exports `PortfolioResult` (`{ address, chain, balance }`); the return value of `getEthereumBalance` maps directly to `balance`

### Established Patterns
- Phase 4 route (`app/api/portfolio/route.ts`): named exports only, no default exports — follow same convention
- Project constraint: no unnecessary abstraction (PROJECT.md: "If something can be done in 20 lines, don't abstract it into 80")
- Env vars stored in `.env.local` — Alchemy key follows the same pattern as Helius key (Phase 7)

### Integration Points
- `app/api/portfolio/route.ts` `case "ethereum":` stub → replace mock `1.23` with `await getEthereumBalance(wallet.address)`
- Phase 8 Aggregator: will call `getEthereumBalance` alongside BTC/SOL modules and CoinGecko prices

### Dependencies not yet installed
- `alchemy-sdk` is NOT in `package.json` — planner must include `npm install alchemy-sdk` as a prerequisite step

</code_context>

<deferred>
## Deferred Ideas

- Retry logic on transient Alchemy errors — Phase 12 (Error Handling, ERR-02)
- Per-wallet error objects in API response — Phase 12 (ERR-01)
- Environment variable validation at startup — Phase 13 (ENV-02)

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-ethereum-balance-module*
*Context gathered: 2026-04-27*
