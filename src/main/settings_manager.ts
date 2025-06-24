import { app } from "electron";
import path from "node:path";
import fs from "node:fs";

export type Settings = {
  openaiKey?: string;
  nijivoiceApiKey?: string;
  // Additional API keys can be added here
};

const getSettingsPath = (): string => {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "settings.json");
};

export const loadSettings = async (): Promise<Settings> => {
  const settingsPath = getSettingsPath();

  try {
    if (!fs.existsSync(settingsPath)) {
      return {};
    }

    const data = await fs.promises.readFile(settingsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load settings:", error);
    return {};
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  const settingsPath = getSettingsPath();

  try {
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2), "utf-8");

    if (settings.openaiKey) {
      process.env.OPENAI_API_KEY = settings.openaiKey;
    }
    if (settings.nijivoiceApiKey) {
      process.env.NIJIVOICE_API_KEY = settings.nijivoiceApiKey;
    }
  } catch (error) {
    console.error("Failed to save settings:", error);
    throw error;
  }
};
