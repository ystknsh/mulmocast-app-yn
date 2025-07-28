import playwright, { Browser, BrowserContext, Page } from "playwright-core";
import dayjs from "dayjs";

// Configuration constants
const CONFIG = {
  CDP_RETRY_DELAY: 1000, // CDP connection retry delay (1 second)
  CDP_MAX_ATTEMPTS: 30, // Maximum CDP connection attempts
  TAB_SWITCH_DELAY: 500, // Tab switching delay
  INITIAL_WAIT: 3000, // Initial wait before test starts (3 seconds)
} as const;

interface Resources {
  browser: Browser | null;
}

async function testCreateProject(): Promise<void> {
  // Initialize resources
  const resources: Resources = {
    browser: null,
  };

  try {
    console.log("=== MulmoCast Playwright Test ===");
    console.log("1. Waiting for CDP to be available...");

    // Poll for CDP connection availability
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
          console.log(`Attempting to connect to ${cdpUrl} (max ${CONFIG.CDP_MAX_ATTEMPTS} attempts)...`);
        }
        await new Promise((resolve) => setTimeout(resolve, CONFIG.CDP_RETRY_DELAY));
      }
    }

    // Get contexts and page
    const contexts: BrowserContext[] = resources.browser!.contexts();
    if (contexts.length === 0) {
      throw new Error("No browser contexts found");
    }

    // Find the correct page (app page, not DevTools)
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

    // Navigate to dashboard (just to be sure)
    console.log("\n2. Navigating to dashboard...");
    await page.goto(`http://${appUrl}/#/`);
    await page.waitForLoadState("networkidle");
    console.log("✓ Dashboard loaded");

    // Click the create new button
    console.log('\n3. Clicking "Create New" button...');
    await page.click('button:has-text("新規作成")');
    await page.waitForSelector('input[placeholder="Enter project title"]');
    console.log("✓ New project dialog opened");

    // Enter project title (date + time)
    const projectTitle = dayjs().format("YYYYMMDD_HHmmss");
    console.log(`\n4. Entering project title: ${projectTitle}`);
    await page.fill('input[placeholder="Enter project title"]', projectTitle);
    console.log("✓ Project title entered");

    // Click the Create button
    console.log('\n5. Clicking "Create" button...');
    await page.click('button:has-text("Create")');

    // Wait for project page to load
    await page.waitForSelector(`h1:has-text("${projectTitle}")`);
    console.log("✓ Project created and page loaded");

    // Test Script tabs
    console.log("\n6. Testing Script tabs...");
    const tabs = ["Text", "YAML", "JSON", "Media", "Style", "Ref"] as const;

    for (const tab of tabs) {
      console.log(`   - Clicking "${tab}" tab...`);
      await page.click(`[role="tab"]:has-text("${tab}")`);

      // Wait a bit for tab to become active
      await new Promise((resolve) => setTimeout(resolve, CONFIG.TAB_SWITCH_DELAY));

      // Verify tab is active
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
  } catch (error: unknown) {
    console.error("\n✗ Test failed:", error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    // Close browser connection
    if (resources.browser) {
      await resources.browser.close();
      console.log("\nBrowser connection closed.");
    }
  }
}

// Main execution
async function main(): Promise<void> {
  console.log("Starting test in 3 seconds...");
  console.log("Make sure the Electron app is running with: yarn start");
  console.log("Environment variables:");
  console.log(`  CDP_URL: ${process.env.CDP_URL || "http://localhost:9222/ (default)"}`);
  console.log(`  APP_URL: ${process.env.APP_URL || "localhost:5173 (default)"}\n`);

  await new Promise((resolve) => setTimeout(resolve, CONFIG.INITIAL_WAIT));

  try {
    await testCreateProject();
    process.exit(0);
  } catch (error: unknown) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
}

// Execute
main();
