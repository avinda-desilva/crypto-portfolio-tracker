import { NextRequest, NextResponse } from "next/server";
import type { Wallet, PortfolioResult } from "../../../types/wallet";

const VALID_CHAINS = ["ethereum", "bitcoin", "solana"] as const;

function getMockBalance(wallet: Wallet): PortfolioResult {
  switch (wallet.chain) {
    case "ethereum":
      // TODO: Phase 5 — replace with lib/ethereum.ts call
      return { address: wallet.address, chain: wallet.chain, balance: 1.23 };
    case "bitcoin":
      // TODO: Phase 6 — replace with lib/bitcoin.ts call
      return { address: wallet.address, chain: wallet.chain, balance: 1.23 };
    case "solana":
      // TODO: Phase 7 — replace with lib/solana.ts call
      return { address: wallet.address, chain: wallet.chain, balance: 1.23 };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // D-06: wrap body parsing in try/catch — malformed JSON → 400
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // D-04: wallets must be an array
  if (
    body === null ||
    typeof body !== "object" ||
    !Array.isArray((body as Record<string, unknown>).wallets)
  ) {
    return NextResponse.json(
      { error: "Request body must be an object with a wallets array" },
      { status: 400 }
    );
  }

  const wallets: unknown[] = (body as Record<string, unknown>).wallets as unknown[];

  // D-05: validate each item — non-empty address + valid chain
  for (let i = 0; i < wallets.length; i++) {
    const item = wallets[i];
    if (
      item === null ||
      typeof item !== "object" ||
      typeof (item as Record<string, unknown>).address !== "string" ||
      (item as Record<string, unknown>).address === "" ||
      !VALID_CHAINS.includes(
        (item as Record<string, unknown>).chain as (typeof VALID_CHAINS)[number]
      )
    ) {
      return NextResponse.json(
        {
          error: `wallets[${i}] is malformed: address must be a non-empty string and chain must be "ethereum", "bitcoin", or "solana"`,
        },
        { status: 400 }
      );
    }
  }

  // All items are valid — cast and build results (D-08, D-09)
  const validWallets = wallets as Wallet[];
  const results: PortfolioResult[] = validWallets.map(getMockBalance);

  // D-07: fixed mock balance 1.23 per wallet, D-08: response shape { results }
  return NextResponse.json({ results }, { status: 200 });
}
