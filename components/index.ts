import type { App } from "vue";
import * as components from "./components";

export * from "./components";

let a = typeof components
const install = (app: App): void => {
  Object.keys(components).forEach(key => {
    const component = components[key];
    if (component.install) {
      app.use(component);
    }
  })
};

export default {
  install,
};