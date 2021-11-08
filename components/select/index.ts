import Select from "./src/index.vue"
import type { App, Plugin } from "vue"
import "./style/index.scss"

Select.install = (app: App) => {
  app.component(Select.name, Select)
}

export default Select as typeof Select & Plugin