import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    commonjsOptions: { transformMixedEsModules: true },
  },
  plugins: [
    {
      name: "copy-ffmpeg-after-build",
      apply: "build",
      closeBundle() {
        const destDir = path.resolve(__dirname, ".vite/build/ffmpeg");
        fs.mkdirSync(destDir, { recursive: true });

        fs.copyFileSync(ffmpegPath, path.join(destDir, path.basename(ffmpegPath)));
        fs.copyFileSync(ffprobeStatic.path, path.join(destDir, path.basename(ffprobeStatic.path)));
        console.log("✅ ffmpeg copied by Vite plugin");
      },
    },
  ],
});
