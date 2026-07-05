# ADR-003: Mobile Input & Haptic Feedback

## Status
Accepted

## Context
The original HTML app was keyboard-only. The SvelteKit rewrite targets mobile devices where there is no physical keyboard. Users need to tap on screen to answer.

## Decision

### Mobile Detection
Use `window.matchMedia('(max-width: 600px)')` via `$derived` to conditionally render input UI.

### Input Strategy
- **Desktop (>600px):** KeyHints bar showing arrow + letter key mappings. Keyboard input via `onKeydown`.
- **Mobile (≤600px):** 2×2 grid of tappable answer tiles showing arrow, letters, and orientation label. Same keyboard handler still works for tablets with keyboards.

### Answer Tiles (Mobile)
```
[←]      [↑]
A/D      E

[↓]      [→]
W/S      Q
```
Each tile triggers `handleAnswer(key)` on tap. Skip button has dashed border for visual distinction.

### Haptic Feedback
Library: `web-haptics` (npm, ~2KB, supports Svelte via `createWebHaptics`)

| Event | Haptic Pattern | Rationale |
|---|---|---|
| Correct answer | `success` (double tap) | Positive reinforcement |
| Wrong answer | `error` (triple sharp tap) | Error indication |
| Skip trial | `nudge` (strong + soft tap) | Gentle acknowledgment |
| Mode select (home) | `nudge` | Selection feedback |
| Start game | `success` | Launch confirmation |

### Canvas Sizing (Mobile)
```
Desktop: width: min(80vw, 80vh, 400px)
Mobile:  width: min(85vw, 50vh, 300px)
```

## Consequences
- No dependency on mobile keyboard — fully touch-operable
- Haptic feedback degrades gracefully (no-op on unsupported devices via Vibration API check)
- Desktop experience unchanged (keyboard still works)
