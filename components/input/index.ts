import type { App, Plugin } from "vue"
import Input from "./src/index.vue"
import "./style/index.scss"

Input.install = (app: App): void => {
  app.component(Input.name, Input)
}

export default Input as typeof Input & Plugin