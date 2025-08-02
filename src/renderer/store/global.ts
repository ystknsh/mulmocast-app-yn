import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useMulmoGlobalStore = defineStore("mulmoGlobal", () => {
  const settings = ref({});
  const updateSettings = (data: unknown) => {
    const { MAIN_LANGUAGE, USE_LANGUAGES } = data;
    const newData = { MAIN_LANGUAGE, USE_LANGUAGES };
    settings.value = newData;
  };

  return {
    settings,
    updateSettings,
  };
});
