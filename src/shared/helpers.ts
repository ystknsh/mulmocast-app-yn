import type { MulmoScript } from "mulmocast";
import type { ProjectMetadata } from "@/types/index";

export const mergePresentationStyleToScript = (
  script?: MulmoScript,
  projectMetadata?: ProjectMetadata,
): MulmoScript => {
  if (!(projectMetadata?.presentationStyle && script)) {
    return script;
  }

  const { presentationStyle } = projectMetadata;

  // Define the parameters to merge
  const paramsToMerge = [
    "canvasSize" as const,
    "speechParams" as const,
    "imageParams" as const,
    "movieParams" as const,
    "textSlideParams" as const,
    "audioParams" as const,
  ] as const;

  // Create merged script by copying existing properties and adding presentation style parameters
  const mergedScript = { ...script };

  paramsToMerge.forEach((param) => {
    if (presentationStyle[param]) {
      // @ts-expect-error TODO: fix this
      mergedScript[param] = presentationStyle[param];
    }
  });

  return mergedScript;
};
