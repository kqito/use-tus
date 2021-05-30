import resolve from '@rollup/plugin-node-resolve';
import typescriptPlugin from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const typescript = require('typescript');
const { presets } = require('./babel.config');

const extensions = ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'];
const globals = { react: 'React', 'react-dom': 'ReactDOM' };

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      globals,
    },
    {
      file: pkg.module,
      format: 'esm',
    },
  ],
  plugins: [
    commonjs(),
    resolve({
      extensions,
    }),
    typescriptPlugin({
      typescript,
      tsconfigOverride: {
        exclude: ['**/__tests__', '**/__stories__'],
      },
    }),
    babel({
      extensions,
      babelHelpers: 'bundled',
      presets,
    }),
  ],
  external: [
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ],
};
