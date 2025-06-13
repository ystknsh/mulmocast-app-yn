import { images, initializeContext, updateNpmRoot } from "mulmocast";
import path from "path";

updateNpmRoot(path.resolve(__dirname, "../../node_modules/mulmocast"));

export const mulmoTest = async (option, webContents) => {
  const argv = {
    b: __dirname + "/../../",
    o: __dirname + "/../../output",
    file: option.file,
  };
  const context = await initializeContext(argv);
  await images(context, [
    (log) => {
      if (webContents) {
        webContents.send("progress-update", log);
      }
    },
  ]);
};
