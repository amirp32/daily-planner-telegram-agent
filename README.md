# Daily Planner — Telegram AI Workflow
**Turn everyday Persian messages into structured tasks, completion updates, and daily KPI reports.**

A single-user planning assistant implemented with **n8n, Telegram, an OpenRouter-compatible chat API, JavaScript, and n8n Data Tables**. It combines language-model interpretation with explicit action routing, persistent task state, and deterministic reporting.

## Demo and workflow screenshots

[Watch or download the Telegram demo (41 seconds)](docs/media/daily-planner-demo.mp4)

The user-supplied recording shows Telegram conversation history: task confirmations, completion acknowledgments, a clarification for an ambiguous request, and KPI reports. It also shows refusal to mark all tasks complete without identifying completed work. This is a recording of the interface, not a synchronized database or execution trace.

![Full Daily Planner workflow](docs/media/workflow-overview.png)

<details>
<summary>Explore the workflow stages</summary>

### Message intake
![Telegram polling and message routing](docs/media/workflow-input.png)

### Interpretation and validation
![Task retrieval, prompt construction and decision parsing](docs/media/workflow-decision.png)

### Task persistence and completion
![Task creation and completion update branches](docs/media/workflow-actions.png)

</details>

## Why this project matters
People describe work informally: “I need to send the sales report and exercise for an hour.” This workflow converts that message into task records, retrieves those records for follow-up conversations, and calculates progress from stored data.

It demonstrates a reusable automation pattern: **unstructured input → validated decision → bounded database action → measurable output**.

## My implementation work
I configured and troubleshot an educational starter workflow in n8n, connected Telegram and the model API, and aligned the task-table schema with workflow mappings. During testing, I traced execution paths and node outputs to diagnose missing messages, empty intermediate results, and an `unknown column name 'priority'` validation error.

A task-creation run was reported successful: two tasks were saved and a Telegram confirmation arrived. That observation does not establish that every action and scheduled branch has been tested.

The original workflow and learning material are by **AI Lab / Nima Amini**. This repository documents my implementation experience and adds setup instructions, an architecture explanation, a failure analysis, offline logic tests, and a repeatable demo plan. It does not claim original authorship of the starter. See [project provenance](SOURCES.md).

## Capabilities in the supplied workflow
| Capability | Behavior |
| --- | --- |
| Natural-language task capture | Extracts titles, priorities, and estimated minutes from Persian text |
| Persistent task state | Stores daily tasks in a `tasks` Data Table |
| Completion updates | Restricts proposed completion IDs to tasks retrieved for today |
| Daily reporting | Calculates task completion, weighted score, and capacity fit in JavaScript |
| Coaching | Requests three short Persian observations from the KPI JSON |
| Morning check-in | Lists unfinished tasks from yesterday; does not automatically copy them |
| Scheduled reporting | Morning at 08:30 and evening at 21:30 in the configured Tehran timezone |
| Owner-chat filtering | Processes messages matching `my_chat_id` after configuration |
| Fallback replies | Handles malformed model JSON and API error responses in parsing code |

The workflow polls Telegram every minute. Response latency also includes API and execution time; it is not an instant-response guarantee.

## Architecture
```mermaid
flowchart TD
    T["Telegram polling"] --> D["Interpret and validate"]
    M["Morning schedule"] --> U["Unfinished task reminder"]
    E["Evening schedule"] --> K["KPI and coaching"]
    D --> A["Route action"]
    A --> S["Insert or update tasks"]
    A --> K
    A --> R["Telegram reply"]
    S --> R
    K --> R
    U --> R
```
Today's stored tasks are read before interpretation. The four allowed decisions are `add_tasks`, `mark_done`, `report`, and `chat`. The workflow uses explicit routing; it is not an unrestricted autonomous tool-calling agent.

## Quick start
1. Import [daily-planner-agent.json](daily-planner-agent.json) into an n8n instance that supports the included node versions and Data Tables.
2. Create a table named `tasks` in the same project, using the schema below.
3. Configure the Telegram token and owner chat ID in `Config`.
4. Create a Header Auth credential with `Authorization: Bearer YOUR_OPENROUTER_API_KEY`, and select it in both `AI brain` and `AI coach`.
5. Confirm the model setting, timezone, and table references, then save and publish/activate the workflow.
6. Test with a fresh Telegram message and inspect the corresponding execution and table rows.

