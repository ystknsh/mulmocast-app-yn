export const beatTemplate = [
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
    name: "remote image",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "image",
        source: {
          kind: "url",
          url: "",
        },
      },
    },
  },
  {
    name: "remote movie",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "movie",
        source: {
          kind: "url",
          url: "",
        },
      },
    },
  },
  {
    name: "local media file",
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
          title: "No Audio",
          bullets: ["0.5 seconds"],
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
        chartData: {},
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
