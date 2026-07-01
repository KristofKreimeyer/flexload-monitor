defmodule FlexloadMonitorWeb.PageController do
  use FlexloadMonitorWeb, :controller

  alias FlexloadMonitor.Energy

  # Renders the default Phoenix starter page at the root path.
  def home(conn, _params) do
    render(conn, :home)
  end

  # Renders the Vue/Inertia dashboard with an initial synthetic data snapshot.
  def dashboard(conn, _params) do
    render_inertia(conn, "Dashboard", Energy.dashboard_data())
  end

  # Returns the same dashboard snapshot as JSON for client-side refreshes.
  def dashboard_data(conn, _params) do
    json(conn, Energy.dashboard_data())
  end

  # Used by hosting platforms to verify that the HTTP service is ready.
  def health(conn, _params) do
    json(conn, %{status: "ok"})
  end
end
