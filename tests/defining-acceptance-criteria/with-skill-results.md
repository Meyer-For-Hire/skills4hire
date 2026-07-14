# With-Skill Results (GREEN) — Defining Acceptance Criteria

Run via fresh `general-purpose` subagents given the skill, instructed not to explore any repo. 2026-06-22.

## Structure scenario (mirror of baseline B2 — recurring exports)

The scenario that defaulted to `AC1.1` checklists and one-per-story. With the skill:
- **Correct structure.** `### Requirement:` with SHALL statements, each followed by `#### Scenario:` GIVEN/WHEN/THEN/AND blocks.
- **Grouped by behavior, not per story.** Split user story 1 ("create a Schedule") into a *Creating a Schedule* Requirement **and** a separate *Authorization for Schedule management* Requirement — added auth as an acceptance-worthy non-functional behavior.
- **Sign-off gate held.** "I have NOT published anything yet… The skill requires explicit approval before any Linear write… Would you like me to publish as-is, or revise anything first?"
- Glossary-locked (Schedule/Export/Destination/Run; avoided job/cron/report/dump/target/sink/attempt); product-boundary throughout; one sub-issue per Requirement; Linear ID = stable criterion ID; no automatable/manual classification.

**PASS** — all three structural/discipline failures fixed.

## Implementation-leak bait (invitations, deliberately technical conversation)

Prompt seeded the conversation with JWT/Redis/72h-TTL/Postgres `invitations` table/`POST /api/v1/invitations`. With the skill:
- **Stripped the implementation detail** and said so: JWT, Redis, the table, and the endpoint path do not appear.
- Glossary-locked; product boundary; sign-off gate held; one Requirement per behavior.
- **Borderline (known minor):** kept "72 hours" as an *observable* expiry window, decoupled from the TTL mechanism, and reasoned transparently that a black-box test can verify it. Defensible (observable thresholds can be legitimate criteria). Not worth a nuance clause — `writing-skills` warns those backfire — so left as-is and recorded here.

**PASS** (with the noted minor).

## Technical-AC guard (2026-06-26, after the product-only refocus)

Baseline used the **old** skill text (which listed "performance" as in-scope) on a technical-AC request — it **misfired**, authoring hard performance budgets ("Run starts within 60s", "1,000 Schedules within 5 min", "10M rows within 15 min") and retention windows as PRD criteria. Clean RED.

With the refocused skill:
- **Rep A** (emails within 2s; tokens encrypted at rest): **fully stopped and redirected** to `/create-tech-spec-from-convo` — authored no criteria.
- **Rep B** (don't leak customer data + fast under load): **correctly split** — kept the *observable* behaviors (cross-account data isolation, access denial) as product criteria, and pushed the *performance budget* to the tech spec.

Rep B exposed a wording contradiction (the red flag said "privacy/**security** → wrong skill" while the skill's own example is an authorization behavior). **Refactor:** the line was moved from *topic* (security/privacy) to *kind* — observable **behavior** (product) vs non-functional **target/mechanism** (tech spec: latency/throughput budgets, scale limits, encryption at rest, retention windows). Both reps' actual behavior already matched the refined wording.

## Verdict

GREEN. The positive recipe (Requirement/SHALL + Scenario), "cover behaviors not stories", the sign-off gate, and the technical-AC guard all bind. The guard took one refactor to draw its line on behavior-vs-mechanism rather than topic.
