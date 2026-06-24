import { Head } from "@inertiajs/vue3"
import axios from "axios"
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

export type DashboardProps = {
  districts: District[]
  measurements: EnergyMeasurement[]
  alerts: EnergyAlert[]
  kpis: DashboardKpis
}

const formatMegawatts = (kilowatts: number) => (kilowatts / 1000).toFixed(1)

const dashboardDataEndpoint = "/dashboard/data"

const copyDashboardProps = (props: DashboardProps): DashboardProps => ({
  districts: [...props.districts],
  measurements: [...props.measurements],
  alerts: [...props.alerts],
  kpis: { ...props.kpis },
})

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
    const dashboardData = ref<DashboardProps>(copyDashboardProps(props))
    const statusFilter = ref<DistrictStatusFilter>("all")
    const selectedDistrictId = ref<string | null>(null)
    const isRefreshing = ref(false)
    const refreshError = ref<string | null>(null)
    const lastUpdatedAt = ref(new Date())
    const kpiCards = computed(() => buildKpiCards(dashboardData.value.kpis))

    const filteredDistricts = computed(() => {
      if (statusFilter.value === "all") {
        return dashboardData.value.districts
      }

      return dashboardData.value.districts.filter(
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

    watch(
      () => props,
      (latestProps) => {
        dashboardData.value = copyDashboardProps(latestProps)
        lastUpdatedAt.value = new Date()
      },
      { deep: true }
    )

    const refreshDashboardData = async () => {
      if (isRefreshing.value) {
        return
      }

      isRefreshing.value = true
      refreshError.value = null

      try {
        const response = await axios.get<DashboardProps>(dashboardDataEndpoint, {
          headers: {
            Accept: "application/json",
          },
        })

        dashboardData.value = copyDashboardProps(response.data)
        lastUpdatedAt.value = new Date()
      } catch {
        refreshError.value =
          "Dashboard data could not be refreshed. The last successful snapshot is still shown."
      } finally {
        isRefreshing.value = false
      }
    }

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
            h("header", { class: "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" }, [
              h("div", { class: "space-y-4" }, [
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
              h("div", { class: "flex flex-col gap-3 sm:flex-row sm:items-center" }, [
                h(
                  "p",
                  {
                    class:
                      "text-sm font-medium leading-6 text-slate-400 sm:text-right",
                    role: "status",
                    "aria-live": "polite",
                  },
                  isRefreshing.value
                    ? "Refreshing data"
                    : `Updated ${lastUpdatedAt.value.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                ),
                h(
                  "button",
                  {
                    id: "dashboard-refresh-button",
                    type: "button",
                    class: [
                      "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950",
                      isRefreshing.value
                        ? "cursor-wait border-slate-600 bg-slate-800 text-slate-300"
                        : "border-sky-300/50 bg-sky-400/10 text-sky-100 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-400/20",
                    ],
                    disabled: isRefreshing.value,
                    "aria-busy": isRefreshing.value ? "true" : "false",
                    onClick: refreshDashboardData,
                  },
                  isRefreshing.value ? "Refreshing..." : "Refresh data"
                ),
              ]),
            ]),
            refreshError.value
              ? h(
                  "aside",
                  {
                    class:
                      "rounded-lg border border-amber-300/40 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100 shadow-xl shadow-slate-950/20",
                    role: "alert",
                  },
                  [
                    h(
                      "p",
                      { class: "font-semibold text-amber-50" },
                      "Data refresh failed"
                    ),
                    h("p", { class: "mt-1 text-amber-100/90" }, refreshError.value),
                  ]
                )
              : null,
            h(
              "div",
              {
                class: [
                  "grid grid-cols-1 gap-4 transition duration-200 sm:grid-cols-2 xl:grid-cols-3",
                  isRefreshing.value && "opacity-75",
                ],
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
                      measurements: dashboardData.value.measurements,
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
                  alerts: dashboardData.value.alerts,
                  districts: dashboardData.value.districts,
                }),
              ]
            ),
          ]),
        ]
      )
  },
})
