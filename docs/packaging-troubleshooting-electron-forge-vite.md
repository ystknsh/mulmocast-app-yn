# 追加レポート（今回の修正と運用方針）

## サマリ
- パッケージ起動時の `Cannot find module 'puppeteer'` および間接依存（例: `semver`）解決失敗を、以下の最小構成で解消。
  - Forge で `puppeteer/.local-chromium/**` を asar 外に展開（実行可能化）。
  - main バンドルの external（`puppeteer`, `puppeteer-core`, `jsdom`）を `.vite/build/node_modules` に再帰コピーして app.asar 内へ同梱。
  - `puppeteer` をトップレベルの prod 依存に追加し、パッケージ前に Chromium を導入。
  - CI では Puppeteer のキャッシュを使い Chromium 導入を安定化・高速化。
- スプラッシュ画像（`images/mulmocast_credit.png`）をビルド時に `.vite/build/images/` へコピーし、本番でも表示されるように修正。
- 開発起動（`yarn start`）は、必要時のみネイティブ拡張を再ビルドする運用に変更し、通常は従来の速度を維持。

## 変更点（事実ベース）
- `forge.config.ts`
  - `packagerConfig.asar` をオブジェクト化し、`"**/node_modules/puppeteer/.local-chromium/**"` を unpack 対象に設定。
    - forge.config.ts:12

- `package.json`
  - 依存に `"puppeteer": "^24.17.0"` を追加（prod）。
    - package.json:76
- スクリプトを以下に更新：
  - `start`: `npx electron-rebuild && NODE_ENV=development electron-forge start`（非強制リビルド）
  - `rebuild:native`: `npx electron-rebuild -f`（必要時のみフルリビルド用）
  - `package`: `npx puppeteer browsers install chrome && electron-forge package`
  - `make:local`: `.env` 読み込み後に `npx puppeteer browsers install chrome && electron-forge make`
  - `make:ci`: `npx puppeteer browsers install chrome && electron-forge make`

### スクリプト更新の意図（説明）

- 事前準備: Puppeteer で Chromium を先にインストールしてから Forge を実行する運用に変更。`npx puppeteer browsers install chrome` が `.local-chromium` を用意し、パッケージ時に asar.unpacked へ展開され実行可能になります（キャッシュがあれば短時間で完了）。
- 開発起動: `electron-rebuild` を先に実行してネイティブ拡張のABIを整合（非強制）。依存更新直後のみ時間がかかり、以後は高速に起動します。
- 手動フルリビルド: 必要時だけ `rebuild:native`（強制）を実行できるよう分離。

スクリプトの意図

- start: `npx electron-rebuild && NODE_ENV=development electron-forge start`
  - 起動前に非強制のネイティブ再ビルドで整合を確保（通常は高速）。
- rebuild:native: `npx electron-rebuild -f`
  - 強制フル再ビルドが必要なときのみ手動で実行。
- package: `npx puppeteer browsers install chrome && electron-forge package`
  - 先に Chromium を導入してからパッケージ化（`.local-chromium` を同梱・展開）。
- make:local: `.env` 読み込み後に `npx puppeteer browsers install chrome && electron-forge make`
  - ローカル署名/公証向け。環境変数を読み込んだ上で Chromium を導入→ビルド。
- make:ci: `npx puppeteer browsers install chrome && electron-forge make`
  - CI でも同様に先に Chromium を導入してからビルド（キャッシュ併用で高速化）。

- `vite.main.config.ts`
  - build.rollupOptions.external に `electron`, `jsdom`, `puppeteer`, `puppeteer-core` を指定（main の外部化を維持）。
  - ポストビルドで以下をコピー：
    - `ffmpeg/ffprobe` を `.vite/build/ffmpeg` へ。
    - `splash.html` を `.vite/build/` へ、`images/mulmocast_credit.png` を `.vite/build/images/` へ。
    - external 指定したパッケージ（`puppeteer`, `puppeteer-core`, `jsdom`）とその依存・任意依存を再帰的に `.vite/build/node_modules/` へコピー。

