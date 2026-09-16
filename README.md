# Agent Company Map

An interactive map of an AI-run company: a central knowledge base ("Company
Brain") with 7 departments branching off it, each containing the agents that
make up its workflow. Click a department to expand its agents; click an agent
to see its role and the skill (prompt) it runs.

Departments: Sales, Deals, Marketing, Operations, Intelligence, Customer, and
Back Office — each modeled as a chain of narrow, composable agent skills
rather than one do-everything bot.

## Screenshots

| Overview | Department expanded | Agent detail |
| --- | --- | --- |
| ![Overview of the map, showing the Company Brain at the center with 7 department nodes around it](docs/screenshots/overview.png) | ![Sales department expanded into its 10 agent nodes](docs/screenshots/department-expanded.png) | ![Detail panel for the Lead Scoring agent, showing its role and skill prompt](docs/screenshots/agent-detail.png) |

## Structure

- `src/data/company.ts` — the data model: departments and their agents, each
  agent with a `role` and a `skill` (the prompt/runbook it executes). This is
  the file to edit to add departments or agents.
- `src/App.tsx` — renders the radial map (SVG) and the detail panel.

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
