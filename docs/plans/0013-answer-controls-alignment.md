# Plan: 0013 — Answer controls alignment (desktop + mobile)

## Problem

The answer controls look ragged and misaligned (user screenshot: desktop
`KeyHints` grid). Two surfaces affected:

- **Desktop** — `src/lib/key-hints.svelte` `.key-grid` / `.key-grid-2afc` cards
  plus the `R replay (N left)` hint in `[game]/+page.svelte`.
- **Mobile** — `src/lib/AnswerTiles.svelte` joystick + side buttons
  (`DirIcon size={32}`).

### Root cause

`DirIcon.svelte` renders **non-square intrinsic sizes per direction**:

| direction | rendered box (size=24) |
|-----------|------------------------|
| horiz     | 24 × **6**             |
| vert      | **6** × 24             |
| diag1/2   | 24 × 24                |

Inside the flex-column `.key-card` (default `align-items` stretch, content
stacked from top), a 6px-tall icon vs a 24px-tall icon shifts every element
below it — label and `<kbd>` chip land at different vertical offsets per card.
Result: chips and labels visibly out of row/column alignment across the grid,
exactly what the screenshot shows.

Secondary issues:

- kbd chip widths differ (`A/D`, `W/S` vs `E`, `Q`) with no normalized
  min-width → ragged bottom edge inside cards.
- `.key-card` has no `justify-content: center` → uneven internal spacing when
  card heights are equalized by the grid.
- Mobile joystick: same DirIcon issue at size 32; `.center` dot is only 12px;
  placeholder `<span>` spacers duplicate button metrics by hand (52px) instead
  of sharing one source of truth.

## Constraints

- Do not change answer keys, order, or semantics — `answer-tiles.test.ts`
  asserts tile order/keys/angles; keyboard handling in the game page is keyed
  to these answers. Purely visual/CSS + icon geometry change.
- Touch targets must stay ≥ 44–48px on mobile.
- Keep haptics attach behavior and i18n labels untouched.
- Respect existing tokens (`--bg-secondary`, `--border`, `--accent`,
  `--duration-*`) and the global reduced-motion kill-switch.
- Validate: `bun run check && bun run test && bun run build`.

## Options considered

**A. Local CSS wrappers** — wrap each `<DirIcon>` in a fixed-size square flex
slot in both `key-hints.svelte` and `AnswerTiles.svelte`.
Pros: zero API change. Cons: fixes the symptom in two places; every future
consumer must repeat the wrapper.

**B. Square DirIcon canvases (recommended)** — change `DirIcon` so *every*
direction renders an SVG of `size × size` (single square viewBox `0 0 16 16`,
glyph centered inside). Horizontal becomes a short centered bar in a square
box, vertical likewise; diagonals unchanged. Both consumers align for free,
and any future consumer can't reintroduce the bug.
Cons: touches shared component used by game page — but geometry is purely
additive whitespace; visual output of the glyph itself is identical.

**C. Replace icons with text glyphs** (`— ╱ | ╲`) — rejected: loses crisp
vector rendering and consistency with `docs/gabor-orientations.svg`.

## Chosen approach: B + CSS polish

### 1. `src/lib/DirIcon.svelte`

- All four branches render `width={size} height={size}` with
  `viewBox="0 0 16 16"`:
  - horiz: horizontal rect centered at y=7..9 (rect y=7 height=2)
  - vert: vertical rect centered at x=7..9
  - diag1/diag2: unchanged lines (already square).
- Glyph stroke thickness stays identical to today.

### 2. `src/lib/key-hints.svelte` (desktop)

- `.key-card`: add `justify-content: center`; keep grid 2×2.
- Normalize kbd chips: fixed `min-width` that fits `W/S` (e.g. `min-width:
  40px`) + centered text so all four bottoms align; keep existing global kbd
  styling tokens.
- `.key-card-label`: `white-space: nowrap` (RU «Горизонталь» etc.) with
  `overflow: hidden; text-overflow: ellipsis` guard.
- Grid gap 6px → 8px; keep `max-width: 400px`, centered via existing parent.
- 2afc cards get the same chip normalization.

### 3. `src/lib/AnswerTiles.svelte` (mobile)

- Icons auto-fix via square DirIcon (size 32 → all boxes 32×32).
- Replace hand-rolled 52×52 `<span>` spacers and 12px `.center` with a single
  3×3 CSS grid template (areas: `.` `horiz` `.` / `diag2` `center` `diag1` /
  `.` `vert` `.`) so rows/columns are guaranteed aligned regardless of
  content. Keep the same buttons/order/DOM semantics for tests.
- Buttons stay ≥ 48px touch targets; gap bumped 4px → 8px for breathing room.

### 4. `src/routes/[game]/+page.svelte`

- Center `.replay-hint` under the grid width (constrain its container to the
  same `max-width` as the key grid or rely on `align-items: center` after grid
  fix) — verify visually, adjust if it still sits off-center relative to the
  grid's left/right edges.

## Test impact

- `orientation-icon.test.ts` — tests `OrientationIcon` math, unaffected.
- `answer-tiles.test.ts` — asserts order/keys/angles of AnswerTiles buttons;
  grid restructure must preserve button identity/order. Run suite.
- Add snapshot-free visual check manually: dev server at 375px and 1280px
  widths, 4afc and 2afc modes, EN and RU locales.

## Verification

```sh
bun run check && bun run test && bun run build
```

Manual matrix:

| viewport | mode  | locale | expectation |
|----------|-------|--------|-------------|
| 1280px   | 4afc  | EN/RU  | 4 cards: icons, labels, kbd chips aligned on shared baselines; replay hint centered |
| 1280px   | 2afc  | EN/RU  | two cards equal width/chip alignment |
| 375px    | 4afc  | RU     | joystick rows/columns perfectly cross-aligned; targets ≥48px |
| 375px    | 2afc  | RU     | buttons fit without overflow |

## Out of scope

- AnswerTiles↔KeyHints unification into one component (structural refactor).
- Any gameplay/staircase changes.
