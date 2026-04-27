# Phase 2: Frontend UI (Wallet Input) - Pattern Map

**Mapped:** 2026-04-26
**Files analyzed:** 5 (app/page.tsx, app/layout.tsx, next.config.ts, app/page.module.css or inline styles, package.json + tsconfig.json updates)
**Analogs found:** 1 / 5 (codebase is pre-Next.js; only types/wallet.ts exists as production code)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `app/page.tsx` | component (page) | event-driven (form submit, button click) | `types/wallet.ts` | import/naming conventions only |
| `app/layout.tsx` | config/layout | request-response | none | no analog |
| `next.config.ts` | config | none | none | no analog |
| `app/globals.css` or inline styles | config/style | none | none | no analog |
| `package.json` (update) | config | none | `package.json` (current) | partial — same file, extend only |
| `tsconfig.json` (new) | config | none | none | no analog |

---

## Pattern Assignments

### `app/page.tsx` (component, event-driven)

**Analog:** `types/wallet.ts` (only production source file)

This file is the primary deliverable. No React/Next.js components exist yet to copy structure from. Patterns are derived from (a) established project conventions in `types/wallet.ts`, (b) the locked decisions in `02-CONTEXT.md`, and (c) the UI contract in `02-UI-SPEC.md`.

---

**Import pattern — from `types/wallet.ts` lines 1-17:**

The project uses named exports and `import type` for pure types. New files must follow the same convention.

```typescript
// types/wallet.ts (lines 1-17) — the naming and export style to replicate
export type Chain = "ethereum" | "bitcoin" | "solana";

export interface Wallet {
  address: string;
  chain: Chain;
}
```

`app/page.tsx` must consume these exports with:

```typescript
// Import pattern — copy this exactly
"use client";

import { useState } from "react";
import type { Chain, Wallet } from "../types/wallet";
```

Key conventions from `types/wallet.ts` to carry forward:
- Chain values are lowercase full names: `"ethereum"`, `"bitcoin"`, `"solana"` (not abbreviations). Locked by Phase 1.
- `Wallet` has no `id` field — address+chain is the composite identity.
- Import types with `import type` when the import is purely a TypeScript type (no runtime value).

---

**State pattern — per D-02:**

```typescript
// State shape — Wallet[] from types/wallet.ts
const [wallets, setWallets] = useState<Wallet[]>([]);
const [address, setAddress] = useState<string>("");
const [chain, setChain] = useState<Chain>("ethereum");  // D-03: default to ethereum
const [error, setError] = useState<string>("");
```

---

**Form submit / add wallet pattern — per D-04, D-05:**

```typescript
// Non-empty validation only (D-04). No duplicate prevention (D-05).
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (!address.trim()) {
    setError("Please enter a wallet address.");   // copywriting from UI-SPEC
    return;
  }
  setError("");
  setWallets((prev) => [...prev, { address: address.trim(), chain }]);
  setAddress("");
  // chain selector stays at current value (UI-SPEC Interaction Contract)
}
```

---

**Delete pattern — per D-07:**

```typescript
// Remove by index (no id field on Wallet — D-01 from Phase 1)
function handleRemove(index: number) {
  setWallets((prev) => prev.filter((_, i) => i !== index));
}
```

---

**Wallet list render pattern — per D-06 and UI-SPEC:**

```typescript
// Balance placeholder is em dash U+2014 (UI-SPEC copywriting contract)
// title attribute on address cell for hover tooltip (UI-SPEC layout section)
{wallets.map((wallet, i) => (
  <tr key={i}>
    <td title={wallet.address} style={{ maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {wallet.address}
    </td>
    <td>{wallet.chain}</td>
    <td>{"—"}</td>   {/* U+2014 em dash placeholder — Phase 9 replaces this */}
    <td>
      <button type="button" onClick={() => handleRemove(i)}>×</button>
    </td>
  </tr>
))}
```

---

**Styling pattern — per 02-UI-SPEC.md (inline styles approach):**

The UI-SPEC declares inline `style` props or a co-located CSS module as acceptable. Since no CSS infrastructure exists, inline styles are the zero-dependency path. All color tokens, spacing, and typography values come directly from 02-UI-SPEC.md.

