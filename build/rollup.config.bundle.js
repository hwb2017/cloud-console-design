import path from "path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import vuePlugin from "rollup-plugin-vue";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import copy from "rollup-plugin-copy";
import esbuild from "rollup-plugin-esbuild";
import { terser } from "rollup-plugin-terser";

const entry = path.resolve(__dirname, "../components/index.ts");
const commonPlugins = [
  copy({
    targets: [
      { src: 'components/icon/style/fonts/*', dest: 'dist/style/fonts' }
    ]
  }),      
  postcss({
    use: ['sass'],
    plugins: [
      autoprefixer(),
      cssnano()
    ],
    extract: 'style/index.css'
  }),       
  nodeResolve(),
  vuePlugin(),
  esbuild(),
]
// rollup打包过程中遇到的所有模块名(id), 如果通过external函数调用后为true，则视为外部依赖，不进行打包
const externalDependencies = ["vue"]

export default [
  {
    input: entry,
    output: {
      format: "cjs",
      file: "dist/index.bundle.js",
    },
    plugins: commonPlugins,
    external: externalDependencies,
  },
  {
    input: entry,
    output: {
      format: "umd",
      file: "dist/index.min.js",
      exports: "named",
      name: "CloudConsoleDesign",
      globals: {
        vue: "Vue",
      }
    },
    plugins: [
      ...commonPlugins,
      terser()
    ],
    external: externalDependencies,
  },  
]