# ADR-009: Refactor Fine Mode → Standard 2AFC Orientation Discrimination

## Status

Proposed

## Context

The "Fine" mode (`type: "2afc"`) is an orientation discrimination task, but it diverges from the standard psychophysics paradigm in ways that make it unusable:

1. **Two patches instead of one** — The standard 2AFC orientation discrimination task shows a **single** Gabor patch tilted left or right from a reference axis. Our implementation shows **two** patches and asks "which is more tilted?" — a cognitively harder task with no clear reference frame.

2. **Random reference axis** — The reference angle is randomly chosen from {0°, 45°, 90°, 135°} each trial. The standard paradigm uses a **fixed reference** (vertical = 90°). A changing reference axis makes the question "which is more tilted?" ambiguous.

3. **Wrong answer interface** — Four directional buttons (horizontal, 45°, vertical, 135°) are shown, but 2AFC requires only **two** choices: Left or Right.

4. **No instructions** — No explanation of the task, reference frame, or how to respond.

### Standard Paradigm (from literature)

The established 2AFC orientation discrimination task (Frontiers in Aging Neuroscience, 2017; AIP Advances, 2015; Phelps, Ling & Carrasco, 2006):

- **One** Gabor patch shown briefly (33–100ms)
- Reference axis = **vertical** (90°)
- Patch tilted **left** (counterclockwise) or **right** (clockwise) from vertical
- Observer answers: **Left** or **Right**
- Difficulty = magnitude of tilt (Δ angle from vertical)

## Decision

Refactor `fine` mode to match the standard 2AFC orientation discrimination paradigm:

1. **Single patch** — Show one Gabor patch, not two
2. **Fixed reference** — Vertical (90°), always
3. **Left/Right** — Patch tilted counterclockwise or clockwise from vertical
4. **Two answer buttons** — ◀ Left / Right ▶
5. **Clear instructions** — Before first trial

## Implementation

### Step 1: Refactor `buildTrial` in `game-modes.ts`

**File:** `src/lib/game/game-modes.ts`

Replace the current `fine.buildTrial` (lines 140–166):

```ts
// BEFORE (broken):
buildTrial(diff: number, phase: number) {
  const refAngle = ORIENTATIONS[randomOrient()].angle; // random!
  const targetAngle = refAngle + diff;
  const tiltedLeft = Math.random() < 0.5;
  return {
    patches: [
      { angle: tiltedLeft ? targetAngle : refAngle, ... },
      { angle: tiltedLeft ? refAngle : targetAngle, ... },
    ],
    correct: tiltedLeft ? 0 : 1,
  };
}

// AFTER (standard):
buildTrial(diff: number, phase: number) {
  const tiltedLeft = Math.random() < 0.5;
  const angle = 90 + (tiltedLeft ? -diff : diff); // ±diff from vertical
  const freq = 0.04;
  return {
    patches: [
      {
        angle,
        contrast: 0.8,
        spatialFreq: freq,
        sigma: sigmaFromFreq(freq),
        noise: 0,
        phase,
      },
    ],
    correct: tiltedLeft ? "left" : "right",
  };
}
```

Key changes:
- **One patch** in `patches` array (not two)
- Reference = 90° (vertical), offset = ±diff
- `correct` = `"left"` or `"right"` (string, not index)

### Step 2: Update `processAnswer` in `state.ts`

**File:** `src/lib/game/state.ts`

The comparison on line 63-66 already handles string comparison for 2AFC:
```ts
const isCorrect =
  mode.type === '2afc'
    ? parseInt(key) === state.currentTrial.correct  // ← this assumes numeric
    : key === state.currentTrial.correct;
```

Change to:
```ts
const isCorrect =
  mode.type === '2afc'
    ? key === state.currentTrial.correct  // now "left"/"right" strings
    : key === state.currentTrial.correct;
```

### Step 3: Update keyboard bindings

**File:** `src/lib/game/keyboard.ts`

Current 2AFC bindings (lines 6-9):
```ts
if (k === 'ArrowLeft' || k === '1' || k === 'a' || k === 'A' || k === 'ф' || k === 'Ф') return '0';
if (k === 'ArrowRight' || k === '2' || k === 'd' || k === 'D' || k === 'в' || k === 'В') return '1';
```

Change to:
```ts
if (k === 'ArrowLeft' || k === '1' || k === 'a' || k === 'A' || k === 'ф' || k === 'Ф') return 'left';
if (k === 'ArrowRight' || k === '2' || k === 'd' || k === 'D' || k === 'в' || k === 'В') return 'right';
```

### Step 4: Update `getCorrectAnswerLabel` in `state.ts`

**File:** `src/lib/game/state.ts`

Current (line 144):
```ts
if (mode.type === '2afc') {
  return state.currentTrial.correct === 0 ? 'Left' : 'Right';
}
```

Change to:
```ts
if (mode.type === '2afc') {
  return state.currentTrial.correct === 'left' ? '◀ Left' : 'Right ▶';
}
```

Also update the duplicate in `orchestrator.ts` (line 219-221).

### Step 5: Make `AnswerTiles.svelte` mode-aware

**File:** `src/lib/AnswerTiles.svelte`

Add `modeType` prop:
```ts
type Props = {
  onAnswer: (key: string) => void;
  onSkip: () => void;
  onRepeat: () => void;
  canRepeat: boolean;
  isIOS: boolean;
  modeType?: "4afc" | "2afc";  // ← new
};
```

