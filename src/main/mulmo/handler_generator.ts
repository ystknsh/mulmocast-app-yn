import { WebContents } from "electron";
import { mulmoCallbackGenerator, getContext } from "./handler_common";
import type { TransactionLog } from "graphai";
import {
  images,
  audio,
  movie,
  pdf,
  captions,
  addSessionProgressCallback,
  removeSessionProgressCallback,
} from "mulmocast";
import { z } from "zod";
import { loadSettings } from "../settings_manager";

export const mulmoActionRunner = async (projectId: string, actionName: string | string[], webContents: WebContents) => {
  const settings = await loadSettings();
  try {
    const context = await getContext(projectId);
    const graphAICallbacks = [
      (log: TransactionLog) => {
        if (webContents) {
          webContents.send("progress-update", {
            projectId,
            type: "graphai",
            data: log,
          });
        }
      },
    ];
    const mulmoCallback = mulmoCallbackGenerator(projectId, webContents);
    addSessionProgressCallback(mulmoCallback);

    const hasMatchingAction = (actions: string[], targets: string[]) =>
      actions.some((action) => targets.includes(action));

    const actionNames = Array.isArray(actionName) ? actionName : [actionName];
    const enables = {
      audio: hasMatchingAction(["audio", "movie"], actionNames),
      image: hasMatchingAction(["image", "movie", "pdf", "pdfSlide", "pdfHandout"], actionNames),
      movie: hasMatchingAction(["movie"], actionNames),
      pdfSlide: hasMatchingAction(["pdfSlide", "pdf"], actionNames),
      pdfHandout: hasMatchingAction(["pdfHandout", "pdf"], actionNames),
    };
    const audioContext = enables.audio ? await audio(context, settings.APIKEY ?? {}, graphAICallbacks) : context;
    const imageContext = enables.image
      ? await images(audioContext, settings.APIKEY ?? {}, graphAICallbacks)
      : audioContext;
    if (enables.movie) {
      const captioncontext = imageContext.caption ? await captions(imageContext) : imageContext;
      await movie(captioncontext);
    }
    if (enables.pdfSlide) {
      // sizes = ["letter", "a4"];
      await pdf(imageContext, "slide", "a4");
    }
    if (enables.pdfHandout) {
      await pdf(imageContext, "handout", "a4");
    }
    removeSessionProgressCallback(mulmoCallback);

    return {
      result: true,
    };
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      if (error.issues) {
        error.issues.map((e) => {
          webContents.send("progress-update", {
            projectId,
            type: "zod_error",
            data: e,
          });
        });
      }
    } else {
      webContents.send("progress-update", {
        projectId,
        type: "error",
        data: error,
      });
    }
    return {
      result: false,
      error,
    };
  }
};
