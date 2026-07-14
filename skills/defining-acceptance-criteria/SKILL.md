---
name: defining-acceptance-criteria
description: Use when writing the product acceptance criteria for a PRD — the externally observable behaviors that tell us a feature works, in BDD Given/When/Then form, derived from its user stories and domain glossary. NOT for non-functional targets or mechanisms (latency/throughput budgets, scale limits, encryption at rest, retention) — those belong in the tech spec.
---

# Defining Product Acceptance Criteria

Write the **Acceptance Criteria section of a PRD**: the externally observable behaviors that tell us the feature works, in BDD form, grouped by behavior. Synthesize them from the conversation, the PRD's user stories, and the domain glossary — do NOT interview; you already have what you need.

**Product acceptance criteria only** — observable behaviors a user or API caller can see at the product boundary. That *includes* permission, authorization, and privacy **behaviors** (e.g. a non-Owner is refused; one Workspace's data never appears in another's). What does **not** belong here is the non-functional **bar** — performance and scale targets, and the mechanisms behind security/privacy (encryption at rest, token strategy, retention windows, seams, integration contracts). Those go in the tech spec (`/create-tech-spec-from-convo`); if that's what you're being asked for, stop — this is the wrong skill.

The output is **PRD text**, not issues — publishing the criteria to the tracker is `/prd-to-acceptance-issues`.

## Prerequisites

- The **PRD's user stories** (or the problem/solution under discussion) are in context — the criteria are derived from them.
- The **domain glossary (`CONTEXT.md`)** is in context. If it isn't, stop and ask. Every criterion MUST use glossary vocabulary so scenario nouns and verbs stay consistent across the suite.

## Scope

Each criterion describes externally observable behavior at the product boundary (API/UI). Phrase every scenario so a black-box test could verify it against a running instance — arrange, observe, and assert all expressible from outside the system. Never reference modules, internal seams, file paths, state, or implementation.

## The criteria are written like this

Cover the acceptance-worthy *behaviors* — including the observable permission/authorization and data-integrity behaviors that are part of "done." **Cover behaviors, not one-per-story mechanically.** Include negative and edge scenarios, not just happy paths.

Each criterion is one `### Requirement:` with a SHALL statement, then an **Issue:** line (`_(unpublished)_` until it's published as a sub-issue), followed by one or more `#### Scenario:` blocks. One behavior per scenario.

```md
### Requirement: Owner can send an Invitation by email

A Workspace Owner SHALL be able to invite a person by supplying their email and a Role.

**Issue:** _(unpublished)_

#### Scenario: Owner invites a new person as a Collaborator

- GIVEN I am signed in as an Owner of a Workspace
- WHEN I create an Invitation for a person with the Role Collaborator
- THEN a pending Invitation with the Role Collaborator exists in the Workspace
- AND an invitation email with an acceptance link is sent to that address

#### Scenario: A Collaborator cannot send an Invitation

- GIVEN I am signed in as a Member with the Role Collaborator
- WHEN I attempt to create an Invitation
- THEN the Invitation is not created
- AND I am told I am not permitted to invite people
```

The `### Requirement:` / **Issue:** / `#### Scenario:` structure is a contract: one Requirement becomes exactly one publishable issue, and its scenarios are that issue's checkable behaviors. Keep it exact.

## Process

1. Derive the criteria covering the acceptance-worthy behaviors, in the form above.
2. **Review with the user.** Present the full set and revise on feedback. Surface open questions for the spec owner.

## Red flags — STOP

- You're being asked for a non-functional target or mechanism — a latency/throughput budget, a scale limit, encryption at rest, a retention window → wrong skill; that's the tech spec (an *observable* permission/privacy behavior, by contrast, does belong here)
- A scenario names a module, table, endpoint, file path, or internal state → rewrite it at the product boundary
- You grouped criteria one-per-user-story instead of one-per-behavior → regroup by behavior
- A scenario uses a noun the glossary tells you to `_Avoid_` → use the canonical term
- You're creating tracker issues → that's `/prd-to-acceptance-issues`; this skill stops at PRD text
