# UX Audit Plan — distractor-lab

## Goal

Systematic audit of visual consistency, responsive behavior, sizing/proportions, and interaction quality across all screens. Produce a severity-ranked findings report with concrete fixes.

## Scope

| Screen | Route | Key Components |
|--------|-------|----------------|
| Home / Start | `/` | Mode grid, eye selector, actions, history, key hints |
| Game | `/[game]` | Canvas, HUD, controls (mobile/desktop), pause overlay |
| Calibration | `/calibration` | 4 phases (setup, gamma, floor, check), canvas, controls |
| Results | `/results` | Stats display, calibration quality badge, actions |

**Shared components:** `heading.svelte` (breadcrumbs + lang switcher), `pixel-icons.svelte`, `DirIcon.svelte`, `AnswerTiles.svelte`, `key-hints.svelte`, `crt-overlay.svelte`

**Design system:** `design.css` (tokens + button system + canvas-wrap + kbd + reduced-motion)

## Audit Dimensions

### D1. Visual Consistency (Design Token Adherence)

Check every component for consistent use of design tokens from `design.css`.

| Check | What to look for | Severity |
|-------|-----------------|----------|
| Color usage | Hardcoded colors vs `var(--*)` tokens | High |
| Font sizes | Inline sizes vs `var(--text-*)` scale | Medium |
| Spacing | Inconsistent padding/margin values | Medium |
| Border radius | Elements without `var(--radius)` | Low |
| Button variants | `.btn-primary`, `.btn-secondary`, `.btn-ghost` used correctly | High |
| Missing tokens | `--text-on-accent` referenced but not defined | High |

**Known issues spotted during review:**
- `--text-on-accent` is used in `+page.svelte` (line 448) and `calibration/+page.svelte` (line 367) but never defined in `design.css`
- `lang-switcher` in `heading.svelte` has no `border-radius` while all other inputs do
- `.btn-2afc` in `AnswerTiles.svelte` doesn't extend `.btn` — duplicates transition/border logic

### D2. Sizing & Touch Targets

| Check | Guideline | Severity |
|-------|-----------|----------|
| Minimum touch target | 44×44px (Apple HIG) / 48×48dp (Material) | High |
| Touch target spacing | ≥8px between adjacent targets | Medium |
| Interactive element consistency | All buttons same height or visually grouped | Medium |
| Canvas sizing | Consistent `min(vw, vh, px)` pattern across pages | Low |

**Known issues spotted during review:**
- `.side-btn` in AnswerTiles is 48×48px ✅
- Joystick `.btn` is 52×52px ✅
- `.btn-2afc` is 120×52px ✅
- `.pause-btn` in game is `min-width: 32px` — potentially too small for touch
- Calibration gamma buttons (−10, −5, +5, +10) have `min-width: 48px` but no explicit height — inherits `.btn` height (44px) ✅
- `.cal-profile .btn-sm` has `padding: 2px 8px` — may fall below 44px height

### D3. Responsive Layout

Target breakpoints: `600px` (mobile/desktop split used throughout)

| Check | What to look for | Severity |
|-------|-----------------|----------|
| Overflow | Horizontal scroll at any viewport width | High |
| Canvas sizing | Works at 375px (iPhone SE) through 1920px+ | High |
| Grid collapse | `.mode-grid` 3-col → needs 1-col on narrow mobile | High |
| Text truncation | Long i18n strings (especially RU) clipping | Medium |
| Viewport units | `vh` issues with mobile keyboard | Medium |
| Safe area insets | Notch/home indicator handling | Low |

**Known issues spotted during review:**
- `.mode-grid` is always `grid-template-columns: repeat(3, 1fr)` — no collapse below 600px. On a 320px screen, 3 columns = ~100px each, which is tight for cards with icons + title + description
- `.action-row` uses `flex` with no `flex-wrap` — could overflow on narrow screens with all 3 elements (calibrate, start, trials select)
- `.result-screen` has no mobile-specific adjustments
- Canvas `.canvas-wrap` sizing is inconsistent: design.css says `min(80vw, 80vh, 400px)`, game page says `min(70vw, 70vh, 320px)`, calibration says `min(80vw, 80vh, 360px)`

### D4. Typography & Readability

| Check | Guideline | Severity |
|-------|-----------|----------|
| Base font size | 13px (`0.8125rem`) — is this intentional? | Medium |
| Line height | 1.5 across body — check all text blocks | Low |
| Text hierarchy | Clear H1/H2/body/caption distinction | Medium |
| Contrast ratios | WCAG AA: 4.5:1 for normal text, 3:1 for large | High |
| Monospace font | Readability at small sizes | Low |

**Known issues spotted during review:**
- `--text-xs: 0.6875rem` = ~11px — very small, check legibility on mobile
- `.disclaimer` uses `font-size: 0.65rem` (~10.4px) with `opacity: 0.6` — likely fails contrast
- `.cal-range` text is `--text-xs` on mobile — could be hard to read
- All text is monospace — intentional for the "terminal/hacker" aesthetic, but check readability of longer RU text

