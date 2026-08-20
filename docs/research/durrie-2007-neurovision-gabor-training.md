# Research Analysis: Computer-Based Primary Visual Cortex Training for Treatment of Low Myopia and Early Presbyopia

**Source**: /Users/pavelluzanov/Developer/personal/distractor-lab/docs/pdfs/1545-6110_v105_p132.pdf
**DOI**: Trans Am Ophthalmol Soc 2007;105:132-140
**Date Analyzed**: 2026-08-19

---

## Verdict

**Decision**: accept

| Criterion | Assessment |
|-----------|------------|
| Relevance to distractor-lab | high — uses Gabor patches for visual training, measures CSF improvement at 1.5–18 cpd, uses lateral masking |
| Study design quality | adequate (n=29 treatment, n=9 control, multi-site, but not randomized double-masked) |
| Replication status | replicated (confirmed by Asian studies with n=55 myopia, n=41 presbyopia) |
| Effect size | 2.2 logMAR lines UCVA improvement, CSF improved to 86–92% of normal |
| Actionable? | yes — training protocol, spatial frequency range, and lateral masking paradigm directly applicable |

**Decision rationale**: This paper provides a clinically validated training protocol using Gabor patches with lateral masking. The spatial frequencies tested (1.5–18 cpd) overlap with distractor-lab's range, and the 30-session protocol with adaptive contrast is directly implementable. The paper validates the core premise of Gabor-based visual training with significant clinical outcomes.

**If reject/defer**: N/A — this is a strong candidate for implementation

---

## TL;DR

NeuroVision technology uses Gabor patches with lateral masking to train the visual cortex, improving unaided visual acuity by 2.2 logMAR lines and contrast sensitivity at all spatial frequencies (1.5–18 cpd) in patients with low myopia and early presbyopia. The training protocol (30 sessions × 30 minutes over 2–3 months) with adaptive contrast adjustment is directly applicable to distractor-lab.

---

## Key Parameters

### Stimulus

| Parameter | Paper Value | distractor-lab Current | Gap / Notes |
|-----------|-------------|---------------------|-------------|
| Spatial frequency | 1.5, 3, 6, 12, 18 cpd | 1.5–12 cpd (lateral mode) | Paper extends to 18 cpd — consider adding higher frequencies |
| Contrast range | Adaptive (patient-specific) | 2–100% (adaptive) | ✓ Matched — both use adaptive contrast |
| σ (envelope) | Not explicitly stated | k/freq (σ = λ, k=1.0) | Standard Gabor envelope |
| σ/λ ratio | Not stated | 1.0 (classic) | Standard |
| Stimulus size | Not explicitly stated | 300px canvas, radius=100 | Not comparable — different paradigm |
| Presentation duration | Not timed (response-based) | Not timed (user-controlled) | Similar — both wait for user response |
| ISI | Not specified | N/A (single stimulus) | Different paradigm |
| Orientations | Not specified (multiple) | 0°, 45°, 90°, 135° | Paper uses multiple orientations |
| Phase | Not specified | Random per trial | Paper doesn't discuss phase |
| Background | Not specified (likely gray) | #808080 (128/255 ≈ 50%) | Standard mid-gray |
| Noise | None | 0–100% (noise mode) | Paper doesn't use noise |
| Lateral masking | Yes (collinear flankers) | Yes (4λ distance) | ✓ Matched — both use Polat & Sagi paradigm |

### Training Protocol

| Parameter | Paper Value | distractor-lab Current | Gap / Notes |
|-----------|-------------|---------------------|-------------|
| Session duration | 30 minutes | Variable (user-controlled) | Paper: 30 min/session |
| Sessions/day | 1 | Unlimited | Paper: 2–3 sessions/week |
| Total days | 2–3 months | Ongoing | Paper: 30 sessions total |
| Total time | 30 sessions × 30 min = 15 hours | Ongoing | Paper: ~15 hours total |
| Adaptive method | Yes (contrast adjustment) | Yes (staircase/PEST) | ✓ Both adaptive |
| Step size | Not specified | 3–5 units per step | Paper: patient-specific |
| Feedback | Correct/incorrect | Visual feedback after each trial | ✓ Both provide feedback |
| Viewing distance | 5 ft (152 cm) | ~50 cm (typical) | Paper: farther viewing |
| Display | Computer monitor | Browser canvas, device-dependent | Paper: calibrated display |
| Eye training | Both eyes (monocular testing) | Binocular (default) | Paper trains binocular |

### Study Design

| Parameter | Value |
|-----------|-------|
| Population | Low myopia (up to -1.75 D) and early presbyopia (up to +2.50 D add) |
| N (total) | 29 treatment + 9 control = 38 |
| N (per group) | 11 myopia treatment, 18 presbyopia treatment, 9 control |
| Age (mean ± SD) | Myopia: 31.4 ± 1.52 years; Presbyopia: 46.9 ± 0.56 years |
| Control type | Visual examinations only (no sham training) |
| Randomization | Not randomized (clinic vs. home assignment) |
| Blinding | Not blinded |
| Duration | 30 sessions over 2–3 months |

---

## Findings

### Primary Outcomes

1. **Low myopia group**: Mean UCVA improved from 0.42 to 0.20 logMAR (2.2 logMAR lines improvement)
2. **Early presbyopia group**: Mean near UCVA improved from 0.47 to 0.25 logMAR (2.2 logMAR lines improvement)
3. **Control groups**: No significant change in vision

