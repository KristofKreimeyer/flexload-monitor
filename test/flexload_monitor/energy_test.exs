defmodule FlexloadMonitor.EnergyTest do
  use ExUnit.Case, async: true

  alias FlexloadMonitor.Energy

  test "dashboard_data returns documented dashboard prop shapes" do
    data = Energy.dashboard_data()

    assert is_map(data)
    assert Map.has_key?(data, :districts)
    assert Map.has_key?(data, :measurements)
    assert Map.has_key?(data, :alerts)
    assert Map.has_key?(data, :kpis)

    assert is_list(data.districts)
    assert is_list(data.measurements)
    assert is_list(data.alerts)
    assert is_map(data.kpis)

    assert [
             %{
               id: district_id,
               name: district_name,
               status: district_status,
               coordinates: %{latitude: latitude, longitude: longitude}
             }
             | _
           ] = data.districts

    assert is_binary(district_id)
    assert is_binary(district_name)
    assert is_binary(district_status)
    assert is_number(latitude)
    assert is_number(longitude)

    assert [
             %{
               id: measurement_id,
               districtId: measurement_district_id,
               measuredAt: measured_at,
               currentLoadKw: current_load_kw
             }
             | _
           ] = data.measurements

    assert is_binary(measurement_id)
    assert is_binary(measurement_district_id)
    assert is_binary(measured_at)
    assert is_integer(current_load_kw)

    assert [
             %{
               id: alert_id,
               districtId: alert_district_id,
               severity: severity,
               message: message,
               acknowledged: acknowledged
             }
             | _
           ] = data.alerts

    assert is_binary(alert_id)
    assert is_binary(alert_district_id)
    assert is_binary(severity)
    assert is_binary(message)
    assert is_boolean(acknowledged)

    assert %{
             totalCurrentLoadKw: total_current_load_kw,
             totalPvGenerationKw: total_pv_generation_kw,
             warningDistricts: warning_districts,
             criticalDistricts: critical_districts
           } = data.kpis

    assert is_integer(total_current_load_kw)
    assert is_integer(total_pv_generation_kw)
    assert is_integer(warning_districts)
    assert is_integer(critical_districts)
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
