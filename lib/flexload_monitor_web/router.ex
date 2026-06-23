defmodule FlexloadMonitorWeb.Router do
  use FlexloadMonitorWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :put_root_layout, html: {FlexloadMonitorWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug Inertia.Plug
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", FlexloadMonitorWeb do
    pipe_through :browser

    get "/", PageController, :home
    get "/dashboard", PageController, :dashboard
  end

  # Other scopes may use custom stacks.
  # scope "/api", FlexloadMonitorWeb do
  #   pipe_through :api
  # end
end
