import type { App, Plugin } from "vue"
import Input from "./src/index.vue"
import Password from "./src/input-password.vue"
import "./style/index.scss"

Input.Password = Password

Input.install = (app: App): void => {
  app.component(Input.name, Input)
  app.component(Input.Password.name, Input.Password)
}

export default Input as typeof Input &
  Plugin & 
  {
    readonly Password: typeof Password
  }