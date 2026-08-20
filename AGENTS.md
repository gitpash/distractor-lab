# distractor-lab

SvelteKit 2 + Svelte 5 runes, TypeScript, Tailwind v4, Bun, canvas rendering.
Visual perception trainer — Gabor patches, adaptive staircase, haptics, PWA, i18n (EN/RU).

Validate: `bun run check && bun run test && bun run build`

## System Prerequisites

- **bun** — package manager, dev server, build
- **python 3.10+** — required for markitdown
- **markitdown** — PDF/Office-to-markdown converter (research agent)
  - Install: `pip install 'markitdown[all]'` or `pip install 'markitdown[pdf]'`
  - Check: `markitdown --version`
  - Used by: research agent for local PDF analysis
