import {
  getBeatAudioPath,
  MulmoPresentationStyleMethods,
  MulmoStudioContextMethods,
  imagePreprocessAgent,
  getReferenceImagePath,
  getMultiLingual,
  getOutputMultilingualFilePathAndMkdir,
  type MulmoStudioContext,
  type MulmoStudioMultiLingual,
} from "mulmocast";

import fs from "fs";

import { getContext } from "./handler_common";

// audio
const beatAudio = (context: MulmoStudioContext) => {
  return (beat) => {
    try {
      const { text } = beat; // TODO: multiLingual
      const fileName = getBeatAudioPath(text, context, beat, context.studio.script?.lang ?? "en");
      if (fs.existsSync(fileName)) {
        const buffer = fs.readFileSync(fileName);
        return buffer.buffer;
      }
      return;
    } catch (e) {
      console.log(e);
      return "";
    }
  };
};

export const mulmoAudioFiles = async (projectId: string) => {
  try {
    const context = await getContext(projectId);
    return context.studio.script.beats.reduce((tmp, beat) => {
      tmp[beat.id] = beatAudio(context)(beat);
      return tmp;
    }, {});
  } catch (error) {
    console.log(error);
    return [];
  }
};
export const mulmoAudioFile = async (projectId: string, index: number) => {
  try {
    const context = await getContext(projectId);
    const beat = context.studio.script.beats[index];
    return beatAudio(context)(beat);
  } catch (error) {
    console.log(error);
  }
};

// images

export const mulmoImageFiles = async (projectId: string) => {
  try {
    const context = await getContext(projectId);
    const imageAgentInfo = MulmoPresentationStyleMethods.getImageAgentInfo(context.presentationStyle);
    const dataSet = await Promise.all(context.studio.script.beats.map(beatImage(context, imageAgentInfo)));
    return context.studio.script.beats.reduce((tmp, beat, index) => {
      if (beat.id) {
        tmp[beat.id] = dataSet[index];
      }
      return tmp;
    }, {});
  } catch (error) {
    console.log(error);
    return [];
  }
};
export const mulmoImageFile = async (projectId: string, index: number) => {
  try {
    const context = await getContext(projectId);
    const imageAgentInfo = MulmoPresentationStyleMethods.getImageAgentInfo(context.presentationStyle);
    const beat = context.studio.script.beats[index];
    return await beatImage(context, imageAgentInfo)(beat, index);
  } catch (error) {
    console.log(error);
  }
};

const beatImage = (context: MulmoStudioContext, imageAgentInfo) => {
  return async (beat, index) => {
    try {
      const res = await imagePreprocessAgent({ context, beat, index, imageAgentInfo, imageRefs: {} });
      if (res.htmlImageFile && fs.existsSync(res.htmlImageFile)) {
        const buffer = fs.readFileSync(res.htmlImageFile);
        res.imageData = buffer.buffer;
      } else if (res.imagePath) {
        if (res.imagePath.startsWith("http")) {
          const response = await fetch(res.imagePath);
          if (!response.ok) {
            throw new Error(`Failed to download image: ${res.imagePath}`);
          }
          const buffer = Buffer.from(await response.arrayBuffer());
          res.imageData = buffer.buffer;
        } else if (fs.existsSync(res.imagePath)) {
          const buffer = fs.readFileSync(res.imagePath);
          res.imageData = buffer.buffer;
        }
      }
      if (res.movieFile && fs.existsSync(res.movieFile)) {
        const buffer = fs.readFileSync(res.movieFile);
        res.movieData = buffer.buffer;
      }
      if (res.lipSyncFile && fs.existsSync(res.lipSyncFile)) {
        const buffer = fs.readFileSync(res.lipSyncFile);
        res.lipSyncData = buffer.buffer;
      }
      return res;
    } catch (e) {
      console.log(e);
      return "";
    }
  };
};

// image reference

export const mulmoReferenceImagesFiles = async (projectId: string) => {
  const context = await getContext(projectId);
  const images = context.presentationStyle.imageParams?.images;
  if (!images) {
    return {};
  }
  const imageRefs: Record<string, ArrayBuffer> = {};
  await Promise.all(
    Object.keys(images)
      .sort()
      .map(async (key) => {
        const image = images[key];
        try {
          const path = (() => {
            if (image.type === "imagePrompt") {
              return getReferenceImagePath(context, key, "png");
            } else if (image.type === "image" && image.source.kind === "path") {
              return MulmoStudioContextMethods.resolveAssetPath(context, image.source.path);
            }
          })();
          if (path && fs.existsSync(path)) {
            const buffer = fs.readFileSync(path);
            imageRefs[key] = buffer.buffer;
          }
          if (image.type === "image" && image.source.kind === "url") {
            const response = await fetch(image.source.url);
            if (response.ok) {
              const buffer = Buffer.from(await response.arrayBuffer());
              imageRefs[key] = buffer.buffer;
            }
          }
        } catch (error) {
          console.log(error);
        }
      }),
  );
  return imageRefs;
};

export const mulmoReferenceImagesFile = async (projectId: string, key: string) => {
  const context = await getContext(projectId);
  const images = context.presentationStyle.imageParams?.images;
  if (!images) {
    return {};
  }
  const image = images[key];
  try {
    const path = (() => {
      if (image.type === "imagePrompt") {
        return getReferenceImagePath(context, key, "png");
      } else if (image.type === "image" && image.source.kind === "path") {
        return MulmoStudioContextMethods.resolveAssetPath(context, image.source.path);
      }
    })();
    if (path && fs.existsSync(path)) {
      const buffer = fs.readFileSync(path);
      return buffer.buffer;
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};

export const mulmoMultiLinguals = async (projectId: string): MulmoStudioMultiLingual => {
  const context = await getContext(projectId);
  const { outputMultilingualFilePath } = getOutputMultilingualFilePathAndMkdir(context);
  const multiLingual = getMultiLingual(outputMultilingualFilePath, context.studio.beats.length);
  return multiLingual;
};
