# LinkedIn publishing drafts

Replace GITHUB_REPOSITORY_URL with your actual repository URL before posting. These drafts credit the educational starting point and do not claim unverified reliability or business impact.

## Post
🤖 Turning a Persian message into a structured daily plan—with n8n and Telegram.

I implemented and troubleshot a Daily Planner workflow based on an AI Lab educational template by Nima Amini.

The workflow connects:
💬 Telegram messages
🧠 LLM-based intent and task extraction
🗂️ Persistent task storage in n8n Data Tables
✅ Task completion updates
📊 Daily KPIs calculated in JavaScript
🧭 Short AI-generated coaching suggestions

One practical challenge was a failed database write: the AI returned valid tasks, but a missing “priority” column stopped the workflow. Tracing the execution node by node helped me fix the schema mapping and get task storage and Telegram replies working.

I have also prepared offline tests for the embedded JavaScript and documented the system's limits, including early message acknowledgment and duplicate-task handling.

This project helped me practise API integration, workflow debugging, structured model outputs and persistent state management.

🎬 The attached demo shows the Telegram interaction, including completion updates, clarification and KPI reports.

🔗 Code and documentation: GITHUB_REPOSITORY_URL

I’m interested in junior Python/AI application and workflow automation opportunities where I can apply these skills to practical business processes.

#n8n #WorkflowAutomation #AI #JavaScript #APIIntegration

## LinkedIn project fields
Project name:
Daily Planner — Telegram AI Workflow

Description:
Implemented and troubleshot a Persian-language Telegram planning assistant using n8n, an OpenRouter-compatible model API, JavaScript and Data Tables. Based on an AI Lab educational template, the workflow extracts tasks, updates completion status and computes daily KPIs in code. Added setup documentation, an engineering case study and offline logic tests. Diagnosed a task-table schema mismatch that blocked persistence and Telegram replies.

Skills:
Workflow Automation; API Integration; n8n; JavaScript; Prompt Engineering

Media:
Link to the GitHub repository. After recording, attach the demo post or video showing task creation, a completion update and a report.

Start date:
Use your actual start month. The chat contains a successful task-creation report from November 2026, but that does not independently establish when you began.

## GitHub metadata
Repository name: daily-planner-telegram-agent

Description:
Persian Telegram planning assistant built with n8n, JavaScript and an LLM API, featuring persistent tasks, validated action routing and code-calculated daily KPIs.

Topics:
n8n, workflow-automation, telegram-bot, javascript, ai, task-management, llm, productivity

