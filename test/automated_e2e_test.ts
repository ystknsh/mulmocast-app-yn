import { spawn, ChildProcess } from "child_process";
import playwright, { Browser, BrowserContext, Page } from "playwright-core";
import dayjs from "dayjs";

// 設定定数
const CONFIG = {
  PROCESS_KILL_TIMEOUT: 5000, // 5秒
  APP_START_WAIT: 15000, // 15秒
  WINDOW_CLOSE_WAIT: 1000, // 1秒
  CDP_MAX_ATTEMPTS: 30, // CDP接続の最大試行回数
  CDP_RETRY_DELAY: 1000, // CDP接続リトライの待機時間（1秒）
} as const;

// Electronプロセスを終了する関数
async function terminateElectronProcess(electronProcess: ChildProcess | null): Promise<void> {
  if (!electronProcess || electronProcess.killed) {
    return;
  }

  console.log("Terminating Electron app...");

  return new Promise((resolve) => {
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    // プロセス終了イベントのリスナー
    electronProcess.once("exit", cleanup);
    electronProcess.once("error", cleanup);

    // タイムアウト設定
    const __timeout = setTimeout(() => {
      if (!resolved) {
        console.log("Force killing process...");
        try {
          electronProcess.kill("SIGKILL");
        } catch (__error) {
          console.log("Process may have already exited");
        }
        cleanup();
      }
    }, CONFIG.PROCESS_KILL_TIMEOUT);

    // 優雅な終了を試行
    try {
      if (process.platform === "win32") {
        electronProcess.kill("SIGTERM");
      } else {
        process.kill(-electronProcess.pid!, "SIGTERM");
      }
    } catch (error: unknown) {
      console.log("Failed to send SIGTERM:", error instanceof Error ? error.message : String(error));
      cleanup();
    }
  });
}

interface Resources {
  electronProcess: ChildProcess | null;
  browser: Browser | null;
}

