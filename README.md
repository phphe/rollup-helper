# rollup-helper
遇到了很多打包js库的问题, 使用过[egoist/bili](https://github.com/egoist/bili), 遇到了corejs3+rollup的bug, runtime, polyfill, 研究了vue本身的打包, 最后还是每个库依次看文档, 弄懂了打包的相关问题, 折腾了几天, 这是成果, 可以直接用.   
I encountered a lot of problems with packaging js libraries. I tried [egoist/bili](https://github.com/egoist/bili), got corejs3 + rollup bugs, runtime, polyfill, tried the packaging of vue itself. Finally, I read all documentation of each library, and understood the problems related to packaging. This has bothered me for a few days. Now you can use the library to help bundling js library.
## 特点和注意的点
* 第三方库源码不应包含进cjs和esm打包结果, 应当添加进external. 所以如果引入了其他库, 请配置config.js里的external_cjs_esm.
* 建议使用webpack打包vue.
* 尝试过vue的打包代码, 但是vue使用buble而不是babel, 新语法处理不了.
* core-js@3和rollup一起有个bug, core-js如果引入了parseInt和parseFloat, 就会报错. 所以打包成umd时把这俩作为了外部包, 不包含进源码, 基本不影响, 除非运行umd的浏览器连这两个函数都不支持.
* 可以使用browserslist或@babel/preset-env的targets选项配置目标环境. 推荐不写, 默认选项覆盖了90%(浏览器?), 作为库是可以了. [babel-preset-env](https://babeljs.io/docs/en/babel-preset-env)
* 解决了`regeneratorruntime is not defined`.
* rollup正在把插件移入@rollup, 但是rollup-plugin-babel还没有. rollup-plugin-babel自定义babel配置好像对babel7无效, 所以目前只能使用babel.config.js全局配置.
## Features and important points
* The third-party library source code should not be included in the cjs and esm bundle. So mark them as external. So if other libraries are imported, please configure `external_cjs_esm` in `config.js`.
* Support bundle vue with webpack.
* Have tried vue's packaging code, but it vue uses bubble instead of babel, the new syntax can't handle.
* There is a bug with core-js@3 and rollup. If core-js insert parseInt and parseFloat, it will cause error. So when packaged into umd, these two are set as external packages, which are not included in the bundle code. It will break if running UMD's browser does not support these two functions.
* You can use browserslist or `targets` option of @babel/preset-env to configure the target environment. It is recommended to use default. The default option covers 90% (browser?), as a library is ok. [babel-preset-env] (https://babeljs.io/docs/en/babel-preset-env)
* Resolved `regeneratorruntime is not defined`.
* Rollup is moving plugins into @rollup, but rollup-plugin-babel has not yet. The rollup-plugin-babel custom babel configuration does not seem to be valid for babel7, so currently only global configuration(`babel.config.js`) can be used.
```sh
npm i -D rollup-helper
```
安装后, 复制以下内容到你的package.json   
After installation, copy the following to your package.json
```json
"scripts": {
  "build": "node scripts/build.js",
  "dev": "rollup -w -c scripts/config.js --environment TARGET:umd",
  "build:esm": "rollup -c scripts/config.js --environment TARGET:esm",
  "dev:esm": "rollup -w -c scripts/config.js --environment TARGET:esm"
},
```
复制以下依赖到你的package.json的dependencies   
copy to `dependencies` of `package.json`
```json
"core-js": "^3.6.1",
"@babel/runtime": "^7.7.7",
```
复制以下内容到你的babel配置文件(例如`babel.config.js`). 仅针对一般js库项目.   
Copy the following into your babel configuration file (eg `babel.config.js`). Only for normal js library projects.
```js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3,
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    // Stage 2
   '@babel/plugin-proposal-export-namespace-from',
    // Stage 3
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { 'loose': true }],
    '@babel/plugin-proposal-json-strings',
  ],
}
```

复制`scripts`文件夹到你的项目根目录. 如果你的入口文件为`./src/index.js`或`./src/{package.name}.js`, 就搞定啦. 否则请修改`scripts/config.js`   
Copy the `scripts` folder to your project root directory. If your entry file is `./src/index.js` or `./src/{package.name}.js`, all done. Otherwise, please modify `scripts/config.js`.

scripts文件夹是简化过的版本, 一些函数是从本库引入. 如果想使用全部的打包相关代码以便自己更改, 请用`scripts-full`替代`scripts`   
The scripts folder is a simplified version. Some functions are imported from this library. If you want to use all the packaging related code for your own changes, please use `scripts-full` instead of` scripts`.