- CI（GitHub Actions）
  - `.github/workflows/ci-mac.yml` / `.github/workflows/ci-ms.yml` に Puppeteer キャッシュ復元（`PUPPETEER_CACHE_DIR`）と `npx puppeteer browsers install chrome` を追加。

## 補足（試行錯誤の記録）
- 一時的に `vite build --config vite.main.config.ts` 等で main/preload を手動ビルドしたところ、Node 組み込みモジュールの外部化がブラウザ互換扱いになり、`url.fileURLToPath` などでビルド失敗。現在は Forge の VitePlugin にビルドを委譲する構成に戻して解消済み。

## 今後の注意点・運用指針
- external の基本運用
  - main（Node/Electron 側）で `puppeteer`/`puppeteer-core`/`jsdom` を external 指定する場合は、実行時解決先を app.asar 内に用意する必要あり。
    - 本プロジェクトでは、ポストビルドで `.vite/build/node_modules/**` に再帰コピーして app.asar に含める。
  - `puppeteer` を使うなら `.local-chromium/**` は asar 外へ（`forge.config.ts` の `asar.unpack`）。

- Chromium 導入とサイズ
  - パッケージ前に `npx puppeteer browsers install chrome` を実行して `.local-chromium` を生成（ローカル・CI ともに必要）。
  - CI は `PUPPETEER_CACHE_DIR` を設定して `actions/cache` で高速化。

- renderer での禁止事項
  - `puppeteer`/`jsdom` を renderer から import しない（ブラウザターゲットで解決不可・サイズ肥大）。IPC 経由で main に委譲。

- 起動速度とネイティブ拡張
  - 開発時の `start` は非強制の `electron-rebuild` にし、依存更新直後のみ時間がかかる運用にする。
  - 毎回のフルリビルドが必要な場合のみ `yarn rebuild:native` を使用。
  - さらなる高速化が必要なら、`bufferutil`/`utf-8-validate`（任意依存）を外す選択肢も検討。

- 画像や追加アセット
  - `splash.html` で相対参照する画像は、ビルド時に `.vite/build/` 配下へコピーする（本件は `images/mulmocast_credit.png` を `.vite/build/images/` へ）。

- Forge と Vite の責務分担
  - Forge の VitePlugin が main/preload/renderer のビルドと `.vite/build` 生成を担当する前提を維持。
  - main/preload の「手動 Vite ビルド」はトラブルの元になりやすいため避ける。

# Vite + Vue + Electron での external 指定と puppeteer/puppeteer-core/jsdom 取り扱いまとめ

## 冒頭ポイント（先に結論）
- **使う場所の原則**
  - `puppeteer` / `puppeteer-core` / `jsdom` は renderer で import しない。使うなら Electron の main（または Node 側ロジック）限定。
- **external の基本**
  - main/preload のバンドルでは external 指定（例: `["electron", "puppeteer", "puppeteer-core", "jsdom", ...Node builtins]`）。
  - renderer は external を使わない（通常のフロント開発）。
- **配布時の同梱と asar**
  - external にした依存は配布物に `node_modules` ごと含める。
  - puppeteer を同梱する場合は `.local-chromium` を `asarUnpack` に指定。
  - puppeteer-core の場合は `executablePath` を必ず指定（Chrome/Chromium 検出ロジックを用意）。
- **IPC 経由で操作**
  - renderer → preload（`contextBridge`）→ main（`ipcMain`）でジョブ委譲。renderer から puppeteer/jsdom に触れない。
- **ESM/CJS の統一**
  - main/preload の出力 format を統一（まずは CJS が安定）。ESM の場合は `import.meta.url` でパス解決。

---

## 各モジュールの説明

### 1) puppeteer
- **特徴**
  - Chromium 同梱。確実だが配布が重い。
- **external**
  - main/preload で external にする。renderer では import しない。
- **配布**
  - `node_modules/puppeteer` を同梱。
  - asar 使用時は `asarUnpack` に `node_modules/puppeteer/.local-chromium/**` を追加。
- **典型エラーと対策**
  - Chromium 実行不可 → `asarUnpack` 漏れ。
  - `Cannot find module 'puppeteer'` → `node_modules` 未同梱。

