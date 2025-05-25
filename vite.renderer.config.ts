import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config
export default defineConfig(async () => {
  // @ts-expect-error warkaround for commonjs
  const { default: tailwindcss } = await import("@tailwindcss/vite");
  return {
    plugins: [react(), tsconfigPaths({ projects: ["./src/react/tsconfig.json"] }), tailwindcss()],
  };
});
