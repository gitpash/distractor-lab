# ADR-004: Mobile Input & Haptic Feedback

## Status
Accepted

## Context
The original HTML app was keyboard-only. The SvelteKit rewrite targets mobile devices where there is no physical keyboard. Users need to tap on screen to answer. Haptic feedback should work on iOS and Android.

## Decision

### Mobile Detection
Use `window.matchMedia('(max-width: 600px)')` via `$derived` to conditionally render input UI.

### Input Strategy
- **Desktop (>600px):** KeyHints bar showing arrow + letter key mappings. Keyboard input via `onKeydown`.
- **Mobile (≤600px):** Joystick-style D-pad with circular buttons arranged in a cross pattern. Same keyboard handler still works for tablets with keyboards.

### Answer Tiles (Mobile)
D-pad layout:
```
       [ — ]     ← horizontal (top)
[ ╱ ]    ●    [ ╲ ]  ← left=╱, right=╲
       [ | ]     ← vertical (bottom)
```
Plus Skip (⏭) and Repeat (↺) buttons on the left side.

### Repeat Feature
- Shows the stimulus again once per trial
- Disabled after use, re-enabled when new trial starts

### Haptic Feedback
Two libraries for platform-specific support:

**iOS Safari:** `ios-haptics` library via `{@attach hapticTrigger}` on interactive elements. Uses `<input type="checkbox" switch>` hack to trigger native haptic feedback.

**Android:** `web-haptics` library via `triggerHaptic()` function. Calls `navigator.vibrate()` internally.

**Desktop:** No haptics (no vibration hardware).

Platform detection via `navigator.userAgent`.

### Canvas Sizing (Mobile)
```
Desktop: width: min(80vw, 80vh, 400px)
Mobile:  width: min(85vw, 50vh, 300px)
```

## Consequences
- No dependency on mobile keyboard — fully touch-operable
- Haptic feedback degrades gracefully (no-op on unsupported devices)
- Desktop experience unchanged (keyboard still works)
- D-pad layout more intuitive than 2-column grid

## Test Coverage
- OrientationIcon: 6 tests verifying angle→endpoint math for 0°/45°/90°/135°
- AnswerTiles: 6 tests verifying button→key mapping and uniqueness
- Animation state machine: 14 tests
- Total: 27 tests
