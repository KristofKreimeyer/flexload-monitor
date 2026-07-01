import { LineChart, type LineSeriesOption } from "echarts/charts"
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  type GridComponentOption,
  type LegendComponentOption,
  type TooltipComponentOption,
} from "echarts/components"
import {
  init,
  use,
  type ComposeOption,
  type EChartsType,
} from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue"
import type { EnergyMeasurement } from "../domain/types"

use([
  GridComponent,
  LegendComponent,
  LineChart,
  TooltipComponent,
  CanvasRenderer,
])

type LoadTrendChartOption = ComposeOption<
  | GridComponentOption
  | LegendComponentOption
  | LineSeriesOption
  | TooltipComponentOption
>

type TrendPoint = {
  label: string
  currentLoadMw: number
  pvGenerationMw: number
}

// Converts backend kilowatt values into megawatts for chart labels and series data.
const formatMegawatts = (kilowatts: number) => (kilowatts / 1000).toFixed(1)

// Formats UTC measurement timestamps into compact hour labels.
const formatHour = (value: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value))

// Finds the measurement with the highest value for the requested measurement key.
const maxBy = (
  measurements: EnergyMeasurement[],
  key: "currentLoadKw" | "pvGenerationKw"
) =>
  measurements.reduce<EnergyMeasurement | null>(
    (highest, measurement) =>
      highest === null || measurement[key] > highest[key]
        ? measurement
        : highest,
    null
  )

