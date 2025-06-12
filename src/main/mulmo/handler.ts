import { getProjectPath, SCRIPT_FILE_NAME } from "../project_manager";
import { images, initializeContext, updateNpmRoot, readTemplatePrompt, getAvailableTemplates } from "mulmocast";
import path from "path";

updateNpmRoot(path.resolve(__dirname, "../../node_modules/mulmocast"));

export const mulmoImageGenerate = async (projectId: string, webContents) => {
  const projectPath = getProjectPath(projectId);
  const argv = {
    b: projectPath,
    o: path.join(projectPath + "output"),
    file: SCRIPT_FILE_NAME,
  };
  try {
    const context = await initializeContext(argv);
    await images(context, [
      (log) => {
        if (webContents) {
          webContents.send("progress-update", {
            projectId,
            type: "progress",
            data: log,
          });
        }
      },
    ]);
    return {
      result: true,
    };
  } catch (error) {
    webContents.send("progress-update", {
      projectId,
      type: "error",
      data: error,
    });
    return {
      result: false,
      error,
    };
  }
};

export const mulmoReadTemplatePrompt = (templateName: string) => {
  return readTemplatePrompt(templateName);
};

export const mulmoHandler = async (method, webContents, ...args) => {
  try {
    switch (method) {
      case "readTemplatePrompt":
        return mulmoReadTemplatePrompt(args[0]);
      case "getAvailableTemplates":
        return getAvailableTemplates();
      case "mulmoImageGenerate":
        return await mulmoImageGenerate(args[0], webContents);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (err) {
    return { error: "" };
  }
};
