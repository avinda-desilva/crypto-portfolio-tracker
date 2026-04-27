---
phase: 03-localstorage-persistence
reviewed: 2026-04-26T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - app/page.tsx
findings:
  critical: 2
  warning: 1
  info: 2
  total: 5
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-26
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

The phase adds two `useEffect` hooks to `app/page.tsx` for localStorage persistence: a mount effect that reads wallets on load and a sync effect that writes on every `wallets` state change. The core idea is sound, but two critical defects were found: a data-loss race condition baked into the effect ordering, and an unsafe type assertion that accepts arbitrary unvalidated data from localStorage. One warning and two info items round out the findings.

---

## Critical Issues

### CR-01: Unsafe type assertion on localStorage data — no runtime validation

**File:** `app/page.tsx:37`

**Issue:** `JSON.parse(raw) as Wallet[]` is a pure TypeScript compile-time assertion with zero runtime enforcement. Any value stored in localStorage — whether corrupted, manually edited, or written by a browser extension on the same origin — is blindly accepted as a valid `Wallet[]`. This means `wallet.address` could be `null`, a number, or missing entirely, and `wallet.chain` could be any string outside the `"ethereum" | "bitcoin" | "solana"` union. Downstream code (the table render at lines 252–321 and `handleRemove` at line 61) treats these fields as valid without any guards, so bad data will cause incorrect rendering and could cause crashes in future phases when chain values are passed to chain-specific API calls.

**Fix:** Add a runtime shape check before calling `setWallets`. A minimal guard is sufficient:

```typescript
// inside the try block, replace the assertion:
const parsed: unknown = JSON.parse(raw);
if (
  !Array.isArray(parsed) ||
  !parsed.every(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      typeof item.address === "string" &&
      item.address.length > 0 &&
      (item.chain === "ethereum" ||
        item.chain === "bitcoin" ||
        item.chain === "solana")
  )
) {
  return; // treat malformed data the same as missing data
}
setWallets(parsed as Wallet[]);
```

---

### CR-02: Write-on-mount race condition can clobber localStorage data

**File:** `app/page.tsx:33–47`

**Issue:** The sync effect (lines 45–47) runs after every render, including the very first one. React fires effects in declaration order after the initial render commit. The execution sequence on page load is:

1. First render: `wallets = []`
2. Mount effect fires (line 33): reads localStorage, calls `setWallets(parsed)` — localStorage still intact here
3. Sync effect fires (line 45): writes `JSON.stringify([])` (the current render's empty state) to localStorage — **data is now overwritten with `[]`**
4. State update from step 2 triggers re-render: `wallets = parsed`
5. Sync effect fires again: writes correct data back

During the window between steps 3 and 4, localStorage holds `[]`. If the browser tab is closed, the page crashes, or the device loses power in this window, all persisted wallet data is permanently lost. The longer `setWallets` takes to schedule a re-render, the wider this window.

**Fix:** Guard the sync effect so it does not write on the initial render. Use a ref to track whether the mount load has completed:

```typescript
const hasLoaded = useRef(false);

// Mount effect — runs once, sets the flag after loading
useEffect(() => {
  const raw = localStorage.getItem("wallets");
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw) as Wallet[]; // add CR-01 validation here too
      setWallets(parsed);
    } catch {
      // parse failure — fall back to empty list
    }
  }
  hasLoaded.current = true;
}, []);

// Sync effect — skip the initial empty-state write
useEffect(() => {
  if (!hasLoaded.current) return;
  localStorage.setItem("wallets", JSON.stringify(wallets));
}, [wallets]);
```

Note: `useRef` is needed (not `useState`) because updating a ref does not trigger a re-render, and the check in the sync effect needs to be synchronous within the same render cycle.

---

## Warnings

### WR-01: Array index used as React key causes stale hover state after removal

**File:** `app/page.tsx:254`

**Issue:** `key={i}` uses the array index as the React key for table rows. When a wallet is removed from any position other than the last, React reuses existing DOM nodes matched by index rather than by identity. The hover state variables `hoveredRow` and `hoveredRemove` (both indexed by position) will point to the wrong row immediately after a removal until the user moves the mouse. For example: hovering row 1 of 3, then removing row 0 — the hover highlight jumps to the new row 1 (formerly row 2) without any mouse movement.

**Fix:** Use a stable unique key derived from the wallet's content. Since the type contract states address+chain is the composite identity:

```tsx
<tr
  key={`${wallet.chain}:${wallet.address}`}
  ...
>
```

This also requires changing the `handleRemove` signature to match by identity rather than index if hover state is to be fully correct, but at minimum the key change prevents React from recycling wrong DOM nodes.

---

## Info

### IN-01: Magic color `"#ef4444"` duplicated instead of referencing the color token

**File:** `app/page.tsx:180`

**Issue:** The error message paragraph hard-codes `"#ef4444"` directly:
```tsx
<p style={{ color: "#ef4444", fontSize: "14px", margin: "0 0 8px 0" }}>
```
The `colors` object at line 17 already defines `destructive: "#ef4444"`. If the destructive color token is ever updated, the error text will drift out of sync with all other destructive UI elements.

**Fix:**
```tsx
<p style={{ color: colors.destructive, fontSize: "14px", margin: "0 0 8px 0" }}>
```

---

### IN-02: Silent parse failure has no observability in development

**File:** `app/page.tsx:39–41`

**Issue:** The empty catch block intentionally swallows parse errors per the design decision comment (D-06). While silently falling back to an empty list is the correct user-facing behavior, the complete absence of any logging makes it impossible to diagnose corrupted localStorage during development or in production debugging sessions.

**Fix:** Add a `console.error` guarded by the development environment flag so it does not appear in production builds:

```typescript
} catch (err) {
  if (process.env.NODE_ENV === "development") {
    console.error("[portfolio] Failed to parse wallets from localStorage:", err);
  }
  // fall back to empty list
}
```

---

_Reviewed: 2026-04-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
