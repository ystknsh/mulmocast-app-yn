import { type MulmoBeat } from "mulmocast";

export const initMulmoScript = {
  $mulmocast: {
    version: "1.0",
    credit: "closing",
  },
  beats: [
    {
      speaker: "Presenter",
      text: "",
      imagePrompt: "",
    },
  ],
};

export const beatTemplate: { name: string; beat: MulmoBeat }[] = [
  {
    name: "Html prompt",
    beat: {
      speaker: "",
      text: "",
      htmlPrompt: {
        prompt: "",
      },
    },
  },
  {
    name: "Image prompt",
    beat: {
      speaker: "",
      text: "",
      imagePrompt: "",
      moviePrompt: "",
    },
  },
  {
    name: "Media file",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "image",
        source: {
          kind: "path",
          path: "",
        },
      },
    },
  },
  {
    name: "Text Slide",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "textSlide",
        slide: {
          title: "",
          bullets: [""],
        },
      },
    },
  },
  {
    name: "Markdown",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "markdown",
        markdown: [],
      },
    },
  },
  {
    name: "Chart",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "chart",
        title: "",
        chartData: undefined,
      },
    },
  },
  {
    name: "Mermaid",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "mermaid",
        title: "",
        code: {
          kind: "text",
          text: "",
        },
      },
    },
  },
  {
    name: "Tailwind html",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "html_tailwind",
        html: [],
      },
    },
  },
];
