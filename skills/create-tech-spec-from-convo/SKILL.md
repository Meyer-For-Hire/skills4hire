---
name: create-tech-spec-from-convo
description: Turn the current technical-design conversation into a tech spec (seam analysis, implementation decisions, testing decisions, and technical acceptance criteria) and publish it to the configured tech-spec location — no interview, just synthesis of what you've already discussed.
disable-model-invocation: true
---

# Create Tech Spec from conversation

Take the current conversation and codebase understanding and produce a **technical design specification, aka tech spec** as the technical companion to the product requirements document (PRD). Do NOT interview the user; synthesize what you already know.

This spec carries **the engineering architectural and implementation decisions** as well as **the technical acceptance criteria** — the non-functional bar (performance, scale, privacy, security, …) the implementation must clear. Those criteria are part of the implementation: when `/to-tickets` breaks the spec into vertical-slice tickets, fold each technical acceptance criterion into the ticket(s) it applies to — `/to-tickets` won't distribute them on its own, so call this out explicitly when you invoke it.

The tech spec's destination is configured per repo. Read `docs/agents/document-locations.md` for where to create the tech spec; run `/setup-m4h-agents4hire` if that file doesn't exist.

## Prerequisites

- The PRD (and its acceptance criteria) should exist; the tech spec is the design that satisfies them.
- Use the project's domain glossary vocabulary throughout, and respect any ADRs in the area you're touching. Surface conflicts with existing ADRs rather than silently overriding them.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already.

2. **Sketch the seams** at which you'll test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better — the ideal number is one. **Check with the user that these seams match their expectations** before writing the spec.

3. Write the tech spec using the template below, then publish it to the **tech spec location** named in `docs/agents/document-locations.md`. This spec enters technical review.

<tech-spec-template>
## Feature Overview

A short overview of the feature as summarized from the PRD. This section includes a link to the PRD as well as a link to the epic's issue in the tracker.

## Implementation Decisions

The implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

The testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- The seams identified in step 2, and why they were chosen
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Technical Acceptance Criteria

The non-functional bar the implementation must clear, grouped by category. These are **part of the implementation** — fold each into the acceptance criteria of the vertical-slice ticket(s) it applies to when running `/to-tickets`; they do not become separate tickets. (`/to-tickets` doesn't distribute these automatically — say so explicitly when you invoke it.) Every criterion must be **verifiable**: state a measurable target or a checkable assertion, not an aspiration ("fast" → "p95 under 200 ms at 100 rps"). It's okay if there aren't criteria in one or more categories listed below, but it's unlikely that there are no acceptance criteria.

### Performance

- The system SHALL … (e.g. p95 response time under N ms at the stated load).

### Scale

- The system SHALL … (e.g. sustain N concurrent <X>; remain within budget as data grows to N).

### Privacy

- The system SHALL … (e.g. <PII> is never written to logs; data is retained no longer than N).

### Security

- The system SHALL … (e.g. every endpoint enforces the stated authorization; secrets are not stored in <X>).

### Other

Any further categories that are part of "done" — reliability, availability, accessibility, observability, compliance — each with explicit, verifiable criteria. Omit categories that don't apply rather than inventing criteria.

## Further Notes

Any further technical notes about the feature.

</tech-spec-template>
