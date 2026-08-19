# Calibration Phase Rework

**Date:** 2026-08-18
**Trigger:** Review found race conditions, excessive trial count, and patch visibility issues
**Scope:** `src/lib/game/calibration.ts`, `src/routes/calibration/+page.svelte`, new `src/lib/game/calibration-orchestrator.ts`
**Status:** 📋 Planned
**ADR:** [ADR-007](../adr/007-calibration-state-machine.md)

---

## Problems Found

### P1: Race Condition — No FSM 🔴

The calibration loop (`calibrationLoop()`) uses nested `setTimeout` chains. The only guard is `waitingForResponse`. No explicit phases, no double-invocation protection, no pause.

**Root cause:** Ad-hoc implementation vs. the orchestrator pattern used by the main game.

### P2: Too Many Trials 🟡

160 trials (4 freq × 4 orient × 10 trials) ≈ 5+ minutes. Calibration should be <2 min.

### P3: Patches Too Visible 🟡

Fixed `radius: 80` with `sigma: 1.0/freq`. Low frequencies fill the entire canvas.

---

## Implementation Plan

### Step 1: Create `calibration-orchestrator.ts`

**New file:** `src/lib/game/calibration-orchestrator.ts`

Pattern: copy structure from `orchestrator.ts` (lines 1–68 for interfaces, 70–242 for implementation).

```
CalibrationOrchestratorCallbacks:
  onFixationStart()       — show fixation cross
  onStimulusShow()        — render current trial
  onBlank()               — clear canvas
  onWaitingForResponse()  — enable input
  onFeedback(correct)     — show ✓/✗
  onPointComplete(point)  — store result
  onDone(profile)         — calibration finished

CalibrationOrchestrator:
  start()                 — begin threshold measurement
  handleAnswer(key)       — process response
  handleSkip()            — skip trial (no penalty)
  getState()              — current CalibrationState
```

FSM phases: `fixation → stimulus → isi → waiting → feedback → (next trial | next point | complete)`

### Step 2: Update `calibration.ts` constants

```typescript
// Before:
CALIBRATION_FREQUENCIES = [0.015, 0.03, 0.06, 0.09]  // 4
CALIBRATION_ORIENTATIONS = ['horiz', 'vert', 'diag1', 'diag2']  // 4
CALIBRATION_TRIALS_PER_POINT = 10

// After:
CALIBRATION_FREQUENCIES = [0.03, 0.06, 0.09]  // 3
CALIBRATION_ORIENTATIONS = ['horiz', 'vert']  // 2
CALIBRATION_TRIALS_PER_POINT = 6
```

Total: 3 × 2 × 6 = 36 trials ≈ ~1 min

### Step 3: Fix patch rendering in `renderCurrentTrial()`

```typescript
// Before:
renderPatch(data, w, h, {
    ...
    radius: 80,
});

// After:
const sigma = 1.0 / freq;
renderPatch(data, w, h, {
    ...
    sigma,
    radius: sigma * 2.5,
});
```

### Step 4: Update `processCalibrationAnswer()` staircase

```typescript
// Before: 1-up-3-down
if (state.consecutiveIncorrect >= 3) {
    state.currentThreshold = Math.min(1.0, state.currentThreshold * 1.26);
}

// After: 1-up-2-down (standard for 4AFC)
if (state.consecutiveIncorrect >= 2) {
    state.currentThreshold = Math.min(1.0, state.currentThreshold * 1.26);
}
```

### Step 5: Refactor `+page.svelte` to use orchestrator

Replace the inline `calibrationLoop()` + nested timeouts with orchestrator callbacks:

```typescript
let calOrch = createCalibrationOrchestrator(
    {
        onFixationStart: () => { fixationOpacity = 1; drawBlank(); },
        onStimulusShow: () => { fixationOpacity = 0; renderCurrentTrial(); },
        onBlank: () => drawBlank(),
        onWaitingForResponse: () => { /* enable input */ },
        onFeedback: (correct) => { /* show feedback */ },
        onDone: (profile) => { /* navigate to results */ },
    },
    timers
);
```

Remove: `calibrationLoop()`, nested `timers.setLoopTimeout` chains, manual `waitingForResponse` management.

### Step 6: Update `CalibrationState` totalTrials

```typescript
// Before:
const totalTrials = CALIBRATION_FREQUENCIES.length *
    CALIBRATION_ORIENTATIONS.length *
    CALIBRATION_TRIALS_PER_POINT;
// = 4 * 4 * 10 = 160

// After:
// = 3 * 2 * 6 = 36
```

---

## Validation

| Check | Command |
|-------|---------|
| Type check | `bun run check` |
| Unit tests | `bun run test` |
| Build | `bun run build` |
| Manual test | Run calibration, verify: <2 min, patches scale with freq, no dropped clicks |

---

## Files Changed

| File | Action |
|------|--------|
| `src/lib/game/calibration-orchestrator.ts` | **New** — FSM orchestrator |
| `src/lib/game/calibration.ts` | **Edit** — constants, staircase, totalTrials |
| `src/routes/calibration/+page.svelte` | **Edit** — use orchestrator, remove inline loop |
