# M4H-16: Align with Pocock Skills 1.1.0+ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring skills4hire and agents4hire's product-development skills into alignment with Pocock's skills kit 1.1.0 (currently at commit `e9fcdf9`, freshly pulled to `../pocock-skills`): rename every `/to-issues` reference to `/to-tickets`, correct a wording overclaim the rename exposed, document the `CONTEXT.md` coexistence contract between `/sharpen-domain-language` and Pocock's `/domain-modeling`, document the two new transitive Pocock dependencies (`codebase-design`, `domain-modeling`), and state the invocation-taxonomy rule explicitly in both READMEs.

**Architecture:** This is a documentation/prose-alignment change across two repos (skills4hire, agents4hire) — no runtime behavior changes, no new code. There is no unit-test framework for skill prose; this repo's existing test analog is subagent-evaluated RED→GREEN scenarios under `tests/*/baseline-scenarios.md`, which test *decision-making behavior*, not prose accuracy. None of these edits change any skill's decision logic (only the name of an external skill they reference, plus one clarifying correction), so re-running the subagent test suite would not catch anything a careful diff review wouldn't. Each task's "test" step is therefore a grep verification (no stale references remain) plus a read-through for accuracy — not a pytest run.

**Tech Stack:** Markdown skill files (Claude Code plugin `SKILL.md` format with YAML frontmatter), grep/git for verification.

## Global Constraints

- **Do not rename any of our own skills.** Skill-naming changes (including the `prd-to-acceptance-issues`/`map-product-acceptance-to-issues` collision) are deferred to M4H-6's domain-modeling pass — this milestone item is explicitly scoped to *not* relitigate that.
- **Pin, don't track main.** Pocock's kit is mid-churn past its changelog (`to-spec`, `implement`, `wayfinder` referenced but unreleased pieces exist). Every reference to "the Pocock skills kit" added or edited in this plan must say "pinned to v1.1.0 or later" — never "latest" or unqualified.
- **Do not edit archival plan documents.** `agents4hire/docs/superpowers/plans/2026-07-14-migrate-skills-to-skills4hire.md` contains historical `/to-issues` mentions — it's a point-in-time record of the MEY-10 migration and must NOT be edited to say `/to-tickets`. Leave it exactly as it is.
- **Preserve the one-way anchoring and taxonomy invariants.** Nothing in this plan changes `map-product-acceptance-to-issues`'s one-way-reference behavior or any skill's `disable-model-invocation` status — only prose.
- **CONTEXT.md format is verified already-compatible.** Pocock's `domain-modeling`'s `CONTEXT-FORMAT.md` (header / one-line description / `## Language` / `**Term**:` / definition / `_Avoid_:`) matches `sharpen-domain-language`'s `<context-format>` block verbatim in structure. Do not change the format template — only add the explicit coexistence statement.
- Both repos (`skills4hire`, `agents4hire`) currently sit on local `main`, clean working tree, ahead of `origin/main` (MEY-10 already merged locally, not pushed). Do not push or open PRs as part of this plan — hold locally, matching the established MEY-10 cadence, until explicitly asked.

---

### Task 1: Rename `/to-issues` → `/to-tickets` in skills4hire, fix the TAC-distribution overclaim

**Files:**
- Modify: `/Users/jim/work/skills4hire/README.md:28`
- Modify: `/Users/jim/work/skills4hire/skills/create-tech-spec-from-convo/SKILL.md:11,60`
- Modify: `/Users/jim/work/skills4hire/skills/map-product-acceptance-to-issues/SKILL.md:12,19`
- Modify: `/Users/jim/work/skills4hire/skills/setup-m4h-agents4hire/document-locations.md:10,16`
- Modify: `/Users/jim/work/skills4hire/skills/setup-m4h-agents4hire/issue-tracker-linear.md:19,50`
- Modify: `/Users/jim/work/skills4hire/tests/map-product-acceptance-to-issues/baseline-scenarios.md:5`

