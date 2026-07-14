---
name: sharpen-domain-language
description: Use when sharpening a product's ubiquitous language or domain terminology with a product owner during product definition, when another skill needs precise glossary vocabulary before a PRD or acceptance criteria, or when pinning down fuzzy or overloaded domain terms. The product owner is not the technical architect — this is language work, not architecture.
---

# Sharpen Domain Language

Actively build and sharpen the project's **ubiquitous language** with a product owner. Challenge terms, invent edge-case scenarios, and write the glossary down the moment terms crystallise. The point is precise, shared vocabulary that the PRD and the BDD acceptance criteria will reuse word-for-word — consistent nouns and verbs are what make downstream criteria (and later their tests) coherent.

This is the product-definition counterpart to `/domain-modeling` — a fork of its discipline for the PM track, with the engineering concerns (ADRs, code cross-referencing) left out. See [Coexisting with `/domain-modeling`](#coexisting-with-domain-modeling) below for how the two share `CONTEXT.md`.

## What this session does

- **Challenge against the glossary.** When a term conflicts with `CONTEXT.md`, call it out: "Your glossary defines 'cancellation' as X, but you mean Y — which is it?"
- **Sharpen fuzzy language.** When a term is vague or overloaded, propose a precise canonical term and the synonyms to avoid: "You're saying 'account' — is that the shared Workspace or a person's login? Those are different things."
- **Stress-test with concrete scenarios.** Invent specific edge-case scenarios that force precision about the boundaries between concepts.
- **Capture resolved terms inline.** The moment a term is pinned down, write it to `CONTEXT.md` using the format below. Don't batch. (Layout — single vs. multi-context — follows `docs/agents/domain.md` if present.)

`CONTEXT.md` is a glossary and nothing else — totally devoid of implementation detail. Not a spec, not a scratchpad.

<context-format>
```md
# {Context Name}

{One or two sentences: what this context is and why it exists.}

## Language

**Workspace**:
The shared container an organization works in.
_Avoid_: account, org

**Member**:
A person who has joined a Workspace.
_Avoid_: user
```
Be opinionated — when several words mean one concept, pick one and list the rest under `_Avoid_`. Keep definitions to a sentence or two: what it IS, not what it does. Only terms specific to this product's domain — general programming concepts don't belong.
</context-format>

## Coexisting with `/domain-modeling`

If this repo also runs Pocock's `/domain-modeling` (engineering track), both skills write `CONTEXT.md` — **neither owns the file exclusively.** The format above is the interface between them: whichever skill resolves a term next reads what's already there, matches its existing conventions (grouping, phrasing, `_Avoid_` lists), and appends or amends in place rather than restructuring around its own pass. Same layout rule as `/domain-modeling` applies — a single root `CONTEXT.md`, or a root `CONTEXT-MAP.md` for multiple contexts (see `docs/agents/domain.md`, written by `/setup-matt-pocock-skills`, if present). Don't invent a second convention for where the file lives.

## Out of scope for this session

You are interviewing a **product owner, not the technical architect.** Stay in language and observable behavior. If a question would decide *how the system is built*, it is out of scope here — name it in one line, note it's for technical design, and move on.

- **Do not ask the product owner to make decisions that would result in an ADR** — architectural shape, technology or vendor choices, integration patterns, storage/schema, data-retention mechanisms, token strategies. These are real trade-offs, but the architect owns them. Defer them to `/grill-with-docs` and `/create-tech-spec-from-convo`.
- **Do not go to the codebase to cross-reference.** This is pre-implementation product definition; the language derives from the conversation and the glossary, not from source. There may be no code yet.
- **Keep it a glossary, not a design.** Capture what concepts *are* and how they relate — never how they'd be implemented.

## Red flags — you've drifted out of language work

- You're asking the product owner to choose between two technologies, storage models, or integration patterns
- You're weighing a trade-off whose answer would be recorded as an ADR
- You're reading or grepping source code to "check how it works"
- A `CONTEXT.md` entry you just wrote names a table, endpoint, library, or file

**All of these mean: stop, hand that decision to technical design, and return to sharpening the language.**
