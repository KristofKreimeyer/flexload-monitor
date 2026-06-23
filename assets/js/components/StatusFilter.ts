import { computed, defineComponent, h, type PropType } from "vue"
import type { DistrictStatus } from "../domain/types"

export type DistrictStatusFilter = DistrictStatus | "all"

const filterOptions: Array<{
  value: DistrictStatusFilter
  label: string
  description: string
}> = [
  {
    value: "all",
    label: "All",
    description: "Show every fictional district",
  },
  {
    value: "normal",
    label: "Normal",
    description: "Show districts operating within the synthetic nominal range",
  },
  {
    value: "warning",
    label: "Warning",
    description: "Show districts that need operator review",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Show districts requiring immediate synthetic action",
  },
  {
    value: "offline",
    label: "Offline",
    description: "Show districts without synthetic telemetry",
  },
]

export default defineComponent({
  name: "StatusFilter",
  props: {
    modelValue: {
      type: String as PropType<DistrictStatusFilter>,
      required: true,
      validator: (value: string) =>
        ["all", "normal", "warning", "critical", "offline"].includes(value),
    },
  },
  emits: {
    "update:modelValue": (value: DistrictStatusFilter) =>
      ["all", "normal", "warning", "critical", "offline"].includes(value),
  },
  setup(props, { emit }) {
    const activeOption = computed(
      () =>
        filterOptions.find((option) => option.value === props.modelValue) ??
        filterOptions[0]
    )

    return () =>
      h("fieldset", { class: "space-y-3" }, [
        h(
          "legend",
          { class: "text-sm font-semibold leading-6 text-white" },
          "Filter districts by status"
        ),
        h(
          "p",
          { id: "district-status-filter-status", class: "sr-only" },
          `Active district status filter: ${activeOption.value.label}`
        ),
        h(
          "div",
          {
            class: "flex flex-wrap gap-2",
            role: "group",
            "aria-describedby": "district-status-filter-status",
          },
          filterOptions.map((option) => {
            const active = option.value === props.modelValue

            return h(
              "button",
              {
                key: option.value,
                type: "button",
                class: [
                  "rounded-md border px-3 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950",
                  active
                    ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30"
                    : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80 hover:text-white",
                ],
                "aria-pressed": active ? "true" : "false",
                "aria-current": active ? "true" : undefined,
                "aria-label": `${option.label} status filter. ${option.description}.${
                  active ? " Currently selected." : ""
                }`,
                onClick: () => emit("update:modelValue", option.value),
              },
              [
                h("span", null, option.label),
                active
                  ? h("span", { class: "sr-only" }, " status filter selected")
                  : null,
              ]
            )
          })
        ),
      ])
  },
})
