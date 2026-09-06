---
name: code-skeptic
description: Use when reviewing a pull request, a stack of dependent pull requests, a diff, or a branch before it merges, or when asked to check changes someone else wrote
---

# Code Skeptic

**Announce at start:** "I'm using the M4H skills4hire/code-skeptic skill to review this change."

A reviewer for prose, names, and test hygiene — the parts of a change a type checker cannot reach. Correctness review is a separate axis and a separate pass; this one does not displace it.

## The maintenance test

Apply this to every fact a change writes down outside the code it describes: a count in a comment, a date in an assertion message, a total in a test name, a version in a string, a list restated in prose.

> Who updates this when the underlying thing changes, and what breaks if they don't?

- **A tool updates it** — fine. Generated, derived, or asserted from source.
- **A person updates it, and something fails loudly when they forget** — fine, usually. Say so if the failure is obscure.
- **A person updates it, and nothing fails** — the fact should not be there. Report it.

The third case is the finding, and it is a finding whether or not the fact is currently accurate. Accuracy is not the question. A count that has been correct for a year is the same liability as one that went stale yesterday — someone paid to keep it correct, and that work bought nothing.

So the fix is never "correct the number." It is one of:

- delete the fact (`the eighteen tables` -> `the tables`);
- derive it (`assertEqual(len(DATASETS), 16)` -> compare against the directory listing; `"has not ended at 2026-09-15"` -> interpolate the corpus date);
- move it to where it is already checked, and refer to that place.

Recognising this pattern is most of the job. It looks like diligence in the diff — a careful author incrementing every count they touched — and the increments are the evidence, not the fix.

## What a finding is

One location. One comment. If the same violation occurs at fourteen lines, that is fourteen findings, each anchored to its own line — because each one needs its own replacement text written.

The exception is a defect one command fixes everywhere: formatting, a missing trailing newline, a mechanical rename. That is one finding naming the command and the files. Ask which you have: if the replacement differs per line, they are separate findings; if the action is identical everywhere, it is one.

Every finding has these parts, in this order:

1. `path:line`, and where it posts — see *Where a finding goes* below.
2. The comment as you would leave it there, in the second person, written to the author. One or two sentences. Not a category label.
3. Where a name is at issue, **the name to use instead**. Propose it; don't ask the author to think of one.

A rollup — "several comments in this file carry change history" — is not a finding. Neither is a count of findings, a severity table, or a closing summary recommending the author cut "roughly half" of something.

## Where a finding goes

A finding carries a target as well as a location: the granularity it posts at, and — where the change under review is a stack — the pull request it lands on.

**Granularity.** Three kinds, and the first is the default.

| The finding is about | Post it as |
| --- | --- |
| A line the change touched | A comment on that line |
| The file's state — its structure, something duplicated across it, something missing from it | A file comment |
| The change itself — its scope, its fit against what it claims to do, a decision it makes | An item in the review body |

On GitHub these are three different calls, and a review needs all three: a review comment carrying `path` and `line`; a review comment carrying `path` and `subject_type: file`; and the review body. Posting the whole review as one Markdown body puts every finding at the third granularity, and the author loses the line each one is about.

Reach past the first kind only when it is untrue. A finding that anchors to a line and gets posted as a file comment has lost the location that made it actionable, and a finding about the change as a whole, hung on whichever line was nearest, reads as an objection to that line. A finding about a line the change **deleted** has no line left to post on; that one is a file comment.

## Reviewing a stack

A stack is a chain of dependent branches, each based on the one below and the bottom based on the trunk. Review it as **one diff from the trunk to the top of the stack**, in a single pass, and assign each finding to a layer afterwards. Don't review the layers one at a time.

- It costs less and finds at least as much — measured, in this skill's test records under § *Whole-stack review*. The cost of a pass is fixed overhead rather than diff size, so reviewing N layers separately pays that overhead N times and divides nothing.
- A layer-at-a-time review cannot see across layers. A fact one layer writes down and a later one falsifies is correct in both diffs and wrong in the tree; only the whole-stack diff shows it.

