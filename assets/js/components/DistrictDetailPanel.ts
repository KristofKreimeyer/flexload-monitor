import { computed, defineComponent, h, type PropType } from "vue"
import type { District, DistrictStatus } from "../domain/types"

const statusDetails: Record<
  DistrictStatus,
  {
    label: string
    shortLabel: string
    panelClass: string
    note: string
  }
> = {
  normal: {
    label: "Normal",
    shortLabel: "OK",
    panelClass: "bg-emerald-400/10 text-emerald-100 ring-emerald-300/25",
    note: "Synthetic telemetry is within the nominal operating range for routine monitoring.",
  },
  warning: {
    label: "Warning",
    shortLabel: "WA",
    panelClass: "bg-amber-400/10 text-amber-100 ring-amber-300/30",
    note: "Synthetic load conditions are elevated; operators should review flexible assets.",
  },
  critical: {
    label: "Critical",
    shortLabel: "CR",
    panelClass: "bg-rose-400/10 text-rose-100 ring-rose-300/35",
    note: "Synthetic conditions require immediate attention before additional load is scheduled.",
  },
  offline: {
    label: "Offline",
    shortLabel: "OF",
    panelClass: "bg-slate-500/15 text-slate-200 ring-slate-400/30",
    note: "Synthetic telemetry is unavailable; verify the demo data feed before taking action.",
  },
}

const formatKilowatts = (kilowatts: number) =>
  new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(kilowatts)

const metric = (label: string, value: string) =>
  h("div", { class: "rounded-lg border border-slate-700/70 bg-slate-950/35 p-3" }, [
    h(
      "dt",
      {
        class:
          "text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
      },
      label
    ),
    h("dd", { class: "mt-1 text-sm font-semibold text-slate-100" }, value),
  ])

export default defineComponent({
  name: "DistrictDetailPanel",
  props: {
    district: {
      type: Object as PropType<District | null>,
      default: null,
    },
  },
  setup(props) {
    const status = computed(() =>
      props.district ? statusDetails[props.district.status] : null
    )

    return () =>
      h(
        "section",
        {
          class:
            "rounded-lg border border-slate-700/80 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20",
          "aria-labelledby": "district-detail-heading",
        },
        props.district && status.value
          ? [
              h("header", { class: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" }, [
                h("div", null, [
                  h(
                    "p",
                    {
                      class:
                        "text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200",
                    },
                    "Selected district"
                  ),
                  h(
                    "h2",
                    {
                      id: "district-detail-heading",
                      class: "mt-1 text-lg font-semibold leading-7 text-white",
                    },
                    props.district.name
                  ),
                ]),
                h(
                  "p",
                  {
                    class: [
                      "inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                      status.value.panelClass,
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
                      status.value.shortLabel
                    ),
                    h("span", null, `Status: ${status.value.label}`),
                  ]
                ),
              ]),
              h(
                "dl",
                {
                  class:
                    "mt-5 grid gap-3 sm:grid-cols-2",
                },
                [
                  metric(
                    "Current load",
                    `${formatKilowatts(props.district.currentLoadKw)} kW`
                  ),
                  metric(
                    "PV generation",
                    `${formatKilowatts(props.district.pvGenerationKw)} kW`
                  ),
                  metric(
                    "Active heat pumps",
                    String(props.district.activeHeatPumps)
                  ),
                  metric(
                    "Active EV chargers",
                    String(props.district.activeEvChargers)
                  ),
                ]
              ),
              h(
                "p",
                {
                  class:
                    "mt-5 rounded-lg border border-slate-700/70 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300",
                },
                status.value.note
              ),
            ]
          : [
              h(
                "h2",
                {
                  id: "district-detail-heading",
                  class: "text-lg font-semibold leading-7 text-white",
                },
                "District details"
              ),
              h(
                "p",
                { class: "mt-2 text-sm leading-6 text-slate-400" },
                "Select a fictional district from the map list to inspect its synthetic operating details."
              ),
            ]
      )
  },
})
