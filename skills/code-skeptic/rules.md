# code-skeptic — rule catalogue

Derived from 285 top-level review comments across two production repositories. Quoted lines are the reviewer's own words, kept as calibration for voice and length: one or two sentences, second person, says what to do. They quote the projects they came from, so a quote may use vocabulary you don't share; read them for shape, not for subject.

## 1. Facts that need maintaining

Apply the maintenance test in `SKILL.md` to each of these.

**1.1 Counts in comments.** A quantity that tracks something countable elsewhere. The seven-instance case: a header saying `the eighteen pipeline-owned base tables` becomes `nineteen` when a table is added.
> Remove the number so we don't have to maintain it.

**1.2 Counts in names.** Test names and identifiers that embed a total.
> Take the number out of the test name. Maybe just `test_no_gaps_in_terms`.

**1.3 Counts in prose and docs.** Rule counts, step counts, file counts.
> Why must we count rules and maintain this verbiage when it changes?

> NIT: we can leave out step/stage counts so we don't have to perpetually revise them.

> The file count isn't relevant in this comment, so it's not worth maintaining. Drop it.

**1.4 Dates and values pinned in assertions and messages.** An assertion coupled to a specific date, term, or product of dimensions. The fix is to derive the value from the thing that owns it.
> Magic number in the message — assumes a particular `as_of_date` for the `workforce_demand` dataset. Should instead look up the dataset's `as_of_date` and be sure that when it fails, it's mentioned with the correct date.

> Choosing `2026-fall` is arbitrary and has to change if we change the `simulated_current_date`. That coupling costs maintenance and introduces fragility.

**1.5 Versions restated in strings.** A version already carried by the manifest, package, or artifact, written a second time into prose.

**1.6 A rule or list restated in a second place.** Where the authority already exists, refer to it.
> You're repeating what's written in ADR-0084 when you should just state what the code does and why it does it, concisely, and only to the extent the code doesn't speak for itself. You should refer to ADR-0084 for anything else.

## 2. Comments

**2.1 Change history.** Dated notes, "removed on", "this replaced", "two earlier attempts", "used to be". Naming a past state the code still carries is different and is fine — a `legacy_` column, a name that predates a convention.
> Drop this comment. We don't need history lessons in comments. Comments concisely say what the code does and why, and only when reading the code doesn't make it evident.

**2.2 Explaining what the code shows.**
> This is unneeded; remove it. We talk about what we do and why, concisely, and only when the code doesn't make it clear.

**2.3 Re-explaining what lives elsewhere.** Point at the implementation instead of copying it.
> This should be evident in code elsewhere. Shorten this comment and point to the implementation as reference. If we need to be this verbose, it should live near the implementation.

> Wordy. Needs to talk about what the code does and why, concisely, and only if it's not evident. If we need more detail, we refer to it where it lives rather than copy it around; this avoids drift.

**2.4 Length as a defect.** When you say a comment is too long, write the replacement.
> Too wordy. "`base.css` import must precede all other imports; it provides all the tokens at :root"

> Too wordy and the sentence order buries the lede. Should be: Whether this cohort is observed or predicted. Prevents double counting because we keep forecast rows even after actuals for the same program and term are added.

