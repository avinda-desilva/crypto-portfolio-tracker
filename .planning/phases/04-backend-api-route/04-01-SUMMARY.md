---
phase: 04-backend-api-route
plan: 01
subsystem: api
tags: [next.js, app-router, typescript, jest, ts-jest, validation]

# Dependency graph
requires:
  - phase: 01-types
    provides: "Chain, Wallet, PortfolioResult types in types/wallet.ts"
provides:
  - "app/api/portfolio/route.ts — Next.js App Router POST handler"
  - "POST /api/portfolio contract: accepts { wallets: Wallet[] }, returns { results: PortfolioResult[] }"
  - "Jest test suite with 8 behavioral tests for the route handler"
affects:
  - 05-ethereum-module
  - 06-bitcoin-module
  - 07-solana-module
  - 08-aggregator-logic
  - 09-frontend-api

# Tech tracking
tech-stack:
  added: [jest, ts-jest, @types/jest]
  patterns: [next-app-router-route-handler, try-catch-body-parsing, typed-validation-before-cast]

key-files:
  created:
    - app/api/portfolio/route.ts
    - __tests__/api/portfolio-route.test.ts
    - jest.config.js
  modified:
    - package.json
    - tsconfig.json

key-decisions:
  - "Import path is ../../../types/wallet (3 levels up) not ../../types/wallet — route is at app/api/portfolio/route.ts"
  - "VALID_CHAINS as const array used for runtime chain validation before casting to Chain type"
  - "Switch on wallet.chain is exhaustive — TypeScript enforces all three cases are covered"
  - "Jest testPathIgnorePatterns excludes wallet-types.test.ts which uses tsc --noEmit as its runner"
  - "tsconfig types field includes jest and node so tsc --noEmit passes on test files"

patterns-established:
  - "Pattern: Next.js App Router route handler — export async function POST(request: NextRequest)"
  - "Pattern: try/catch around request.json() returns 400 for malformed JSON"
  - "Pattern: runtime array + item validation before type casting to domain types"
  - "Pattern: TDD with Jest for Next.js route handlers — construct NextRequest, call POST directly"

requirements-completed: [API-01]

# Metrics
duration: 12min
completed: 2026-04-26
---

# Phase 4 Plan 01: Backend API Route Summary

**Next.js App Router POST /api/portfolio handler with JSON validation, per-item wallet checking, and mock 1.23 balance response — TDD with 8 Jest tests**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-26T00:00:00Z
- **Completed:** 2026-04-26T00:12:00Z
- **Tasks:** 1 (TDD: RED + GREEN + fix)
- **Files modified:** 5

## Accomplishments
- Created `app/api/portfolio/route.ts` implementing the POST handler with full input validation
- Established the API contract (`{ wallets: Wallet[] }` → `{ results: PortfolioResult[] }`) that Phases 5-7 will wire to real chain modules
- Switch block with ethereum/bitcoin/solana cases and TODO Phase 5/6/7 comments provides the integration scaffold
- 8 Jest behavioral tests (TDD RED/GREEN) covering all validation paths and success cases
- Set up Jest + ts-jest test infrastructure for the project

## Task Commits

Each task was committed atomically with TDD gate compliance:

1. **RED — Failing tests** - `1a5a0ac` (test): 8 behavioral tests for POST /api/portfolio handler + Jest setup
2. **GREEN — Implementation** - `2a66018` (feat): POST handler with try/catch body parse, array validation, per-item validation, switch on chain
3. **Fix — Jest config** - `7a3aa75` (fix): Exclude tsc-only wallet-types.test.ts from Jest runner

**Plan metadata:** (docs commit — created in final step)

_TDD tasks have three commits: test (RED) → feat (GREEN) → fix (post-GREEN correction)_

## Files Created/Modified
- `app/api/portfolio/route.ts` — POST handler: body parsing, wallets validation, per-item validation, switch/mock response
- `__tests__/api/portfolio-route.test.ts` — 8 Jest tests covering all 8 plan behaviors
- `jest.config.js` — Jest config with ts-jest transform and testPathIgnorePatterns
- `package.json` — Added jest, ts-jest, @types/jest devDependencies; added `test` script
- `tsconfig.json` — Added `types: ["jest", "node"]` so tsc --noEmit passes on test files

## Decisions Made
- Import path corrected to `../../../types/wallet` (plan spec had `../../types/wallet` which is one level too shallow for the actual file location at `app/api/portfolio/route.ts`)
- `VALID_CHAINS as const` array used for runtime validation — allows `.includes()` with proper type narrowing before casting
- `testPathIgnorePatterns` in jest.config.js excludes `wallet-types.test.ts` which is a TypeScript compile-time test file with no Jest `it()` calls

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added jest types to tsconfig**
- **Found during:** Task 1 (after GREEN implementation, running tsc --noEmit)
- **Issue:** `describe`, `it`, `expect` are not typed — tsc --noEmit reports errors in test files
- **Fix:** Added `"types": ["jest", "node"]` to tsconfig.json compilerOptions
- **Files modified:** tsconfig.json
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `2a66018` (GREEN implementation commit)

**2. [Rule 2 - Missing Critical] Exclude wallet-types.test.ts from Jest**
- **Found during:** Post-GREEN test run (`npx jest`)
- **Issue:** Pre-existing `__tests__/wallet-types.test.ts` has no Jest `it()` calls (it's a tsc compile-time test); Jest fails the suite with "must contain at least one test"
- **Fix:** Added `testPathIgnorePatterns` to jest.config.js excluding that file
- **Files modified:** jest.config.js
- **Verification:** `npx jest` runs 8 tests, 0 failures
- **Committed in:** `7a3aa75` (separate fix commit)

---

**Total deviations:** 2 auto-fixed (both Rule 2 - missing critical configuration)
**Impact on plan:** Both fixes necessary for `npx tsc --noEmit` and `npx jest` to exit 0. No scope creep.

## Issues Encountered
- Plan spec had import path `../../types/wallet` but file is at `app/api/portfolio/route.ts` (3 dirs deep) — correct path is `../../../types/wallet`. Fixed inline, no functional impact.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) | `1a5a0ac` | PASS — all 8 tests fail with "Cannot find module" |
| GREEN (feat) | `2a66018` | PASS — all 8 tests pass |
| REFACTOR | N/A | No refactor needed |

## User Setup Required
None — no external service configuration required. This is a skeleton handler with mock data only.

## Next Phase Readiness
- `app/api/portfolio/route.ts` exports `POST` and is ready for Phase 5 (Ethereum) to replace the switch case
- Switch structure: `case "ethereum"` has `// TODO: Phase 5`, `case "bitcoin"` has `// TODO: Phase 6`, `case "solana"` has `// TODO: Phase 7`
- API contract is established: POST body `{ wallets: Wallet[] }`, response `{ results: PortfolioResult[] }`
- Jest test infrastructure in place for future phases to add tests

---
*Phase: 04-backend-api-route*
*Completed: 2026-04-26*
