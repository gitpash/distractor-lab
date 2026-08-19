---
name: research-analyzer
description: Analyze vision science papers for practical parameters and recommendations relevant to Gabor patch visual perception training. Extracts stimulus parameters, training protocols, clinical findings, and produces actionable suggestions for gabor-svelte. Also supports proactive research discovery.
---

# Research Paper Analyzer

Analyze scientific papers (vision science, psychophysics, clinical ophthalmology) and extract practical insights for gabor-svelte. Also supports discovering new research.

## When to Use

- User shares a paper URL (PMC, PubMed, journal site, arXiv)
- User asks to analyze a local PDF or markdown file
- User wants to know "what can we learn from this paper?"
- User mentions extracting parameters from research
- User asks to find new research on a topic
- User asks to check for recent papers from tracked sources
- Research agent is invoked for discovery run

## CRITICAL: The Verdict Gate

**Every paper gets a verdict. No exceptions.**

Every paper that is reviewed — whether by user request or discovery — MUST receive one of three verdicts:

| Verdict | Meaning | Output |
|---------|---------|--------|
| **accept** | Has actionable insights for gabor-svelte | Full `<slug>.md` analysis |
| **defer** | Potentially relevant but not actionable now | One-liner in discovery-log + reference in references.md |
| **reject** | Not relevant, poor quality, or nothing to learn | One-liner in discovery-log only |

**Selection bias is the enemy.** If you only log accepted papers, the discovery log becomes a highlight reel, not a record of what was actually reviewed. The log must show the full funnel: what you looked at, what you decided, and why.

## Workflow: Paper Analysis

### 1. Acquire the Paper

**From URL:**
- Use `webfetch` with `format: "markdown"` to get the full text
- PMC articles work best (open access, full text available)
- For PubMed-only abstracts, note limitations and extract what's available

**From local file (markdown/text):**
- Use `read` to get the content directly

**From local file (PDF):**
- Convert to markdown first using `markitdown`:
  ```bash
  markitdown /path/to/paper.pdf -o /tmp/paper.md
  ```
- Then read the converted file: `read /tmp/paper.md`
- If `markitdown` is not installed, check AGENTS.md for installation instructions
- **Never use `read` directly on PDF files** — it produces garbled output

**Supported formats via markitdown:** PDF, DOCX, PPTX, XLSX, HTML, images (OCR), audio (transcription)

### 2. Read the Full Paper

Read the entire fetched content. Pay special attention to:

- **Abstract** — summary of methods and findings
- **Methods/Materials** — stimulus parameters, equipment, protocol
- **Results** — numerical findings, tables, figures
- **Discussion** — interpretation, limitations, comparisons

### 3. Quality Assessment (BEFORE extraction)

Before extracting parameters, assess the paper's quality and relevance:

#### Study Design Quality
| Level | Criteria |
|-------|----------|
| **Strong** | RCT with n>30, pre-registered, blinded, validated outcome measures |
| **Adequate** | Controlled trial with n>15, validated measures |
| **Weak** | Small sample (n<15), no control, or self-reported outcomes |
| **Preliminary** | Case study, n=1, or proof-of-concept only |
| **Poor** | No methodology described, n unknown, or unvalidated measures |

#### Relevance Assessment
Ask: "Does this paper contain something gabor-svelte could actually use?"
- **High**: Uses Gabor patches for visual training, tests spatial frequencies, or measures contrast sensitivity
- **Medium**: Related to visual training or psychophysics but different paradigm
- **Low**: Topically adjacent but nothing actionable (e.g., pure retinal physiology)

#### Decision Matrix
| Quality | Relevance | Verdict |
|---------|-----------|---------|
| Strong/Adequate | High | **accept** → full analysis |
| Strong/Adequate | Medium | **defer** → log + reference |
| Weak | High | **defer** → log, note caveats |
| Weak | Medium | **reject** → log only |
| Preliminary | High | **defer** → log, note "needs replication" |
| Preliminary | Medium/Low | **reject** → log only |
| Poor | Any | **reject** → log only |
| Any | Low | **reject** → log only |

### 4. Extract Parameters

Use the extraction checklist below. For each parameter, record:
- The exact value from the paper
- Units (cpd, degrees, ms, %, etc.)
- How it was measured or determined
- Any conditions or caveats

