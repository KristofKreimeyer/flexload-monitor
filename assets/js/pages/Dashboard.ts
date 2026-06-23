import { Head } from "@inertiajs/vue3"
import { defineComponent, h } from "vue"

export default defineComponent({
  name: "Dashboard",
  setup() {
    return () =>
      h(
        "main",
        {
          class:
            "min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10 lg:px-16",
        },
        [
          h(Head, { title: "FlexLoad Monitor" }),
          h("section", { class: "mx-auto flex max-w-5xl flex-col gap-10" }, [
            h("div", { class: "space-y-4" }, [
              h(
                "p",
                {
                  class:
                    "text-sm font-medium uppercase tracking-[0.2em] text-emerald-300",
                },
                "Synthetic overview"
              ),
              h(
                "h1",
                {
                  class:
                    "text-4xl font-semibold tracking-normal text-white sm:text-5xl",
                },
                "FlexLoad Monitor"
              ),
              h(
                "p",
                {
                  class: "max-w-2xl text-lg leading-8 text-slate-300",
                },
                "Synthetic energy load monitoring dashboard"
              ),
            ]),
            h(
              "div",
              {
                class:
                  "max-w-xl rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-emerald-950/30 transition duration-200 hover:border-emerald-300/40 hover:bg-white/[0.08]",
              },
              [
                h(
                  "p",
                  { class: "text-base font-medium text-white" },
                  "Dashboard setup successful"
                ),
              ]
            ),
          ]),
        ]
      )
  },
})
