import type { MulmoBeat } from "mulmocast/browser";
import { isNull } from "graphai/lib/utils/utils";

export const getBadge = (beat: MulmoBeat) => {
  if (beat?.image) {
    if (["image", "movie"].includes(beat.image.type)) {
      if ("source" in beat.image && beat.image?.source?.kind === "path") {
        return "media_file";
      }
    }
    return beat?.image?.type;
  }
  if (beat.htmlPrompt) {
    return "html_prompt";
  }
  return "image_prompt";
};

export const getPromptLabel = (beat: MulmoBeat) => {
  if (beat.image.type) {
    switch (beat.image.type) {
      case "image":
        return "Image Prompt (URL or path)";
      case "movie":
        return "Movie Source";
      case "textSlide":
        return "Slide Content";
      case "markdown":
        return "Markdown Text";
      case "chart":
        return "Chart JSON";
      case "mermaid":
        return "Mermaid Diagram";
      case "html_tailwind":
        return "HTML (Tailwind)";
      default:
        return "Prompt";
    }
  }
  if (beat.htmlPrompt) {
    return "Html Prompt";
  }
  return "Image Prompt";
};

export const getMediaIcon = (type: string) => {
  switch (type) {
    case "video":
      return Video;
    default:
      return FileImage;
  }
};

export const isMediaBeat = (beat: MulmoBeat) => {
  return beat.image.type === "image" || beat.image.type === "movie";
};

export const isURLSourceMediaBeat = (beat: MulmoBeat) => {
  return "source" in beat.image && beat.image?.source?.kind === "url";
};

export const isLocalSourceMediaBeat = (beat: MulmoBeat) => {
  return "source" in beat.image && beat.image?.source?.kind === "path";
};

export const setRandomBeatId = (beat: MulmoBeat) => {
  if (isNull(beat.id)) {
    beat.id = crypto.randomUUID();
  }
  return beat;
};
