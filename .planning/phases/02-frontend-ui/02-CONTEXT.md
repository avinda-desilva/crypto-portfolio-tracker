# Phase 2: Frontend UI (Wallet Input) - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a wallet input form and wallet list display in `app/page.tsx`. User can add wallet addresses with chain selection and see them listed with balance placeholders. No API calls, no persistence — pure React state only. localStorage and API wiring are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Component structure

- **D-01:** Everything lives in a single `app/page.tsx` file with `"use client"` directive — no separate component files for this phase
- **D-02:** Wallet list state managed with `useState<Wallet[]>` from React

### Form

- **D-03:** Chain selector uses a `<select>` dropdown with options: ethereum / bitcoin / solana
- **D-04:** Add validation: non-empty address check only — format/pattern validation is deferred to Phase 12 (Error Handling)
- **D-05:** No duplicate prevention — allow the same address+chain to be added multiple times (KISS)

### Display

- **D-06:** Balance column renders `"—"` as placeholder before any API data (Phase 9 wires real data)
- **D-07:** Delete control per wallet row removes it from the list

### Styling

- **D-08:** No styling requirements — functional HTML is sufficient; minimal or no Tailwind for this phase

### Out of scope for this phase

- No API calls
- No localStorage reads/writes (Phase 3)
- No balance data (Phase 9)

</decisions>

<specifics>
## Specific Ideas

User's exact spec:

> Create a Next.js client component (page.tsx) that:
> - Allows user to: Input wallet address, Select chain (ethereum, bitcoin, solana), Add wallet to list
> - Displays wallet list
> - Uses React state (useState)
> Do NOT include API calls yet. Keep UI simple (no styling needed).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Types (Phase 1 — already complete)
- `types/wallet.ts` — `Wallet` interface (`address: string`, `chain: Chain`) and `Chain` type alias. Import these directly; do not redefine.

### Requirements
- `.planning/REQUIREMENTS.md` §UI-01, UI-02, UI-03 — acceptance criteria for this phase

### Roadmap
- `.planning/ROADMAP.md` §Phase 2 — success criteria and dependency on Phase 1

No external specs — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `types/wallet.ts` — exports `Wallet`, `PortfolioResult`, and `Chain`. Import `Wallet` and `Chain` for state typing.

### Established Patterns
- Chain values are lowercase full names: `"ethereum"`, `"bitcoin"`, `"solana"` (not ETH/BTC/SOL abbreviations) — D-04 from Phase 1 context
- No id field on Wallet — address+chain is the composite identity

### Integration Points
- `app/page.tsx` will be imported by Phase 3 (add localStorage sync) and Phase 9 (add API fetch + real balance rendering)
- The wallet list state shape (`Wallet[]`) is the contract that Phase 3 persists and Phase 9 augments with balance data

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-frontend-ui*
*Context gathered: 2026-04-26*
