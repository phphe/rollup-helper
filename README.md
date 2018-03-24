# rollup-helper
[查看中文文档](#ChineseDoc)  
help you to bundle a library to commonjs, esm, umd, umd.min with rollup quickly
```sh
// install
npm install rollup-helper -D
```
### usage
add build/build.js
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

<a name="ChineseDoc"></a>
# 中文
帮助你用rollup快速打包一个库到commonjs, esm, umd, umd.min
```sh
// install
npm install rollup-helper -D
```
### 使用
添加build/build.js
```
var rollupHelper = require('rollup-helper')
rollupHelper.package = require('../package.json')
rollupHelper.compileDir('./src', './dist')

```
src下的所有js文件(不含子目录)会被打包到dist

# 完成了
可以参考用此方法打包的其他项目
  1. [helper-js](https://github.com/phphe/helper-js)
  2. [date-functions](https://github.com/phphe/date-functions)
