import type { App, Plugin } from "vue"
import Input from "./src/index.vue"
import Password from "./src/input-password.vue"
import TextArea from "./src/input-textarea.vue"
import "./style/index.scss"

Input.Password = Password
Input.TextArea = TextArea

Input.install = (app: App): void => {
  app.component(Input.name, Input)
  app.component(Input.Password.name, Input.Password)
  app.component(Input.TextArea.name, Input.TextArea)
}

export default Input as typeof Input &
  Plugin & 
  {
    readonly Password: typeof Password
    readonly TextArea: typeof TextArea
  }