Dark palette tokens to use as constants at top of file:

```typescript
// Paste these as JS object or inline — extracted from 02-UI-SPEC.md §Color
const colors = {
  pageBg:       "#0b0f14",  // dominant 60%
  surface:      "#131920",  // inputs, rows, card
  border:       "#1e2836",  // borders, dividers
  hoverRow:     "#1a2130",  // wallet row hover
  textPrimary:  "#e2e8f0",  // headings
  textMuted:    "#94a3b8",  // labels, body, placeholder
  accent:       "#3b82f6",  // Add Wallet button bg, focus ring
  accentHover:  "#2563eb",  // button hover
  accentActive: "#1d4ed8",  // button active
  destructive:  "#ef4444",  // delete text
  destructiveHover: "#fca5a5",
} as const;
```

Key style rules from 02-UI-SPEC.md:
- Page background: `#0b0f14`, min-height `100vh`
- Container: `max-width: 680px`, `margin: 0 auto`, `padding: 40px 32px`
- Page padding top: `48px`
- Input/select: `background: #131920`, `border: 1px solid #1e2836`, `borderRadius: 8px`, `padding: 10px 16px`, `fontSize: 16px`, `color: #e2e8f0`
- Select: add `appearance: none`, `-webkit-appearance: none`
- Focus ring: `outline: none`, `box-shadow: 0 0 0 2px rgba(59,130,246,0.35)`
- Primary button: `background: #3b82f6`, `color: #fff`, `borderRadius: 8px`, `fontWeight: 600`, `cursor: pointer`, no border
- Delete button: `background: transparent`, `color: #ef4444`, no border
- Font stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Heading: `28px`, weight `600`, color `#e2e8f0`
- Body/labels: `16px` / `14px`, weight `400`, color `#94a3b8`
- Border radius: `8px` inputs/buttons/rows, `12px` outer container card

---

**Copywriting — all literal strings from 02-UI-SPEC.md §Copywriting Contract:**

| Element | Exact string |
|---------|-------------|
| Page heading | "Wallets" |
| Address label | "Wallet Address" |
| Address placeholder | "Enter wallet address" |
| Chain label | "Chain" |
| Chain option display | "Ethereum" / "Bitcoin" / "Solana" (capitalized) |
| Chain option values | `"ethereum"` / `"bitcoin"` / `"solana"` (lowercase) |
| Submit button | "Add Wallet" |
| Balance placeholder | `"—"` (U+2014 em dash) |
| Delete control | "×" (U+00D7) |
| Empty state heading | "No wallets added yet" |
| Empty state body | "Add a wallet address above to get started." |
| Empty address error | "Please enter a wallet address." |

---

### `app/layout.tsx` (layout, request-response)

**Analog:** none in codebase — standard Next.js App Router boilerplate.

**Minimum required pattern (Next.js App Router):**

```typescript
// app/layout.tsx — required root layout for Next.js App Router
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crypto Portfolio Tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Note: body background and font are applied via inline styles in `app/page.tsx` on the `<main>` wrapper, not in the layout body. Layout stays minimal.

---

### `next.config.ts` (config)

**Analog:** none in codebase.

**Minimum pattern for Next.js 15 (TypeScript config):**

```typescript
// next.config.ts — minimal, no custom options needed for Phase 2
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

---

### `package.json` (update — extend existing)

**Analog:** `/Users/avinda/Documents/github/crypto-portfolio-tracker/package.json` (lines 1-24) — existing file, extend only.

