import type { App, Plugin } from "vue"
import Tag from "./src/index.vue"
import "./style/index.scss"

Tag.install = (app: App): void => {
  app.component(Tag.name, Tag)
}

export default Tag as typeof Tag & Plugin