### 2) puppeteer-core
- **特徴**
  - Chromium 非同梱の軽量版。外部の Chrome/Chromium を利用。
- **external**
  - main/preload で external。renderer では import しない。
- **実行**
  - `executablePath` を必ず指定。OS 別パス解決 or `@puppeteer/browsers` を利用。
  - パスは asar 内を指さない（asar 外の実ファイルに）。
- **典型エラーと対策**
  - `No executablePath` / `ENOENT` → パス未指定・不正、または asar 内を指している。

### 3) jsdom
- **特徴**
  - Node 上で DOM をエミュレート。テスト/サーバーサイド処理向け。
- **external**
  - main で external。renderer に import すると `fs`/`path` 解決で失敗。
- **実行場所**
  - main（または Node ワーカー）。結果を IPC で renderer へ返却。

---

## なぜ yarn run start（dev）は動くのか
- dev は未バンドルのままローカルの `node_modules` を Node/Electron が直接解決するため。
- build はバンドラの最適化・format 変換・external/asar の影響を受け、配置や解決が変わるため差分で落ちる。

---

## external 指定とは何か
- **定義**
  - external 指定＝その依存をバンドルに含めず、実行時に外部（配布物内の `node_modules` 等）から解決させること。
- **意味**
  - 「ビルドしない」というより「束ねない」。バンドル成果物に中身は入れない。
  - 実行時は `require`/`import` が通常の Node 解決規則で `node_modules` から読み込まれる。
- **よく external にするもの**
  - `electron`、`puppeteer/puppeteer-core`、`jsdom`、Node builtins（`fs`, `path`, `crypto`, ...）。
- **注意点**
  - external にしたら配布物へ `node_modules` を同梱しないと `Cannot find module`。
  - puppeteer の Chromium バイナリは asar 内で実行不可 → `asarUnpack` が必要。
  - renderer に import しても external は関係ない（ブラウザターゲットで解決不可のためそもそも NG）。

---

## 構成の具体メモ（Vite + Vue + Electron 前提）
- **renderer（Vite）**
  - **役割**: フロントのみ。puppeteer/jsdom は import しない。
  - **Vite build**: `target` を Electron の Chromium に合わせると安定。`outDir: dist/renderer`。
- **main（esbuild/tsup 推奨）**
  - `platform: node`、`format: cjs`（推奨）。`bundle: true`。
  - `external: ["electron", "puppeteer", "puppeteer-core", "jsdom", ...builtinModules]`。
- **preload（esbuild/tsup）**
  - `external: ["electron"]`。`contextBridge` で最小 API を expose。
- **配布（electron-builder 例）**
  - `files` に `dist/**` と `node_modules/**` を含める。
  - **puppeteer 使用時**: `asarUnpack` に `node_modules/puppeteer/.local-chromium/**`。
  - **puppeteer-core 使用時**: Chrome/Chromium を別途用意し、asar 外のパスを `executablePath` に指定。

---

## トラブル別チェックリスト
- **`Cannot find module 'puppeteer'`**
  - external にした依存の `node_modules` が配布物に含まれていない。
  - **対策**: `files` に `node_modules/**` を追加。まず `asar:false` で再現性を切り分け。
- **`spawn ENOENT` / Chromium が起動できない**
  - puppeteer の `.local-chromium` が asar 内。
  - **対策**: `asarUnpack` に `.local-chromium/**` を追加。puppeteer-core は asar 外の `executablePath` を指定。
- **renderer ビルドエラー（`fs` がない 等）**
  - renderer に puppeteer/jsdom を import している。
  - **対策**: main 側へ移し、IPC 経由にする。
- **ESM/CJS 不整合（`ERR_REQUIRE_ESM` 等）**
  - main の format と依存のモジュールタイプが不一致。
  - **対策**: main を CJS で統一するか、ESM なら dynamic `import()` を使う。
- **dev は動くが prod で落ちる**
  - 実ファイル配置/asar/外部化の差分。
  - **対策**: `asar:false` → `true` の順で段階的に確認。external を一旦外して原因箇所を特定。

