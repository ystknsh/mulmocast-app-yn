import { getBeatAudioPath } from "mulmocast";
import type { MulmoStudioContext } from "mulmocast";
import fs from "fs";

import { getContext } from "./handler";

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
