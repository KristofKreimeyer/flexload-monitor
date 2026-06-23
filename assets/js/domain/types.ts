export type DistrictStatus = "normal" | "warning" | "critical" | "offline"

export type AlertSeverity = "info" | "warning" | "critical"

export type Coordinates = {
  latitude: number
  longitude: number
}

export type District = {
  id: string
  name: string
  status: DistrictStatus
  coordinates: Coordinates
  currentLoadKw: number
  pvGenerationKw: number
  activeHeatPumps: number
  activeEvChargers: number
}

export type EnergyMeasurement = {
  id: string
  districtId: District["id"]
  measuredAt: string
  currentLoadKw: number
  pvGenerationKw: number
  activeHeatPumps: number
  activeEvChargers: number
}

export type EnergyAlert = {
  id: string
  districtId: District["id"]
  severity: AlertSeverity
  message: string
  createdAt: string
  acknowledged: boolean
}
