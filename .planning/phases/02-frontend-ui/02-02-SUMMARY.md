---
phase: 02-frontend-ui
plan: "02"
subsystem: ui
tags: [nextjs, react, typescript, dark-mode, wallet-ui, inline-styles]
dependency_graph:
  requires:
    - phase: 02-01
      provides: "Next.js 15 App Router runtime, tsconfig.json, next.config.ts"
    - phase: 01-01
      provides: "Chain and Wallet TypeScript types from types/wallet.ts"
  provides:
    - "app/layout.tsx — Next.js App Router root layout with dark body background"
    - "app/page.tsx — client component with wallet input form, wallet table, and empty state"
  affects: [03-localStorage-persistence, 09-connect-frontend-to-api]
tech_stack:
  added: []
  patterns:
    - "Next.js App Router Server Component for layout (no use client)"
    - "Single-file client component with inline styles (no CSS modules, no design system)"
    - "Inline onFocus/onBlur/onMouseEnter/onMouseLeave for interactive states without CSS"
    - "useState for wallets[], address, chain, error — all co-located in Home component"
    - "React JSX auto-escape for XSS safety — no dangerouslySetInnerHTML"
key_files:
  created:
    - app/layout.tsx
    - app/page.tsx
  modified: []
key-decisions:
  - "app/layout.tsx is a Server Component (no use client) — required by Next.js App Router root layout constraint"
  - "Inline styles used throughout page.tsx per D-02 (zero-dependency, no Tailwind, no CSS-in-JS)"
  - "Focus ring and hover states handled via inline onFocus/onBlur/onMouseEnter/onMouseLeave event handlers"
  - "Wallet remove uses index-based filter (not id) — sufficient for Phase 2 client-only state"
  - "Balance column renders U+2014 em dash placeholder — wired to real data in Phase 9"
patterns-established:
  - "Color tokens declared as const object at top of component file for traceability to UI-SPEC"
  - "Form validation: trim-check on submit, inline error paragraph, no HTML5 required attribute"
  - "Wallet table: address cell has title={wallet.address} for full-address tooltip on truncation"
requirements-completed: [UI-01, UI-02, UI-03]
duration: "continuation (tasks committed prior session)"
completed: "2026-04-26"
---

# Phase 02 Plan 02: Wallet UI Summary

**Dark-mode wallet input form and list built as a single Next.js App Router client component with inline styles, no dependencies beyond React and types/wallet.ts**

## Performance

- **Duration:** Continuation plan — Tasks 1-2 committed prior session, summary/state update this session
- **Started:** 2026-04-26
- **Completed:** 2026-04-26
- **Tasks:** 2 code tasks + 1 human-verify checkpoint (approved)
- **Files modified:** 2

## Accomplishments

- Created app/layout.tsx as a Next.js App Router Server Component setting dark body background (#0b0f14) and system font stack
- Created app/page.tsx with full dark-mode wallet management UI: address input, chain selector, Add Wallet form, wallet table with remove control, empty state, and inline error validation
- Human verification checkpoint passed: all 10 interaction checks approved by user

## Task Commits

Each task was committed atomically:

1. **Task 1: Create app/layout.tsx — root layout** - `4c18876` (feat)
2. **Task 2: Create app/page.tsx — wallet form and list** - `475843b` (feat)

## Files Created/Modified

- `app/layout.tsx` — Next.js App Router root layout; exports RootLayout; sets body background #0b0f14, font stack, minHeight 100vh; no "use client"
- `app/page.tsx` — Client component (use client); imports Chain/Wallet from types/wallet; useState for wallets/address/chain/error; handleSubmit with non-empty validation; handleRemove by index; dark-themed form, wallet table with truncated address + title tooltip, "—" balance placeholder, "×" remove button, empty state

## Decisions Made

- app/layout.tsx must be a Server Component — Next.js App Router prohibits "use client" on the root layout; body styling is applied via inline style prop instead
- Inline styles chosen for all interactive states (focus ring, hover) using onFocus/onBlur/onMouseEnter/onMouseLeave on individual elements — satisfies zero-dependency constraint (D-02)
- Index-based wallet removal (filter by index) is sufficient for Phase 2; wallet IDs are not required until persistence or server sync is added

## Deviations from Plan

None - plan executed exactly as written. Both files match the action blocks and acceptance criteria in 02-02-PLAN.md.

## Known Stubs

- `app/page.tsx` balance column renders `"—"` (U+2014 em dash) for every wallet. This is an intentional stub — Phase 9 (Connect Frontend to API) will replace this with real balance data fetched from `/api/portfolio`.

## Threat Flags

None — no new network endpoints, no server-side code, no file access patterns, no schema changes. app/page.tsx is a pure client component with no trust boundaries beyond user keyboard input rendered as React JSX text nodes (auto-escaped).

## Success Criteria Verification

- [x] app/layout.tsx exists, exports RootLayout, body background #0b0f14, no "use client"
- [x] app/page.tsx exists, "use client" as first line
- [x] app/page.tsx imports Chain and Wallet from "../types/wallet" (not redefined)
- [x] Four useState hooks: Wallet[], string (address), Chain ("ethereum"), string (error)
- [x] handleSubmit validates non-empty address, shows "Please enter a wallet address."
- [x] Wallet table: address truncated with title={wallet.address}, chain label, "—" balance, "×" remove
- [x] Empty state: "No wallets added yet" + "Add a wallet address above to get started."
- [x] No dangerouslySetInnerHTML, eval(), or innerHTML in page.tsx
- [x] Dark theme colors: #0b0f14 bg, #131920 surface, #3b82f6 accent, #ef4444 destructive
- [x] Human verification: all 10 interaction checks passed and approved

## Self-Check: PASSED

- app/layout.tsx: FOUND
- app/page.tsx: FOUND
- Commit 4c18876: FOUND (feat(02-02): create app/layout.tsx)
- Commit 475843b: FOUND (feat(02-02): create app/page.tsx)

## Next Phase Readiness

- Phase 2 complete: user can `npm run dev`, add wallets, see them in dark-mode table, remove them
- Phase 3 (localStorage Persistence) can now add useEffect to hydrate/persist the wallets[] state — no structural changes to page.tsx required
- Phase 9 (Connect Frontend to API) will replace the "—" balance stub with real data from /api/portfolio

---
*Phase: 02-frontend-ui*
*Completed: 2026-04-26*
