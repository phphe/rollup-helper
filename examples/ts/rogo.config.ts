import { getConfig } from "rogo";

const options = {};

export default [
  getConfig({ ...options, format: "esm" }),
  getConfig({ ...options, format: "cjs" }),
  getConfig({ ...options, format: "umd", minify: true, sourcemap: true }),
];
