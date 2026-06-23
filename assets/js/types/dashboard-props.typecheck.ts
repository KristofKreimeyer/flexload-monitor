import type { DashboardProps } from "../pages/Dashboard"

export const dashboardPropsFixture = {
  districts: [
    {
      id: "district-fable-yard",
      name: "Fable Yard",
      status: "normal",
      coordinates: {
        latitude: 12.101,
        longitude: 42.204,
      },
      currentLoadKw: 1800,
      pvGenerationKw: 740,
      activeHeatPumps: 34,
      activeEvChargers: 11,
    },
  ],
  measurements: [
    {
      id: "measurement-fable-yard-2026-06-23-09",
      districtId: "district-fable-yard",
      measuredAt: "2026-06-23T09:00:00.000Z",
      currentLoadKw: 1800,
      pvGenerationKw: 740,
      activeHeatPumps: 34,
      activeEvChargers: 11,
    },
  ],
  alerts: [
    {
      id: "alert-fable-yard-load-watch",
      districtId: "district-fable-yard",
      severity: "info",
      message: "Synthetic feeder load is within the expected demo range.",
      createdAt: "2026-06-23T09:10:00.000Z",
      acknowledged: true,
    },
  ],
  kpis: {
    totalCurrentLoadKw: 1800,
    totalPvGenerationKw: 740,
    totalActiveHeatPumps: 34,
    totalActiveEvChargers: 11,
    warningDistricts: 0,
    criticalDistricts: 0,
  },
} satisfies DashboardProps