**Only for accept verdicts.** If verdict is reject/defer, skip full extraction.

### 5. Compare with gabor-svelte

Read the current implementation to understand what we already have:

- `src/lib/game/game-modes.ts` — current modes and parameter ranges
- `src/lib/game/renderer.ts` — Gabor patch rendering (σ, contrast, phase)
- `src/lib/game/calibration.ts` — display calibration approach
- `src/lib/game/types.ts` — data structures

Map each extracted parameter to the corresponding gabor-svelte code.

### 6. Generate Recommendations

For each gap or opportunity:
- State what the paper does differently
- Explain why it might be better (or not)
- Propose a concrete change (new mode, parameter range, protocol)
- Note any risks or unknowns

### 7. Write Output

**For accept verdicts:**
Save full analysis to `docs/research/<slug>.md` using the template.

**Naming convention:** `<first-author-lastname>-<short-topic>.md`
Example: `pinero-2021-gabor-iol-rehab.md`

**For defer verdicts:**
Add to `docs/research/references.md` with a one-line summary.

**For ALL verdicts (accept, defer, reject):**
Add a row to `docs/research/discovery-log.md` — see format below.

### 8. Create Issue (if significant)

If the analysis reveals actionable recommendations (accept verdict only), create a GitHub issue:

```bash
gh issue create \
  --title "Research: <short title>" \
  --body "## Paper\n< citation >\n\n## Key Finding\n< what matters >\n\n## Recommendation\n< what to do >\n\n## Analysis\nFull analysis: docs/research/<slug>.md"
```

## Workflow: Research Discovery

### 1. Load Watchlist

Read `docs/research/watchlist.md` for:
- Tracked researchers
- Tracked journals
- Tracked products
- Pre-built search queries

### 2. Search

Use `websearch` with queries from the watchlist. For each query:
- Record what was searched
- Note how many results were found
- Identify papers not yet analyzed

### 3. Filter

For each paper found:
- Check if already in discovery-log (compare titles/DOIs)
- Assess relevance: does it mention Gabor patches, contrast sensitivity,
  adaptive psychophysics, visual training, spatial frequency?
- Assign preliminary relevance (high/medium/low)

### 4. Process — THE GATE

For each paper:
1. Fetch full text (or abstract if paywalled)
2. Run Quality Assessment (Step 3 of Paper Analysis)
3. Assign verdict using Decision Matrix
4. **Log the verdict** — every paper, no exceptions

Then:
- **accept** → full analysis → `<slug>.md` → optional GitHub issue
- **defer** → one-liner in log → entry in references.md
- **reject** → one-liner in log only

### 5. Log — THE FUNNEL

Update `docs/research/discovery-log.md`. Format for each paper:

```
| <short title> | <verdict> | <1-line reason> |
```

Example:
```
| Piñero et al. 2021 — Gabor rehab | accept | RCT, n=30, significant CS improvement at 6/12 cpd |
| Smith et al. 2023 — VR vision training | defer | n=12, no control, but interesting paradigm |
| Jones 2022 — retinal contrast processing | reject | Pure physiology, no training component |
```

**The log shows the full funnel.** If someone reads the log, they should see:
- How many papers were reviewed
- How many were accepted vs deferred vs rejected
- Why each was rejected/deferred

## Extraction Checklist

### A. Stimulus Parameters

- [ ] Spatial frequencies tested (cpd)
- [ ] Contrast levels and ranges (absolute or relative)
- [ ] Gaussian envelope σ (or σ/λ ratio)
- [ ] Stimulus size (degrees visual angle or pixels)
- [ ] Presentation duration (ms)
- [ ] Inter-stimulus interval (ISI, ms)
- [ ] Orientation set (how many, which angles)
- [ ] Phase handling (randomized, fixed, counterbalanced)
- [ ] Background luminance (cd/m² or relative)
- [ ] Noise type and level (if any)

### B. Training Protocol

- [ ] Session duration (minutes)
- [ ] Frequency (sessions per day/week)
- [ ] Total training duration (days/weeks)
- [ ] Total training time (minutes)
- [ ] Adaptive staircase method (PEST, 1-up-1-down, 2-down-1-up, etc.)
- [ ] Step size and rules
- [ ] Feedback type (correct/incorrect, graded, none)
- [ ] Gamification elements (if any)
- [ ] Viewing distance (cm)
- [ ] Display device and calibration method
- [ ] Monocular vs binocular training

