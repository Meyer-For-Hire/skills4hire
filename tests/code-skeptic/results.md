# code-skeptic — test results

Procedure in `methodology.md`. Failure modes this skill was built against are in
`baseline-results.md`.

## Fixtures

| Fixture | Reviewed commit | Diff lines | Key |
| --- | --- | --- | --- |
| `pathx#131` | `a684b2d6` | 3,389 | 10 comments, 9 locations |
| `pathx#104` | `c63ffc56` | 2,692 | 18 |
| `pathx-datalab#20` | `3c5403e2` | 2,175 | 32 |

## RED -> GREEN

Same fixtures, same prompts, same keys. The only change is an instruction to read
`SKILL.md` and `rules.md` first, so the skill is the sole variable.

| Fixture | Key | RED | GREEN | RED tokens | GREEN tokens |
| --- | --- | --- | --- | --- | --- |
| `pathx#131` | 9 | 1 partial | **9** | 117k–153k band | 165k |
| `pathx#104` | 18 | 0 | **14 + 2 partial** | 117k–153k band | 138k |
| `pathx-datalab#20` | 32 | 3 + 2 partial | **18 + 6 partial** | 117k–153k band | 147k |

Recall of the key as line-anchored, actionable findings: **~7% -> ~71%**, at
roughly the token cost of the review that found ~7%. The skill redirects attention
rather than adding work.

Five of the six baseline failure modes closed:

- **Opposed prior on maintained facts.** `pathx#131` is the direct test: seven
  comments incrementing `eighteen` to `nineteen` in lockstep, of which RED flagged
  one. GREEN flagged all seven and argued it correctly — `datasetLoader.ts` said
  5,835 while the test said 5834 and nothing failed on the disagreement. No
  instance of "verify the number is correct" survived in any run.
- **Aggregation.** `pathx#104`'s fourteen history-lesson comments came back as
  fourteen findings, each with its own replacement text, where RED produced one
  rollup ranked last.
- **Weighting.** Prose and naming lead all three reports; correctness is last and
  intact.
- **No replacement names.** Zero renames in RED, proposed throughout in GREEN,
  with the file, props type, test file and import named.
- **Coined vocabulary.** Both `dense_grid` challenges landed with a proposed name
  and a sweep for other instances.

The sixth — notation — did not close then. It closed later, in a different place
than expected; see *Run-to-run variance* below.

The skill also produced renames the key does not contain and that are better than
anything in it — `actual_years` (which holds a forecast year) to
`base_rate_years`/`boosted_years`, with four explanatory comments disappearing
behind the rename. Generalisation, not memorisation.

## Fan-out and model tiering

Two hypotheses, tested together on `pathx-datalab#20` split into three by-file
slices (A: corpus and config, 7 keys; B: generators, 4 keys; C: tests, 21 keys).
Six arms, one per slice per model, prompts identical but for model and slice path.

| Arm | Tokens | Tool uses | Recall of 32 |
| --- | --- | --- | --- |
| **One Opus, whole diff** | **147k** | — | **18 + 6 partial** |
| Opus fan-out (A+B+C) | 354k | 55 | ~19 + 3 partial |
| Sonnet fan-out (A+B+C) | 470k | 79 | ~12 + 2 partial |

**Both hypotheses failed.**

*The by-file fan-out is not cost-neutral* — 2.4x the tokens for the same recall.
The intuition behind it was that N agents read one diff between them, so the read
cost is unchanged. Wrong: the cost is per-agent fixed overhead. Each agent loads
the skill, then re-explores the repository to orient itself, and that is 14–29
tool uses before it reads a line of the diff. Splitting the diff multiplies the
overhead and divides nothing that matters.

*Sonnet is dominated, not cheaper.* Head to head on identical slices it used ~1.35x
the tokens, took longer, emitted about half the findings, and reached ~60–65% of
Opus's recall. It explores more to conclude less. On per-token price it is ~0.54x
the dollars for ~0.65x the recall — cheaper per finding while permanently
forfeiting a third of them, which is the wrong trade for a pre-merge gate.

The cheapest configuration is also the most accurate: **one Opus pass over the
whole diff.**

## What the fan-out was good for

It failed as an architecture and succeeded as an instrument. Forcing each file to
be read turned ambiguous misses into diagnoses, because a miss in a file the agent
demonstrably read cannot be a coverage gap:

- **Notation.** `invariants.py:5` (interval notation) was missed by RED, by GREEN,
  and by both models in slice B — while Opus produced six findings elsewhere in
  that same file. Four misses with the file read. A rule gap.
- **Subject knowledge.** All three `test_corpus_models.py` keys were missed while
  Opus produced two findings in the file and Sonnet produced none. A rule gap.
