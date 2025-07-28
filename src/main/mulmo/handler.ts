import {
  images,
  audio,
  movie,
  pdf,
  captions,
  updateNpmRoot,
  audioFilePath,
  movieFilePath,
  addSessionProgressCallback,
  removeSessionProgressCallback,
  generateBeatImage,
  generateBeatAudio,
  setFfmpegPath,
  setFfprobePath,
  generateReferenceImage,
  getImageRefs,
  MulmoStudioContextMethods,
  type MulmoImagePromptMedia,
} from "mulmocast";
import type { TransactionLog } from "graphai";
import { z } from "zod";
import { app, WebContents } from "electron";
import path from "path";
import fs from "fs";

import { getProjectPath } from "../project_manager";
import { loadSettings } from "../settings_manager";

import { createMulmoScript } from "./scripting";
import { fetchAndSave } from "./fetch_url";
import {
  mulmoAudioFiles,
  mulmoAudioFile,
  mulmoImageFile,
  mulmoImageFiles,
  mulmoReferenceImagesFiles,
  mulmoReferenceImagesFile,
} from "./handler_contents";
import { mulmoCallbackGenerator, getContext } from "./handler_common";

const isDev = !app.isPackaged;

if (isDev) {
  updateNpmRoot(path.resolve(__dirname, "../../node_modules/mulmocast"));
} else {
  updateNpmRoot(process.resourcesPath);
}
const ffmpegPath = path.resolve(__dirname, "../../node_modules/ffmpeg-ffprobe-static/ffmpeg");
const ffprobePath = path.resolve(__dirname, "../../node_modules/ffmpeg-ffprobe-static/ffprobe");

setFfmpegPath(isDev ? ffmpegPath : path.join(process.resourcesPath, "ffmpeg", "ffmpeg"));
setFfprobePath(isDev ? ffprobePath : path.join(process.resourcesPath, "ffmpeg", "ffprobe"));

