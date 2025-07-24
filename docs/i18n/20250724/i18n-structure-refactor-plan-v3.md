# i18n 翻訳キー構造リファクタリング計画書 v3
**作成日**: 2025-07-24  
**作成者**: Claude Code  
**バージョン**: 3.0 - スキーマベース設計（Beat関連はMulmoScriptスキーマ準拠）

## 📋 概要

MulmoScriptスキーマを参考にした、より論理的な翻訳キー構造を設計します：
- **Beat関連**: MulmoScriptスキーマベース + Beat関連UI要素全包含
- **Parameters関連**: スキーマのパラメータ構造準拠
- **その他機能**: 従来の機能ベース構造を維持

## 🔍 現在のファイル構造（維持）

```
src/renderer/i18n/
├── common.ts      # 言語非依存の定数（英語のまま・翻訳しない）
├── en.ts          # 英語翻訳（単一ファイル維持）
├── ja.ts          # 日本語翻訳（単一ファイル維持）
├── index.ts       # i18n設定
├── languages.ts   # 言語リスト
└── utils.ts       # ユーティリティ
```

## 💡 設計原則

1. **スキーマベース設計** - MulmoScriptスキーマと翻訳構造を対応
2. **Beat関連一元管理** - スキーマ外のUI要素もbeatに集約
3. **単一ファイル維持** - `en.ts`と`ja.ts`を分割しない
4. **common.tsは英語のまま** - 技術用語・定数は翻訳しない
5. **検索性重視** - エディタ内検索（Ctrl+F）を考慮

## 🎯 構造比較（Before / After）

### Before: 現在の構造
```
├── generating
├── form/
│   ├── cancel
│   ├── changeBeatTypeFirst
│   └── template_selector/
├── panels/
│   ├── aiAssistantChat
│   └── openOutputProduct
├── beat/
│   ├── badge/ (全種別フラット)
│   └── form/ (全種別フラット)
└── project/
    ├── generate/
    └── scriptEditor/
```

### After: 新構造（スキーマベース）
```
├── message/ (既存・変更なし)
├── menu/ (既存・変更なし)
├── settings/ (既存・変更なし)
├── dashboard/ (既存・変更なし)
├── ui/           # 共通UI文言
│   ├── tabs/
│   ├── status/
│   └── validation/
├── beat/         # Beat機能全般（スキーマベース + UI要素）
│   ├── markdown/
│   ├── textSlide/
│   ├── imagePrompt/
│   ├── htmlPrompt/
│   ├── chart/
│   ├── mermaid/
│   ├── html_tailwind/
│   ├── (その他Beat種別)/
│   ├── placeholders/
│   ├── template/
│   ├── actions/
│   └── preview/
├── parameters/   # パラメータ設定（スキーマベース）
│   ├── imageParams/
│   ├── movieParams/
│   ├── audioParams/
│   ├── htmlPrompt/
│   ├── textSlideParams/
│   ├── speechOptions/
│   ├── captionParams/
│   └── canvasSizeParams/
├── chat/         # AI チャット
├── generate/     # 生成機能
│   └── progress/
└── product/      # 成果物表示
    ├── tabs/
    ├── movie/
    ├── pdf/
    ├── html/
    ├── podcast/
    └── slide/
```

## 🎯 新構造詳細

