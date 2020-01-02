// From vue. 参考vue
// https://github.com/vuejs/vue/blob/dev/scripts/config.js
const path = require('path')
const fs = require('fs')
const babel = require('rollup-plugin-babel')
const alias = require('@rollup/plugin-alias')
const cjs = require('@rollup/plugin-commonjs')
const replace = require('@rollup/plugin-replace')
const node = require('@rollup/plugin-node-resolve')
const json = require('@rollup/plugin-json')
const {terser} = require('rollup-plugin-terser')
const mkdirp = require('mkdirp')

function genConfig ({name, pkg, aliases, builds}) {
  const opts = builds[name]
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      alias(Object.assign({}, aliases, opts.alias)),
      ...opts.plugins,
    ],
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner || getDefaultBanner(pkg),
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

function defaultPlugins() {
  return [
    babel({
      runtimeHelpers: true,
      exclude: ['node_modules/**'],
    }),
    node(),
    cjs(),
    json(),
  ];
}
function getDefaultBanner(pkg) {
  return `
/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${pkg.author}
 * Released under the ${pkg.license} License.
 */`.trim()
}
// build region =======================================
const zlib = require('zlib')
const rollup = require('rollup')

function filterBuilds(builds) {
  // filter builds via command line arg
  if (process.argv[2]) {
    const filters = process.argv[2].split(',')
    builds = builds.filter(b => {
      return filters.some(f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1)
    })
  }
  return builds
}

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
const parseIntFloat = ['core-js/modules/es.parse-int', 'core-js/modules/es.parse-float'];
// export region ==================================
module.exports = {
  defaultPlugins,
  getDefaultBanner,
  camelCase,
  studlyCase,
  genConfig,
  // build
  build,
  filterBuilds,
  buildEntry,
  write,
  getSize,
  logError,
  blue,
  parseIntFloat,
}
