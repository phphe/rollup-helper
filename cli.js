#!/usr/bin/env node
const program = require('commander');
const path = require('path')
const fs = require('fs')
const {camelCase, getBabel, belongsTo, build, getBanner, get_cjs_esm_plugins, get_umd_plugins, blue} = require('./index');
const alias = require('@rollup/plugin-alias')
const replace = require('@rollup/plugin-replace')
const {terser} = require('rollup-plugin-terser')
const resolve = p => path.resolve(process.cwd(), p)
const pkg = require(resolve('./package.json'))

let options = {}
try {
  options = require(resolve('./rogo.config.js'))
  console.log(blue('config file(rogo.config.js) founded. It will be used.'));
} catch (e) {
  console.log(blue('You can use rogo.config.js to config.'));
}

program
.option('-i, --input', 'input file')
.option('-s, --source', 'source map')
program.parse(process.argv);

const input = resolve(program.input || 'src/index.js')
console.log(blue(`Resolved input: ${input}`));
options = {
  input,
  outputName: pkg.name,
  moduleName: camelCase(pkg.name),
  sourceMap: program.source,
  ...options,
}
const builds = {
  'cjs': {
    entry: input,
    dest: resolve(`dist/${options.outputName}.cjs.js`),
    format: 'cjs',
    plugins: get_cjs_esm_plugins({isCjs: true}),
    banner: options.banner,
    external: source => belongsTo(source, Object.keys(pkg.dependencies||{})),
  },
  'esm': {
    entry: options.input,
    dest: resolve(`dist/${options.outputName}.esm.js`),
    format: 'es',
    plugins: get_cjs_esm_plugins(),
    banner: options.banner,
    external: source => belongsTo(source, Object.keys(pkg.dependencies||{})),
  },
  'umd': {
    entry: options.input,
    dest: resolve(`dist/${options.outputName}.js`),
    format: 'umd',
    plugins: get_umd_plugins(),
    banner: options.banner,
    moduleName: options.moduleName,
  },
  'umd-min': {
    entry: options.input,
    dest: resolve(`dist/${options.outputName}.min.js`),
    format: 'umd',
    plugins: get_umd_plugins(),
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
