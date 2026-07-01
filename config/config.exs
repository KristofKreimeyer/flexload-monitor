# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :flexload_monitor,
  ecto_repos: [FlexloadMonitor.Repo],
  generators: [timestamp_type: :utc_datetime],
  start_repo: true

config :inertia,
  endpoint: FlexloadMonitorWeb.Endpoint,
  static_paths: ["/assets/js/app.js"],
  default_version: "1",
  camelize_props: false,
  history: [encrypt: false],
  ssr: false,
  raise_on_ssr_failure: config_env() != :prod

# Configure the endpoint
config :flexload_monitor, FlexloadMonitorWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [html: FlexloadMonitorWeb.ErrorHTML, json: FlexloadMonitorWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: FlexloadMonitor.PubSub

# Configure esbuild (the version is required)
config :esbuild,
  version: "0.25.4",
  flexload_monitor: [
    args:
      ~w(js/app.ts --bundle --target=es2022 --outdir=../priv/static/assets/js --external:/fonts/* --external:/images/* --alias:@=.),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => [Path.expand("../deps", __DIR__), Mix.Project.build_path()]}
  ]

# Configure tailwind (the version is required)
config :tailwind,
  version: "4.3.0",
  flexload_monitor: [
    args: ~w(
      --input=assets/css/app.css
      --output=priv/static/assets/css/app.css
    ),
    cd: Path.expand("..", __DIR__),
    env: %{"NODE_PATH" => [Path.expand("../deps", __DIR__), Mix.Project.build_path()]}
  ]

# Configure Elixir's Logger
config :logger, :default_formatter,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
