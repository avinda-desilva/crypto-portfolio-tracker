# Phase 6: Bitcoin Balance Module - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning
**Source:** Inline spec from /gsd-plan-phase invocation

<domain>
## Phase Boundary

Create `lib/bitcoin.ts` that fetches a live BTC balance for any valid Bitcoin address via the Blockstream public API. No API key required. The module must be minimal and match the pattern established by `lib/ethereum.ts`.

</domain>

<decisions>
## Implementation Decisions

### API Endpoint
- Use Blockstream public API: `GET https://blockstream.info/api/address/:address`
- No API key required (public endpoint, no authentication)

### Balance Computation
- Extract `chain_stats.funded_txo_sum` (total sats received)
- Extract `chain_stats.spent_txo_sum` (total sats sent)
- Compute: `balance_sats = funded_txo_sum - spent_txo_sum`
- Convert to BTC: `balance_btc = balance_sats / 1e8`

### Function Signature
- Export: `async function getBitcoinBalance(address: string): Promise<number>`
- Return type is `number` (BTC amount as float)

### Error Handling
- Handle fetch failure (network error, HTTP error)
- Handle unexpected response structure (missing fields, wrong types)
- Return `0` on any failure — never throw
- No console.error required unless debug logging is part of existing pattern

### Implementation Constraints
- Keep implementation minimal — no extra abstractions
- No external npm packages for BTC — native `fetch` only
- Follow the same module structure as `lib/ethereum.ts` (singleton-free, function-only export)

### Claude's Discretion
- Test structure (mirror `lib/ethereum.test.ts` TDD approach from Phase 5)
- Whether to add a timeout to fetch
- Exact error detection logic for malformed response

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing chain module (pattern source)
- `lib/ethereum.ts` — Pattern to mirror: function export, 0-on-error, env key from process.env
- `.planning/phases/05-ethereum-balance-module/05-01-PLAN.md` — TDD task structure and test patterns

### Types
- `types/wallet.ts` — Chain type alias and PortfolioResult interface

### API Route (integration target)
- `app/api/portfolio/route.ts` — Where getBitcoinBalance will be called (Phase 8 integration)

### Requirements
- `.planning/REQUIREMENTS.md` — BTC-01 requirement definition

</canonical_refs>

<specifics>
## Specific Ideas

- Blockstream API response shape:
  ```json
  {
    "chain_stats": {
      "funded_txo_sum": 123456789,
      "spent_txo_sum": 12345678
    }
  }
  ```
- Satoshi-to-BTC conversion: `divide by 100_000_000 (1e8)`
- Known test address for manual verification: `1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf` (genesis block)

</specifics>

<deferred>
## Deferred Ideas

- Wiring into `app/api/portfolio/route.ts` — handled in Phase 8 (Aggregator Logic)
- mempool_stats inclusion (unconfirmed TXOs) — Phase 1 minimal surface; leave for later
- Address validation before fetch — deferred (caller is responsible)

</deferred>

---

*Phase: 06-bitcoin-balance-module*
*Context gathered: 2026-04-27 via inline spec*
