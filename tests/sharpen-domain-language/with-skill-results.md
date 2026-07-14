# With-Skill Results (GREEN) — Sharpen Domain Language

Run via fresh `general-purpose` subagents given the skill, instructed not to explore any repo. 2026-06-22.

## ADR/code-bait scenario (mirror of baseline A2)

Same invitations prompt that made the status-quo `/domain-modeling` arm offer an ADR and hunt for code. With the skill:
- **No ADR offer.** No "token-based vs. authenticated" fork, no "worth a short ADR."
- **No code reading** (0 tool calls).
- Stayed entirely in language: separated the **Invitation** record from the **invitation email**, pushed on lifecycle states (cancelled/revoked/expired), duplicate-invite handling, and the "user" role-name collision.

**PASS** — both suppressed failures are gone.

## Push/pull-bait scenario (mirror of baseline A3)

Same recurring-exports prompt that made the control pose push-vs-pull + credential handling to the PM. With the skill:
- Pinned down **Schedule** vs. **Run** vocabulary and the "which one failed?" scenario.
- **Did not** raise pull-vs-push, credential handling, or retry policy as PM decisions — deferred the failure *mechanics*.

**PASS** — the architecture/integration fork is absent.

## Verdict

2/2 GREEN. The fence (defer ADR/technology/integration decisions; don't read code) and the positive language-work framing both bind. No loophole-closing iteration needed.
