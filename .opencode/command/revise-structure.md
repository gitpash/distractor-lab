---
description: Analyze structural concerns and produce an ADR or plan.
agent: build
---
The user has structural concerns about gabor-svelte. Follow these phases in order.

## Phase 1: Collect concerns

Read $ARGUMENTS. If empty, ask: "What feels wrong? Point me at a file or area."
List concerns, confirm count with the user.

## Phase 2: Delegate to architect

Invoke the architect subagent via Task with the collected concerns. The architect
will classify each (trivial cleanup / structural decision / larger reshuffle) and
write the appropriate artifact (instructions / ADR+plan / plan) to docs/.
Do not write files yourself — this is the architect's job, under its own
docs/-scoped permissions.

## Phase 3: Confirm

Report what the architect wrote and where. If it wrote nothing, treat that as
a failure and re-invoke it with an explicit instruction to produce a file.
