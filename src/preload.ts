// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  mulmoTest: (option) => ipcRenderer.invoke("mulmo:test", option),
  onProgress: (callback) => ipcRenderer.on("progress-update", callback),
  getEnv: () =>
    new Promise((resolve) => {
      ipcRenderer.once("response-env", (_event, data) => resolve(data));
      ipcRenderer.send("request-env");
    }),
  project: {
    list: () => ipcRenderer.invoke("project:list"),
    create: (name: string) => ipcRenderer.invoke("project:create", name),
    get: (name: string) => ipcRenderer.invoke("project:get", name),
    update: (name: string, data: any) => ipcRenderer.invoke("project:update", name, data),
    delete: (name: string) => ipcRenderer.invoke("project:delete", name),
    getPath: (name: string) => ipcRenderer.invoke("project:getPath", name),
  },
});
