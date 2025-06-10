import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

// https://vitejs.dev/config
export default defineConfig(async () => {
  // @ts-expect-error warkaround for commonjs
  const { default: tailwindcss } = await import("@tailwindcss/vite");
  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/renderer"),
        "@/types": path.resolve(__dirname, "./src/types"),
      },
    },
  };
});
