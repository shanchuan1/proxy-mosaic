/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-23 18:34:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-26 10:56:14
 */
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
    alias: {
      "~@": path.resolve(__dirname, "src"), // 解决css-loader中对 ~@写法的兼容 如：background-image: url("~@/assets/diaoyan.svg");
      "@": path.resolve(__dirname, "./src"),
    },
    // 使用webpack导入文件通常习惯省略后缀名，例如：import App from './App'，vite启动会提示找不到文件，需要补全后缀名：import App from './App.vue'；
    // 官方不建议忽略自定义导入类型的扩展名（例如：.vue），因为它会影响 IDE 和类型支持
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
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
  }
});
