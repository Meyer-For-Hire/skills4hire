# With-Skill Results (GREEN) — Map Product Acceptance to Issues

Run via fresh `general-purpose` subagents given the skill, instructed not to explore any repo. 2026-06-26.

## Both reps converged on the gap

| Check | Rep 1 | Rep 2 |
| --- | --- | --- |
| PATHX-15 (revoke, unplanned) | **GAP — no clean anchor**, no link applied; "topical relatedness, not coverage… recommend a new slice" | **GAP**, no link applied; "completing M2 would not make PATHX-15's scenario pass end-to-end… topical relatedness, not coverage" |
| PATHX-14 (revoked half) | **partial**, anchored to M2 conditional on the revoke gap | flagged the revoke dependency |
| PATHX-11 / PATHX-13 | anchored to M1 | anchored to M1 |
| PATHX-12 | anchored to M2 (enforcement lands in ENG-33) | anchored to M2 |
| In scope (link only; no issue creation; tech spec untouched) | yes | yes |
| Coverage report with counts | yes (5 total, 1 gap) | yes (5 total, 1 gap) |

Where baseline-1 mapped PATHX-15 onto a topically-adjacent milestone and reported "no orphans," both with-skill reps refused the false anchor, left it unlinked, and reported it as the one gap — with counts.

## Directionality (2026-06-26)

Where the baseline reached for a symmetric `relatedTo` (leaking the criterion onto the implementation issues), both reps recorded the anchor as a **one-way link attachment on the criterion issue only**:
- Rep 1 (3 criteria, all anchored): `links: [{url: <milestone URL>}]` on each PATHX issue; explicitly listed the avoided red flags — no `relatedTo`/`blocks`, no `parentId`/`milestone` reassignment, no write to ENG/M1/M2.
- Rep 2 (one anchored, one orphan): one-way attachment on ACC-1; flagged ACC-2 as a coverage gap and refused to force a link; "the implementation issues/milestone remain free of any trace of the acceptance criteria."

Both also handled the milestone-link fallback (if a milestone isn't directly linkable, point at the last implementation issue / milestone permalink).

## Verdict

GREEN on both disciplines. The coverage-definition lever (covered = scenarios pass end-to-end; topical relatedness ≠ coverage) and the one-way directionality guard (reference on the criterion side only; no symmetric relation; nothing written to the implementation side) both bind. No refactor needed.
