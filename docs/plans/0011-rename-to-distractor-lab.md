# Plan: 0011 — Rename project from gabor-svelte to distractor-lab

## Context

The project is being renamed from `gabor-svelte` to `distractor-lab` and will be deployed to `https://distractor.pages.dev` on Cloudflare Pages. The GitHub repo is `https://github.com/gitpash/distractor-lab`. The previous public-facing name was "PatchLab" (ADR-010), but the user has decided on "distractor-lab" as the final name. This is a full rename across package metadata, user-facing text, documentation, localStorage keys, and deployment config.

## Options

### Option A: Full rename in one pass

**Approach:** Rename every occurrence of `gabor-svelte` (package name), "Gabor Vision Trainer" (user-facing title), and related references in a single sweep. Update deployment metadata for Cloudflare Pages.

**Pros:** Clean break, no half-measures, consistent naming everywhere.
**Cons:** Large diff, touches docs/research files that reference the old name historically.

### Option B: Rename code + metadata, preserve historical docs

**Approach:** Rename package.json, i18n, manifest, AGENTS.md, and deployment config. Leave docs/adr/ and docs/research/ references to "gabor-svelte" as historical artifacts (they're internal docs, not user-facing).

**Pros:** Smaller diff, preserves historical context in ADRs and research docs.
**Cons:** Mixed naming in the repo can confuse future contributors.

## Decision

**Option A — Full rename.** The repo name is changing, the domain is changing, and the product name is "Distractor Lab" now. A clean sweep avoids confusion. Historical ADRs can reference the old name in prose context without needing the old package name.

## Implementation Steps

### 1. `package.json` — Rename package
- Change `"name": "gabor-svelte"` → `"name": "distractor-lab"`

### 2. `static/manifest.json` — PWA metadata
- Change `"name": "Gabor Vision Trainer"` → `"name": "Distractor Lab"`
- Change `"short_name": "Gabor"` → `"short_name": "Distractor"`
- Change `"description"` to something like "Train contrast sensitivity and visual acuity with adaptive Gabor patch exercises"

### 3. `src/lib/i18n/en.ts` — English title
- Change `title: "Gabor Vision Trainer"` → `title: "Distractor Lab"`

### 4. `src/lib/i18n/ru.ts` — Russian title
- Change `title: "Тренажер зрения Габора"` → `title: "Distractor Lab"` (keep brand name in English, or use "Distractor Lab" as the brand)

### 5. `src/lib/game/history.ts` — localStorage key
- Change `STORAGE_KEY = 'gabor-trainer-history'` → `STORAGE_KEY = 'distractor-lab-history'`
- **Migration note:** Existing users lose history on rename. Acceptable for a pre-launch project.

### 6. `AGENTS.md` — Agent instructions header
- Change `# gabor-svelte` → `# distractor-lab`

### 7. `README.md` — Project README
- Update the recreation command to use `distractor-lab` instead of `gabor-svelte`
- Add deployment instructions for Cloudflare Pages

### 8. `docs/adr/010-product-naming.md` — Update naming ADR
- Update to reflect the final name "Distractor Lab" at domain `distractor.pages.dev`
- Record this as the accepted decision

### 9. `.opencode/agents/architect.md` — Agent config
- Change `gabor-svelte` → `distractor-lab`

### 10. `.opencode/agents/research.md` — Agent config
- Change `gabor-svelte` → `distractor-lab`

### 11. `.opencode/command/revise-structure.md` — Agent config
- Change `gabor-svelte` → `distractor-lab`

### 12. `.opencode/skills/research-analyzer/SKILL.md` — Skill config
- Change `gabor-svelte` → `distractor-lab` in description and instructions

### 13. `.opencode/skills/research-analyzer/references/extraction-template.md`
- Change `gabor-svelte` → `distractor-lab`

### 14. `docs/research/` files — Research docs
- Update all references from `gabor-svelte` → `distractor-lab` in:
  - `pmc8464827-trifocal-iol-gabor-rehab.md`
  - `durrie-2007-neurovision-gabor-training.md`
  - `tsushima-2020-gabor-fmri-decoding.md`
  - `watchlist.md`
  - `references.md`
  - `discovery-log.md`

### 15. `docs/plans/` files — Plan docs
- Update `structural-audit.md`, `ux-audit.md`, `0010-research-analyzer-skill.md`

### 16. `bun.lock` — Regenerate
- Run `bun install` to regenerate lockfile with new package name

### 17. Deployment config
- Add `wrangler.toml` or ensure `@sveltejs/adapter-cloudflare` is configured
- The user needs to run `npx wrangler pages project create distractor-lab` on Cloudflare
- Set up custom domain `distractor.pages.dev` in Cloudflare dashboard

## Validation

- `bun run check` — types pass
- `bun run test` — tests pass
- `bun run build` — production build succeeds
- `grep -r "gabor-svelte" src/` — no remaining references in source code
- `grep -r "Gabor Vision Trainer" src/` — no remaining user-facing old title
- Verify PWA manifest has correct name
- Verify localStorage key changed (existing history will be orphaned)

## Risks

- **Existing users lose localStorage history** → Acceptable for pre-launch. The storage key rename means old `gabor-trainer-history` data is ignored.
- **Docs/research files have "gabor-svelte" in prose** → We rename these too, but ADR-010 can keep historical context in its narrative (it explains the rename chain).
- **Cloudflare Pages deployment not yet configured** → This plan covers code changes only. The user must configure the Cloudflare project separately.
- **GitHub remote not set** → The user needs to `git remote add origin https://github.com/gitpash/distractor-lab` and push.
