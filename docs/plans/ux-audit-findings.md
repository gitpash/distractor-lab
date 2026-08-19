# UX Audit Findings — Phase 1: Static Analysis

**Date:** 2026-08-19
**Scope:** All `.svelte` components + `design.css`
**Method:** Automated grep-based static analysis + manual code review

---

## Critical (fix immediately)

### UX-001: `--text-on-accent` token used but never defined
- **Where:** `src/routes/+page.svelte:447`, `src/routes/calibration/+page.svelte:367`
- **What:** `color: var(--text-on-accent)` is referenced in `.eye-buttons .btn.active` and `.step-num` but the token doesn't exist in `design.css`. This means text on accent-colored backgrounds has **no defined color** — browsers will fall back to inherited color, which is likely illegible.
- **Fix:** Add `--text-on-accent: #fff;` (or `#000` depending on contrast) to `:root` in `design.css`. Alternatively, replace with `color: #fff` since accent is always dark-ish.
- **Skill:** N/A — token definition fix

### UX-002: `.mode-grid` has no responsive collapse — 3 columns on all screens
- **Where:** `src/routes/+page.svelte:268-279`
- **What:** `.mode-grid` is always `grid-template-columns: repeat(3, 1fr)`. On a 320px screen with 16px padding each side, each column is ~93px. Cards contain a 48px icon + title + description — text will truncate or overflow.
- **Fix:** Add `grid-template-columns: repeat(2, 1fr)` for `max-width: 420px` (or similar), or use `auto-fill` with `minmax(140px, 1fr)`.
- **Skill:** `audit-responsive`

---

## High (fix before next release)

### UX-003: Icon-only buttons missing `aria-label`
- **Where:**
  - `src/routes/[game]/+page.svelte:295` — pause button `⏸`/`▶`
  - `src/lib/AnswerTiles.svelte:26-31` — side buttons `↺` (replay) and `⏭` (skip)
- **What:** These buttons contain only emoji/symbols with no accessible name. Screen readers will announce "button" with no context.
- **Fix:** Add `aria-label={$t("game.pause")}` / `aria-label={$t("game.resume")}` to pause button, `aria-label` for replay/skip.
- **Skill:** `audit-a11y`

### UX-004: `.btn-danger:hover` not gated behind `@media (hover: hover)`
- **Where:** `src/routes/+page.svelte:419`
- **What:** `.btn-danger:hover { color: var(--red) !important; }` fires on mobile tap (hover stickiness). Combined with the `!important`, this creates a jarring color flash on touch.
- **Fix:** Wrap in `@media (hover: hover) and (pointer: fine)`.
- **Skill:** `emil-design-eng` (touch device hover states)

### UX-005: `nav.breadcrumbs a:hover` not gated behind `@media (hover: hover)`
- **Where:** `src/lib/heading.svelte:101`
- **What:** Same issue — hover fires on mobile tap. Breadcrumb links will flash accent color on touch.
- **Fix:** Wrap in `@media (hover: hover) and (pointer: fine)`.
- **Skill:** `emil-design-eng`

### UX-006: Missing `focus-visible` on interactive elements
- **Where:**
  - `src/lib/AnswerTiles.svelte` — `.side-btn`, `.btn`, `.btn-2afc` (all buttons)
  - `src/lib/key-hints.svelte` — `.key-card` (has `:active` but no `:focus-visible`)
  - `src/routes/calibration/+page.svelte` — all `.btn` elements
  - `src/routes/[game]/+page.svelte` — `.pause-btn`, resume button
- **What:** Only `.mode-card` in `+page.svelte` has `:focus-visible`. All other interactive elements rely on browser defaults (which may be invisible in some browsers/themes). Keyboard users can't see where focus is.
- **Fix:** Add a global `:focus-visible` rule in `design.css`:
  ```css
  :focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
  }
  ```
  Then remove per-component overrides where they duplicate this.
- **Skill:** `audit-a11y`

### UX-007: Canvas-wrap sizing inconsistency across 3 files
- **Where:**
  - `design.css:165-182` — `width: min(80vw, 80vh, 400px)` (shared token)
  - `src/routes/[game]/+page.svelte:441-444` — `width: min(70vw, 70vh, 320px)` (overrides shared)
  - `src/routes/[game]/+page.svelte:574-576` — mobile: `min(85vw, 85vh, 360px)`
  - `src/routes/calibration/+page.svelte:383-386` — `width: min(80vw, 80vh, 360px)`, height separate
- **What:** Three different canvas sizing strategies. The game page overrides the shared `.canvas-wrap` from `design.css` with its own smaller size, and calibration uses yet another value. This means the canvas jumps in size when navigating between pages.
- **Fix:** Define canvas sizes as CSS custom properties in `design.css`:
  ```css
  --canvas-size: min(80vw, 80vh, 400px);
  --canvas-size-game: min(70vw, 70vh, 320px);
  ```
  Or accept the difference and document it (game canvas intentionally smaller for controls).
