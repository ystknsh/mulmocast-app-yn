import type { MulmoScript } from "mulmocast";
import type { ProjectMetadata } from "@/types/index";

export const mergePresentationStyleToScript = (script: MulmoScript, projectMetadata: ProjectMetadata): MulmoScript => {
  if (!(projectMetadata?.presentationStyle && script)) {
    return script;
  }

  const _script = { ...script };
  const { presentationStyle } = projectMetadata;

  // merge presentation style into script
  if (presentationStyle.canvasSize) {
    _script.canvasSize = presentationStyle.canvasSize;
  }
  if (presentationStyle.speechParams) {
    _script.speechParams = presentationStyle.speechParams;
  }
  if (presentationStyle.imageParams) {
    _script.imageParams = presentationStyle.imageParams;
  }
  if (presentationStyle.movieParams) {
    _script.movieParams = presentationStyle.movieParams;
  }
  if (presentationStyle.textSlideParams) {
    _script.textSlideParams = presentationStyle.textSlideParams;
  }
  if (presentationStyle.audioParams) {
    _script.audioParams = presentationStyle.audioParams;
  }

  return _script;
};
