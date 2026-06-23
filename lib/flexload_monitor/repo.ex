defmodule FlexloadMonitor.Repo do
  use Ecto.Repo,
    otp_app: :flexload_monitor,
    adapter: Ecto.Adapters.Postgres
end
