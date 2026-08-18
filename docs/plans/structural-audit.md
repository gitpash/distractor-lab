# Structural Audit: gabor-svelte

**Date:** 2026-08-18
**Trigger:** Overall structural integrity review (audit-structure skill)
**Scope:** Full codebase — `src/lib/`, `src/routes/`, type definitions, module boundaries
**Status:** ✅ Resolved (Option B implemented)

---

## Findings

### F1: God Page Components ✅ Resolved

Both main pages mixed game logic, rendering, keyboard handling, and UI into single 700-line files.

| File | Before | After | Change |
|------|--------|-------|--------|
| `routes/[game]/+page.svelte` | 702 lines | 579 lines | **-17.5%** — game loop extracted to orchestrator |
| `routes/calibration/+page.svelte` | 695 lines | 675 lines | Haptics + timers deduplicated |

**Resolution:** Game loop, pause system, and demo loop extracted to `lib/game/orchestrator.ts` (243 lines, pure TS, no DOM). Page is now a thin UI shell that passes callbacks. Calibration phases kept in-page — `{#if}` blocks already separate them cleanly, and the shared canvas `bind:this` makes extraction counterproductive.

### F2: Duplicated Logic — Haptics Lifecycle ✅ Resolved

Same `onMount` block was copy-pasted in 3 pages.

**Resolution:** Created `useHaptics()` hook in `lib/game/hooks.ts`. All 3 pages now call `useHaptics()` instead of duplicating the lifecycle block.

### F3: Duplicated Logic — Timer Management ✅ Resolved

Identical `loopTimeout` + `clearTimers()` + `$effect` cleanup was duplicated in 2 pages.

**Resolution:** Created `useGameTimers()` hook in `lib/game/hooks.ts` with `setLoopTimeout`, `setResumeInterval`, `setAnimFrame`, and `clearTimers`. Both pages now use the shared hook.

### F4: Duplicated Logic — Canvas Rendering Boilerplate ⚠️ Not Addressed

Both pages re-implement the "create ImageData → fill gray → render → putImageData" cycle.

**Decision:** Skipped. The rendering logic differs meaningfully between pages (game page handles lateral masking + 2AFC positioning; calibration page handles gamma/floor/threshold rendering). A shared helper would need so many parameters that it adds complexity without clarity.

### F5: Misplaced Concern — game-builder.ts ✅ Resolved

`src/lib/game-builder.ts` sat in `src/lib/` instead of `src/lib/game/`.

**Resolution:** Moved to `src/lib/game/game-modes.ts`. Updated `src/lib/index.ts` re-export.

### F6: Near-Duplicate Types ⚠️ Not Addressed

`LateralMaskingParams` (`renderer.ts`) and `LateralMaskingTrialPatch` (`types.ts`) are nearly identical shapes.

**Decision:** Deferred. Merging them requires aligning the rendering interface (which uses raw numbers) with the trial definition (which uses `OrientKey` unions). Low risk of drift since the lateral masking mode is stable. Can be addressed in a future cleanup pass.

### F7: Dead Code ✅ Resolved

`buildCalibrationTrial()` in `calibration.ts` was defined but never called.

**Resolution:** Deleted.

---

## Implementation Summary

| Step | Status | Files Changed |
|------|--------|---------------|
| Create `useHaptics()` hook | ✅ Done | `lib/game/hooks.ts` (new), 3 route pages |
| Create `useGameTimers()` hook | ✅ Done | `lib/game/hooks.ts`, 2 route pages |
| Move `game-builder.ts` → `game/game-modes.ts` | ✅ Done | 1 file move, `lib/index.ts` |
| Delete `buildCalibrationTrial()` | ✅ Done | `lib/game/calibration.ts` |
| Create `lib/game/orchestrator.ts` | ✅ Done | `lib/game/orchestrator.ts` (new) |
| Refactor `[game]/+page.svelte` to use orchestrator | ✅ Done | `routes/[game]/+page.svelte` |
| Extract calibration phase components | ⏭️ Skipped | Phases too tightly coupled to canvas/state |

## Validation

| Check | Result |
|-------|--------|
| `bun run check` | ✅ 0 errors, 6 warnings (pre-existing state capture patterns) |
| `bun run test` | ✅ 27/27 tests pass |
| `bun run build` | ✅ Built in 1.57s |

---

## New Files Created

- **`src/lib/game/hooks.ts`** (67 lines) — `useHaptics()` + `useGameTimers()` shared hooks
- **`src/lib/game/orchestrator.ts`** (243 lines) — Pure TS game loop orchestrator, testable without DOM
- **`src/lib/game/game-modes.ts`** (248 lines) — Game mode configs (moved from `lib/game-builder.ts`)
