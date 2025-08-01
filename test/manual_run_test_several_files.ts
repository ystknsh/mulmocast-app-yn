import * as playwright from "playwright-core";
import { Browser, BrowserContext, Page } from "playwright-core";
import dayjs from "dayjs";
import * as fs from "fs/promises";
import * as path from "path";

// Configuration constants
const CONFIG = {
  CDP_RETRY_DELAY: 1000, // CDP connection retry delay (1 second)
  CDP_MAX_ATTEMPTS: 30, // Maximum CDP connection attempts
  TAB_SWITCH_DELAY: 500, // Tab switching delay
  INITIAL_WAIT: 3000, // Initial wait before test starts (3 seconds)
  GENERATION_TIMEOUT: 300000, // 5 minutes for generation
  PLAY_BUTTON_TIMEOUT: 10000, // 10 seconds to wait for play button
} as const;

// Test JSON files to process
const TEST_JSON_FILES = [
  "test_order.json",
  "test_beats.json",
  "test_no_audio.json",
  "test_no_audio_with_credit.json",
  "test_transition_no_audio.json",
  "test_slideout_left_no_audio.json",

  // test_order.json --pdf_mode slide --pdf_size a4
  // test_order.json --pdf_mode talk --pdf_size a4
  // test_order.json --pdf_mode handout --pdf_size a4
  // test_order_portrait.json --pdf_mode slide --pdf_size a4
  // test_order_portrait.json --pdf_mode talk --pdf_size a4
  // test_order_portrait.json --pdf_mode handout --pdf_size a4
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

interface Resources {
  browser: Browser | null;
}

interface ProjectInfo {
  jsonFile: string;
  projectTitle: string;
  projectUrl?: string;
}

async function waitForAllGenerationsToComplete(page: Page): Promise<void> {
  console.log("\n=== Waiting for all generations to complete ===");

  // Navigate to dashboard
  const appUrl = process.env.APP_URL || "localhost:5173";
  await page.goto(`http://${appUrl}/#/`);
  await page.waitForLoadState("networkidle");
  console.log("✓ Navigated to dashboard");

  // Poll for generating count to become 0
  const maxWaitTime = CONFIG.GENERATION_TIMEOUT * 10; // Allow more time for multiple projects
  const checkInterval = 5000; // Check every 5 seconds
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
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

async function visitProjectsAndPlay(
  page: Page,
  projects: ProjectInfo[],
): Promise<{ played: number; failed: number; failedProjects: string[] }> {
  console.log("\n=== Visiting each project to play ===");

  const appUrl = process.env.APP_URL || "localhost:5173";
  let playedCount = 0;
  let failedCount = 0;
  const failedProjects: string[] = [];

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    console.log(`\nVisiting project ${i + 1}/${projects.length}: ${project.projectTitle}`);

    // First navigate to dashboard
    console.log("Navigating to dashboard first...");
    await page.goto(`http://${appUrl}/#/`);
    await page.waitForLoadState("networkidle");
    console.log("✓ On dashboard");

    // Wait a bit for dashboard to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Navigate to project
    console.log(`Navigating to project: ${project.projectUrl}`);
    await page.goto(project.projectUrl!);
    await page.waitForLoadState("networkidle");
    console.log("✓ Navigated to project page");

    // Wait for page to fully load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Look for play button
    let playSuccessful = false;
    try {
      await page.waitForSelector('button:has-text("Play"), button[aria-label="Play"], button[title*="Play"]', {
        timeout: 5000,
      });
      const playButton = await page.$('button:has-text("Play"), button[aria-label="Play"], button[title*="Play"]');

      if (playButton) {
        console.log("✓ Found play button, clicking...");
        await playButton.click();

        // Wait a bit and check if video is actually playing
        await new Promise((resolve) => setTimeout(resolve, 1000));

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

  try {
    const appUrl = process.env.APP_URL || "localhost:5173";

    // Navigate to dashboard
    console.log("Navigating to dashboard...");
    await page.goto(`http://${appUrl}/#/`);
    await page.waitForLoadState("networkidle");
    console.log("✓ Dashboard loaded");

    // Click the create new button
    console.log('\n2. Clicking "Create New" button...');
    await page.click('button:has-text("新規作成")');
    await page.waitForSelector('input[placeholder="Enter project title"]');
    console.log("✓ New project dialog opened");

    // Parse JSON to get title for project name
    let baseTitle = "Test";
    try {
      const testJson = JSON.parse(await readLocalJSON(currentTestFile));
      if (testJson.title) {
        baseTitle = testJson.title;
      }
    } catch {
      console.log("Could not read title from JSON, using default");
    }

    // Enter project title (based on JSON title + timestamp)
    projectTitle = `${baseTitle}_${dayjs().format("YYYYMMDD_HHmmss")}`;
    console.log(`\n3. Entering project title: ${projectTitle}`);
    await page.fill('input[placeholder="Enter project title"]', projectTitle);
    console.log("✓ Project title entered");

    // Click the Create button
    console.log('\n4. Clicking "Create" button...');
    await page.click('button:has-text("Create")');

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
    await page.click('[role="tab"]:has-text("JSON")');
    await new Promise((resolve) => setTimeout(resolve, CONFIG.TAB_SWITCH_DELAY));

    // Verify JSON tab is active
    const jsonTab = await page.$('[role="tab"]:has-text("JSON")');
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
    await page.waitForSelector(".monaco-editor", { timeout: 10000 });
    console.log("✓ Monaco Editor loaded");

    // Read JSON from local node_modules
    console.log("\n8. Reading test JSON from local node_modules...");
    let jsonContent: string;

    try {
      jsonContent = await readLocalJSON(currentTestFile);
    } catch (error) {
      console.error("Failed to read from local file:", error);
      throw new Error(`Could not read ${currentTestFile} from node_modules`);
    }

    // Clear existing content and input test JSON
    console.log("\n9. Inputting test audio JSON...");
    // Focus on Monaco editor
    await page.click(".monaco-editor");

    // Select all and delete (use Cmd on macOS)
    await page.keyboard.press("Meta+A");
    await page.keyboard.press("Delete");

    // Wait a bit for editor to be ready
    await new Promise((resolve) => setTimeout(resolve, 500));

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
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("✓ JSON processing time completed");

    // Find and click the generate button in output settings section
    console.log("\n10. Looking for generate button in output settings section...");

    // Use CSS selector to find the generate button more reliably
    // This button is in a grid layout with specific classes
    const generateButton = await page.$('button.flex.flex-col.items-center:has-text("Generate Contents")');
    if (!generateButton) {
      // Fallback: try finding by button structure
      const fallbackButton = await page.$('.grid button:has-text("Generate")');
      if (!fallbackButton) {
        throw new Error("Generate Contents button not found");
      }
      console.log("✓ Found generate button using fallback selector");
      await fallbackButton.click();
    } else {
      console.log("✓ Found generate button using primary selector");
      await generateButton.click();
    }

    // Start generation without waiting
    console.log("\n10. Generation started, moving to next file...");

    // Wait a bit to ensure generation has started
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("\n=== Project created and generation started ===");
    console.log(`Project "${projectTitle}" was created and generation was started.`);
  } catch (error: unknown) {
    console.error("\n✗ Test failed:", error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    // No need to close browser here, it's managed in main()
  }
}

// Main execution
async function main(): Promise<void> {
  console.log("Starting test in 3 seconds...");
  console.log("Make sure the Electron app is running with: yarn start");
  console.log("Environment variables:");
  console.log(`  CDP_URL: ${process.env.CDP_URL || "http://localhost:9222/ (default)"}`);
  console.log(`  APP_URL: ${process.env.APP_URL || "localhost:5173 (default)"}\n`);
  console.log(`Testing with ${TEST_JSON_FILES.length} JSON files: ${TEST_JSON_FILES.join(", ")}`);

  await new Promise((resolve) => setTimeout(resolve, CONFIG.INITIAL_WAIT));

  const projectsCreated: ProjectInfo[] = [];
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Connect to browser once
    console.log("\nConnecting to CDP...");
    const cdpUrl = process.env.CDP_URL || "http://localhost:9222/";
    let attempts = 0;

    while (attempts < CONFIG.CDP_MAX_ATTEMPTS) {
      try {
        browser = await playwright.chromium.connectOverCDP(cdpUrl);
        console.log("✓ Connected successfully via CDP");
        break;
      } catch (error: unknown) {
        attempts++;
        if (attempts === CONFIG.CDP_MAX_ATTEMPTS) {
          throw new Error(
            `Failed to connect to CDP after ${CONFIG.CDP_MAX_ATTEMPTS} attempts: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, CONFIG.CDP_RETRY_DELAY));
      }
    }

    // Get page
    const contexts = browser!.contexts();
    const appUrl = process.env.APP_URL || "localhost:5173";
    for (const context of contexts) {
      const pages = context.pages();
      for (const p of pages) {
        if (p.url().includes(appUrl)) {
          page = p;
          break;
        }
      }
      if (page) break;
    }

    if (!page) {
      throw new Error("Could not find application page");
    }

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
      process.exit(1);
    } else {
      console.log("\n✓ Test PASSED - All generations completed and played successfully!");
      process.exit(0);
    }
  } catch (error: unknown) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log("\nBrowser connection closed.");
    }
  }
}

// Execute
main();
