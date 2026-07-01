defmodule FlexloadMonitor.Application do
  # See https://elixir.hexdocs.pm/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  # Starts the Phoenix application supervision tree and keeps each child process isolated.
  def start(_type, _args) do
    children =
      [
        FlexloadMonitorWeb.Telemetry,
        repo_child(),
        {DNSCluster,
         query: Application.get_env(:flexload_monitor, :dns_cluster_query) || :ignore},
        {Phoenix.PubSub, name: FlexloadMonitor.PubSub},
        # Start a worker by calling: FlexloadMonitor.Worker.start_link(arg)
        # {FlexloadMonitor.Worker, arg},
        # Start to serve requests, typically the last entry
        FlexloadMonitorWeb.Endpoint
      ]
      |> Enum.reject(&is_nil/1)

    # See https://elixir.hexdocs.pm/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: FlexloadMonitor.Supervisor]
    Supervisor.start_link(children, opts)
  end

  defp repo_child do
    if Application.get_env(:flexload_monitor, :start_repo, true), do: FlexloadMonitor.Repo
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  # Propagates runtime configuration changes to the Phoenix endpoint during releases.
  def config_change(changed, _new, removed) do
    FlexloadMonitorWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