```typescript
// common.ts - 言語非依存の定数（英語のまま）
export const common = {
  // 共通アクション（技術用語）
  actions: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    create: "Create",
    edit: "Edit",
    close: "Close",
    add: "Add",
    remove: "Remove",
    fetch: "Fetch",
    insert: "Insert",
    change: "Change",
  },
  
  // Beat種別名（MulmoScriptスキーマ準拠・技術用語なので英語のまま）
  beatTypes: {
    // 基本メディアタイプ
    markdown: "Markdown",
    textSlide: "Text Slide", 
    chart: "Chart",
    mermaid: "Mermaid",
    html_tailwind: "Tailwind HTML",
    image: "Image",
    movie: "Movie",
    imagePrompt: "Image Prompt",
    htmlPrompt: "HTML Prompt",
    
    // 参照・制御系
    beat: "Beat Reference",
    voice_over: "Voice Over",
    
    // ファイル系
    web: "Web Page",
    pdf: "PDF",
    svg: "SVG",
    audio: "Audio",
    midi: "MIDI"
  },
  
  // ファイル形式（技術用語）
  formats: {
    json: "JSON",
    yaml: "YAML",
    pdf: "PDF",
    mp4: "MP4",
    mp3: "MP3",
    html: "HTML",
    svg: "SVG",
  },
  
  // ステータス（技術用語）
  status: {
    loading: "Loading",
    generating: "Generating",
    success: "Success",
    error: "Error",
    warning: "Warning",
  },
};

// en.ts / ja.ts の構造（スキーマベース）
const lang = {
  // 既存のトップレベル（変更なし）
  message: { ... },
  menu: { ... },
  settings: { ... },
  dashboard: { ... },
  
  // 共通UI文言
  ui: {
    tabs: {
      text: "Text",
      yaml: common.formats.yaml,  // common.tsから参照
      json: common.formats.json,
      media: "Media",
      style: "Style",
      ref: "Ref",
    },
    status: {
      generating: common.status.generating + "...",
      loading: common.status.loading + "...",
      saving: "Saving...",
      error: "Error occurred",
      success: "Success",
    },
    validation: {
      required: "This field is required",
      invalid: "Invalid format",
    },
  },
  
  // Beat関連（MulmoScriptスキーマベース + UI要素全包含）
  beat: {
    // スキーマ由来のBeat種別別設定
    markdown: {
      contents: "Markdown Contents",
      title: "Markdown Title",
    },
    textSlide: {
      title: "Slide Title",
      subtitle: "Slide Subtitle",
      contents: "Slide Contents",
    },
    chart: {
      title: "Chart Title",
      chartData: "Chart Data",
    },
    mermaid: {
      title: "Mermaid Title",
      code: "Mermaid Code",
    },
    html_tailwind: {
      html: "HTML Content",
    },
    imagePrompt: {
      prompt: "Image Prompt",
    },
    htmlPrompt: {
      prompt: "HTML Prompt",
      systemPrompt: "System Prompt",
      data: "Data",
    },
    web: {
      url: "URL",
    },
    image: {
      url: "Image URL",
      file: "Image File",
    },
    movie: {
      url: "Movie URL", 
      file: "Movie File",
    },
    audio: {
      url: "Audio URL",
      file: "Audio File",
    },
    beat: {
      id: "Beat ID",
      reference: "Beat Reference",
    },
    
    // スキーマ外のBeat関連UI要素
    placeholders: {
      markdown: "Enter Markdown content\\n# Title\\nWrite your content here.\\n- Item 1\\n- Item 2",
      textSlide: "Slide Contents\\nMarkdown bullets\\n- one\\n- two",
      chart: "Enter chart data in JSON format\\n{\\\"type\\\": \\\"bar\\\", \\\"data\\\": {...}}",
      mermaid: "Enter Mermaid diagram code.",
      html_tailwind: "Enter HTML with Tailwind CSS classes.",
      imagePrompt: "Enter prompt to generate image.",
      htmlPrompt: "Enter HTML prompt to generate custom slide content.",
      web: "Enter web page URL",
      image: "Enter image URL or upload file",
      movie: "Enter movie URL or upload file",
      audio: "Enter audio URL or upload file",
      beat: "Enter beat ID to reference (e.g., beat_1)",
    },
    
    // Beat共通UI要素
    template: {
      insert: common.actions.insert,
      change: common.actions.change,
    },
    actions: {
      addBeat: "Add Beat",
      changeBeatTypeFirst: "Change beat type first",
      generateImage: "Generate image",
      generateMovie: "Generate movie",
      duplicateBeat: "Duplicate Beat",
      deleteBeat: "Delete Beat",
    },
    preview: {
      video: "Video Preview",
      image: "Image Preview",
      audio: "Audio Preview",
    },
    mediaFile: {
      dropArea: "Drop file here",
      url: "URL",
      browse: "Browse Files",
    },
  },
  
  // パラメータ設定（MulmoScriptスキーマベース）
  parameters: {
    // 画像生成パラメータ（スキーマ準拠）
    imageParams: {
      title: "Image Parameters",
      provider: "Provider",
      model: "Model",
      style: "Style",
      images: "Images",
      size: "Image Size",
      quality: "Quality",
    },
    
    // 音声パラメータ（スキーマ準拠）
    audioParams: {
      title: "Audio Parameters",
      padding: "Padding",
      movieVolume: "Movie Volume",
      provider: "Provider",
      voice: "Voice",
    },
    
    // 動画パラメータ（スキーマ準拠）
    movieParams: {
      title: "Movie Parameters",
      provider: "Provider",
      model: "Model",
      fillOption: "Fill Option",
      speed: "Speed",
      transitionType: "Transition Type",
      transitionDuration: "Transition Duration (seconds)",
      transitionFade: "Fade",
      transitionSlideLeft: "Slide Out Left",
    },
    
    // HTMLプロンプトパラメータ（スキーマ準拠）
    htmlPrompt: {
      title: "HTML Prompt Parameters",
      systemPrompt: "System Prompt",
      prompt: "Prompt",
      data: "Data",
      images: "Images",
    },
    
    // テキストスライドパラメータ（スキーマ準拠）
    textSlideParams: {
      title: "Text Slide Parameters",
      cssStyles: "CSS Styles",
      padding: "Padding",
      fontSize: "Font Size",
      backgroundColor: "Background Color",
    },
    
    // 音声合成オプション（スキーマ準拠）
    speechOptions: {
      title: "Speech Parameters",
      initialize: "Initialize Speech Parameters",
      addSpeaker: "Add Speaker",
      noSpeakers: "No speakers defined",
      speed: "Speech Speed",
      instruction: "Speech Instruction",
    },
    
    // キャプションパラメータ（スキーマ準拠）
    captionParams: {
      title: "Caption Parameters",
      styles: "Caption Styles",
      fontSize: "Font Size",
      position: "Position",
    },
    
    // キャンバスサイズパラメータ（スキーマ準拠）
    canvasSizeParams: {
      title: "Canvas Size Parameters",
      width: "Width",
      height: "Height",
      aspectRatio: "Aspect Ratio",
    },
  },
  
  // AI チャット
  chat: {
    title: "AI Assistant Chat",
    openButton: "Open AI Assistant Chat panel",
    guide: "AI-Powered MulmoScript Generation Guide",
    beginnerDesc: "Let's Create Scripts Through Conversation with AI Assistants",
    advancedDesc: "Use ChatGPT or other AI tools to generate your Script content with these proven prompts",
    placeholder: "Type your message...",
    send: "Send",
    clear: "Clear chat",
    thinking: "AI is thinking...",
    error: "Failed to send message",
  },
  
  // 生成機能
  generate: {
    openButton: "Open Output & Product panel",
    panelTitle: "Output Settings & Generation / Production",
    settingsTitle: "Output Settings & Generation",
    button: "Generate Contents",
    movie: "Movie",
    audio: "Podcast",
    pdfSlide: "PDF (Presenter)",
    pdfHandout: "PDF (Handout)",
    success: "Contents generated successfully",
    error: "Failed to generate contents",
    cancel: "Cancel Generation",
    progress: {
      preparing: "Preparing...",
      generatingImages: "Generating images...",
      generatingAudio: "Generating audio...",
      creatingMovie: "Creating movie...",
      complete: "Complete!",
      failed: "Generation failed",
    },
  },
  
  // 成果物
  product: {
    tabs: {
      movie: "Movie",
      pdf: common.formats.pdf,
      html: common.formats.html,
      podcast: "Podcast",
      slide: "Slide",
    },
    movie: {
      title: "Movie Preview",
      description: "Video content playback and preview",
      play: "Play",
      pause: "Pause",
      download: "Download " + common.formats.mp4,
      details: "Duration: {duration} - Resolution: {width}x{height} - Size: {size}",
    },
    pdf: {
      title: "PDF Preview",
      description: "PDF document display and download",
      view: "View PDF",
      download: "Download " + common.formats.pdf,
      details: "{pages} pages - {format} format - Size: {size}",
    },
    html: {
      title: "HTML Preview",
      description: "Interactive web format display",
      view: "View HTML",
      download: "Download " + common.formats.html,
      details: "Interactive content - Responsive design",
    },
    podcast: {
      title: "Podcast Preview",
      description: "Audio content playback and preview",
      play: "Play",
      pause: "Pause",
      download: "Download " + common.formats.mp3,
      details: "Duration: {duration} - Size: {size}",
    },
    slide: {
      title: "Slide Preview",
      description: "Slide format display and navigation",
      start: "Start Slideshow",
      export: "Export Images",
      details: "{count} slides - {width}x{height} resolution",
      previous: "Previous",
      next: "Next",
    },
  },
  
  languages,
};
```

