# Crypto Portfolio Tracker

## What This Is

A personal, single-user Next.js (App Router) tool for tracking cryptocurrency wallet balances across Ethereum, Bitcoin, and Solana. Wallets are stored in localStorage; balances are fetched via a backend API route that aggregates on-chain data from Alchemy (ETH), Helius (SOL), and blockchain.info (BTC). Prices are displayed in native token amounts and USD via CoinGecko.

## Core Value

See all wallet balances across all chains in one clean view, refreshed automatically every 2 minutes — no login, no database, no friction.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can add Ethereum wallet addresses
- [ ] User can add Bitcoin wallet addresses
- [ ] User can add Solana wallet addresses
- [ ] Wallets persist across sessions via localStorage
- [ ] Backend API route aggregates balances from all chains
- [ ] UI displays balance per wallet (native + USD)
- [ ] User can manually trigger a balance refresh
- [ ] Balances auto-refresh every ~2 minutes
- [ ] Chain logic is modular (separate file per chain)
- [ ] Basic error handling for failed API calls

### Out of Scope

- Database storage — localStorage is sufficient for a personal tool
- Authentication — single user, no login needed
- Real-time WebSocket updates — polling every 2 minutes is enough
- Mobile app — web only
- Multi-currency fiat support — USD only for v1

## Context

- **Runtime**: Next.js 14+ App Router with TypeScript
- **Styling**: Tailwind CSS
- **Chain APIs**: Alchemy (Ethereum), Helius (Solana), blockchain.info (Bitcoin)
- **Price API**: CoinGecko free tier (no key required for basic endpoints)
- **Persistence**: localStorage (no backend DB)
- **Deployment target**: Local dev / personal use

### Project Structure

```
/app
  page.tsx              — Main UI
  /api/portfolio/
    route.ts            — Backend aggregator API route
/lib
  ethereum.ts           — Ethereum balance fetching via Alchemy
  bitcoin.ts            — Bitcoin balance fetching via blockchain.info
  solana.ts             — Solana balance fetching via Helius
  cache.ts              — In-memory server-side cache to avoid hammering APIs
/types
  wallet.ts             — Shared TypeScript types
```

### Phased Build Plan

The project is broken into 10 sequential phases, each independently discussable:

| Phase | Name | Focus |
|-------|------|-------|
| 1 | Types | Shared TypeScript interfaces (wallet, balance, chain) |
| 2 | Frontend UI | Wallet input form and display shell |
| 3 | localStorage | Wallet persistence across sessions |
| 4 | Backend API Skeleton | API route structure and request handling |
| 5 | Ethereum Module | Alchemy integration in `lib/ethereum.ts` |
| 6 | Bitcoin Module | blockchain.info integration in `lib/bitcoin.ts` |
| 7 | Solana Module | Helius integration in `lib/solana.ts` |
| 8 | Aggregator Logic | Combine chain modules + CoinGecko prices in API route |
| 9 | Frontend→API | Wire UI to fetch from `/api/portfolio` |
| 10 | Auto Refresh | 2-minute polling + manual refresh button |

## Constraints

- **Tech Stack**: Next.js App Router, TypeScript, Tailwind CSS — no alternatives
- **Simplicity**: No overengineering. If something can be done in 20 lines, don't abstract it into 80.
- **No Auth / No DB**: localStorage only. API route is unauthenticated by design.
- **API Keys**: Alchemy and Helius require API keys (stored in `.env.local`); blockchain.info and CoinGecko are keyless.
- **Single User**: No multi-tenancy, no user management, no sessions.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| localStorage for persistence | No DB needed for personal single-user tool | — Pending |
| Alchemy for Ethereum | Reliable, free tier generous, well-documented | — Pending |
| Helius for Solana | Best-in-class Solana RPC, free tier available | — Pending |
| blockchain.info for Bitcoin | Public API, no key required, simple balance endpoint | — Pending |
| CoinGecko for prices | Free tier, no API key needed for basic price lookup | — Pending |
| Server-side cache in lib/cache.ts | Avoid hammering external APIs on every request | — Pending |
| Modular chain files | Each chain in its own lib/ file for readability and testability | — Pending |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-26 after initialization*
