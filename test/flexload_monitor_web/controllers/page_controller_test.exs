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
  end
end
