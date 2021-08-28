import type { App, Plugin } from "vue";
import Button from "./src/button.vue";
import "./style/index.scss"

Button.install = (app: App): void => {
  app.component(Button.name, Button)
};

export default Button as typeof Button & Plugin;