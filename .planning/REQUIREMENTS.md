# Requirements: Crypto Portfolio Tracker

**Defined:** 2026-04-26
**Core Value:** See all wallet balances across all chains in one clean view, refreshed automatically every 2 minutes — no login, no database, no friction.

## v1 Requirements

### Types

- [ ] **TYPES-01**: TypeScript interfaces defined for `Wallet`, `ChainBalance`, and `PortfolioResponse` in `/types/wallet.ts`

### Frontend UI

- [ ] **UI-01**: User can enter a wallet address with chain selection (ETH / BTC / SOL) and add it to the wallet list
- [ ] **UI-02**: Wallet list displays each wallet with address, chain label, and balance placeholder
- [ ] **UI-03**: User can remove a wallet from the list

### Persistence

- [ ] **STOR-01**: Wallet list persists in localStorage across page reloads
- [ ] **STOR-02**: Wallet list loads from localStorage on initial render

### Backend API

- [ ] **API-01**: `GET /api/portfolio` accepts wallet addresses+chains as query params and returns aggregated balance data
- [ ] **API-02**: API returns per-wallet errors without failing the entire request (partial success)

### Chain Modules

- [ ] **ETH-01**: `lib/ethereum.ts` fetches ETH balance for a given address via Alchemy API
- [ ] **BTC-01**: `lib/bitcoin.ts` fetches BTC balance for a given address via blockchain.info API
- [ ] **SOL-01**: `lib/solana.ts` fetches SOL balance for a given address via Helius RPC

### Aggregator

- [ ] **AGG-01**: API route calls all three chain modules and merges results into a single response
- [ ] **AGG-02**: USD values fetched from CoinGecko free API and applied to each balance
- [ ] **AGG-03**: Server-side cache in `lib/cache.ts` throttles repeated external API calls

### Frontend Connection

- [ ] **CONN-01**: Frontend fetches from `/api/portfolio` and renders real balance data (native + USD) per wallet

### Auto Refresh

- [ ] **REFR-01**: Balances auto-refresh every ~2 minutes via polling
- [ ] **REFR-02**: User can manually trigger a balance refresh

## v2 Requirements

### Notifications

- **NOTF-01**: Alert user when a balance changes significantly
- **NOTF-02**: Desktop notification on refresh completion

### Enhanced Display

- **DISP-01**: Total portfolio USD value summary at top
- **DISP-02**: Historical balance chart per wallet

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication | Single user, personal tool — no login needed |
| Database storage | localStorage sufficient for personal use |
| Multi-user support | Personal tool by design |
| Real-time WebSocket | 2-minute polling is adequate |
| Multi-currency fiat | USD only for v1 |
| Mobile app | Web-first |
| Transaction history | Balance tracking only, not tx history |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TYPES-01 | Phase 1 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 2 | Pending |
| STOR-01 | Phase 3 | Pending |
| STOR-02 | Phase 3 | Pending |
| API-01 | Phase 4 | Pending |
| API-02 | Phase 4 | Pending |
| ETH-01 | Phase 5 | Pending |
| BTC-01 | Phase 6 | Pending |
| SOL-01 | Phase 7 | Pending |
| AGG-01 | Phase 8 | Pending |
| AGG-02 | Phase 8 | Pending |
| AGG-03 | Phase 8 | Pending |
| CONN-01 | Phase 9 | Pending |
| REFR-01 | Phase 10 | Pending |
| REFR-02 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-26*
*Last updated: 2026-04-26 after initial definition*
