# Structural Smells Checklist

Mechanical signals to check during audit. Don't scan blindly — use as a guide
once the user points at an area.

## God Module

- Single file >300 lines doing multiple unrelated things.
- `src/lib/game/` currently has: renderer, session, state, types, calibration, haptics, keyboard, history, icon-animation, orchestrator, hooks, game-modes. Check if any file owns too many concerns.
- Game logic lives in `orchestrator.ts` (testable without DOM). Pages are UI shells.

## Duplicated Logic

- Same pattern appearing in 2+ places with minor variations.
- Especially in Svelte components — repeated reactive blocks that could be a shared function.
- ✅ Haptics lifecycle: unified via `useHaptics()` hook in `lib/game/hooks.ts`
- ✅ Timer management: unified via `useGameTimers()` hook in `lib/game/hooks.ts`

## Import Cycles

- Module A imports B, B imports A. Indicates circular dependency or misplaced responsibility.

## Misplaced Concern

- Business logic inside a Svelte component (should be in `src/lib/game/`).
- UI rendering inside a game logic module.
- Type definitions scattered across files instead of centralized in `types.ts`.
- ✅ `game-modes.ts` is now in `src/lib/game/` where it belongs.

## Large Inline Blocks

- Big `{#if}` / `{#each}` blocks in `.svelte` files that could be extracted to child components.
- Long `$effect` or `$derived` chains that could be broken into named functions.
- Calibration phases use `{#if}` blocks — acceptable because they share a single canvas `bind:this` and tightly coupled state.

## Dead Code

- Exports nobody imports. Check with: `grep -r "function-name" src/ | wc -l`.
- Types defined but never referenced.
- Test-only utilities leaking into production code.
- ✅ `buildCalibrationTrial()` was deleted (was defined but never called).
