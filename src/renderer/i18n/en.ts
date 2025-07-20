import languages from "./languages";
import { beat_badge } from "./common";

const lang = {
  message: {
    hello: "hello world",
  },
  menu: {
    top: "Home",
    mypage: "MyPage",
    signin: "SignIn",
    signout: "SignOut",
    about: "Abount",
  },
  settings: {
    title: "Settings",
    appSettings: {
      title: "App Settings",
      description: "Configure application settings",
      language: {
        label: "Display Language",
        placeholder: "Select a language",
        description: "Select your preferred display language for the application",
      },
    },
    apiKeys: {
      title: "API Key Settings",
      description: "Configure API keys for external services",
    },
    notifications: {
      success: "Settings saved",
      error: "Failed to save settings",
    },
  },
  beat: {
    badge: beat_badge,
    form: {
      image: {
        url: "url",
      },
      textSlide: {
        title: "Slide Title",
        contents: "Slide Contents\nMarkdown bullets\n- one\n- two",
      },
      markdown: {
        contents: "Markdown Contents\n# Title\nWrite your content here.\n- Item 1\n- Item 2\n- Item 3",
      },
      htmlPrompt: {
        contents: "Enter HTML prompt to generate custom slide content.",
      },
      chart: {
        contents: "Enter chart data in JSON format\n" + '{\n  "type": "bar",\n  "data": {\n    "labels": ["January", "February", "March"],\n    "datasets": [{\n      "label": "Sales",\n      "data": [65, 59, 80]\n    }]\n  }\n}',
      },
      mermaid: {
        contents: "Enter Mermaid diagram code\n" + "graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Do something]\n    B -->|No| D[Do something else]\n    C --> E[End]\n    D --> E",
      },
      htmlTailwind: {
        contents: "Enter HTML with Tailwind CSS classes.",
      },
      reference: {
        id: "Enter beat ID to reference (e.g., beat_1)",
      },
      imagePrompt: {
        contents: "Enter prompt to generate image.",
      },
      moviePrompt: {
        contents: "Blank won't work, space will.",
      },
    },
  },
  languages,
};

export default lang;
