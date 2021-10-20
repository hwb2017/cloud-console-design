import Popover from "./src/index.vue"
import type { App, Plugin } from "vue"
import "./style/index.scss"

Popover.install = (app: App): void => {
  app.component(Popover.name, Popover)
}

export default Popover as typeof Popover & Plugin

export { Effect } from "./src/use-popper/type"