- **Layer.** Both models anchored `emit.py:370` exactly and both objected to
  duplicated constants where the key asks where the value belongs. Not a gap in
  coverage or in rules — a rule that did not distinguish two findings on one line.

Those three drove the refactor: rules 3.3, 4.5 and 7.5 each gained an explicit
test question, in the shape that worked for counts. Rules 8.5/8.6 gained the
mechanical-fix bound, which cut roughly 12 findings of noise from a 75-finding
report on `pathx#104`.

## Run-to-run variance

Three further runs on `pathx-datalab#20`, identical prompt, identical skill,
dispatched separately. This is the most consequential result in this document,
and it is about the *instrument*, not the skill.

| Run | Hits of 32 | Partials | Tokens | Tool uses |
| --- | --- | --- | --- | --- |
| Pre-refactor | 18 | 6 | 147k | — |
| Post-refactor 1 | 15 | 5 | 67k | 33 |
| Post-refactor 2 | 14 | 5 | 101k | 31 |
| Post-refactor 3 | 16 | 6 | 66k | 37 |

**A single run measures the run, not the skill.** Any one post-refactor run
anchors 44–50% of the key; the **union of the three anchors 24 of 32 (75%)**. The
three runs disagree on which keys they catch — `test_emit.py:55` and
`enrollment.py:42` were hit twice and missed once, `test_enrollment.py:69` and
`test_corpus_content.py:245` were hit once and missed twice. Scoring a refactor
against one run before and one run after would have produced a confident,
unreproducible conclusion in either direction.

**Cost does not predict recall.** The most expensive post-refactor run (101k) had
the fewest hits; the two cheapest (66k, 67k) scored highest. Whatever drives the
token spread, it is not thoroughness.

**The refactor's effect on recall is not measurable at this n**, and the honest
statement is that all three post-refactor runs scored below the single
pre-refactor run on strict hits while the three new rules each began firing. The
cost drop (147k against 66/101/66k) is suggestive but rests on one observation of
the pre-refactor arm; it was checked against the possibility of cache effects and
does not fit that shape, since cache reads are per-agent and the cheapest run was
not the one with fewest turns.

### The three refactor targets

Each new rule now fires — and each fires on a *different instance* than the one
that motivated it:

- **Notation (3.3)** catches `assertTrue(window < years)` at
  `test_invariants.py:207` in two of three runs — proper-subset notation that
  reads as a numeric comparison. It has never caught the interval notation at
  `invariants.py:5`.
