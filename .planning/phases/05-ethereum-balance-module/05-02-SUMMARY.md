---
phase: 05-ethereum-balance-module
plan: 02
subsystem: api
tags: [alchemy-sdk, ethereum, jest, typescript, next-js, promise-all]

# Dependency graph
requires:
  - phase: 05-01
    provides: "lib/ethereum.ts — getEthereumBalance(address: string): Promise<number>"
  - phase: 04-backend-api-route
    provides: "app/api/portfolio/route.ts — POST handler with validation logic"
provides:
  - "app/api/portfolio/route.ts — wired to real getEthereumBalance via Promise.all async map"
  - "__tests__/api/portfolio-route.test.ts — module-level jest.mock for lib/ethereum.ts"
affects:
  - 06-bitcoin-module
  - 07-solana-module
  - 08-aggregator-logic

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Async Promise.all map in API route — replaces synchronous map with concurrent async balance fetches"
    - "Module-level jest.mock for chain lib — isolates API route tests from real network calls"

key-files:
  created: []
  modified:
    - app/api/portfolio/route.ts
    - __tests__/api/portfolio-route.test.ts

key-decisions:
  - "Promise.all with inline switch replaces getMockBalance — avoids extra function abstraction, clear per-chain branching"
  - "Mock returns 1.23 matching existing test assertions — no test assertion value changes needed"
  - "jest.mock path is ../../lib/ethereum (2 levels up from __tests__/api/) — matches directory structure"

patterns-established:
  - "Chain mock pattern: jest.mock at module level before imports, mockResolvedValue for async functions"
  - "Incremental wiring pattern: one chain real, others stubbed — each phase completes one chain"

requirements-completed: [ETH-01]

# Metrics
duration: 3min
completed: 2026-04-27
---

# Phase 5 Plan 02: Ethereum Balance Module — Route Wiring Summary

**Portfolio route wired to real Alchemy ETH balance via async Promise.all, with module-level jest.mock isolating tests from network calls**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-27T18:25:00Z
- **Completed:** 2026-04-27T18:27:48Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced synchronous `getMockBalance` stub in `app/api/portfolio/route.ts` with async `Promise.all` map that calls real `getEthereumBalance` for ethereum wallets
- Added `jest.mock("../../lib/ethereum")` at module level in `__tests__/api/portfolio-route.test.ts` to prevent real Alchemy SDK calls during tests
- All 12 tests pass (8 route + 4 ethereum); TypeScript type-check clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor route.ts — replace mock with async getEthereumBalance call** - `f40ad2d` (feat)
2. **Task 2: Update portfolio-route.test.ts to mock lib/ethereum.ts** - `8fd3089` (test)

## Files Created/Modified

- `app/api/portfolio/route.ts` — Removed `getMockBalance`; added `getEthereumBalance` import; replaced `.map(getMockBalance)` with `await Promise.all(...)` with inline switch; BTC/SOL still return stubbed 1.23 (Phases 6/7)
- `__tests__/api/portfolio-route.test.ts` — Added `jest.mock("../../lib/ethereum", () => ({ getEthereumBalance: jest.fn().mockResolvedValue(1.23) }))` before imports

## Decisions Made

- `Promise.all` with inline async switch: avoids extra function abstraction while enabling concurrent per-chain async fetches; each chain case is self-contained and easy to replace in future phases.
- Mock returns `1.23`: matches existing Test 1 assertion so no test values needed to change; keeps tests green while making the ethereum path deterministic.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no new external service configuration required. ALCHEMY_API_KEY must already be set in `.env.local` (documented in 05-01 SUMMARY).

## Next Phase Readiness

- ETH-01 requirement complete end-to-end: `POST /api/portfolio` with an ethereum wallet now calls real `getEthereumBalance`
- BTC and SOL cases still return hardcoded 1.23 — ready for Phase 6 (bitcoin) and Phase 7 (solana) to replace
- Test suite structure established: each new chain module mock follows the same `jest.mock` at module level pattern

---
*Phase: 05-ethereum-balance-module*
*Completed: 2026-04-27*
