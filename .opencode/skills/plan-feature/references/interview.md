# Interview Checklist — Feature Planning

Before proposing options, answer these with the user:

1. **What** — What exactly are we building? One sentence, no ambiguity.
2. **Who** — Which screen/component is affected? Mobile, desktop, or both?
3. **Why** — What problem does this solve? What's the user-facing value?
4. **Constraints** — Performance budget? Accessibility requirement? Browser support?
5. **Existing patterns** — What in `src/lib/game/` or `src/lib/` already does something similar?
6. **Data** — Does this need new types, state, or persistence? What changes in `src/lib/game/types.ts`?
7. **Scope** — What's explicitly out of scope for this iteration?
8. **Success** — How do we know it works? Concrete observable behavior.
9. **Visual reference** — Any existing app, design, or sketch that shows the target?
10. **Priority** — Is this blocking something else, or can it wait?
