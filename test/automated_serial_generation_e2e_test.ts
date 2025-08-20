import { spawn, ChildProcess } from "child_process";
import playwright, { Browser, Page } from "playwright-core";
import dayjs from "dayjs";
import * as fs from "fs/promises";
import * as path from "path";
import type * as monaco from "monaco-editor";
import { sleep } from "graphai";

// Configuration constants
const CONFIG = {
  PROCESS_KILL_TIMEOUT_MS: 5000, // 5 seconds
  APP_START_WAIT_MS: 20000, // 20 seconds for CI environment
  CDP_RETRY_DELAY_MS: 1000, // CDP connection retry delay (1 second)
  CDP_MAX_ATTEMPTS: 50, // Maximum CDP connection attempts (longer for CI)
  TAB_SWITCH_DELAY_MS: 500, // Tab switching delay
  INITIAL_WAIT_MS: 3000, // Initial wait before test starts (3 seconds)
  GENERATION_TIMEOUT_MS: 600000, // 10 minutes for generation (longer for CI)
  BUTTON_TIMEOUT_MS: 15000, // 15 seconds to wait for buttons (play, generate, etc.)
  VITE_SERVER_WAIT_MAX_MS: 60000, // 60 seconds to wait for Vite dev server
  VITE_SERVER_CHECK_INTERVAL_MS: 2000, // Check every 2 seconds
  PLAY_WAIT_MS: 3000, // 3 seconds to wait during playback for serial test
  MONACO_EDITOR_TIMEOUT_MS: 15000, // Monaco editor load timeout
  EDITOR_STABILIZATION_DELAY_MS: 1000, // Wait for editor to stabilize
  DELETE_BUTTON_TIMEOUT_MS: 3000, // Timeout for delete button
  GENERATION_CLICK_TIMEOUT_MS: 5000, // Timeout for generation button click
  GENERATION_START_DELAY_MS: 3000, // Wait after generation starts
  PAGE_EVALUATION_DELAY_MS: 1000, // Wait between page evaluations
  POLLING_INTERVAL_MS: 2000, // General polling interval
  APP_STABILIZATION_DELAY_MS: 5000, // Wait for app to stabilize
  WINDOW_CLOSE_DELAY_MS: 1000, // Wait for window to close
} as const;

// Helper function for logging with step increment
function logStep(stepRef: { value: number }, message: string): void {
  stepRef.value = stepRef.value + 1;
  console.log(`\n${stepRef.value}. ${message}`);
}

// Test JSON files to process
const TEST_JSON_FILES = [
  "test_no_audio.json",
  "test_no_audio_with_credit.json",
  "test_transition_no_audio.json",
  "test_slideout_left_no_audio.json",
];

// Current test file being processed
let currentTestFile = "";

// Function to read JSON from local node_modules
async function readLocalJSON(filename: string): Promise<string> {
  console.log(`Reading JSON from local file: ${filename}`);

  try {
    // Construct path to the JSON file in node_modules
    const jsonPath = path.join(__dirname, "..", "node_modules", "mulmocast", "scripts", "test", filename);
    console.log(`Full path: ${jsonPath}`);

    // Read the file content
    const jsonContent = await fs.readFile(jsonPath, "utf-8");

    console.log("✓ Successfully read JSON from local file");
    console.log(`JSON preview: ${jsonContent.substring(0, 100)}...`);

    return jsonContent;
  } catch (error) {
    console.error("Failed to read JSON from local file:", error);
    throw error;
  }
}

// Function to terminate Electron process
async function terminateElectronProcess(electronProcess: ChildProcess | null): Promise<void> {
  if (!electronProcess || electronProcess.killed) {
    return;
  }

  console.log("Terminating Electron app...");

  return new Promise((resolve) => {
    let resolved = false;

    // Timeout setting
    const timeoutId = setTimeout(() => {
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
    }, CONFIG.PROCESS_KILL_TIMEOUT_MS);

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId); // Clear timeout to prevent leaks
        resolve();
      }
    };

    // Process exit event listeners
    electronProcess.once("exit", cleanup);
    electronProcess.once("error", cleanup);

    // Attempt graceful termination
    try {
      if (process.platform === "win32") {
        electronProcess.kill("SIGTERM");
      } else {
        process.kill(-electronProcess.pid!, "SIGTERM");
      }
    } catch (termError: unknown) {
      console.log("Failed to send SIGTERM:", termError instanceof Error ? termError.message : String(termError));
      cleanup();
    }
  });
}