The existing `package.json` declares `"type": "commonjs"` which conflicts with Next.js's module expectations. The update must:
1. Remove `"type": "commonjs"` (Next.js manages its own module system via webpack/turbopack)
2. Add `next`, `react`, `react-dom` to `dependencies`
3. Add `@types/react`, `@types/react-dom`, `@types/node` to `devDependencies`
4. Replace the placeholder `scripts.test` with Next.js scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^6.0.3"
  }
}
```

---

### `tsconfig.json` (new)

**Analog:** none in codebase — no tsconfig.json exists yet.

**Next.js 15 App Router required tsconfig.json:**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Note: `"strict": true` is required by REQUIREMENTS.md (CLEAN-02). This is non-negotiable.

The import in `__tests__/wallet-types.test.ts` uses `"../types/wallet"` (relative path). This relative import still works with the `@/*` path alias — no migration needed unless a later phase adds barrel imports.

---

## Shared Patterns

### Type Import Convention
**Source:** `types/wallet.ts` (lines 1-17) and `__tests__/wallet-types.test.ts` (line 13)
**Apply to:** `app/page.tsx` and all future source files

```typescript
// Use import type for pure TypeScript types — no runtime import cost
import type { Chain, Wallet } from "../types/wallet";
// or with path alias (once tsconfig paths are configured):
import type { Chain, Wallet } from "@/types/wallet";
```

The test file uses the relative form: `import type { Chain, Wallet, PortfolioResult } from "../types/wallet"`. Until a barrel index is created, use relative paths from `app/` as `"../types/wallet"`.

---

### JSDoc Comment Style
**Source:** `types/wallet.ts` (lines 1-28)
**Apply to:** All source files

```typescript
/**
 * One-line summary of the module's purpose.
 * Secondary context on consumers or dependencies.
 */
```

Single-line block comments for properties. This project uses JSDoc-style (`/** */`) not `//` for module-level documentation.

---

### Chain Value Convention
**Source:** `types/wallet.ts` line 7 — `export type Chain = "ethereum" | "bitcoin" | "solana"`
**Apply to:** `app/page.tsx` — chain selector option values, state typing, all future files

Chain values are always lowercase full names. Never use abbreviations (ETH/BTC/SOL) as stored values. Display labels in the UI may be capitalized ("Ethereum") but the `value` attribute of `<option>` tags must match the `Chain` type literals exactly.

```tsx
// Correct — option value matches Chain type literal
<option value="ethereum">Ethereum</option>
<option value="bitcoin">Bitcoin</option>
<option value="solana">Solana</option>
```

---

### No-Id Identity Pattern
**Source:** `types/wallet.ts` lines 9-17 — `Wallet` interface has no `id` field
**Apply to:** `app/page.tsx` wallet list rendering, Phase 3 localStorage, all future phases

Address+chain is the composite identity. When rendering lists without an id, use array index as the React `key`. This is acceptable because: (a) the list is user-managed (add/remove, no reordering), (b) no duplicate prevention (D-05), (c) index is stable enough for this phase.

```tsx
{wallets.map((wallet, i) => (
  <tr key={i}>  {/* index key acceptable — no id field on Wallet */}
```

---

## No Analog Found

All files below have no analog in the current codebase. Planner should use patterns above (derived from Next.js 15 App Router defaults + UI-SPEC) rather than codebase inference.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `app/layout.tsx` | layout | none | No Next.js files exist yet |
| `next.config.ts` | config | none | No Next.js files exist yet |
| `app/globals.css` | config/style | none | No CSS files exist yet |
| `tsconfig.json` | config | none | No tsconfig.json exists yet |

---

## Metadata

**Analog search scope:** `/Users/avinda/Documents/github/crypto-portfolio-tracker/` (all directories, excluding node_modules)
**Files scanned:** 4 (types/wallet.ts, __tests__/wallet-types.test.ts, package.json, package-lock.json)
**Production source files with reusable patterns:** 1 (`types/wallet.ts`)
**Pattern extraction date:** 2026-04-26

**Notes for planner:**
- Next.js must be installed (`npm install next react react-dom`) before `app/page.tsx` can be created. This is a prerequisite step, not a separate phase.
- `package.json` currently has `"type": "commonjs"` — this must be removed as part of the Next.js migration.
- The `__tests__/wallet-types.test.ts` file uses `tsc --noEmit` as its test runner. The new `tsconfig.json` must preserve this behavior (`"noEmit": true`).
- Phase 9 will replace the `"—"` balance placeholder with real data. The balance cell in `app/page.tsx` should be written to make this substitution straightforward (e.g., a dedicated variable or prop rather than a hardcoded string embedded in JSX).
