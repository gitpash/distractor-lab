# Plan: 0012 — Breadcrumb (heading) visual rework

## Context

`src/lib/heading.svelte` renders the global breadcrumb + language switcher on every
route. Functionally it works, but visually it fights the product: distractor-lab
trains **attention**, and the current header is itself a distraction source.

Diagnosed problems:

1. **Poor text readability.** Crumb links use `--text-muted` (#404858) on
   `--bg-primary` (#0a0e14) ≈ **2.1:1 contrast** — fails WCAG AA (4.5:1) by more
   than half. This is the main "текст плохо читаемый" cause, not font size.
2. **Animated bright icon in the crumb.** `heading.svelte` renders
   `<PixelIcon name={segment} active />`. `active = true` starts an *infinite*
   CSS animation loop (`activeCoinSpin 4s linear infinite`, shimmer, blink…),
   forces color to `--accent` (#00e5ff) and size to 24px against 13px mono text.
   Additionally PixelIcon's own `pointerenter/leave` handlers fire hover
   animations (coin flip, shake) even when just moving the mouse across the nav.
   For an attention-training app this is exactly wrong: motion + saturated hue in
   peripheral vision steals focus from the Gabor canvas.
3. **Separator.** `/` via `li::before content:"/"`. User chose the pipe
   operator `|>` (vertical bar + arrowhead, as in Elixir) — confirmed 2026-08-22.
4. **i18n bug.** "Home" is hardcoded English; segment labels are regex-capitalized
   slugs (`fine` → "Fine"), while proper localized titles already exist:
   `actions.home` ("Home" / "На главную") and `modes.<slug>.title`
   ("Tilt"/"Наклон", "Классический", …). Russian users see English/mixed crumbs.
5. **Home link when already on `/`.** Renders an anchor with `aria-disabled="true"`
   instead of a non-interactive current-page marker.
6. **Query-string leakage.** `href={"/" + page.url.search}` propagates game params
   (`?trials=50&session=true&eye=left`) onto Home/intermediate crumb URLs from
   game/results pages → junk URLs in history.
7. **Style leak.** `.heading :global(li), .heading :global(a) { padding: 0 }`
   resets every future element inside the header; must be scoped to breadcrumbs.

Constraints: keep home-page mode cards' animated icons untouched (there motion is
meaningful feedback for selection). Keep the component API additive. Respect the
existing global `prefers-reduced-motion` kill-switch.

## Options

### Option A: Additive "static" mode in PixelIcon (recommended)

**Approach:** Add props `static?: boolean` (and treat `static` as: no anim state
machine, no pointer handlers, no animation classes, `aria-hidden="true"`, size
via CSS from the consumer, color inherited through `currentColor` which the SVGs
already use). Breadcrumb passes `<PixelIcon name={slug} static />` inside the
crumb label and lets it inherit the crumb's text color.
**Pros:** Single source of truth for the six glyph shapes; smallest diff; home
page untouched; icon automatically follows any future mode-set change.
**Cons:** PixelIcon carries two rendering personalities in one file.

### Option B: Extract static glyph component

**Approach:** New `pixel-glyph.svelte` holds only the raw SVG shapes (no script,
no handlers, no styles besides `currentColor`). Both PixelIcon and heading import
the shapes.
**Pros:** Cleanest separation; breadcrumb bundle loses all animation code paths.
**Cons:** Touches/moves ~360 lines of SVG markup; higher regression risk on the
home page for zero user-visible gain today.

### Option C: Drop icons from breadcrumbs entirely

**Approach:** Text-only crumbs.
**Pros:** Maximally calm UI.
**Cons:** Loses the mode glyph as an identity anchor; user explicitly asked to
keep an icon (monochrome, static) rather than remove it.

### Separator variants (independent of A/B/C)

- **S1 (chosen): pipe operator** — literal two-char glyph `"|>"` in
  `--border`/`--text-muted` via `li::before` (pseudo-element content is not
  announced by screen readers). Reads naturally in the monospace/terminal
  design language; no custom SVG needed.
- **S2 (rejected): arrow chevron** `›` / `→` — directional semantics imply
  hierarchy depth this app doesn't have (max depth 2); superseded by user's
  explicit `|>` pick.

## Decision

Option A + S1 (`|>` separator). The pipe-operator glyph matches the monospace,
terminal-like design language and encodes "flows into" between crumb levels.
Static monochrome icon inherits crumb color so it can never outshine the
stimulus.

## Implementation Steps

1. `src/lib/pixel-icons.svelte`
   - Add `static = false` prop. When true: skip `$effect`/handlers/anim classes;
     render root SVG with `aria-hidden="true"` (drop `role="img"`), no fixed
     width/height (consumer sizes via CSS); keep `fill="currentColor"` rects.
   - While there: give non-static instances an accessible name or drop
     `role="img"` in favor of `aria-hidden` (they're decorative next to visible
     labels on the home page too).
2. `src/lib/heading.svelte`
   - Labels via i18n: Home → `$t("actions.home")`; game-mode crumb →
     `$t(\`modes.${segment}.title\`)`; other segments keep `formatSegment`
     fallback (`calibration` → "Calibration"; optionally add keys later).
   - Icon: `<PixelIcon name={segment} static />` inside `.game-mode-label`;
     delete the 24px `:global` override; size with `width/height: 1em` +
     `flex` centering so the box tracks font size; color inherits label color.
   - Separator: replace `content:"/"` with `content: "|>"`; color
     `--border` (decorative), slight `letter-spacing: 0.05em` so bar and
     arrowhead don't collide in mono faces;
     `margin: 0 var(--space-2)`; not announced (pseudo-element).
   - Colors: links `--text-secondary`; hover (already hover-gated) →
     `--text-primary`; current page span → `--text-primary`; separators stay
     `--text-muted` (decorative). Optionally bump crumb font-size to
     `--text-md` (14px).
   - Current-route Home: when `page.url.pathname === "/"` render
     `<span aria-current="page">` instead of disabled anchor.
   - Links: plain `"/"` and `"/" + url` — stop appending `page.url.search`.
   - Scope the `li/a { padding: 0 }` reset under `nav.breadcrumbs`.

## Validation

- `bun run check && bun run test && bun run build`
- Manual: `/classic` shows `Home |> [glyph] Классический/Classic` per locale;
  icon does NOT animate on load, on hover, or over time; icon box aligns with
  cap-height of the text at 100%/200% zoom.
- Manual: contrast spot-check links ≥ 4.5:1 (e.g. WebAIM checker on #7080a0).
- Manual: home page cards still animate exactly as before (regression).
- Keyboard: Tab reaches Home link and intermediate links; current page is not a
  tab stop; focus ring visible.

## Risks

- PixelIcon prop change could regress home page animations → additive default
  (`static = false`) keeps behavior identical; verify home page manually.
- `modes.<slug>.title` key missing for a future route slug → keep
  `formatSegment(slug)` fallback if `$t` returns the key itself.

## Addendum — baseline alignment fix (post-implementation review)

User report: crumbs sat at different vertical levels (Home higher, separator
lower, icon+text higher again); Fira Code/Cascadia rendered the `|>` text
separator as their built-in ligature triangle.

Root causes fixed in `src/lib/heading.svelte`:

1. `ol { align-items: center }` → `align-items: baseline` (flex was centering
   boxes, not baselines).
2. `.game-mode-label` inline-flex → plain inline span (inline-flex derived its
   baseline from the SVG's bottom edge, lifting the label off the shared
   baseline; `vertical-align` on the icon was inert inside flex anyway).
   Icon spacing now via `margin-right` on `svg.pixel-icon`.
3. Separator `content:"|>"` → CSS-drawn pipe+chevron via `mask` data-URI on
   `li::before` (8×10px, bottom edge on baseline ≈ cap band). Font-independent:
   no glyph metrics, no ligatures. Still decorative/unannounced.

Verified in headless Chromium: icon center within 0.5px of text-box center;
separator spans 0–10px vs cap band 0–9.8px; all gates green.
