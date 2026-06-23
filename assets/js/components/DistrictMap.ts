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
import type {
  DivIcon,
  LatLngBoundsExpression,
  LatLngTuple,
  Map as LeafletMap,
  Marker,
} from "leaflet"
import type { District, DistrictStatus } from "../domain/types"

type LeafletModule = typeof import("leaflet")

type StatusDetails = {
  label: string
  shortLabel: string
  markerClass: string
  listClass: string
}

const statusDetails: Record<DistrictStatus, StatusDetails> = {
  normal: {
    label: "Normal",
    shortLabel: "OK",
    markerClass: "border-emerald-300 bg-emerald-400 text-slate-950",
    listClass: "bg-emerald-400/10 text-emerald-100 ring-emerald-300/25",
  },
  warning: {
    label: "Warning",
    shortLabel: "WA",
    markerClass: "border-amber-200 bg-amber-300 text-slate-950",
    listClass: "bg-amber-400/10 text-amber-100 ring-amber-300/30",
  },
  critical: {
    label: "Critical",
    shortLabel: "CR",
    markerClass: "border-rose-200 bg-rose-400 text-slate-950",
    listClass: "bg-rose-400/10 text-rose-100 ring-rose-300/35",
  },
}

const formatKilowatts = (kilowatts: number) =>
  new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(kilowatts)

const statusLabel = (status: DistrictStatus) => statusDetails[status].label

const districtLatLng = (district: District): LatLngTuple => [
  district.coordinates.latitude,
  district.coordinates.longitude,
]

const districtBounds = (districts: District[]): LatLngBoundsExpression =>
  districts.map((district) => districtLatLng(district))

const createMarkerIcon = (leaflet: LeafletModule, district: District): DivIcon =>
  leaflet.divIcon({
    className: "",
    html: [
      `<div class="grid h-10 w-10 place-items-center rounded-full border-2 text-[0.65rem] font-bold shadow-lg shadow-slate-950/45 ring-4 ring-slate-950/55 ${statusDetails[district.status].markerClass}">`,
      statusDetails[district.status].shortLabel,
      "</div>",
    ].join(""),
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  })

const appendMetric = (
  list: HTMLDListElement,
  label: string,
  value: string
) => {
  const row = document.createElement("div")
  row.className = "flex items-center justify-between gap-4"

  const term = document.createElement("dt")
  term.className = "text-slate-500"
  term.textContent = label

  const description = document.createElement("dd")
  description.className = "font-medium text-slate-900"
  description.textContent = value

  row.append(term, description)
  list.append(row)
}

const createPopupContent = (district: District) => {
  const container = document.createElement("article")
  container.className = "min-w-52 space-y-3"

  const heading = document.createElement("h3")
  heading.className = "text-sm font-semibold text-slate-950"
  heading.textContent = district.name

  const metrics = document.createElement("dl")
  metrics.className = "space-y-1.5 text-xs"

  appendMetric(metrics, "Status", statusLabel(district.status))
  appendMetric(metrics, "Current load", `${formatKilowatts(district.currentLoadKw)} kW`)
  appendMetric(metrics, "PV generation", `${formatKilowatts(district.pvGenerationKw)} kW`)
  appendMetric(metrics, "Active heat pumps", String(district.activeHeatPumps))
  appendMetric(metrics, "Active EV chargers", String(district.activeEvChargers))

  container.append(heading, metrics)

  return container
}

