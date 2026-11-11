# Setup and troubleshooting

## Requirements
An available n8n host with Data Tables and the node versions used in the JSON; a Telegram bot created through BotFather; outbound access to Telegram and the model provider; an OpenRouter API key or a compatible endpoint with matching authentication. The package does not pin or test a complete n8n environment.

Node.js 20+ is needed only for the included offline tests if using an existing hosted n8n instance. No npm dependencies are required by the test harness.

## Configure
1. In n8n create a workflow, open the workflow menu, and choose **Import from File**. Select `daily-planner-agent.json`.
2. In the same n8n project create a Data Table named `tasks`. Add `date`, `title`, `priority`, `status`, and `done_at` as String columns, and `estimate_min` as Number. n8n manages its system ID and timestamps.
3. Open every Data Table node and confirm it points to the intended table. Resolve import-time table references or column mappings before testing.
4. Open `Config` and set `bot_token` and `my_chat_id`. Keep `my_chat_id` as a string. Set `daily_capacity_min` to a positive number; default 360.
5. If you do not know your ID, the source supports temporary setup mode with an empty `my_chat_id`. Send the bot a private text message and run the polling path. It replies with the first text sender's chat ID. Enter the intended ID immediately. Disable the workflow while configuring if others might message the bot.
6. Create a generic Header Auth credential: header name `Authorization`, value `Bearer YOUR_API_KEY`. Select it in **both** `AI brain` and `AI coach`. No key is bundled.
7. The supplied model is `openrouter/free`; availability, provider selection, quotas and cost depend on your account and current provider offering. Do not assume unlimited or permanently free service.
8. Keep workflow timezone `Asia/Tehran` for the supplied setup. Daily schedules are 08:30 and 21:30; the date/timestamp expressions also hardcode Tehran. Change all of these together if adapting the timezone.
9. Save and publish/activate the workflow using your n8n version's controls. Keep the host running.

## First live test
Use a private demo bot and a separate empty demo table. Send:
> امروز باید گزارش فروش رو بفرستم و نیم ساعت ورزش کنم

Wait for the next poll and execution. Inspect:
- `Get updates`: the new text appears under `result`.
- `Read messages`: `kind=message` and your text.
- `Parse decision`: `action=add_tasks` and two tasks.
- `Split tasks`: one item for each task.
- `Save tasks`: two stored rows with `status=todo`.
- Telegram: one confirmation after the write.

Then test completion and reporting using docs/DEMO.md. A model-generated “saved” response alone is not proof of persistence; check the table.

## Troubleshooting
| Symptom | What to inspect |
| --- | --- |
| No scheduled execution | Publication/activation state, host availability, schedule timezone |
| Node was not executed | Selected trigger and Switch branch; use the polling trigger for message tests |
| `result: []` in Get updates | No pending message, another poller, or a previously acknowledged update |
| `result: []` in Confirm updates | Can be normal after advancing the offset; inspect Read messages for the text |
| No output in Read messages | An empty update batch intentionally returns no items; do not force a blank AI request |
| No tasks today | Read nodes use Always Output Data so downstream code can handle an empty table |
| Unknown column `priority` | Exact column spelling and selected table; refresh mapping and verify all six fields |
| Model fails | Authentication, endpoint, model availability, error payload; inspect AI brain output |
| Rows saved but no reply | Reply text node, Send to Telegram payload, target chat and execution errors |
| Duplicate tasks | Repeated messages or repeated manual execution of insert nodes; no deduplication exists |

Only one consumer should poll the demo bot during testing. Telegram's getUpdates cannot be used while an outgoing webhook is configured; diagnose the bot's existing integration before changing it. Calling getUpdates with an offset greater than an update ID acknowledges that update.

## Publish a clean export
The supplied JSON contains a token placeholder, empty owner ID, generic credential names and no pinned execution data. After configuring your own copy, do not upload it unchanged. Restore placeholders, remove personal data, inspect all HTTP headers and URLs, and confirm that no live secret is in the export.

