# ADR-008: Calibration Purpose and Design

**Date:** 2026-08-18
**Status:** Accepted
**Context:** Current calibration produces meaningless "13%" output and is disconnected from training.

---

## Problem

1. Phase 4 measures **user's contrast sensitivity** (psychophysics), not **monitor capabilities** (calibration).
2. The calibration profile is stored in sessionStorage but **never read by training**.
3. The results page shows raw numbers with no interpretation and no actionable CTA.

---

## What Calibration Must Produce

Training needs to know: **what contrast range can this display show?**

The renderer computes: `pixel = 128 + 128 * contrast * grating * gaussian`

If a monitor is dim, `contrast = 0.5` might be invisible. If bright, `contrast = 0.05` might be obvious. Without calibration, the training staircase wastes trials exploring invisible or trivially easy contrasts.

### Output: `CalibrationProfile`

```typescript
interface CalibrationProfile {
  gamma: number;              // estimated display gamma (from phase 2)
  contrastFloor: number;      // min visible contrast on this display (0.0–1.0)
  contrastCeil: number;       // max usable contrast (default 1.0)
  quality: 'good' | 'marginal' | 'poor';  // overall assessment
  warnings: string[];         // human-readable warnings (i18n keys)
  isComplete: boolean;
}
```

### How training uses it

`buildTrial` currently hardcodes contrast as `diff / 100`. After calibration:

```typescript
// Map difficulty [diffMin..diffMax] → actual contrast [contrastFloor..contrastCeil]
const t = (diff - diffMin) / (diffMax - diffMin);
const actualContrast = contrastFloor + t * (contrastCeil - contrastFloor);
```

This ensures:
- Easiest trial is at `contrastFloor` (just barely visible — but visible)
- Hardest trial is at `contrastCeil` (max usable contrast)
- Every intermediate difficulty maps to a visible, meaningful contrast

---

## Calibration Flow (4 phases, ~30 sec)

### Phase 1: Setup (unchanged)
Instructions: brightness 40-60%, disable True Tone/Night Shift, arm's length distance.

### Phase 2: Gamma check (keep, add to settings)
Split-screen flicker method. User matches gray to checkerboard.
- **Keep as-is** — well-implemented
- Gamma value stored in profile for informational display
- Could optionally be used to linearize contrast mapping (future)

### Phase 3: Contrast floor (rewrite)
**Goal:** Find minimum visible contrast on this display.

**Method:**
1. Show reference Gabor at 0.04 cpd, contrast = 0 (invisible)
2. User presses arrow keys or slider to increase contrast
3. Patch gradually becomes visible
4. User presses "I see it" → record `contrastFloor`
5. User can also press "Already visible" if patch is visible from the start

**Fallback (simpler):** Show patch at fixed low contrast. User adjusts gain until barely visible. `contrastFloor = baseContrast / gain`.

### Phase 4: Quality check (new — replaces staircase)
**Goal:** Quick sanity check at ceiling contrast.

**Method:**
1. Show reference Gabor at 0.04 cpd, contrast = 0.9
2. "Can you clearly see the stripes?"
3. If yes → `contrastCeil = 1.0`, quality = good/marginal
4. If no → `contrastCeil = 0.9`, quality = poor, show warning

**Duration:** 1 question, ~3 seconds.

---

## Quality Assessment

| contrastFloor | Quality | Message |
|---|---|---|
| < 0.15 | good | "Your display contrast is excellent. Training will adapt to your screen." |
| 0.15 – 0.30 | good | "Your display contrast is within normal range. Training will adapt." |
| 0.30 – 0.45 | marginal | "Your display contrast is lower than ideal. Training will adapt, but for best results consider increasing brightness or contrast." |
| > 0.45 | poor | "Your display contrast is very low. Training may be less effective. Consider: increasing monitor brightness, disabling power-saving mode, or using a different display." |

**Key principle:** Never block the user. Always inform and let them decide.

### Warning text examples

- good: "Контрастность вашего дисплея в норме. Тренировка адаптируется под ваш экран."
- marginal: "Контрастность дисплея ниже идеальной. Тренировка адаптируется, но для лучшего результата увеличьте яркость или контраст монитора."
- poor: "Контрастность дисплея очень низкая. Тренировка может быть менее эффективной. Попробуйте: увеличить яркость монитора, отключить режим экономии энергии, или использовать другой дисплей."

---

## Results Page (rewrite)

### Good calibration (quality = good)
```
Calibration Complete!

Your display contrast is within normal range.

Contrast range: 12% – 95%
Gamma: ~2.2 (typical)

Training will adapt to your screen's capabilities.

[Start Training]  [Recalibrate]
```

### Marginal calibration (quality = marginal)
```
Calibration Complete!

Your display contrast is lower than ideal.

Contrast range: 32% – 90%
Gamma: ~2.0

Training will adapt, but for best results:
• Increase monitor brightness to 60-80%
• Increase monitor contrast to medium-high
• Disable power-saving mode

[Start Training]  [Recalibrate]
```

### Poor calibration (quality = poor)
```
Calibration Complete!

Your display contrast is very low.

Contrast range: 48% – 75%
Gamma: ~1.8

Training may be less effective with this display.
Consider: increasing brightness, using a different monitor,
or calibrating your display settings.

[Start Training Anyway]  [Recalibrate]
```

---

## Gamma in Settings

Gamma value from phase 2 should be accessible in app settings:
- Show current gamma estimate
- Explain what it means
- Let user re-run gamma check from settings
- This is informational — gamma is not used to modify stimuli (yet)

---

## What Gets Deleted

| Component | Reason |
|---|---|
| `CalibrationPoint` interface | No longer measuring per-freq threshold |
| `CALIBRATION_FREQUENCIES` | Not doing frequency sweep |
| `CALIBRATION_ORIENTATIONS` | Not doing orientation sweep |
| `CALIBRATION_TRIALS_PER_POINT` | No trials — just 2 quick questions |
| `processCalibrationAnswer` staircase | Replaced by simple floor/ceil measurement |
| `skipCalibrationTrial` | No trials to skip |
| Phase 4 orchestrator FSM | Replaced by simple 2-step flow |
| 6-cell grid on results page | Replaced by plain-language summary |
| "Mean Threshold" / "13%" display | Replaced by contrast range + quality assessment |

---

## Implementation Scope

### Files to change
- `src/lib/game/calibration.ts` — rewrite interfaces, remove staircase, add floor/ceil logic
- `src/routes/calibration/+page.svelte` — rewrite phases 3-4, simplify orchestrator
- `src/routes/results/+page.svelte` — rewrite calibration results display
- `src/lib/i18n/en.ts` — new keys for quality messages
- `src/lib/i18n/ru.ts` — new keys for quality messages

### Files to update (consumers)
- `src/lib/game/game-modes.ts` — `buildTrial` should accept `CalibrationProfile` and map difficulty
- `src/lib/game/state.ts` — `createGameState` should accept profile
- `src/routes/[game]/+page.svelte` — pass profile to orchestrator/game

### Files to delete
- `src/lib/game/calibration-orchestrator.ts` — replaced by simpler flow