**2.5 Status, next steps, what's done all belong in the ticketing system on the ticket we're working on, not in the codebase.**
> Move all of this (and any other comments/docs that become stale once we've run this) to the Linear ticket instead.

**2.6 Structure.** Where a comment carries several parallel facts, ask for the list form.
> I'd like to see the three of these as a list of bullet points all in a row, then the series of key/value lines.

**2.7 A comment attached to the wrong thing.** A file-level block sitting directly above a type becomes that type's hover documentation.

## 3. Names

**3.1 A name that no longer means what it says.** The highest-cost naming defect, because readers reason from the name rather than reading through to the code. `actual_years` holding forecast years; a `Top10` component whose test asserts it is not top ten.
> Either renamed more accurately or restructured to fit the name.

**3.2 A name less specific than it could be at no cost.**
> `env_name` would be a better name for this variable than just `name`.

**3.3 Vocabulary and notation a reader has to look up.** Apply the test:

> Would a competent engineer on this project have to look something up to read this line?

If yes, the line needs a term that needs no lookup, or an entry in whatever file this project treats as its glossary. The shapes it takes:

- **Coined vocabulary** — a term defined nowhere, invented by this change.
  > `dense_grid` is jargon you invented. What does it mean, and what's a better name for it that I don't have to learn?

  > "narrative boost" is jargon.

- **Specialized notation** — a scheme that *is* defined, in a field not everyone here has been through. It takes two things to make it a finding, and it needs both: the notation sits outside what a working junior engineer can be expected to have met, and it is easy to read past without noticing you have misread it. Big-O, regex in prose, and the algebra shorthand — ∆, ∑ — clear the first bar; expect them and don't flag them. Interval notation fails both bars: `[a, b)` is not common knowledge, and the difference between `]` and `)` inside a dense paragraph is one character nobody's eye stops on. `iff` fails both the same way — a reader who has not done formal logic sees "if", and one who has still reads past the second `f`.
  > Please stop using interval notation. It's not expected knowledge among all the engineers who may work on this project and it's subtle enough to easily miss.

- **A named phenomenon** — an effect, law, or distribution named after a person: defined in the literature, invisible outside it. Ask first whether the change needs the term at all; where it does, spell out what it means and cite a source a non-specialist can follow.
  > Spell it out here, with links to either Wikipedia or an authoritative, complete source that's freely available and explains in reasonable layman's terms the point you're getting at.

Notation is the hardest of these to catch and the most dangerous to leave, because it reads as ordinary prose. A coined term stops a reader — they know they don't know it. Notation doesn't: a reader with some advanced maths behind them reads `[2024, 2027)` fluently and half of them include 2027. Nothing about the line looks like a defect, which is exactly why you walk past it.

**3.4 Sweep for every instance.** Coined vocabulary and notation spread. When you find one, find the rest — including in `AGENTS.md`, `README.md` and docs — and name them.
> "Narrative boost" is jargon that we eliminated in another comment. Find that and reword this.

**3.5 Glossary conformance.** Where a project names a file as the authority on its domain vocabulary — `CONTEXT.md`, a docs page, an ADR — new domain vocabulary needs an entry there, and an existing term must be used exactly, not paraphrased into a second name for the same concept.

## 4. Tests

**4.1 The name states the subject and the property.**
> The thing we're testing is `basis_as_of_date` so it's the subject of the name. e.g. `test_basis_as_of_date_falls_between_first_and_last_terms`

> Better name: `it('prefers actual over forecast when both are available')`

> I think we're saying "an `as_of_date` for a non-existent dataset should raise an error" ... and if so, we should say that vs. "`for_no_dataset`" and "`is_caught`".

**4.2 Tautologies.** An assertion that restates its input, or compares a value against the thing that produced it.
> This is a tautology, which makes it a useless assertion. Drop it.

**4.3 Tests that prove a change happened.** Review covers that; the test is permanent cost for a one-time fact.
> Drop this whole test. We don't need to continually prove and reprove that this change happened; that's what the review is here for.

**4.4 Coupling to an arbitrary value.** Assert the property that made the value interesting.
> We should instead assert that it's not before the end of the first term or after the start of the last term in the dataset. That guarantees it's bracketed in an interesting way vs. not bracketed or affecting only a small portion of the dataset.

**4.5 Tests asserting something the subject cannot know.** Apply the test:

> Can the thing under test know what is being asserted about it?

A model validates shape, so it can know a column is an integer and cannot know which dates the corpus chose. A schema can know a field is required and cannot know how many rows carry it. An assertion belongs to the layer that can know it; one that has drifted up or down a layer passes today by coincidence and fails the first time either layer moves independently.
> Badly named because this is an assertion that only applies to datasets with a `basis` column. [...] I wouldn't expect the model to fail validation as it doesn't (or shouldn't) know anything about the intended dates of the synthetic dataset.

**4.6 Comments inside tests carry the same rules as any other comment.**
> The "later boundary" part of the comment is unnecessary. We're testing awards. Enrollments aren't relevant. Drop it.

**4.7 Duplicate coverage.** Two tests asserting the same property in two files.

## 5. Docs and ADRs

**5.1 An ADR must be indexed and uniquely numbered.**
> This ADR is unindexed. Please add it to the index.

> Renumber this ADR to -0085 to avoid a conflict with PR #113 which already has -0082.

**5.2 Revise a corrected doc to read correctly for current state.** A reader should not have to hold the document and its corrections side by side and work out what is true now. Never append a dated correction or an errata block — ADRs included, which look append-only and are not. Keep history in the document only where the mistake itself is the lesson and someone would otherwise repeat it; the repository carries the rest.

**5.3 Vocabulary in docs follows the glossary.**

**5.4 A convention that other agents must follow must be documented in one of the places agents will look for it.** `AGENTS.md` for how work gets done here, `CONTEXT.md` for what the words mean, an ADR for a decision and the reasoning behind it, a docs page for detail too long to sit in any of them. Choose by what an agent needs at the moment it needs it: a rule every session must obey belongs where every session already reads, and a rule that binds only whoever touches one subsystem belongs beside that subsystem, referenced from the top rather than inlined there. A convention written nowhere gets violated; one written everywhere costs every agent context it had no use for.
> Do we have this as an ADR so that other agents know to update this list?

## 6. Messages people read

**6.1 User-facing errors are clear and understandable**, using plain English to explain the error as concisely and unambiguously as possible.
> Less technical error message, please. More like "we couldn't fetch the data."

**6.2 The product never references the development pipeline.**
> We should NEVER mention ADRs or other details of the development pipeline in the product.

**6.3 A failure message names the actual values involved**, looked up rather than assumed — see 1.4.

**6.4 Two errors with the same outcome are one error** unless the user needs to understand the difference.
> We should consider combining this with the above damaged env check/error message since the outcome is the same.

## 7. Code

**7.1 Use the helper that already exists.**
> Should use `state_has()` unless there's a good reason not to.

> Why doesn't this use `grant()` from above?

**7.2 Follow the language's idiom.**
> We're in Python ... why are we not triple quoting?

**7.3 Never edit a generated file.**
> Why are we editing the generated file that specifically says "DO NOT EDIT"? That seems a bit inane.

**7.4 A stated requirement that silently disappeared is a finding.**
> We specified that campuses (previously institutions) would have addresses. Please fix this.

**7.5 A value shipped to a consumer that the consumer should compute.** Apply the test:

> Which layer owns this value, and does anything downstream actually read it?

A window anchored on the current date, a display span, a threshold the UI applies — these belong where they are used, not baked into an artifact that then has to be regenerated when they change. Ask whether the value is emitted, whether anything consumes it, and why it is not derived at the point of use.
> It feels like something we should be pinning in the app (e.g. the window is anchored on current date) vs. pushing out as part of the database.

This is a different finding from the same line carrying a duplicated constant. Both can be true; the layer question is the one that survives deduplicating.

**7.6 Repo boundaries.** Where a project documents that some layer is authored in another repository and integrated here, a change made on the wrong side of that line is a finding however correct the change itself is — the next integration reverts it, silently and with nothing to conflict against.

**7.7 Unrelated churn** — a lockfile re-resolve, an alphabetical reorder, a whitespace or indentation-only change, a constraint relaxation with no data behind it — belongs in its own PR or in the PR body.

## 8. Review posture

**8.1 One finding per location**, line-anchored, with the comment written out.

**8.2 Propose the replacement.** A name, a rewrite, a derivation. Do not hand the author a category and ask them to solve it.

**8.3 Say what to do.** Not "consider whether", not "worth thinking about".

**8.4 Repetition is the point, where each instance needs a judgment.** The same defect at fourteen lines gets fourteen comments, because each one needs its own replacement text written. It reads as mechanical because it is.

**8.5 One finding for the whole set, where one command fixes it.** Where a single mechanical action resolves every instance — `pnpm format`, adding a trailing newline, a rename your editor can do — that is one finding: name the command, list the files it touches, and move on. Fourteen comments saying "add a newline" is noise that buries the findings around it.

The dividing line is whether you had to think about each instance. If the replacement text differs per line, they are separate findings. If it is the same action everywhere, it is one.

**8.6 A finding carries a posting target**, not only a location: the granularity it lands at, and — reviewing a stack — the layer it lands on. `SKILL.md` § *Where a finding goes* and § *Reviewing a stack* hold those rules, and this catalogue does not repeat them.
