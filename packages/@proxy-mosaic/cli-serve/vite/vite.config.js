/*
 * @Description:
    用来完全抹平webpack与vite配置的差异是不太可能的，每个项目自由度很高，大小都会出现不太通的差异报错，以代码覆盖自由配置的idea很难实现，
    就算强行抹平现有差异，但是这样的代价远不如改造迁移原vue-cli工程来的便利
 * @Author: shanchuan
 * @Date: 2024-05-23 18:34:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-28 14:49:55
 */
import { defineConfig } from "vite";
import { createVuePlugin as vue } from "vite-plugin-vue2"; //vue 2
import { createHtmlPlugin } from 'vite-plugin-html'
import vueJsx from '@vitejs/plugin-vue2-jsx'
import langJsx from 'vite-plugin-lang-jsx'
import ViteRequireContext from '@originjs/vite-plugin-require-context'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
const path = require("path");
const ViteConfigManager = require('./vite')
const { base, plugins, server, css} = ViteConfigManager.getConfig()
console.log('🚀 ~ ViteConfigManager.getConfig():', ViteConfigManager.getConfig())

// https://vitejs.dev/config/
export default defineConfig({
  base,
  assetsInclude: ["**/*.html"],
  plugins: [
    // 必须写在vue、vueJsx之前
    langJsx()[1],
    vue(),
    vueJsx(), // 处理.vue文件使用了JSX 同时.vue文件中需要在 script 标签，添加 lang="jsx" , 例： <script lang="jsx"></script>
    createHtmlPlugin({
      minify: true,
      entry: "src/main.js",
      template: "public/index.vite.html",
    }),
    ViteRequireContext(),
    viteCommonjs(),
    ...plugins
  ],
  resolve: {
    alias: [
      {
        find: '~@',
        replacement: path.resolve(__dirname, "src") // 解决css-loader中对 ~@写法的兼容 如：background-image: url("~@/assets/diaoyan.svg");
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, "src")
      },
      {
        find: /^~.+/,
        replacement: (val) => val.replace(/^~/, ""),
      },
    ],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `@import "@/styles/constant.scss";`
      },
      // less: {
      //   additionalData: `@import "src/styles/var.less";`
      // },
    },
    ...css
  },
  define: {
    'process.env': process.env
  },
  server,
});
