defmodule FlexloadMonitorWeb.PageController do
  use FlexloadMonitorWeb, :controller

  alias FlexloadMonitor.Energy

  def home(conn, _params) do
    render(conn, :home)
  end

  def dashboard(conn, _params) do
    render_inertia(conn, "Dashboard", Energy.dashboard_data())
  end

  def dashboard_data(conn, _params) do
    json(conn, Energy.dashboard_data())
  end
end