**Assigning a finding to a layer:**

- **A line comment goes to the highest layer that changed the line.** That is the diff the line's current form appears in, and the only one GitHub will accept an inline comment on. `git blame` answers this directly — it reports the last commit to touch a line, not the first.
- **A file comment goes to the layer whose change it is about** — the layer that introduced the defect, or made the kind of edit the finding objects to. Where several layers touched the file and none of them is a better fit, use the highest. Nothing forces "highest" here the way it does for a line, so use the judgement you have.
- **A review-body item goes to the layer it is about.** Each layer asserts what it changed *and* what it branched from, so "this branched before X landed, rebase it" is a finding about the bottom layer, whose base is the trunk.
- **A finding about the stack's shape** — boundaries drawn in the wrong place, an ordering that makes one layer undo another — goes to the bottom layer. That one merges first, so it is the last point at which restructuring is cheap.

Every finding names a layer. There is no stack-level bucket to put the rest in.

## What to look for

Read `rules.md` for the full catalogue, and read the conventions this repo has written down for itself — `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, the docs they point at. A convention the project states is a rule here, and a change that violates one is a finding whether or not `rules.md` names it.

In review order:

1. **Facts that need maintaining** — the test above. Counts, dates, versions, totals, restated lists, in code, comments, test names, and assertion messages. Where a value is being written into an artifact a consumer reads, also ask which layer owns it: a window anchored on today's date belongs where it is used, not shipped in a database that must be regenerated to change it.
2. **Comments** — a comment says what the code does now and why, where the code doesn't already show it. Change history, dated notes, and "this used to be" belong in the PR or the issue. An explanation repeated in several places should live in one place with the others pointing at it. Too long is a defect on its own; when you say so, write the shorter version.
3. **Names** — a name that misleads costs more than a name that is merely vague, because readers reason from it. Check that a name still means what it says after the change (`actual_years` that holds forecast years; a `Top10` component whose own test asserts it isn't top ten). Then ask of every line: **would a competent engineer on this project have to look something up to read this?** That catches coined vocabulary, which stops a reader — and notation, which doesn't. `[2024, 2027)` reads fluently and half its readers include 2027.
4. **Tests** — the name states the subject and the property (`test_<subject>_<is what>`). An assertion that restates its input is a tautology; drop it. A test coupled to an arbitrary value — a specific date, a chosen term, a magic product — should assert the property that made the value interesting instead. And ask of each assertion: **can the subject under test know this?** A model knows shape, not which dates the corpus chose. An assertion that has drifted a layer away from what can know it passes by coincidence.
5. **Correctness** — real defects, in the same shape. Keep these; the house rules are additional to them, not instead of them.

Report in that order. Prose and naming findings go first, not in a trailing section: they are the majority of what this review exists to catch.

## Red flags — stop

- You verified a number is correct and moved on. Apply the maintenance test.
- You are about to say "consider whether" or "worth thinking about". Say what to do.
- You wrote one finding covering several lines, each needing its own fix. Split it.
- You wrote several findings whose fix is the same command. Collapse them.
- You used a term from the diff you could not define. That is finding material.
- You read a line of notation without stopping. Apply the lookup test — this is the one the reviewer most often catches and the review most often misses.
- Your output has more findings under a "minor" heading than above it.
- Every finding you wrote is an item in the review body. You reviewed the change and not the code.
- You sent a file comment to the top of a stack without asking which layer the finding is about.

## References

- `rules.md` — the full rule catalogue, derived from review history on production repositories.

The test records are kept in the `skills4hire` repository rather than shipped with the skill, under `tests/code-skeptic/`: `methodology.md` (how this skill is tested, and how to run a new experiment), `results.md` (measured recall and cost, and what each round changed), `baseline-results.md` (the failure modes it was built against).
