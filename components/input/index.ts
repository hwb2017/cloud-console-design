import type { App, Plugin } from "vue"
import Input from "./src/index.vue"
import Password from "./src/input-password.vue"
import TextArea from "./src/input-textarea.vue"
import Number from "./src/input-number.vue"
import "./style/index.scss"

Input.Password = Password
Input.TextArea = TextArea
Input.Number = Number

Input.install = (app: App): void => {
  app.component(Input.name, Input)
  app.component(Input.Password.name, Input.Password)
  app.component(Input.TextArea.name, Input.TextArea)
  app.component(Input.Number.name, Input.Number)
}

export default Input as typeof Input &
  Plugin & 
  {
    readonly Password: typeof Password
    readonly TextArea: typeof TextArea
    readonly Number: typeof Number
  }