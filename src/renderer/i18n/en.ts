import { commonLanguages } from "./common";

const lang = {
  message: {
    hello: "hello world",
  },
  // UI common vocabulary (reuse-focused)
  ui: {
    common: {
      applicationName: "MulmoCast",
      // Navigation
      back: "Back",

      // File operations
      drophere: "Drop file here",
      or: "or",

      // Common labels and nouns
      title: "Title",
      description: "Description",
      key: "Key",
      image: "Image",
      audio: "Audio",
      video: "Video",
      movie: "Movie",
      file: "File",
      url: "URL",
      prompt: "Prompt",
      contents: "Contents",
      content: "Content",
      data: "Data",
      code: "Code",
      name: "Name",
      size: "Size",
      width: "Width",
      height: "Height",
      duration: "Duration",
      quality: "Quality",
      style: "Style",
      type: "Type",
      format: "Format",
      language: "Language",
      provider: "Provider",
      model: "Model",
      speed: "Speed",
      volume: "Volume",
      padding: "Padding",
      beat: "Beat",
      slide: "Slide",
      chart: "Chart",
      speaker: "Speaker",
      chat: "Chat",
      panel: "Panel",
      parameters: "Parameters",
      example: "ex)",

      enable: "Enable",
      disable: "Disable",

      by: "×",
      decrease: "-",
      increase: "+",
    },

    // Common actions (placeholder pairs)
    actions: {
      // Basic actions (no placeholder)
      create: "Create",
      update: "Update",
      generate: "Generate",
      generating: "Generating",
      generateThing: "Generate {thing}",
      fetch: "Fetch",
      cancel: "Cancel",
      ok: "OK",
      runningThing: "{thing} is running",

      // Media actions (placeholder pairs)
      play: "Play",
      playThing: "Play {thing}",
      download: "Download",
      downloadThing: "Download {thing}",
      view: "View",
      viewThing: "View {thing}",

      // Content generation
      generateImage: "Generate image",
      generateMovie: "Generate movie",
      changeBeatTypeFirst: "Change beat type first",
      generateReference: "Generate Reference",
      generateAudio: "Generate audio",
      translateBeat: "Translate",

      // CRUD operations (placeholder pairs)
      add: "Add",
      addThing: "Add {thing}",
      delete: "Delete",
      deleteThing: "Delete {thing}",
      edit: "Edit",
      editThing: "Edit {thing}",
      open: "Open",
      openThing: "Open {thing}",

      // Chat actions
      clearChat: "Clear chat",
      copy: "Copy",
      copyScript: "Copy script",
      createScript: "Create Script",

      // Template actions
      insert: "Insert",
      change: "Change",
      reference: "Set Reference",

      // Project actions
      createNew: "Create New",
      openProjectFolder: "Open Project Folder",
    },

    // Status messages
    status: {
      // Processing states
      loading: "Loading...",
      loadingThing: "Loading {thing}...",
      generating: "Generating...",
      generatingThing: "Generating {thing}...",
      creating: "Creating...",
      saving: "Saving...",
      processing: "Processing...",

      // Completion states
      complete: "Complete",
      success: "Success",
      ready: "Ready",

      // Error states
      error: "Error",
      failed: "Failed",
      cancelled: "Cancelled",

      // Specific loading states
      loadingProjects: "Loading projects...",
      generatingImage: "Generating Image...",
      generatingAudio: "Generating audio...",
      generatingMovie: "Generating movie...",
    },

    // Common UI element names
    elements: {
      button: "Button",
      input: "Input",
      textarea: "Textarea",
      select: "Select",
      checkbox: "Checkbox",
      radio: "Radio",
      slider: "Slider",
      tab: "Tab",
      panel: "Panel",
      dialog: "Dialog",
      modal: "Modal",
      dropdown: "Dropdown",
      menu: "Menu",
      tooltip: "Tooltip",
      placeholder: "Placeholder",
      label: "Label",
      field: "Field",
      form: "Form",
      table: "Table",
      list: "List",
      card: "Card",
      badge: "Badge",
    },

    // Common messages
    messages: {
      cannotUndo: "This action cannot be undone.",
    },

    // Validation messages
    validation: {
      required: "This field is required",
      invalid: "Invalid format",
      tooShort: "Too short",
      tooLong: "Too long",
      mustBeNumber: "Must be a number",
      mustBeUrl: "Must be a valid URL",
      unsupportedType: "Unsupported type: {type}",
    },
  },
  ai: {
    agent: {
      openAIAgent: "OpenAI",
      ollamaAgent: "Ollama",
      geminiAgent: "Gemini",
      anthropicAgent: "Anthropic",
      replicateAgent: "Replicate",
      groqAgent: "Groq",
    },
    provider: {
      openai: {
        name: "OpenAI",
      },
      nijivoice: {
        name: "Nijivoice",
      },
      google: {
        name: "Google",
      },
      elevenlabs: {
        name: "ElevenLabs",
      },
      replicate: {
        name: "Replicate",
      },
      alertTemplate: "You need to setup {thing}",
    },
    apiKeyName: {
      OPENAI_API_KEY: "OpenAI API Key",
      NIJIVOICE_API_KEY: "NijiVoice API Key",
      TAVILY_API_KEY: "Tavily API Key",
      ELEVENLABS_API_KEY: "ElevenLabs API Key",
      REPLICATE_API_TOKEN: "Replicate API Token",
      GEMINI_API_KEY: "Gemini API Key",
      ANTHROPIC_API_KEY: "Anthropic API Key",
      GROQ_API_KEY: "GROQ API Key",
      EXA_API_KEY: "EXA API Key",
    },
  },
  menu: {
    top: "Dashboard",
    settings: "Settings",
    mypage: "MyPage",
    signin: "SignIn",
    signout: "SignOut",
    about: "About",
  },
  theme: {
    toggle: "Toggle theme",
    light: "Light",
    dark: "Dark",
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
      llmDescription:
        "* LLM Processing: Used for script generation, translation, research, and other text generation/processing",
      getApiKey: "Get API Key",
      features: {
        tts: "Text-to-Speech",
        "tts-jp": "Japanese TTS",
        imageGeneration: "Image Generation",
        videoGeneration: "Video Generation",
        llm: "LLM Processing",
        webSearch: "Web Search",
        soundEffects: "Sound Effects",
        lipSync: "Lip Sync",
      },
    },
    notifications: {
      success: "Settings saved",
      error: "Failed to save settings",
      createSuccess: "Script created successfully 🎉",
      copiedToClipboard: "Copied to clipboard",
      copyFailed: "Failed to copy to clipboard",
    },
    languages: {
      title: "Language Settings",
      description: "Script language and translation language settings",
      mainTitle: "The main language of the script",
      translatedTitle: "Language to be translated",
    },
    llmSettings: {
      title: "LLM Settings",
      description: "Configure your LLM settings",
      llm: {
        label: "LLM Agent",
        placeholder: "LLM",
        description: "Select the LLM to use in chat",
      },
      ollama: {
        label: "Ollama Setting",
        url: "URL",
      },
      model: "Model",
    },
  },
  dashboard: {
    createNew: "Create New",
    project: "No projects | 1 project | {count} projects",
    sortBy: "Sort by",
    sort: {
      updatedAtDesc: "Last updated (newest first)",
      updatedAtAsc: "Last updated (oldest first)",
      titleAsc: "Title (A-Z)",
      titleDesc: "Title (Z-A)",
    },
    empty: "No projects yet. Create your first project to get started!",
    confirmDelete: 'Are you sure you want to delete "{title}"?',
    errors: {
      createProjectFailed: "Failed to create project. Please try again.",
      deleteProjectFailed: "Failed to delete project. Please try again.",
    },
  },
  project: {
    newProject: {
      title: "Create New Project",
      placeholder: "Enter project title",
      defaultTitle: "(untitled)",
    },
    header: {
      back: "Back",
      openProjectFolder: "Open Project Folder",
    },
    menu: {
      script: "Script",
      product: "Product",
      debugLog: "Debug Logs",
    },
    generate: {
      openPanel: "Open Output & Product panel",
      outputProduct: "Output Settings & Generation / Production",
      outputSettingsGeneration: "Output Settings & Generation",
      generateContents: "Generate Contents",
      movie: "Movie",
      audio: "Podcast",
      pdfSlide: "PDF (Presenter)",
      pdfHandout: "PDF (Handout)",
    },
    scriptEditor: {
      text: {
        tabLabel: "Text",
        mode: "Text Mode",
        modeDescription: "Speaker and dialogue editing only",
      },
      yaml: {
        tabLabel: "YAML",
        mode: "YAML Mode",
        modeDescription: "Complete MulmoScript editing",
      },
      json: {
        tabLabel: "JSON",
        mode: "JSON Mode",
        modeDescription: "Complete MulmoScript editing",
      },
      media: {
        tabLabel: "Media",
        mode: "Media Mode",
        modeDescription: "Beat-by-beat media editing and preview",
      },
      style: {
        tabLabel: "Style",
        mode: "Style",
        modeDescription: "Presentation style editing",
      },
      reference: {
        tabLabel: "Ref",
        mode: "Reference",
        modeDescription: "Reference image for character consistency",
      },
      validationStatus: "Validation Status",
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
        pause: "Pause",
        download: "Download MP4",
        details: "Duration: {duration} - Resolution: {resolution} - Size: {size}",
      },
      pdf: {
        title: "PDF Preview",
        description: "PDF document display and download",
        view: "View PDF",
        download: "Download PDF",
        details: "{pages} pages - Size: {size}",
        empty: "PDF not generated",
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
        details: "Duration: {duration} - Size: {size}",
      },
      slide: {
        title: "Slide Preview",
        description: "Slide format display and navigation",
        start: "Start Slideshow",
        export: "Export Images",
        details: "{current} / {pages} slides",
        autoPlay: "Auto Play",
      },
    },
    chat: {
      openPanel: "Open AI Assistant Chat panel",
      title: "AI Assistant Chat",
      aiPoweredGuide: "AI-Powered MulmoScript Generation Guide",
      beginnerDescription: "Let's Create Scripts Through Conversation with AI Assistants",
      advancedDescription: "Use ChatGPT or other AI tools to generate your Script content with these proven prompts",
      enterMessage: "Enter your message:",
      clearChat: "Clear chat",
      undoChat: "Undo",
      createButtonDescription:
        "To create a script with the content so far, please select a template and press the Create button.",
      copyScript: "Copy script",
      creating: "Creating...",
      createScript: "Create Script",
      exampleMessage: "ex) Thank you very much! Please proceed with the creation.",
    },
  },
  beat: {
    videoPreview: "Video Preview",
    imagePreview: "Image Preview",
    // Beat speaker settings
    speaker: {
      selectSpeaker: "Select a speaker",
      text: "Text",
      placeholder: "{language} input: {speaker}'s voice content",
    },
    // Beat type structures (moved from beat.form.*)
    mediaFile: {
      badge: "Media File",
      label: "Image or Movie file",
      remoteLabel: "Remote Media",
      urlField: "URL",
      placeholder: "Enter image URL or upload file",
    },
    textSlide: {
      badge: "Text Slide",
      label: "Slide: Text",
      titleField: "Title",
      contentsField: "Contents",
      placeholder: "Slide Contents\nMarkdown bullets\n- one\n- two",
    },
    markdown: {
      badge: "Markdown",
      label: "Slide: Markdown",
      contentsField: "Contents",
      placeholder: "Markdown Contents\n# Title\nWrite your content here.\n- Item 1\n- Item 2\n- Item 3",
    },
    htmlPrompt: {
      badge: "HTML Prompt",
      label: "HTML Prompt",
      promptField: "Prompt",
      placeholder: "Enter HTML prompt to generate custom slide content.",
    },
    chart: {
      badge: "Chart",
      label: "Slide: Graph - Chart JSON",
      titleField: "Title",
      chartDataField: "Chart Data",
      placeholder: "Enter chart data in JSON format\n{'{'}\n  \"type\": \"bar\",\n  \"data\": {'{'} ... {'}'}\n{'}'}",
    },
    mermaid: {
      badge: "Mermaid",
      label: "Slide: Diagram - Mermaid",
      titleField: "Title",
      codeField: "Code",
      placeholder: "Enter Mermaid diagram code.",
    },
    html_tailwind: {
      badge: "Tailwind Html",
      label: "Slide: HTML(Tailwind)",
      htmlField: "HTML",
      placeholder: "Enter HTML with Tailwind CSS classes.",
    },
    beat: {
      badge: "Beat",
      label: "Reference Image",
      idField: "Beat ID",
      referenceField: "Beat Reference",
      placeholder: "Enter beat ID to reference (e.g., beat_1)",
      placeholderUrl: "Enter image URL",
    },
    imagePrompt: {
      badge: "Image Prompt",
      label: "Image Prompt",
      promptField: "Prompt",
      placeholder: "Enter prompt to generate image. If empty, text is used.",
    },
    moviePrompt: {
      badge: "Movie Prompt",
      label: "Movie Prompt",
      promptField: "Prompt",
      placeholder: "Blank won't work, space will.",
    },
    imageReference: {
      badge: "Image Reference",
      keyField: "Image Reference Key",
      placeholder: "Image Reference Key (a-z0-9)",
    },
    image: {
      badge: "Image",
    },
    movie: {
      badge: "Movie",
    },
    lipSync: {
      label: "LipSync",
    },
  },

  // Parameters structure (extracted from project.scriptEditor.*)
  parameters: {
    movieParams: {
      title: "Movie Parameters",
      transitionType: "Transition Type",
      transitionDuration: "Transition Duration (seconds)",
      providerNone: "None",
      modelAuto: "Auto",
      transitionFade: "Fade",
      transitionSlideoutLeft: "Slide Out Left",
    },
    speechParams: {
      title: "Speech Parameters",
      language: "Language",
      displayName: "Display Name",
      voiceId: "Voice ID",
      speed: "Speed",
      instruction: "Instruction",
      noSpeakersDefined: "No speakers defined",
      initializeSpeechParameters: "Initialize Speech Parameters",
    },
    canvasSizeParams: {
      title: "Canvas Size",
      sizePreset: "Size Preset",
      width: "Width",
      height: "Height",
      custom: "Custom",
    },
    captionParams: {
      title: "Caption Parameters",
      language: "Language",
      languageDescription: "Caption language",
      noLanguage: "None",
      styles: "Styles",
      stylesDescription: "Enter CSS styles (one per line)",
    },
    textSlideParams: {
      title: "Text Slide Parameters",
      css: "CSS Styles",
      cssDescription: "Enter CSS styles as a single string or multiple lines.",
    },
    imageParams: {
      title: "Image Parameters",
      modelAuto: "Auto",
      stylePlaceholder: "ex) vivid, natural",
      moderation: "Moderation",
      moderationPlaceholder: "ex) low, auto",
      images: "Images",
    },
    audioParams: {
      title: "Audio Parameters",
      padding: "Padding",
      introPadding: "Intro Padding",
      closingPadding: "Closing Padding",
      outroPadding: "Outro Padding",
      bgmVolume: "BGM Volume",
      audioVolume: "Audio Volume",
      bgm: "BGM",
      bgmSelect: "Select BGM",
      noBgm: "None",
      customAudio: "Custom Audio",
      dropAudioHere: "Drop audio file here",
      clickToReplace: "Click to replace",
      clickToSelect: "or click to select",
    },
  },

  viewer: {
    mediaPreview: {
      modal: {
        dialogTitle: "Media Preview",
        dialogDescription: "Click outside to close",
      },
    },
    mulmo: {
      modal: {
        dialogTitle: "Mulmo Viewer",
        dialogDescription: "Click outside to close",
      },
    },
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
      caption: "Caption",
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