### C. Study Design

- [ ] Population (age, condition, healthy/clinical)
- [ ] Sample size (n)
- [ ] Control group design (placebo, no-contact, active control)
- [ ] Randomization method
- [ ] Blinding (single, double, none)
- [ ] Inclusion/exclusion criteria
- [ ] Outcome measures (what was measured and how)
- [ ] Statistical tests used
- [ ] Effect sizes and confidence intervals

### D. Key Findings

- [ ] What improved (VA, CS, specific frequencies, reaction time)
- [ ] Effect sizes (Cohen's d, % improvement)
- [ ] Which spatial frequencies showed most improvement
- [ ] Training duration threshold (minimum effective dose)
- [ ] Transfer effects (training one freq → improvement at another)
- [ ] Decay over time (follow-up results)
- [ ] Adverse effects or limitations

## Common Vision Science Terms

- **cpd** — cycles per degree of visual angle
- **CS / CSF** — contrast sensitivity / contrast sensitivity function
- **VA** — visual acuity
- **logCS** — logarithmic contrast sensitivity (log10(1/threshold))
- **logMAR** — logarithm of the minimum angle of resolution
- **PEST** — Parameter Estimation by Sequential Testing (adaptive method)
- **Best PEST** — variant of PEST with Bayesian updating
- **2AFC / 4AFC** — 2/4 alternative forced choice
- **ISI** — inter-stimulus interval
- **IOL** — intraocular lens
- **EDOF** — extended depth of focus
- **λ** — wavelength (1/spatial frequency)

## Output Files

| File | Purpose | When Updated |
|------|---------|--------------|
| `docs/research/<slug>.md` | Full paper analysis | Per accepted paper |
| `docs/research/watchlist.md` | Tracked sources | Periodically |
| `docs/research/discovery-log.md` | Search history + ALL verdicts | Per paper reviewed |
| `docs/research/references.md` | Papers deferred for later | Per deferred paper |

## Boundary: Research Only

This skill writes ONLY to `docs/research/`. It does NOT:
- Create plans in `docs/plans/`
- Write ADRs in `docs/adr/`
- Invoke `plan-feature` or `write-adr`
- Make implementation decisions

If a paper's recommendations should become a feature, the **architect agent** handles the transition from research → plan. The research agent flags the opportunity; the architect acts on it.

## Limitations

- Web scraping may not capture all content from paywalled journals
- Figure/table data may be partially extracted (descriptions available, raw data often not)
- Some papers use different conventions for reporting spatial frequency (cpd vs cycles/image vs cycles/deg)
- Always note when a parameter is inferred rather than explicitly stated
- GitHub issue creation requires `gh` CLI to be authenticated
- PDF conversion requires `markitdown` (see AGENTS.md for installation)
- markitdown may not perfectly preserve complex table layouts from PDFs

## Defer Pile Management

Defer entries accumulate over time. Without review, they become a silent backlog.

### When to Review

- When `docs/research/references.md` reaches **5+ entries**
- Or every **4 discovery runs** (roughly monthly at weekly cadence)
- Or when the user asks to "review deferred papers"

### How to Review

For each entry in references.md:

1. **Check for new evidence**: Has the paper been replicated? Has new data appeared?
   - Use websearch: `"<paper title>" replication OR "similar study"`
2. **Re-evaluate against current gabor-svelte**: Has our implementation changed since defer?
3. **Decide**:
   - **Stay defer**: Still interesting but not actionable — keep in references.md
   - **Upgrade to accept**: New replication, or current implementation now makes it relevant — run full analysis
   - **Downgrade to reject**: No new evidence, not relevant to current direction — move to discovery-log as reject, remove from references.md

### Log the Review

Add a section to discovery-log.md:

```
## YYYY-MM-DD — Defer Review

Reviewed N entries from references.md.

| Paper | Previous | New Verdict | Reason |
|-------|----------|-------------|--------|
| ... | defer | accept | Replication study published, n=80 |
| ... | defer | reject | No new evidence, not actionable |
| ... | defer | defer | Still pending, revisit next cycle |

**Summary**: N reviewed, N upgraded, N downgraded, N stayed
```
