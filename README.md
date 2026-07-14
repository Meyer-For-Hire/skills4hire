# skills4hire

A collection of useful skills for many purposes, brought to you by [Meyer For Hire](https://meyer4hire.com/).

## Skills

### pqa-mode

Enter **PQA** — Precision Question and Answer. Every reply is the tightest thing
that carries the meaning: one of five forms (yes/no, a number, a date, a bulleted
list, or "I don't know, but I think …" + one of those), or a single concise
question. No preamble, no offers, no decoration. Stays active until you leave it.

**Invoke:** `/skills4hire:pqa-mode` or `/pqa-mode`

### Product-development workflow

A set of skills for the M4H/PathX **product-development** workflow, built on top of [Matt Pocock's skills kit](https://github.com/mattpocock/skills). They split product definition from technical design, drive precise domain language, and turn a working conversation into a PRD, a tech spec, and BDD acceptance criteria — keeping **authoring** (writing documents) separate from the **side-effecting** issue creation, which happens only after each document passes review.

Run [`/setup-m4h-agents4hire`](skills/setup-m4h-agents4hire/SKILL.md) once per repo first — it records where documents go (`docs/agents/document-locations.md`) and the issue-tracker coordinates (`docs/agents/issue-tracker.md`) the other skills read.

The flow, roughly in order:

1. [`/grill-the-pm`](skills/grill-the-pm/SKILL.md) — relentless interview to sharpen a product owner's feature definition and build the glossary, without dragging them into architecture. The PM counterpart to Pocock's `/grill-with-docs` (which stays the architect's tool). *(user-invoked)*
2. [`/create-prd-from-convo`](skills/create-prd-from-convo/SKILL.md) — synthesize a product/UX PRD (with a BDD acceptance-criteria section) and publish it to the configured PRD location. Writes a document; creates no issues. *(user-invoked)*
3. **After PRD review:** [`/prd-to-acceptance-issues`](skills/prd-to-acceptance-issues/SKILL.md) — publish the PRD's criteria as one sub-issue per Requirement (stable criterion IDs) in the product tracker. *(user-invoked)*
4. [`/create-tech-spec-from-convo`](skills/create-tech-spec-from-convo/SKILL.md) — synthesize the technical half (seam analysis, implementation + testing decisions, and **technical acceptance criteria** by category: performance, scale, privacy, security) into a tech spec. *(user-invoked)*
5. **After tech-spec review:** Run Pocock's `/to-tickets` to turn the spec into implementation tickets (tracer-bullet vertical slices with explicit blocking edges) — fold each technical acceptance criterion into the ticket(s) it applies to as you draft them; `/to-tickets` doesn't distribute them automatically, so call it out when you invoke it. Then `/map-product-acceptance-to-issues` records a one-way reference from each product acceptance criterion to the implementation work after which it's testable (the implementation side stays clean), flagging any criterion no work covers.

Composed disciplines *(model-invoked — reached by the above or autonomously)*:

- [`/defining-acceptance-criteria`](skills/defining-acceptance-criteria/SKILL.md) — derive BDD Given/When/Then criteria as PRD text (one Requirement per behavior). Authors criteria only; does not create issues.
- [`/sharpen-domain-language`](skills/sharpen-domain-language/SKILL.md) — build and sharpen the ubiquitous language with a product owner; sliced from Pocock's `/domain-modeling` with ADRs and code cross-referencing removed.
- [`/map-product-acceptance-to-issues`](skills/map-product-acceptance-to-issues/SKILL.md) — record a one-way reference from each product acceptance-criterion issue to the implementation work after which it's testable (nothing written to the implementation side); flag criteria no planned work covers.

And: [`/setup-m4h-agents4hire`](skills/setup-m4h-agents4hire/SKILL.md) configures a repo for all of the above. *(user-invoked)*

**Invocation taxonomy:** entries above marked *(user-invoked)* are reachable only by you; entries marked *(model-invoked)* may be reached by the skills above or invoked autonomously by the model — but a user-invoked skill never reaches another user-invoked skill (Matt Pocock's invocation taxonomy, adopted here and in agents4hire).

## Installation

Add the Meyer For Hire marketplace, then install the plugin.

In Claude Code:

```
/plugin marketplace add Meyer-For-Hire/m4h-marketplace
/plugin install skills4hire@m4h-marketplace
```

Or from the command line:

```bash
claude plugin marketplace add Meyer-For-Hire/m4h-marketplace
claude plugin install skills4hire@m4h-marketplace
```

## Dependencies

**Required for the product-development workflow:**

- [Matt Pocock's skills kit](https://github.com/mattpocock/skills), **pinned to v1.1.0 or later** (v1.0 removed/renamed several skills referenced here — see [M4H-18](https://linear.app/meyer-for-hire/issue/M4H-18) for the actual pin) — the product-development skills compose his `/grilling`, `/grill-with-docs`, `/setup-matt-pocock-skills`, and `/to-tickets` skills. `/grill-with-docs` itself now requires his `codebase-design` and `domain-modeling` skills, so installing the kit brings those in too. `/sharpen-domain-language` coexists with — but does not invoke — his `/domain-modeling`: both write the same `CONTEXT.md` in the same format; see [`/sharpen-domain-language`](skills/sharpen-domain-language/SKILL.md#coexisting-with-domain-modeling) for the shared-file convention.
- **MCP connectors for your configured issue tracker and document store.** The skills are system-agnostic and read their destinations from `docs/agents/`; M4H's default configuration uses the **Linear** and **Google Workspace** connectors.

## Author

Meyer For Hire Consulting, LLC

## License

MIT
