const fs = require('fs')
const path = require('path')
const glob = require("glob")
const zlib = require('zlib')

export function report(dir:string='dist', extensions:string[]=['.js', '.css']) {
  const report = {}
  dir = dir.replace(/(\\|\/)$/, '')
  const filePaths:string[] = glob.sync(`${dir}/**/*`)
  for (const filePath of filePaths) {
    if (extensions.find(v => filePath.endsWith(v))) {
      const code = fs.readFileSync(filePath)
      const size = getSize(code)
      const sizeGzipped = getSize(zlib.gzipSync(code))
      report[filePath] = {size, sizeGzipped}
    } 
  }
  console.table(report);
  return report
}

export function getSize (code:string) {
  return (code.length / 1024).toFixed(2) + ' KiB'
}

export function belongsTo(source:string, dependencePatterns:(RegExp|string)[]) {
  for (const pattern of dependencePatterns) {
    if (pattern instanceof RegExp) {
      if (pattern.test(source)) {
        return true
      }
    } else if (source.startsWith(pattern)) {
      return true
    }
  }
}