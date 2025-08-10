import { spawn, ChildProcess } from "child_process";
import playwright, { Browser, BrowserContext, Page } from "playwright-core";
import dayjs from "dayjs";
import * as fs from "fs/promises";
import * as path from "path";

// Configuration constants
const CONFIG = {
  PROCESS_KILL_TIMEOUT: 5000, // 5 seconds
  APP_START_WAIT: 20000, // 20 seconds for CI environment
  CDP_RETRY_DELAY: 1000, // CDP connection retry delay (1 second)
  CDP_MAX_ATTEMPTS: 50, // Maximum CDP connection attempts (longer for CI)
  TAB_SWITCH_DELAY: 500, // Tab switching delay
  INITIAL_WAIT: 3000, // Initial wait before test starts (3 seconds)
  GENERATION_TIMEOUT: 600000, // 10 minutes for generation (longer for CI)
  PLAY_BUTTON_TIMEOUT: 15000, // 15 seconds to wait for play button
} as const;

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
    } catch (termError: unknown) {
      console.log("Failed to send SIGTERM:", termError instanceof Error ? termError.message : String(termError));
      cleanup();
    }
  });
}

interface ProjectInfo {
  jsonFile: string;
  projectTitle: string;
  projectUrl?: string;
}

interface Resources {
  electronProcess: ChildProcess | null;
  browser: Browser | null;
}

