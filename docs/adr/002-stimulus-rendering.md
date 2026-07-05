# ADR-002: Stimulus Rendering Approach

## Status
Accepted

## Context
Gabor patches must be rendered pixel-by-pixel onto a canvas. The original used inline canvas code. The SvelteKit version needs to render from a Svelte component.

## Decision
Pure TypeScript rendering functions in `$lib/game/renderer.ts` with no framework dependency. Canvas is bound via `bind:this` in the game page component.

### Architecture
```
renderer.ts (pure TS)
  ├── renderPatch(data, w, h, params)  — writes pixels to ImageData
  └── showBlank(ctx)                   — fills canvas gray

[game]/+page.svelte (Svelte component)
  ├── canvas bind:this={canvasEl}
  ├── ctx = canvasEl.getContext("2d")
  └── calls renderer functions
```

### Rendering Pipeline
1. Create `ImageData` (300×300)
2. Fill with gray (#808080)
3. For each patch in trial: call `renderPatch()` with orientation, contrast, frequency, sigma, noise, phase
4. `ctx.putImageData()` to canvas
5. CRT overlay sits on top via CSS (no canvas rendering)

### Canvas Size
- Fixed 300×300 internal resolution
- CSS scales to viewport via `width: min(80vw, 80vh, 400px)`
- `image-rendering: pixelated` for crisp pixel art aesthetic

## Consequences
- Rendering is pure computation — testable without DOM
- CRT overlay is CSS-only (scanlines + vignette), no performance impact on canvas
- 2AFC mode renders two patches side-by-side at cx=85 and cx=215 with radius=65
