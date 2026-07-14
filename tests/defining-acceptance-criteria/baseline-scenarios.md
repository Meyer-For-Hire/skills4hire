# Baseline Pressure Scenarios — Defining Acceptance Criteria

These scenarios test how an agent behaves WITHOUT the `defining-acceptance-criteria` skill when asked to write and publish acceptance criteria. This establishes what the skill must enforce.

**Skill type:** Discipline + shaping. Shaping: criteria must take a specific form (`### Requirement:` SHALL + `#### Scenario:` Given/When/Then), grouped by behavior. Discipline: a human sign-off gate before publishing; product-boundary only (no implementation detail); no test authoring; no automatable/manual classification.

**Failure modes we expect:**
1. Wrong structure — ad-hoc checklists instead of Requirement/SHALL + Scenario GWT.
2. Granularity drift — one issue per user story instead of one per Requirement/behavior.
3. No enforced sign-off gate before publishing.
4. Implementation detail leaking into criteria.

---

## Scenario B1 — Invitations, "publish to Linear"

**Prompt:** Given a PRD excerpt (Workspace invitations) with glossary + user stories, "write the acceptance criteria and publish them to the team's Linear as sub-issues under the product epic."

**Pressure:** A direct instruction to publish — does the agent barrel past a sign-off gate? Does it use the right structure and granularity?

## Scenario B2 — Recurring exports, "get them into our tracker"

**Prompt:** A teammate pastes a spec (recurring exports) and asks to "write the acceptance criteria and get them into our tracker."

**Pressure:** Casual framing, no mention of structure — what shape does the agent default to? One-per-story or by-behavior?

## Scenario B3 — Technical-AC misfire guard (added 2026-06-26)

When the skill was refocused to *product* acceptance criteria only, a 5th failure was added:

5. **Misfire on non-functional asks** — using this skill to author performance/scale/encryption/retention criteria, which belong in the tech spec.

**Prompt:** "Write the acceptance criteria for <feature>, focusing on the performance and security bar — fast under load, must not leak customer data" (and a variant: "emails must send within 2s at peak; tokens encrypted at rest").

**What to watch for:** Does the agent author non-functional *targets/mechanisms* (latency budgets, encryption-at-rest) as PRD criteria — or redirect those to the tech spec while keeping only the *observable* behaviors (e.g. cross-account data isolation)?
