/*
 * @Description:
 * @Author: shanchuan
 * @Date: 2024-05-23 18:34:04
 * @LastEditors:
 * @LastEditTime: 2024-05-23 18:34:16
 */
import { defineConfig } from "vite";
import { createVuePlugin as vue } from "vite-plugin-vue2"; //vue 2
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
