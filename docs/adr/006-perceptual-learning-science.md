# ADR-006: Perceptual Learning Science & Lateral Masking Implementation

## Status

Implemented (Phases 1-5 complete)

## Context

The current trainer renders isolated Gabor patches and adapts difficulty via a windowed-accuracy staircase. While this provides basic contrast/frequency/noise training, it lacks the core mechanism that makes clinical perceptual learning effective: **lateral masking** (collinear flankers). This ADR documents the scientific basis, defines terminology, and lays out the implementation plan.

## Glossary

| Term | Definition |
|---|---|
| **Gabor patch** | A sinusoidal grating multiplied by a Gaussian envelope. Matches the receptive field shape of V1 simple cells. The canonical stimulus in visual neuroscience. |
| **Spatial frequency** | Number of cycles per degree of visual angle (cpd). Low freq = wide stripes, high freq = narrow stripes. |
| **Contrast** | Modulation depth of the grating (0–1). 0 = uniform gray, 1 = full black-to-white. |
| **Orientation** | Angle of the grating stripes (0° = horizontal, 90° = vertical). |
| **Sigma (σ)** | Standard deviation of the Gaussian envelope. Controls patch size. |
| **Phase** | Offset of the sinusoidal grating within the envelope. Randomized per trial to prevent luminance artifacts. |
| **Lateral masking** | Technique where collinearly oriented flanking Gabor patches are placed adjacent to a target Gabor. Modulates detection thresholds via cortical lateral interactions. |
| **Collinear** | Target and flankers share the same orientation and are arranged along that axis (e.g., three vertical Gabors in a horizontal row). |
| **Flanker** | A high-contrast Gabor patch placed beside the target to modulate its detectability. |
| **Suppression zone** | Flanker distances < 2λ increase target detection threshold (harder to see). |
| **Facilitation zone** | Flanker distances 3–10λ decrease target detection threshold (easier to see). |
| **λ (lambda)** | Wavelength of the grating = 1 / spatial frequency. The fundamental unit for measuring flanker distance. |
| **Staircase** | Adaptive procedure that adjusts stimulus difficulty based on response history. |
| **QUEST** | Bayesian adaptive psychometric method (Watson & Pelli, 1983). Estimates threshold by placing each trial at the most probable Bayesian estimate. |
| **1-up/3-down staircase** | Correct → harder (1 step); 3 consecutive correct → harder (1 step). Converges to ~79% accuracy. |
| **2AFC** | Two-alternative forced choice. Observer picks one of two intervals/locations. |
| **4AFC** | Four-alternative forced choice. Observer picks one of four orientations/locations. |
| **CSF** | Contrast Sensitivity Function. Sensitivity (1/threshold) plotted against spatial frequency. |
| **logMAR** | Logarithm of the Minimum Angle of Resolution. Clinical visual acuity measure. Lower = better. |
| **Perceptual learning** | Task-specific improvement in visual performance through repetitive practice on controlled visual tasks. Drives cortical plasticity. |
| **Neural noise** | Random variability in individual cortical neuron responses. Limits detection/discrimination. |
| **Signal-to-noise ratio (S/N)** | Ratio of neural signal to noise. Higher S/N → better visual performance. Training improves S/N. |
| **Hebbian learning** | "Neurons that fire together wire together." Repeated co-activation strengthens synaptic connections. |

## Scientific Basis

### Key Papers

1. **Polat U, Sagi D (1993)** — "Lateral interactions between spatial channels: Suppression and facilitation revealed by lateral masking experiments." *Vision Research, 33(7), 993–999.*
   - First demonstration of suppression zone (< 2λ) and facilitation zone (3–10λ) for collinear Gabor flankers.

2. **Polat U, Sagi D (1994)** — "Spatial interactions in human vision: From near to far via experience-dependent cascades of connections." *PNAS, 91(3), 1206–1209.*
   - Training increases lateral interaction range by factor of 3–6x. Evidence for Hebbian-like plasticity in early vision.

3. **Polat U, Ma-Naim T, Belkin M, Sagi D (2004)** — "Improving vision in adult amblyopia by perceptual learning." *PNAS, 101(17), 6692–6697.*
   - Clinical proof: 54 adult amblyopes. Treatment group improved 2.5 logMAR lines. Control group: no change. 12-month durability.

4. **Polat U (2009)** — "Making perceptual learning practical to improve visual functions." *Vision Research, 49(21), 2566–2573.*
   - Comprehensive review of the structured perceptual learning method. Covers amblyopia, myopia, presbyopia. Describes the full treatment protocol.

5. **Watson AB, Pelli DG (1983)** — "QUEST: A Bayesian adaptive psychometric method." *Perception & Psychophysics, 33(2), 113–120.*
   - The adaptive algorithm used (or approximated) in clinical implementations.

6. **Polat U, Norcia AM (1996)** — "Neurophysiological evidence for contrast-dependent long-range facilitation and suppression in the human visual cortex." *Vision Research, 36(14), 2099–2109.*
   - VEP evidence for the physiological basis of lateral masking.

7. **Polat U et al. (2012)** — "Collinear stimuli regulate visual responses depending on cell's contrast threshold." *Nature Scientific Reports.*
   - Mechanistic explanation: collinear flankers shift the contrast response function of V1 neurons.

### Mechanism Summary

