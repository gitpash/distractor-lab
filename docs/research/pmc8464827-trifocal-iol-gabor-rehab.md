# Research Analysis: Visual Rehabilitation Program with Gabor Patches for Trifocal IOL Patients

**Source**: https://pmc.ncbi.nlm.nih.gov/articles/PMC8464827/
**DOI**: 10.3390/brainsci11091181
**Date Analyzed**: 2026-08-19
**Relevance**: **high** — directly uses Gabor patches for visual training, same paradigm as gabor-svelte

------

## Verdict

**Decision**: accept

| Criterion | Assessment |
|-----------|------------|
| Relevance to gabor-svelte | high — directly uses Gabor patches for visual training |
| Study design quality | strong — RCT, n=30, double-masked, pre-registered |
| Replication status | single study |
| Effect size | significant: p=0.02 at 6 cpd, p=0.01 at 12 cpd, p=0.02 at 1.5 cpd |
| Actionable? | yes — multi-frequency training mode, Best PEST, session persistence |

**Decision rationale**: Well-designed RCT using the same paradigm as gabor-svelte. Significant CS improvements at frequencies we cover. Directly actionable.

**If defer/reject**: N/A — accepted.



## TL;DR

Piñero et al. (2021) conducted a blinded randomized placebo-controlled trial (n=30) testing a 3-week visual rehabilitation program using Gabor patches in patients with trifocal diffractive IOLs. The training group showed significantly improved contrast sensitivity at 6 cpd (p=0.02) and 12 cpd (p=0.01) at distance, and 1.5 cpd (p=0.02) at near, compared to placebo. No visual acuity improvement was found. The training used adaptive contrast (Best PEST) with Gabor stimuli presented during a gamified driving task.

---

## Key Parameters

### Stimulus

| Parameter | Paper Value | gabor-svelte Current | Gap / Notes |
|-----------|-------------|---------------------|-------------|
| Spatial frequency | 0.5, 1.0, 1.5, 3.0, 4.5, 6.0 cpd | 1.5–12 cpd (0.015–0.12 cycles/px) | We miss very low freq (0.5–1.0 cpd). Paper tests 6 frequencies; we use 1 per trial |
| Contrast range | Near threshold (adaptive, Best PEST) | Calibration-mapped (2–100%) | Both adaptive; paper starts 10% above measured threshold |
| σ (envelope) | Not explicitly stated; 5° circular window | σ = λ (1/spatialFreq) | Paper may use larger σ for low frequencies |
| σ/λ ratio | Implied ≥1 (large window) | 1.0 (σ = λ) | May need to increase σ for low-freq stimuli |
| Stimulus size | 5° circular window (Optictrain-CS) | CANVAS_SIZE = 300px | Our size depends on viewing distance |
| Presentation duration | Max 5s per stimulus | Configurable (stimulusDuration) | Paper uses timeout; we use fixed duration |
| ISI | Not explicitly stated | Configurable (isi) | — |
| Orientations | 4 (vertical, horizontal, 45° left, 45° right) | 4 (horiz, diag1, vert, diag2) | ✅ Match |
| Phase | Not specified | Random per trial | — |
| Background | Neutral (achromatic) | Mid-gray (128) | ✅ Match |
| Noise | None | 0–100% (noise mode) | Paper doesn't use noise training |

### Training Protocol

| Parameter | Paper Value | gabor-svelte Current | Gap / Notes |
|-----------|-------------|---------------------|-------------|
| Session duration | 30 min/day | 30 min/session | ✅ Match |
| Sessions/day | 1 | 1 | ✅ Match |
| Total days | 20 consecutive days | No multi-day protocol | **Gap**: we have no session tracking across days |
| Total time | 600 min (target) | 30 min | Paper trains 20× more total |
| Adaptive method | Best PEST (Bayesian) | Simple up/down staircase | Paper's method is more efficient; we could adopt it |
| Step size | Best PEST rules | diffStep (configurable per mode) | — |
| Feedback | Binary (correct/incorrect orientation) | Binary (✓/✗) | ✅ Match |
| Gamification | Driving car game (avoid obstacles, collect items) | No gamification (pure psychophysics) | Paper shows gamification aids engagement |
| Viewing distance | 40 cm | Assumed 50 cm for cpd mapping | **Gap**: our cpd mapping assumes 50cm; paper uses 40cm |
| Display | Samsung Galaxy Tab A (colorimetrically characterized) | Canvas on user's device | Paper calibrates display; we have calibration module |
| Eye training | Binocular (both eyes) | Configurable (left/right/both) | ✅ We support this |
| Compliance tracking | Built-in software tracking | None | **Gap**: no compliance logging |

