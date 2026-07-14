# Issue tracker: Linear

Issues, epics, and acceptance-criteria sub-issues for this repo live in **Linear**. Use the Linear MCP tools for all operations (search `mcp__claude_ai_Linear__*`; load schemas via ToolSearch as needed).

## Coordinates

The workflow uses **two trackers** — a product one and an engineering one (which may be the same Linear team for small setups):

- **Product** — team `<PRODUCT_TEAM>`, project `<PRODUCT_PROJECT>`, milestone `<PRODUCT_MILESTONE>` (optional). Holds the product epic and the **acceptance-criteria** sub-issues.
- **Engineering** — team `<ENG_TEAM>`, project `<ENG_PROJECT>`, milestone `<ENG_MILESTONE>` (optional). Holds the **implementation slices** and the **technical-acceptance** issues.

A skill should resolve these to IDs with `list_teams` / `list_projects` / `list_milestones` before creating issues.

## Routing — which tracker gets what

| Issue kind | Created by | Tracker | `ready-for-agent`? |
| --- | --- | --- | --- |
| Acceptance criteria (1 per Requirement) | `/prd-to-acceptance-issues` | **Product** | no |
| Implementation slices (vertical tracer bullets; each carries the technical acceptance criteria it covers) | `/to-issues` | **Engineering** | yes |

`/map-product-acceptance-to-issues` does not create issues — it records a **one-way** reference on each product acceptance-criterion issue pointing to the implementation work after which it's testable (see "One-way anchoring" below). Technical acceptance criteria are authored in the tech spec and folded into the slices above; they are not separate issues.

## Conventions

- **Create an issue**: `save_issue` with `team` (and `project`) set, plus `title` and `description` (Markdown — use literal newlines, not `\n` escapes).
- **Create a sub-issue**: `save_issue` with `parentId` set to the parent issue's identifier (e.g. `MEY-12`). This is how acceptance-criteria sub-issues hang under a product epic.
- **Read an issue**: `get_issue` by ID/identifier; `list_comments` for its discussion.
- **List issues**: `list_issues` filtered by `team`, `project`, `parentId`, `state`, or `query`.
- **Comment**: `save_comment`.
- **Labels / state**: pass `labels` and `state` to `save_issue`.
- **Link a document** (e.g. a PRD or tech spec): pass `links: [{url, title}]` to `save_issue` (append-only).

## Epics and sub-issues

A **product epic** is a regular Linear issue used as the parent. The PRD links from it (via `links`), and acceptance-criteria sub-issues are created under it with `parentId`. **The Linear issue ID of each sub-issue is the stable criterion ID** — capture the returned IDs.

## One-way anchoring (acceptance criterion → implementation)

`/map-product-acceptance-to-issues` must reference implementation work from an acceptance-criterion issue **without** the reference surfacing on the implementation side — the implementing agent is fenced from acceptance tests.

- **Do** record the anchor on the **criterion issue** as a **link attachment** to the implementation issue/epic/milestone URL: `links: [{url, title}]` on `save_issue`. A link attachment lives only on the issue it's added to.
- **Do not** use a relation (`relatedTo`, `blocks`/`blockedBy`, parent/sub) between the criterion and the implementation work — Linear relations are symmetric and appear on **both** issues.
- **Do not** set the criterion's `milestone` or `parentId` to the implementation milestone/epic — that would file the criterion under implementation, where the implementing agent would see it.
- Write **nothing** to the implementation issue/epic/milestone.

> Verify before relying on this: confirm Linear does not auto-create a backlink/mention on the target issue when a link attachment points at another Linear issue's URL. If it does, anchor to a non-issue locator (e.g. the milestone's URL, or a plain identifier in the criterion's body) instead.

## Triage labels

This flow does **not** apply the `ready-for-agent` label — PRDs and tech specs enter human review, and implementation issues are minted later by `/to-issues`. If this repo also runs the Pocock triage skills, their label vocabulary lives in `docs/agents/triage-labels.md`.

## When a skill says "publish to the issue tracker"

Create a Linear issue (or sub-issue, if it belongs under an epic) in the team/project above.

## When a skill says "fetch the relevant ticket"

Run `get_issue` with the issue identifier.
