# Roadmap: Crypto Portfolio Tracker

## Overview

Ten sequential phases build a personal crypto portfolio tracker from shared TypeScript types through a live, auto-refreshing balance dashboard. Each phase delivers a discrete, verifiable capability: types first, then UI shell, then persistence, then backend plumbing per chain, then aggregation, then wiring, then automation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Types** - Shared TypeScript interfaces for wallet, balance, and portfolio response
- [ ] **Phase 2: Frontend UI (Wallet Input)** - Wallet input form with chain selector and display shell
- [ ] **Phase 3: localStorage Persistence** - Wallet list persists and loads across page reloads
- [ ] **Phase 4: Backend API Route (Skeleton)** - API route structure that accepts wallet params and returns shaped response
- [ ] **Phase 5: Ethereum Balance Module** - Alchemy integration fetching live ETH balances
- [ ] **Phase 6: Bitcoin Balance Module** - blockchain.info integration fetching live BTC balances
- [ ] **Phase 7: Solana Balance Module** - Helius RPC integration fetching live SOL balances
- [ ] **Phase 8: Aggregator Logic** - Chain modules combined with CoinGecko prices and server-side cache
- [ ] **Phase 9: Connect Frontend to API** - UI wired to /api/portfolio rendering real balance data
- [ ] **Phase 10: Auto Refresh** - 2-minute polling loop and manual refresh button

## Phase Details

### Phase 1: Types
**Goal**: Shared TypeScript contracts exist so all subsequent phases build against a stable interface
**Depends on**: Nothing (first phase)
**Requirements**: TYPES-01
**Success Criteria** (what must be TRUE):
  1. `Wallet`, `ChainBalance`, and `PortfolioResponse` interfaces are exported from `/types/wallet.ts`
  2. TypeScript compiles with no errors when these types are imported anywhere in the project
  3. Each interface covers all fields needed by later phases (address, chain, native balance, USD value, error state)
**Plans**: TBD

### Phase 2: Frontend UI (Wallet Input)
**Goal**: User can add wallets and see them listed, with balance placeholders ready for real data
**Depends on**: Phase 1
**Requirements**: UI-01, UI-02, UI-03
**Success Criteria** (what must be TRUE):
  1. User can type a wallet address, select a chain (ETH / BTC / SOL), and click Add to append it to the list
  2. Wallet list displays each entry with its address and chain label
  3. User can remove any wallet from the list via a delete control
  4. Balance column renders a visible placeholder (e.g., "—") before any API data loads
**Plans**: TBD
**UI hint**: yes

### Phase 3: localStorage Persistence
**Goal**: Wallet list survives page reloads without any backend storage
**Depends on**: Phase 2
**Requirements**: STOR-01, STOR-02
**Success Criteria** (what must be TRUE):
  1. Wallets added in one session are present after a hard page reload
  2. Wallets removed before reload are absent after reload
  3. On initial render the wallet list is populated from localStorage before any user interaction
**Plans**: TBD

### Phase 4: Backend API Route (Skeleton)
**Goal**: `/api/portfolio` exists, accepts wallet query params, and returns a correctly shaped (stubbed) response
**Depends on**: Phase 1
**Requirements**: API-01, API-02
**Success Criteria** (what must be TRUE):
  1. `GET /api/portfolio?wallets=...` responds with HTTP 200 and a JSON body matching `PortfolioResponse`
  2. A malformed or missing wallet entry returns a per-entry error object without failing the whole response
  3. The route file is structured with clear placeholders for chain module calls (ready for Phase 5-7 integration)
**Plans**: TBD

### Phase 5: Ethereum Balance Module
**Goal**: `lib/ethereum.ts` fetches a real ETH balance for any valid address via Alchemy
**Depends on**: Phase 4
**Requirements**: ETH-01
**Success Criteria** (what must be TRUE):
  1. Calling the module with a known ETH address returns a numeric balance in ETH
  2. An invalid address or Alchemy API error returns a structured error (not a thrown exception) that the caller can handle
  3. The Alchemy API key is read from `ALCHEMY_API_KEY` in `.env.local` and never hardcoded
**Plans**: TBD

### Phase 6: Bitcoin Balance Module
**Goal**: `lib/bitcoin.ts` fetches a real BTC balance for any valid address via blockchain.info
**Depends on**: Phase 4
**Requirements**: BTC-01
**Success Criteria** (what must be TRUE):
  1. Calling the module with a known BTC address returns a numeric balance in BTC
  2. A network error or invalid address returns a structured error the caller can handle
  3. No API key is required — the module calls the public blockchain.info endpoint directly
**Plans**: TBD

### Phase 7: Solana Balance Module
**Goal**: `lib/solana.ts` fetches a real SOL balance for any valid address via Helius RPC
**Depends on**: Phase 4
**Requirements**: SOL-01
**Success Criteria** (what must be TRUE):
  1. Calling the module with a known SOL address returns a numeric balance in SOL
  2. An RPC error or invalid address returns a structured error the caller can handle
  3. The Helius API key is read from `HELIUS_API_KEY` in `.env.local` and never hardcoded
**Plans**: TBD

### Phase 8: Aggregator Logic
**Goal**: The API route combines all three chain modules, fetches USD prices from CoinGecko, and caches results to avoid hammering external APIs
**Depends on**: Phase 5, Phase 6, Phase 7
**Requirements**: AGG-01, AGG-02, AGG-03
**Success Criteria** (what must be TRUE):
  1. A single `GET /api/portfolio` call with mixed ETH/BTC/SOL wallets returns balances for all chains in one response
  2. Each balance entry includes both native amount and USD equivalent sourced from CoinGecko
  3. Repeated rapid requests within the cache window hit the cache — external APIs are not called again
  4. One chain failing does not prevent other chains' data from being returned (partial success)
**Plans**: TBD

### Phase 9: Connect Frontend to API
**Goal**: The UI fetches real balance data from `/api/portfolio` and renders it per wallet
**Depends on**: Phase 3, Phase 8
**Requirements**: CONN-01
**Success Criteria** (what must be TRUE):
  1. On page load, the UI calls `/api/portfolio` with the persisted wallet list and displays real native balances
  2. USD values are rendered alongside native balances for each wallet
  3. A wallet with a fetch error shows a visible error state instead of a placeholder
**Plans**: TBD
**UI hint**: yes

### Phase 10: Auto Refresh
**Goal**: Balances stay current automatically and users can force an immediate update
**Depends on**: Phase 9
**Requirements**: REFR-01, REFR-02
**Success Criteria** (what must be TRUE):
  1. Balances refresh automatically every ~2 minutes without any user action
  2. A "Refresh" button triggers an immediate balance fetch outside the polling cycle
  3. The UI gives visible feedback (e.g., loading indicator) during any refresh in progress
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Types | 0/? | Not started | - |
| 2. Frontend UI (Wallet Input) | 0/? | Not started | - |
| 3. localStorage Persistence | 0/? | Not started | - |
| 4. Backend API Route (Skeleton) | 0/? | Not started | - |
| 5. Ethereum Balance Module | 0/? | Not started | - |
| 6. Bitcoin Balance Module | 0/? | Not started | - |
| 7. Solana Balance Module | 0/? | Not started | - |
| 8. Aggregator Logic | 0/? | Not started | - |
| 9. Connect Frontend to API | 0/? | Not started | - |
| 10. Auto Refresh | 0/? | Not started | - |