interface ProjectResult {
  jsonFile: string;
  status: "success" | "failed";
  failedStep?: string;
  error?: string;
  created: boolean;
  generated: boolean;
  played: boolean;
  startTime?: number;
  endTime?: number;
  totalDurationMs?: number;
  creationDurationMs?: number;
  generationDurationMs?: number;
  playbackDurationMs?: number;
}

interface Resources {
  electronProcess: ChildProcess | null;
  browser: Browser | null;
}




// Serial execution function for complete test flow (includes project creation)
async function executeSerialTestForProject(page: Page, jsonFile: string): Promise<ProjectResult> {
  console.log(`\n===== Starting serial test for ${jsonFile} =====`);
  currentTestFile = jsonFile;

  const result: ProjectResult = {
    jsonFile,
    status: "success",
    created: false,
    generated: false,
    played: false,
    startTime: Date.now(),
  };

  let projectTitle = "";
  let problematicBeatIndices: number[] = [];
  const step = { value: 1 };

  try {
    // ========== PART 1: Create project (from createProjectAndStartGeneration) ==========
    const creationStartTime = Date.now();

    // Navigate to dashboard
    console.log(`${step.value}. Navigating to dashboard...`);
    await page.goto("http://localhost:5173/#/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector('[data-testid="create-new-button"]', { timeout: CONFIG.BUTTON_TIMEOUT_MS });
    console.log("✓ Dashboard loaded");

    // Click the create new button
    logStep(step, `Clicking "Create New" button...`);
    await page.click('[data-testid="create-new-button"]');
    await page.waitForSelector('[data-testid="project-title"]');
    console.log("✓ Navigated to new project page");

    // Read JSON from local node_modules
    logStep(step, `Reading test JSON from local node_modules...`);
    const jsonContent = await readLocalJSON(currentTestFile);

    // Debug: Check JSON content
    console.log(`[DEBUG] JSON file: ${currentTestFile}`);
    console.log(`[DEBUG] JSON content length: ${jsonContent.length}`);
    console.log(`[DEBUG] JSON content preview: ${jsonContent.substring(0, 200)}...`);

    // Verify JSON is valid
    try {
      const parsedJson = JSON.parse(jsonContent);
      console.log(`[DEBUG] JSON validation: OK, title: ${parsedJson.title || "No title"}`);
    } catch (parseError) {
      console.error(`[DEBUG] JSON validation FAILED:`, parseError);
      throw new Error(`Invalid JSON in ${currentTestFile}: ${parseError.message}`);
    }

    // Parse JSON to find problematic beats
    const jsonData = JSON.parse(jsonContent);
    if (jsonData.beats && Array.isArray(jsonData.beats)) {
      jsonData.beats.forEach((beat: unknown, index: number) => {
        if (!beat || typeof beat !== "object") return;
        const beatObj = beat as Record<string, unknown>;
        const audioSources = [
          ((beatObj.audio as Record<string, unknown>)?.source as Record<string, unknown>)?.path,
          (beatObj.audio as Record<string, unknown>)?.path,
        ].filter(Boolean);
        for (const source of audioSources) {
          if (typeof source === "string" && source.endsWith("local_voice.mp3")) {
            problematicBeatIndices.push(index);
            break;
          }
        }
      });
    }

    // Generate project title
    const baseTitle = jsonData.title || "Test";
    projectTitle = `${baseTitle}_${dayjs().format("YYYYMMDD_HHmmss")}`;
    logStep(step, `Project created with title: ${projectTitle}`);
    result.created = true;
    result.creationDurationMs = Date.now() - creationStartTime;

    // Navigate to JSON tab
    logStep(step, `Navigating to JSON tab...`);
    await page.click('[data-testid="script-editor-tab-json"]');
    await sleep(CONFIG.TAB_SWITCH_DELAY_MS);
    console.log("✓ JSON tab is active");

    // Wait for Monaco Editor
    logStep(step, `Waiting for Monaco Editor...`);
    await page.waitForSelector(".monaco-editor", { timeout: CONFIG.MONACO_EDITOR_TIMEOUT_MS });
    console.log("✓ Monaco Editor loaded");

    // Input JSON content
    logStep(step, `Inputting test JSON...`);
    await page.click(".monaco-editor");
    await page.keyboard.press("Meta+A");
    await page.keyboard.press("Delete");
    await sleep(CONFIG.EDITOR_STABILIZATION_DELAY_MS);

    await page.evaluate((json) => {
      const windowWithMonaco = window as Window & {
        monaco?: typeof monaco;
      };
      const editor = windowWithMonaco.monaco?.editor?.getModels()?.[0];
      if (editor) {
        editor.setValue(json);
      }
    }, jsonContent);
    console.log("✓ Test JSON inputted");

    // Fix problematic paths and add title
    await page.evaluate(
      ([ts, fileName]: [string, string]) => {
        const windowWithMonaco = window as Window & {
          monaco?: typeof monaco;
        };
        const editor = windowWithMonaco.monaco?.editor?.getModels()?.[0];
        if (editor) {
          let content = editor.getValue();
          const jsonData = JSON.parse(content);

          // Fix image paths
          if (jsonData.beats && Array.isArray(jsonData.beats)) {
            jsonData.beats.forEach((beat: unknown) => {
              const beatObj = beat as Record<string, unknown>;
              const image = beatObj.image as Record<string, unknown>;
              const source = image?.source as Record<string, unknown>;
              if (source?.kind === "path" && source.path === "../../assets/images/mulmocast_credit.png") {
                source.kind = "url";
                source.url =
                  "https://raw.githubusercontent.com/receptron/mulmocast-cli/refs/heads/main/assets/images/mulmocast_credit.png";
                delete source.path;
              }
            });
          }

          // Add title with timestamp
          const fileBaseName = fileName.replace(".json", "");
          jsonData.title = `${ts} ${jsonData.title || "Test"} (${fileBaseName})`;

          editor.setValue(JSON.stringify(jsonData, null, 2));
        }
      },
      [dayjs().format("YYYYMMDD_HHmmss"), currentTestFile],
    );

    await sleep(CONFIG.INITIAL_WAIT_MS);

    // Delete problematic beats in Media tab
    if (problematicBeatIndices.length > 0) {
      logStep(step, `Navigating to Media tab to clean up...`);
      await page.click('[data-testid="script-editor-tab-media"]');
      await sleep(CONFIG.TAB_SWITCH_DELAY_MS);

      const sortedIndices = problematicBeatIndices.sort((a, b) => b - a);
      for (const beatIndex of sortedIndices) {
        const deleteButtonSelector = `[data-testid="script-editor-media-tab-delete-beat-${beatIndex}"]`;
        try {
          await page.waitForSelector(deleteButtonSelector, { timeout: CONFIG.DELETE_BUTTON_TIMEOUT_MS });
          await page.click(deleteButtonSelector);
          console.log(`✓ Deleted beat ${beatIndex}`);
          await sleep(CONFIG.PAGE_EVALUATION_DELAY_MS);
        } catch {
          console.log(`⚠️ Could not delete beat ${beatIndex}`);
        }
      }
    }

    // Click generate button
    const generationStartTime = Date.now();
    logStep(step, `Starting generation...`);
    await page.waitForSelector('[data-testid="generate-contents-button"]', { timeout: CONFIG.BUTTON_TIMEOUT_MS });
    await page.locator('[data-testid="generate-contents-button"]').click({
      timeout: CONFIG.GENERATION_CLICK_TIMEOUT_MS,
      noWaitAfter: true,
    });

    // Wait a bit to ensure generation has started
    await sleep(CONFIG.GENERATION_START_DELAY_MS);

    // ========== PART 2: Wait for generation to complete ==========
    console.log("\n--- Waiting for generation to complete ---");

    // First, wait for the button to become disabled (generation started)
    console.log("Waiting for generation to start (button disabled)...");

    // Debug: Check button state before waiting
    const buttonStateBefore = await page.evaluate(() => {
      const button = document.querySelector('[data-testid="generate-contents-button"]') as HTMLButtonElement;
      return {
        exists: !!button,
        disabled: button?.disabled,
        text: button?.textContent?.trim(),
        currentURL: window.location.href,
      };
    });
    console.log("[DEBUG] Button state before waiting:", JSON.stringify(buttonStateBefore));

    // Debug: Monitor button state during the wait
    let waitAttempts = 0;
    const maxAttempts = 30; // 30 attempts, 1 second apart

    while (waitAttempts < maxAttempts) {
      const buttonState = await page.evaluate(() => {
        const button = document.querySelector('[data-testid="generate-contents-button"]') as HTMLButtonElement;
        return {
          exists: !!button,
          disabled: button?.disabled,
          text: button?.textContent?.trim(),
        };
      });

      console.log(`[DEBUG] Wait attempt ${waitAttempts + 1}: Button state:`, JSON.stringify(buttonState));

      if (buttonState.exists && buttonState.disabled) {
        console.log("✓ Generation started (button is now disabled)");
        break;
      }

      if (waitAttempts === maxAttempts - 1) {
        throw new Error(
          `Button never became disabled after ${maxAttempts} seconds. Final state: ${JSON.stringify(buttonState)}`,
        );
      }

      await sleep(CONFIG.PAGE_EVALUATION_DELAY_MS);
      waitAttempts++;
    }

    // Then wait for generation to complete (both generate button and play button enabled)
    console.log("Waiting for generation to complete (generate button + play button enabled)...");

    const maxGenerationWait = CONFIG.GENERATION_TIMEOUT_MS / 1000; // Convert to seconds
    let generationWaitTime = 0;

    while (generationWaitTime < maxGenerationWait) {
      try {
        const buttonsState = await page.evaluate(() => {
          const generateButton = document.querySelector(
            '[data-testid="generate-contents-button"]',
          ) as HTMLButtonElement;
          const playButton = document.querySelector('[data-testid="movie-play-button"]') as HTMLButtonElement;

          return {
            generateButton: {
              exists: !!generateButton,
              disabled: generateButton?.disabled,
            },
            playButton: {
              exists: !!playButton,
              disabled: playButton?.disabled,
            },
          };
        });

        // Check if both buttons are enabled
        const generateEnabled = buttonsState.generateButton.exists && !buttonsState.generateButton.disabled;
        const playEnabled = buttonsState.playButton.exists && !buttonsState.playButton.disabled;

        if (generateEnabled && playEnabled) {
          console.log("✓ Generation completed (both generate and play buttons are enabled)");
          break;
        }

        // Log progress every 10 seconds
        if (generationWaitTime > 0 && generationWaitTime % 10 === 0) {
          console.log(
            `Still waiting... Generate: ${generateEnabled ? "enabled" : "disabled"}, Play: ${playEnabled ? "enabled" : "disabled"} (${generationWaitTime}s elapsed)`,
          );
        }
      } catch (evaluationError) {
        console.log(
          `[WARN] Page evaluation failed at ${generationWaitTime}s (${evaluationError?.message || "unknown error"}), continuing...`,
        );
        // Continue polling - this is expected during generation transitions

        // Still log progress during error periods every 10 seconds
        if (generationWaitTime > 0 && generationWaitTime % 10 === 0) {
          console.log(`Still waiting... (page evaluation failed, will retry) (${generationWaitTime}s elapsed)`);
        }
      }

      if (generationWaitTime >= maxGenerationWait) {
        throw new Error(`Generation did not complete after ${maxGenerationWait} seconds`);
      }

      await sleep(CONFIG.POLLING_INTERVAL_MS); // Check every 2 seconds
      generationWaitTime += 2;
    }

    console.log("✓ Generation completed");
    result.generated = true;
    result.generationDurationMs = Date.now() - generationStartTime;

    // Step 3: Test playback
    const playbackStartTime = Date.now();
    console.log("\n--- Testing playback ---");

    // Wait for movie play button to be available
    console.log("Waiting for movie play button...");
    const playButtonSelector = '[data-testid="movie-play-button"]';
    const pauseButtonSelector = '[data-testid="movie-pause-button"]';

    await page.waitForSelector(playButtonSelector, { timeout: CONFIG.BUTTON_TIMEOUT_MS });

    // Check if button is enabled
    await page.waitForFunction(
      (selector) => {
        const button = document.querySelector(selector) as HTMLButtonElement;
        return button && !button.disabled && button.getAttribute("aria-disabled") !== "true";
      },
      playButtonSelector,
      { timeout: CONFIG.BUTTON_TIMEOUT_MS },
    );
    console.log("✓ Movie play button is available and enabled");

    // Click play button
    console.log("Clicking movie play button...");
    await page.click(playButtonSelector);
    console.log("✓ Movie play button clicked");

    // Wait for pause button to appear
    console.log("Waiting for pause button to appear...");
    await page.waitForSelector(pauseButtonSelector, { timeout: CONFIG.BUTTON_TIMEOUT_MS });
    console.log("✓ Playback started (pause button appeared)");

    // Wait 3 seconds during playback
    console.log(`Waiting ${CONFIG.PLAY_WAIT_MS}ms during playback...`);
    await sleep(CONFIG.PLAY_WAIT_MS);
    console.log("✓ Playback wait completed");

    // Click pause button
    console.log("Clicking movie pause button...");
    await page.click(pauseButtonSelector);
    console.log("✓ Movie pause button clicked");

    // Wait for play button to appear again
    console.log("Waiting for play button to reappear...");
    await page.waitForSelector(playButtonSelector, { timeout: CONFIG.BUTTON_TIMEOUT_MS });
    console.log("✓ Playback paused (play button reappeared)");

    result.played = true;
    result.playbackDurationMs = Date.now() - playbackStartTime;
    result.endTime = Date.now();
    result.totalDurationMs = result.endTime - result.startTime!;
    
    console.log(`\n✅ Serial test for ${jsonFile} completed successfully!`);
    console.log(`📊 Test Duration Summary:`);
    console.log(`  - Creation: ${(result.creationDurationMs! / 1000).toFixed(1)}s`);
    console.log(`  - Generation: ${(result.generationDurationMs! / 1000).toFixed(1)}s`);
    console.log(`  - Playback: ${(result.playbackDurationMs! / 1000).toFixed(1)}s`);
    console.log(`  - Total: ${(result.totalDurationMs / 1000).toFixed(1)}s`);
  } catch (error: unknown) {
    console.error(`\n❌ Serial test for ${jsonFile} failed:`, error instanceof Error ? error.message : String(error));
    result.status = "failed";

    // Determine at which step it failed
    if (!result.created) {
      result.failedStep = "project_creation";
    } else if (!result.generated) {
      result.failedStep = "generation";
    } else if (!result.played) {
      result.failedStep = "playback";
    }

    result.error = error instanceof Error ? error.message : String(error);
    result.endTime = Date.now();
    result.totalDurationMs = result.endTime - result.startTime!;
    console.log(`⏱️ Test failed after ${(result.totalDurationMs / 1000).toFixed(1)}s`);

    // Take screenshot on failure
    try {
      const screenshotPath = `serial-test-failure-${jsonFile.replace(".json", "")}-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    } catch (screenshotError) {
      console.error("Failed to take screenshot:", screenshotError);
    }
  }

  // Navigate back to dashboard for next test
  console.log("\nNavigating back to dashboard...");
  try {
    await page.goto("http://localhost:5173/#/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector('[data-testid="create-new-button"]', { timeout: CONFIG.BUTTON_TIMEOUT_MS });
    console.log("✓ Returned to dashboard");
  } catch (navError) {
    console.error("Failed to navigate back to dashboard:", navError);
  }

  return result;
}

async function runGenerationE2ETest(): Promise<void> {
  // Initialize resources
  const resources: Resources = {
    electronProcess: null,
    browser: null,
  };

  try {
    console.log("=== MulmoCast Generation E2E Test ===");
    console.log("1. Starting Electron app with yarn start...");

    // Start Electron app with electron-forge directly to avoid PATH and shell security warnings
    // Resolve cross-platform executable (Windows needs .cmd extension)
    const electronForgeBinary = process.platform === "win32" ? "electron-forge.cmd" : "electron-forge";
    const electronForgeBinPath = path.join(process.cwd(), "node_modules", ".bin", electronForgeBinary);

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

    resources.electronProcess.stderr?.on("data", () => {
      // Temporarily disabled to reduce noise during debugging
      // console.error(`[Electron Error]: ${data.toString().trim()}`);
    });

    // Poll for CDP connection availability
    console.log("\n2. Waiting for CDP to be available...");
    const cdpUrl = "http://localhost:9222/";
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
        await sleep(CONFIG.CDP_RETRY_DELAY_MS);
      }
    }

    // Wait for Vite dev server to start and app to load
    console.log("\\n3. Waiting for Vite dev server to start...");
    let page: Page | null = null;
    let waitTime = 0;

    while (waitTime < CONFIG.VITE_SERVER_WAIT_MAX_MS) {
      const contexts = resources.browser!.contexts();
      console.log(`Found ${contexts.length} browser contexts`);

      for (const context of contexts) {
        const pages = context.pages();
        console.log(`Context has ${pages.length} pages:`);
        for (const p of pages) {
          const url = p.url();
          console.log(`  - Page URL: ${url}`);
          if (url.includes("localhost:5173") && !url.includes("devtools://")) {
            page = p;
            console.log(`  ✓ Selected as application page: ${url}`);
            break;
          }
        }
        if (page) break;
      }

      if (page) {
        console.log("✓ Found application page with Vite dev server");
        break;
      }

      console.log(`Still waiting for Vite server... (${waitTime / 1000}s elapsed)`);
      await sleep(CONFIG.VITE_SERVER_CHECK_INTERVAL_MS);
      waitTime += CONFIG.VITE_SERVER_CHECK_INTERVAL_MS;
    }

    if (!page) {
      throw new Error(`Could not find application page after waiting ${CONFIG.VITE_SERVER_WAIT_MAX_MS / 1000} seconds`);
    }

    console.log("✓ Found application page");
    console.log(`[DEBUG] Initial page URL: ${page.url()}`);
    console.log(`[DEBUG] Page readyState: ${await page.evaluate(() => document.readyState)}`);

    // Wait for initial page load
    console.log("[DEBUG] Waiting for initial page to fully load...");
    await sleep(CONFIG.APP_STABILIZATION_DELAY_MS);

    const testResults: ProjectResult[] = [];

    // Execute tests serially (one by one)
    console.log(`\nTotal files to process: ${TEST_JSON_FILES.length}`);
    console.log("=== Starting SERIAL execution (one project at a time) ===\n");

    for (let i = 0; i < TEST_JSON_FILES.length; i++) {
      const jsonFile = TEST_JSON_FILES[i];
      console.log(`\n\n===== Processing ${i + 1}/${TEST_JSON_FILES.length}: ${jsonFile} =====\n`);

      // Execute complete test flow for this project
      const result = await executeSerialTestForProject(page, jsonFile);
      testResults.push(result);

      // Log progress
      if (result.status === "success") {
        console.log(`✅ ${jsonFile} completed successfully`);
      } else {
        console.log(`❌ ${jsonFile} failed at step: ${result.failedStep}`);
      }

      // Small delay between tests
      if (i < TEST_JSON_FILES.length - 1) {
        console.log("\n⏳ Brief pause before next test...");
        await sleep(CONFIG.POLLING_INTERVAL_MS);
      }
    }

    console.log(`\n=== Serial execution completed ===`);

    // Output detailed test results
    console.log(`\n\n===== Detailed Test Results =====`);
    console.log(`Total test files: ${testResults.length}`);

    const successCount = testResults.filter((r) => r.status === "success").length;
    const failedCount = testResults.filter((r) => r.status === "failed").length;

    console.log(`✓ Success: ${successCount}`);
    console.log(`✗ Failed: ${failedCount}`);
    
    // Calculate and display timing statistics
    const successfulTests = testResults.filter((r) => r.status === "success");
    if (successfulTests.length > 0) {
      console.log(`\n⏱️  Timing Statistics (successful tests only):`);
      
      const totalTime = successfulTests.reduce((sum, r) => sum + (r.totalDurationMs || 0), 0);
      const avgTotal = totalTime / successfulTests.length;
      
      const avgCreation = successfulTests.reduce((sum, r) => sum + (r.creationDurationMs || 0), 0) / successfulTests.length;
      const avgGeneration = successfulTests.reduce((sum, r) => sum + (r.generationDurationMs || 0), 0) / successfulTests.length;
      const avgPlayback = successfulTests.reduce((sum, r) => sum + (r.playbackDurationMs || 0), 0) / successfulTests.length;
      
      console.log(`  Average per test: ${(avgTotal / 1000).toFixed(1)}s`);
      console.log(`    - Creation: ${(avgCreation / 1000).toFixed(1)}s`);
      console.log(`    - Generation: ${(avgGeneration / 1000).toFixed(1)}s`);
      console.log(`    - Playback: ${(avgPlayback / 1000).toFixed(1)}s`);
      console.log(`  Total test time: ${(totalTime / 1000).toFixed(1)}s`);
    }

    if (failedCount > 0) {
      console.log("\n=== Failed Projects Details ===");
      testResults
        .filter((r) => r.status === "failed")
        .forEach((result) => {
          console.log(`\n${result.jsonFile}:`);
          console.log(`  Failed at: ${result.failedStep}`);
          console.log(`  Created: ${result.created ? "✓" : "✗"}`);
          console.log(`  Generated: ${result.generated ? "✓" : "✗"}`);
          console.log(`  Played: ${result.played ? "✓" : "✗"}`);
          if (result.totalDurationMs) {
            console.log(`  Duration: ${(result.totalDurationMs / 1000).toFixed(1)}s`);
          }
          if (result.error) {
            const errorMsg = result.error.length > 100 ? result.error.substring(0, 100) + "..." : result.error;
            console.log(`  Error: ${errorMsg}`);
          }
        });
    }

    // Determine test pass/fail
    if (successCount === 0) {
      console.log("\n✗ Test FAILED - All projects failed");
      throw new Error("All projects failed");
    } else if (failedCount > 0) {
      console.log(`\n✗ Test FAILED - ${failedCount} out of ${testResults.length} projects failed`);
      throw new Error(`${failedCount} out of ${testResults.length} projects failed`);
    } else {
      console.log("\n✓ Test PASSED - All generations completed and played successfully!");
    }

    // Close application normally after test completion
    console.log("\nClosing application window...");
    try {
      // Close Electron app window
      await page.evaluate(() => {
        (window as Window & { close: () => void }).close();
      });
      await sleep(CONFIG.WINDOW_CLOSE_DELAY_MS); // Wait for window to close
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
  console.log("Starting Generation E2E test...");
  console.log("This test will automatically start and stop the Electron app.\n");

  try {
    await runGenerationE2ETest();
    console.log("\n✅ All tests passed!");
    process.exit(0);
  } catch (error: unknown) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Execute
main();
