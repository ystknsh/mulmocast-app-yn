import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";

import { registerIPCHandler } from "./ipc_handler";
import * as projectManager from "./project_manager";
import * as settingsManager from "./settings_manager";
import { ENV_KEYS } from "../shared/constants";

const isDev = process.env.NODE_ENV === "development";
const isNormal = process.env.DISPLAYMODE === "normal";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createSplashWindow = () => {
  const splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load splash.html - in dev mode it's in root, in prod it's in build directory
  if (isDev) {
    splashWindow.loadFile(path.join(__dirname, "../../splash.html"));
  } else {
    splashWindow.loadFile(path.join(__dirname, "splash.html"));
  }
  splashWindow.center();
  return splashWindow;
};

const createWindow = (splashWindow?: BrowserWindow) => {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const mainWindow = new BrowserWindow({
    ...(isNormal
      ? {
          width: 1280,
          height: 720,
        }
      : {
          width,
          height,
          maxWidth: 1920,
          maxHeight: 1080,
        }),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  if (isDev) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  // Show main window when it's ready and close splash
  mainWindow.once("ready-to-show", () => {
    setTimeout(() => {
      if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
      }
      mainWindow?.show();
    }, 2000);
  });

  ipcMain.on("request-env", async (event) => {
    const settings = await settingsManager.loadSettings();
    const envData: Record<string, string | undefined> = {};

    for (const envKey of Object.keys(ENV_KEYS)) {
      const value = settings[envKey as keyof settingsManager.Settings];
      envData[envKey] = value || process.env[envKey];
    }

    event.reply("response-env", envData);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  const splashWindow = createSplashWindow();

  await projectManager.ensureProjectBaseDirectory();

  const settings = await settingsManager.loadSettings();

  for (const envKey of Object.keys(ENV_KEYS)) {
    const value = settings[envKey as keyof settingsManager.Settings];
    if (value) {
      process.env[envKey] = value;
    }
  }

  createWindow(splashWindow);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

registerIPCHandler();
