# rollup-helper
help you to bundle a library to commonjs, esm, umd, umd.min with rollup quickly
```sh
// install
npm install rollup-helper -D
```
then add build/build.js
```
var rollupHelper = require('rollup-helper')
rollupHelper.package = require('../package.json')
rollupHelper.compileDir('./src', './dist')

```
it will bundle all js file in src(subdirectories excluded)

# done
bundle with rollup-helper
  1. [helper-js](https://github.com/phphe/helper-js)
  2. [date-functions](https://github.com/phphe/date-functions)
