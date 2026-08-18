# Review Checklist — 5 Lenses

## 1. Plan Conformity

- Everything in the plan is implemented.
- Nothing outside the plan scope was added.
- File paths match the plan.

## 2. Best Practices

- Svelte 5 runes used correctly ($state, $effect, not legacy $: syntax).
- TypeScript strict — no `any`, no `@ts-ignore`.
- Existing project patterns reused (see `src/lib/game/` for conventions).

## 3. Doc Freshness

- If public behavior changed → ADR updated or created.
- If new types added → `src/lib/game/types.ts` is the source of truth.
- README updated if setup/usage changed.

## 4. Correctness

- `bun run check` passes (no type errors).
- `bun run test` passes (no regressions).
- `bun run build` succeeds (production build OK).

## 5. Design Principles

- Single responsibility — each function/component does one thing.
- No duplication with existing code.
- No premature optimization.
- Canvas logic stays in `src/lib/game/renderer.ts`, not leaked into components.
