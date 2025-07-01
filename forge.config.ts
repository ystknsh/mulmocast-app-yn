import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import path from "path";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResources: [
      {
        from: ".vite/build/ffmpeg",
        to: "ffmpeg",
      },
    ],
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ["darwin"]), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],

  hooks: {
    prePackage: async (forgeConfig, buildResult) => {
      const destDir = path.resolve(__dirname, ".vite/build/ffmpeg");

      fs.mkdirSync(destDir, { recursive: true });
      const destPath = path.join(destDir, path.basename(ffmpegPath));
      const ffprobeDest = path.join(destDir, path.basename(ffprobeStatic.path));
      fs.copyFileSync(ffmpegPath, destPath);
      fs.copyFileSync(ffprobeStatic.path, ffprobeDest);

      console.log(`[postPackage] ffmpeg copied to ${destPath}`);
    },
  },
};

export default config;
