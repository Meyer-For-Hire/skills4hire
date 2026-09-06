# code-skeptic — RED phase

Baseline behaviour of a generic senior reviewer on three PathX pull requests,
scored against the review comments Jim actually left on the same commit.

## Method

Each fixture is `git diff $(git merge-base <sha> origin/main)..<sha>` frozen to a
file, where `<sha>` is the commit the review comments anchor to — GitHub's
`original_commit_id`, not the PR head. Using the head reviews a tree that already
carries the fix; two of the three fixtures had to be rebuilt for this reason.

The answer key is every top-level comment (`in_reply_to_id == null`) on that SHA.
Replies are excluded: agent replies and reviewer comments share an author here.

Baseline agents got the diff, the repo path, and a generic "review this the way an
experienced senior engineer would" prompt. No house rules beyond what `AGENTS.md`
already carries, which is the honest condition — a reviewer in this repo has it.

| Fixture | SHA | Key | Baseline findings | Actionable hits |
| --- | --- | --- | --- | --- |
| `pathx#131` | `a684b2d6` | 9 | 22 | 1 partial |
| `pathx#104` | `c63ffc56` | 18 | 32 | 0 |
| `pathx-datalab#20` | `3c5403e2` | 32 | 25 | 3 + 2 partial |

Recall of the key as line-anchored, actionable findings: **~7%**. Of the 79
findings produced, ~6% correspond to something the reviewer raised.

## Failure modes

### 1. Opposed prior on maintained facts

The dominant failure, and the reason this is not a knowledge gap. A number or date
kept accurate in a comment, test name, or assertion reads to a generic reviewer as
a correctness obligation — something to verify — where the house rule is that it is
a liability to delete. Four independent instances:

- `pathx#131` finding 16 does the arithmetic on `5,835` -> `5,838`, confirms the new
  value is right, and offers deletion only as a trailing "worth considering",
  conditioned on the number having been wrong once. A count that had always been
  accurate earns no comment.
- `pathx-datalab#20` finding 10 flags `test_all_sixteen_exist_and_are_wellformed`
  because the count is stale at 16, and asks to correct it to 17 — where the rule
  is to take the number out of the name.
- `pathx#104` findings 22 and 23 ask a verbose comment to name more files and a
  constraint to be restated inline: the instinct on a bad comment is to make it
  more accurate, not to cut it and point at the implementation.
- A discarded run against the post-fix `pathx#131` tree saw literals removed from
  tests and argued to restore them: "the churn *was* the check".

Consequence: the baseline read a diff whose most visually repetitive edit is
`eighteen` -> `nineteen` across seven comments, and flagged one of the seven.

### 2. Aggregation

`pathx#104` is 18 comments, 14 of them the same sentence at 14 locations. The
baseline produced one rolled-up finding, ranked last, closing with "I'd cut roughly
half of the added prose." It named ~7 of the 18 locations inside that rollup. An
author cannot act on it line by line, which is what the 18 comments are for.

### 3. Weighting

Comment prose was 100% of the `pathx#104` review and ~3% of the baseline's output,
placed under "Worth mentioning" below 23 correctness findings. The baseline is not
a worse reviewer — it is a different one. The gap is priority, not knowledge.

### 4. No replacement names

Across 79 findings the baseline proposed zero renames. The key contains four
worked rewrites, given as the name to use:
`test_current_term_enrollment_is_actual_and_completion_is_forecast`,
`test_basis_as_of_date_falls_between_first_and_last_terms`, `test_no_gaps_in_terms`,
and a one-line rewrite of a CSS import comment.

### 5. Jargon blindness

`dense_grid` is invented vocabulary defined nowhere. The key challenges it twice —
"jargon you invented. What does it mean, and what's a better name for it that I
don't have to learn?" The baseline used the term itself, uncritically, as the
subject of its own finding 18.

### 6. Notation assumed to be shared

Interval notation in `invariants.py` drew "please stop using interval notation;
it's not expected knowledge among all the engineers who may work on this project."
The baseline read the same file and did not mention it.

## What the baseline is good at

Worth recording so the skill does not displace it. The baseline found real defects
the key does not contain: a kit barrel that no longer compiles, a Prettier
quote-flip that silently empties a generated-CSS check, two exemption regexes that
match nothing, an `IndexError` reachable from a corpus every validator accepts.
These are correctness findings on a different axis and should survive.

The one strong match in the exercise is `pathx-datalab#20` finding 22, which found
three hardcoded corpus dates in assertion messages and prescribed the right fix —
interpolate from the corpus. That is the shape every finding should have.

## Implications for the skill

Per `superpowers:writing-skills` "Match the Form to the Failure": modes 1 and 3 are
priors and weighting, mode 2 is output shape. Neither responds to prohibitions.
Mode 1 in particular survived a competing incentive (accuracy) in every instance,
which is the signature of a failure that negotiates with "don't X".

The skill therefore needs a positive contract on what a maintained fact costs, a
required per-occurrence output shape, and an explicit ordering — not a rule list
saying not to flag magic numbers.
