// const path = require('path')
// const fs = require('fs')
const babel = require('rollup-plugin-babel')
const alias = require('@rollup/plugin-alias')
const cjs = require('@rollup/plugin-commonjs')
const replace = require('@rollup/plugin-replace')
const node = require('@rollup/plugin-node-resolve')
const json = require('@rollup/plugin-json')
const {terser} = require('rollup-plugin-terser')
const postcss = require('rollup-plugin-postcss')
let vue
try {
  vue = require('rollup-plugin-vue')
  console.log('rollup-plugin-vue founded. It will be used.');
} catch (e) {}

// config region ===================
function studlyCase (str) {
  return str && (str[0].toUpperCase() + str.substr(1))
}
function camelCase (str) {
  const temp = str.toString().split(/[-_]/)
  for (let i = 1; i < temp.length; i++) {
    temp[i] = studlyCase(temp[i])
  }
  return temp.join('')
}

function getBanner(pkg) {
  return `
/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${pkg.author}
 * Released under the ${pkg.license} License.
 */`.trim()
}

function belongsTo(source, dependencePatterns) {
  for (const pattern of dependencePatterns) {
    if (pattern.test) {
      // regexp
      if (pattern.test(source)) {
        return true
      }
    } else if (source.startsWith(pattern)) {
      return true
    }
  }
}

function getPlugins(opt={}) {
  /*
  opt = {bable: {}, node: {}, cjs: {}, json: {}, vue: {}, postcss: {}, isCjs}
   */
  const babelConfig = getBabel({esmodules: opt.esmodules, vue})
  if (opt.isCjs) {
    // replace extension .mjs to .js in cjs
    babelConfig.plugins.push(['module-extension', {mjs: 'js'}])
  }
  const plugins = [
    babel({
      runtimeHelpers: true,
      exclude: [/@babel\/runtime/, /@babel\\runtime/, /regenerator-runtime/],
      extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.vue'],
      babelrc: false,
      ...babelConfig,
      ...opt.babel,
    }),
    node({
      ...opt.node,
    }),
    cjs({
      ...opt.cjs,
    }),
    json({
      ...opt.json,
    }),
  ];
  if (vue) {
    // vue must before babel
    plugins.unshift(
      postcss({
        extract: true,
        ...opt.postcss,
      }),
      vue({
        css: false,
        ...opt.vue,
      })
    )
  }
  return plugins
}

function get_cjs_esm_plugins(opt={}) {
  opt = {
    esmodules: true,
    ...opt,
  }
  return getPlugins(opt)
}
function get_umd_plugins(opt={}) {
  return getPlugins(opt)
}
// build region =============
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const zlib = require('zlib')
const rollup = require('rollup')

async function build (builds) {
  const report = {}
  for (const config of builds) {
    const bundle = await rollup.rollup(config)
    const generated = await bundle.generate(config.output)
    const dir = path.dirname(config.output.file)
    const files = [];
    generated.output.forEach(({code, map, fileName}) => {
      files.push(fileName)
      if (map) {
        files.push(fileName + '.map')
      }
    })
    await bundle.write(config.output)
    for (const fileName of files) {
      const filePath = path.resolve(dir, fileName)
      // remove *.format.css[.map]
      if (fileName.match(/\.\w+\.css/)) {
        delete report[fileName]
        fs.unlinkSync(filePath)
      } else {
        const item = {}
        const code = fs.readFileSync(filePath)
        item.size = getSize(code)
        item.sizeGzipped = getSize(zlib.gzipSync(code))
        console.log(blue(`${fileName} generated`));
        report[fileName] = item
      }
    }
  }
  console.table(report);
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + ' KiB'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
function getBabel(opt={}) {
  opt = {
    esmodules: false,
    vue: false,
    ...opt,
  }
  if (opt.vue) {
    return {
      presets: [
        ['@vue/cli-plugin-babel/preset', {
          useBuiltIns: false,
          targets: {
            esmodules: opt.esmodules,
          },
          polyfills: [],
        }],
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
        ['@babel/plugin-proposal-optional-chaining', { 'loose': false }],
      ],
    }
  }
  return {
    presets: [
      ['@babel/preset-env', {
        useBuiltIns: false,
        targets: {
          esmodules: opt.esmodules,
        },
      }]
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
      // Stage 1
      ['@babel/plugin-proposal-optional-chaining', { 'loose': false }],
      // Stage 2
     '@babel/plugin-proposal-export-namespace-from',
      // Stage 3
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      ['@babel/plugin-proposal-class-properties', { 'loose': true }],
      '@babel/plugin-proposal-json-strings',
    ],
  }
}
// export region ==================================
module.exports = {
  getBanner,
  camelCase,
  studlyCase,
  belongsTo,
  alias,
  replace,
  terser,
  vue,
  postcss,
  getBabel,
  getPlugins,
  get_cjs_esm_plugins,
  get_umd_plugins,
  // build
  build,
  getSize,
  logError,
  blue,
}
