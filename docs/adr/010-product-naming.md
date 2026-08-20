# ADR-010: Product Naming — Distractor Lab

## Status
Accepted

## Context
The project needed a public-facing name for the Gabor patch visual perception trainer. Naming evolution:

1. `gabor-train` (domain `gabor-train.pages.dev`, title "Gabor Vision Trainer")
2. **PatchLab** (domain `patchlab.pages.dev`) — rejected in favor of final name
3. **Distractor Lab** (domain `distractor.pages.dev`) — final name

The GitHub repo is `https://github.com/gitpash/distractor-lab`.

## Decision
Rename the project to **Distractor Lab** (domain `distractor.pages.dev`).

### Rationale
- **Scientific accuracy.** "Distractor" is the psychophysics term for stimuli that compete with the target — which is exactly what the Gabor patches do in this trainer.
- **Short, memorable, unique.** One compound concept, easy to recall and type.
- **Internationally accessible.** "Distractor" is understood in both English and Russian scientific contexts.
- **Domain available.** `distractor.pages.dev` is clean and available on Cloudflare Pages.

### Migration Steps
- Package name: `distractor-lab` in `package.json`
- PWA manifest: name "Distractor Lab", short_name "Distractor"
- i18n: title "Distractor Lab" in both EN and RU
- localStorage key: `distractor-lab-history`
- GitHub repo: `gitpash/distractor-lab`
- Cloudflare Pages project: `distractor-lab`, custom domain `distractor.pages.dev`

## Consequences
- Clean, unique brand identity rooted in the science
- One-time migration effort (domain + metadata + docs)
- Old domains preserved via redirects if desired
- "Gabor" remains in scientific context (docs, ADRs, code comments) but is no longer the public brand
