## アプリケーション ダウンロード方法
Mac: https://github.com/receptron/mulmocast-app/actions/workflows/ci-mac.yml

github actions > Build, Notarize, and Release for macOS 
![alt text](<images/CleanShot 2025-09-07 at 02.31.20.png>)


最新のworkfloww をクリックして、Artifacts > macOS-release-files でダウンロードする
![alt text](<images/CleanShot 2025-09-07 at 02.32.29.png>)

ダウンロード後は解凍する。アプリ名は `MulmoCast.app`  です。

アプリケーションへドラッグ & ドロップする。
![alt text](<images/CleanShot 2025-09-07 at 02.36.42.png>)

参考: win https://github.com/receptron/mulmocast-app/actions/workflows/ci-ms.yml

## アプリケーション 更新方法
まだアプリケーション側へアプリの更新通知機能はないため、定期的にダウンロード方法と同様のサイトを確認してください。

ダウンロード方法と同様にダウンロードし、解凍します。
その後、同様にアプリケーションへドラッグ & ドロップします。

“MulmoCast.app”という名前の古い項目がすでにこの場所にあります。現在移動中の新しい項目で置き換えますか? と聞かれるので、置き換えるを選択する。

## 使い方
### 各種設定
アプリを起動したら、各種設定を行います。
1. 表示言語を設定します
2. API Keyを設定します
   1. どのAPIで何ができるかはラベルで表示しています
3. 言語設定
    1. スクリプトで使う言語
    2. 翻訳先の言語
4. LLM 設定
    1. AI Chat に利用する LLM を設定します。
        1. OpenAI
        2. Ollama
        3. Gemini
        4. Anthropic
        5. Groq

### ダッシュボード
1. 新規作成ボタンを押すとプロジェクトページへ遷移します。
    ![alt text](<images/CleanShot 2025-09-07 at 02.43.08@2x.png>)