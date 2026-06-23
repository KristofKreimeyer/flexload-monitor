# FlexloadMonitor

FlexLoad Monitor is a fictional portfolio/demo application built with Phoenix,
Inertia.js, Vue 3, TypeScript, Tailwind CSS, Apache ECharts, and Leaflet.

To start your Phoenix server:

* Run `mix setup` to install and setup dependencies
* Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Synthetic Data Contract

All dashboard data in this project is synthetic and fictional. It is generated
for the FlexLoad Monitor demo and must not be treated as real operational,
customer, utility, or location data.

The Phoenix module responsible for producing the dashboard props is
`FlexloadMonitor.Energy`, specifically `FlexloadMonitor.Energy.dashboard_data/0`.
`FlexloadMonitorWeb.PageController.dashboard/2` passes those props to the
Inertia `Dashboard` page. The Vue consumer is `assets/js/pages/Dashboard.ts`,
which uses domain types from `assets/js/domain/types.ts`.

Server-provided Inertia props:

* `districts`
  * Purpose: describes the fictional monitored areas shown in the map, detail
    panel, filters, and aggregate dashboard context.
  * Shape: list of district objects.
  * Important fields: `id`, `name`, `status`, `coordinates`, `currentLoadKw`,
    `pvGenerationKw`, `activeHeatPumps`, and `activeEvChargers`.
  * Frontend type: `District[]`, where `status` matches `DistrictStatus` and
    `coordinates` matches `Coordinates`.

* `measurements`
  * Purpose: provides the synthetic time-series data used by the load trend
    chart.
  * Shape: list of measurement objects, currently representing hourly aggregate
    values for a fictional all-district view.
  * Important fields: `id`, `districtId`, `measuredAt`, `currentLoadKw`,
    `pvGenerationKw`, `activeHeatPumps`, and `activeEvChargers`.
  * Frontend type: `EnergyMeasurement[]`.

* `alerts`
  * Purpose: provides the recent synthetic operating alerts displayed in the
    alert preview list.
  * Shape: list of alert objects associated with fictional district IDs.
  * Important fields: `id`, `districtId`, `severity`, `message`, `createdAt`,
    and `acknowledged`.
  * Frontend type: `EnergyAlert[]`, where `severity` matches `AlertSeverity`.

* `kpis`
  * Purpose: provides the aggregate dashboard totals rendered by the KPI cards.
  * Shape: one object containing numeric totals and status counts derived from
    the synthetic districts.
  * Important fields: `totalCurrentLoadKw`, `totalPvGenerationKw`,
    `totalActiveHeatPumps`, `totalActiveEvChargers`, `warningDistricts`, and
    `criticalDistricts`.
  * Frontend type: `DashboardKpis`.

When the backend prop shape changes, update the matching TypeScript domain
types and page props in the same change so the Phoenix/Inertia boundary stays
aligned with the Vue application.

Frontend files matching `assets/js/types/*.typecheck.ts` are compile-time
contract fixtures. They are included in `npm run typecheck` to verify that
synthetic Phoenix-provided Inertia props still satisfy the TypeScript types
consumed by Vue. These fixtures should not contain runtime application
behavior. Future changes to Phoenix-provided props should update the matching
TypeScript types and typecheck fixtures together.

Ready to run in production? Please [check our deployment guides](https://phoenix.hexdocs.pm/deployment.html).

## Learn more

* Official website: https://www.phoenixframework.org/
* Guides: https://phoenix.hexdocs.pm/overview.html
* Docs: https://phoenix.hexdocs.pm
* Forum: https://elixirforum.com/c/phoenix-forum
* Source: https://github.com/phoenixframework/phoenix