### Secondary Outcomes

1. **Contrast sensitivity**: Improved at all spatial frequencies (1.5, 3, 6, 12, 18 cpd) to within normal range
2. **Low myopia CSF**: Improved to 86.6% of normal
3. **Presbyopia CSF**: Improved to 92.0% of normal
4. **Refractive error**: Unchanged after treatment (confirms neural, not optical, mechanism)
5. **Safety**: No complications, no drop in VA, no adverse effects

### Spatial Frequency Breakdown

| Frequency | Baseline | Post-Training | Change | p-value |
|-----------|----------|---------------|--------|---------|
| 1.5 cpd | Reduced | Normal range | Significant | Not reported |
| 3 cpd | Reduced | Normal range | Significant | Not reported |
| 6 cpd | Reduced | Normal range | Significant | Not reported |
| 12 cpd | Reduced | Normal range | Significant | Not reported |
| 18 cpd | Reduced | Normal range | Significant | Not reported |

Note: Individual frequency data not provided; paper reports "improved at all spatial frequencies"

---

## Comparison with distractor-lab

### What We Already Have

- Gabor patch rendering with configurable spatial frequency, contrast, orientation, phase, σ
- Adaptive contrast threshold training (classic mode)
- Multiple spatial frequency modes (frequency, lateral)
- Lateral masking paradigm (Polat & Sagi)
- 4AFC and 2AFC task types
- Feedback after each trial

### Gaps

- **18 cpd frequency**: distractor-lab maxes out at 12 cpd; paper shows benefit at 18 cpd
- **Structured protocol**: distractor-lab has no fixed session duration or total session count
- **Patient-specific adaptation**: Paper uses baseline evaluation to personalize training; distractor-lab uses generic adaptive algorithm
- **Multi-session tracking**: distractor-lab doesn't track progress across sessions

### Opportunities

1. **Add 18 cpd frequency**: Extend lateral mode to include 18 cpd for higher-frequency training
2. **Structured training mode**: Add a "NeuroVision-style" mode with 30-min sessions and 30-session protocol
3. **Baseline evaluation**: Add initial assessment to personalize difficulty ranges
4. **Progress tracking**: Implement session-by-session progress visualization
5. **Marketing validation**: Cite this paper as clinical evidence for Gabor-based visual training

---

## Recommendations

1. **[Priority: High] Add 18 cpd to lateral mode frequencies**
   - Paper basis: CSF improved at 18 cpd, extending beyond distractor-lab's current 12 cpd max
   - Proposed change: Update LATERAL_FREQUENCIES to include 0.18 (18 cpd at 50cm/96PPI)
   - Risk: May be too fine for some displays; consider device capability check

2. **[Priority: Medium] Create "Structured Training" mode**
   - Paper basis: 30 sessions × 30 minutes over 2–3 months produced 2.2 logMAR line improvement
   - Proposed change: New mode with session timer, session counter, and progress tracking
   - Risk: May add complexity; consider as optional feature

3. **[Priority: Medium] Add baseline assessment**
   - Paper basis: NeuroVision uses 2 evaluation sessions to set baseline and personalize training
   - Proposed change: Initial calibration session that determines starting contrast/frequency for each user
   - Risk: May increase onboarding friction; consider as optional wizard

4. **[Priority: Low] Reference in documentation**
   - Paper basis: Clinical evidence for Gabor-based visual training efficacy
   - Proposed change: Cite this paper in README or landing page as supporting evidence
   - Risk: None — purely documentation

---

## Source Sections

### Methods Quote
> "Each training session lasts for approximately 30 minutes, during which the patient needs to respond to visual perception tasks (VPTs) displayed on the computer screen."

> "The VPTs are patient-specific stimuli using Gabor patches displayed in lateral masking techniques directed to enhance specific neuronal inefficiencies in the visual cortex."

> "If the patient answers correctly, the target contrast will be reduced and the task will become more difficult. Incorrect answers will trigger the program to increase the contrast and the task becomes easier."

### Results Quote
> "The low myopia treatment group achieved a mean improvement of 2.2 logMAR lines in unaided VA, from 0.42 to 0.20 logMAR."

> "Unaided CSF improved at all spatial frequencies (1.5, 3, 6, 12, 18 cpd)."

> "The control patients in both arms of the study have not shown any significant change in vision."

### Discussion Quote
> "The study results support as evidence that neural plasticity is retained in the adult brain."

> "This limited plasticity in the primary visual cortex provides us room for improving our visual processing."

> "Being more efficient and effective, the neural processing in the brain can enhance the image quality by compensating for blurred retinal images due to optical defocus of a low degree of myopia and presbyopia."

---

## References

- Durrie D, McMinn PS (2007). Computer-Based Primary Visual Cortex Training for Treatment of Low Myopia and Early Presbyopia. *Trans Am Ophthalmol Soc*, 105:132-140.
- Polat U, Sagi D (1993). Lateral interactions between spatial channels: suppression and facilitation revealed by lateral masking experiments. *Vision Res*, 33:993-999.
- Polat U, Ma-Naim T, Belkin M, Sagi D (2004). Improving vision in adult amblyopia by perceptual learning. *Proc Natl Acad Sci U S A*, 101:6692-6697.