```
                    ┌─────────────────────────────────────┐
                    │         PRIMARY VISUAL CORTEX        │
                    │              (V1)                    │
                    │                                     │
   ┌────────┐      │   ┌─────┐   ┌─────┐   ┌─────┐      │
   │ Target │──────│──▶│  T  │◀──│  F  │   │  F  │      │
   │ (low   │      │   │     │──▶│(high│   │(high│      │
  contrast) │      │   └─────┘   │contrast)│contrast)│     │
   └────────┘      │     ▲       └───┬──┘   └───┬──┘      │
                    │     │           │           │         │
                    │     └─────collinear────────┘         │
                    │         lateral connections          │
                    │                                     │
                    │  Result: Reduced neural noise        │
                    │  → Improved S/N ratio                │
                    │  → Lower detection threshold         │
                    │  → Better contrast sensitivity       │
                    │  → Better visual acuity              │
                    └─────────────────────────────────────┘
```

**Why it works:**
1. V1 simple cells have elongated receptive fields tuned to orientation
2. Collinear flankers activate nearby neurons with similar orientation tuning
3. Horizontal connections in V1 link these neurons (range: 2–10λ)
4. Repetitive co-activation strengthens these connections (Hebbian plasticity)
5. This reduces neural noise → improves signal-to-noise ratio
6. Better S/N → can detect lower-contrast stimuli → improved CSF
7. Improved CSF transfers to higher-level functions (letter recognition, VA)

**Why isolated Gabor patches are insufficient:**
- Without flankers, you only train individual neuron responses
- Lateral masking engages the network of connected neurons
- The network effect is what drives lasting cortical reorganization

## Current State vs. Target

### What exists now
- ✅ Gabor patch rendering (correct formula)
- ✅ 4AFC orientation discrimination
- ✅ 2AFC orientation discrimination
- ✅ Adaptive difficulty (1-up/3-down staircase)
- ✅ Contrast, frequency, noise, combo, lateral modes
- ✅ Lateral masking (collinear flankers)
- ✅ Stimulus timing control (80–320ms adaptive exposure, 500ms ISI)
- ✅ Calibration/assessment phase
- ✅ Spatial frequency progression protocol
- ✅ Session duration structure (30 min)

### What's missing
- ❌ QUEST algorithm (optional, more sophisticated)

## Implementation Plan

### Phase 1: Lateral Masking Renderer ✅

**File:** `src/lib/game/renderer.ts`

Add `renderLateralMasking()` function:
- Render target Gabor at center
- Render 2 collinear flankers at distance `d` (in units of λ)
- Flanker contrast: fixed high (~0.8)
- Target contrast: variable (controlled by staircase)
- Distance `d`: parameterizable (start at 4λ, expand range during training)

**Parameters to expose:**
```ts
interface LateralMaskingParams {
  targetContrast: number;      // 0–1, controlled by staircase
  flankerContrast: number;     // fixed ~0.8
  spatialFreq: number;         // cycles/px
  orientation: number;         // degrees
  flankerDistance: number;     // in units of λ (wavelength)
  sigma: number;               // Gaussian envelope size
  phase: number;               // randomized per display
}
```

### Phase 2: Staircase Algorithm Update ✅

**File:** `src/lib/game/state.ts`

Replace windowed-accuracy with proper 1-up/3-down:
- 1 correct → increase difficulty (1 step)
- 3 consecutive incorrect → decrease difficulty (1 step)
- Converges to ~79% accuracy

### Phase 3: Stimulus Timing ✅

**File:** `src/lib/game/state.ts` and `[game]/+page.svelte`

Add timing control:
- Fixation: 300ms (already exists)
- Stimulus duration: 80–320ms (adaptive — start at 320ms, decrease as performance improves)
- Blank interval: 500ms (ISI between displays in 2AFC)
- Feedback: 700ms (already exists)

### Phase 4: Calibration Phase ✅

**New file:** `src/lib/game/calibration.ts`

Initial assessment (2 sessions):
1. **Contrast threshold** at multiple spatial frequencies (1.5, 3, 6, 12 cpd)
2. **Orientation sensitivity** at each frequency
3. Build individual CSF profile
4. Identify weakest frequencies/orientations for targeted training

### Phase 5: Session Protocol ✅

**New file:** `src/lib/game/session.ts`

Define structured sessions:
- Duration: 30 minutes (timer-based, not trial-count-based)
- Warm-up: 5 min low-frequency easy trials
- Main training: 20 min adaptive difficulty
- Cool-down: 5 min assessment (re-test thresholds)
- Frequency progression: start low (1.5–3 cpd), gradually increase across sessions

## Consequences

### Positive
- Lateral masking is the evidence-based mechanism that makes perceptual learning effective
- Proper staircase algorithm ensures training stays at optimal difficulty (~79%)
- Timing control engages the temporal processing window critical for cortical plasticity
- Calibration enables truly personalized treatment

### Negative
- More complex rendering (3 patches instead of 1)
- Need to calibrate monitor distance/size for correct spatial frequency in cpd
- QUEST implementation is non-trivial (Bayesian posterior update)

### Risks
- Monitor calibration: spatial frequency in cpd depends on viewing distance and screen PPI. Must either assume standard distance (50–70cm) or let user input it.
- Timing precision: browser `setTimeout` is not precise enough for 80ms exposure. May need `requestAnimationFrame` with frame counting.

## References

1. Polat U, Sagi D. *Vision Research.* 1993;33(7):993–999.
2. Polat U, Sagi D. *PNAS.* 1994;91(3):1206–1209.
3. Polat U, Ma-Naim T, et al. *PNAS.* 2004;101(17):6692–6697.
4. Polat U. *Vision Research.* 2009;49(21):2566–2573.
5. Watson AB, Pelli DG. *Perception & Psychophysics.* 1983;33(2):113–120.
6. Polat U, Norcia AM. *Vision Research.* 1996;36(14):2099–2109.
7. Levi DM, Li RW. *Vision Research.* 2009;49:2535–2549.
8. Barollo M, et al. *Restorative Neurology and Neuroscience.* 2017;35(5):483–496.
9. Maniglia M, et al. *Restorative Neurology and Neuroscience.* 2016;34(5):697–720.
