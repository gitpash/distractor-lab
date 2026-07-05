# ADR-001: Game State Machine Architecture

## Status
Accepted

## Context
The original `gabor-trainer/index.html` used a plain mutable `state` object with direct DOM manipulation. The SvelteKit rewrite needed a reactive game state that drives UI updates without manual DOM queries.

## Decision
Use a plain TypeScript object for game state (not Svelte `$state` rune) due to naming conflict issues with Svelte 5's `$state` when the variable is named `state`. The game state object is created via `createGameState()` and reassigned on mode changes via `$effect`.

### State Shape
```ts
interface GameState {
  running: boolean;
  phase: GamePhase;  // idle | fixation | stimulus | blank | waiting | feedback | done
  trial: number;
  correct: number;
  total: number;
  difficulty: number;
  currentMode: string;
  currentTrial: Trial | null;
  waitingForResponse: boolean;
  hitWindow: boolean[];
  hitWindowSize: number;
  numTrials: number;
  startTime: number;
  lastAnswerCorrect: boolean | null;
  lastAnswerKey: string | null;
}
```

### State Functions
- `createGameState(mode, numTrials)` — initialize
- `nextTrial(state)` — advance to next trial
- `processAnswer(state, key)` — handle response + staircase
- `skipTrial(state)` — skip current trial

### Adaptive Difficulty (Staircase)
- Hit window of 8 recent responses
- ≥75% correct → make harder (decrease difficulty for lower=better modes)
- ≤40% correct → make easier

## Consequences
- State is not deeply reactive (no `$state` on the object) — UI reads state via derived values and function calls
- Game loop uses `setTimeout` chains (matching original), not `requestAnimationFrame`
- State resets on component unmount via `$effect` cleanup
