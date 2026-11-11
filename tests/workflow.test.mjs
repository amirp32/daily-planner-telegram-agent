import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = JSON.parse(readFileSync(new URL('../daily-planner-agent.json', import.meta.url), 'utf8'));
const cfg = { my_chat_id: '1001', today: '2026-11-11', yesterday: '2026-11-10',
  model: 'offline-fixture', daily_capacity_min: 360 };
const item = json => ({ json });
const rows = [
  { id: 1, date: cfg.today, title: 'Report', priority: 'high', estimate_min: 60, status: 'todo' },
  { id: 2, date: cfg.today, title: 'Exercise', priority: 'medium', estimate_min: 30, status: 'done' }
];
function run(name, input = [], refs = {}) {
  const node = workflow.nodes.find(n => n.name === name);
  assert.ok(node?.parameters.jsCode, 'Missing Code node: ' + name);
  const lookup = n => {
    const values = n === 'Config' ? [cfg] : (refs[n] || []);
    return { first: () => item(values[0]), all: () => values.map(item) };
  };
  const $input = { first: () => item(input[0]), all: () => input.map(item) };
  const $now = { setZone: () => ({ toFormat: () => '2026-11-11 14:20' }) };
  return new Function('$', '$input', '$now', node.parameters.jsCode)(lookup, $input, $now);
}
const response = decision => ({ choices: [{ message: { content: JSON.stringify(decision) } }] });
const parse = decision => run('Parse decision', [response(decision)], { 'Get today tasks': rows })[0].json;

