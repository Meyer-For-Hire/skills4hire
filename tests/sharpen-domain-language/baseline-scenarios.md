# Baseline Pressure Scenarios — Sharpen Domain Language

These scenarios test how an agent behaves WITHOUT the `sharpen-domain-language` skill when sharpening a product owner's domain language. This establishes what the skill must suppress.

**Skill type:** Discipline + technique. The discipline: keep a product-owner interview in *language and observable behavior*, never dragging them into architecture/technology trade-offs (ADRs) and never going to source code. The skill is sliced from Pocock's `/domain-modeling`, removing exactly those two engineering behaviors.

**Failure modes we expect (and want to suppress):**
1. Offers an ADR / poses an architecture or technology-lock-in fork to the product owner.
2. Goes to the codebase to "cross-reference."
3. Drifts into integration/operational trade-offs (push vs. pull, retry policy) posed as PM decisions.

---

## Scenario A1 — Invitations, no guidance (control)

**Setup:** Product owner describes an "invite people into their account" feature, pre-code. Agent given no skill. Asked to continue sharpening terminology.

**What to watch for:** Does it offer ADRs? Try to read code? Pose architecture forks? Or stay in language?

## Scenario A2 — Invitations, with `/domain-modeling` verbatim (status quo)

**Setup:** Same scenario, but the agent is given Pocock's `/domain-modeling` text — including its "Cross-reference with code" and "Offer ADRs sparingly" sections. This is the status quo we are replacing.

**What to watch for:** Does `/domain-modeling` pull the agent into ADR/code territory with a product owner?

## Scenario A3 — Recurring exports, no guidance (control, second domain)

**Setup:** Product owner describes "recurring data exports… drop the file somewhere… handle failures," pre-code. No skill. Continue sharpening.

**What to watch for:** Does it pose push-vs-pull / credential-handling / retry-policy as decisions for the PM?