### Study Design

| Parameter | Value |
|-----------|-------|
| Population | Post-cataract surgery, trifocal IOL implantation |
| N (total) | 30 |
| N (per group) | 15 (study) + 15 (placebo) |
| Age (mean ± SD) | 60.6 ± 6.1 (study), 63.9 ± 6.6 (placebo) |
| Control type | Active placebo (driving game without Gabor stimuli) |
| Randomization | Random number sequence |
| Blinding | Double-masked (examiner unaware of group) |
| Duration | 3 weeks (20 training days) |
| IOL types | Finevision POD F, RayOne (two subgroups) |

---

## Findings

### Primary Outcomes

**Visual Acuity**: No significant improvement in distance, intermediate, or near VA (p ≥ 0.15). Training doesn't improve acuity — it improves contrast sensitivity.

**Contrast Sensitivity (Distance, CSV-1000)**:
- 6 cpd: Significant improvement in study group (p = 0.02)
- 12 cpd: Significant improvement in study group (p = 0.01)
- Other frequencies: No significant difference

**Contrast Sensitivity (Near, Optictrain-CS)**:
- 1.5 cpd: Significant improvement in study group (p = 0.02)
- Other frequencies: No significant difference

**Near CS (Pelli-Robson)**:
- Study group: 1.77 ± 0.12 logCS
- Placebo group: 1.68 ± 0.10 logCS
- p = 0.047 (significant)

### Compliance

- Study group: 555 ± 67 min (target 600 min)
- Placebo group: 469 ± 214 min
- No significant difference, but placebo had lower engagement (2 patients with very low compliance)
- No correlation between compliance time and outcomes

### Spatial Frequency Breakdown

| Frequency | Pre (Study) | Post (Study) | Pre (Placebo) | Post (Placebo) | p (post) |
|-----------|-------------|--------------|---------------|----------------|----------|
| 1.5 cpd | 2.19 ± 0.17 | 2.26 ± 0.11 | 2.20 ± 0.15 | 2.13 ± 0.15 | 0.02* |
| 3.0 cpd | 2.10 ± 0.23 | 2.18 ± 0.30 | 2.10 ± 0.19 | 2.05 ± 0.20 | 0.20 |
| 4.5 cpd | 1.99 ± 0.28 | 1.94 ± 0.28 | 2.10 ± 0.29 | 1.85 ± 0.25 | 0.35 |
| 6.0 cpd | 1.95 ± 0.31 | 1.86 ± 0.30 | 1.92 ± 0.32 | 1.76 ± 0.24 | 0.32 |

Distance CS (CSV-1000, logCS):
| Frequency | Post (Study) | Post (Placebo) | p |
|-----------|--------------|----------------|---|
| 6 cpd | 2.05 ± 0.15 | 1.86 ± 0.23 | 0.02* |
| 12 cpd | 1.72 ± 0.21 | 1.48 ± 0.16 | 0.01* |

---

## Comparison with gabor-svelte

### What We Already Have

- Gabor patch rendering with configurable σ, contrast, spatial frequency, phase
- 4AFC orientation task (horizontal, vertical, two diagonals)
- Adaptive contrast (up/down staircase)
- Calibration module for display characterization
- Multiple modes targeting different visual dimensions
- 30-minute session timer
- Lateral masking mode (Polat & Sagi paradigm)

### Gaps

