# rogo
```sh
npm i -D rogo
```
As a lib, @babel/runtime is required. Add follow into `dependencies` of `package.json`.
```json
"@babel/runtime": "^7.7.7",
```
Add follow into `package.json`.
```json
"scripts": {
  "build": "rogo"
}
```
**Done**

## Vue
If you want bundle vue. Install plugin
```sh
npm i -D rollup-plugin-vue
```
Add follow into `dependencies` of `package.json`.
```json
"vue-runtime-helpers": "^1.1.2",
```
**Done**

## Use config file
Create rogo.config.js
```js
const pkg = require('./package.json');
module.exports = {
  input: 'src/index.js',
  outputName: pkg.name, // ouput file name without suffix
  moduleName: 'custom moduleName',
  sourceMap: false,
  banner: 'custom banner',
}
```
