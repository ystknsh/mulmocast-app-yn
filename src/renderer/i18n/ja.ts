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
  beat: {
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
        contents: "Markdownの内容\n# タイトル\nここに内容を記入してください...\n- 項目1\n- 項目2\n- 項目3",
      },
      htmlPrompt: {
        contents: "カスタムスライドコンテンツを生成するためのHTMLプロンプトを入力してください...",
      },
      chart: {
        contents: "チャートデータをJSON形式で入力してください\n" + '{\n  "type": "bar",\n  "data": {\n    "labels": ["1月", "2月", "3月"],\n    "datasets": [{\n      "label": "売上",\n      "data": [65, 59, 80]\n    }]\n  }\n}',
      },
      mermaid: {
        contents: "Mermaidダイアグラムコードを入力してください\n" + "graph TD\n    A[開始] --> B{判断}\n    B -->|はい| C[処理A]\n    B -->|いいえ| D[処理B]\n    C --> E[終了]\n    D --> E",
      },
      htmlTailwind: {
        contents: "Tailwind CSSクラスを使用したHTMLを入力してください\n" + '<div class="p-8 bg-gradient-to-br from-blue-500 to-purple-600">\n  <h1 class="text-4xl font-bold text-white mb-4">こんにちは</h1>\n  <p class="text-white/90">Tailwind CSSで美しいスライドを作成</p>\n</div>',
      },
      reference: {
        id: "参照するビートIDを入力してください（例: beat_1）",
      },
      imagePrompt: {
        contents: "画像を生成するためのプロンプトを入力してください...",
      },
      moviePrompt: {
        contents: "空白では動作しません。スペースを入力してください。",
      },
    },
  },
  languages,
};

export default lang;
