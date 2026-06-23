import type { District } from "./types"

export type DashboardKpis = {
  totalCurrentLoadKw: number
  totalPvGenerationKw: number
  totalActiveHeatPumps: number
  totalActiveEvChargers: number
  warningDistricts: number
  criticalDistricts: number
}

export const mockDistricts: District[] = [
  {
    id: "district-northbank-rise",
    name: "Northbank Rise",
    status: "normal",
    coordinates: { latitude: 47.8124, longitude: 9.2148 },
    currentLoadKw: 2860,
    pvGenerationKw: 1740,
    activeHeatPumps: 68,
    activeEvChargers: 18,
  },
  {
    id: "district-silverquay",
    name: "Silverquay",
    status: "warning",
    coordinates: { latitude: 47.7971, longitude: 9.2385 },
    currentLoadKw: 3420,
    pvGenerationKw: 1185,
    activeHeatPumps: 84,
    activeEvChargers: 31,
  },
  {
    id: "district-maple-forge",
    name: "Maple Forge",
    status: "critical",
    coordinates: { latitude: 47.7816, longitude: 9.1962 },
    currentLoadKw: 4180,
    pvGenerationKw: 960,
    activeHeatPumps: 91,
    activeEvChargers: 42,
  },
  {
    id: "district-sunspoke-gardens",
    name: "Sunspoke Gardens",
    status: "normal",
    coordinates: { latitude: 47.7668, longitude: 9.2217 },
    currentLoadKw: 2215,
    pvGenerationKw: 2030,
    activeHeatPumps: 57,
    activeEvChargers: 16,
  },
  {
    id: "district-copperfield-heights",
    name: "Copperfield Heights",
    status: "warning",
    coordinates: { latitude: 47.7543, longitude: 9.2491 },
    currentLoadKw: 3095,
    pvGenerationKw: 1365,
    activeHeatPumps: 72,
    activeEvChargers: 29,
  },
]

export function deriveDashboardKpis(districts: District[]): DashboardKpis {
  return districts.reduce<DashboardKpis>(
    (kpis, district) => ({
      totalCurrentLoadKw: kpis.totalCurrentLoadKw + district.currentLoadKw,
      totalPvGenerationKw: kpis.totalPvGenerationKw + district.pvGenerationKw,
      totalActiveHeatPumps:
        kpis.totalActiveHeatPumps + district.activeHeatPumps,
      totalActiveEvChargers:
        kpis.totalActiveEvChargers + district.activeEvChargers,
      warningDistricts:
        kpis.warningDistricts + (district.status === "warning" ? 1 : 0),
      criticalDistricts:
        kpis.criticalDistricts + (district.status === "critical" ? 1 : 0),
    }),
    {
      totalCurrentLoadKw: 0,
      totalPvGenerationKw: 0,
      totalActiveHeatPumps: 0,
      totalActiveEvChargers: 0,
      warningDistricts: 0,
      criticalDistricts: 0,
    }
  )
}
