import { computed, defineComponent, h, type PropType } from "vue"

export type KpiStatus = "normal" | "warning" | "critical"

const statusDetails: Record<
  KpiStatus,
  {
    label: string
    indicator: string
    cardClass: string
    statusClass: string
  }
> = {
  normal: {
    label: "Normal",
    indicator: "OK",
    cardClass: "border-emerald-300/25 hover:border-emerald-300/55",
    statusClass: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/25",
  },
  warning: {
    label: "Warning",
    indicator: "!",
    cardClass: "border-amber-300/35 hover:border-amber-300/65",
    statusClass: "bg-amber-400/10 text-amber-100 ring-amber-300/30",
  },
  critical: {
    label: "Critical",
    indicator: "CR",
    cardClass: "border-rose-300/40 hover:border-rose-300/70",
    statusClass: "bg-rose-400/10 text-rose-100 ring-rose-300/35",
  },
}

export default defineComponent({
  name: "KpiCard",
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    status: {
      type: String as PropType<KpiStatus>,
      required: true,
      validator: (value: string) =>
        ["normal", "warning", "critical"].includes(value),
    },
    description: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const status = computed(() => statusDetails[props.status])

    return () =>
      h(
        "article",
        {
          class: [
            "group rounded-lg border bg-white/[0.06] p-5 shadow-xl shadow-slate-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.085]",
            status.value.cardClass,
          ],
          "aria-label": `${props.title}: ${props.value} ${props.unit}, status ${status.value.label}`,
        },
        [
          h("header", { class: "flex items-start justify-between gap-4" }, [
            h(
              "h2",
              { class: "text-sm font-medium leading-6 text-slate-300" },
              props.title
            ),
            h(
              "p",
              {
                class: [
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                  status.value.statusClass,
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
                  status.value.indicator
                ),
                h("span", null, `Status: ${status.value.label}`),
              ]
            ),
          ]),
          h("dl", { class: "mt-6" }, [
            h("div", null, [
              h("dt", { class: "sr-only" }, props.title),
              h("dd", { class: "flex items-baseline gap-2" }, [
                h(
                  "span",
                  {
                    class:
                      "text-3xl font-semibold tracking-normal text-white sm:text-4xl",
                  },
                  String(props.value)
                ),
                h(
                  "span",
                  { class: "text-sm font-medium uppercase text-slate-400" },
                  props.unit
                ),
              ]),
            ]),
          ]),
          h(
            "p",
            { class: "mt-4 text-sm leading-6 text-slate-400" },
            props.description
          ),
        ]
      )
  },
})
