---
description: "Extract hardcoded English text from Vue components for internationalization"
args: 
  - name: "component_path"
    required: true
    type: "string"
    description: "Path to Vue component file (e.g., src/renderer/pages/project/components/script_editor.vue)"
---

# i18n Text Scan

Extract hardcoded English text from Vue components and categorize for internationalization.

## Usage
```
/i18n-scan <component_path>
```

## Example
```
/i18n-scan src/renderer/pages/project/components/script_editor.vue
```

## Task Instructions

You will analyze the specified Vue component file ({component_path}) and extract all hardcoded English text for internationalization.

### Output Format
```markdown
## Extracted Text from: {component-path}

### 1. Template Text
| Location | Text | Type | Suggested Key |
|----------|------|------|---------------|
| h1 | "Script Editor" | UI Label | project.editor.title |
| button | "Save Changes" | Action | project.editor.save |
| span.error | "Failed to save" | Error Message | project.editor.saveError |

### 2. Attributes
| Element | Attribute | Text | Suggested Key |
|---------|-----------|------|---------------|
| input | placeholder | "Enter script title..." | project.editor.titlePlaceholder |
| button | aria-label | "Close dialog" | common.actions.close |

### 3. Script Constants/Messages
| Variable/Usage | Text | Suggested Key |
|----------------|------|---------------|
| errorMessage | "Invalid format" | project.editor.validation.format |
| successMessage | "Saved successfully" | project.editor.messages.saveSuccess |

### 4. Common.ts Candidates
**固有名詞・技術用語（翻訳不要）**
- "MulmoCast"
- "JSON"
- "API"
- "URL"

### 5. Human Review Required
**以下のテキストは common.ts に入れるべきか判断してください：**
- [ ] "MulmoScript" - 製品固有の用語
- [ ] "GraphAI" - 技術スタック名
- [ ] "OpenAI" - サービス名
```

### Analysis Instructions

#### 1. Text Extraction Points
- **Template text**: `<h1>Title</h1>`, `<p>Description</p>`
- **Button labels**: `<button>Click Me</button>`
- **Form elements**: `placeholder`, `label` attributes
- **Accessibility**: `aria-label`, `title` attributes
- **Conditional text**: `v-if` や `v-show` で表示される文言
- **Script constants**: エラーメッセージ、成功メッセージ等

#### 2. Key Naming Convention
```
project.{componentName}.{category}.{specific}

Examples:
- project.editor.title
- project.editor.actions.save
- project.editor.messages.success
- project.editor.validation.required
```

#### 3. Common.ts Identification
以下は common.ts 候補：
- **製品名**: MulmoCast, MulmoScript
- **技術用語**: JSON, API, URL, HTML, CSS
- **サービス名**: OpenAI, Google Cloud, GitHub
- **ファイル形式**: PDF, MP4, WAV
- **一般的なUI用語**: OK, Cancel（但し、既存の翻訳があれば除外）

#### 4. Categorization
- **UI Labels**: タイトル、見出し、ナビゲーション
- **Actions**: ボタンのラベル、メニュー項目
- **Messages**: 成功・エラー・警告メッセージ
- **Form**: ラベル、プレースホルダー、バリデーション
- **Status**: 状態表示、進捗メッセージ

### Task Execution

1. **Read the component file completely**
2. **Scan template section** for all visible text
3. **Scan attributes** for text content (placeholder, aria-label, title)
4. **Scan script section** for hardcoded messages
5. **Categorize each text** by function and location
6. **Suggest appropriate translation keys** following project conventions
7. **Identify common.ts candidates** for human review

### Important Notes
- **Do not implement i18n yet** - this is extraction only
- **Focus on English text only** - ignore already translated content
- **Include context** - where in the component each text appears
- **Flag uncertainties** - mark items that need human judgment
- **Suggest key structure** - but don't implement language files

This tool prepares the groundwork for systematic internationalization by providing a complete inventory of text to be translated.