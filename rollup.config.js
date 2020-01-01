// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';


export default {
  input: 'src/index.js',
  output: {
    file: 'dist/test-bundle.js',
    format: 'umd',
    name: 'test',
  },
  plugins: [
    babel({runtimeHelpers: true}),
    resolve(),
    commonjs({}),
  ],
};
