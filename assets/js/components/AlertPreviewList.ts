import { computed, defineComponent, h, type PropType } from "vue"
import type { District, EnergyAlert } from "../domain/types"

const severityStyles: Record<
  EnergyAlert["severity"],
  {
    label: string
    marker: string
    class: string
  }
> = {
  info: {
    label: "Info",
    marker: "IN",
    class: "bg-sky-400/10 text-sky-100 ring-sky-300/25",
  },
  warning: {
    label: "Warning",
    marker: "WA",
    class: "bg-amber-400/10 text-amber-100 ring-amber-300/30",
  },
  critical: {
    label: "Critical",
    marker: "CR",
    class: "bg-rose-400/10 text-rose-100 ring-rose-300/35",
  },
}

// Converts an alert acknowledgement flag into the displayed status label.
const alertStatusLabel = (alert: EnergyAlert) =>
  alert.acknowledged ? "Acknowledged" : "Open"

export default defineComponent({
  name: "AlertPreviewList",
  props: {
    alerts: {
      type: Array as PropType<EnergyAlert[]>,
      required: true,
    },
    districts: {
      type: Array as PropType<District[]>,
      required: true,
    },
    limit: {
      type: Number,
      default: 3,
    },
  },
  setup(props) {
    // Builds a district ID lookup so alert rows can show friendly district names.
    const districtNames = computed(
      () =>
        new Map(props.districts.map((district) => [district.id, district.name]))
    )

    // Sorts newest first and applies the preview limit.
    const latestAlerts = computed(() =>
      [...props.alerts]
        .sort(
          (first, second) =>
            Date.parse(second.createdAt) - Date.parse(first.createdAt)
        )
        .slice(0, props.limit)
    )

    return () => {
      if (latestAlerts.value.length === 0) {
        return h(
          "p",
          {
            class:
              "rounded-lg border border-dashed border-slate-600 bg-slate-900/45 p-5 text-sm leading-6 text-slate-300",
            role: "status",
          },
          "No synthetic alerts are available right now."
        )
      }

      return h(
        "ul",
        {
          class: "space-y-3",
          "aria-label": "Latest synthetic alerts",
        },
        latestAlerts.value.map((alert) => {
          const severity = severityStyles[alert.severity]
          const districtName = districtNames.value.get(alert.districtId)

          return h(
            "li",
            {
              key: alert.id,
              class:
                "rounded-lg border border-slate-700/80 bg-slate-900/55 p-4 transition duration-200 hover:border-slate-500 hover:bg-slate-900/80",
            },
            [
              h("article", { class: "space-y-4" }, [
                h(
                  "header",
                  { class: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" },
                  [
                    h(
                      "h3",
                      { class: "text-sm font-semibold leading-6 text-white" },
                      alert.message
                    ),
                    h(
                      "span",
                      {
                        class: [
                          "inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          severity.class,
                        ],
                      },
                      [
                        h(
                          "span",
                          {
                            class:
                              "grid h-5 min-w-5 place-items-center rounded-full bg-white/10 px-1 text-[0.625rem] leading-none",
                            "aria-hidden": "true",
                          },
                          severity.marker
                        ),
                        h("span", null, `Severity: ${severity.label}`),
                      ]
                    ),
                  ]
                ),
                h("dl", { class: "grid gap-3 text-sm text-slate-300 sm:grid-cols-2" }, [
                  h("div", null, [
                    h("dt", { class: "text-xs font-medium uppercase tracking-[0.14em] text-slate-500" }, "Status"),
                    h("dd", { class: "mt-1 font-medium text-slate-100" }, alertStatusLabel(alert)),
                  ]),
                  h("div", null, [
                    h("dt", { class: "text-xs font-medium uppercase tracking-[0.14em] text-slate-500" }, "District"),
                    h(
                      "dd",
                      { class: "mt-1 font-medium text-slate-100" },
                      districtName ?? "No district linked"
                    ),
                  ]),
                ]),
              ]),
            ]
          )
        })
      )
    }
  },
})
