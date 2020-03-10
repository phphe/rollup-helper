# rogo 2
**Document expired. New documentation is being written. 文档过期了, 新文档正在撰写中.**
本库旨在零配置快速打包js库. 如果你想更多功能, 请参考源码`index.js`, `cli.js`, 不多.
This library aims to quickly package js libraries with zero configuration. If you want more features, please refer to the source code `index.js`,` cli.js`.

* js库快速打包. Bundle js libray quickly.
* 少配置. less config.
* 使用rollup. `rollup` used.
* `src/index.js` => cjs, esm, umd, umd-min.
* 支持Vue. Vue supported.

```sh
npm i -D rogo
```
As a lib, @babel/runtime is required. Add follow into `dependencies` of `package.json`
@babel/runtime必须, 加到`dependencies`
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
## Other
本库使用了rollup. 参考了vue, bili.
This library uses rollup. References vue, bili.
