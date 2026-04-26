# Phase 1: Types - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-26
**Phase:** 01-types
**Mode:** discuss
**Areas discussed:** Type names and fields, Chain representation, Identity, Minimal surface

## Discussion

### Area: Type definitions

**Options presented:**
- Wallet identity (id field vs address+chain composite key)
- Error state model (optional field vs discriminated union)
- PortfolioResponse shape (flat array vs grouped by chain)

**User response:** Provided exact spec directly:

> Create a TypeScript type definition for Wallet and PortfolioResult.
> Wallet: address: string, chain: "ethereum" | "bitcoin" | "solana"
> PortfolioResult: address: string, chain: string, balance: number
> Keep it minimal.

**Decisions locked:**
- Type name is `PortfolioResult` (not `ChainBalance` or `PortfolioResponse`)
- Two interfaces only — no separate wrapper type
- Chain values: lowercase full names, not abbreviations
- No `id`, no `usdValue`, no error fields — minimal by design

## Deferred Ideas

None.

## Claude's Discretion Items

- Whether to extract `Chain` as a named type alias
- JSDoc style
