import * as rollup from "rollup";
import * as fs from "fs";
import * as hp from "helper-js";
import babel, * as babelExports from "@rollup/plugin-babel";
import node from "@rollup/plugin-node-resolve";
import { terser, Options as TerserOptions } from "rollup-plugin-terser"; // to minify bundle
import { default as cjs0 } from "@rollup/plugin-commonjs";
import { default as json0 } from "@rollup/plugin-json";
import { default as replace0 } from "@rollup/plugin-replace";
import { default as typescript20 } from "rollup-plugin-typescript2";
import { default as alias0 } from "@rollup/plugin-alias";
// don't convert follow to imponst xx from 'xx'
const cjs: typeof cjs0 = require("@rollup/plugin-commonjs");
const json: typeof json0 = require("@rollup/plugin-json");
const replace: typeof replace0 = require("@rollup/plugin-replace");
const alias: typeof alias0 = require("@rollup/plugin-alias");
const typescript2: typeof typescript20 = require("rollup-plugin-typescript2");
const babelPresetEnv = require("@babel/preset-env");
const babelPlugins = {
  "plugin-transform-runtime": require("@babel/plugin-transform-runtime"),
};

export {
  rollup,
  babel,
  babelExports,
  node,
  terser,
  TerserOptions,
  cjs,
  json,
  replace,
  alias,
  typescript2,
  babelPresetEnv,
  babelPlugins,
};

export function resolveUMDDependencies(pkg: any): string[] {
  return [
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];
}

export function resolveAllDependencies(pkg: any): string[] {
  return [
    ...resolveUMDDependencies(pkg),
    ...Object.keys(pkg.dependencies || {}),
  ];
}

export function belongsTo(
  source: string,
  dependencePatterns: (RegExp | string)[]
) {
  source = source.replace(/\\/g, "/");
  for (const pattern of dependencePatterns) {
    if (pattern instanceof RegExp) {
      if (pattern.test(source)) {
        return true;
      }
    } else {
      if (source === "pattern" || source.startsWith(pattern + "/")) {
        return true;
      }
      let full = "node_modules/" + pattern;
      if (source.endsWith(full) || source.includes(full + "/")) {
        return true;
      }
      // for path import
      if (source.endsWith("/" + pattern)) {
        return true;
      }
      if (source.includes("/" + pattern + "/")) {
        return true;
      }
    }
  }
}

export const defaultBabelTargets =
  "defaults and supports es6-module and supports es6-module-dynamic-import, not opera > 0, not samsung > 0, not and_qq > 0"; // coverage 85%. check: https://browserslist.dev/?q=ZGVmYXVsdHMgYW5kIHN1cHBvcnRzIGVzNi1tb2R1bGUgYW5kIHN1cHBvcnRzIGVzNi1tb2R1bGUtZHluYW1pYy1pbXBvcnQsIG5vdCBvcGVyYSA%2BIDAsIG5vdCBzYW1zdW5nID4gMCwgbm90IGFuZF9xcSA%2BIDA%3D

export function getBabelConfig(targets?: string) {
  if (!targets) {
    targets = defaultBabelTargets;
  }
  return {
    // .babelrc
    presets: [
      [
        babelPresetEnv,
        {
          useBuiltIns: false,
          targets,
        },
      ],
    ],
    plugins: [babelPlugins["plugin-transform-runtime"]],
    // for rollup babel plugin
    babelHelpers: "runtime",
    exclude: [
      /@babel\/runtime/,
      /@babel\\runtime/,
      /regenerator-runtime/,
      /tslib/,
    ],
    extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".vue", ".ts", ".tsx"],
    babelrc: false,
  };
}

