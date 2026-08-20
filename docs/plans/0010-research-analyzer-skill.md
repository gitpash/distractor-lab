# Plan: Research Paper Analyzer Skill

## Context

distractor-lab is a visual perception trainer based on Gabor patches. The user wants a skill that can analyze scientific papers (clinical trials, psychophysics studies, vision science research) and extract practical, actionable insights relevant to the app's implementation.

The skill should take a paper URL (PMC, PubMed, arXiv, journal sites) or a local PDF/markdown file, parse it, and produce a structured analysis covering:

1. **Methodology parameters** — spatial frequencies, contrast levels, stimulus durations, viewing distances, sample sizes, training protocols
2. **Experimental findings** — what worked, what didn't, effect sizes, statistical significance
3. **Practical recommendations** — what can be borrowed for distractor-lab's game modes, calibration, adaptive staircase, training schedules

## Why This Matters

The app currently implements:
- Classic (adaptive contrast), Frequency, Noise, Fine (2AFC), Combo, and Lateral Masking modes
- Spatial frequencies in cycles/pixel (0.015–0.12, corresponding to ~1.5–12 cpd at 50cm/96PPI)
- σ = λ (sigma equals one wavelength) for Gaussian envelope
- Contrast range mapped through calibration profile
- 30-minute session timer with phase progression
- 4AFC orientation task (horizontal, vertical, two diagonals)

Published research (like the PMC8464827 trial) uses similar Gabor patch paradigms but with different parameters, training schedules, and clinical populations. Extracting these parameters helps validate and extend the app's approach.

## Design: Skill Structure

### Location

`.opencode/skills/research-analyzer/SKILL.md`

### Skill Workflow

1. **Input acquisition** — fetch paper from URL (webfetch) or read local file
2. **Content extraction** — parse the paper into structured sections (abstract, methods, results, discussion)
3. **Parameter extraction** — pull out specific numerical values relevant to Gabor patch training
4. **Gap analysis** — compare extracted parameters against distractor-lab's current implementation
5. **Recommendation generation** — produce actionable suggestions for new modes, parameter ranges, or protocol changes
6. **Output** — write analysis to `docs/research/<slug>.md` as a reusable reference

### Extraction Categories

#### A. Stimulus Parameters
- Spatial frequencies tested (cpd)
- Contrast levels and ranges
- Gaussian envelope (σ) values
- Stimulus size (degrees of visual angle)
- Presentation duration (ms)
- Inter-stimulus interval (ISI)
- Orientation set used
- Phase randomization approach

#### B. Training Protocol
- Session duration (minutes)
- Number of sessions / total training time
- Adaptive staircase rules (up/down steps, thresholds)
- Feedback type (binary, graded, none)
- Gamification elements
- Viewing distance
- Display calibration method

#### C. Clinical/Experimental Context
- Population (age, condition, sample size)
- Control group design
- Outcome measures (VA, CS, defocus curve)
- Statistical methods
- Effect sizes and confidence intervals

#### D. Findings & Implications
- What spatial frequencies showed improvement
- What contrast ranges were effective
- Training duration thresholds (minimum effective dose)
- Transfer effects (near vs far, different frequencies)
- Limitations and caveats

### Output Format

```markdown
# Research Analysis: <Paper Title>

**Source**: <URL>
**Date**: <analysis date>
**Relevance**: <high/medium/low>

## Key Parameters
| Parameter | Paper Value | distractor-lab Current | Gap |
|-----------|-------------|---------------------|-----|
| Spatial freq | X cpd | Y cycles/px | ... |
| Contrast range | X–Y% | calibration-mapped | ... |
| ...

## Training Protocol
- Session: X min/day × Y days
- ...

## Findings
- ...

## Recommendations
1. <actionable recommendation>
2. ...

## Source Sections
> <relevant quotes from the paper>
```

## Implementation Steps

### Step 1: Create skill directory and SKILL.md
- Create `.opencode/skills/research-analyzer/SKILL.md`
- Define the skill's instructions, extraction checklist, and output template

### Step 2: Create reference template
- Create `.opencode/skills/research-analyzer/references/extraction-template.md`
- Structured checklist for consistent extraction across papers

### Step 3: Create docs/research/ directory
- Where analysis outputs will be stored

### Step 4: Validate
- Test the skill against the PMC8464827 paper (the one already fetched)
- Verify extraction completeness
- Ensure recommendations are actionable

## Example: PMC8464827 Analysis Preview

From the paper we already fetched, key extractable parameters:

| Parameter | Value | Relevance |
|-----------|-------|-----------|
| Spatial freq | 0.5, 1.0, 1.5, 3.0, 4.5, 6.0 cpd | Our range: 1.5–12 cpd — we cover mid-high but miss very low freq |
| Stimulus type | Gabor patches (Gaussian-windowed sinusoidal) | ✅ Match |
| σ relationship | Not explicitly stated, but "5 degree circular window" | Our σ = λ; they may use larger σ |
| Presentation | Max 5s per stimulus, forced-choice orientation | We use fixed duration + ISI |
| Adaptive method | Best PEST | We use simple up/down staircase |
| Training | 30 min/day × 20 days = 600 min total | We have 30 min sessions, no multi-day protocol |
| Viewing distance | 40 cm | We assume 50cm for cpd mapping |
| Display | Samsung Galaxy Tab A, colorimetrically characterized | We have calibration but less rigorous |
| Key finding | CS improved at 6 and 12 cpd (distance) and 1.5 cpd (near) | Our frequency range covers these |
| Effect | Significant CS improvement, no VA change | Training targets CS, not VA — validates our approach |

## Validation
- `bun run check && bun run test && bun run build`
- Skill produces readable, structured analysis
- Recommendations map to specific distractor-lab code changes

---

## Architecture: Research Agent

### Overview

The research system has three layers:

```
┌─────────────────────────────────────────┐
│  User                                    │
│  "проанализируй статью" / "найди новое"  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Agent: .opencode/agents/research.md    │
│  - Mode selection (analysis/discovery)  │
│  - Orchestrates the workflow            │
│  - Creates GitHub issues                │
│  - Writes to docs/research/             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Skill: .opencode/skills/research-*     │
│  - Extraction methodology              │
│  - Checklist of parameters              │
│  - Comparison with distractor-lab         │
│  - Output template                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Data: docs/research/                   │
│  - watchlist.md (tracked sources)       │
│  - discovery-log.md (search history)    │
│  - references.md (papers queue)         │
│  - <slug>.md (full analyses)            │
└─────────────────────────────────────────┘
```

### Files Created

| File | Purpose |
|------|---------|
| `.opencode/agents/research.md` | Agent definition with permissions |
| `.opencode/skills/research-analyzer/SKILL.md` | Skill with extraction methodology |
| `.opencode/skills/research-analyzer/references/extraction-template.md` | Output template |
| `docs/research/watchlist.md` | Researchers, journals, products, queries |
| `docs/research/discovery-log.md` | Search history |
| `docs/research/references.md` | Papers queue |
| `docs/research/pmc8464827-trifocal-iol-gabor-rehab.md` | First analysis |

### Usage

**Analyze a paper:**
```
/prose "проанализируй https://pmc.ncbi.nlm.nih.gov/articles/PMC..."
```

**Find new research:**
```
/prose "найди новые статьи по Gabor patch training"
```

**Check tracked researchers:**
```
/prose "что нового у Polat и Sagi?"
```

**Periodic discovery (weekly):**
```
/prose "запусти discovery run по всем queries из watchlist"
```