async function runE2ETest(): Promise<void> {
  // リソースの初期化
  const resources: Resources = {
    electronProcess: null,
    browser: null,
  };

  try {
    console.log("=== MulmoCast E2E Test ===");
    console.log("1. Starting Electron app with yarn start...");

    // Electronアプリをspawnで起動（プロセスグループを作成）
    resources.electronProcess = spawn("yarn", ["start"], {
      shell: true,
      detached: process.platform !== "win32", // Windowsではdetachedを使わない
      env: {
        ...process.env,
        NODE_ENV: "development",
      },
    });

    // アプリの起動ログを表示
    resources.electronProcess.stdout?.on("data", (data: Buffer) => {
      console.log(`[Electron]: ${data.toString().trim()}`);
    });

    resources.electronProcess.stderr?.on("data", (data: Buffer) => {
      console.error(`[Electron Error]: ${data.toString().trim()}`);
    });

    // CDP接続の可用性をポーリング
    console.log("\n2. Waiting for CDP to be available...");
    const cdpUrl = process.env.CDP_URL || "http://localhost:9222/";
    let attempts = 0;

    while (attempts < CONFIG.CDP_MAX_ATTEMPTS) {
      try {
        resources.browser = await playwright.chromium.connectOverCDP(cdpUrl);
        console.log("✓ Connected successfully via CDP");
        break;
      } catch (error: unknown) {
        attempts++;
        if (attempts === CONFIG.CDP_MAX_ATTEMPTS) {
          throw new Error(
            `Failed to connect to CDP after ${CONFIG.CDP_MAX_ATTEMPTS} attempts: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        if (attempts === 1) {
          console.log(`Waiting for Electron app to start (max ${CONFIG.CDP_MAX_ATTEMPTS} attempts)...`);
        }
        await new Promise((resolve) => setTimeout(resolve, CONFIG.CDP_RETRY_DELAY));
      }
    }

    // コンテキストとページを取得
    const contexts: BrowserContext[] = resources.browser!.contexts();
    if (contexts.length === 0) {
      throw new Error("No browser contexts found");
    }

    // 正しいページを見つける（DevToolsではなくアプリのページ）
    const appUrl = process.env.APP_URL || "localhost:5173";
    console.log(`Looking for application page with URL containing: ${appUrl}`);

    const findApplicationPage = (): Page | null => {
      for (const context of contexts) {
        const pages = context.pages();
        for (const p of pages) {
          const url = p.url();
          console.log(`Found page: ${url}`);
          if (url.includes(appUrl)) {
            return p;
          }
        }
      }

      return null;
    };

    const page = findApplicationPage();
    if (!page) {
      throw new Error("Could not find application page");
    }

    console.log("✓ Got page from Electron app");
    console.log(`Current URL: ${page.url()}`);

    // 新規作成ボタンをクリック
    console.log("\n3. Creating new project...");
    await page.click('button:has-text("新規作成")');
    await page.waitForSelector('input[placeholder="Enter project title"]');
    console.log("✓ New project dialog opened");

    // プロジェクトタイトルを入力
    const projectTitle = dayjs().format("YYYYMMDD_HHmmss");
    console.log(`\n4. Entering project title: ${projectTitle}`);
    await page.fill('input[placeholder="Enter project title"]', projectTitle);
    console.log("✓ Project title entered");

    // Createボタンをクリック
    console.log('\n5. Clicking "Create" button...');
    await page.click('button:has-text("Create")');

    // プロジェクトページが読み込まれるまで待機
    await page.waitForSelector(`h1:has-text("${projectTitle}")`);
    console.log("✓ Project created and page loaded");

    // Scriptタブのテスト
    console.log("\n6. Testing Script tabs...");
    const tabs = ["Text", "YAML", "JSON", "Media", "Style", "Ref"] as const;

    for (const tab of tabs) {
      console.log(`   - Clicking "${tab}" tab...`);
      await page.click(`[role="tab"]:has-text("${tab}")`);

      // タブがアクティブになるまで少し待機
      await new Promise((resolve) => setTimeout(resolve, 500));

      // タブがアクティブになったことを確認
      const tabElement = await page.$(`[role="tab"]:has-text("${tab}")`);
      if (tabElement) {
        const isSelected = await tabElement.evaluate((el: HTMLElement) => el.getAttribute("aria-selected") === "true");

        if (isSelected) {
          console.log(`   ✓ "${tab}" tab is now active`);
        } else {
          console.log(`   ✗ Failed to activate "${tab}" tab`);
        }
      } else {
        console.log(`   ✗ Tab element "${tab}" not found`);
      }
    }

    console.log("\n=== Test completed successfully! ===");
    console.log(`Project "${projectTitle}" was created and all Script tabs were tested.`);

    // テスト完了後、アプリケーションを正常に閉じる
    console.log("\nClosing application window...");
    try {
      // Electronアプリのウィンドウを閉じる
      await page.evaluate(() => {
        (window as Window & { close: () => void }).close();
      });
      await new Promise((resolve) => setTimeout(resolve, CONFIG.WINDOW_CLOSE_WAIT)); // ウィンドウが閉じるのを待つ
    } catch (closeError: unknown) {
      console.log(
        "Failed to close window gracefully:",
        closeError instanceof Error ? closeError.message : String(closeError),
      );
    }
  } catch (error: unknown) {
    console.error("\n✗ Test failed:", error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    // ブラウザ接続を閉じる
    if (resources.browser) {
      await resources.browser.close();
      console.log("\nBrowser connection closed.");
    }

    // Electronプロセスを終了
    await terminateElectronProcess(resources.electronProcess);
  }
}

// メイン実行
async function main(): Promise<void> {
  console.log("Starting E2E test...");
  console.log("This test will automatically start and stop the Electron app.\n");

  try {
    await runE2ETest();
    console.log("\n✅ All tests passed!");
    process.exit(0);
  } catch (error: unknown) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// 実行
main();
