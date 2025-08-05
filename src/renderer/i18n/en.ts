import { commonLanguages, beatBadge } from "./common";

const lang = {
  message: {
    hello: "hello world",
  },
  common: {
    drophere: "Drop file here",
    or: "or",
    fetch: "Fetch",
    imagePrompt: "Image Prompt",
    moviePrompt: "Movie Prompt",
    htmlPrompt: "HTML Prompt",
    defaultTitle: "[untitled]",
  },
  menu: {
    top: "Dashboard",
    mypage: "MyPage",
    signin: "SignIn",
    signout: "SignOut",
    about: "About",
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
      createSuccess: "Script created successfully 🎉",
    },
    languages: {
      title: "Language Settings",
      description: "Script language and translation language settings",
      mainTitle: "The main language of the script",
      translatedTitle: "Language to be translated",
    },
  },
  form: {
    cancel: "Cancel",
    template_selector: {
      insert: "Insert",
      change: "Change",
      reference: "Set Reference",
    },
    changeBeatTypeFirst: "Change beat type first",
    generateImage: "Generate image",
    generateMovie: "Generate movie",
    generateAudio: "generate audio",
    translateBeat: "translate",
    generating: "Generating...",
    add: "Add",
  },
  generating: "Generating...",
  generate: "Generate",
  update: "Update",
  dashboard: {
    createNew: "Create New",
    project: "No projects | One project | {count} projects",
    sortBy: "Sort by",
    sort: {
      updatedAtDesc: "Last updated (newest first)",
      updatedAtAsc: "Last updated (oldest first)",
      titleAsc: "Title (A-Z)",
      titleDesc: "Title (Z-A)",
    },
  },
  panels: {
    openAiChat: "Open AI Assistant Chat panel",
    openOutputProduct: "Open Output & Product panel",
    aiAssistantChat: "AI Assistant Chat",
    outputProduct: "Output Settings & Generation / Production",
    outputSettingsGeneration: "Output Settings & Generation",
    aiPoweredGuide: "AI-Powered MulmoScript Generation Guide",
    beginnerDescription: "Let's Create Scripts Through Conversation with AI Assistants",
    advancedDescription: "Use ChatGPT or other AI tools to generate your Script content with these proven prompts",
  },
  project: {
    header: {
      back: "Back",
      openProjectFolder: "Open Project Folder",
    },
    menu: {
      script: "Script",
      debugLog: "Debug Logs",
    },
    generate: {
      generateContents: "Generate Contents",
      movie: "Movie",
      audio: "Podcast",
      pdfSlide: "PDF (Presenter)",
      pdfHandout: "PDF (Handout)",
    },
    scriptEditor: {
      movieParams: {
        title: "Movie Parameters",
        provider: "Provider",
        model: "Model",
        transitionType: "Transition Type",
        transitionDuration: "Transition Duration (seconds)",
        providerNone: "None",
        modelAuto: "Auto",
        transitionFade: "Fade",
        transitionSlideoutLeft: "Slide Out Left",
      },
      reference: {
        generateReference: "Generate Reference",
        key: "Key",
        image: "Image",
      },
    },
    productTabs: {
      tabs: {
        movie: "Movie",
        pdf: "PDF",
        html: "HTML",
        podcast: "Podcast",
        slide: "Slide",
      },
      movie: {
        title: "Movie Preview",
        description: "Video content playback and preview",
        play: "Play",
        download: "Download MP4",
        details: "Duration: 12:34 - Resolution: 1920x1080 - Size: 145 MB",
      },
      pdf: {
        title: "PDF Preview",
        description: "PDF document display and download",
        view: "View PDF",
        download: "Download PDF",
        details: "8 pages - A4 format - Size: 2.1 MB",
      },
      html: {
        title: "HTML Preview",
        description: "Interactive web format display",
        view: "View HTML",
        download: "Download HTML",
        details: "Interactive content - Responsive design",
      },
      podcast: {
        title: "Podcast Preview",
        description: "Audio content playback and preview",
        play: "Play",
        download: "Download MP3",
        details: "Duration: 12:34 - Size: 8.2 MB",
      },
      slide: {
        title: "Slide Preview",
        description: "Slide format display and navigation",
        start: "Start Slideshow",
        export: "Export Images",
        details: "8 slides - 1920x1080 resolution",
      },
    },
    chat: {
      enterMessage: "Enter your message:",
      clearChat: "Clear chat",
      createButtonDescription:
        "To create a script with the content so far, please select a template and press the Create button.",
      copyScript: "Copy script",
      creating: "Creating...",
      createScript: "Create Script",
    },
  },
  beat: {
    videoPreview: "Video Preview",
    imagePreview: "Image Preview",
    badge: beatBadge,
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
        contents: "Enter chart data in JSON format\n{'{'}\n  \"type\": \"bar\",\n  \"data\": {'{'} ... {'}'}\n{'}'}",
      },
      mermaid: {
        contents: "Enter Mermaid diagram code.",
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
      imageReference: {
        key: "Image Reference Key (a-z0-9)",
      },
    },
  },
  modal: {
    clickOutsideToClose: "Click outside to close",
  },
  notify: {
    audio: {
      successMessage: "Audio generated successfully",
      errorMessage: "Failed to generate audio",
    },
    image: {
      successMessage: "Image generated successfully",
      errorMessage: "Failed to generate image",
    },
    translate: {
      successMessage: "Translate successfully",
      errorMessage: "Failed to translate text",
    },
    content: {
      successMessage: "Contents generated successfully",
      errorMessage: "Failed to generate contents",
    },
    beat: {
      imageReference: "Reference Image",
      audio: "Audio",
      image: "Image",
      multiLingual: "Multilingual Text",
      caption: "Caption",
      movie: "Movie",
      html: "HTML",
      soundEffect: "Sound Effect",
      lipSync: "Lip Sync",
    },
    task: {
      audio: "Audio",
      video: "Video",
      image: "Image",
      pdf: "PDF",
    },
  },
  languages: {
    ja: "Japanese",
    en: "English",
    fr: "French",
    es: "Spanish",
    de: "German",
    ru: "Russian",
    pt: "Portuguese",
    tr: "Turkish",
    it: "Italian",
    fa: "Persian",
    nl: "Dutch",
    pl: "Polish",
    zh: "Chinese",
    vi: "Vietnamese",
    id: "Indonesian",
    cs: "Czech",
    ko: "Korean",
    ar: "Arabic",
    uk: "Ukrainian",
    el: "Greek",
    "zh-CN": "Simplified Chinese",
    "zh-TW": "Traditional Chinese",
    hi: "Hindi",
  },
  commonLanguages,
};

export default lang;
