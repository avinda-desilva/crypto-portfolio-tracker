import { Alchemy, Network, Utils } from "alchemy-sdk";

const apiKey = process.env.ALCHEMY_API_KEY;
if (!apiKey) {
  console.warn("[ethereum] ALCHEMY_API_KEY is not set — getEthereumBalance will always return 0");
}

// Module-level singleton — created once per Next.js server process, reused across requests (per D-05)
const alchemy = new Alchemy({
  apiKey,
  network: Network.ETH_MAINNET,
});

// Named export only — no default export (per D-14, consistent with types/wallet.ts and route.ts)
export async function getEthereumBalance(address: string): Promise<number> {
  try {
    const balanceInWei = await alchemy.core.getBalance(address);
    // formatUnits returns a decimal string (e.g. "1.234567"); parseFloat is safe on human-readable ETH
    return parseFloat(Utils.formatUnits(balanceInWei, 18));
  } catch (err) {
    // Sanitize address to prevent log injection via crafted newline/ANSI sequences
    const safeAddress = address.replace(/[^\w.:-]/g, "?");
    console.error(`[ethereum] getEthereumBalance failed for address ${safeAddress}:`, err);
    // Never throw to caller — return 0 so API route does not crash (per D-12)
    return 0;
  }
}