### D5. Interaction & Motion

Apply `apple-design` and `emil-design-eng` principles.

| Check | Guideline | Severity |
|-------|-----------|----------|
| Press feedback | All buttons have `:active` transform | Medium |
| Hover states | Gated behind `@media (hover: hover)` | Medium |
| Animation duration | UI animations ≤300ms | Low |
| Easing curves | Using custom `--ease-out` not `ease-in` | Low |
| Reduced motion | `prefers-reduced-motion` respected | High |
| Focus visible | All interactive elements have `:focus-visible` | High |

**Known issues spotted during review:**
- `design.css` has `btn:active { transform: scale(0.97) }` ✅
- `mode-card` has `:active` ✅ but also needs `focus-visible` ✅ (already has it)
- `.side-btn` in AnswerTiles has no `focus-visible` style
- `.btn-2afc` has no `focus-visible` style
- Icon animations in `pixel-icons.svelte` use `@keyframes` — not interruptible (per emil-design-eng, should prefer CSS transitions for UI)
- `pulse` animation in game pause countdown runs infinitely — check reduced-motion
- `activeCoinSpin` and other `.active` icon animations run infinitely — need reduced-motion handling

### D6. Component Architecture

| Check | What to look for | Severity |
|-------|-----------------|----------|
| Duplication | `.btn-2afc` duplicates `.btn` styles | Medium |
| Canvas-wrap inconsistency | 3 different sizing definitions | Medium |
| Missing shared component | Calibration phase layout is copy-pasted 4 times | Low |
| CSS specificity | `!important` usage in `.btn-sm`, `.btn-danger` | Low |

### D7. Accessibility

Apply `audit-a11y` skill.

| Check | Guideline | Severity |
|-------|-----------|----------|
| ARIA labels | All icon-only buttons need labels | High |
| Keyboard nav | Full keyboard reachability | High |
| Screen reader | Meaningful content announced | Medium |
| Color contrast | All text passes WCAG AA | High |
| Focus order | Logical tab order | Medium |

**Known issues spotted during review:**
- Pause button `⏸`/`▶` is icon-only — needs `aria-label`
- Side buttons `↺` and `⏭` in AnswerTiles are icon-only — need `aria-labels`
- Language switcher `<select>` is fine semantically ✅
- Breadcrumbs use `<ol>` with proper `aria-label="Breadcrumb"` ✅
- Pixel icons have `role="img"` ✅ but no `aria-label` on the SVGs themselves

## Audit Execution Plan

### Phase 1: Automated Static Checks (no browser needed)

1. **Token audit** — grep for hardcoded colors/sizes not using `var(--*)` 
2. **Missing token** — verify `--text-on-accent` is defined or replaced
3. **Touch target audit** — grep for width/height values < 44px on interactive elements
4. **Responsive overflow** — check for fixed widths, missing `max-width`, missing `flex-wrap`
5. **Focus-visible audit** — grep for interactive elements missing focus styles
6. **aria-label audit** — grep for icon-only buttons missing labels

### Phase 2: Visual Review (browser + screenshots)

Using playwright or manual browser inspection at these viewports:
- **375px** — iPhone SE (smallest practical)
- **390px** — iPhone 14 Pro
- **768px** — iPad
- **1280px** — Desktop
- **1920px** — Large desktop

For each viewport, screenshot every route and check:
- Layout integrity (no overflow, no collapse)
- Touch target sizes
- Text readability
- Canvas proportions
- Visual hierarchy

### Phase 3: Interaction Review

- Tab through every page — verify focus order and visible focus rings
- Test keyboard-only navigation on game page
- Verify hover states on desktop
- Check reduced-motion mode
- Test with long i18n strings (if RU translations are longer than EN)

### Phase 4: Cross-Component Consistency

- Button style audit across all pages
- Spacing rhythm audit (is there a consistent 4/8/12/16/20/24px scale?)
- Border treatment consistency
- Shadow/glow consistency

## Deliverable

Produce `docs/plans/ux-audit-findings.md` with:

```
## Critical (fix immediately)
- ...

## High (fix before next release)
- ...

## Medium (fix when touching the area)
- ...

## Low (nice to have)
- ...
```

Each finding formatted as:
```
### [ID] Short title
- **Where:** file:line
- **What:** description of the issue
- **Fix:** concrete code change or approach
- **Skill:** which skill to apply (audit-a11y, polish-ui, apple-design, emil-design-eng)
```

## Tools & Skills to Invoke

| Phase | Skill/Tool | Purpose |
|-------|-----------|---------|
| D1, D6 | Manual review | Token adherence, duplication |
| D2 | `audit-responsive` | Touch targets, sizing |
| D3 | `audit-responsive` | Breakpoint behavior |
| D4 | Manual + contrast checker | Typography, readability |
| D5 | `emil-design-eng` + `apple-design` | Motion, interaction quality |
| D7 | `audit-a11y` | Accessibility |
| Polish | `polish-ui` | Final UI checklist |
| Review | `ux-reviewer` agent | Structured findings report |
