# ADR-007: Calibration Phase State Machine Rework

## Status

Proposed

## Context

The calibration phase (Phase 4 — threshold measurement) has three critical issues found during review:

1. **Race condition in input handling.** The calibration loop uses nested `setTimeout` chains with `waitingForResponse` as the only guard. No explicit FSM phases, no protection against double-invocation, no pause capability. The main game solved this with `orchestrator.ts` — a pure TS module with explicit `phase` transitions and callback pattern.

2. **Excessive trial count.** 4 frequencies × 4 orientations × 10 trials = 160 trials ≈ 5+ minutes. Clinical protocols (Polat 2009) measure 10–20 trials per single frequency×orientation point, not all 16 combinations. The calibration is too long for a practical pre-training step.

3. **Patch visibility.** Fixed `radius: 80` with `sigma: 1.0/freq` means low-frequency patches (0.015 → σ=67px) fill the entire 300×300 canvas. Even at 5% contrast, a 160px-diameter patch is visible. The radius must scale with sigma.

## Decision

Create `src/lib/game/calibration-orchestrator.ts` following the same pattern as `orchestrator.ts`:

- Pure TS, no Svelte, no DOM
- Explicit FSM: `idle → fixation → stimulus → isi → waiting → feedback → (next point | complete)`
- Callback pattern: page passes rendering functions, orchestrator calls them at the right time
- Guard on every transition: `if (phase !== expected) return`

### Staircase parameters

| Parameter | Current | Proposed | Rationale |
|-----------|---------|----------|-----------|
| Trials per point | 10 | 6 | Reduces total from 160 to 96 (3 freq × 2 orient × 6). Still enough for staircase convergence |
| Frequencies | 4 (0.015, 0.03, 0.06, 0.09) | 3 (0.03, 0.06, 0.09) | Remove 0.015 — σ=67px fills canvas |
| Orientations | 4 (horiz, vert, diag1, diag2) | 2 (horiz, vert) | Diagonals add time without critical calibration value |
| Staircase rule | 1-up-3-down | 1-up-2-down | Standard for 4AFC, converges to ~71% accuracy |
| Radius | Fixed 80px | `sigma * 2.5` | Scales with frequency, prevents canvas overflow |

### Patch rendering fix

```
radius = sigma * 2.5   (was: fixed 80)
```

| Freq | Sigma | Old radius | New radius | Canvas fill |
|------|-------|------------|------------|-------------|
| 0.03 | 33.3px | 80px (2.4×) | 83px (2.5×) | Fits |
| 0.06 | 16.7px | 80px (4.8×) | 42px (2.5×) | Fits |
| 0.09 | 11.1px | 80px (7.2×) | 28px (2.5×) | Fits |

## Consequences

### Positive
- Eliminates race conditions via explicit FSM
- Calibration drops from ~5 min to ~1.5 min
- Patches scale correctly with frequency
- Consistent architecture with main game (orchestrator pattern)

### Negative
- New file (`calibration-orchestrator.ts`) to maintain
- Fewer data points (6 instead of 10 per point) — threshold estimate slightly noisier
- Removing diagonal orientations means no calibration data for those orientations

### Risks
- 6 trials per point may be insufficient for convergence on hard frequencies. Mitigation: allow early exit if `consecutiveCorrect >= 4` (threshold clearly below floor).
