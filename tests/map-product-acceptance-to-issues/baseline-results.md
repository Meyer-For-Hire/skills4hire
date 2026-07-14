# Baseline Results (RED) — Map Product Acceptance to Issues

Run via fresh `general-purpose` subagents, 2026-06-26. Two baselines + two with-skill reps.

## The topical-mapping trap appears in the baseline

| Run | PATHX-15 (revoke — no slice implements it) |
| --- | --- |
| Baseline 1 | Anchored to **M2 / ENG-33** ("revoke is an invitation action gated by permission checks") and declared **"All 5 mapped. No orphans."** — fell into the trap. |
| Baseline 2 | Anchored to M2, but flagged in "things that look off": "the revoke action itself isn't named anywhere… recommend adding an explicit task." — partial catch. |

So without the skill, the dangerous outcome occurs at least some of the time: a criterion whose action **nothing in the plan implements** gets anchored to a topically-adjacent milestone and the coverage report says everything's fine. Baseline 2 shows agents *can* catch it, but inconsistently — exactly the variance the skill must remove.

Both baselines did stay in scope (mapped only; no issue creation) and both surfaced the PATHX-14 "revoked half depends on revoke" nuance to some degree.

## Gap the skill must address

Bind the anchor predicate: a criterion may be linked to a milestone only if completing that milestone makes its scenarios pass **end-to-end**; topical relatedness is not coverage; a criterion no planned work satisfies is a **gap**, reported explicitly. (Same lever validated in the predecessor `check-acceptance-coverage` cycle, now at milestone granularity.)

## Directionality baseline (2026-06-26)

Without the one-way guard, the agent reached for a symmetric **`relatedTo`** relation between each criterion and the implementation issues — and *explicitly defended the leak*: "relatedTo is symmetric, so the link also surfaces on each ENG issue… which is exactly the bidirectional visibility the team wants." That is precisely the fence break: the acceptance criterion becomes visible from the implementation issue. (It did avoid `parentId`/`milestone` reassignment and used a one-way attachment for the milestone — but the `relatedTo` to the ENG issues is the leak.)

**Gap the skill must address:** make the reference one-directional — a link attachment on the criterion side only — and forbid symmetric relations and any write to the implementation side.
