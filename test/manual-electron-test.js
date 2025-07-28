const playwright = require("playwright-core");

// 設定定数
const CONFIG = {
  CDP_RETRY_DELAY: 1000,      // CDP接続リトライの待機時間（1秒）
  CDP_MAX_ATTEMPTS: 30,       // CDP接続の最大試行回数
  TAB_SWITCH_DELAY: 500,      // タブ切り替え待機時間
  INITIAL_WAIT: 3000          // テスト開始前の待機時間（3秒）
};

// 日付と時刻をフォーマットする関数
function getDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

async function testCreateProject() {
  // リソースの初期化
  const resources = {
    browser: null
  };

  try {
    console.log("=== MulmoCast Playwright Test ===");
    console.log("1. Waiting for CDP to be available...");

    // CDP接続の可用性をポーリング
    const cdpUrl = process.env.CDP_URL || "http://localhost:9222/";
    let attempts = 0;
    
    while (attempts < CONFIG.CDP_MAX_ATTEMPTS) {
      try {
        resources.browser = await playwright.chromium.connectOverCDP(cdpUrl);
        console.log("✓ Connected successfully via CDP");
        break;
      } catch (error) {
        attempts++;
        if (attempts === CONFIG.CDP_MAX_ATTEMPTS) {
          throw new Error(`Failed to connect to CDP after ${CONFIG.CDP_MAX_ATTEMPTS} attempts: ${error.message}`);
        }
        if (attempts === 1) {
          console.log(`Attempting to connect to ${cdpUrl} (max ${CONFIG.CDP_MAX_ATTEMPTS} attempts)...`);
        }
        await new Promise((resolve) => setTimeout(resolve, CONFIG.CDP_RETRY_DELAY));
      }
    }

    // コンテキストとページを取得
    const contexts = resources.browser.contexts();
    if (contexts.length === 0) {
      throw new Error("No browser contexts found");
    }

    // 正しいページを見つける（DevToolsではなくアプリのページ）
    const appUrl = process.env.APP_URL || "localhost:5173";
    console.log(`Looking for application page with URL containing: ${appUrl}`);
    
    const findApplicationPage = () => {
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

    // ダッシュボードに移動（念のため）
    console.log("\n2. Navigating to dashboard...");
    await page.goto(`http://${appUrl}/#/`);
    await page.waitForLoadState("networkidle");
    console.log("✓ Dashboard loaded");

    // 新規作成ボタンをクリック
    console.log('\n3. Clicking "新規作成" button...');
    await page.click('button:has-text("新規作成")');
    await page.waitForSelector('input[placeholder="Enter project title"]');
    console.log("✓ New project dialog opened");

    // プロジェクトタイトルを入力（日付＋時刻）
    const projectTitle = getDateTimeString();
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
    const tabs = ["Text", "YAML", "JSON", "Media", "Style", "Ref"];

    for (const tab of tabs) {
      console.log(`   - Clicking "${tab}" tab...`);
      await page.click(`[role="tab"]:has-text("${tab}")`);

      // タブがアクティブになるまで少し待機
      await page.waitForTimeout(CONFIG.TAB_SWITCH_DELAY);

      // タブがアクティブになったことを確認
      const isSelected = await page.$eval(
        `[role="tab"]:has-text("${tab}")`,
        (el) => el.getAttribute("aria-selected") === "true",
      );

      if (isSelected) {
        console.log(`   ✓ "${tab}" tab is now active`);
      } else {
        console.log(`   ✗ Failed to activate "${tab}" tab`);
      }
    }

    console.log("\n=== Test completed successfully! ===");
    console.log(`Project "${projectTitle}" was created and all Script tabs were tested.`);
  } catch (error) {
    console.error("\n✗ Test failed:", error.message);
    throw error;
  } finally {
    // ブラウザ接続を閉じる
    if (resources.browser) {
      await resources.browser.close();
      console.log("\nBrowser connection closed.");
    }
  }
}

// メイン実行
async function main() {
  console.log("Starting test in 3 seconds...");
  console.log("Make sure the Electron app is running with: yarn start");
  console.log("Environment variables:");
  console.log(`  CDP_URL: ${process.env.CDP_URL || 'http://localhost:9222/ (default)'}`);
  console.log(`  APP_URL: ${process.env.APP_URL || 'localhost:5173 (default)'}\n`);

  await new Promise((resolve) => setTimeout(resolve, CONFIG.INITIAL_WAIT));
  
  try {
    await testCreateProject();
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
}

// 実行
main();