async function waitForAllGenerationsToComplete(page: Page): Promise<void> {
  console.log("\n=== Waiting for all generations to complete ===");

  // Navigate to dashboard
  await page.goto("http://localhost:5173/#/");
  await page.waitForLoadState("networkidle");
  console.log("✓ Navigated to dashboard");

  // Poll for generating count to become 0
  const maxWaitTime = CONFIG.GENERATION_TIMEOUT * 2; // Allow more time for multiple projects
  const checkInterval = 10000; // Check every 10 seconds for CI
  let elapsed = 0;

  while (elapsed < maxWaitTime) {
    const generatingCount = await page.evaluate(() => {
      // Look for "generating" text with count in header
      const elements = document.querySelectorAll("*");
      for (const element of elements) {
        const text = element.textContent || "";
        // Match patterns like "generating (2)" or "生成中 (2)"
        const match = text.match(/(?:generating|生成中)\s*\((\d+)\)/i);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
      return 0;
    });

    if (generatingCount === 0) {
      console.log("✓ All generations completed!");
      break;
    }

    console.log(`Still generating: ${generatingCount} project(s) in progress... (${elapsed / 1000}s elapsed)`);
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
    elapsed += checkInterval;
  }

  if (elapsed >= maxWaitTime) {
    console.log("⚠️ Timeout waiting for generations to complete");
  }

  // Wait a bit more to ensure UI is updated
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

async function visitProjectsAndPlay(
  page: Page,
  projects: ProjectInfo[],
): Promise<{ played: number; failed: number; failedProjects: string[] }> {
  console.log("\n=== Visiting each project to play ===");

  let playedCount = 0;
  let failedCount = 0;
  const failedProjects: string[] = [];

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    console.log(`\nVisiting project ${i + 1}/${projects.length}: ${project.projectTitle}`);

    // First navigate to dashboard
    console.log("Navigating to dashboard first...");
    await page.goto("http://localhost:5173/#/");
    await page.waitForLoadState("networkidle");
    console.log("✓ On dashboard");

    // Wait a bit for dashboard to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Navigate to project
    console.log(`Navigating to project: ${project.projectUrl}`);
    await page.goto(project.projectUrl!);
    await page.waitForLoadState("networkidle");
    console.log("✓ Navigated to project page");

    // Wait for page to fully load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Look for play button
    let playSuccessful = false;
    try {
      await page.waitForSelector('[data-testid="play-video-button"]', {
        timeout: CONFIG.PLAY_BUTTON_TIMEOUT,
      });
      const playButton = await page.$('[data-testid="play-video-button"]');

      if (playButton) {
        console.log("✓ Found play button, clicking...");
        await playButton.click();

        // Wait a bit and check if video is actually playing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Check for video element and its state
        const videoState = await page.evaluate(() => {
          const video = document.querySelector("video");
          if (!video) return { found: false };
          return {
            found: true,
            hasSource: !!video.src || video.children.length > 0,
            readyState: video.readyState,
            error: video.error?.message || null,
            paused: video.paused,
            duration: video.duration,
          };
        });

        if (videoState.found && videoState.hasSource && !videoState.error && videoState.readyState >= 2) {
          console.log("✓ Playback started successfully");
          console.log(`  Video state: duration=${videoState.duration}, paused=${videoState.paused}`);
          playSuccessful = true;
          playedCount++;

          // Wait 3 seconds to let it play
          console.log("Playing for 3 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
          console.log("✓ Moving to next project");
        } else {
          console.log("✗ Video playback failed");
          if (!videoState.found) {
            console.log("  Reason: Video element not found");
          } else if (!videoState.hasSource) {
            console.log("  Reason: No video source");
          } else if (videoState.error) {
            console.log(`  Reason: Video error - ${videoState.error}`);
          } else if (videoState.readyState < 2) {
            console.log(`  Reason: Video not ready (readyState=${videoState.readyState})`);
          }
        }
      } else {
        console.log("✗ Play button not found");
      }
    } catch {
      console.log("✗ Could not find play button for this project");
    }

    if (!playSuccessful) {
      failedCount++;
      failedProjects.push(`${project.projectTitle} (${project.jsonFile})`);
      console.log(`✗ Failed to play: ${project.projectTitle}`);
    }
  }

  console.log("\n=== Play Summary ===");
  console.log(`Successfully played: ${playedCount}/${projects.length}`);
  console.log(`Failed to play: ${failedCount}/${projects.length}`);
  if (failedProjects.length > 0) {
    console.log("Failed projects:");
    failedProjects.forEach((p) => console.log(`  - ${p}`));
  }

  return { played: playedCount, failed: failedCount, failedProjects };
}

async function createProjectAndStartGeneration(projectsCreated: ProjectInfo[], page: Page): Promise<void> {
  console.log(`[DEBUG] Starting createProjectAndStartGeneration for: ${currentTestFile}`);
  console.log(`[DEBUG] Projects created so far: ${projectsCreated.length}`);

  let projectTitle = "";
  let problematicBeatIndices: number[] = [];

  try {
    // Navigate to dashboard
    console.log("Navigating to dashboard...");
    await page.goto("http://localhost:5173/#/");
    await page.waitForLoadState("networkidle");
    console.log("✓ Dashboard loaded");

    // Click the create new button
    console.log('\n2. Clicking "Create New" button...');
    await page.click('[data-testid="create-new-button"]');
    await page.waitForSelector('[data-testid="project-title-input"]');
    console.log("✓ New project dialog opened");

    // Read JSON from local node_modules and analyze
    console.log("\n8. Reading test JSON from local node_modules...");
    let jsonContent: string;

    try {
      jsonContent = await readLocalJSON(currentTestFile);
      
      // Parse JSON to find problematic beats (only for deletion - local_voice.mp3)
      console.log("Analyzing JSON for beats to delete (local_voice.mp3)...");
      const jsonData = JSON.parse(jsonContent);
      const deleteTargetPath = "../../assets/audio/local_voice.mp3";
      
      if (jsonData.beats && Array.isArray(jsonData.beats)) {
        jsonData.beats.forEach((beat: unknown, index: number) => {
          const beatStr = JSON.stringify(beat);
          if (beatStr.includes(deleteTargetPath)) {
            problematicBeatIndices.push(index);
            console.log(`Found beat to delete at index ${index} with path: ${deleteTargetPath}`);
          }
        });
      }
      
      console.log(
        `Total beats to delete: ${problematicBeatIndices.length} at indices: [${problematicBeatIndices.join(", ")}]`,
      );
    } catch (error) {
      console.error("Failed to read from local file:", error);
      throw new Error(`Could not read ${currentTestFile} from node_modules`);
    }

    // Parse JSON to get title for project name
    let baseTitle = "Test";
    try {
      const testJson = JSON.parse(jsonContent);
      if (testJson.title) {
        baseTitle = testJson.title;
      }
    } catch {
      console.log("Could not read title from JSON, using default");
    }

    // Enter project title (based on JSON title + timestamp)
    projectTitle = `${baseTitle}_${dayjs().format("YYYYMMDD_HHmmss")}`;
    console.log(`\n3. Entering project title: ${projectTitle}`);
    await page.fill('[data-testid="project-title-input"]', projectTitle);
    console.log("✓ Project title entered");

    // Click the Create button
    console.log('\n4. Clicking "Create" button...');
    await page.click('[data-testid="create-button"]');

    // Wait for project page to load
    await page.waitForSelector(`h1:has-text("${projectTitle}")`);
    console.log("✓ Project created and page loaded");

    // Store project info immediately after creation
    const projectUrl = page.url();
    console.log(`[DEBUG] Project URL: ${projectUrl}`);
    projectsCreated.push({
      jsonFile: currentTestFile,
      projectTitle: projectTitle,
      projectUrl: projectUrl,
    });
    console.log(`[DEBUG] Project added to list. Total: ${projectsCreated.length}`);

    // Navigate to JSON tab
    console.log("\n6. Navigating to JSON tab...");
    await page.click('[data-testid="tab-json"]');
    await new Promise((resolve) => setTimeout(resolve, CONFIG.TAB_SWITCH_DELAY));

    // Verify JSON tab is active
    const jsonTab = await page.$('[data-testid="tab-json"]');
    if (jsonTab) {
      const isSelected = await jsonTab.evaluate((el: HTMLElement) => el.getAttribute("aria-selected") === "true");
      if (isSelected) {
        console.log("✓ JSON tab is now active");
      } else {
        throw new Error("Failed to activate JSON tab");
      }
    }

    // Wait for Monaco Editor to be ready
    console.log("\n7. Waiting for Monaco Editor...");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });
    console.log("✓ Monaco Editor loaded");

    // Clear existing content and input test JSON
    console.log("\n9. Inputting test audio JSON...");
    // Focus on Monaco editor
    await page.click(".monaco-editor");

    // Select all and delete (use Cmd on macOS)
    await page.keyboard.press("Meta+A");
    await page.keyboard.press("Delete");

    // Wait a bit for editor to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Use page.evaluate to set the editor content directly
    await page.evaluate((json) => {
      // Try to find Monaco editor instance and set its content
      const windowWithMonaco = window as Window & {
        monaco?: {
          editor?: {
            getModels?: () => Array<{
              setValue: (value: string) => void;
            }>;
          };
        };
      };
      const editor = windowWithMonaco.monaco?.editor?.getModels()?.[0];
      if (editor) {
        editor.setValue(json);
      } else {
        // Fallback: try to set textarea content
        const textarea = document.querySelector("textarea");
        if (textarea) {
          textarea.value = json;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    }, jsonContent);

    console.log("✓ Test JSON inputted directly into editor");

    // Fix problematic image paths by converting to URL
    console.log("\nFixing problematic image paths by converting to URLs...");
    await page.evaluate(() => {
      const windowWithMonaco = window as Window & {
        monaco?: {
          editor?: {
            getModels?: () => Array<{
              setValue: (value: string) => void;
              getValue: () => string;
            }>;
          };
        };
      };
      const editor = windowWithMonaco.monaco?.editor?.getModels()?.[0];
      if (editor) {
        let content = editor.getValue();
        try {
          const jsonData = JSON.parse(content);
          let hasChanges = false;
          
          if (jsonData.beats && Array.isArray(jsonData.beats)) {
            jsonData.beats.forEach((beat: unknown) => {
              const beatObj = beat as Record<string, unknown>;
              const image = beatObj.image as Record<string, unknown>;
              const source = image?.source as Record<string, unknown>;
              
              if (
                image &&
                source &&
                source.kind === "path" &&
                source.path === "../../assets/images/mulmocast_credit.png"
              ) {
                console.log("Converting path to URL for mulmocast_credit.png");
                source.kind = "url";
                source.url =
                  "https://raw.githubusercontent.com/receptron/mulmocast-cli/refs/heads/main/assets/images/mulmocast_credit.png";
                delete source.path; // Remove the path property
                hasChanges = true;
              }
            });
          }
          
          if (hasChanges) {
            const updatedContent = JSON.stringify(jsonData, null, 2);
            editor.setValue(updatedContent);
            console.log("✓ Successfully converted problematic paths to URLs");
          } else {
            console.log("✓ No problematic paths found to convert");
          }
        } catch (e) {
          console.error("Failed to parse/update JSON:", e);
        }
      }
    });
    console.log("✓ Path conversion completed");

    // Add title field to JSON with timestamp
    console.log("\nAdding title to JSON with timestamp...");
    const timestamp = dayjs().format("YYYYMMDD_HHmmss");
    await page.evaluate(
      ([ts, fileName]: [string, string]) => {
        const windowWithMonaco = window as Window & {
          monaco?: {
            editor?: {
              getModels?: () => Array<{
                setValue: (value: string) => void;
                getValue: () => string;
              }>;
            };
          };
        };
        const editor = windowWithMonaco.monaco?.editor?.getModels()?.[0];
        if (editor) {
          const content = editor.getValue();
          try {
            const json = JSON.parse(content);
            // Add title field if it doesn't exist
            const fileBaseName = fileName.replace(".json", "");
            if (!json.title) {
              json.title = `${ts} Test (${fileBaseName})`;
            } else {
              // If title exists, prepend timestamp and append filename
              json.title = `${ts} ${json.title} (${fileBaseName})`;
            }
            const updatedContent = JSON.stringify(json, null, 2);
            editor.setValue(updatedContent);
            console.log(`Updated title: ${json.title}`);
          } catch (e) {
            console.error("Failed to parse/update JSON:", e);
          }
        }
      },
      [timestamp, currentTestFile],
    );
    console.log(`✓ Title updated with timestamp`);

    // Wait for JSON validation and UI update
    console.log("\nWaiting for JSON validation and UI update...");
    await new Promise((resolve) => setTimeout(resolve, CONFIG.INITIAL_WAIT));
    console.log("✓ JSON processing time completed");

    // Navigate to Media tab to delete problematic beats
    console.log("\n7. Navigating to Media tab to clean up problematic assets...");
    await page.click('[data-testid="tab-media"]');
    await new Promise((resolve) => setTimeout(resolve, CONFIG.TAB_SWITCH_DELAY));
    console.log("✓ Navigated to Media tab");

    // Delete beats with local_voice.mp3 using pre-identified indices
    console.log("\n8. Deleting beats with local_voice.mp3...");
    
    if (problematicBeatIndices.length > 0) {
      // Delete in reverse order to avoid index shifting issues
      const sortedIndices = problematicBeatIndices.sort((a, b) => b - a);
      console.log(`Deleting beats in reverse order: [${sortedIndices.join(", ")}]`);
      
      for (const beatIndex of sortedIndices) {
        const deleteButtonSelector = `[data-testid="delete-beat-${beatIndex}"]`;
        console.log(`Looking for delete button: ${deleteButtonSelector}`);
        
        try {
          await page.waitForSelector(deleteButtonSelector, { timeout: 3000 });
          await page.click(deleteButtonSelector);
          console.log(`✓ Deleted beat ${beatIndex} (UI: Beat ${beatIndex + 1}) with local_voice.mp3`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch {
          console.log(`⚠️ Could not find or click delete button for beat ${beatIndex}`);
        }
      }
      
      console.log("✓ Completed deletion of beats with local_voice.mp3");
      
      // Wait for UI to update after deletions
      console.log("Waiting for UI to update after deletions...");
      await new Promise((resolve) => setTimeout(resolve, CONFIG.INITIAL_WAIT));
    } else {
      console.log("✓ No beats with local_voice.mp3 found to delete");
    }

    // Find and click the generate button in output settings section
    console.log("\n10. Looking for generate button in output settings section...");

    // Use data-testid to find the generate button
    const generateButton = await page.$('[data-testid="generate-contents-button"]');
    if (!generateButton) {
      throw new Error("Generate Contents button not found");
    }
    console.log("✓ Found generate button");
    await generateButton.click();

    // Start generation without waiting
    console.log("\n10. Generation started, moving to next file...");

    // Wait a bit to ensure generation has started
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("\n=== Project created and generation started ===");
    console.log(`Project "${projectTitle}" was created and generation was started.`);
  } catch (error: unknown) {
    console.error("\n✗ Test failed:", error instanceof Error ? error.message : String(error));
    throw error;
  }
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

    // Start Electron app with spawn (create process group)
    // Note: Using yarn from PATH - ensure trusted environment in CI/CD
    resources.electronProcess = spawn("yarn", ["start"], {
      shell: true,
      detached: process.platform !== "win32", // Don't use detached on Windows
      env: {
        ...process.env,
        NODE_ENV: "development",
        // Explicitly include common paths to reduce risk
        PATH: process.env.PATH,
      },
    });

    // Display app startup logs
    resources.electronProcess.stdout?.on("data", (data: Buffer) => {
      console.log(`[Electron]: ${data.toString().trim()}`);
    });

    resources.electronProcess.stderr?.on("data", (data: Buffer) => {
      console.error(`[Electron Error]: ${data.toString().trim()}`);
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
        await new Promise((resolve) => setTimeout(resolve, CONFIG.CDP_RETRY_DELAY));
      }
    }

    // Get page
    const contexts = resources.browser!.contexts();
    let page: Page | null = null;
    for (const context of contexts) {
      const pages = context.pages();
      for (const p of pages) {
        if (p.url().includes("localhost:5173")) {
          page = p;
          break;
        }
      }
      if (page) break;
    }

    if (!page) {
      throw new Error("Could not find application page");
    }

    console.log("✓ Found application page");

    const projectsCreated: ProjectInfo[] = [];

    // Create all projects and start generation
    console.log(`\nTotal files to process: ${TEST_JSON_FILES.length}`);
    for (let i = 0; i < TEST_JSON_FILES.length; i++) {
      const jsonFile = TEST_JSON_FILES[i];
      console.log(`\n\n===== Creating project ${i + 1}/${TEST_JSON_FILES.length} with ${jsonFile} =====\n`);
      currentTestFile = jsonFile;
      try {
        await createProjectAndStartGeneration(projectsCreated, page);
        console.log(`✓ Project created and generation started for ${jsonFile}`);
      } catch (error: unknown) {
        console.error(`✗ Failed to create project for ${jsonFile}:`, error);
        // Continue with next file even if one fails
      }
    }
    console.log(`\nTotal projects created: ${projectsCreated.length} out of ${TEST_JSON_FILES.length} files`);

    // Wait for all generations to complete
    await waitForAllGenerationsToComplete(page);

    // Visit each project and play
    const playResult = await visitProjectsAndPlay(page, projectsCreated);

    console.log(`\n\n===== Test Summary =====`);
    console.log(`Total projects created: ${projectsCreated.length}`);
    console.log(`Successfully played: ${playResult.played}`);
    console.log(`Failed to play: ${playResult.failed}`);

    if (playResult.failed > 0) {
      console.log("\n✗ Test FAILED - Some projects could not be played");
      console.log("Failed projects:");
      playResult.failedProjects.forEach((p) => console.log(`  - ${p}`));
      throw new Error("Some projects failed to play");
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
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for window to close
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