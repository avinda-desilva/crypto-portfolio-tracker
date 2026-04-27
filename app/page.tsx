"use client";

import { useState, useEffect, useRef } from "react";
import type { Chain, Wallet } from "../types/wallet";

const colors = {
  pageBg:           "#0b0f14",
  surface:          "#131920",
  border:           "#1e2836",
  hoverRow:         "#1a2130",
  textPrimary:      "#e2e8f0",
  textMuted:        "#94a3b8",
  accent:           "#3b82f6",
  accentHover:      "#2563eb",
  accentActive:     "#1d4ed8",
  destructive:      "#ef4444",
  destructiveHover: "#fca5a5",
} as const;

export default function Home() {
  const [wallets, setWallets]   = useState<Wallet[]>([]);
  const [address, setAddress]   = useState<string>("");
  const [chain, setChain]       = useState<Chain>("ethereum");
  const [error, setError]       = useState<string>("");

  const [btnHover, setBtnHover]           = useState(false);
  const [inputFocus, setInputFocus]       = useState(false);
  const [selectFocus, setSelectFocus]     = useState(false);
  const [hoveredRow, setHoveredRow]       = useState<number | null>(null);
  const [hoveredRemove, setHoveredRemove] = useState<number | null>(null);

  const hasLoaded = useRef(false);

  // Load wallets from localStorage on mount (STOR-02)
  useEffect(() => {
    const raw = localStorage.getItem("wallets");
    if (raw !== null) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) =>
              item !== null &&
              typeof item === "object" &&
              typeof (item as Record<string, unknown>).address === "string" &&
              (item as Record<string, unknown>).address !== "" &&
              ((item as Record<string, unknown>).chain === "ethereum" ||
                (item as Record<string, unknown>).chain === "bitcoin" ||
                (item as Record<string, unknown>).chain === "solana")
          )
        ) {
          setWallets(parsed as Wallet[]);
        }
      } catch {
        // parse failure — fall back to empty list, do not crash
      }
    }
    hasLoaded.current = true;
  }, []);

  // Sync wallets to localStorage on every change (STOR-01)
  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem("wallets", JSON.stringify(wallets));
  }, [wallets]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!address.trim()) {
      setError("Please enter a wallet address.");
      return;
    }
    setError("");
    setWallets((prev) => [...prev, { address: address.trim(), chain }]);
    setAddress("");
  }

  function handleRemove(index: number): void {
    setWallets((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <main
      style={{
        paddingTop: "48px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: colors.textMuted,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "40px 32px",
          background: colors.surface,
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: colors.textPrimary,
            margin: "0 0 24px 0",
          }}
        >
          Wallets
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            {/* Address input */}
            <div style={{ flex: 1 }}>
              <label
                htmlFor="address"
                style={{
                  fontSize: "14px",
                  color: colors.textMuted,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Wallet Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter wallet address"
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "16px",
                  color: colors.textPrimary,
                  outline: "none",
                  boxShadow: inputFocus
                    ? "0 0 0 2px rgba(59,130,246,0.35)"
                    : "none",
                }}
              />
            </div>

            {/* Chain select */}
            <div style={{ width: "160px" }}>
              <label
                htmlFor="chain"
                style={{
                  fontSize: "14px",
                  color: colors.textMuted,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Chain
              </label>
              <select
                id="chain"
                value={chain}
                onChange={(e) => setChain(e.target.value as Chain)}
                onFocus={() => setSelectFocus(true)}
                onBlur={() => setSelectFocus(false)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "16px",
                  color: colors.textPrimary,
                  outline: "none",
                  appearance: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                  boxShadow: selectFocus
                    ? "0 0 0 2px rgba(59,130,246,0.35)"
                    : "none",
                }}
              >
                <option value="ethereum">Ethereum</option>
                <option value="bitcoin">Bitcoin</option>
                <option value="solana">Solana</option>
              </select>
            </div>
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: "14px", margin: "0 0 8px 0" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: btnHover ? colors.accentHover : colors.accent,
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add Wallet
          </button>
        </form>

        <div style={{ marginTop: "32px" }}>
          {wallets.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: colors.textMuted,
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: colors.textPrimary,
                  margin: "0 0 8px 0",
                }}
              >
                No wallets added yet
              </p>
              <p style={{ margin: 0 }}>
                Add a wallet address above to get started.
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {(["Address", "Chain", "Balance", ""] as const).map(
                    (header) => (
                      <th
                        key={header}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          fontSize: "14px",
                          color: colors.textMuted,
                          borderBottom: `1px solid ${colors.border}`,
                          fontWeight: 400,
                        }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet, i) => (
                  <tr
                    key={i}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background:
                        hoveredRow === i ? colors.hoverRow : "transparent",
                    }}
                  >
                    <td
                      title={wallet.address}
                      style={{
                        padding: "12px",
                        maxWidth: "280px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: colors.textPrimary,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {wallet.address}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: colors.textMuted,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {wallet.chain}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: colors.textMuted,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {"—"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemove(i)}
                        onMouseEnter={() => setHoveredRemove(i)}
                        onMouseLeave={() => setHoveredRemove(null)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color:
                            hoveredRemove === i
                              ? colors.destructiveHover
                              : colors.destructive,
                          cursor: "pointer",
                          fontSize: "18px",
                          padding: "4px 8px",
                        }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