- **Layer (7.5)** produced the full argument in two runs, at `invariants.py:61`
  and `invariants.py:189` ("move the check to the read path that owns the
  bounds"), while the keyed line `emit.py:370` still draws the duplicated-constant
  finding.
- **Subject knowledge (4.5)** fires elsewhere (`test_model.py:74`, "they pass
  because the fixture happens to be written that way") but has produced **zero
  findings in `test_corpus_models.py` across all four runs and both fan-out arms.**

The distinction matters: these rules generalise correctly, so the surviving misses
are attention, not knowledge.

### Keys no run has ever anchored

Seven reachable keys, and they cluster:

- `test_corpus_models.py:165`, `:168`, `:185` — the subject-knowledge cluster.
- `invariants.py:5` — interval notation.
- `corpus.py:234`, `test_completions.py:82`, `test_invariants.py:100`.

`basis.py:9` ("the decision in PATHX-406 could change how this is observed") is an
eighth, and is unreachable from any diff — a ceiling, not a gap.

### Known false positive

Two runs flagged `dials.yaml`'s `artifact_version` jumping 1 -> 3 as a missing
version. The jump is deliberate. The rule that produced it is sound; the finding
is wrong, which is what an author reply is for.

## Overlap with `code-review`

Both reviewers run blind to each other on `pathx#104`, scored against the same
18-comment key.

| | Key recall | Tokens | Tool uses |
| --- | --- | --- | --- |
| `code-skeptic` | **14 + 2 partial** | 138k | 27 |
| `code-review` | 4 + 1 partial | >=115k | 44 |

`code-review`'s cost is a floor: that is the orchestrator's usage, and its two
axis sub-agents ran as children whose tokens are not folded in.

**Overlap is low and asymmetric.** About eight findings are shared —
`showcaseRoute.test.tsx:80`, `components.css:341` and `:463`,
`futuremaker.css:17`, the `npm run` -> `pnpm` set, the `kit-baseline.json` path
mismatch, the `D-0xx` register, the esbuild pin. That is ~10% of `code-skeptic`'s
output and roughly half of `code-review`'s. Deduplication is cheap either way.

**The disjoint halves are each reviewer's best work, and the boundary is clean.**
`code-review` alone found that `index.ts` still exports symbols deleted from
`colors.ts` and that `KitDonut.tsx` still imports them; that `theme="pathx"`
survives at four call sites after the union was narrowed; that `check:kit` and
`gen:base` are wired into no runner, so every guard the comments cite is inert.
Each requires reading the *repository* — what still imports a deleted symbol, what
still passes a narrowed type, whether a script is called anywhere.
`code-skeptic` reads a diff, and structurally cannot see any of it.

The axis is therefore **diff-local reasoning versus repo-global consequence**, not
"house style versus correctness". The reviewer agent should run both narrow and
dedupe at the join, rather than merging them into one broad prompt — which would
cost the half of each that the other cannot reach.

One finding for the backlog: `code-review` caught ~200 lines of Kit CSS authored
here rather than upstream in `pathx-prototype`. That is `code-skeptic`'s own rule
7.6, missed on a fixture where it is plainly present.

## Whole-stack review

A stack of three dependent pull requests (`pathx#138`/`#139`/`#140`; merge base
`3ae3b7c`, top `173b68a`, 4,987 diff lines) reviewed two ways: one pass per pull
request against its own base, against one pass over the whole-stack diff with each
finding attributed back to a layer.

The key is the pooled output of the per-layer arms — 51 distinct findings — so the
per-layer side scores 100% by construction and every whole-stack number is a
floor. See `methodology.md` § *Scoring a stack review*.

| Approach | Skill | Runs | Findings | Key /51 | Novel | Tokens | Tool uses | Wallclock |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Per-layer | `code-skeptic` | 3 | 22 | 22 | — | 384k | 78 | 15m 40s |
| Per-layer | `code-review` | 3 | 35 | 35 | — | 313k orch. | 86 orch. | 14m 40s |
| Whole-stack | `code-skeptic` | 1 | 21 | 15 | 7 | 157k | 30 | 6m 39s |
| Whole-stack | `code-skeptic` | 2 | 15 | 16 | 1 | 153k | 25 | 4m 33s |
| Whole-stack | `code-review` | 1 | 20 | 15 | 9 | 413k | 97 | 10m 53s |
| Whole-stack | `code-review` | 2 | 17 | 17 | 3 | 409k | 118 | 6m 46s |

Union of the key: `code-skeptic` 21, `code-review` 23, all four arms 31.

**`code-skeptic` reviews a stack better whole.** Two whole-stack runs reach 21 of
the key against three per-layer runs' 22, for 309k tokens against 384k, and add
eight findings the per-layer side never produced. Same recall, less money, more
findings — which is what the fan-out result predicted: the cost of a pass is fixed
overhead, so folding three passes into one removes two of them, and the diff
growing threefold costs almost nothing. This is the result the skill acts on.

**`code-review` does not.** Per-layer it contributed 35 of the key; whole-stack it
reaches 23, for 822k measured against a per-layer estimate in the same range. It
reasons about a change's consequence in the repository, and merging three changes
into one blurs the thing it reasons about. Recorded as measured; `code-review` is
not this skill's to change.

**`code-review`'s children, measured for the first time.** Its two axis sub-agents
ran at 1.5x and 2.4x the orchestrator's own usage. Every `code-review` token
figure elsewhere in this document is orchestrator-only and therefore a floor,
including the per-layer row above.

**Attribution held.** All four arms attributed every finding to a layer, and
agreed on the layer wherever two arms shared a finding. No arm left a stack-level
residue.

**The novel findings are cross-layer, which is the point.** Files left in conflict
with the trunk; a pull request description describing a rebase that had not
happened; a guard a later layer made unreachable; an identifier whose meaning a
later layer rewrote against the first layer's explicit fence. None of them is
visible in any single layer's diff.

**Caveats.** n=2 whole-stack against n=1 per-layer, where `methodology.md` asks
for three on both sides. The key's construction is described above. Wallclock is
not comparable: the per-layer arms were serialised by a worktree constraint rather
than by the work.

## Open gaps

Carried, not yet acted on, because acting on them requires a failing test first:

1. The `test_corpus_models.py` subject-knowledge cluster — four runs, zero
   findings, rule 4.5 demonstrably firing elsewhere.
2. `invariants.py:5` interval notation — rule 3.3 firing elsewhere, never here.
3. Rule 7.6 (repo boundaries) missed on `pathx#104`.
4. Per-run cost: 14–29 tool uses of repository re-orientation before the diff is
   read, on every run.
5. Posting granularity (`SKILL.md` § *Where a finding goes*) is unmeasured. The
   rule was written from an observed failure — every arm posted its whole review
   as one Markdown body — but no arm has been scored on granularity since. Score
   it on the next stack run, alongside attribution.
6. `code-review` whole-stack costs the same as per-layer and reaches two thirds of
   the findings, at n=2. Left unretested deliberately: the recommendation stands
   either way, since `code-skeptic` gains from the whole-stack diff whatever
   `code-review` does.
