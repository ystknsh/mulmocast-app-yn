import {
  images,
  audio,
  movie,
  captions,
  initializeContext,
  updateNpmRoot,
  readTemplatePrompt,
  getAvailableTemplates,
} from "mulmocast";
import type { TransactionLog } from "graphai";
import { getProjectPath, SCRIPT_FILE_NAME } from "../project_manager";
import path from "path";

updateNpmRoot(path.resolve(__dirname, "../../node_modules/mulmocast"));

export const mulmoActionRunner = async (projectId: string, actionName: string, webContents) => {
  const projectPath = getProjectPath(projectId);
  const argv = {
    v: true,
    b: projectPath,
    o: path.join(projectPath, "output"),
    file: SCRIPT_FILE_NAME,
  };
  try {
    const context = await initializeContext(argv);
    const callbacks = [
      (log: TransactionLog) => {
        if (webContents) {
          webContents.send("progress-update", {
            projectId,
            type: "progress",
            data: log,
          });
        }
      },
    ];
    // await runTranslateIfNeeded(context, argv);
    if (actionName === "audio") {
      await audio(context, callbacks);
    }
    if (actionName === "image") {
      await images(context, callbacks);
    }
    if (actionName === "movie") {
      await audio(context, callbacks);
      await images(context, callbacks);
      if (context.caption) {
        await captions(context);
      }
      await movie(context);
    }
    if (actionName === "pdf") {
      await images(context, callbacks);
      // await pdf(context, argv.pdf_mode, argv.pdf_size);
    }

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
      case "mulmoActionRunner":
        return await mulmoActionRunner(args[0], args[1], webContents);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (error) {
    return { error };
  }
};