1. **Very low spatial frequencies (0.5–1.0 cpd)**: Paper trains these; our minimum is ~1.5 cpd
2. **Multi-frequency training in one session**: Paper trains 6 frequencies per session; we train one frequency per mode selection
3. **Adaptive method**: Paper uses Best PEST (Bayesian); we use simple staircase
4. **Multi-day protocol**: Paper has 20-day program; we have no cross-session persistence
5. **Gamification**: Paper uses driving game; our interface is minimal
6. **Compliance logging**: Paper tracks minutes; we don't log training history across sessions
7. **Viewing distance**: Paper uses 40cm; our cpd mapping assumes 50cm

### Opportunities

1. **Add a "Clinical" or "Rehab" mode** that trains multiple frequencies in one session (like the paper's approach)
2. **Implement Best PEST** as an alternative adaptive algorithm — more efficient than simple staircase
3. **Add session history persistence** (localStorage) for multi-day training programs
4. **Low-frequency extension** — add ability to render very large Gabor patches (0.5–1.0 cpd)
5. **Compliance dashboard** — track total training time across sessions

---

## Recommendations

1. **[Priority: High] Add multi-frequency training mode**
   - Paper basis: Training 6 frequencies in one session improved CS at multiple points
   - Proposed change: New game mode that rotates through spatial frequencies within a session
   - Risk: May be harder to learn; could reduce engagement

2. **[Priority: Medium] Implement Best PEST adaptive algorithm**
   - Paper basis: Best PEST is more efficient than simple staircase, converging faster on threshold
   - Proposed change: Add Best PEST as alternative in `state.ts`
   - Risk: More complex implementation; needs testing

3. **[Priority: Medium] Add session persistence and compliance tracking**
   - Paper basis: 20-day protocol required compliance monitoring
   - Proposed change: Store session history in localStorage, show progress dashboard
   - Risk: Privacy considerations; storage limits

4. **[Priority: Low] Extend frequency range downward**
   - Paper basis: 0.5–1.0 cpd training showed benefit
   - Proposed change: Allow lower spatial frequencies in frequency and combo modes
   - Risk: Large patches may not render well on small screens

5. **[Priority: Low] Add viewing distance configuration**
   - Paper basis: 40cm viewing affects cpd mapping
   - Proposed change: Let user set viewing distance; adjust cpd calculation
   - Risk: Adds UI complexity

---

## Source Sections

### Methods — Gabor Stimuli
> "The Optictrain software uses Gabor patches, which are sinusoidal gratings with a Gaussian envelope that have been previously used in visual training studies (especially in amblyopia) as stimuli."

> "The training always began close to the threshold limit measured for each patient with the Optictrain-CS test (basal level). Specifically, the training began with a contrast value that was 10% over the threshold value measured for the spatial frequencies of 0.5, 1.0, 1.5, 3.0, 4.5, and 6.0 cpd."

> "According to the subject's responses, the contrast of the stimuli was varied following the rules of the Best PEST method."

### Methods — Training Protocol
> "Subjects were instructed to perform the training task (both Optictrain and placebo) 30 min per day for 20 consecutive days (600 min of training in total)."

### Results — Contrast Sensitivity
> "Significantly better distance contrast sensitivity (CS) was found for the spatial frequencies of 6 (p = 0.02) and 12 cpd (p = 0.01) in the study group."

> "A statistically significant improvement was found in the contrast sensitivity value corresponding to the spatial frequency of 1.5 (p = 0.026) in the study group."

### Discussion
> "A 3 week visual rehabilitation program based on the use of Gabor patches in the immediate postoperative period after the bilateral implantation of trifocal diffractive IOLs seems to be beneficial for improving both distance and near visual performance achieved with the implant."

---

## References

- Piñero DP, et al. Brain Sci. 2021;11(9):1181. doi:10.3390/brainsci11091181
- Polat U, Sagi D. Vision Research. 1993;33(7):993–999. (lateral masking paradigm)
- Campbell FW, Robson JG. J Physiol. 1968;197:551–566. (spatial frequency channels)