## 📊 キー変更マッピング

### common.tsへ移動・統合
| 旧キー | 新キー | 理由 |
|--------|--------|------|
| `beat.badge.*` | `common.beatTypes.*` | Beat種別名は技術用語 |
| `form.cancel` | `common.actions.cancel` | 共通アクション |
| `form.template_selector.insert` | `common.actions.insert` | 共通アクション |
| `generating` | `common.status.generating` | 共通ステータス |

### スキーマベース構造への変更
| 旧キー | 新キー | 変更理由 |
|--------|--------|-----------|
| `beat.badge.htmlPrompt` | `common.beatTypes.htmlPrompt` | スキーマの種別名 |
| `beat.form.htmlPrompt.contents` | `beat.htmlPrompt.prompt` | スキーマのフィールド名 |
| `beat.form.textSlide.title` | `beat.textSlide.title` | スキーマのフィールド名 |
| `beat.form.textSlide.contents` | `beat.textSlide.contents` | スキーマのフィールド名 |
| `beat.form.markdown.contents` | `beat.markdown.contents` | スキーマのフィールド名 |
| `beat.form.chart.contents` | `beat.chart.chartData` | スキーマのフィールド名 |
| `beat.form.mermaid.contents` | `beat.mermaid.code` | スキーマのフィールド名 |

