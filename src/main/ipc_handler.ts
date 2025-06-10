import { ipcMain, dialog } from "electron";
import { mulmoTest } from "./mulmo/test";
import * as projectManager from "./project_manager";

export const registerIPCHandler = () => {
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and import them here.

  ipcMain.handle("dialog:openFile", async () => {
    // console.log(app.getPath('userData'));
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
    });
    if (canceled) return null;
    return filePaths[0];
  });

  ipcMain.handle("mulmo:test", async (event, option) => {
    const webContents = event.sender;
    mulmoTest(option, webContents);
  });

  // Project management handlers
  ipcMain.handle("project:list", () => projectManager.listProjects());

  ipcMain.handle("project:create", (_event, title: string) => projectManager.createProject(title));

  ipcMain.handle("project:get", (_event, id: string) => projectManager.getProject(id));

  ipcMain.handle("project:delete", (_event, id: string) => projectManager.deleteProject(id));

  ipcMain.handle("project:getPath", (_event, id: string) => {
    return projectManager.getProjectPath(id);
  });
};