**Context:** Pocock 1.1.0 merged `/to-issues` and `/to-plan` into a single `/to-tickets` skill, which emits tracer-bullet tickets with explicit blocking edges (published as tracker sub-issues/native blocking links, or a local `tickets.md`). While doing this rename, one wording problem surfaces: several of our files assert that `/to-issues` *automatically* folds each technical acceptance criterion into the vertical slice it applies to. Verified against `to-tickets`'s actual `SKILL.md`: it has no such automatic-distribution behavior — it only carries a generic "Acceptance criteria" checklist per ticket. The folding is something the person/agent running `/to-tickets` must do explicitly while drafting tickets from the tech spec. Every renamed reference to this behavior must be reworded to say so, not just renamed.

- [ ] **Step 1: Edit `README.md:28`**

Before:
```
5. **After tech-spec review:** Pocock's `/to-issues` creates the implementation slices, folding each technical acceptance criterion into the slice it applies to. Then `/map-product-acceptance-to-issues` records a one-way reference from each product acceptance criterion to the implementation work after which it's testable (the implementation side stays clean), flagging any criterion no work covers.
```

After:
```
5. **After tech-spec review:** Run Pocock's `/to-tickets` to turn the spec into implementation tickets (tracer-bullet vertical slices with explicit blocking edges) — fold each technical acceptance criterion into the ticket(s) it applies to as you draft them; `/to-tickets` doesn't distribute them automatically, so call it out when you invoke it. Then `/map-product-acceptance-to-issues` records a one-way reference from each product acceptance criterion to the implementation work after which it's testable (the implementation side stays clean), flagging any criterion no work covers.
```

- [ ] **Step 2: Edit `skills/create-tech-spec-from-convo/SKILL.md:11`**

Before:
```
This spec carries **the engineering architectural and implementation decisions** as well as **the technical acceptance criteria** — the non-functional bar (performance, scale, privacy, security, …) the implementation must clear. Those criteria are part of the implementation: when the spec is broken into vertical slices, `/to-issues` includes issues for technical acceptance criterion with the slices they apply to.
```

After:
```
This spec carries **the engineering architectural and implementation decisions** as well as **the technical acceptance criteria** — the non-functional bar (performance, scale, privacy, security, …) the implementation must clear. Those criteria are part of the implementation: when `/to-tickets` breaks the spec into vertical-slice tickets, fold each technical acceptance criterion into the ticket(s) it applies to — `/to-tickets` won't distribute them on its own, so call this out explicitly when you invoke it.
```

- [ ] **Step 3: Edit `skills/create-tech-spec-from-convo/SKILL.md:60`**

Before:
```
The non-functional bar the implementation must clear, grouped by category. These are **part of the implementation** — `/to-issues` distributes each into the acceptance criteria of the vertical slice(s) it applies to; they do not become separate issues. Every criterion must be **verifiable**: state a measurable target or a checkable assertion, not an aspiration ("fast" → "p95 under 200 ms at 100 rps"). It's okay if there aren't criteria in one or more categories listed below, but it's unlikely that there are no acceptance criteria.
```

After:
```
The non-functional bar the implementation must clear, grouped by category. These are **part of the implementation** — fold each into the acceptance criteria of the vertical-slice ticket(s) it applies to when running `/to-tickets`; they do not become separate tickets. (`/to-tickets` doesn't distribute these automatically — say so explicitly when you invoke it.) Every criterion must be **verifiable**: state a measurable target or a checkable assertion, not an aspiration ("fast" → "p95 under 200 ms at 100 rps"). It's okay if there aren't criteria in one or more categories listed below, but it's unlikely that there are no acceptance criteria.
```

- [ ] **Step 4: Edit `skills/map-product-acceptance-to-issues/SKILL.md:12`**

Before:
```
This skill records references on existing issues; it does not create issues, author criteria, or read the tech spec. Technical acceptance criteria aren't handled here — they ride along in the slices via `/to-issues`.
```

