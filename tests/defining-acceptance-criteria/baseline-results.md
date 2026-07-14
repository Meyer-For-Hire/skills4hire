# Baseline Results (RED) — Defining Acceptance Criteria

Run via fresh `general-purpose` subagents, 2026-06-22.

## B2 — Recurring exports (clean control)

The informative clean baseline:
- **Wrong structure.** Produced "Story N" headings with `AC1.1`/`AC2.3` checklist items — **not** `### Requirement:` SHALL + `#### Scenario:` Given/When/Then.
- **Granularity drift.** Organized as "one parent epic plus four stories (one per user story)" — mapped to stories, not grouped by behavior.
- Sign-off gate not exercised (it declined to write only because the prompt said it could describe).
- Good instincts to keep: used glossary terms and policed the `_Avoid_` list; surfaced edge cases and open questions; didn't write tests or classify automatable/manual.

## B1 — Invitations (contaminated control — note)

This subagent explored the repo (7 tool calls), **found the handoff doc in `docs/tmp/`**, and adopted its invariants wholesale — Requirement/SHALL structure, one-sub-issue-per-Requirement, sign-off gate, no `ready-for-agent`, glossary-only, Linear IDs as criterion IDs. Useful as a confirmation that the spec, once written down, produces exactly the desired output — but **not a clean baseline**, since it read the spec. The clean signal is B2.

## Cross-scenario patterns

- **Steps consistently skipped without the skill (per B2):** the BDD Requirement/SHALL + Scenario structure; grouping by behavior rather than by story; an explicit pre-publish sign-off gate.
- **Lower-risk in this framing:** implementation-detail leakage and test authoring didn't appear when the prompt was purely product-level — but a technically-flavored conversation could induce them, so the skill keeps explicit guards.
- **Gaps the skill must address:** (1) state the exact output shape (positive recipe); (2) "cover behaviors, not one-per-story"; (3) an explicit sign-off gate as discipline; (4) product-boundary / no-impl and no-test-authoring red flags.

## B3 — Technical-AC misfire (2026-06-26)

Run against the **old** skill text (which listed "performance" as in-scope) with a technical-AC request. It misfired cleanly — authored hard performance budgets (60s run-start, 1,000 Schedules in 5 min, 10M rows in 15 min) and retention windows as PRD acceptance criteria. Confirms the failure the product-only refocus + guard must prevent: a non-functional ask should be redirected to the tech spec, not authored as product criteria. (GREEN evidence in with-skill-results.)
