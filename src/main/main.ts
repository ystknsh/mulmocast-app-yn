import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";

import { registerIPCHandler } from "./ipc_handler";
import * as projectManager from "./project_manager";
import * as settingsManager from "./settings_manager";
import { ENV_KEYS } from "../shared/constants";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
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

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

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
  await projectManager.ensureProjectBaseDirectory();

  const settings = await settingsManager.loadSettings();

  for (const envKey of Object.keys(ENV_KEYS)) {
    const value = settings[envKey as keyof settingsManager.Settings];
    if (value) {
      process.env[envKey] = value;
    }
  }

  createWindow();
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
