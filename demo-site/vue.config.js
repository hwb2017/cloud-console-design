/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  configureWebpack: {
    mode: "production",
    optimization: {
      usedExports: true,
      minimize: true,
    },
    resolve: {
      alias: {
        vue: path.resolve("node_modules/vue"),
        "cloud-console-design/dist/style/index.css": path.resolve(
          "../dist/style/index.css"
        ),
        "cloud-console-design": path.resolve("../dist/components/index.js"),
      },
    },
  },
};
