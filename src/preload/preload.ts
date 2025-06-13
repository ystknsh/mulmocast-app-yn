// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  mulmoTest: (option) => ipcRenderer.invoke("mulmo:test", option),
  mulmoHandler: (method, ...args) => ipcRenderer.invoke("mulmoHandler", method, ...args),
  onProgress: (callback) => ipcRenderer.on("progress-update", callback),
  getEnv: () =>
    new Promise((resolve) => {
      ipcRenderer.once("response-env", (_event, data) => resolve(data));
      ipcRenderer.send("request-env");
    }),
  project: {
    list: () => ipcRenderer.invoke("project:list"),
    create: (name: string) => ipcRenderer.invoke("project:create", name),
    getProjectMetadata: (name: string) => ipcRenderer.invoke("project:getProjectMetadata", name),
    getProjectMulmoScript: (name: string) => ipcRenderer.invoke("project:getProjectMulmoScript", name),
    delete: (name: string) => ipcRenderer.invoke("project:delete", name),
    saveProjectMetadata: (id: string, data: unknown) => ipcRenderer.invoke("project:saveProjectMetadata", id, data),
    saveProjectScript: (id: string, data: unknown) => ipcRenderer.invoke("project:saveProjectScript", id, data),
  },
});
