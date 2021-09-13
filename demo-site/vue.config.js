/* eslint-disable @typescript-eslint/no-var-requires */
// const path = require("path");

module.exports = {
  configureWebpack: {
    mode: "production",
    optimization: {
      usedExports: true,
      minimize: true,
    },
  },
};
