import { beatBadge, commonLanguages } from "./common";

const lang = {
  message: {
    hello: "こんにちは、世界",
  },
  // UI common vocabulary (reuse-focused)
  ui: {
    common: {
      // Navigation
      back: "戻る",

      // File operations
      drophere: "画像をここにドロップ",
      or: "または",

      // Common labels
      title: "タイトル",
      description: "説明",
      key: "キー",
      image: "画像",
      audio: "音声",
      video: "動画",
      movie: "動画",
      file: "ファイル",
      url: "URL",

      // Modal
      clickOutsideToClose: "外側をクリックするとモーダルが閉じます",
    },

    // Common actions (placeholder pairs)
    actions: {
      // Basic actions (no placeholder)
      create: "作成",
      update: "更新",
      generate: "生成",
      generateThing: "{thing}を生成",
      fetch: "取得",
      cancel: "キャンセル",

      // Media actions (placeholder pairs)
      play: "再生",
      playThing: "{thing}を再生",
      download: "ダウンロード",
      downloadThing: "{thing}をダウンロード",
      view: "表示",
      viewThing: "{thing}を表示",

      // Content generation
      generateImage: "画像生成",
      generateMovie: "動画生成",
      generateReference: "参照イメージ生成",

      // CRUD operations (placeholder pairs)
      add: "追加",
      addThing: "{thing}を追加",
      delete: "削除",
      deleteThing: "{thing}を削除",
      edit: "編集",
      editThing: "{thing}を編集",
      open: "開く",
      openThing: "{thing}を開く",

      // Chat actions
      clearChat: "チャットリセット",
      copyScript: "チャットへコピー",
      createScript: "スクリプト作成",

      // Template actions
      insert: "追加",
      change: "変更",
      reference: "画像をセット",

      // Project actions
      createNew: "新規作成",
      openProjectFolder: "プロジェクトのフォルダを開く",
    },

    // Status messages
    status: {
      // Processing states
      loading: "読み込み中...",
      loadingThing: "{thing}読み込み中...",
      generating: "生成中...",
      generatingThing: "{thing}生成中...",
      creating: "作成中...",
      saving: "保存中...",
      processing: "処理中...",

      // Completion states
      complete: "完了",
      success: "成功",
      ready: "準備完了",

      // Error states
      error: "エラー",
      failed: "失敗",
      cancelled: "キャンセル",

      // Specific loading states
      loadingProjects: "プロジェクト読み込み中...",
      generatingImage: "画像生成中...",
      generatingAudio: "音声生成中...",
      generatingMovie: "動画生成中...",
    },
  },
  common: {
    drophere: "画像をここにドロップ",
    or: "もしくは",
    fetch: "取得",
    imagePrompt: "イメージプロンプト",
    moviePrompt: "動画プロンプト",
    htmlPrompt: "HTMLプロンプト",
    defaultTitle: "[無題]",
  },
  menu: {
    top: "ホーム",
    settings: "設定",
    mypage: "マイページ",
    signin: "ログイン",
    signout: "ログアウト",
    about: "About",
  },
  settings: {
    title: "設定",
    appSettings: {
      title: "アプリ設定",
      description: "アプリケーションの設定を行います",
      language: {
        label: "表示言語",
        placeholder: "言語を選択",
        description: "アプリケーションの表示言語を選択してください",
      },
    },
    apiKeys: {
      title: "APIキー設定",
      description: "外部サービスのAPIキーを設定します",
    },
    notifications: {
      success: "設定を保存しました",
      error: "設定の保存に失敗しました",
      createSuccess: "Script created successfully 🎉",
    },
    languages: {
      title: "言語設定",
      description: "スクリプトの言語および翻訳言語の設定",
      mainTitle: "スクリプトの主言語",
      translatedTitle: "翻訳先の言語",
    },
  },
  form: {
    cancel: "キャンセル",
    template_selector: {
      insert: "追加",
      change: "変更",
      reference: "画像をセット",
    },
    changeBeatTypeFirst: "Change beat type first",
    generateImage: "画像生成",
    generateMovie: "動画生成",
    generateAudio: "音声生成",
    translateBeat: "翻訳",
    generating: "生成中",
    delete: "削除",
    add: "追加",
  },
  generating: "生成中...",
  generate: "生成",
  update: "更新",
  dashboard: {
    createNew: "新規作成",
    project: "{count} 件のプロジェクト",
    sortBy: "並び替え",
    sort: {
      updatedAtDesc: "更新日時（新しい順）",
      updatedAtAsc: "更新日時（古い順）",
      titleAsc: "タイトル（昇順）",
      titleDesc: "タイトル（降順）",
    },
  },
  panels: {
    openAiChat: "AI アシスタントチャットパネルを開く",
    openOutputProduct: "出力設定 & 生成 / 成果物パネルを開く",
    aiAssistantChat: "AI アシスタントチャット",
    outputProduct: "出力設定 & 生成 / 成果物",
    outputSettingsGeneration: "出力設定 & 生成",
    aiPoweredGuide: "AI搭載MulmoScript生成ガイド",
    beginnerDescription: "AI アシスタントとの会話を通じてスクリプトを作成しましょう",
    advancedDescription: "ChatGPT や他の AI ツールを使用して、実証済みのプロンプトでスクリプトコンテンツを生成",
  },
  project: {
    header: {
      back: "戻る",
      openProjectFolder: "プロジェクトのフォルダを開く",
    },
    menu: {
      script: "編集",
      debugLog: "デバッグログ",
    },
    generate: {
      generateContents: "コンテンツ生成",
      movie: "動画",
      audio: "音声",
      pdfSlide: "PDF (プレゼン)",
      pdfHandout: "PDF (資料)",
    },
    scriptEditor: {
      menu: {
        textMode: "会話字幕編集",
        textModeDescription: "話者と会話や字幕へ編集ができます",
        yamlMode: "YAML Mode",
        yamlModeDescription: "Complete MulmoScript editing",
        jsonMode: "JSON Mode",
        jsonModeDescription: "Complete MulmoScript editing",
        mediaMode: "動画像設定",
        mediaModeDescription: "Beatごとのイメージや動画の編集とプレビュー",
        styleMode: "Style",
        styleModeDescription: "音声/動画像/字幕などの設定",
        referenceMode: "参照イメージ",
        referenceModeDescription: "キャラクターの一貫性のための参照イメージ",
      },
      provider: "プロバイダ",
      speechParams: {
        title: "音声設定",
        language: "言語",
        displayName: "表示名",
      },
      beat: {
        speaker: "話者",
        text: "文章",
      },
      movieParams: {
        title: "動画設定",
        provider: "プロバイダ",
        model: "モデル",
        transitionType: "トランジションの種類",
        transitionDuration: "トランジションの長さ（秒）",
        providerNone: "なし",
        modelAuto: "自動",
        transitionFade: "フェード",
        transitionSlideoutLeft: "左にスライドアウト",
      },
      reference: {
        generateReference: "参照イメージ生成",
        key: "キー",
        image: "画像",
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
      enterMessage: "メッセージを入力してください:",
      clearChat: "チャットリセット",
      createButtonDescription:
        "スクリプトを作成するには、テンプレートを選択して「チャットへコピー」「スクリプト作成」ボタンを押してください。",
      copyScript: "チャットへコピー",
      creating: "作成中...",
      createScript: "スクリプト作成",
    },
  },
  beat: {
    videoPreview: "動画プレビュー",
    imagePreview: "画像プレビュー",
    badge: beatBadge,
    form: {
      image: {
        url: "URL",
      },
      textSlide: {
        title: "スライドタイトル",
        contents: "スライドの内容\nMarkdown形式の箇条書き\n- 項目1\n- 項目2",
      },
      markdown: {
        contents: "Markdownの内容\n# タイトル\nここに内容を記入してください。\n- 項目1\n- 項目2\n- 項目3",
      },
      htmlPrompt: {
        contents: "カスタムスライドコンテンツを生成するためのHTMLプロンプトを入力してください。",
      },
      chart: {
        contents:
          "チャートデータをJSON形式で入力してください\n{'{'}\n  \"type\": \"bar\",\n  \"data\": {'{'} ... {'}'}\n{'}'}",
      },
      mermaid: {
        contents: "Mermaidダイアグラムコードを入力してください。",
      },
      htmlTailwind: {
        contents: "Tailwind CSSクラスを使用したHTMLを入力してください。",
      },
      reference: {
        id: "参照するビートIDを入力してください（例: beat_1）",
      },
      imagePrompt: {
        contents: "画像を生成するためのプロンプトを入力してください。",
      },
      moviePrompt: {
        contents: "空白では動作しません。スペースを入力してください。",
      },
      imageReference: {
        key: "キー(英数字のみ)",
      },
    },
  },
  modal: {
    clickOutsideToClose: "外側をクリックするとモーダルが閉じます",
  },
  notify: {
    audio: {
      successMessage: "音声生成成功!!",
      errorMessage: "音声生成失敗",
    },
    image: {
      successMessage: "画像生成成功!!",
      errorMessage: "画像生成失敗",
    },
    translate: {
      successMessage: "翻訳成功!!",
      errorMessage: "翻訳失敗",
    },
    content: {
      successMessage: "作成成功!!",
      errorMessage: "作成失敗",
    },
    // BeatSessionType
    beat: {
      imageReference: "参照画像",
      audio: "音声",
      image: "画像",
      multiLingual: "多言語テキスト",
      caption: "キャプション",
      movie: "動画",
      html: "HTML",
      soundEffect: "効果音",
      lipSync: "リップシンク",
    },
    task: {
      audio: "音声",
      video: "動画",
      image: "画像",
      pdf: "PDF",
    },
  },
  provider: {
    openai: "OpenAI",
    nijivoice: "Nijivoice",
    google: "Google",
    elevenlabs: "ElevenLabs",
  },
  languages: {
    ja: "日本語",
    en: "英語",
    fr: "フランス語",
    es: "イスパニア語",
    de: "ドイツ語",
    ru: "ロシア語",
    pt: "ポルトガル語",
    tr: "トルコ語",
    it: "イタリア語",
    fa: "ペルシャ語",
    nl: "オランダ語",
    pl: "ポーランド語",
    zh: "中国語",
    vi: "ベトナム語",
    id: "インドネシア語",
    cs: "チェコ語",
    ko: "韓国語",
    ar: "アラビア語",
    uk: "ウクライナ語",
    el: "ギリシャ語",
    "zh-CN": "簡体字中国語",
    "zh-TW": "繁体字中国語",
    hi: "ヒンディー語",
  },
  commonLanguages,
};

export default lang;
