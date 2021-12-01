import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const extensions = ['.js', '.ts', '.tsx'];
const babelConfig = {
  // eslint-disable-next-line global-require
  ...require('./babel.config'),
  comments: false,
  extensions,
  babelHelpers: 'bundled',
};

const distDir = 'dist';
const baseConfig = {
  input: 'src/index.ts',
  external: ['react', 'react-dom', ...Object.keys(pkg.peerDependencies)],
};

const dtsConfig = {
  ...baseConfig,
  output: {
    dir: distDir,
  },
  plugins: [
    typescript({
      declaration: true,
      emitDeclarationOnly: true,
      outDir: distDir,
    }),
  ],
};

const cjsConfig = {
  ...baseConfig,
  output: { file: pkg.main, format: 'cjs' },
  plugins: [
    resolve({
      extensions,
    }),
    commonjs(),
    babel(babelConfig),
  ],
};

const mjsConfig = {
  ...baseConfig,
  output: { file: pkg.module, format: 'esm' },
  plugins: [
    resolve({
      extensions,
    }),
    commonjs(),
    babel(babelConfig),
  ],
};

export default [dtsConfig, cjsConfig, mjsConfig];
