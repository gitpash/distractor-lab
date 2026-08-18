---
description: Analyze structural concerns and produce an ADR or plan. Run from architect or build agent.
agent: build
---
The user has structural concerns about the codebase. Follow these phases in order. Do not skip any phase.

## Phase 1: Collect concerns

Read the user's input from $ARGUMENTS. If empty, ask: "What feels wrong? Point me at a file, module, or area."
List each concern as a bullet point. Confirm with the user: "I see N concerns — correct?"

## Phase 2: Analyze

For each concern, determine:
- Is this a trivial cleanup (rename, move, delete dead code)?
- Is this a structural decision (which module owns what, new abstraction)?
- Is this a larger reshuffle (multiple files, unclear scope)?

Read .opencode/skills/audit-structure/references/smells-checklist.md for mechanical signals.
Examine the relevant source files. Note specific line numbers and patterns.

## Classify and produce output

Based on your analysis, produce ONE of the following:

### If all concerns are trivial cleanups
Write a concise list of instructions for the coder. No ADR or plan needed.
Example: "Rename `src/lib/game/foo.ts` → `src/lib/game/bar.ts`. Extract lines 45-80 into a shared helper."

### If any concern is a structural decision
Write an ADR to docs/adr/NNNN-<slug>.md following the format of docs/adr/001-game-state-machine.md.
Required sections: Status, Context, Decision, Consequences.
Then write a brief plan to docs/plans/NNNN-<slug>.md with implementation steps.

### If any concern is a larger reshuffle
Write a plan to docs/plans/NNNN-<slug>.md following the template in .opencode/skills/plan-feature/references/plan-template.md.
Include: Context, Options (2-3 with trade-offs), Decision, Implementation Steps, Validation, Risks.

## Phase 3: Mandatory write

You MUST write at least one file to docs/ (ADR or plan). This phase is not optional.
If you produced only verbal analysis in Phase 2, stop and write it down now.
End by stating what you wrote and where.
