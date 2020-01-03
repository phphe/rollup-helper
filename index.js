// const path = require('path')
// const fs = require('fs')
const babel = require('rollup-plugin-babel')
const alias = require('@rollup/plugin-alias')
const cjs = require('@rollup/plugin-commonjs')
const replace = require('@rollup/plugin-replace')
const node = require('@rollup/plugin-node-resolve')
const json = require('@rollup/plugin-json')
const {terser} = require('rollup-plugin-terser')
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

function defaultBanner(pkg) {
  return `
/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${pkg.author}
 * Released under the ${pkg.license} License.
 */`.trim()
}

function defaultPlugins(opt = {}) {
  return [
    babel({
      runtimeHelpers: true,
      exclude: [/^.*?node_modules\/.+$/],
      ...opt.babel
    }),
    node({...opt.node}),
    cjs({...opt.cjs}),
    json({...opt.json}),
  ];
}
const babelTargetEsmodules = {
  babelrc: false,
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: false,
      "targets": {
        "esmodules": true,
      },
    }]
  ],
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
// build region =============
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const zlib = require('zlib')
const rollup = require('rollup')

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry (config) {
  const output = config.output
  const isZip = Boolean(config.plugins.find(v => v.name === 'terser'))
  const { file, banner } = output
  return rollup.rollup(config)
    .then(bundle => bundle.generate(output))
    .then(async bundle => {
      const {code, map} = bundle.output[0]
      if (output.sourcemap) {
        const mapPath = `${file}.map`
        await write(mapPath, map.toString())
      }
      await write(file, code, isZip)
    })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }
    mkdirp.sync(path.dirname(dest))
    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

// export region ==================================
module.exports = {
  defaultPlugins,
  defaultBanner,
  camelCase,
  studlyCase,
  babelTargetEsmodules,
  belongsTo,
  alias,
  replace,
  terser,
  // build
  build,
  buildEntry,
  write,
  getSize,
  logError,
  blue,
}
