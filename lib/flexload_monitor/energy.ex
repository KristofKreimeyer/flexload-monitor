defmodule FlexloadMonitor.Energy do
  @moduledoc """
  Synthetic energy dashboard data for the fictional FlexLoad Monitor demo.
  """

  @districts [
    %{
      id: "district-ember-lane",
      name: "Ember Lane",
      status: "normal",
      coordinates: %{latitude: 12.014, longitude: 42.018},
      currentLoadKw: 2860,
      pvGenerationKw: 1740,
      activeHeatPumps: 68,
      activeEvChargers: 18
    },
    %{
      id: "district-silver-mill",
      name: "Silver Mill",
      status: "warning",
      coordinates: %{latitude: 12.026, longitude: 42.043},
      currentLoadKw: 3420,
      pvGenerationKw: 1185,
      activeHeatPumps: 84,
      activeEvChargers: 31
    },
    %{
      id: "district-maple-forge",
      name: "Maple Forge",
      status: "critical",
      coordinates: %{latitude: 12.048, longitude: 42.011},
      currentLoadKw: 4180,
      pvGenerationKw: 960,
      activeHeatPumps: 91,
      activeEvChargers: 42
    },
    %{
      id: "district-sunspoke-gardens",
      name: "Sunspoke Gardens",
      status: "normal",
      coordinates: %{latitude: 12.065, longitude: 42.038},
      currentLoadKw: 2215,
      pvGenerationKw: 2030,
      activeHeatPumps: 57,
      activeEvChargers: 16
    },
    %{
      id: "district-copperfield-yard",
      name: "Copperfield Yard",
      status: "warning",
      coordinates: %{latitude: 12.083, longitude: 42.063},
      currentLoadKw: 3095,
      pvGenerationKw: 1365,
      activeHeatPumps: 72,
      activeEvChargers: 29
    }
  ]

  @alerts [
    %{
      id: "alert-maple-forge-ev-surge",
      districtId: "district-maple-forge",
      severity: "critical",
      message: "EV charging load exceeded the synthetic feeder threshold.",
      createdAt: "2026-06-23T08:35:00.000Z",
      acknowledged: false
    },
    %{
      id: "alert-silver-mill-pv-drop",
      districtId: "district-silver-mill",
      severity: "warning",
      message: "PV generation is below the expected synthetic morning profile.",
      createdAt: "2026-06-23T08:18:00.000Z",
      acknowledged: false
    },
    %{
      id: "alert-copperfield-yard-heat-pumps",
      districtId: "district-copperfield-yard",
      severity: "warning",
      message: "Heat pump activity is elevated during a simulated load peak.",
      createdAt: "2026-06-23T07:54:00.000Z",
      acknowledged: true
    },
    %{
      id: "alert-ember-lane-telemetry",
      districtId: "district-ember-lane",
      severity: "info",
      message: "Synthetic telemetry returned to nominal reporting cadence.",
      createdAt: "2026-06-23T07:21:00.000Z",
      acknowledged: true
    }
  ]

  @load_profile_multipliers [
    0.72,
    0.68,
    0.65,
    0.64,
    0.67,
    0.78,
    0.94,
    1.08,
    1.12,
    1.05,
    0.98,
    0.94,
    0.96,
    1.02,
    1.08,
    1.14,
    1.22,
    1.3,
    1.24,
    1.16,
    1.04,
    0.92,
    0.84,
    0.78
  ]

  @pv_profile_multipliers [
    0,
    0,
    0,
    0,
    0.02,
    0.08,
    0.22,
    0.42,
    0.62,
    0.78,
    0.9,
    0.98,
    1,
    0.94,
    0.82,
    0.66,
    0.46,
    0.24,
    0.08,
    0.02,
    0,
    0,
    0,
    0
  ]

  def dashboard_data do
    %{
      districts: districts(),
      measurements: measurements(),
      alerts: alerts(),
      kpis: kpis()
    }
  end

  def districts, do: @districts

  def alerts, do: @alerts

  def measurements do
    total_current_load_kw = sum_district_field(:currentLoadKw)
    total_pv_generation_kw = sum_district_field(:pvGenerationKw)

    @load_profile_multipliers
    |> Enum.with_index()
    |> Enum.map(fn {load_multiplier, hour} ->
      pv_multiplier = Enum.at(@pv_profile_multipliers, hour)
      measured_at = DateTime.new!(~D[2026-06-23], Time.new!(hour, 0, 0), "Etc/UTC")

      %{
        id: "measurement-2026-06-23-#{String.pad_leading(to_string(hour), 2, "0")}",
        districtId: "district-all",
        measuredAt: "#{Calendar.strftime(measured_at, "%Y-%m-%dT%H:%M:%S")}.000Z",
        currentLoadKw: round(total_current_load_kw * load_multiplier),
        pvGenerationKw: round(total_pv_generation_kw * pv_multiplier),
        activeHeatPumps: round(372 * load_multiplier),
        activeEvChargers: round(136 * max(0.45, load_multiplier - 0.12))
      }
    end)
  end

  def kpis do
    Enum.reduce(
      @districts,
      %{
        totalCurrentLoadKw: 0,
        totalPvGenerationKw: 0,
        totalActiveHeatPumps: 0,
        totalActiveEvChargers: 0,
        warningDistricts: 0,
        criticalDistricts: 0
      },
      fn district, kpis ->
        %{
          totalCurrentLoadKw: kpis.totalCurrentLoadKw + district.currentLoadKw,
          totalPvGenerationKw: kpis.totalPvGenerationKw + district.pvGenerationKw,
          totalActiveHeatPumps: kpis.totalActiveHeatPumps + district.activeHeatPumps,
          totalActiveEvChargers: kpis.totalActiveEvChargers + district.activeEvChargers,
          warningDistricts:
            kpis.warningDistricts + if(district.status == "warning", do: 1, else: 0),
          criticalDistricts:
            kpis.criticalDistricts + if(district.status == "critical", do: 1, else: 0)
        }
      end
    )
  end

  defp sum_district_field(field) do
    Enum.reduce(@districts, 0, fn district, total -> total + Map.fetch!(district, field) end)
  end
end
