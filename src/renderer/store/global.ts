import { ref } from "vue";
import { defineStore } from "pinia";

export const useMulmoGlobalStore = defineStore("mulmoGlobal", () => {
  const settings = ref({});
  const updateSettings = (data: {
    MAIN_LANGUAGE: string;
    USE_LANGUAGES: Record<string, boolean>;
    CHAT_LLM: string;
    llmConfigs: Record<string, Record<string, string>>;
  }) => {
    const { MAIN_LANGUAGE, USE_LANGUAGES, CHAT_LLM, llmConfigs } = data;
    const newData = { MAIN_LANGUAGE, USE_LANGUAGES, CHAT_LLM, llmConfigs };
    settings.value = newData;
  };

  return {
    settings,
    updateSettings,
  };
});
