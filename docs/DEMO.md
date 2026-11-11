# Demo and manual evaluation

## Included recording
[Telegram conversation recording](media/daily-planner-demo.mp4) — 41.14 seconds, 980 × 560, supplied by the user. The original recording is included without editing. Four workflow screenshots are in the same media folder. This visual evidence does not change the not-run statuses of the controlled manual tests below.


## Record a 60–90 second walkthrough
Use synthetic tasks and a separate test table. Hide tokens, API keys, personal chat identifiers and unrelated messages.

| Segment | Show | What it proves |
| --- | --- | --- |
| 0–10 sec | Workflow overview, briefly | Integration architecture |
| 10–30 sec | Send a Persian two-task request; show the reply and two rows | Text becomes persistent structured data |
| 30–45 sec | Say one task is complete; show status and done_at | Follow-up changes the intended record |
| 45–65 sec | Ask for a report; show computed values and coaching | Reporting uses stored state |
| 65–90 sec | Show Parse decision and one offline test run | Validation and engineering reasoning |

Polling can take about a minute before processing begins. Cut waiting time and label the cut; do not present an edited demo as real-time latency. If a branch fails, record it as a failure rather than describing it as working.

## Repeatable fixture
Start with an empty table and today's date. Send:
> امروز باید گزارش فروش رو تا ظهر بفرستم و نیم ساعت ورزش کنم

Expected: two rows; report high priority, exercise estimate 30. The report estimate may vary by model and must be read from the actual row.

Then send:
> ورزش رو انجام دادم

Expected: only the exercise row changes to done and receives done_at.

Then send:
> گزارش

If priorities are high and medium, expected completion rate is 50% and weighted score is 40%. Completed-task minutes should be 30. Planned minutes must equal the sum of the stored estimates, not an invented fixed total.

## Manual checklist — not executed for this package
| ID | Scenario | Expected evidence | Status |
| --- | --- | --- | --- |
| M01 | Two-task capture | Two rows and one confirmation | Not run here |
| M02 | Mark one known task done | Correct row and timestamp | Not run here |
| M03 | Empty-table report | Explicit no-tasks message | Not run here |
| M04 | Ambiguous completion | Clarifying reply; no unintended row update | Not run here |
| M05 | Different configured chat | No task rows or reply for that chat | Not run here |
| M06 | Invalid model response | Fallback reply; no write | Not run here |
| M07 | Morning reminder | Yesterday's open titles listed, no automatic copy | Not run here |
| M08 | Evening report | Scheduled execution at configured time | Not run here |
| M09 | Repeat same message | Observe duplicate behavior and record limitation | Not run here |
| M10 | Mixed add+done batch | Observe single-action limitation | Not run here |

Record n8n version, model/provider, date, execution outcome, row changes and actual reply for every test. Replace statuses only after observing the result.