export const mulmoGenerateImage = async (
  projectId: string,
  index: number,
  target: string,
  webContents: WebContents,
) => {
  const settings = await loadSettings();
  const mulmoCallback = mulmoCallbackGenerator(projectId, webContents);
  addSessionProgressCallback(mulmoCallback);
  try {
    const context = await getContext(projectId);

    const beat = context.studio.script.beats[index];
    const forceImage = target === "image";
    const forceMovie = target === "movie";
    if (forceImage) {
      beat.moviePrompt = "";
    }
    if (target === "all") {
      context.force = true;
    }
    if ((target === "movie" || target === "all") && !beat.moviePrompt) {
      beat.moviePrompt = " ";
    }
    const graphaiCallbacks = ({ nodeId, state }) => {
      if (nodeId === "preprocessor" && state === "executing") {
        webContents.send("progress-update", {
          projectId,
          type: "mulmo",
          data: {
            kind: "beatGenerate",
            sessionType: "image",
            inSession: true,
            index,
          },
        });
      }
      if (nodeId === "output" && state === "completed") {
        webContents.send("progress-update", {
          projectId,
          type: "mulmo",
          data: {
            kind: "beatGenerate",
            sessionType: "image",
            inSession: false,
            index,
          },
        });
      }
    };

    await generateBeatImage({ index, context, settings, forceImage, forceMovie, callbacks: [graphaiCallbacks] });
    removeSessionProgressCallback(mulmoCallback);
  } catch (error) {
    removeSessionProgressCallback(mulmoCallback);
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

export const mulmoGenerateAudio = async (projectId: string, index: number, webContents: WebContents) => {
  const settings = await loadSettings();
  const mulmoCallback = mulmoCallbackGenerator(projectId, webContents);
  try {
    addSessionProgressCallback(mulmoCallback);
    const context = await getContext(projectId);
    // context.force = true;
    await generateBeatAudio(index, context, settings);
    removeSessionProgressCallback(mulmoCallback);
  } catch (error) {
    removeSessionProgressCallback(mulmoCallback);
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

// generate all reference
export const mulmoReferenceImages = async (projectId: string, webContents: WebContents) => {
  const mulmoCallback = mulmoCallbackGenerator(projectId, webContents);
  try {
    addSessionProgressCallback(mulmoCallback);
    const context = await getContext(projectId);
    const imageProjectDirPath = MulmoStudioContextMethods.getImageProjectDirPath(context);
    fs.mkdirSync(imageProjectDirPath, { recursive: true });
    const images = await getImageRefs(context);
    removeSessionProgressCallback(mulmoCallback);
    return images;
  } catch (error) {
    removeSessionProgressCallback(mulmoCallback);
    webContents.send("progress-update", {
      projectId,
      type: "error",
      data: error,
    });
    return null;
  }
};

// generate iamge by prompt
export const mulmoReferenceImage = async (
  projectId: string,
  index: number,
  key: string,
  image: MulmoImagePromptMedia,
  webContents: WebContents,
) => {
  const mulmoCallback = mulmoCallbackGenerator(projectId, webContents);
  try {
    addSessionProgressCallback(mulmoCallback);
    const context = await getContext(projectId);
    const imageProjectDirPath = MulmoStudioContextMethods.getImageProjectDirPath(context);
    fs.mkdirSync(imageProjectDirPath, { recursive: true });
    const returnImage = await generateReferenceImage({
      context,
      index,
      key,
      image,
      force: true,
    });
    removeSessionProgressCallback(mulmoCallback);
    return returnImage;
  } catch (error) {
    removeSessionProgressCallback(mulmoCallback);
    webContents.send("progress-update", {
      projectId,
      type: "error",
      data: error,
    });
    return null;
  }
};

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
      image: hasMatchingAction(["image", "movie", "pdf"], actionNames),
      movie: hasMatchingAction(["movie"], actionNames),
      pdfSlide: hasMatchingAction(["pdfSlide", "pdf"], actionNames),
      pdfHandout: hasMatchingAction(["pdfHandout", "pdf"], actionNames),
    };
    const audioContext = enables.audio ? await audio(context, settings, graphAICallbacks) : context;
    const imageContext = enables.image ? await images(audioContext, settings, graphAICallbacks) : audioContext;

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
// TODO pdf
const mediaFilePath = async (projectId: string, actionName: string) => {
  const context = await getContext(projectId);
  if (actionName === "audio") {
    return audioFilePath(context);
  }
  if (actionName === "movie") {
    return movieFilePath(context);
  }
  throw Error("no download file");
};
const mulmoDownload = async (projectId: string, actionName: string) => {
  const path = await mediaFilePath(projectId, actionName);
  const buffer = fs.readFileSync(path);
  return buffer.buffer;
};

export const mulmoReferenceImageUpload = async (
  projectId: string,
  dirKey: string,
  bufferArray: Uint8Array,
  extention: string,
) => {
  const dirPath = "upload_reference_image";
  return __mulmoImageUpload(projectId, dirPath, dirKey, bufferArray, extention);
};
export const mulmoImageUpload = async (
  projectId: string,
  index: number,
  bufferArray: Uint8Array,
  extention: string,
) => {
  const dirPath = "upload_image";
  const dirKey = String(index);
  return __mulmoImageUpload(projectId, dirPath, dirKey, bufferArray, extention);
};

const __mulmoImageUpload = async (
  projectId: string,
  dirPath: string,
  dirKey: string,
  bufferArray: Uint8Array,
  extention: string,
) => {
  const projectPath = getProjectPath(projectId);
  const dir = path.resolve(projectPath, dirPath, dirKey);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}.${extention}`;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(bufferArray));

  return path.join(dirPath, dirKey, filename);
};
export const mulmoImageFetchURL = async (projectId: string, index: number, url: string, webContents: WebContents) => {
  const dirPath = "fetch_image";
  const dirKey = String(index);
  return await __mulmoImageFetchURL(projectId, dirPath, dirKey, url, webContents);
};

export const mulmoReferenceImageFetchURL = async (
  projectId: string,
  dirKey: string,
  url: string,
  webContents: WebContents,
) => {
  const dirPath = "fetch_ref_image";
  return await __mulmoImageFetchURL(projectId, dirPath, dirKey, url, webContents);
};

const __mulmoImageFetchURL = async (
  projectId: string,
  dirPath: string,
  dirKey: string,
  url: string,
  webContents: WebContents,
) => {
  try {
    const projectPath = getProjectPath(projectId);
    const dir = path.resolve(projectPath, dirPath, dirKey);

    const res = await fetchAndSave(url, dir);

    if (res.result) {
      return {
        result: true,
        imageType: res.imageType,
        path: path.join(dirPath, dirKey, res.filename),
      };
    }
    if (res.error) {
      webContents.send("progress-update", {
        projectId,
        type: "error",
        data: res.error,
      });
    }
  } catch (error) {
    webContents.send("progress-update", {
      projectId,
      type: "error",
      data: error,
    });
  }
  return {
    result: false,
  };
};

export const mulmoHandler = async (method: string, webContents: WebContents, ...args) => {
  try {
    switch (method) {
      case "mulmoActionRunner":
        return await mulmoActionRunner(args[0], args[1], webContents);
      case "mulmoImageGenerate":
        return await mulmoGenerateImage(args[0], args[1], args[2], webContents);
      case "mulmoAudioGenerate":
        return await mulmoGenerateAudio(args[0], args[1], webContents);
      case "downloadFile":
        return await mulmoDownload(args[0], args[1]);
      case "mediaFilePath":
        return await mediaFilePath(args[0], args[1]);
      case "mulmoAudioFiles":
        return await mulmoAudioFiles(args[0]);
      case "mulmoAudioFile":
        return await mulmoAudioFile(args[0], args[1]);
      case "mulmoImageFiles":
        return await mulmoImageFiles(args[0]);
      case "mulmoImageFile":
        return await mulmoImageFile(args[0], args[1]);
      case "mulmoReferenceImagesFiles":
        return await mulmoReferenceImagesFiles(args[0]);
      case "mulmoReferenceImagesFile":
        return await mulmoReferenceImagesFile(args[0], args[1]);
      case "createMulmoScript":
        return await createMulmoScript(args[0], args[1]);
      case "mulmoImageUpload":
        return await mulmoImageUpload(args[0], args[1], args[2], args[3]);
      case "mulmoReferenceImageUpload":
        return await mulmoReferenceImageUpload(args[0], args[1], args[2], args[3]);
      case "mulmoImageFetchURL":
        return await mulmoImageFetchURL(args[0], args[1], args[2], webContents);
      case "mulmoReferenceImageFetchURL":
        return await mulmoReferenceImageFetchURL(args[0], args[1], args[2], webContents);
      case "mulmoReferenceImage":
        return await mulmoReferenceImage(args[0], args[1], args[2], args[3], webContents);
      case "mulmoReferenceImages":
        return await mulmoReferenceImages(args[0], webContents);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (error) {
    console.log(error);
    return { error };
  }
};
