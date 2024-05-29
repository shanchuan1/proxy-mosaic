<!--
 * @Description: 
 * @Author: shanchuan
 * @Date: 2024-05-29 10:19:37
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-29 18:19:02
-->
## 问题
用来完全抹平webpack与vite配置的差异是不太可能的，每个项目自由度很高，大小都会出现不太通的差异报错，以代码覆盖自由配置的idea很难实现，
就算强行抹平现有差异，但是这样的代价远不如改造迁移原vue-cli工程来的便利



```js
import { defineConfig } from "vite";
import { createVuePlugin as vue } from "vite-plugin-vue2"; //vue 2
import { createHtmlPlugin } from 'vite-plugin-html'
import vueJsx from '@vitejs/plugin-vue2-jsx'
import langJsx from 'vite-plugin-lang-jsx'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import ViteRequireContext from '@originjs/vite-plugin-require-context'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
const path = require("path");

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
      inject: {
        data: {
          orderCdn: orderCdn
        },
      },
      // 注：指定entry后，不需要在index.html添加script标签，若添加了建议删除
      // entry: 'src/projects/portal/main.js',
      entry: 'A项目下的/src/main.js',
      // template: 'src/projects/portal/index.vite.html',
      template: './index.html',
    }),
    viteStaticCopy({
      targets: [
        {
          src: `src/projects/portal/configs/**`,
          dest: 'configs'
        }
      ]
    }),
    ViteRequireContext(),
    viteCommonjs()
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
    // 使用webpack导入文件通常习惯省略后缀名，例如：import App from './App'，vite启动会提示找不到文件，需要补全后缀名：import App from './App.vue'；
    // 官方不建议忽略自定义导入类型的扩展名（例如：.vue），因为它会影响 IDE 和类型支持
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/constant.scss";`
      },
      less: {
        additionalData: `@import "src/styles/var.less";`
      },
    },
  },
    define: {
    'process.env': process.env
  },
  server: {
    proxy: {
      '/api': {
        rewrite: (path) => path.replace('/^/\api/', ''),
      }
    }
  },
});



```
