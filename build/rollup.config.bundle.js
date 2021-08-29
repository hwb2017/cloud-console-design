import path from "path";
// import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import vuePlugin from "rollup-plugin-vue";
import typescript from "rollup-plugin-typescript2";
import pkg from "../package.json";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

const deps = Object.keys(pkg.dependencies)

export default [
  {
    input: path.resolve(__dirname, "../components/index.ts"),
    output: {
      format: "es",
      file: "dist/index.esm.js",
    },
    plugins: [ 
      postcss({
        use: ['sass'],
        plugins: [
          autoprefixer(),
          cssnano()
        ],
        extract: 'style/index.css'
      }),        
      // terser(),
      nodeResolve(),
      vuePlugin(),
      typescript({
        // tsconfig 的默认搜索路径为 rollup 命令执行时所在的路径
        tsconfigOverride: {
          'include': [
            'components/**/*',
            'typings/vue-shim.d.ts',
          ],
          'exclude': [
            'node_modules',
            'components/**/__tests__/*',
          ],
        },
        abortOnError: false,
      })
    ],
    // rollup打包过程中遇到的所有模块名(id), 如果通过external函数调用后为true，则视为外部依赖，不进行打包
    external(id) {
      return /^vue/.test(id)
        || deps.some(k => new RegExp('^' + k).test(id))
    },
  }
]