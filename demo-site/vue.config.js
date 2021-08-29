/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        "cloud-console-design/dist/style/index.css": path.resolve(
          "../dist/style/index.css"
        ),
        "cloud-console-design": path.resolve("../dist/index.esm.js"),
      },
    },
  },
};
