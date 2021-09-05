import type { App, Plugin } from "vue";
import Icon from "./src/index.vue";
import "./style/index.scss";

Icon.install = (app: App): void => {
    app.component(Icon.name, Icon)
}

export default Icon as typeof Icon & Plugin;