Conditionally render:
- `modeType === "2afc"` → Two large buttons: ◀ Левый / Правый ▶
- `modeType === "4afc"` (default) → Current 4-direction joystick

### Step 6: Make `key-hints.svelte` mode-aware

**File:** `src/lib/key-hints.svelte`

Add `modeType` prop. When `layout="answers"` and `modeType="2afc"`:
- Show two cards: "← Left (A)" / "Right (D) →"
- Remove 4-direction grid

### Step 7: Pass `modeType` from game page

**File:** `src/routes/[game]/+page.svelte`

Pass `modeConfig.type` to both components:
```svelte
<AnswerTiles
  onAnswer={(k) => orch.handleAnswer(k)}
  onSkip={() => orch.handleSkip()}
  onRepeat={() => orch.handleRepeat()}
  canRepeat={replayCount < maxReplays}
  {isIOS}
  modeType={modeConfig.type}  ← new
/>

<KeyHints layout="answers" onKey={(k) => orch.handleAnswer(k)} {activeKey} modeType={modeConfig.type} />
```

### Step 8: Update canvas rendering

**File:** `src/routes/[game]/+page.svelte`

In `renderCurrentPatch()` (line 68-115), the `is2afc` logic currently positions two patches side by side:
```ts
cx: is2afc ? (i === 0 ? 85 : 215) : 150,
radius: is2afc ? 65 : 100,
```

For single-patch 2AFC, render **one patch at center** (same as 4AFC):
```ts
cx: 150,
radius: 100,
```

Or keep the smaller radius for 2AFC to match the single-patch stimulus size from literature. Decision: use `radius: 100` (full size) since it's a single patch now.

### Step 9: Update i18n

**English** (`src/lib/i18n/en.ts`):
```ts
fine: {
  title: "Tilt",
  subtitle: "2AFC",
  desc: "Left or right from vertical",
  instruction: "A single patch appears briefly. It is tilted slightly left or right from vertical. Choose the direction.",
  diffLabel: "Tilt angle",
}
```

**Russian** (`src/lib/i18n/ru.ts`):
```ts
fine: {
  title: "Наклон",
  subtitle: "2АФЗ",
  desc: "Влево или вправо от вертикали",
  instruction: "Один паттерн появляется на мгновение. Он наклонён влево или вправо от вертикали. Выберите направление.",
  diffLabel: "Угол наклона",
}
```

### Step 10: Update `game-modes.ts` metadata

```ts
fine: {
  title: "Tilt",          // was "Fine"
  subtitle: "2AFC",
  icon: "⇔",
  wide: false,
  desc: "Left or right from vertical",  // was "Which tilted more?"
  type: "2afc",
  diffLabel: "Tilt angle",  // was "Δ angle"
  diffStart: 15,
  diffMin: 1,
  diffMax: 45,
  diffStep: 1,
  diffLower: true,
  diffFormat: (v: number) => v.toFixed(0) + "°",
  buildTrial: /* as above */,
}
```

### Step 11: Show instruction before first trial

Add an instruction overlay or text that appears before the first trial in fine mode. Options:

**Option A (simple):** Show `instruction` text above the canvas during the first trial only.

**Option B (overlay):** Show a one-time instruction overlay before the game starts, with a "Got it" button.

Recommendation: Option A — simpler, less disruptive.

In `+page.svelte`, add:
```svelte
{#if modeConfig?.instruction && trial <= 1 && !isPaused}
  <div class="instruction-text">{modeConfig.instruction}</div>
{/if}
```

## Files to Change

| File | Change |
|------|--------|
| `src/lib/game/game-modes.ts` | Refactor `fine.buildTrial` to single-patch, update metadata |
| `src/lib/game/state.ts` | Fix2AFC answer comparison (string, not parseInt) |
| `src/lib/game/keyboard.ts` | Map 2AFC to `"left"`/`"right"` strings |
| `src/lib/game/orchestrator.ts` | Update `getCorrectAnswerLabel` for string correct |
| `src/lib/AnswerTiles.svelte` | Add `modeType` prop, render 2 buttons for 2AFC |
| `src/lib/key-hints.svelte` | Add `modeType` prop, render 2 cards for 2AFC |
| `src/routes/[game]/+page.svelte` | Pass `modeType`, single-patch rendering, instruction text |
| `src/lib/i18n/en.ts` | Update fine mode strings |
| `src/lib/i18n/ru.ts` | Update fine mode strings |

## Verification

1. Open fine mode → see ONE patch (not two)
2. Patch is tilted left or right from vertical
3. Two answer buttons: ◀ Left / Right ▶
4. Keyboard: ArrowLeft / ArrowRight works
5. Feedback shows "✓" or "✗ → ◀ Left" / "Right ▶"
6. Instruction text visible on first trial
7. Adaptive difficulty works (smaller tilt = harder)
8. `bun run check && bun run test && bun run build` passes

## References

1. Frontiers in Aging Neuroscience (2017) — "The Effects of Aging on Orientation Discrimination"
2. AIP Advances (2015) — "Tailoring a psychophysical discrimination experiment"
3. Phelps, Ling & Carrasco (2006) — "Emotion Facilitates Perception"
