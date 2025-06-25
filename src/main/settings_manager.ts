import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import { ENV_KEYS, type EnvKey } from "../shared/constants";

// Dynamically build the Settings type from ENV_KEYS
export type Settings = {
  [K in EnvKey]?: string;
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

    // Dynamically set environment variables based on constants
    for (const envKey of Object.keys(ENV_KEYS)) {
      const value = settings[envKey as keyof Settings];
      if (value) {
        process.env[envKey] = value;
      }
    }
  } catch (error) {
    console.error("Failed to save settings:", error);
    throw error;
  }
};
