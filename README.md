# FlexLoad Monitor

FlexLoad Monitor is a fictional portfolio/demo dashboard for visualizing synthetic
energy and load data across fictional city districts.

It monitors generated load, photovoltaic generation, heat pump usage, and EV
charging activity through a Phoenix/Inertia application with a Vue 3 dashboard.
The project is intentionally demo-only: it does not use real operational data,
real locations, real companies, or production infrastructure integrations.

## Project Purpose

FlexLoad Monitor exists to explore how complex operational-style data can be
transformed into a clear, accessible dashboard UI. The application uses
synthetic district data to model the kind of information an operator might need
to scan quickly: current demand, local generation, flexible load activity,
district status, map context, and recent alerts.

The goal is not to clone a real product or imply production readiness. The goal
is to demonstrate maintainable Phoenix/Inertia data flow, typed frontend
boundaries, dashboard composition, charts, maps, and accessibility-aware UI
patterns in a compact project.

## Feature Overview

- KPI cards for aggregate synthetic load, PV generation, heat pump usage, EV
  charging activity, and district status counts.
- Synthetic district data for fictional city districts.
- Recent alert preview/list with severity and acknowledgement state.
- Load trend chart for synthetic aggregate demand and PV output.
- District map with schematic fictional coordinates.
- Status filtering for district map data.
- Selected district detail panel.
- Phoenix-provided Inertia props for the dashboard page.
- Backend contract test covering the documented dashboard prop shape.
- Frontend type-level prop fixture included in TypeScript typechecking.

## Tech Stack

- Elixir / Phoenix
- Inertia.js
- Vue 3
- TypeScript
- Tailwind CSS
- Apache ECharts
- Leaflet
- PostgreSQL
- Mix / npm

## Architecture Overview

Dashboard data starts in `FlexloadMonitor.Energy`, which generates synthetic
districts, hourly measurements, alerts, and aggregate KPIs. The Phoenix
`FlexloadMonitorWeb.PageController.dashboard/2` action renders the Inertia
`Dashboard` page and passes `Energy.dashboard_data/0` as page props.

On the frontend, `assets/js/pages/Dashboard.ts` receives those props using
TypeScript domain types from `assets/js/domain/types.ts`. The page composes
dashboard components for KPIs, alerts, the load trend chart, district map,
status filters, and selected district details.

Data flow:

```text
FlexloadMonitor.Energy
  -> FlexloadMonitorWeb.PageController.dashboard/2
  -> Inertia Dashboard page props
  -> typed Vue dashboard page
  -> KPI, alert, chart, map, filter, and detail components
```

## Synthetic Data Disclaimer

All data in this project is fictional and synthetic. District names,
coordinates, measurements, alert messages, and KPI values are generated for the
demo and must not be interpreted as real customer, utility, grid, company, or
location data.

FlexLoad Monitor is not production software. It has no real infrastructure
integration, no live telemetry connection, and no operational decision-making
role.

## Synthetic Data Contract

The dashboard's top-level Inertia props are produced by
`FlexloadMonitor.Energy.dashboard_data/0` and consumed by
`assets/js/pages/Dashboard.ts`. Backend prop shape and frontend TypeScript types
should evolve together.

### `districts`

- Purpose: describes fictional monitored districts used by the map, filters,
  selected district detail panel, alerts, and aggregate dashboard context.
- Shape: list of district objects with `id`, `name`, `status`, `coordinates`,
  `currentLoadKw`, `pvGenerationKw`, `activeHeatPumps`, and
  `activeEvChargers`.
- TypeScript type: `District[]`.

### `measurements`

- Purpose: provides synthetic time-series data for the load trend chart.
- Shape: list of hourly measurement objects with `id`, `districtId`,
  `measuredAt`, `currentLoadKw`, `pvGenerationKw`, `activeHeatPumps`, and
  `activeEvChargers`.
- TypeScript type: `EnergyMeasurement[]`.

### `alerts`

- Purpose: provides recent synthetic operating alerts for the alert preview
  list.
- Shape: list of alert objects with `id`, `districtId`, `severity`, `message`,
  `createdAt`, and `acknowledged`.
- TypeScript type: `EnergyAlert[]`.

### `kpis`

- Purpose: provides aggregate dashboard totals and status counts rendered in KPI
  cards.
- Shape: object with `totalCurrentLoadKw`, `totalPvGenerationKw`,
  `totalActiveHeatPumps`, `totalActiveEvChargers`, `warningDistricts`, and
  `criticalDistricts`.
- TypeScript type: `DashboardKpis`.

## Typecheck Fixtures Note

Files matching `assets/js/types/*.typecheck.ts` are compile-time contract
fixtures. They are included in `npm run typecheck` and should not contain
runtime application behavior.

These fixtures help keep Phoenix/Inertia server props aligned with the
frontend TypeScript types. When dashboard props change, update the Phoenix data
contract, frontend domain types, dashboard props, and typecheck fixtures in the
same change.

## Accessibility Considerations

- District and alert states use visible status text instead of relying on color
  alone.
- The dashboard is organized into semantic sections and card-like regions with
  clear headings.
- Chart and map areas include textual context and summaries so the data is not
  only communicated visually.
- Interactive controls such as status filters are built to be keyboard-friendly
  where applicable.

## Getting Started / Local Setup

Prerequisites:

- Elixir and Erlang/OTP compatible with the project's `mix.exs`.
- Node.js and npm for frontend dependencies and TypeScript checks.
- PostgreSQL available with the local development credentials from
  `config/dev.exs`.

Install dependencies and prepare the app:

```sh
mix setup
cd assets
npm install
cd ..
```

Set up the database if you did not already run `mix setup`:

```sh
mix ecto.setup
```

Run the Phoenix server:

```sh
mix phx.server
```

Open the dashboard:

```text
http://localhost:4000/dashboard
```

## Useful Commands

```sh
mix setup
mix phx.server
cd assets && npm run typecheck
mix assets.build
mix test
mix precommit
```

## Deploying on Render

The repository includes a Render Blueprint for a single web service. The demo
uses synthetic in-memory data, so production does not require PostgreSQL.

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Render, choose **New > Blueprint** and connect the repository.
3. Accept the settings from `render.yaml` and create the service.

Render generates `SECRET_KEY_BASE`, builds an OTP release, and uses `/health`
for readiness checks. Set `PHX_HOST` only if you later attach a custom domain.
If persistent data is added later, provision PostgreSQL and set `DATABASE_URL`;
the application will then start its Ecto repository automatically.

## Project Status

FlexLoad Monitor is a work-in-progress portfolio project. It currently uses
synthetic in-memory data and has no real infrastructure, telemetry, customer, or
grid integration.

## Possible Next Steps

- Add more focused component tests.
- Improve the responsive layout for additional viewport sizes.
- Add loading and error states around dashboard data delivery.
- Run a more detailed accessibility review.
- Add a CI workflow for tests, asset builds, and TypeScript checks.
- Optionally replace synthetic in-memory data with database-backed demo data
  later.
