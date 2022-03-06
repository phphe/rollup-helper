# rogo

To help build js/ts/vue library with rollup.

Add to devDependencies:

```json
"rogo": "^3.0.0"
```

Add to package.json (modify it if you don't use default output path):

```json
"main": "dist/index.cjs.js",
"module": "dist/index.esm.js",
```

**Check follow for different sources**

## js

Add to dependencies:

```json
"@babel/runtime": "^7.7.7"
```

Create `rogo.config.js`

```js
const { getConfig } = require("rogo");

const options = {};

module.exports = [
  getConfig({ ...options, format: "esm" }),
  getConfig({ ...options, format: "cjs" }),
  getConfig({ ...options, format: "umd", minify: true, sourcemap: true }),
];
```

Run `npx rogo` to build src/index.js to dist folder.

Or add to package.json scripts:

```json
"build-lib": "rogo",
"watch-lib": "rogo -w",
```

## ts

Add to dependencies:

```json
"@babel/runtime": "^7.7.7",
"tslib": "^2.3.1"
```

Create `rogo.config.ts`

```ts
import { getConfig } from "rogo";

const options = {};

export default [
  getConfig({ ...options, format: "esm" }),
  getConfig({ ...options, format: "cjs" }),
  getConfig({ ...options, format: "umd", minify: true, sourcemap: true }),
];
```

Run `npx rogo` to build src/index.ts to dist folder.

## vue

There are vue2 and vue3 example in `example` folder. But I recommend you to use vite to bundle vue library.

## rollup

Infact, the `rogo.config.js/ts` export rollup config. So `rollup --config rogo.config.js` also works. You can install other rollup plugins for different tasks. `rogo` contains some helpers, check source code in `packages/core/src/index.ts` for more.
