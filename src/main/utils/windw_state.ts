import { app, BrowserWindow, screen } from "electron";
import path from "path";
import fs from "fs";
import zod from "zod";

const windowStateSchema = zod.object({
  width: zod.number(),
  height: zod.number(),
  x: zod.number().optional(),
  y: zod.number().optional(),
});
type WindowState = zod.infer<typeof windowStateSchema>;

const STATE_FILE_NAME = "window-state.json";

const isNormal = process.env.DISPLAYMODE === "normal";
const windowStatePath = path.join(app.getPath("userData"), STATE_FILE_NAME);

export const getWindowState = (): WindowState => {
  try {
    return windowStateSchema.parse(JSON.parse(fs.readFileSync(windowStatePath, "utf8")));
  } catch {
    if (isNormal) {
      return { width: 1280, height: 720, x: undefined, y: undefined };
    } else {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      return { width, height, x: undefined, y: undefined };
    }
  }
};

export const saveWindowState = (win: BrowserWindow): void => {
  const bounds = win.getBounds();
  fs.writeFileSync(windowStatePath, JSON.stringify(bounds));
};
