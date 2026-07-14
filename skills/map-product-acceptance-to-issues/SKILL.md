---
name: map-product-acceptance-to-issues
description: Use when correlating published product acceptance-criteria issues with the implementation work that satisfies them — recording on each criterion issue a one-way reference to the epic/milestone/issue after which it's testable, and flagging any criterion no planned work covers.
---

# Map Product Acceptance to Issues

Once a feature's implementation work exists in the tracker, give each **product acceptance-criterion issue** a "test me after here" anchor: a reference to the implementation work after which the criterion's scenarios should pass — the epic, milestone, or issue whose completion makes it testable.

**The reference is one-directional and lives only on the acceptance side.** Write it **on the acceptance-criterion issue, pointing _to_ the implementation work.** Do **not** write anything onto the implementation epic/milestone/issue, and do **not** create a two-way tracker relation. The implementing agent is fenced off from acceptance tests: from an acceptance-criterion issue you must be able to reach its implementation, but from an implementation issue there must be **no trace** of the acceptance criteria. (The tracker's one-way reference mechanism is in `docs/agents/issue-tracker.md` — use it; don't reach for a symmetric "relates to"/"blocks" relation, which surfaces on both issues.)

This skill records references on existing issues; it does not create issues, author criteria, or read the tech spec. Technical acceptance criteria aren't handled here — they ride along in the slices via `/to-issues`.

## Prerequisites

Stop and say what's missing if any of these aren't true:

- The **product acceptance-criteria issues** exist with stable IDs (from `/prd-to-acceptance-issues`).
- The **implementation work** exists and is organized under epics/milestones (from `/to-issues` and planning).
- The epic/milestone structure and the tracker are configured — see `docs/agents/document-locations.md` and `docs/agents/issue-tracker.md`.

## Process

1. **Gather** the product acceptance-criteria issues and the implementation plan (the epics/milestones and the vertical slices under them).

2. **Find each criterion's anchor.** For each criterion, determine the implementation work after which it becomes testable — the latest epic/milestone/issue whose completion is needed for the criterion's scenarios to pass. A criterion satisfied by work across several slices anchors to the point by which all of that work is done.

   **What "the criterion is covered" means.** Covered means completing the anchored work makes the criterion's scenarios pass end-to-end against a running instance. Topical relatedness is not coverage; if a criterion is only partially served by the planned work, it is **not** covered — list it as a gap.

3. **Confirm, then record.** Present the proposed anchors for review. Then record each as a one-way reference **on its criterion issue** (per `docs/agents/issue-tracker.md`). Write nothing to the implementation side.

4. **Coverage check (safety net).** Report any product acceptance criterion with **no** anchor — an important behavior nothing planned makes testable. Surface these explicitly, with counts; don't imply coverage you didn't verify. (The reverse — implementation work with no criterion — is expected for internal/technical work and is not a product gap.)

## Red flags — STOP

- Writing a reference, relation, label, or comment onto an implementation epic/milestone/issue → the reference lives **only** on the acceptance-criterion issue; the implementation side stays clean
- Creating a symmetric/two-way tracker relation (it would surface on the implementation issue) → use the one-way mechanism in `docs/agents/issue-tracker.md`
- Anchoring a criterion to work whose completion wouldn't make its scenarios pass → topical relatedness isn't coverage; find the work that does, or report a gap
- Reporting "all covered" without listing the unanchored criteria, with counts → list them
- Creating issues, or authoring/editing criteria → out of scope
