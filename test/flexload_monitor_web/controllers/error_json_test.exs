defmodule FlexloadMonitorWeb.ErrorJSONTest do
  use FlexloadMonitorWeb.ConnCase, async: true

  test "renders 404" do
    assert FlexloadMonitorWeb.ErrorJSON.render("404.json", %{}) == %{
             errors: %{detail: "Not Found"}
           }
  end

  test "renders 500" do
    assert FlexloadMonitorWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
