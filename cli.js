#!/usr/bin/env node

const program = require('commander');
const path = require('path')
const fs = require('fs')
const {camelCase, getBabel, belongsTo, build, getBanner} = require('./index');
const babel = require('rollup-plugin-babel')
const alias = require('@rollup/plugin-alias')
const cjs = require('@rollup/plugin-commonjs')
const replace = require('@rollup/plugin-replace')
const node = require('@rollup/plugin-node-resolve')
const json = require('@rollup/plugin-json')
const {terser} = require('rollup-plugin-terser')
const css = require('rollup-plugin-css-only')
const resolve = p => path.resolve(process.cwd(), p)
const pkg = require(resolve('./package.json'))
let vue
try {
  vue = require('rollup-plugin-vue')
  console.log('rollup-plugin-vue founded. It will be used.');
} catch (e) {}

let options
try {
  options = require(resolve('./rogo.config.js'))
  console.log('config file founded. It will be used.');
} catch (e) {}

program
.option('-i, --input', 'input file')
.option('-s, --source', 'source map')
program.parse(process.argv);

const input = resolve(program.input || 'src/index.js')
console.log(`Resolved input: ${input}`);
options = {
  input,
  outputName: pkg.name,
  moduleName: camelCase(pkg.name),
  sourceMap: program.source,
  ...options,
}
const cjs_esm_plugins = [
  babel({
    runtimeHelpers: true,
    exclude: [/@babel\/runtime/, /@babel\\runtime/, /regenerator-runtime/],
    extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.vue'],
    babelrc: false,
    ...getBabel({esmodules: true, vue}),
  }),
  node(),
  cjs(),
  json(),
];
const umd_plugins = [
  babel({
    runtimeHelpers: true,
    exclude: [/@babel\/runtime/, /@babel\\runtime/, /regenerator-runtime/],
    extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.vue'],
    babelrc: false,
    ...getBabel({esmodules: false, vue}),
  }),
  node(),
  cjs(),
  json(),
];
if (vue) {
  // vue must before babel
  cjs_esm_plugins.unshift(css(), vue({ css: false }))
  umd_plugins.unshift(css(), vue({ css: false }))
}
const builds = {
  'cjs': {
    entry: input,
    dest: resolve(`dist/${options.outputName}.cjs.js`),
    format: 'cjs',
    plugins: cjs_esm_plugins,
    banner: options.banner,
    external: source => belongsTo(source, Object.keys(pkg.dependencies||{})),
  },
  'esm': {
    entry: options.input,
    dest: resolve(`dist/${options.outputName}.esm.js`),
    format: 'es',
    plugins: cjs_esm_plugins,
    banner: options.banner,
    external: source => belongsTo(source, Object.keys(pkg.dependencies||{})),
  },
  'umd': {
    entry: options.input,
    dest: resolve(`dist/${options.outputName}.js`),
    format: 'umd',
    plugins: umd_plugins,
    banner: options.banner,
    moduleName: options.moduleName,
  },
  'umd-min': {
    entry: options.input,
    dest: resolve(`dist/${options.outputName}.min.js`),
    format: 'umd',
    plugins: umd_plugins,
    banner: options.banner,
    moduleName: options.moduleName,
    sourcemap: options.sourceMap,
  },
}
function genConfig (name) {
  const opts = builds[name]
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      alias(Object.assign({}, opts.alias)),
      ...opts.plugins,
    ],
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner || getBanner(pkg),
      name: opts.moduleName,
      sourcemap: opts.sourcemap,
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }

  // built-in vars
  const vars = {}
  // build-specific env
  if (opts.env) {
    vars['process.env.NODE_ENV'] = JSON.stringify(opts.env)
  }
  if (Object.keys(vars).length > 0) {
    config.plugins.push(replace(vars))
  }
  const isProd = /(min|prod)\.js$/.test(config.output.file)
  if (isProd) {
    config.plugins.push(terser())
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

const rollupBuilds = Object.keys(builds).map(genConfig)
build(rollupBuilds)
