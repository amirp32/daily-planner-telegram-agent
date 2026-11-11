# Engineering case study

## Problem
Daily plans begin as informal messages and are easily separated from follow-up status. The implementation connects text interpretation to a small persistent task model, then reports progress from that model.

## My role and scope
I implemented and troubleshot the supplied AI Lab educational workflow in my n8n environment. I configured Telegram/model access and Data Tables, followed the payload through individual nodes, and corrected the table-schema mismatch that prevented task insertion.

The original workflow architecture and JavaScript are the educational starter. This portfolio package adds documentation, a logic-test harness and an evaluation plan; no source workflow feature has been newly implemented here.

## A concrete debugging example
**Symptom:** No Telegram response and no task rows.

**Evidence:** The execution stopped at `Save tasks` with `unknown column name 'priority'`. Earlier nodes showed that Telegram text had been received, the model returned two tasks, and the task splitter produced correctly shaped rows.

**Resolution:** Align the selected Data Table and exact column names with the write payload, then test the write once with valid input.

**Observed outcome:** The user reported that the table updated and the Telegram reply arrived.

**Lesson:** Verify every boundary: external response, transformed item, routed branch, database schema and final reply. A successful AI call does not imply a successful automation.

## Design choices worth explaining in an interview
- Persistent memory is a task table, not a claim that the model remembers past conversations.
- The LLM chooses among four bounded actions; parsing code checks the action, sanitizes task fields and filters completion IDs.
- KPI arithmetic is calculated in JavaScript. The model produces coaching language from those numbers.
- A one-minute poll avoids requiring an inbound public webhook, at the cost of polling latency and execution overhead.
- Always Output Data on table-read nodes allows reporting and planning when there are no existing tasks.

## Tradeoffs discovered in review
Acknowledgment happens before persistence, so downstream errors can lose work. Batching joins messages and forces a single action. No durable idempotency key protects against retries or duplicates. These are clear next steps, not completed reliability features.

## Business relevance
The same pattern can support internal request capture, follow-up tracking and operational summaries. Adapting it for a company would require access control, privacy decisions, monitoring, retry behavior, and evaluation against representative examples.

## Claims to avoid
Do not claim production readiness, measured time savings, multi-user support, 100% reliability, or independently authored starter code. No such evidence is included.