const declarationConfigured: { [input: string]: boolean } = {};
export type DefaultConfig = ReturnType<typeof getConfig>;
export type GetConfigOptions = Parameters<typeof getConfig>[0];
export type BabelOptions = Parameters<typeof babel>[0];
export type Typescript2Options = Parameters<typeof typescript2>[0];
export function getConfig(opt: {
  format: "esm" | "cjs" | "umd" | "iife";
  input?: rollup.RollupOptions["input"];
  outputFile?: string;
  targets?: string;
  minify?: boolean; // for umd
  sourcemap?: rollup.OutputOptions["sourcemap"];
  name?: rollup.OutputOptions["name"]; // for umd, iife
  globals?: rollup.OutputOptions["globals"];
  banner?: rollup.OutputOptions["banner"] | boolean;
  typescript?: boolean;
  handleBabelConfig?: (config: BabelOptions) => BabelOptions;
  handleTypescript2Config?: (config: Typescript2Options) => Typescript2Options;
  afterCreated?: (
    config: DefaultConfig
  ) => DefaultConfig | rollup.RollupOptions;
}) {
  let { input, format, outputFile } = opt;
  const isUMDOrIife = format === "umd" || format === "iife";
  if (input == null) {
    input = "src/index.ts";
    if (!fs.existsSync(input)) {
      input = "src/index.js";
    }
  }
  let isTS: boolean;
  if (opt.typescript != null) {
    isTS = opt.typescript;
  } else {
    // @ts-ignore
    isTS = !input.endsWith(".js");
  }
  if (!outputFile) {
    if (format === "umd") {
      outputFile = `dist/index.js`;
    } else {
      outputFile = `dist/index.${format}.js`;
    }
  }
  if (opt.banner == null) {
    opt.banner = true;
  }
  const pkg = JSON.parse(fs.readFileSync("./package.json").toString());
  const helperExternals = ["@babel/runtime", "tslib"];
  const allExternals = [...resolveAllDependencies(pkg), ...helperExternals];
  const umdExternals = [...resolveUMDDependencies(pkg)]; // umd, iife should bundle dependencies

  if (!opt.name) {
    const pkgName = pkg.name as string;
    opt.name = hp.camelCase(
      pkgName
        .replace(/[^\w]/g, "_")
        .replace(/__/g, "_")
        .replace(/^_/, "")
        .replace(/_$/, "")
    );
  }

  let typescriptConfig: Typescript2Options = {
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
        module: "ESNext",
        target: "ESNext",
        sourceMap: Boolean(opt.sourcemap),
      },
    },
  };
  if (format === "esm" || format === "cjs") {
    if (!declarationConfigured[input.toString()]) {
      typescriptConfig.tsconfigOverride.compilerOptions.declaration = true;
      declarationConfigured[input.toString()] = true;
    }
  }
  if (opt.handleTypescript2Config) {
    typescriptConfig = opt.handleTypescript2Config(typescriptConfig);
  }
  let babelConfig = getBabelConfig(
    opt.targets
  ) as babelExports.RollupBabelInputPluginOptions;
  if (opt.handleBabelConfig) {
    // @ts-ignore
    babelConfig = opt.handleBabelConfig(babelConfig);
  }
  const plugins = [node(), babel(babelConfig), json(), cjs()];
  if (isTS) {
    plugins.splice(1, 0, typescript2(typescriptConfig));
  }
  if (opt.minify) {
    plugins.push(terser());
  }
  let config = {
    input,
    external: (source: string) =>
      belongsTo(source, isUMDOrIife ? umdExternals : allExternals),
    plugins,
    output: {
      file: outputFile,
      format: format,
      sourcemap: opt.sourcemap,
      exports: "auto",
      name: opt.name,
    },
  };
  if (opt.banner === true) {
    config.output["banner"] = getBanner(pkg);
  } else if (opt.banner != null && opt.banner !== false) {
    config.output["banner"] = opt.banner;
  }
  if (isUMDOrIife) {
    if (opt.globals) {
      config.output["globals"] = opt.globals;
    }
  }
  if (opt.afterCreated) {
    config = opt.afterCreated(config) as DefaultConfig;
  }
  return config;
}

export function getBanner(pkg: any) {
  return `
/*!
 * ${pkg.name} v${pkg.version}
 * Author: ${pkg.author}
 * Homepage: ${pkg.homepage || null}
 * Released under the ${pkg.license} License.
 */`.trim();
}

/**
 * postcss plugin will import style-inject by a long path. This plugin replace it to name from path
 * from https://github.com/egoist/rollup-plugin-postcss/issues/381#issuecomment-880771065
 * @returns rollup plugin
 */
export function rollupPluginPostcssFix() {
  return {
    name: "rollup-plugin-postcss-fix",
    generateBundle: (options, bundle) => {
      Object.entries(bundle).forEach((entry) => {
        // @ts-ignore
        if (entry?.[1]?.code?.includes("/style-inject.es.js")) {
          // @ts-ignore
          bundle[entry[0]].code = entry[1].code.replace(
            /'.*?node_modules\/style\-inject\/dist\/style\-inject\.es\.js'/,
            "'style-inject'"
          );
        }
      });
    },
  };
}
export function rollupPluginVue5Fix() {
  // for vue2
  return {
    name: "rollup-plugin-vue5-fix",
    generateBundle: (options, bundle) => {
      Object.entries(bundle).forEach((entry) => {
        const replaces = {
          "/dist/normalize-component.mjs": "/dist/normalize-component.js",
          "/dist/inject-style/browser.mjs": "/dist/inject-style/browser.js",
        };
        for (const key of Object.keys(replaces)) {
          // @ts-ignore
          if (entry?.[1]?.code?.includes(key)) {
            // @ts-ignore
            bundle[entry[0]].code = entry[1].code.replace(key, replaces[key]);
          }
        }
      });
    },
  };
}
