# rollup-helper
遇到了很多打包js库的问题, 使用过[egoist/bili](https://github.com/egoist/bili), 遇到了corejs3+rollup的bug, runtime, polyfill, 研究了vue本身的打包, 最后还是每个库依次看文档, 弄懂了打包的相关问题, 折腾了几天, 这是成果, 可以直接用.   
I encountered a lot of problems with packaging js libraries. I tried [egoist/bili](https://github.com/egoist/bili), got corejs3 + rollup bugs, runtime, polyfill, tried the packaging of vue itself. Finally, I read all documentation of each library, and understood the problems related to packaging. This has bothered me for a few days. Now you can use the library to help bundling js library.

## core-js
core-js是个好东西, 现在主版本是3. babel编译代码时, 可以根据目标环境附加对应的polyfill(从core-js引入). 通过babel.config.js里的[babel-preset-env](https://babeljs.io/docs/en/next/babel-preset-env.html) 控制.
但是js库不需要这一功能. 最终的项目需要这个功能, 用babel编译一遍项目代码和第三方库代码, 并附加polyfill.   
core-js is greate, now the main version is 3. When compiling the code in babel, it can attach the polyfill according to the target environment. Set in [babel-preset-env](https://babeljs.io/docs/en/next/babel-preset-env.html).
But the js library does not need this function. The final project needs this function, compile the project code and third-party library code with babel, and attach polyfill.

## polyfill, runtime, esm, umd
一般来说, esm和cjs是前端项目常用格式, umd是浏览器常用格式, 所以umd包使用了@babel/runtime, 目标环境是默认的, 覆盖90%的浏览器和其他环境, 不包含polyfill, 因为会导致结果太大. 现在直接用umd的比较少, 用的时候遇到兼容问题, 可以引入全部或对应的polyfill, 也可以克隆了更改browserlist自己编译. esm的目标环境是esmodules, 可以在支持es6 module的浏览器运行, 所以编译结果基本和源码一样. esm会把第三方模块和@babel/runtime作为外部模块, 而umd会引入它们的源码. esm的目标环境是esmodules, umd是默认(覆盖90%以上). esm的babel不编译node_modules里的模块, 而最终的项目的babel配置则需要再编译类第三方库的esm代码才能附加上对应的polyfill.   
In general, esm and cjs are common formats for front-end projects, and umd is a common format for browsers. So the umd package uses @babel/runtime. The target environment is the default, covering 90% of browsers and other environments, and does not include polyfill, because it will lead to too large results. It is relatively rare to use umd directly. When encountering compatibility problems with umd, you can introduce all or the part of polyfill, or clone and edit browserlist and compile it yourself. The target environment of esm is esmodules, which is supported in the new browsers. So the esm compilation result is basically the same as the source code. esm will mark third-party modules and @babel/runtime as external modules, but umd will introduce their source code. The target environment of esm is esmodules, and umd is the default (override 90% or more). Babel of esm does not compile the modules in node_modules, and the babel configuration of the final project needs to compile the esm code of the third-party library to add the corresponding polyfill.

## 特点和注意的点
* 参考了vue打包代码: https://github.com/vuejs/vue/tree/dev/scripts
* 第三方库源码不应包含进cjs和esm打包结果, 应当添加进external. 所以打包cjs和esm时, 所有package.json里的dependence被设置成外部依赖.
* 建议使用`egoist/bili`打包vue. 如果要自己配置, 则需要添加rollup-plugin-vue(在windows指定版本5.1.1,因为有bug), 配置rollup-plugin-vue的css提取, 配合rollup-plugin-css-only处理css, [参考](https://rollup-plugin-vue.vuejs.org/examples.html#minimal). 使用了jsx[参考](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app#vue-jsx-support)
* 尝试过vue的打包代码, 但是vue使用buble而不是babel, 新语法处理不了.
* 解决了`regeneratorruntime is not defined`.

## Features and important points
* Referenced vue scripts of bundle: https://github.com/vuejs/vue/tree/dev/scripts
* The third-party library source code should not be included in the cjs and esm bundle. So when packaging cjs and esm, all dependencies in package.json are set to external dependencies.
* It is recommended to use `egoist/bili` to bundle vue. If you want to configure it yourself, you need to add rollup-plugin-vue (specify version 5.1.1 in windows, because there are bugs), configure css extraction with rollup-plugin-vue, cooperate with rollup-plugin-css-only handles css, [Reference](https://rollup-plugin-vue.vuejs.org/examples.html#minimal). [Vue Jsx reference](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app#vue-jsx-support)
* Have tried vue's packaging code, but it vue uses bubble instead of babel, the new syntax can't handle.
* Resolved `regeneratorruntime is not defined`.

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
"@babel/runtime": "^7.7.7",
```
复制以下内容到你的babel配置文件(例如`babel.config.js`)..   
Copy the following into your babel configuration file (eg `babel.config.js`).
```js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: false,
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
## 使用示例 Example
* [phphe/helper-js](https://github.com/phphe/helper-js)
