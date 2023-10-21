import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import esbuild from "rollup-plugin-esbuild";
import path from "path";
import pkg from "./package.json";

const extensions = [".js", ".ts", ".tsx"];

const distDir = "dist";
const baseConfig = {
  input: "src/index.ts",
  external: ["react", "react-dom", ...Object.keys(pkg.peerDependencies)],
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
  output: { file: pkg.main, format: "cjs" },
  plugins: [
    resolve({
      extensions,
    }),
    esbuild({
      minify: true,
      tsconfig: path.resolve("./tsconfig.json"),
    }),
  ],
};

const mjsConfig = {
  ...baseConfig,
  output: { file: pkg.module, format: "esm" },
  plugins: [
    resolve({
      extensions,
    }),
    esbuild({
      minify: true,
      target: "node12",
      tsconfig: path.resolve("./tsconfig.json"),
    }),
  ],
};

export default [dtsConfig, cjsConfig, mjsConfig];
