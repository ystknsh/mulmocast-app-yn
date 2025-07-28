import {
  getBeatAudioPath,
  MulmoPresentationStyleMethods,
  MulmoStudioContextMethods,
  imagePreprocessAgent,
  getReferenceImagePath,
  type MulmoStudioContext,
} from "mulmocast";

import fs from "fs";

import { getContext } from "./handler_common";

// audio

const beatAudio = (context: MulmoStudioContext) => {
  return (beat) => {
    try {
      const { text } = beat; // TODO: multiLingual
      const fileName = getBeatAudioPath(text, context, beat);
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
    return context.studio.script.beats.map(beatAudio(context));
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
    return Promise.all(context.studio.script.beats.map(beatImage(context, imageAgentInfo)));
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
      if (res.imagePath) {
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
  Object.keys(images)
    .sort()
    .map((key) => {
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
      } catch (error) {
        console.log(error);
      }
    });
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