---

## IPC ひな形（概念）
- **preload**
  ```javascript
  contextBridge.exposeInMainWorld("api", { 
    runJob: (args) => ipcRenderer.invoke("pptr:run", args) 
  })
  ```
- **main**
  ```javascript
  ipcMain.handle("pptr:run", async (_e, args) => {
    // puppeteer / puppeteer-core / jsdom はここで使用
    return { ok: true }
  })
  ```

設定ファイル（`vite.config`、main/preload ビルド設定、`electron-builder` 設定）を共有いただければ、あなたの構成に合わせて最小修正の具体例を出します。

---

## 今回の事象の具体分析（mulmocast-app）

- 発生エラー（配布アプリ起動時）
  - A JavaScript error occurred in the main process / Uncaught Exception: Error: Cannot find module 'puppeteer'
  - Require stack に `app.asar/.vite/build/main-*.js` → `app.asar/.vite/build/main.js` が出現（main バンドル内で `require('puppeteer')` している）。

- リポジトリ確認ポイント
  - `vite.main.config.ts:10` にて external: `["jsdom", "puppeteer", "puppeteer-core"]`
    - vite.main.config.ts:10
  - main 側での直接 import
    - `src/main/mulmo/handler_graphai.ts:1` で `import puppeteer from "puppeteer";`
      - src/main/mulmo/handler_graphai.ts:1
    - 上記ファイルは `src/main/mulmo/handler.ts` から import され、さらに main プロセスに取り込まれる（未使用でも ESM import によりロード時点で解決が走る）。
  - Forge 設定の Fuses
    - `forge.config.ts:67` で `[FuseV1Options.OnlyLoadAppFromAsar]: true`
      - forge.config.ts:67
    - これにより Electron は app.asar 以外からのコードロードを拒否する。
  - 依存関係
    - ルートの `package.json` には `puppeteer` 未記載だが、`mulmocast` が prod 依存として `puppeteer` を要求
      - `node_modules/mulmocast/package.json` の dependencies に `puppeteer` がある

- 状況仮説（もっとも可能性が高い）
  1) main バンドルは `puppeteer` を external 指定 → バンドルに含まず、実行時に `require('puppeteer')` へ。
  2) Fuse が OnlyLoadAppFromAsar を有効化 → app.asar 外（例: `Resources/app/node_modules`）からの解決が禁止。
  3) パッケージ時の配置で `app.asar` 内に `node_modules/puppeteer` が入っていない（または asar 内レイアウトと Node の解決規則が噛み合っていない）ため、`require('puppeteer')` が失敗。

  補足: `app.asar` が ~100MB と比較的大きいことから、依存の多くは asar 内に含まれている可能性が高いが、`puppeteer` 本体や `.local-chromium` の扱いは asar 設定に強く依存するため、モジュールルートの探索でこぼれていると考えられる。

---

## 解決手順案（優先度順）

1) まず事象の切り分け（安全な確認）
   - Forge のパッケージ設定を一時的に変更して挙動を確認（最終的な修正ではなく切り分け目的）。
   - 具体的な確認順序:
     - a. `asar: false` でパッケージ → モジュール解決が通るか確認（asar 影響切り分け）。
     - b. Fuse の `[OnlyLoadAppFromAsar]` を一時的に `false` → `Resources/app/node_modules` 側から解決できるか確認。
     - c. `vite.main.config.ts` の external から `puppeteer` を一旦外す → バンドラに含められるか（実運用は非推奨。体感用）。

2) 本修正パスA（アプリ内で Puppeteer を使い続ける場合）
   - 目的: `require('puppeteer')` がパッケージ後に常に解決でき、Chromium 実行も行える状態にする。
   - 推奨設定:
     - a. ルート `package.json` に `puppeteer` を明示的に `dependencies` 追加（トップレベルで確実に含める）。
     - b. `vite.main.config.ts` の external に `"puppeteer"` を残す（main でバンドルしない）。
     - c. Forge/Electron Packager の asar 設定で `.local-chromium/**` を unpack 対象に指定：
       - 例: `packagerConfig.asar = { unpack: "**/node_modules/puppeteer/.local-chromium/**" }`
       - もしくは `asarUnpack` 相当の設定を利用。
     - d. Fuses の `[OnlyLoadAppFromAsar]` は、上記 unpack を行うなら `true` のままでも可（コードは asar 内、Chromium バイナリは asar.unpacked）。
   - 留意点:
     - アプリサイズが大きくなる（Chromium 同梱）。
     - macOS notarization 時間が伸びる可能性。