export default defineComponent({
  name: "LoadTrendChart",
  props: {
    measurements: {
      type: Array as PropType<EnergyMeasurement[]>,
      required: true,
    },
  },
  setup(props) {
    const chartElement = ref<HTMLDivElement | null>(null)
    let chart: EChartsType | null = null
    let resizeObserver: ResizeObserver | null = null

    // Keeps chart input chronological even if the backend payload order changes later.
    const sortedMeasurements = computed(() =>
      [...props.measurements].sort(
        (first, second) =>
          Date.parse(first.measuredAt) - Date.parse(second.measuredAt)
      )
    )

    // Converts backend measurements into the chart's display units.
    const trendPoints = computed<TrendPoint[]>(() =>
      sortedMeasurements.value.map((measurement) => ({
        label: formatHour(measurement.measuredAt),
        currentLoadMw: Number(formatMegawatts(measurement.currentLoadKw)),
        pvGenerationMw: Number(formatMegawatts(measurement.pvGenerationKw)),
      }))
    )

    // Tracks the newest measurement for the chart summary and statistics.
    const latestMeasurement = computed(() =>
      sortedMeasurements.value.length > 0
        ? sortedMeasurements.value[sortedMeasurements.value.length - 1]
        : null
    )

    // Finds the highest synthetic load point in the current series.
    const peakLoad = computed(() =>
      maxBy(sortedMeasurements.value, "currentLoadKw")
    )

    // Finds the highest synthetic PV generation point in the current series.
    const peakPv = computed(() =>
      maxBy(sortedMeasurements.value, "pvGenerationKw")
    )

    // Produces an accessible text summary of the visual chart.
    const summary = computed(() => {
      if (!latestMeasurement.value || !peakLoad.value || !peakPv.value) {
        return "No synthetic 24-hour load trend data is available."
      }

      return [
        `Across the synthetic 24-hour profile, load peaks at ${formatMegawatts(
          peakLoad.value.currentLoadKw
        )} MW around ${formatHour(peakLoad.value.measuredAt)}.`,
        `PV generation peaks at ${formatMegawatts(
          peakPv.value.pvGenerationKw
        )} MW around ${formatHour(peakPv.value.measuredAt)}.`,
        `The latest point shows ${formatMegawatts(
          latestMeasurement.value.currentLoadKw
        )} MW current load and ${formatMegawatts(
          latestMeasurement.value.pvGenerationKw
        )} MW PV generation.`,
      ].join(" ")
    })

    // Creates or updates the ECharts instance from the latest computed trend points.
    const renderChart = () => {
      if (!chartElement.value) {
        return
      }

      chart ??= init(chartElement.value, null, {
        renderer: "canvas",
      })

      const option: LoadTrendChartOption = {
        animationDuration: 650,
        backgroundColor: "transparent",
        color: ["#38bdf8", "#facc15"],
        grid: {
          left: 56,
          right: 24,
          top: 52,
          bottom: 44,
        },
        legend: {
          top: 8,
          right: 8,
          textStyle: {
            color: "#cbd5e1",
            fontSize: 12,
          },
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(15, 23, 42, 0.94)",
          borderColor: "rgba(148, 163, 184, 0.28)",
          textStyle: {
            color: "#f8fafc",
          },
          valueFormatter: (value) =>
            typeof value === "number" ? `${value.toFixed(1)} MW` : `${value}`,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: trendPoints.value.map((point) => point.label),
          axisLabel: {
            color: "#94a3b8",
            margin: 14,
          },
          axisLine: {
            lineStyle: {
              color: "rgba(148, 163, 184, 0.35)",
            },
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          name: "MW",
          nameTextStyle: {
            color: "#94a3b8",
            padding: [0, 0, 8, 0],
          },
          splitLine: {
            lineStyle: {
              color: "rgba(148, 163, 184, 0.12)",
            },
          },
          axisLabel: {
            color: "#94a3b8",
            formatter: "{value}",
          },
        },
        series: [
          {
            name: "Current load",
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 7,
            lineStyle: {
              width: 3,
            },
            areaStyle: {
              color: "rgba(56, 189, 248, 0.12)",
            },
            data: trendPoints.value.map((point) => point.currentLoadMw),
          },
          {
            name: "PV generation",
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 7,
            lineStyle: {
              width: 3,
            },
            areaStyle: {
              color: "rgba(250, 204, 21, 0.1)",
            },
            data: trendPoints.value.map((point) => point.pvGenerationMw),
          },
        ],
      }

      chart.setOption(option)
    }

    watch(
      trendPoints,
      () => {
        renderChart()
      },
      { deep: true }
    )

    onMounted(() => {
      renderChart()

      if (chartElement.value) {
        resizeObserver = new ResizeObserver(() => chart?.resize())
        resizeObserver.observe(chartElement.value)
      }
    })

    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
      chart?.dispose()
      resizeObserver = null
      chart = null
    })

    return () =>
      h("div", { class: "space-y-5" }, [
        h(
          "p",
          {
            id: "load-trend-summary",
            class:
              "rounded-lg border border-slate-700/80 bg-slate-900/55 p-4 text-sm leading-6 text-slate-300",
          },
          summary.value
        ),
        h(
          "div",
          {
            ref: chartElement,
            class:
              "h-80 w-full rounded-lg border border-slate-700/80 bg-slate-950/55",
            role: "img",
            "aria-describedby": "load-trend-summary",
            "aria-label":
              "Line chart comparing synthetic current load and PV generation over 24 hours",
          },
          []
        ),
        h(
          "dl",
          {
            class: "grid gap-3 text-sm text-slate-300 sm:grid-cols-3",
            "aria-label": "Load trend statistics",
          },
          [
            h("div", { class: "rounded-lg bg-slate-900/55 p-4" }, [
              h(
                "dt",
                {
                  class:
                    "text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
                },
                "Peak load"
              ),
              h(
                "dd",
                { class: "mt-1 font-semibold text-slate-100" },
                peakLoad.value
                  ? `${formatMegawatts(peakLoad.value.currentLoadKw)} MW at ${formatHour(
                      peakLoad.value.measuredAt
                    )}`
                  : "Not available"
              ),
            ]),
            h("div", { class: "rounded-lg bg-slate-900/55 p-4" }, [
              h(
                "dt",
                {
                  class:
                    "text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
                },
                "Peak PV"
              ),
              h(
                "dd",
                { class: "mt-1 font-semibold text-slate-100" },
                peakPv.value
                  ? `${formatMegawatts(peakPv.value.pvGenerationKw)} MW at ${formatHour(
                      peakPv.value.measuredAt
                    )}`
                  : "Not available"
              ),
            ]),
            h("div", { class: "rounded-lg bg-slate-900/55 p-4" }, [
              h(
                "dt",
                {
                  class:
                    "text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
                },
                "Latest point"
              ),
              h(
                "dd",
                { class: "mt-1 font-semibold text-slate-100" },
                latestMeasurement.value
                  ? `${formatMegawatts(
                      latestMeasurement.value.currentLoadKw
                    )} MW load, ${formatMegawatts(
                      latestMeasurement.value.pvGenerationKw
                    )} MW PV`
                  : "Not available"
              ),
            ]),
          ]
        ),
      ])
  },
})
