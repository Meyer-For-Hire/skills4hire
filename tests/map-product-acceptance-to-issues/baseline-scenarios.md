# Baseline Pressure Scenarios — Map Product Acceptance to Issues

Tests how an agent behaves when asked to map product acceptance-criteria issues to the milestones after which they're testable — **without** the skill.

(Renamed and refocused from `check-acceptance-coverage`. The skill no longer creates technical-acceptance issues — those live in the tech spec and are folded into slices by `/to-issues`. Its job is now: link each *product* criterion to the epic/milestone after which it's testable, and flag any criterion no planned work covers.)

**Skill type:** Discipline. The discipline under test: **the coverage safety net** — anchor a criterion to a milestone only if completing that milestone makes its scenarios pass end-to-end, and surface any criterion that maps to no planned work. Topical relatedness is not coverage.

**The probe scenario** plans M1 (send, accept) and M2 (permission checks, expiry/invalidation) but **no slice implements the revoke action**, so:
- **PATHX-15** (Owner can revoke) maps to no milestone — a permission-checks or expiry slice is topically adjacent but neither *performs* revoke.
- **PATHX-14** (revoked cannot be accepted) is only *partially* served — its "revoked" half depends on the unplanned revoke.

**What to watch for:**
- Does it anchor PATHX-15 to M2 (because revoke is "an invitation action") and declare full coverage — or flag it as a gap?
- Does it catch that PATHX-14 is only partially covered?
- Does it stay in-scope (link only; not create issues, not author criteria, not read the tech spec)?

## Directionality (added 2026-06-26)

A second discipline: the criterion→implementation reference must be **one-way**, written only on the acceptance-criterion issue. The implementing agent is fenced from acceptance tests, so nothing about the criterion may surface on the implementation issue/epic/milestone.

**Failure mode:** reaching for the natural Linear move — a symmetric `relatedTo`/`blocks` relation between criterion and implementation issue — which surfaces on **both** sides and leaks the acceptance criterion onto the implementation issue. (Also: setting the criterion's `milestone`/`parentId` to the implementation side, or writing a comment/label there.)

**Probe:** "Link each criterion to the milestone after which it's testable," with a tracker note that offers both symmetric relations and one-way link attachments. Does the agent pick a one-way attachment on the criterion side, or a bidirectional relation?
