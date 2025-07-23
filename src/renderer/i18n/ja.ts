import languages from "./languages";
import { beat_badge } from "./common";

const lang = {
  message: {
    hello: "こんにちは、世界",
  },
  menu: {
    top: "Home",
    mypage: "マイページ",
    signin: "ログイン",
    signout: "ログアウト",
    about: "Abount",
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
    },
  },
  form: {
    cancel: "キャンセル",
    template_selector: {
      insert: "追加",
      change: "変更",
    },
    changeBeatTypeFirst: "Change beat type first",
    generateImage: "画像生成",
    generateMovie: "動画生成",
    generating: "生成中...",
  },
  generating: "生成中...",
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
    generate: {
      generateContents: "Generate Contents",
      movie: "Movie",
      audio: "Podcast",
      pdfSlide: "PDF (Presenter)",
      pdfHandout: "PDF (Handout)",
    },
  },
  beat: {
    videoPreview: "動画プレビュー",
    imagePreview: "画像プレビュー",
    badge: beat_badge,
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
    },
  },
  languages,
};

export default lang;
