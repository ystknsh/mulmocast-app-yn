import {
  updateNpmRoot,
  getAudioArtifactFilePath,
  movieFilePath,
  pdfFilePath,
  addSessionProgressCallback,
  removeSessionProgressCallback,
  translateBeat,
  setFfmpegPath,
  setFfprobePath,
  getImageRefs,
  MulmoStudioContextMethods,
  getMultiLingual,
  getOutputMultilingualFilePathAndMkdir,
  mulmoStudioMultiLingualFileSchema,
  currentMulmoScriptVersion,
  hashSHA256,
  type MultiLingualTexts,
} from "mulmocast";
import { GraphAILogger } from "graphai";
import { app, WebContents } from "electron";
import path from "path";
import fs from "fs";

import { loadSettings } from "../settings_manager";

import { createMulmoScript } from "./scripting";
import { mulmoActionRunner, mulmoGenerateImage, mulmoGenerateAudio, mulmoReferenceImage } from "./handler_generator";
import {
  mulmoAudioFiles,
  mulmoAudioFile,
  mulmoImageFile,
  mulmoImageFiles,
  mulmoReferenceImagesFiles,
  mulmoReferenceImagesFile,
  mulmoMultiLinguals,
} from "./handler_contents";
import { mulmoImageFetchURL, mulmoReferenceImageFetchURL } from "./handler_image_fetch";
import { mulmoReferenceImageUpload, mulmoImageUpload } from "./handler_image_upload";
import { graphaiPuppeteerAgent } from "./handler_graphai";
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

export const mulmoTranslateBeat = async (
  projectId: string,
  index: number,
  targetLangs: string[],
  webContents: WebContents,
) => {
  const settings = await loadSettings();
  const mulmoCallback = mulmoCallbackGenerator(projectId, webContents);
  try {
    addSessionProgressCallback(mulmoCallback);
    const context = await getContext(projectId);
    // context.force = true;
    await translateBeat(index, context, targetLangs, { settings: settings.APIKEY ?? {} });
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

// TODO pdf
const mediaFilePath = async (projectId: string, actionName: string) => {
  const context = await getContext(projectId);
  if (actionName === "audio") {
    return getAudioArtifactFilePath(context);
    // return audioFilePath(context);
  }
  if (actionName === "movie") {
    return movieFilePath(context);
  }
  if (actionName === "pdf") {
    return pdfFilePath(context, "slide");
  }
  throw Error("no download file");
};
const mulmoDownload = async (projectId: string, actionName: string) => {
  const fileName = await mediaFilePath(projectId, actionName);
  if (!fs.existsSync(fileName)) {
    GraphAILogger.info(`mulmoDownload: ${fileName} not exists`);
    return null;
  }
  const buffer = fs.readFileSync(fileName);
  return buffer.buffer;
};

const mulmoUpdateMultiLingual = async (projectId: string, index: number, data: MultiLingualTexts) => {
  const context = await getContext(projectId);
  const { outputMultilingualFilePath } = getOutputMultilingualFilePathAndMkdir(context);
  const multiLingual = getMultiLingual(outputMultilingualFilePath, context.studio.beats.length);

  const beat = context.studio.script?.beats?.[index];
  Object.values(data).map((d) => {
    if (!d.cacheKey) {
      d.cacheKey = hashSHA256(beat?.text ?? "");
    }
  });
  multiLingual[index].multiLingualTexts = data;
  if (!multiLingual[index].cacheKey) {
    const beat = context.studio.script.beats[index];
    multiLingual[index].cacheKey = hashSHA256(beat.text ?? "");
  }
  const savedData = {
    version: currentMulmoScriptVersion,
    multiLingual: multiLingual,
  };
  const result = mulmoStudioMultiLingualFileSchema.parse(savedData);
  console.log(result);
  fs.writeFileSync(outputMultilingualFilePath, JSON.stringify(savedData, null, 2), "utf8");
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
      case "mulmoTranslateBeat":
        return await mulmoTranslateBeat(args[0], args[1], args[2], webContents);
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
      case "mulmoMultiLinguals":
        return await mulmoMultiLinguals(args[0], webContents);
      case "mulmoUpdateMultiLingual":
        return await mulmoUpdateMultiLingual(args[0], args[1], args[2]);
      case "graphaiPuppeteerAgent":
        return await graphaiPuppeteerAgent(args[0]);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (error) {
    console.log(error);
    return { error };
  }
};
