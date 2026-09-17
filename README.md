# Agent Company Map

An interactive map of an AI-run company: a central knowledge base ("Company
Brain") with 7 departments branching off it, each containing the agents that
make up its workflow. Click a department to expand its agents; click an agent
to see its role and the skill (prompt) it runs.

Departments: Sales, Deals, Marketing, Operations, Intelligence, Customer, and
Back Office — each modeled as a chain of narrow, composable agent skills
rather than one do-everything bot.

Two more things you can do beyond browsing the map:

- **Chat with a team lead or the Orchestrator.** Select the Company Brain
  (the Orchestrator) or any department and a chat box appears. Describe what
  you need in plain language; the Orchestrator figures out which department
  owns it and routes it, a department lead picks the right agent on its own
  team. This runs entirely client-side via lightweight keyword matching
  (`src/lib/orchestrate.ts`) — there's no LLM wired in, so treat it as a
  routing simulation, not a real assistant.
- **Watch tasks progress.** Every routed request becomes a task with a
  simulated progress bar, visible on the **Tasks** tab, ticking up over a few
  seconds until it completes.

## Screenshots

| Overview | Department expanded | Agent detail |
| --- | --- | --- |
| ![Overview of the map, showing the Company Brain at the center with 7 department nodes around it](docs/screenshots/overview.png) | ![Sales department expanded into its 10 agent nodes](docs/screenshots/department-expanded.png) | ![Detail panel for the Lead Scoring agent, showing its role and skill prompt](docs/screenshots/agent-detail.png) |

| Chat with the Orchestrator | Tasks progress |
| --- | --- |
| ![Chat panel with the Orchestrator, routing a newsletter request to the Marketing team](docs/screenshots/chat.png) | ![Tasks tab showing two running tasks with progress bars, one from a direct department request and one routed by the Orchestrator](docs/screenshots/tasks.png) |

## Structure

- `src/data/company.ts` — the data model: departments and their agents, each
  agent with a `role` and a `skill` (the prompt/runbook it executes). This is
  the file to edit to add departments or agents.
- `src/lib/orchestrate.ts` — simulated routing: matches a chat message to a
  department/agent by keyword overlap and produces a reply plus a task.
- `src/components/ChatPanel.tsx` — the chat UI for talking to a team lead or
  the Orchestrator.
- `src/components/TasksBoard.tsx` — the live task-progress board.
- `src/App.tsx` — renders the radial map (SVG), the detail/chat panel, and
  the Map/Tasks tab switcher.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```
