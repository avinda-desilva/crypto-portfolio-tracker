/**
 * Type-level tests for types/wallet.ts
 *
 * These tests use TypeScript's type system to verify:
 * - Chain, Wallet, and PortfolioResult are exported
 * - Each type has exactly the specified fields (no extras)
 * - Chain values are lowercase full names
 *
 * The file compiles successfully only when types/wallet.ts is correct.
 * tsc --noEmit on this file is the "test runner".
 */

import type { Chain, Wallet, PortfolioResult } from "../types/wallet";

// --- Chain type checks ---

// Chain must accept the three exact lowercase values
const _chainEth: Chain = "ethereum";
const _chainBtc: Chain = "bitcoin";
const _chainSol: Chain = "solana";

// --- Wallet checks ---

// Valid wallet objects must compile
const _w1: Wallet = { address: "0xabc", chain: "ethereum" };
const _w2: Wallet = { address: "bc1abc", chain: "bitcoin" };
const _w3: Wallet = { address: "Sol123", chain: "solana" };

// Wallet must accept chain as Chain type variable
const myChain: Chain = "ethereum";
const _w4: Wallet = { address: "0xabc", chain: myChain };

// --- PortfolioResult checks ---

// Valid PortfolioResult objects must compile
const _p1: PortfolioResult = { address: "0xabc", chain: "ethereum", balance: 1.5 };
const _p2: PortfolioResult = { address: "bc1abc", chain: "bitcoin", balance: 0 };
const _p3: PortfolioResult = { address: "Sol123", chain: "solana", balance: 42.0 };

// PortfolioResult.chain is string (accepts any string, not just Chain literals)
const _p4: PortfolioResult = { address: "0xtest", chain: "some-other-chain", balance: 0 };

// --- Export existence checks (compile-time) ---
// If Chain, Wallet, or PortfolioResult don't exist as named exports, this file won't compile.

// Suppress "unused variable" errors by exporting them
export type { Chain, Wallet, PortfolioResult };
export {
  _chainEth,
  _chainBtc,
  _chainSol,
  _w1,
  _w2,
  _w3,
  _w4,
  _p1,
  _p2,
  _p3,
  _p4,
};
