const { merge } = require("webpack-merge");
const common = require("./webpack.config");

module.exports = merge(common, {
  mode: "development",
  devServer: {
    host: "localhost",
    port: 3000,
    open: true,
  },
});
