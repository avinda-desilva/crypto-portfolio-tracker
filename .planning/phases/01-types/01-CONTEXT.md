# Phase 1: Types - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Define TypeScript interfaces in `/types/wallet.ts` that all subsequent phases import. Zero runtime logic — pure type definitions. These contracts lock the data shapes that Phases 2–14 build against.

</domain>

<decisions>
## Implementation Decisions

### Type names and fields

- **D-01:** Two interfaces only: `Wallet` and `PortfolioResult` (not `ChainBalance` + `PortfolioResponse`)
- **D-02:** `Wallet` fields: `address: string`, `chain: "ethereum" | "bitcoin" | "solana"`
- **D-03:** `PortfolioResult` fields: `address: string`, `chain: string`, `balance: number`

### Chain representation

- **D-04:** Chain values are lowercase full names: `"ethereum"`, `"bitcoin"`, `"solana"` — not `"ETH"` / `"BTC"` / `"SOL"` abbreviations

### Identity

- **D-05:** No `id` field on `Wallet` — `address + chain` is the composite identity

### Minimal surface

- **D-06:** No `usdValue` field in types for Phase 1 — kept minimal
- **D-07:** No error state fields in types for Phase 1 — kept minimal

### Claude's Discretion

- Whether to export a `Chain` type alias for the union (`"ethereum" | "bitcoin" | "solana"`) to avoid duplication
- File-level JSDoc comment style

</decisions>

<specifics>
## Specific Ideas

User's exact spec:

```ts
// Wallet
address: string
chain: "ethereum" | "bitcoin" | "solana"

// PortfolioResult
address: string
chain: string
balance: number
```

Keep it minimal.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements are fully captured in decisions above.

Phase roadmap reference: `.planning/ROADMAP.md` §Phase 1 (success criteria)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- None — greenfield project. Only `README.md` exists at repo root.

### Established Patterns

- None yet — this is Phase 1.

### Integration Points

- `/types/wallet.ts` will be imported by:
  - `app/page.tsx` (Phase 2) — uses `Wallet` for the list state
  - `app/api/portfolio/route.ts` (Phase 4) — uses `PortfolioResult` for API response shape
  - `lib/ethereum.ts`, `lib/bitcoin.ts`, `lib/solana.ts` (Phases 5–7) — return `PortfolioResult`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-types*
*Context gathered: 2026-04-26*