See [setup and troubleshooting](docs/SETUP.md), including the first-run chat-ID discovery behavior. The workflow runs only while its n8n host is available.

### Task-table schema
| Column | Type | Example |
| --- | --- | --- |
| date | String | 2026-11-11 |
| title | String | ارسال گزارش فروش |
| priority | String | high / medium / low |
| estimate_min | Number | 60 |
| status | String | todo / done |
| done_at | String | Empty initially; formatted completion timestamp later |

Use n8n's generated row `id`; do not create a second custom ID column. A source export is not a database backup: table schema and rows must be configured separately.

## Reporting: what the numbers mean
| Metric | Calculation |
| --- | --- |
| Completion rate | Completed task count / total task count × 100 |
| High-priority completion | Completed high-priority tasks / all high-priority tasks × 100 |
| Weighted day score | Completed priority weights / all priority weights × 100; high=3, medium=2, low=1 |
| Planned minutes | Sum of task estimates |
| Completed-task minutes | Sum of estimates for completed tasks |
| Capacity fit | min(planned minutes, daily capacity) / planned minutes × 100 |

The source names capacity fit `planning_accuracy`; it measures planned workload against capacity, **not estimation accuracy**. Completed-task minutes are estimates, **not tracked working time**. Empty-denominator behavior is documented in the tests. The default capacity is 360 minutes.

## Validation
Run the dependency-free checks with Node.js 20 or later:
```bash
npm test
```
Tests execute the JavaScript extracted directly from the workflow against synthetic n8n-style inputs. They cover message filtering, parsing boundaries, task splitting, KPI arithmetic, and reporting fallbacks. They do not execute n8n, contact Telegram/OpenRouter, or verify Data Table compatibility.

See [validation status](docs/VALIDATION.md), [manual test scenarios](docs/DEMO.md), and [engineering case study](docs/CASE_STUDY.md).

## Known limits
- This export is the supplied educational template, not a fresh export of the user's configured running instance. Credentials are placeholders and no live services were called for this package.
- Updates are acknowledged **before** AI interpretation and persistence. A downstream failure may consume a message without saving its tasks.
- Several messages in a polling batch are joined into one prompt. Mixed requests are forced into one action; duplicate messages can create duplicate tasks.
- There is no durable deduplication, transactional write-and-reply operation, retry queue, or multi-user isolation.
- Task completion is limited to today's retrieved IDs. There is no edit/delete action or weekly report.
- The model's reply is not recomputed after field normalization; it may describe details that differ from the validated payload.
- HTTP error payloads have fallbacks, but network timeouts may stop execution before those fallbacks.
- Owner-chat filtering is not an application authentication system. Empty-ID setup mode can reply with the first sender's chat ID; set the intended owner ID before leaving it running.
- The Telegram token is configured inside the workflow. Keep a clean public export and avoid exposing configured tokens or execution data.

## Next engineering improvements
Add durable update tracking and replay, deduplicate task creation, process separate messages independently, make timezones configurable in one place, and add live integration checks with a documented n8n version.

## Repository contents
| Path | Purpose |
| --- | --- |
| `daily-planner-agent.json` | Original importable workflow, copied without functional changes |
| `tests/workflow.test.mjs` | Offline tests of embedded JavaScript |
| `docs/SETUP.md` | Configuration, schema, and troubleshooting |
| `docs/CASE_STUDY.md` | Implementation story and engineering tradeoffs |
| `docs/DEMO.md` | Demo recording and manual evaluation plan |
| `docs/LINKEDIN.md` | Post and LinkedIn project-field drafts |
| `docs/VALIDATION.md` | Verified scope and outstanding checks |

No real credentials, task-table export, or original course PDF are bundled. The demo video contains user-supplied Telegram conversation history. No upstream license was supplied, so this package does not grant a new license for the educational workflow. Retain attribution and establish the applicable redistribution terms before publishing that source.

