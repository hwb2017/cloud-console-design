import type { App, Plugin } from "vue"
import Tabs from "./src/index"
import TabPanel from "./src/tab-panel.vue"
import "./style/index.scss"

Tabs.install = (app: App): void => {
  app.component(Tabs.name, Tabs)
  app.component(TabPanel.name, TabPanel)
};

Tabs.TabPanel = TabPanel.name

export default Tabs as typeof Tabs & Plugin & {
  readonly TabPanel: typeof TabPanel
}