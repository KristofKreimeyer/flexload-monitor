import "phoenix_html"

import { createInertiaApp } from "@inertiajs/vue3"
import axios from "axios"
import { createApp, h, type DefineComponent } from "vue"

axios.defaults.xsrfHeaderName = "x-csrf-token"

const pages = {
  Dashboard: () => import("./pages/Dashboard").then((page) => page.default),
}

createInertiaApp({
  resolve: async (name) => {
    const page = pages[name as keyof typeof pages]

    if (!page) {
      throw new Error(`Unknown Inertia page: ${name}`)
    }

    return (await page()) as DefineComponent
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
})
