# Phase 3: localStorage Persistence - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Modify the existing `app/page.tsx` client component to persist the wallet list in `localStorage`. Wallets added in one session must survive a hard page reload; wallets removed before reload must be absent after. No new UI, no backend, no external libraries — pure browser storage wired to the existing React state.

</domain>

<decisions>
## Implementation Decisions

### Storage mechanism

- **D-01:** Use `localStorage` with key `"wallets"` (exact string)
- **D-02:** Serialize with `JSON.stringify`; deserialize with `JSON.parse`
- **D-03:** No external libraries — only native browser APIs

### Initial load (mount effect)

- **D-04:** A `useEffect` with empty dependency array `[]` reads from localStorage on component mount
- **D-05:** If the key is absent (empty localStorage), treat as an empty list — do not crash
- **D-06:** Wrap `JSON.parse` in a try/catch; on any parse failure, silently fall back to an empty list — do not crash or show an error

### Sync effect (write-back)

- **D-07:** A second `useEffect` with `[wallets]` as dependency writes the current wallet list to localStorage on every state change
- **D-08:** This runs after every add and after every remove — always in sync

### UX

- **D-09:** UI renders immediately using the initial `useState([])` value; the load effect fires after first render and populates state, causing one re-render — no loading spinner, no flash of empty state beyond the initial frame
- **D-10:** No loading state variable needed

### Code organisation

- **D-11:** Both `useEffect` hooks live inside `Home()` in `app/page.tsx` — no new files, no custom hooks, no abstraction
- **D-12:** Add `useEffect` to the existing React import in `app/page.tsx`

</decisions>

<specifics>
## Specific Ideas

From the user's spec (provided verbatim in the discussion arguments):

> Use useEffect for:
> 1. Initial load — on component mount, read from localStorage, parse JSON safely, populate state
> 2. Sync — whenever wallets state changes, update localStorage
>
> Key name: "wallets" | JSON.stringify / JSON.parse | Handle: localStorage empty, JSON parse failure | Do NOT crash on invalid data
>
> UI should render immediately even if storage is empty. No loading spinner.
> Keep logic inside page.tsx (no abstraction yet). Do NOT introduce external libraries.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### File to modify
- `app/page.tsx` — existing client component; add two `useEffect` hooks inside `Home()`. Current state: `useState<Wallet[]>([])` already declared. Import already has `useState` from `"react"` — extend to also import `useEffect`.

### Types
- `types/wallet.ts` — `Wallet` interface used for typed `JSON.parse` result casting

### Requirements
- `.planning/REQUIREMENTS.md` §STOR-01, STOR-02 — acceptance criteria for this phase
- `.planning/ROADMAP.md` §Phase 3 — success criteria (wallets present after reload, absent after remove+reload, populated before user interaction)

No external specs — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/page.tsx` — `Home()` function component with `"use client"`, `useState<Wallet[]>([])` already declared. This is the only file to modify.
- `types/wallet.ts` — `Wallet` type (`address: string`, `chain: Chain`) for casting deserialized JSON

### Established Patterns
- Phase 2 decision D-01: all logic stays in `app/page.tsx` (no separate component files) — Phase 3 continues this pattern
- Phase 2 decision D-02: wallet list state is `useState<Wallet[]>` — the load effect sets this state; the sync effect reads it
- No id field on `Wallet` — index-based removal is already in place; localStorage persists the same shape

### Integration Points
- The two new `useEffect` hooks plug into the existing `wallets` / `setWallets` state pair — no new state variables needed beyond the existing ones
- Phase 9 (Connect Frontend to API) will read the same `wallets` state; localStorage shape must stay `Wallet[]`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-localstorage-persistence*
*Context gathered: 2026-04-26*