3) 本修正パスB（`puppeteer-core` に切替）
   - 目的: Chromium を同梱せず軽量化。ただし実行 Chrome/Chromium を別に用意し、`executablePath` を指定する必要。
   - 推奨設定:
     - a. ルート `package.json` に `puppeteer-core` を prod 依存で追加、main では `dynamic import()` で必要時に読み込み。
     - b. 実行環境ごとに `executablePath` 解決ロジックを用意（システム Chrome/Chromium のパス）。
     - c. Fuse `[OnlyLoadAppFromAsar]` は `true` 維持で問題なし（外部実行はブラウザのバイナリのみ）。
   - 留意点:
     - 利用端末に Chrome/Chromium が必要、または別途バンドルが必要。

4) 本修正パスC（機能の遅延ロード・条件分岐）
   - 目的: アプリ起動時に `puppeteer` を即時 import しない（未使用時に落ちないようにする）。
   - 修正方針:
     - a. `src/main/mulmo/handler_graphai.ts` の `import puppeteer from 'puppeteer'` を動的 import に変更し、実行パスでのみ読み込む。
     - b. ただし「今回の依頼ではソース改変NG」のため、方針としての提案のみ。最終的にはこの変更がより安全。

---

## 推奨アクション（最小リスク順）

- ステップ1（切り分け）
  - a. `asar:false` で `yarn run package` → 事象が解消するか確認。
  - b. 変化がある場合、asar の unpack 設定および Fuse 設定の見直しに進む。

- ステップ2（実運用に向けた設定）
  - Aパス（Puppeteer継続）の場合:
    - ルートに `puppeteer` を prod 追加、`asar` の `unpack` に `.local-chromium/**` を指定。
    - `vite.main.config.ts:10` の external はそのまま。
    - Forge で再パッケージ、起動確認。
  - Bパス（puppeteer-core）に切替の場合:
    - ルートに `puppeteer-core` を prod 追加、main 側で `executablePath` を指定する実装に変更（後続PRで対応）。

- ステップ3（コード健全化）
  - 将来的に `graphaiPuppeteerAgent` は動的 import に改修し、未使用環境でのクラッシュを防止。

---

## 追加の確認手順（出力物検査）

- `out/*/MulmoCast.app/Contents/Resources/app.asar` の中に `node_modules/puppeteer/` が存在するかを確認。
  - 例: `asar extract app.asar tmp && ls tmp/node_modules/puppeteer`
- `app.asar.unpacked`（存在すれば）配下に `.local-chromium/**` が展開されているか確認。
- `ELECTRON_ENABLE_LOGGING=1` を付与して起動し、require 解決のログを確認。

---

## 結論（今回のエラーの主因）

- main バンドルが `puppeteer` を external 指定している一方、Fuse で `OnlyLoadAppFromAsar` を有効化しているため、`puppeteer` の実体が app.asar 内で Node の解決規則に沿った場所に存在しない限り起動時に解決できず、`Cannot find module 'puppeteer'` が発生。
- 解決には以下のいずれかが必要:
  - a. `puppeteer` を確実に配布物へ含め（トップレベル prod 依存化）、Chromium バイナリは asar unpack。
  - b. `puppeteer-core` 化＋`executablePath` 指定で軽量化（動的 import 推奨）。
  - c. 機能の遅延ロードで未使用時クラッシュを防ぐ（ソース変更が必要）。

この方針であれば、現在の構成（Vite + Electron Forge + Fuses）でも再現性高く安定動作に持っていけます。最終的な方向性（A/B/Cいずれか）をご指定いただければ、具体的な変更diff案を提示します（今回はソース改変NGのため記載のみ）。
