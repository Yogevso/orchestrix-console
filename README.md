# Orchestrix Console

> A real-time operations console for orchestrating async workflows, analyzing system telemetry, and debugging incidents across distributed systems.

Turn backend infrastructure into a visual, interactive platform — from job execution to incident investigation.

---

## Why This Exists

Modern backend systems generate large volumes of jobs, events, and alerts — but debugging issues requires jumping between multiple tools.

Orchestrix Console provides a unified interface to:
- Monitor async workflows
- Analyze telemetry from system tools
- Investigate incidents with correlated data

It transforms backend infrastructure into a single, observable system.

## Key Highlights

- Real-time system observability across jobs, events, and alerts
- Incident debugging via correlated timelines (events + jobs + actions)
- Interactive analytics dashboards for operational insights
- Dark/light mode with system preference detection
- **9 design presets** — Midnight, Emerald, Rosé, Ocean, Amber, Monochrome, Cyberpunk, Nord, Dracula — each with unique border radius, sidebar style (solid/glass/bordered), font weight, and optional glow effects
- Live event streaming for real-time monitoring
- Command palette (`Ctrl+K`) for power-user navigation
- Keyboard-driven tables — `j`/`k` to navigate, `Enter` to open
- Sparkline activity charts per job row
- URL-synced filters (shareable filtered views)
- Time-range selector for observability-style filtering
- Toast notifications for action feedback
- Code-split routes for fast initial load

## Features

- **Authentication** — JWT-based login with auto-auth API interceptor and session persistence
- **Jobs Dashboard** — List, filter (status/type/source), retry, cancel, and inspect async jobs with pagination and sparkline activity charts
- **Events & Alerts** — Live event feed with severity coloring, real-time updates, time-range filtering, and multi-filter support
- **Analytics Dashboard** — Jobs over time, failure rate, events by severity with interactive Recharts visualizations
- **Audit Logs** — Track user and system actions with filtering by user/action
- **Incident Investigation** — Correlated timeline showing how events, jobs, alerts, and actions relate during an incident
- **Command Palette** — `Ctrl+K` to quickly navigate between any page
- **Keyboard Navigation** — `j`/`k`/`Enter` for table navigation without touching the mouse
- **URL-Synced Filters** — Filter state persists in the URL, making filtered views shareable
- **Toast Notifications** — Contextual feedback for job retry/cancel and other actions
- **Design Presets** — 9 visually distinct themes with dark/light variants, unique border radii, sidebar styles, and glow effects
- **404 Page** — Friendly not-found page with navigation back to dashboard

## Incident View

The Incident View correlates system behavior into a unified investigation timeline:

- Chronological event timeline
- Linked jobs and retries
- Severity-based visualization
- Root-cause summary

```
CPU spike → anomaly detected → job created → job failed → retry → success
```

Each step is visualized and connected, enabling fast debugging of complex system behavior.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Data Fetching | TanStack React Query |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |

## Architecture

```
React App (UI)
       │
       ▼
FastAPI (Orchestrix API)
       │
       ├─ PostgreSQL (jobs, events, incidents)
       ├─ Redis + Celery (async workers)
       └─ WebSocket (live event stream)
```

The frontend proxies `/api` requests to the backend (`localhost:8000`). Mock data is included for standalone demo.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and login with **admin / admin**.

## Project Structure

```
src/
├── api/            # API client, mock data, endpoint functions
├── components/     # AppLayout, CommandPalette, DesignPicker, Sparkline, TimeRangeSelector, shared UI
├── config/         # Design presets and visual style definitions
├── hooks/          # Auth, theme, live events, keyboard nav, URL filters, page titles, toasts
├── pages/          # All page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Jobs.tsx
│   ├── JobDetails.tsx
│   ├── Events.tsx
│   ├── Analytics.tsx
│   ├── AuditLogs.tsx
│   ├── IncidentView.tsx
│   └── NotFound.tsx
├── types/          # TypeScript interfaces
└── utils/          # Formatting, colors, helpers
```

## Design Principles

- Clear separation between data ingestion, processing, and visualization
- Consistent UI patterns across dashboards and views
- Real-time feedback for system state changes
- Focus on observability and debugging workflows
- Keyboard-first interactions for power users
- URL as source of truth for filter state

## License

MIT
