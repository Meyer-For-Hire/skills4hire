# How this skill is tested

The skill is developed against real review history: diffs whose defects a human reviewer already found and wrote up. Those comments are the answer key, so recall is measurable rather than asserted.

Read this before changing the skill or running a new experiment. The procedure is the part that makes results comparable across rounds.

## Building a fixture

A fixture is a frozen diff plus the reviewer comments that anchor to it.

**Freeze the diff at the commit the reviewer saw**, not at the PR head. Each review comment carries `original_commit_id` — the tree it was written against. A PR head is the *post-fix* tree, where the defects the key names have already been corrected, which makes the fixture unscoreable in a way that is not obvious: the diff still looks plausible.

```bash
gh api "/repos/<owner>/<repo>/pulls/<n>/comments?per_page=100" \
  --jq '.[] | select(.in_reply_to_id == null) | "\(.original_commit_id) \(.path):\(.original_line)"'
```

Take the dominant `original_commit_id`, and generate the diff against it. Merged PRs stay reachable through `refs/pull/<n>/head` after the branch is deleted.

**Build the key from top-level comments only.** `in_reply_to_id == null` isolates what the reviewer raised from the replies underneath it, which matters when the reviewer and the agent post under the same account.

```bash
gh api "/repos/<owner>/<repo>/pulls/<n>/comments?per_page=100" \
  --jq '.[] | select(.in_reply_to_id == null) | "--- \(.path):\(.original_line)\n\(.body)\n"'
```

Keep the comment bodies verbatim. They are the scoring authority and they also calibrate voice: one or two sentences, second person, says what to do.

## Scoring a run

Score each key location as **hit**, **partial**, or **miss**.

- **Hit** — the run anchored the same location and objected on the same axis.
- **Partial** — right location, different axis; or the right defect reached through a neighbouring line. Both are worth recording, because they separate "never looked" from "looked and read it differently".
- **Miss** — no finding at or adjacent to the location.

Findings the key does not contain are not scored, but the good ones are worth noting: several have been better than the key, and they are evidence the skill generalises rather than memorises.

**Two caveats that have bitten this measurement:**

*Saturating defect classes understate recall.* Where a slice contains fifteen over-long comments and the reviewer flagged four of them, a run can apply exactly the right rule fifteen times and score two. Check whether the key is a sample of a class before reading a low score as a rule gap.

*Some keys are unreachable from the diff.* A comment like "the decision in PATHX-406 could change this" cannot be derived from the change. Leave it in the denominator — it is a real ceiling — but do not treat it as a gap to close.

## Running an experiment

**Hold the dispatch prompt identical across arms.** The variable under test — model, slice, skill revision — should be the only difference. Write the prompt once and vary one field.

**Never edit the skill while agents are reading it.** Arms dispatched before and after an edit are reading different skills, and the comparison is void. Hold every edit until the last agent reports.

**Dispatch to subagents, one arm each, in a single message** so they run concurrently, and give each a context ceiling (200k) so a runaway arm fails visibly instead of quietly costing more than the result is worth.

**Record tokens and tool uses per arm**, not just recall. Tool uses are the more diagnostic number: they show how much of the cost went to re-orienting in the repo rather than reading the diff.

**Run each arm at least three times.** This is not optional rigour; a single run measures the run. On the same fixture, prompt and skill, three runs anchored 44–50% of the key each and 75% between them, disagreeing about *which* keys they caught. Token cost varied by 1.5x across those three and did not correlate with recall — the most expensive run scored lowest.

So report two numbers. **Per-run recall** is what one review of one PR will actually catch. **Union recall** is what the rules can reach. A change that moves the union is a change to the skill; a change that moves one run is noise, and acting on it is how you chase your own variance into the rules.

The corollary is that a before/after comparison needs n on **both** sides. One run before and one run after will produce a confident conclusion in whichever direction the noise fell.

## Diagnosing a miss

**First establish that it is a miss.** A key absent from one run is usually variance; only a key absent from every run is a gap. Diagnose against the union, then use the table below on what survives.

The three causes look alike in a report and need different fixes.

| Cause | Evidence | Fix |
| --- | --- | --- |
| Coverage gap | No findings anywhere in the file | Nothing in the skill — the run ran out of attention |
| Rule gap | Findings elsewhere in the same file, none at the key line | A rule with a test attached |
| Wrong axis | A finding *on* the key line, objecting to something else | Sharpen the existing rule to distinguish the two |

A single whole-diff run cannot always tell these apart, which is what the by-file fan-out was useful for even though it failed as an architecture: it forced each file to be read, so a surviving miss had to be a rule gap. Use a targeted single-file run for that diagnosis rather than a full fan-out.

## Scoring a stack review

A stack is reviewed as one diff and reported as several sets of comments, so a run has a second thing to score: whether each finding reached the right layer.

**Build the key per pull request, then pool it.** Each layer's reviewer comments key to that layer, and the pooled set is the key for a whole-stack run. Recall scores against the pool; attribution scores per finding, against the layer the key comment sits on.

**Score attribution in its own column.** A finding that names the defect and lands on the wrong layer is a hit for recall and a miss for attribution — the author still sees it, but on someone else's page. Collapsing the two hides which of them a change to the skill moved.

**A key built from per-layer runs cannot score those runs.** Where the pooled key *is* the output of the layer-at-a-time arms, those arms score 100% by construction and the whole-stack arms are measured against a target their competitor defined. Recall under such a key is one-directional: a whole-stack number is a floor, and a per-layer number is not a measurement at all. It still compares two *skills* honestly, because the bias falls on both equally. Say which of the two you are doing when you report.

**Count novel findings.** Under a biased key they are the only evidence that the arm being measured reached anything the key's authors did not — and cross-layer findings, the class the whole-stack diff exists to reach, can appear nowhere else.

## Fixtures

Fixtures live outside the repo, in `tmp/skeptic-fixtures/` in the main checkout, because they are large generated diffs of other repositories' history. They are reproducible from the commands above; the PR numbers and commits are recorded in `results.md`.