### UI要素の統合
| 旧キー | 新キー | 変更理由 |
|--------|--------|-----------|
| `beat.form.htmlPrompt.contents` (placeholder) | `beat.placeholders.htmlPrompt` | UI要素を分離 |
| `beat.form.imagePrompt.contents` (placeholder) | `beat.placeholders.imagePrompt` | UI要素を分離 |
| `form.template_selector.change` | `beat.template.change` | Beat関連UIに統合 |
| `form.changeBeatTypeFirst` | `beat.actions.changeBeatTypeFirst` | Beat関連UIに統合 |

### パラメータのスキーマ準拠
| 旧キー | 新キー | 変更理由 |
|--------|--------|-----------|
| `project.scriptEditor.movieParams.*` | `parameters.movieParams.*` | スキーマのパラメータ構造 |
| `project.scriptEditor.audioParams.*` | `parameters.audioParams.*` | スキーマのパラメータ構造 |
| `project.scriptEditor.imageParams.*` | `parameters.imageParams.*` | スキーマのパラメータ構造 |

### 機能別の再配置
| 旧キー | 新キー | 変更理由 |
|--------|--------|-----------|
| `panels.aiAssistantChat` | `chat.title` | 機能別配置 |
| `panels.openOutputProduct` | `generate.openButton` | 機能別配置 |
| `project.generate.*` | `generate.*` | トップレベル配置 |
| `project.productTabs.*` | `product.*` | トップレベル配置 |

## 🔄 実装手順

### Phase 1: common.ts の拡充（30分）
1. Beat種別名をMulmoScriptスキーマに合わせて追加
2. 共通アクション・ステータスを集約
3. 技術用語・定数を統合

### Phase 2: Beat構造のスキーマベース実装（1.5時間）
1. スキーマに基づくBeat種別構造を作成
2. Beat関連UI要素（placeholders, template, actions, preview）を統合
3. 既存のbeat関連キーをマッピング

### Phase 3: Parameters構造のスキーマベース実装（1時間）
1. MulmoScriptスキーマのパラメータ構造を翻訳キーに反映
2. 既存のparameters関連キーをマッピング

### Phase 4: その他機能の整理（45分）
1. UI、chat、generate、product構造を整理
2. 既存キーから新構造へのマッピング

### Phase 5: コンポーネント更新（2時間）
1. common.tsからのインポートを追加
2. スキーマベースの翻訳キーに更新
3. 段階的テスト

### Phase 6: クリーンアップ・検証（30分）
1. 旧キーを削除
2. 全機能テスト
3. ドキュメント更新

## ⚠️ リスク対策

1. **スキーマ変更への対応** - MulmoScriptスキーマ更新時の翻訳キー同期
2. **後方互換性** - 一時的に新旧両方のキーを保持
3. **Beat種別の追加** - 新しいBeat種別への対応フロー確立
4. **パラメータ構造変更** - スキーマ変更時の影響範囲把握

## 📈 期待効果

1. **スキーマ一致** - MulmoScriptスキーマと翻訳構造が対応
2. **開発効率向上** - 実际のデータ構造と翻訳キーが一致で理解しやすい
3. **Beat管理の一元化** - Beat関連のすべてがbeat.* で管理
4. **検索性向上** - 単一ファイル内で全翻訳を検索可能
5. **保守性向上** - スキーマベースで論理的な構造
6. **拡張性確保** - 新しいBeat種別やパラメータの追加が容易

**総実装時間**: 約6時間