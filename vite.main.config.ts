import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import ffmpegFfprobeStatic from "ffmpeg-ffprobe-static";

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

        fs.copyFileSync(ffmpegFfprobeStatic.ffmpegPath, path.join(destDir, "ffmpeg"));
        fs.copyFileSync(ffmpegFfprobeStatic.ffprobePath, path.join(destDir, "ffprobe"));
        console.log("✅ ffmpeg and ffprobe copied by Vite plugin");
      },
    },
  ],
});
