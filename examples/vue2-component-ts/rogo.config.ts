import {
  getConfig,
  GetConfigOptions,
  defaultBabelTargets,
  rollupPluginVue5Fix,
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
      vue()
      // extract css
      // vue({css: false}),
      // postcss({ extract: "index.css" }),
      // rollupPluginPostcssFix()
    );
    if (config.output.format === "cjs") {
      config.plugins.unshift(rollupPluginVue5Fix());
    }
    return config;
  },
};

export default [
  getConfig({ ...options, format: "esm" }),
  getConfig({ ...options, format: "cjs" }),
  getConfig({ ...options, format: "umd", minify: true, sourcemap: true }),
];
