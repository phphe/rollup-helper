# rollup-helper
```sh
npm i -D rollup-helper
```
安装后, 复制以下内容到你的package.json   
After installation, copy the following to your package.json
```json
"scripts": {
  "build": "node build/build.js",
  "dev": "node build/build.js --watch"
},
```
复制以下内容到你的babel配置文件(例如`babel.config.js`). 仅针对一般js库项目.   
Copy the following into your babel configuration file (eg `babel.config.js`). Only for normal js library projects.
```js
module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  plugins: [
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
复制`build`文件夹到你的项目根目录. 如果你的入口文件为`./src/index.js`或`./src/{package.name}.js`, 就搞定啦. 否则请修改`build/build.js`   
Copy the `build` folder to your project root directory. If your entry file is `./src/index.js` or `./src/{package.name}.js`, all done. Otherwise, please modify `build/build.js`.
