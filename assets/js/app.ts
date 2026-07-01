import "phoenix_html"

import { createInertiaApp } from "@inertiajs/vue3"
import axios from "axios"
import { createApp, h, type DefineComponent } from "vue"

axios.defaults.xsrfHeaderName = "x-csrf-token"

const pages = {
  // Lazily loads the Inertia page module requested by the Phoenix controller.
  Dashboard: () => import("./pages/Dashboard").then((page) => page.default),
}

createInertiaApp({
  // Converts an Inertia page name from the server into a Vue component.
  resolve: async (name) => {
    const page = pages[name as keyof typeof pages]

    if (!page) {
      throw new Error(`Unknown Inertia page: ${name}`)
    }

    return (await page()) as unknown as DefineComponent
  },
  // Mounts the resolved Inertia page into the DOM node rendered by Phoenix.
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
})