After:
```
This skill records references on existing issues; it does not create issues, author criteria, or read the tech spec. Technical acceptance criteria aren't handled here — they ride along in the slices, folded in by whoever runs `/to-tickets`.
```

- [ ] **Step 5: Edit `skills/map-product-acceptance-to-issues/SKILL.md:19`**

Before:
```
- The **implementation work** exists and is organized under epics/milestones (from `/to-issues` and planning).
```

After:
```
- The **implementation work** exists and is organized under epics/milestones (from `/to-tickets` and planning).
```

- [ ] **Step 6: Edit `skills/setup-m4h-agents4hire/document-locations.md:10`** (table row, "Tech spec")

Before (cell fragment):
```
Technical-design output. Enters technical review; `/to-issues` mints the `ready-for-agent` implementation issues downstream. Written by `/create-tech-spec-from-convo`.
```

After:
```
Technical-design output. Enters technical review; `/to-tickets` mints the `ready-for-agent` implementation issues downstream. Written by `/create-tech-spec-from-convo`.
```

- [ ] **Step 7: Edit `skills/setup-m4h-agents4hire/document-locations.md:16`**

Before:
```
- **PRD and tech spec → Google Docs**, each linked from the product epic. Neither carries the `ready-for-agent` label; that label belongs to implementation issues minted later by `/to-issues`.
```

After:
```
- **PRD and tech spec → Google Docs**, each linked from the product epic. Neither carries the `ready-for-agent` label; that label belongs to implementation issues minted later by `/to-tickets`.
```

- [ ] **Step 8: Edit `skills/setup-m4h-agents4hire/issue-tracker-linear.md:19`** (table row)

Before:
```
| Implementation slices (vertical tracer bullets; each carries the technical acceptance criteria it covers) | `/to-issues` | **Engineering** | yes |
```

After:
```
| Implementation slices (vertical tracer bullets; each carries the technical acceptance criteria it covers) | `/to-tickets` | **Engineering** | yes |
```

- [ ] **Step 9: Edit `skills/setup-m4h-agents4hire/issue-tracker-linear.md:50`**

Before:
```
This flow does **not** apply the `ready-for-agent` label — PRDs and tech specs enter human review, and implementation issues are minted later by `/to-issues`. If this repo also runs the Pocock triage skills, their label vocabulary lives in `docs/agents/triage-labels.md`.
```

After:
```
This flow does **not** apply the `ready-for-agent` label — PRDs and tech specs enter human review, and implementation issues are minted later by `/to-tickets`. If this repo also runs the Pocock triage skills, their label vocabulary lives in `docs/agents/triage-labels.md`.
```

- [ ] **Step 10: Edit `tests/map-product-acceptance-to-issues/baseline-scenarios.md:5`**

Before:
```
(Renamed and refocused from `check-acceptance-coverage`. The skill no longer creates technical-acceptance issues — those live in the tech spec and are folded into slices by `/to-issues`. Its job is now: link each *product* criterion to the epic/milestone after which it's testable, and flag any criterion no planned work covers.)
```

After:
```
(Renamed and refocused from `check-acceptance-coverage`. The skill no longer creates technical-acceptance issues — those live in the tech spec and are folded into slices via `/to-tickets`. Its job is now: link each *product* criterion to the epic/milestone after which it's testable, and flag any criterion no planned work covers.)
```

- [ ] **Step 11: Verify no stale references remain**

