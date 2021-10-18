import Scrollbar from "./src/index.vue"
import type { App, Plugin } from "vue"
import "./style/index.scss"

Scrollbar.install = (app: App): void => {
  app.component(Scrollbar.name, Scrollbar)
}

export default Scrollbar as typeof Scrollbar & Plugin