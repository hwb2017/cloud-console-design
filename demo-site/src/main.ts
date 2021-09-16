import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { CButton, CIcon } from "cloud-console-design";
import "cloud-console-design/dist/style/index.css";

const app = createApp(App);

app.use(CButton);
app.use(CIcon);

app.use(store).use(router).mount("#app");