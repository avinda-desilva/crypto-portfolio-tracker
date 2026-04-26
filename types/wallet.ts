/**
 * Shared TypeScript contracts for the crypto portfolio tracker.
 * All phases import from this file. Zero runtime logic — pure types only.
 */

/** Supported blockchain networks. Values are lowercase full names. */
export type Chain = "ethereum" | "bitcoin" | "solana";

/**
 * A user-defined wallet entry.
 * Identity is the composite key: address + chain.
 * No id field — address+chain uniquely identifies each wallet.
 */
export interface Wallet {
  address: string;
  chain: Chain;
}

/**
 * The result of a balance lookup for one wallet.
 * Returned by chain modules (lib/ethereum.ts, lib/bitcoin.ts, lib/solana.ts)
 * and aggregated by app/api/portfolio/route.ts.
 */
export interface PortfolioResult {
  address: string;
  chain: string;
  balance: number;
}
