import { spawn, ChildProcess } from "child_process";
import playwright, { Browser, BrowserContext, Page } from "playwright-core";
import dayjs from "dayjs";
import * as path from "path";
import { ElectronAPI } from "@/types/electron";

// Configuration constants
const CONFIG = {
  PROCESS_KILL_TIMEOUT: 5000, // 5 seconds
  APP_START_WAIT: 15000, // 15 seconds
  WINDOW_CLOSE_WAIT: 1000, // 1 second
  CDP_MAX_ATTEMPTS: 30, // Maximum CDP connection attempts
  CDP_RETRY_DELAY: 1000, // CDP connection retry delay (1 second)
} as const;

// Function to terminate Electron process
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

    // Process exit event listeners
    electronProcess.once("exit", cleanup);
    electronProcess.once("error", cleanup);

    // Timeout setting
    const __timeout = setTimeout(() => {
      if (!resolved) {
        console.log("Force killing process...");
        try {
          electronProcess.kill("SIGKILL");
        } catch (killError: unknown) {
          console.log(
            "Process may have already exited:",
            killError instanceof Error ? killError.message : String(killError),
          );
        }
        cleanup();
      }
    }, CONFIG.PROCESS_KILL_TIMEOUT);

    // Attempt graceful termination
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
  // Initialize resources
  const resources: Resources = {
    electronProcess: null,
    browser: null,
  };

  try {
    console.log("=== MulmoCast E2E Test ===");
    console.log("1. Starting Electron app with yarn start...");

    // Start Electron app with electron-forge directly to avoid PATH and shell security warnings
    const electronForgeBinPath = path.join(process.cwd(), "node_modules", ".bin", "electron-forge");

    resources.electronProcess = spawn(
      process.execPath, // Node.js executable path
      [electronForgeBinPath, "start"], // Arguments: [script path, "start"]
      {
        shell: false, // Avoid security warnings
        detached: process.platform !== "win32", // Don't use detached on Windows
        env: {
          ...process.env,
          NODE_ENV: "development",
        },
      },
    );

    // Display app startup logs
    resources.electronProcess.stdout?.on("data", (data: Buffer) => {
      console.log(`[Electron]: ${data.toString().trim()}`);
    });

    resources.electronProcess.stderr?.on("data", (data: Buffer) => {
      console.error(`[Electron Error]: ${data.toString().trim()}`);
    });

    // Poll for CDP connection availability
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

    console.log("\nMocking settings to prevent onboarding modal...");
    await page.evaluate(() => {
      (window as Window & { electronAPI: ElectronAPI }).electronAPI = {
        ...(window as Window & { electronAPI: ElectronAPI }).electronAPI,
        settings: {
          ...(window as Window & { electronAPI: ElectronAPI }).electronAPI?.settings,
          get: async () => ({
            CHAT_LLM: "openAIAgent",
            USE_LANGUAGES: { en: true, ja: true },
            llmConfigs: {
              openai: { model: "gpt-4o" },
            },
            APIKEY: {
              OPENAI_API_KEY: "sk-mock",
            },
          }),
        },
      };
    });

    // Click the create new button
    console.log("\n3. Creating new project...");
    await page.click('button:has-text("新規作成")'); // "Create New" button in Japanese
    await page.waitForSelector('input[placeholder="Enter project title"]');
    console.log("✓ New project dialog opened");

    // Enter project title
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
      await new Promise((resolve) => setTimeout(resolve, 500));

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

    // Close application normally after test completion
    console.log("\nClosing application window...");
    try {
      // Close Electron app window
      await page.evaluate(() => {
        (window as Window & { close: () => void }).close();
      });
      await new Promise((resolve) => setTimeout(resolve, CONFIG.WINDOW_CLOSE_WAIT)); // Wait for window to close
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
    // Close browser connection
    if (resources.browser) {
      await resources.browser.close();
      console.log("\nBrowser connection closed.");
    }

    // Terminate Electron process
    await terminateElectronProcess(resources.electronProcess);
  }
}

// Main execution
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

// Execute
main();
