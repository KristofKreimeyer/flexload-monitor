import { Head } from "@inertiajs/vue3"
import { computed, defineComponent, h, ref, watch, type PropType } from "vue"
import AlertPreviewList from "../components/AlertPreviewList"
import DistrictDetailPanel from "../components/DistrictDetailPanel"
import DistrictMap from "../components/DistrictMap"
import KpiCard, { type KpiStatus } from "../components/KpiCard"
import LoadTrendChart from "../components/LoadTrendChart"
import StatusFilter, {
  type DistrictStatusFilter,
} from "../components/StatusFilter"
import type {
  DashboardKpis,
  District,
  EnergyAlert,
  EnergyMeasurement,
} from "../domain/types"

type DashboardProps = {
  districts: District[]
  measurements: EnergyMeasurement[]
  alerts: EnergyAlert[]
  kpis: DashboardKpis
}

const formatMegawatts = (kilowatts: number) => (kilowatts / 1000).toFixed(1)

const buildKpiCards = (
  dashboardKpis: DashboardKpis
): Array<{
  title: string
  value: string
  unit: string
  status: KpiStatus
  description: string
}> => [
  {
    title: "Current Load",
    value: formatMegawatts(dashboardKpis.totalCurrentLoadKw),
    unit: "MW",
    status: "warning",
    description: "Synthetic aggregate demand across monitored feeders.",
  },
  {
    title: "PV Generation",
    value: formatMegawatts(dashboardKpis.totalPvGenerationKw),
    unit: "MW",
    status: "normal",
    description: "Estimated photovoltaic output available to the local grid.",
  },
  {
    title: "Active Heat Pumps",
    value: String(dashboardKpis.totalActiveHeatPumps),
    unit: "units",
    status: "normal",
    description: "Synthetic count of controllable heat pumps currently running.",
  },
  {
    title: "Active EV Chargers",
    value: String(dashboardKpis.totalActiveEvChargers),
    unit: "ports",
    status: "critical",
    description: "Synthetic count of EV charging ports drawing power right now.",
  },
  {
    title: "Warning Districts",
    value: String(dashboardKpis.warningDistricts),
    unit: "areas",
    status: "warning",
    description: "Synthetic districts currently outside nominal operating range.",
  },
  {
    title: "Critical Districts",
    value: String(dashboardKpis.criticalDistricts),
    unit: "areas",
    status: "critical",
    description: "Synthetic districts requiring immediate operator attention.",
  },
]

export default defineComponent({
  name: "Dashboard",
  props: {
    districts: {
      type: Array as PropType<District[]>,
      required: true,
    },
    measurements: {
      type: Array as PropType<EnergyMeasurement[]>,
      required: true,
    },
    alerts: {
      type: Array as PropType<EnergyAlert[]>,
      required: true,
    },
    kpis: {
      type: Object as PropType<DashboardKpis>,
      required: true,
    },
  },
  setup(props: DashboardProps) {
    const statusFilter = ref<DistrictStatusFilter>("all")
    const selectedDistrictId = ref<string | null>(null)
    const kpiCards = computed(() => buildKpiCards(props.kpis))

    const filteredDistricts = computed(() => {
      if (statusFilter.value === "all") {
        return props.districts
      }

      return props.districts.filter(
        (district) => district.status === statusFilter.value
      )
    })

    const selectedDistrict = computed(
      () =>
        filteredDistricts.value.find(
          (district) => district.id === selectedDistrictId.value
        ) ?? null
    )

    watch(filteredDistricts, (districts) => {
      if (
        selectedDistrictId.value &&
        !districts.some((district) => district.id === selectedDistrictId.value)
      ) {
        selectedDistrictId.value = null
      }
    })

    return () =>
      h(
        "main",
        {
          class:
            "min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10 lg:px-16",
        },
        [
          h(Head, { title: "FlexLoad Monitor" }),
          h("section", { class: "mx-auto flex max-w-6xl flex-col gap-10" }, [
            h("header", { class: "space-y-4" }, [
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
                "Synthetic energy load monitoring for fictional city districts"
              ),
            ]),
            h(
              "div",
              {
                class:
                  "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
              },
              kpiCards.value.map((kpi) => h(KpiCard, { key: kpi.title, ...kpi }))
            ),
            h("section", { class: "grid gap-6 lg:grid-cols-2" }, [
              h(
                "article",
                {
                  class:
                    "rounded-lg border border-slate-700/80 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20",
                },
                [
                  h(
                    "h2",
                    { class: "text-lg font-semibold leading-7 text-white" },
                    "Load trend"
                  ),
                  h(
                    "p",
                    { class: "mt-2 text-sm leading-6 text-slate-400" },
                    "Synthetic aggregate demand and PV output over the last 24 hours."
                  ),
                  h("div", { class: "mt-5" }, [
                    h(LoadTrendChart, {
                      measurements: props.measurements,
                    }),
                  ]),
                ]
              ),
              h(
                "article",
                {
                  class:
                    "rounded-lg border border-slate-700/80 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20",
                },
                [
                  h(
                    "h2",
                    { class: "text-lg font-semibold leading-7 text-white" },
                    "District map"
                  ),
                  h(
                    "p",
                    { class: "mt-2 text-sm leading-6 text-slate-400" },
                    "Schematic view of synthetic district coordinates and operating status."
                  ),
                  h("div", { class: "mt-5" }, [
                    h(StatusFilter, {
                      modelValue: statusFilter.value,
                      "onUpdate:modelValue": (value: DistrictStatusFilter) => {
                        statusFilter.value = value
                      },
                    }),
                  ]),
                  h("div", { class: "mt-5" }, [
                    h(DistrictMap, {
                      districts: filteredDistricts.value,
                      selectedDistrictId: selectedDistrictId.value,
                      onSelectDistrict: (districtId: string) => {
                        selectedDistrictId.value = districtId
                      },
                    }),
                  ]),
                ]
              ),
              h(DistrictDetailPanel, {
                district: selectedDistrict.value,
              }),
            ]),
            h(
              "section",
              {
                class:
                  "rounded-lg border border-slate-700/80 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20",
                "aria-labelledby": "recent-alerts-heading",
              },
              [
                h(
                  "div",
                  {
                    class:
                      "mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
                  },
                  [
                    h("div", null, [
                      h(
                        "h2",
                        {
                          id: "recent-alerts-heading",
                          class: "text-lg font-semibold leading-7 text-white",
                        },
                        "Recent alerts"
                      ),
                      h(
                        "p",
                        { class: "mt-2 text-sm leading-6 text-slate-400" },
                        "Latest synthetic operating alerts for fictional districts."
                      ),
                    ]),
                    h(
                      "p",
                      { class: "text-sm font-medium text-slate-300" },
                      "Showing latest 3"
                    ),
                  ]
                ),
                h(AlertPreviewList, {
                  alerts: props.alerts,
                  districts: props.districts,
                }),
              ]
            ),
          ]),
        ]
      )
  },
})