Run: `grep -rn "to-issues" /Users/jim/work/skills4hire/`
Expected: zero hits, EXCEPT the substring false-positive inside the literal skill name `map-product-acceptance-to-issues` (e.g. `name: map-product-acceptance-to-issues` in that skill's frontmatter, and any prose that names the skill itself). Confirm every remaining hit is one of those, not a live `/to-issues` reference.

- [ ] **Step 12: Commit**

```bash
cd /Users/jim/work/skills4hire
git checkout -b jim/m4h-16-align-with-pocock-skills-10-to-tickets-rename-new-deps
git add README.md skills/create-tech-spec-from-convo/SKILL.md skills/map-product-acceptance-to-issues/SKILL.md skills/setup-m4h-agents4hire/document-locations.md skills/setup-m4h-agents4hire/issue-tracker-linear.md tests/map-product-acceptance-to-issues/baseline-scenarios.md
git commit -m "docs: rename /to-issues to /to-tickets, fix TAC auto-distribution overclaim"
```

---

### Task 2: Document the `CONTEXT.md` coexistence contract in `sharpen-domain-language`

**Files:**
- Modify: `/Users/jim/work/skills4hire/skills/sharpen-domain-language/SKILL.md:10` and a new section inserted after line 38

**Context:** Per Jim's M4H-17 decision: *"`/sharpen-domain-language` needs to be a fork of `/domain-modeling` and able to coexist with it. Both of them will write to the same file in the same format, and each of them will read from it in other places in the pipeline. Neither needs to exclusively own the file. The shared format that they will use is the interface."* This isn't written down anywhere yet. The format itself is already verified compatible (Task 1's Global Constraints note) and the layout-pointer convention (`docs/agents/domain.md`, written by Pocock's `/setup-matt-pocock-skills`) already matches Pocock's own `CONTEXT.md`/`CONTEXT-MAP.md` layout rule — so this task is pure documentation, no format changes.

- [ ] **Step 1: Edit line 10**

Before:
```
This is the product-definition counterpart to `/domain-modeling`, with the engineering concerns (ADRs, code cross-referencing) left out.
```

After:
```
This is the product-definition counterpart to `/domain-modeling` — a fork of its discipline for the PM track, with the engineering concerns (ADRs, code cross-referencing) left out. See [Coexisting with `/domain-modeling`](#coexisting-with-domain-modeling) below for how the two share `CONTEXT.md`.
```

- [ ] **Step 2: Insert a new section after the `</context-format>` closing line (currently line 38), before `## Out of scope for this session`**

Insert:
```markdown

## Coexisting with `/domain-modeling`

If this repo also runs Pocock's `/domain-modeling` (engineering track), both skills write `CONTEXT.md` — **neither owns the file exclusively.** The format above is the interface between them: whichever skill resolves a term next reads what's already there, matches its existing conventions (grouping, phrasing, `_Avoid_` lists), and appends or amends in place rather than restructuring around its own pass. Same layout rule as `/domain-modeling` applies — a single root `CONTEXT.md`, or a root `CONTEXT-MAP.md` for multiple contexts (see `docs/agents/domain.md`, written by `/setup-matt-pocock-skills`, if present). Don't invent a second convention for where the file lives.
```

- [ ] **Step 3: Verify**

Read the file back and confirm: (a) the new section appears between the context-format block and "Out of scope", (b) the markdown anchor `#coexisting-with-domain-modeling` matches GitHub's slug rules for the heading `Coexisting with `/domain-modeling`` (lowercase, backticks and slash stripped, spaces to hyphens → `coexisting-with-domain-modeling`).

- [ ] **Step 4: Commit**

```bash
cd /Users/jim/work/skills4hire
git add skills/sharpen-domain-language/SKILL.md
git commit -m "docs: document CONTEXT.md coexistence contract with Pocock's domain-modeling"
```

---

### Task 3: Document new Pocock dependencies, version pin, and invocation taxonomy in skills4hire README

**Files:**
- Modify: `/Users/jim/work/skills4hire/README.md:60` (Dependencies section) and insert a new paragraph before `## Installation` (currently line 38)

**Context:** M4H-16 item 3 asks that the two new required Pocock dependencies (`codebase-design`, `domain-modeling` — both now backing `/grill-with-docs`) be added to install instructions. Item 5 asks to adopt invocation-taxonomy vocabulary in READMEs; the skill list already tags each entry `(user-invoked)`/`(model-invoked)` inline, but the *rule itself* (a user-invoked skill may never invoke another user-invoked skill) is never stated outright, unlike `agents4hire/RELEASE-NOTES.md:21` which already states it. This task brings skills4hire's README to parity.

- [ ] **Step 1: Edit `README.md:60`**

Before:
```
- [Matt Pocock's skills kit](https://github.com/mattpocock/skills) — the product-development skills compose his `/grilling`, `/grill-with-docs`, `/setup-matt-pocock-skills`, and `/to-issues` skills, and `/sharpen-domain-language` is sliced from his `/domain-modeling`.
```

After:
```
- [Matt Pocock's skills kit](https://github.com/mattpocock/skills), **pinned to v1.1.0 or later** (v1.0 removed/renamed several skills referenced here) — the product-development skills compose his `/grilling`, `/grill-with-docs`, `/setup-matt-pocock-skills`, and `/to-tickets` skills. `/grill-with-docs` itself now requires his `codebase-design` and `domain-modeling` skills, so installing the kit brings those in too. `/sharpen-domain-language` coexists with — but does not invoke — his `/domain-modeling`: both write the same `CONTEXT.md` in the same format; see [`/sharpen-domain-language`](skills/sharpen-domain-language/SKILL.md#coexisting-with-domain-modeling) for the shared-file convention.
```

- [ ] **Step 2: Insert a new paragraph before `## Installation` (currently line 38)**

Insert:
```markdown
**Invocation taxonomy:** entries above marked *(user-invoked)* are reachable only by you; entries marked *(model-invoked)* may be reached by the skills above or invoked autonomously by the model — but a user-invoked skill never reaches another user-invoked skill (Matt Pocock's invocation taxonomy, adopted here and in agents4hire).

```

- [ ] **Step 3: Verify**

Run: `grep -n "to-issues\|codebase-design\|domain-modeling\|user-invoked" /Users/jim/work/skills4hire/README.md`
Expected: zero `to-issues` hits; `codebase-design` and `domain-modeling` each appear at least once; `user-invoked` appears in both the inline per-skill tags and the new taxonomy paragraph.

- [ ] **Step 4: Commit**

```bash
cd /Users/jim/work/skills4hire
git add README.md
git commit -m "docs: document codebase-design/domain-modeling deps, pin note, and invocation taxonomy rule"
```

---

### Task 4: agents4hire is out of scope — no edits

**Files:** none.

**Context:** `agents4hire/RELEASE-NOTES.md`'s only `/to-issues` hits (lines 13, 24) live in the **v0.2.0 (2026-06-26)** dated entry — a historical record of a release whose product-dev skills (`create-tech-spec-from-convo` etc.) MEY-10 has since moved **out of agents4hire entirely**, into skills4hire. Editing a past release's skill descriptions to retroactively rename an external dependency is the same revisionism Global Constraints already forbids for the archival MEY-10 migration-plan doc — a release note is a record of what was true *at that version*, not living documentation. `agents4hire/README.md` has zero `/to-issues` hits (confirmed by grep) — its current content (just `well-factored-code-auditor`) never referenced Pocock's ticket-creation skill in the first place. There is no v0.2.1 RELEASE-NOTES entry yet documenting the MEY-10 migration itself; backfilling one is out of scope here (arguably MEY-20's "ship" work, not M4H-16's).

**Conclusion: skip this repo.** The one true live home for the to-tickets rename and the new-deps/taxonomy documentation is skills4hire (Tasks 1–3) — agents4hire needs no branch, no commit, nothing.

- [ ] **Step 1: Confirm the exclusion**

Run: `grep -n "to-issues" /Users/jim/work/agents4hire/README.md`
Expected: zero hits (confirms nothing live in this repo needs the rename).

---

### Task 5: Merge skills4hire branch to local main, re-audit taxonomy, record findings in Linear

**Files:** none (verification + Linear actions only)

**Context:** Items 4, 6, 7, 8 of M4H-16 require no code changes (confirmed by research): `grill-the-pm` already composes `/grilling` correctly; Pocock's `triage` skill doesn't call `/grill-with-docs` as M4H-16 assumed (it composes `/grilling` + `/domain-modeling` directly — a drift worth flagging to M4H-13, not fixing here); the `setup-matt-pocock-skills` stale-frontmatter bug (removed `diagnose`/`zoom-out`) is no longer present at Pocock HEAD `e9fcdf9` — the upstream-PR opportunity is moot; and version pinning is M4H-18's job, not this one (record the pin target: commit `e9fcdf9` / tag `v1.1.0`). Task 4 established agents4hire needs no changes at all for this ticket.

- [ ] **Step 1: Commit the plan doc, then merge to local main in skills4hire**

```bash
cd /Users/jim/work/skills4hire
git add docs/superpowers/plans/2026-07-14-align-with-pocock-skills-1-1.md
git commit -m "docs: add M4H-16 Pocock-alignment implementation plan"
git checkout main
git merge --no-ff jim/m4h-16-align-with-pocock-skills-10-to-tickets-rename-new-deps -m "Merge branch 'jim/m4h-16-align-with-pocock-skills-10-to-tickets-rename-new-deps'"
```

Do NOT push to origin — hold locally, matching the MEY-10 cadence, until explicitly asked. agents4hire and m4h-marketplace are untouched — nothing to merge in either.

- [ ] **Step 2: Final taxonomy re-audit**

Run in skills4hire:
```bash
grep -rln "disable-model-invocation" skills/*/SKILL.md
```
For each skill NOT in that list (model-invoked), grep its body for `/` followed by a skill name and confirm every target is either model-invoked or a plain prose instruction to the human (not a programmatic invocation). Confirm the answer is unchanged from the pre-edit audit: no user-invoked skill invokes another user-invoked skill.

- [ ] **Step 3: Post the M4H-16 completion comment**

Use `mcp__claude_ai_Linear__save_comment` on M4H-16 with a body covering:
- Item 1 (to-tickets rename): done — skills4hire only (6 files), with the TAC auto-distribution overclaim corrected everywhere it appeared. agents4hire's only `/to-issues` hits are inside a dated historical RELEASE-NOTES entry for a release whose relevant skills have since moved to skills4hire — left untouched as a point-in-time record, same principle as the archival MEY-10 plan doc. No v0.2.1 RELEASE-NOTES entry exists yet for the migration itself; flagging that gap for whoever does MEY-20's ship work, not fixing it here.
- Item 2 (CONTEXT.md collision): done — coexistence contract documented in `sharpen-domain-language/SKILL.md` per Jim's M4H-17 decision; format and layout-pointer convention verified already compatible with Pocock's `domain-modeling`, no template changes needed.
- Item 3 (new deps): done — `codebase-design` + `domain-modeling` documented as transitive deps (via `/grill-with-docs`) in skills4hire's README.
- Item 4 (grilling composition): **verified, no change needed** — `grill-the-pm` already composes Pocock's now-standalone `/grilling` correctly (`Run a /grilling session, using the /sharpen-domain-language skill`); it never duplicated interview logic.
- Item 5 (invocation taxonomy): audited both repos — zero violations found before or after this change (no user-invoked skill invokes another user-invoked skill anywhere in skills4hire or agents4hire). Taxonomy rule now stated explicitly in skills4hire's README, matching the statement already in agents4hire's RELEASE-NOTES.
- Item 6 (triage): flag the drift for M4H-13 — Pocock's current `/triage` composes `/grilling` + `/domain-modeling` directly, it does not call `/grill-with-docs`.
- Item 7 (upstream bug): moot as of Pocock HEAD `e9fcdf9` — the stale `diagnose`/`zoom-out` frontmatter reference in `setup-matt-pocock-skills` is gone. Recommend a quick re-check before M4H-5 spends effort on a PR that may no longer be needed.
- Item 8 (pin): not this ticket's job (M4H-18) — record the target: commit `e9fcdf9`, `package.json` version `1.1.0`.
- Note both repos' branches are merged to local `main`, not pushed, no PR opened yet — holding per the established cadence.

- [ ] **Step 4: Update M4H-16 status to In Review** (or whatever status matches "work done, holding before push" — match the status M4H-10 was left in)
