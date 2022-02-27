import {
  getConfig,
  GetConfigOptions,
  defaultBabelTargets,
  rollupPluginPostcssFix,
} from "rogo";
import vueBabelPreset from "@vue/cli-plugin-babel/preset";
import postcss from "rollup-plugin-postcss";
import vue from "rollup-plugin-vue";

const options: Partial<GetConfigOptions> = {
  handleBabelConfig(config) {
    config.presets = [
      [
        vueBabelPreset,
        {
          useBuiltIns: false,
          targets: {
            browsers: defaultBabelTargets,
          },
        },
      ],
    ];
    return config;
  },
  afterCreated(config) {
    config.plugins.unshift(
      vue(),
      postcss({
        modules: {
          generateScopedName: "[path][local]-[hash:base64:4]",
        },
      }),
      rollupPluginPostcssFix()
    );
    return config;
  },
};

export default [
  getConfig({ ...options, format: "esm" }),
  getConfig({ ...options, format: "cjs" }),
  getConfig({ ...options, format: "umd", minify: true, sourcemap: true }),
];
