---
name: prd-to-acceptance-issues
description: Publish an approved PRD's acceptance criteria to the product issue tracker as one sub-issue per Requirement, and write the resulting criterion IDs back into the PRD. Run after the PRD has passed review.
disable-model-invocation: true
---

# PRD to Acceptance Issues

Turn an **approved** PRD's Acceptance Criteria section into trackable sub-issues in the product issue tracker — one per Requirement — under the product epic.

**Run this only after the PRD has passed product review.** Creating criterion issues is how the criteria become stable, testable units; the issue ID of each becomes the **stable criterion ID** that acceptance tests reference.

This skill only publishes existing criteria — it doesn't author or edit them, and it doesn't create implementation issues.

## Prerequisites

- The **approved PRD** is in context or passed as a reference. Read its Acceptance Criteria section.
- The **product epic** and the product issue tracker are configured — see `docs/agents/document-locations.md` and `docs/agents/issue-tracker.md`. Run `/setup-m4h-agents4hire` if missing.

## Process

1. **Gather** the PRD's Acceptance Criteria. Each `### Requirement:` is one criterion; its `#### Scenario:` blocks are its checkable behaviors. (The form is owned by `/defining-acceptance-criteria`.)
2. **Resolve** the product team, project, and epic from config.
3. **Sign-off gate.** Show the user the exact set of issues you're about to create (titles + parent epic). Get explicit approval before any write. This is a side effect — do not create issues without it.
4. **Create** one sub-issue per Requirement under the product epic (create it as a sub-issue per `docs/agents/issue-tracker.md`):
   - Title = the Requirement statement.
   - Body = the Requirement's SHALL statement and its `#### Scenario:` blocks, as literal Markdown.
   - **No `ready-for-agent` label.** **No** automatable/manual classification — that happens later, in the acceptance phase.
   - Skip any Requirement that already carries an issue ID (idempotent re-runs).
5. **Write back** each returned issue ID into its Requirement's **Issue:** line in the PRD, replacing `_(unpublished)_`. The tracker is now the source of truth for tracking; the PRD references by ID.

## Red flags — STOP

- About to create issues without showing the user the set and getting approval → stop; sign-off first
- Applying `ready-for-agent`, or tagging criteria automatable/manual → out of scope here
- Creating one issue for several Requirements, or splitting one Requirement across issues → it is exactly one issue per Requirement
- Editing the wording of a criterion → out of scope; criteria are authored upstream, this skill only publishes