export default defineComponent({
  name: "DistrictMap",
  props: {
    districts: {
      type: Array as PropType<District[]>,
      required: true,
    },
  },
  setup(props) {
    const mapElement = ref<HTMLDivElement | null>(null)
    let leaflet: LeafletModule | null = null
    let map: LeafletMap | null = null
    let markers: Marker[] = []
    let resizeObserver: ResizeObserver | null = null

    const districtTotals = computed(() =>
      props.districts.reduce(
        (totals, district) => ({
          loadKw: totals.loadKw + district.currentLoadKw,
          pvKw: totals.pvKw + district.pvGenerationKw,
          warningCount:
            totals.warningCount + (district.status === "warning" ? 1 : 0),
          criticalCount:
            totals.criticalCount + (district.status === "critical" ? 1 : 0),
        }),
        { loadKw: 0, pvKw: 0, warningCount: 0, criticalCount: 0 }
      )
    )

    const summary = computed(() => {
      if (props.districts.length === 0) {
        return "No synthetic district map data is available."
      }

      return [
        `${props.districts.length} fictional districts are shown on the schematic map.`,
        `Combined current load is ${formatKilowatts(
          districtTotals.value.loadKw
        )} kW with ${formatKilowatts(districtTotals.value.pvKw)} kW of PV generation.`,
        `${districtTotals.value.warningCount} districts are in warning status and ${districtTotals.value.criticalCount} are critical.`,
      ].join(" ")
    })

    const renderMarkers = () => {
      if (!leaflet || !map) {
        return
      }

      markers.forEach((marker) => marker.remove())
      markers = props.districts.map((district) =>
        leaflet!
          .marker(districtLatLng(district), {
            icon: createMarkerIcon(leaflet!, district),
            title: `${district.name}, status ${statusLabel(district.status)}`,
          })
          .bindPopup(createPopupContent(district), {
            closeButton: true,
            className: "district-map-popup",
          })
          .addTo(map!)
      )

      if (props.districts.length > 0) {
        map.fitBounds(districtBounds(props.districts), {
          padding: [34, 34],
          maxZoom: 13,
        })
      }
    }

    const initializeMap = async () => {
      if (!mapElement.value || map) {
        return
      }

      leaflet = await import("leaflet")
      map = leaflet.map(mapElement.value, {
        attributionControl: false,
        minZoom: 11,
        maxZoom: 15,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      renderMarkers()
      resizeObserver = new ResizeObserver(() => map?.invalidateSize())
      resizeObserver.observe(mapElement.value)
    }

    watch(
      () => props.districts,
      () => {
        renderMarkers()
      },
      { deep: true }
    )

    onMounted(() => {
      void initializeMap()
    })

    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
      markers.forEach((marker) => marker.remove())
      map?.remove()
      resizeObserver = null
      markers = []
      map = null
      leaflet = null
    })

    return () =>
      h("div", { class: "space-y-5" }, [
        h(
          "p",
          {
            id: "district-map-summary",
            class:
              "rounded-lg border border-slate-700/80 bg-slate-900/55 p-4 text-sm leading-6 text-slate-300",
          },
          summary.value
        ),
        h(
          "div",
          {
            ref: mapElement,
            class:
              "district-map h-80 w-full overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950/80",
            role: "img",
            "aria-describedby": "district-map-summary district-map-list-heading",
            "aria-label":
              "Schematic map with one marker for each fictional district",
          },
          []
        ),
        h("section", { class: "space-y-3", "aria-labelledby": "district-map-list-heading" }, [
          h(
            "h3",
            {
              id: "district-map-list-heading",
              class: "text-sm font-semibold leading-6 text-white",
            },
            "District status list"
          ),
          h(
            "ul",
            { class: "grid gap-3", "aria-label": "District status details" },
            props.districts.map((district) => {
              const status = statusDetails[district.status]

              return h(
                "li",
                {
                  key: district.id,
                  class:
                    "rounded-lg border border-slate-700/80 bg-slate-900/55 p-4 transition duration-200 hover:border-slate-500 hover:bg-slate-900/80",
                },
                [
                  h("article", { class: "space-y-3" }, [
                    h(
                      "header",
                      {
                        class:
                          "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
                      },
                      [
                        h(
                          "h4",
                          {
                            class:
                              "text-sm font-semibold leading-6 text-white",
                          },
                          district.name
                        ),
                        h(
                          "span",
                          {
                            class: [
                              "inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                              status.listClass,
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
                              status.shortLabel
                            ),
                            h("span", null, `Status: ${status.label}`),
                          ]
                        ),
                      ]
                    ),
                    h(
                      "dl",
                      {
                        class:
                          "grid gap-3 text-sm text-slate-300 sm:grid-cols-2",
                      },
                      [
                        h("div", null, [
                          h(
                            "dt",
                            {
                              class:
                                "text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
                            },
                            "Current load"
                          ),
                          h(
                            "dd",
                            { class: "mt-1 font-medium text-slate-100" },
                            `${formatKilowatts(district.currentLoadKw)} kW`
                          ),
                        ]),
                        h("div", null, [
                          h(
                            "dt",
                            {
                              class:
                                "text-xs font-medium uppercase tracking-[0.14em] text-slate-500",
                            },
                            "PV generation"
                          ),
                          h(
                            "dd",
                            { class: "mt-1 font-medium text-slate-100" },
                            `${formatKilowatts(district.pvGenerationKw)} kW`
                          ),
                        ]),
                      ]
                    ),
                  ]),
                ]
              )
            })
          ),
        ]),
      ])
  },
})
