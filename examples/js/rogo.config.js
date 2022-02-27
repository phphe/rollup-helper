const { getConfig } = require("rogo");

const options = {};

module.exports = [
  getConfig({ ...options, format: "esm" }),
  getConfig({ ...options, format: "cjs" }),
  getConfig({ ...options, format: "umd", minify: true, sourcemap: true }),
];
