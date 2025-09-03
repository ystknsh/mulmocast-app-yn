import { initializeContextFromFiles, getFileObject, setGraphAILogger, type MulmoStudioContext } from "mulmocast";
import { getProjectPath, SCRIPT_FILE_NAME } from "../project_manager";
import path from "path";
import { WebContents } from "electron";

export const getContext = async (projectId: string, targetLang?: string): Promise<MulmoStudioContext | null> => {
  const projectPath = getProjectPath(projectId);

  const files = getFileObject({
    basedir: projectPath,
    outdir: path.join(projectPath, "output"),
    // imagedir: argv.i,
    // audiodir: argv.a,
    // presentationStyle: argv.p,
    file: SCRIPT_FILE_NAME,
    nodeModuleRootPath: path.resolve(__dirname, "../../node_modules"),
  });
  setGraphAILogger(true, {});

  return await initializeContextFromFiles(files, false, false, undefined, targetLang);
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
