# Document Locations

Where each product-development document is **created** and **found**. The M4H product-definition skills read this file instead of hardcoding destinations.

Edit the values in each row to match this repo. Skills should treat the **Location** column as the source of truth.

| Document | Created / found at | Linked from | Notes |
| --- | --- | --- | --- |
| **PRD** | Google Docs — Drive folder `<DRIVE_FOLDER_OR_URL>` | the product epic | Product/UX PRD. No `ready-for-agent` label — enters product review. Written by `/create-prd-from-convo`. |
| **Tech spec** | Google Docs — Drive folder `<DRIVE_FOLDER_OR_URL>` | the product epic | Technical-design output. Enters technical review; `/to-tickets` mints the `ready-for-agent` implementation issues downstream. Written by `/create-tech-spec-from-convo`. |
| **Acceptance criteria** | authored in the PRD (Acceptance Criteria section), then published as Linear sub-issues under the product epic | the PRD (by Linear ID, written back) | One sub-issue per Requirement. The Linear issue ID is the stable criterion ID. Authored by `/defining-acceptance-criteria` (as PRD text); published as issues by the acceptance-criteria → issues step. See `issue-tracker.md` for how. |
| **Product epic** | Linear — team `<LINEAR_TEAM>`, project `<LINEAR_PROJECT>` | — | The parent the PRD links to and the criteria sub-issues hang under. |

## Conventions

- **PRD and tech spec → Google Docs**, each linked from the product epic. Neither carries the `ready-for-agent` label; that label belongs to implementation issues minted later by `/to-tickets`.
- **Acceptance criteria** are authored as a section of the PRD, then published as Linear sub-issues of the product epic in a separate step. Once published, Linear is the source of truth for tracking; the PRD's criteria carry their Linear IDs.
- If a document type's location is blank, the relevant skill should stop and ask rather than guess.

## When a skill says "publish the PRD"

Create a Google Doc in the PRD folder above and link it from the product epic.

## When a skill says "publish the tech spec"

Create a Google Doc in the tech-spec folder above and link it from the product epic.

## When a skill says "publish the acceptance criteria"

Read the PRD's Acceptance Criteria section and create one Linear sub-issue per Requirement under the product epic, following `issue-tracker.md`. Write each returned Linear ID back into the PRD next to its Requirement. (The Acceptance Criteria form is owned by `/defining-acceptance-criteria`.)
