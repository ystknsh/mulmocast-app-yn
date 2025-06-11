import { images, initializeContext, updateNpmRoot, readTemplatePrompt, getAvailableTemplates } from "mulmocast";
import path from "path";

updateNpmRoot(path.resolve(__dirname, "../../node_modules/mulmocast"));

export const mulmoTest = async (option, webContents) => {
  const argv = {
    b: __dirname + "/../../",
    o: __dirname + "/../../output",
    file: option.file,
  };
  // console.log(argv);
  const context = await initializeContext(argv);
  // console.log(context);
  await images(context, [
    (log) => {
      if (webContents) {
        // console.log(log, webContents)
        webContents.send("progress-update", log);
      }
    },
  ]);

  // console.log(option);
};

export const mulmoReadTemplatePrompt = (templateName: string) => {
  return readTemplatePrompt(templateName);
};

export const mulmoHandler = (method, ...args) => {
  try {
    switch (method) {
      case "readTemplatePrompt":
        return mulmoReadTemplatePrompt(args[0]);
      case "getAvailableTemplates":
        return getAvailableTemplates();
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (err) {
    return { error: err.message };
  }
};
