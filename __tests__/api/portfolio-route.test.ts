/**
 * Unit tests for app/api/portfolio/route.ts
 *
 * Tests the POST handler behavior per plan 04-01 behaviors 1-8.
 * Calls the exported POST function directly with a NextRequest instance.
 */

// Mock lib/ethereum.ts so tests do not make real Alchemy API calls
jest.mock("../../lib/ethereum", () => ({
  getEthereumBalance: jest.fn().mockResolvedValue(1.23),
}));

import { NextRequest } from "next/server";

// POST is not yet implemented — these tests will fail (RED phase)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require("../../app/api/portfolio/route");

function makeRequest(body: unknown): NextRequest {
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  return new NextRequest("http://localhost:3000/api/portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyStr,
  });
}

describe("POST /api/portfolio", () => {
  // Test 1: valid single ethereum wallet → 200 with balance 1.23
  it("returns 200 with results for a valid ethereum wallet", async () => {
    const req = makeRequest({ wallets: [{ address: "0xabc", chain: "ethereum" }] });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      results: [{ address: "0xabc", chain: "ethereum", balance: 1.23 }],
    });
  });

  // Test 2: empty wallets array → 200 with empty results
  it("returns 200 with empty results for empty wallets array", async () => {
    const req = makeRequest({ wallets: [] });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ results: [] });
  });

  // Test 3: empty address → 400
  it("returns 400 for wallet with empty address", async () => {
    const req = makeRequest({ wallets: [{ address: "", chain: "ethereum" }] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
    expect(typeof json.error).toBe("string");
  });

  // Test 4: invalid chain (dogecoin) → 400
  it("returns 400 for wallet with invalid chain", async () => {
    const req = makeRequest({ wallets: [{ address: "0xabc", chain: "dogecoin" }] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
    expect(typeof json.error).toBe("string");
  });

  // Test 5: wallets is a string, not array → 400
  it("returns 400 when wallets is not an array", async () => {
    const req = makeRequest({ wallets: "not-an-array" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  // Test 6: no wallets key → 400
  it("returns 400 when wallets key is missing", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  // Test 7: invalid JSON body → 400
  it("returns 400 for invalid JSON body", async () => {
    const req = makeRequest("not-json");
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  // Test 8: multiple valid wallets (bitcoin + solana) → 200 with two stub entries
  // BTC/SOL return null+error until Phases 6/7 are implemented — not_implemented stubs
  it("returns 200 with stub results for bitcoin and solana wallets", async () => {
    const req = makeRequest({
      wallets: [
        { address: "addr1", chain: "bitcoin" },
        { address: "addr2", chain: "solana" },
      ],
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toHaveLength(2);
    expect(json.results[0]).toMatchObject({ address: "addr1", chain: "bitcoin", balance: null, error: "not_implemented" });
    expect(json.results[1]).toMatchObject({ address: "addr2", chain: "solana", balance: null, error: "not_implemented" });
  });
});
