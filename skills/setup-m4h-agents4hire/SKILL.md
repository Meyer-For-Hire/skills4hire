---
name: setup-m4h-agents4hire
description: Configure a repo for the M4H product-definition skills — set up the Linear issue tracker and the document locations for PRDs, tech specs, and acceptance criteria. Run once before first use of the product-definition skills.
disable-model-invocation: true
---

# Setup M4H agents4hire skills

Scaffold the per-repo configuration the M4H product-definition skills assume:

- **Document locations** — where the PRD, tech spec, and acceptance criteria are created and found
- **Issue tracker** — Linear coordinates (team + project) for epics and acceptance-criteria sub-issues

These skills depend on Matt Pocock's engineering skills too. The **domain docs** config (`docs/agents/domain.md`, read by `/sharpen-domain-language`) is written by Pocock's `/setup-matt-pocock-skills` — run that first if it hasn't been. This skill does not duplicate it.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Read what already exists; don't assume:

- `git remote -v` — what repo is this?
- `CLAUDE.md` / `AGENTS.md` at the root — does either exist? Is there already an `## Agent skills` section?
- `docs/agents/` — does `issue-tracker.md`, `domain.md`, or `document-locations.md` already exist (from this skill or Pocock's)?

### 2. Present findings and ask

Summarise what's present and missing. Then walk the user through the decisions **one at a time** — present a section, get the answer, move on. Assume the user may not know these terms; each section starts with a short explainer.

**Section A — Issue tracker (Linear).**

> Explainer: This workflow uses two trackers — a **product** one (acceptance-criteria sub-issues under the product epic) and an **engineering** one (implementation slices + technical-acceptance issues). They may be the same Linear team for small setups. The Linear issue ID of each acceptance-criteria sub-issue becomes the stable criterion ID.

Ask for the **product** team/project (and optional milestone) and the **engineering** team/project (and optional milestone). Default the product team to the user's M4H team if one is obvious from context, and offer to reuse it for engineering. Seed from [issue-tracker-linear.md](./issue-tracker-linear.md).

**Section B — Document locations.**

> Explainer: The PRD and tech spec are documents; the skills need to know where to create them and where to find them later. The M4H default is Google Docs for both (each linked from the product epic), with acceptance criteria in Linear.

Confirm, per document type, where it lives:

- **PRD** → Google Docs folder (default). Used by `/create-prd-from-convo`.
- **Tech spec** → Google Docs folder (default; some teams publish straight to Linear instead). Used by `/create-tech-spec-from-convo`.
- **Acceptance criteria** → authored in the PRD by `/defining-acceptance-criteria`, then published as Linear sub-issues under the product epic by `/prd-to-acceptance-issues`.
- **Product epic** → the Linear team/project from Section A.

Seed from [document-locations.md](./document-locations.md).

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to `CLAUDE.md` / `AGENTS.md`
- The contents of `docs/agents/issue-tracker.md` and `docs/agents/document-locations.md`

Let them edit before writing.

### 4. Write

**Pick the file to edit:** if `CLAUDE.md` exists, edit it; else `AGENTS.md`; if neither, ask which to create. Never create one when the other already exists. If an `## Agent skills` block exists, update it in place rather than appending a duplicate.

The block:

```markdown
## Agent skills

### Issue tracker

Linear — team `<team>`, project `<project>`. See `docs/agents/issue-tracker.md`.

### Document locations

PRD and tech spec in Google Docs; acceptance criteria as Linear sub-issues. See `docs/agents/document-locations.md`.

### Domain docs

[written by `/setup-matt-pocock-skills`] See `docs/agents/domain.md`.
```

Then write `docs/agents/issue-tracker.md` and `docs/agents/document-locations.md` from the seed templates in this skill folder, filled in with the user's answers.

### 5. Done

Tell the user setup is complete and which skills now read from these files: `/create-prd-from-convo`, `/create-tech-spec-from-convo`, `/defining-acceptance-criteria`, `/sharpen-domain-language`, `/prd-to-acceptance-issues`, and `/map-product-acceptance-to-issues`. Mention they can edit `docs/agents/*.md` directly later.
