---
name: create-prd-from-convo
description: Turn the current product-definition conversation into a product/UX PRD — problem, solution, user stories, UX, and BDD acceptance criteria — and publish it to the configured PRD location. No interview, just synthesis of what you've already discussed.
disable-model-invocation: true
---

# Create PRD from conversation

Take the current conversation and produce a **product/UX PRD**, including its **acceptance criteria**. Do NOT interview the user; synthesize what you already know.

This PRD is **product-facing**. It carries no implementation or testing decisions — those belong in the tech spec (`/create-tech-spec-from-convo`).

This skill **writes a document; it does not create issues.** The PRD (acceptance criteria included) goes to the configured PRD location. Turning the acceptance criteria into tracker issues is a separate, deliberate step — see "After the PRD" below.

The PRD's destination is configured per repo. Read `docs/agents/document-locations.md` for where to create it; run `/setup-m4h-agents4hire` if that file doesn't exist.

## Prerequisites

- The domain glossary (`CONTEXT.md`) should be in context. Use its vocabulary throughout so the language stays consistent across the PRD, the criteria, and downstream work.
- A **product epic** should exist (or be created) — the PRD is linked from it.

## Process

1. Use the project's domain glossary vocabulary throughout. Respect any ADRs in the area. At product-definition time, derive the PRD from the conversation, user stories, and glossary — not from a codebase survey.

2. Author the **Acceptance Criteria** section using the `/defining-acceptance-criteria` skill. Review the full set with the user before finalizing the PRD.

3. Write the PRD using the template below.

4. Publish it to the **PRD location** named in `docs/agents/document-locations.md` and **link it from the product epic**. Do **not** apply the `ready-for-agent` label, and do **not** create any issues — this PRD enters product review.

## After the PRD

The acceptance criteria live in the PRD as the source draft. Once the PRD passes review, publish them with `/prd-to-acceptance-issues`. Don't create any acceptance-criteria issues now.

<prd-template>

## Problem Statement

The problem the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories, each in the format:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see the balance on my accounts, so that I can make better-informed decisions about my spending
</user-story-example>

This list should be extremely extensive and cover all aspects of the feature.

## UX / Interaction Design

The user experience of the feature, from the user's perspective — not the implementation. Cover:

- **Key user flows** — the step-by-step paths a user takes, including the main success path and the important alternate/error paths.
- **Primary screens & states** — the main views or surfaces involved, and their meaningful states (empty, loading, populated, error, success, permission-denied).
- **Interaction & content notes** — what the user sees and does at each decision point; key copy, affordances, and feedback. Note accessibility and responsive considerations where they shape the experience.

Describe behavior the user can observe. Do not specify components, routes, data shapes, or any implementation — that is the tech spec's job.

## Out of Scope

The things that are explicitly out of scope for this PRD.

## Further Notes

Any further notes about the feature.

## Acceptance Criteria

This is a relatively exhaustive list of the individual acceptance criteria by which we will know that the feature is working as intended, authored using `/defining-acceptance-criteria`. They must be well-specified and easily able to be individually tested so that we can clearly and easily know which portions of the implementation have been completed acceptably and which have not.

</prd-template>
