# Validation status

Checked on 2026-11-11 with Node.js v24.22.1.

## Completed locally
- **16 offline tests passed; 0 failed**, using `npm test`.
- Tests execute the supplied workflow's embedded JavaScript rather than a rewritten implementation.
- Workflow graph references and unique node names checked.
- Empty Telegram batches and owner-chat filtering checked with synthetic inputs.
- Model-output field bounds, fallback actions and today's-ID restriction checked.
- Task and completion item shape checked.
- Deterministic KPI arithmetic, empty table handling, capacity fit and coach-error fallback checked.
- Workflow source is byte-identical to the supplied educational JSON; no feature changes are claimed.

## Previously reported by the user
Task rows were inserted and a Telegram confirmation arrived after the Data Table schema issue was resolved. The package now includes four workflow screenshots and a 41-second Daily Planner Telegram recording. Sampled frames show task confirmations, completion acknowledgments, ambiguity handling, reports and a refusal to mark all tasks complete blindly. The recording does not show the corresponding database rows or execution logs, so persistence and numerical correctness are not independently established by the video. Audio was not assessed.

## Not verified here
- Import and full execution in a particular n8n version.
- Live Telegram delivery, owner-ID setup and polling behavior.
- Live model accuracy or endpoint availability.
- Actual Data Table insert/update compatibility and permissions.
- Morning/evening trigger execution, failure recovery and overlapping runs.
- Production deployment, load performance, privacy compliance or business impact.

The test harness mocks the n8n `$`, `$input` and `$now` interfaces. It cannot prove that the source workflow runs unchanged in a real instance. The fixed timestamp is a fixture, not a timezone integration test.

## Known issues retained
Early update acknowledgment, no durable deduplication, one action per joined batch, and model replies that may differ from normalized data. These are documented limitations, not fixed features.
