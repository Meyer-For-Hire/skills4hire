# Baseline Results (RED) — Sharpen Domain Language

Run via fresh `general-purpose` subagents, 2026-06-22.

## A1 — Invitations, no guidance

Strong language work: challenged "account" (container vs. login), proposed Inviter/Invitee/Member, mapped the invitation lifecycle (pending/accepted/expired/revoked), stress-tested the forwarded-link security case. **Did not** offer ADRs or read code. Mild drift only — referenced "single-use link" / "set a password" as mechanisms, but framed as observable behavior.

## A2 — Invitations, with `/domain-modeling` (status quo) — **the key RED**

The status-quo skill produced both failures we set out to suppress:
- **Tried to cross-reference code.** Opened by noting "this is a skills/docs repo… no real `CONTEXT.md` or account code to cross-reference" — i.e. it went looking (3 tool calls) for source to check against, in a pre-code context.
- **Offered an ADR / posed a lock-in fork to the PM.** Closed with: "the choice of 'invitation token in an email link' … is a genuine fork with security and lock-in implications (token-based vs. requiring the invitee to already have authenticated) … that's worth a short ADR."
- Also wrote implementation-flavored names (`account.users`, `user.account`).

## A3 — Recurring exports, no guidance

Good schedule-vs-run sharpening, but **drifted into architecture/operations posed as PM decisions**:
- "**pull vs. push** for the destination… push means we're integrating with external destinations and **handling their credentials**; pull means we're a file store."
- "retry — **how many times, how far apart?**"

## Cross-scenario patterns

- **Rationalizations / drivers:** `/domain-modeling`'s own "Cross-reference with code" and "Offer ADRs" sections directly drove the A2 failures. Even without them, agents gravitate to integration/operational trade-offs (A3).
- **Gaps the skill must address:** (1) explicitly fence off ADR-worthy / technology / integration decisions and defer them to technical design; (2) explicitly forbid going to source code in product definition; (3) positively steer to language + observable behavior; (4) a red-flag self-check.
