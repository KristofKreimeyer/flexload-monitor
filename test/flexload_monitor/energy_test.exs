defmodule FlexloadMonitor.EnergyTest do
  use ExUnit.Case, async: true

  alias FlexloadMonitor.Energy

  test "dashboard_data returns dashboard props" do
    assert %{
             districts: districts,
             measurements: measurements,
             alerts: alerts,
             kpis: kpis
           } = Energy.dashboard_data()

    assert length(districts) == 5
    assert length(measurements) == 24
    assert length(alerts) == 4

    assert kpis.totalCurrentLoadKw == Enum.sum(Enum.map(districts, & &1.currentLoadKw))
    assert kpis.totalPvGenerationKw == Enum.sum(Enum.map(districts, & &1.pvGenerationKw))
    assert kpis.warningDistricts == 2
    assert kpis.criticalDistricts == 1
  end

  test "measurements are synthetic hourly aggregate values" do
    assert [first | _] = Energy.measurements()

    assert first.id == "measurement-2026-06-23-00"
    assert first.districtId == "district-all"
    assert first.measuredAt == "2026-06-23T00:00:00.000Z"
    assert is_integer(first.currentLoadKw)
    assert is_integer(first.pvGenerationKw)
  end
end
