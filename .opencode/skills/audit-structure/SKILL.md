---
name: audit-structure
description: Review current codebase structure without a reference plan, surface friction, propose restructuring options.
---
This skill is for the architect only — do not invoke from coder mode.

Use this when the user flags structural discomfort — not a new feature, not compliance
with an existing plan.

1. Ask the user what specifically feels wrong (file, module, or "just review X area").
   Don't scan the whole repo blind — you don't have their intuition for where it hurts.
2. Read references/smells-checklist.md for mechanical signals to check
   (god modules, duplicated logic, import cycles, misplaced concerns).
3. Propose 2-3 restructuring options with trade-offs — same shape as plan-feature.
4. Classify the finding and hand off:
   - Trivial cleanup (rename, move, delete dead code) → tell the coder directly, no doc needed.
   - Structural decision (which module owns what, new abstraction) → invoke write-adr.
   - Larger reshuffle (multiple files, unclear scope) → write a plan via plan-feature's template,
     then hand off to the coder.
