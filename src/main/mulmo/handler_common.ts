import { initializeContext, type MulmoStudioContext } from "mulmocast";
import { getProjectPath, SCRIPT_FILE_NAME } from "../project_manager";
import path from "path";
import { WebContents } from "electron";

export const getContext = async (projectId: string): Promise<MulmoStudioContext | null> => {
  const projectPath = getProjectPath(projectId);

  const argv = {
    // v: true,
    b: projectPath,
    o: path.join(projectPath, "output"),
    file: SCRIPT_FILE_NAME,
  };

  return await initializeContext(argv);
};

export const mulmoCallbackGenerator = (projectId: string, webContents: WebContents) => {
  return (data: unknown) => {
    if (webContents) {
      webContents.send("progress-update", {
        projectId,
        type: "mulmo",
        data,
      });
    }
  };
};
