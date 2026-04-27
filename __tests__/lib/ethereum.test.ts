/**
 * Unit tests for lib/ethereum.ts
 *
 * Mocks alchemy-sdk at module level so no real network calls are made.
 * Tests the four behaviors defined in plan 05-01.
 */

// Mock alchemy-sdk before importing the module under test
jest.mock("alchemy-sdk", () => {
  const mockGetBalance = jest.fn();
  return {
    Alchemy: jest.fn().mockImplementation(() => ({
      core: { getBalance: mockGetBalance },
    })),
    Network: { ETH_MAINNET: "eth-mainnet" },
    __mockGetBalance: mockGetBalance,
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const alchemySdk = require("alchemy-sdk");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getEthereumBalance } = require("../../lib/ethereum");

describe("getEthereumBalance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns ETH balance as a number for a valid address", async () => {
    // 2 ETH in wei = 2_000_000_000_000_000_000
    alchemySdk.__mockGetBalance.mockResolvedValue(BigInt("2000000000000000000"));
    const result = await getEthereumBalance("0xabc123");
    expect(typeof result).toBe("number");
    expect(result).toBeCloseTo(2.0);
  });

  it("returns 0 when the SDK throws an error", async () => {
    alchemySdk.__mockGetBalance.mockRejectedValue(new Error("RPC error"));
    const result = await getEthereumBalance("0xabc123");
    expect(result).toBe(0);
  });

  it("returns 0 for an empty/invalid address (SDK throws)", async () => {
    alchemySdk.__mockGetBalance.mockRejectedValue(new Error("invalid address"));
    const result = await getEthereumBalance("");
    expect(result).toBe(0);
  });

  it("calls console.error with address info on failure", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    alchemySdk.__mockGetBalance.mockRejectedValue(new Error("timeout"));
    await getEthereumBalance("0xdeadbeef");
    expect(consoleSpy).toHaveBeenCalled();
    const callArgs = consoleSpy.mock.calls[0];
    expect(String(callArgs[0])).toContain("0xdeadbeef");
    consoleSpy.mockRestore();
  });
});
