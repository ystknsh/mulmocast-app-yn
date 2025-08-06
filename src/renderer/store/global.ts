import { ref } from "vue";
import { defineStore } from "pinia";

export const useMulmoGlobalStore = defineStore("mulmoGlobal", () => {
  const settings = ref({});
  const updateSettings = (data: { MAIN_LANGUAGE: string; USE_LANGUAGES: Record<string, boolean> }) => {
    const { MAIN_LANGUAGE, USE_LANGUAGES } = data;
    const newData = { MAIN_LANGUAGE, USE_LANGUAGES };
    settings.value = newData;
  };

  return {
    settings,
    updateSettings,
  };
});
