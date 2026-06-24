defmodule FlexloadMonitorWeb.PageControllerTest do
  use FlexloadMonitorWeb.ConnCase

  import Inertia.Testing

  test "GET /", %{conn: conn} do
    conn = get(conn, ~p"/")
    assert html_response(conn, 200) =~ "Peace of mind from prototype to production"
  end

  test "GET /dashboard", %{conn: conn} do
    conn = get(conn, ~p"/dashboard")

    assert html_response(conn, 200)
    assert inertia_component(conn) == "Dashboard"

    assert %{districts: [_ | _], measurements: [_ | _], alerts: [_ | _], kpis: %{}} =
             inertia_props(conn)
  end

  test "GET /dashboard/data", %{conn: conn} do
    conn =
      conn
      |> put_req_header("accept", "application/json")
      |> get(~p"/dashboard/data")

    assert %{
             "districts" => [_ | _],
             "measurements" => [_ | _],
             "alerts" => [_ | _],
             "kpis" => %{
               "totalCurrentLoadKw" => total_current_load_kw,
               "totalPvGenerationKw" => total_pv_generation_kw
             }
           } = json_response(conn, 200)

    assert is_integer(total_current_load_kw)
    assert is_integer(total_pv_generation_kw)
  end
end
