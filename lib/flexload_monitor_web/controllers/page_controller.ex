defmodule FlexloadMonitorWeb.PageController do
  use FlexloadMonitorWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end

  def dashboard(conn, _params) do
    render_inertia(conn, "Dashboard")
  end
end
