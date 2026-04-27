import { Alchemy, Network } from "alchemy-sdk";

// Module-level singleton — created once per Next.js server process, reused across requests (per D-05)
const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

// Named export only — no default export (per D-14, consistent with types/wallet.ts and route.ts)
export async function getEthereumBalance(address: string): Promise<number> {
  try {
    const balanceInWei = await alchemy.core.getBalance(address);
    // Standard floating-point division for personal portfolio display precision (per D-09)
    return Number(balanceInWei) / 1e18;
  } catch (err) {
    // Log with address context so server logs are debuggable (per D-11)
    console.error(`[ethereum] getEthereumBalance failed for address ${address}:`, err);
    // Never throw to caller — return 0 so API route does not crash (per D-12)
    return 0;
  }
}
