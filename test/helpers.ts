import { ElectronAPI } from "@/types/electron";
import { type Page } from "playwright-core";

export const mockSettings = async (page: Page) => {
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
  await page.reload();
};
