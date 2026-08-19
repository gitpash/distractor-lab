# Calibration Results UX Rework

**Date:** 2026-08-18
**Trigger:** Results page shows raw "13%" with no context — meaningless to users, no path forward
**Status:** 📋 Proposed

---

## Problem

The current calibration results page has three UX failures:

1. **"13%" means nothing** — Users don't know if this is good, bad, or average. No interpretation, no context.
2. **Dead-end CTA** — "Recalibrate" is the primary action. There's no path to the actual product (training).
3. **Grid of identical values** — All 6 cells show "13% / 6/6 correct". This is noise, not signal.

---

## Design

### New layout (top to bottom)

```
┌──────────────────────────────────┐
│       Calibration Complete       │  ← title
│                                  │
│  ┌────────────────────────────┐  │
│  │  ✓ Your contrast sensitivity│  │  ← plain-language interpretation
│  │    is in the normal range   │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  ░░░░░░░░░░░░░░ 0.9 cpd    │  │  ← horizontal bar chart
│  │  ░░░░░░░░░░░░░░░░ 1.9 cpd  │  │     (1 bar per frequency,
│  │  ░░░░░░░░░░ 2.8 cpd        │  │      mean across orientations)
│  └────────────────────────────┘  │
│                                  │
│  Training will focus on your     │  ← what happens next
│  weakest frequencies.            │
│                                  │
│  ┌──────────┐  ┌──────────┐     │
│  │   Start   │  │ Recalibrate│   │  ← CTAs
│  │ Training  │  │            │   │
│  └──────────┘  └──────────┘     │
└──────────────────────────────────┘
```

### Interpretation scale

| Mean threshold | Label | Color |
|---|---|---|
| < 10% | "Excellent — your contrast sensitivity is sharp." | green |
| 10–25% | "Good — your contrast sensitivity is in the normal range." | accent (cyan) |
| 25–40% | "Developing — training will strengthen your contrast detection." | amber |
| > 40% | "Training will focus on building your contrast sensitivity." | amber |

### Bar chart

- One horizontal bar per spatial frequency (0.03, 0.06, 0.09 cpd)
- Bar width = threshold % (lower = shorter bar = better)
- Label on each bar: frequency + threshold value
- Color matches the interpretation tier
- This immediately shows the user *where* they're weakest

### CTA

- **Primary:** "Start Training" → `/` (home page where they pick a mode)
- **Secondary (text link):** "Recalibrate" → `/calibration`

### Remove

- The 6-cell grid of individual freq × orient points (too detailed, all the same)
- "Weakest orientation" line (not actionable)
- "Contrast gain" line (internal implementation detail)
- "Mean Threshold" as the big stat (replace with interpretation)

---

## Implementation

### Step 1: Rewrite `+page.svelte` calibration section

Replace the current calibration block with:
- Derived `calInterpretation` (label + color based on meanThreshold)
- Derived `calFreqBars` (array of { freq, label, threshold, width% })
- Remove `calPointDisplay` function and the grid
- New template with interpretation box, bar chart, explanation, CTAs

### Step 2: Add i18n keys

**en.ts:**
```
results: {
  calInterpretationExcellent: "Excellent — your contrast sensitivity is sharp.",
  calInterpretationGood: "Good — your contrast sensitivity is in the normal range.",
  calInterpretationDeveloping: "Developing — training will strengthen your contrast detection.",
  calInterpretationBuilding: "Training will focus on building your contrast sensitivity.",
  calNextStep: "Training will adapt to your personal sensitivity profile.",
  startTraining: "Start Training",
}
```

**ru.ts:** corresponding Russian translations

### Step 3: Add bar chart styles

Simple CSS:
- `.cal-bars` — container
- `.cal-bar-row` — flex row per frequency
- `.cal-bar-label` — frequency label (left)
- `.cal-bar-track` — background track
- `.cal-bar-fill` — colored fill (width %, transitions)
- `.cal-bar-value` — threshold number (right)

---

## Validation

| Check | Command |
|---|---|
| Type check | `bun run check` |
| Build | `bun run build` |
| Manual test | Complete calibration, verify: interpretation shown, bars render, "Start Training" navigates to home |