test('workflow has valid unique nodes, connected targets and Tehran timezone', () => {
  const names = workflow.nodes.map(n => n.name);
  assert.equal(new Set(names).size, names.length);
  assert.equal(workflow.settings.timezone, 'Asia/Tehran');
  for (const [source, branches] of Object.entries(workflow.connections)) {
    assert.ok(names.includes(source));
    for (const branch of branches.main) for (const edge of branch) assert.ok(names.includes(edge.node));
  }
  for (const name of ['Get today tasks', 'Get tasks for report', 'Get yesterday open tasks'])
    assert.equal(workflow.nodes.find(n => n.name === name).alwaysOutputData, true);
});
test('empty Telegram batch stops without producing an AI input', () => {
  assert.deepEqual(run('Read messages', [{ result: [] }]), []);
});
test('owner filter ignores other chats while offset covers the full batch', () => {
  const updates = [
    { update_id: 10, message: { chat: { id: 1001 }, text: 'exercise' } },
    { update_id: 11, message: { chat: { id: 2002 }, text: 'other user' } }
  ];
  const r = run('Read messages', [{ result: updates }])[0].json;
  assert.equal(r.kind, 'message'); assert.equal(r.text, 'exercise'); assert.equal(r.next_offset, 12);
});
test('foreign-only updates produce no message action', () => {
  const r = run('Read messages', [{ result: [{ update_id: 5, message: { chat: { id: 9 }, text: 'hi' } }] }])[0].json;
  assert.equal(r.kind, 'none'); assert.equal(r.text, '');
});
test('prompt includes current task IDs and original user text', () => {
  const r = run('Build prompt', rows, { 'Read messages': [{ text: 'ورزش رو انجام دادم' }] })[0].json.body;
  assert.equal(r.messages[1].content, 'ورزش رو انجام دادم');
  assert.match(r.messages[0].content, /#2.*Exercise/);
  assert.match(r.messages[0].content, /360 minutes/);
});
test('task normalization bounds count, title, priority and minutes', () => {
  const r = parse({ action: 'add_tasks', tasks: [
    { title: '  '+ 'x'.repeat(220), priority: 'urgent', estimate_min: 9999 },
    { title: 'short', priority: 'low', estimate_min: -20 },
    { title: 'default', estimate_min: 'bad' },
    { title: ' ' },
    ...Array.from({ length: 20 }, () => ({ title: 'extra', estimate_min: 30 }))
  ] });
  assert.equal(r.tasks.length, 15); assert.equal(r.tasks[0].title.length, 200);
  assert.equal(r.tasks[0].priority, 'medium'); assert.equal(r.tasks[0].estimate_min, 480);
  assert.equal(r.tasks[1].estimate_min, 5); assert.equal(r.tasks[2].estimate_min, 30);
});
test('completion rejects IDs outside the currently retrieved task set', () => {
  const r = parse({ action: 'mark_done', done_ids: [999, '2'], reply: 'done' });
  assert.deepEqual(r.done_ids, [2]);
  const rejected = parse({ action: 'mark_done', done_ids: [999] });
  assert.equal(rejected.action, 'chat'); assert.deepEqual(rejected.done_ids, []);
});
test('unknown action and empty task request cannot route a write', () => {
  assert.equal(parse({ action: 'delete_all', tasks: [] }).action, 'chat');
  assert.equal(parse({ action: 'add_tasks', tasks: [] }).action, 'chat');
});
test('malformed AI text and API error payloads return chat fallbacks', () => {
  const refs = { 'Get today tasks': rows };
  const malformed = run('Parse decision', [{ choices: [{ message: { content: 'not JSON' } }] }], refs)[0].json;
  assert.equal(malformed.action, 'chat'); assert.deepEqual(malformed.tasks, []);
  const error = run('Parse decision', [{ error: { message: 'fixture quota failure' } }], refs)[0].json;
  assert.equal(error.action, 'chat'); assert.match(error.text, /fixture quota failure/);
});
test('task splitting produces dated todo rows rather than an AI response', () => {
  const r = run('Split tasks', [{ tasks: [{ title: 'Report', priority: 'high', estimate_min: 60 }] }]);
  assert.deepEqual(r[0].json, { date: cfg.today, title: 'Report', priority: 'high', estimate_min: 60, status: 'todo', done_at: '' });
});
test('completion splitting includes deterministic fixture timestamp', () => {
  assert.deepEqual(run('Split done ids', [{ done_ids: [2] }])[0].json,
    { id: 2, status: 'done', done_at: '2026-11-11 14:20' });
});
test('KPI arithmetic uses task estimates and priority weights', () => {
  const r = run('Calculate KPI', rows)[0].json.kpi;
  assert.equal(r.completion_rate, 50); assert.equal(r.day_score, 40);
  assert.equal(r.high_priority_rate, 0); assert.equal(r.planned_min, 90);
  assert.equal(r.done_min, 30); assert.equal(r.planning_accuracy, 100);
  assert.deepEqual(r.open_tasks, ['Report']);
});
test('capacity fit detects overplanning without measuring actual work', () => {
  const r = run('Calculate KPI', [{ ...rows[0], estimate_min: '480' }])[0].json.kpi;
  assert.equal(r.planning_accuracy, 75); assert.equal(r.done_min, 0);
});
test('empty table produces no-task report and explicit undefined ratios', () => {
  const r = run('Calculate KPI', [{}])[0].json;
  assert.equal(r.kpi.total_tasks, 0); assert.equal(r.kpi.day_score, 0);
  assert.equal(r.kpi.planning_accuracy, null); assert.equal(r.kpi.high_priority_rate, null);
  assert.ok(r.text.length > 0);
});
test('report retains calculated text when coach returns an API error', () => {
  const base = run('Calculate KPI', rows)[0].json;
  const r = run('Compose report', [{ error: { message: 'fixture only' } }], { 'Calculate KPI': [base] });
  assert.equal(r[0].json.text, base.text);
});
test('morning reminder lists open tasks without emitting insert records', () => {
  const r = run('Morning message', [rows[0]]);
  assert.equal(r.length, 1); assert.match(r[0].json.text, /Report/);
  assert.deepEqual(Object.keys(r[0].json), ['text']);
});