- **Skill:** `audit-responsive`

### UX-008: `.disclaimer` likely fails WCAG contrast
- **Where:** `src/routes/+page.svelte:449-457`
- **What:** `font-size: 0.65rem` (~10.4px) + `color: var(--text-muted)` (#404858) + `opacity: 0.6`. The effective color on `--bg-primary` (#0a0e14) is approximately `#282e38` — contrast ratio ~2.5:1 against `#0a0e14`, well below the 4.5:1 AA threshold for small text.
- **Fix:** Either increase opacity to ≥0.85, use `--text-secondary` instead of `--text-muted`, or bump font size to `--text-xs` minimum.
- **Skill:** `audit-a11y`

---

## Medium (fix when touching the area)

### UX-009: `.btn-2afc` duplicates `.btn` styles
- **Where:** `src/lib/AnswerTiles.svelte:159-181`
- **What:** `.btn-2afc` redefines transition, border, cursor, font-family, display, align-items — all already in `.btn`. This means changes to `.btn` (like adding new transitions) won't propagate to `.btn-2afc`.
- **Fix:** Extend `.btn` instead: change to `.btn-2afc { /* only unique props */ }` and add `.btn` to the class list, or extract shared button styles into a mixin.
- **Skill:** N/A — refactor

### UX-010: `.action-row` missing `flex-wrap` — overflow risk on narrow screens
- **Where:** `src/routes/+page.svelte:336-341`
- **What:** `.action-row` has `display: flex; gap: 8px` with no `flex-wrap`. Contains: Calibrate button (~140px) + Start button (~100px) + Trials select (~80px) = ~320px + gaps. On screens < 375px this will overflow.
- **Fix:** Add `flex-wrap: wrap` and `justify-content: center`.
- **Skill:** `audit-responsive`

### UX-011: Inconsistent gap values — no clear rhythm
- **Where:** Multiple files
- **What:** Gaps used: 2px, 4px, 6px, 8px, 10px, 12px, 16px. No clear 4px-based rhythm. The design system defines no spacing tokens. Values like `gap: 10px` and `gap: 6px` are close to `gap: 8px` but not exact.
- **Fix:** Add spacing tokens to `design.css`:
  ```css
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  ```
  Then migrate incrementally.
- **Skill:** N/A — design system

### UX-012: Calibration `.btn-sm` uses `!important` to override `.btn`
- **Where:** `src/routes/calibration/+page.svelte:422-426`
- **What:** `.btn-sm` needs `!important` to override `.btn` padding and font-size. This is a specificity smell — indicates the button system isn't designed for size variants.
- **Fix:** Add `.btn-sm` as a proper variant in `design.css` without `!important`:
  ```css
  .btn-sm { font-size: var(--text-xs); padding: 4px 10px; }
  ```
- **Skill:** N/A — refactor

### UX-013: `!important` usage on `.btn-danger:hover`
- **Where:** `src/routes/+page.svelte:420`
- **What:** `color: var(--red) !important;` — specificity hack. The `.btn-ghost` base has lower specificity than needed.
- **Fix:** Increase specificity properly: `.start-actions .btn-danger:hover` or restructure the button CSS.
- **Skill:** N/A — refactor

### UX-014: Hardcoded font sizes not using design tokens
- **Where:**
  - `src/lib/heading.svelte:84` — `font-size: 12px` (lang-switcher)
  - `src/lib/AnswerTiles.svelte:100` — `font-size: 18px` (side buttons)
  - `src/lib/key-hints.svelte:180` — `font-size: 24px` (key-card-symbol)
  - `src/routes/[game]/+page.svelte:526` — `font-size: 3rem` (countdown)
  - `src/routes/[game]/+page.svelte:560` — `font-size: 0.65rem` (replay-hint kbd)
  - `src/routes/results/+page.svelte:157` — `font-size: 3.5rem` (big-stat)
  - `src/routes/+page.svelte:450` — `font-size: 0.65rem` (disclaimer)
- **What:** 7 hardcoded font sizes outside the token system. `12px` could be `--text-sm` (0.75rem = 12px). `18px` and `24px` have no token equivalent. `3rem` and `3.5rem` are display sizes with no token.
- **Fix:** Add display tokens: `--text-2xl: 2rem`, `--text-3xl: 3rem`, `--text-4xl: 3.5rem`. Map `12px` to `--text-sm`. Keep `18px`/`24px` if they're icon-specific.
- **Skill:** N/A — design system

### UX-015: Hardcoded padding values — not tokenized
- **Where:** 27 instances across all files (see grep output)
- **What:** Padding values like `2px`, `4px`, `5px`, `6px`, `8px`, `10px`, `12px`, `14px`, `16px`, `20px`, `40px`, `60px`, `80px`. Most map to a 4px or 8px grid but aren't formalized.
- **Fix:** Part of UX-011 (spacing tokens). Not critical but contributes to drift.
- **Skill:** N/A — design system

### UX-016: `.result-screen` has no mobile-specific adjustments
- **Where:** `src/routes/results/+page.svelte:144-180`
- **What:** Results page uses `padding: 40px 20px` and `max-width: 500px` with no `@media (max-width: 600px)` breakpoint. On mobile, 40px top/bottom padding wastes vertical space. The `.big-stat` at `3.5rem` is fine on desktop but could be tighter on mobile.
- **Fix:** Add mobile padding reduction: `padding: 24px 16px` below 600px.
- **Skill:** `audit-responsive`

### UX-017: `canvas-wrap` height/width split in calibration vs. design.css
- **Where:**
  - `design.css:165-175` — uses `aspect-ratio: 1` (single property)
  - `calibration/+page.svelte:383-391` — uses separate `width` and `height` with same value
  - `[game]/+page.svelte:441-444` — uses separate `width` and `height`
- **What:** `design.css` uses the cleaner `aspect-ratio: 1` approach, but both route files redefine `.canvas-wrap` with explicit width AND height. This means the shared `.canvas-wrap` in `design.css` is effectively dead code for these pages.
- **Fix:** Either remove the shared `.canvas-wrap` from `design.css` (if routes always override) or consolidate into the shared definition and remove per-route overrides.
- **Skill:** N/A — cleanup

---

## Low (nice to have)

### UX-018: Icon animations use `@keyframes` — not interruptible
- **Where:** `src/lib/pixel-icons.svelte:383-464`
- **What:** All hover and active animations use `@keyframes` (hCoinFlip, hBreath, hStatic, etc.). Per `emil-design-eng`, CSS transitions are interruptible while keyframes restart from zero. For hover animations this is acceptable (hover is brief), but the `.active` infinite loops could benefit from transitions for smoother start/stop.
- **Fix:** Low priority — hover animations are decorative and short. The `.active` animations are continuous loops where interruptibility matters less.
- **Skill:** `emil-design-eng`

### UX-019: `.cal-profile.marginal` fallback color for `--amber`
- **Where:** `src/routes/+page.svelte:250,257`, `src/routes/results/+page.svelte:194`
- **What:** Uses `var(--amber, #f59e0b)` — the fallback is Tailwind's amber-500 which doesn't match the design system's dark palette. `--amber` IS defined in `design.css` as `#ffb000`, so the fallback is never used, but it's confusing.
- **Fix:** Remove the fallback: just use `var(--amber)`.
- **Skill:** N/A — cleanup

### UX-020: `.select` in heading has no border-radius
- **Where:** `src/lib/heading.svelte:79-87`
- **What:** The language switcher `<select>` has `border: 1px solid var(--border)` but no `border-radius`. Every other input/select in the app uses `border-radius: var(--radius-sm)` or `var(--radius)`.
- **Fix:** Add `border-radius: var(--radius-sm)` to `.lang-switcher`.
- **Skill:** `polish-ui`

### UX-021: CRT overlay has no reduced-motion opt-out
- **Where:** `src/lib/crt-overlay.svelte`
- **What:** The scanlines use a repeating gradient (static, no animation) and vignette is static — so no motion issue. But `mix-blend-mode: multiply` could cause visual discomfort for some users. Not a strict a11y violation but worth noting.
- **Fix:** None needed for motion. Consider `prefers-reduced-transparency: reduce` to simplify the overlay.
- **Skill:** `apple-design` (reduced transparency)

### UX-022: `key-card kbd` sizing inconsistent with global `kbd`
- **Where:** `src/lib/key-hints.svelte:174-178`
- **What:** Key card kbd uses `min-width: 32px; height: 20px; font-size: var(--text-xs)` while global `kbd` in `design.css` uses `min-width: 22px; height: 22px; font-size: var(--text-sm)`. Two different kbd sizing systems.
- **Fix:** Use the global `kbd` styles and only override what's necessary for the key-card context.
- **Skill:** `polish-ui`

### UX-023: `.replay-hint kbd` uses yet another kbd style
- **Where:** `src/routes/[game]/+page.svelte:549-563`
- **What:** Third kbd variant: `min-width: 18px; height: 18px; font-size: 0.65rem; background: var(--bg-tertiary)`. Different size, different background from both the global kbd and the key-card kbd.
- **Fix:** Consolidate into the global `kbd` system.
- **Skill:** `polish-ui`

---

## Summary Statistics

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 6 |
| Medium | 9 |
| Low | 6 |
| **Total** | **23** |

## Recommended Fix Order

1. **Immediate:** UX-001 (missing token), UX-002 (grid collapse)
2. **This week:** UX-003 (aria-labels), UX-006 (focus-visible), UX-008 (contrast)
3. **Before next release:** UX-004, UX-005 (hover gating), UX-007 (canvas consistency)
4. **When touching the area:** UX-009 through UX-017
5. **Backlog:** UX-018 through UX-023

## Next Phase

Phase 2 (Visual Review) requires browser screenshots at 5 viewports. Can be done with Playwright or manual inspection. Recommend running `audit-responsive` skill for systematic breakpoint testing.
