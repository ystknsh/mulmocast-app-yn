import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { I18N_SUPPORTED_LANGUAGES, LANGUAGE_IDS } from "../../shared/constants";

type SETTINGS = {
  MAIN_LANGUAGE?: string;
  USE_LANGUAGES?: Record<string, boolean>;
  CHAT_LLM?: string;
  llmConfigs?: Record<string, Record<string, string>>;
  APIKEY?: Record<string, string>;
};

export const useMulmoGlobalStore = defineStore("mulmoGlobal", () => {
  const settings = ref<SETTINGS>({});
  const updateSettings = (data: SETTINGS) => {
    const { MAIN_LANGUAGE, USE_LANGUAGES, CHAT_LLM, llmConfigs, APIKEY } = data;
    const newData = { MAIN_LANGUAGE, USE_LANGUAGES, CHAT_LLM, llmConfigs, APIKEY };
    settings.value = newData;
  };

  const isOpenSettingModal = ref(false);
  const toggleSettingModal = () => {
    isOpenSettingModal.value = !isOpenSettingModal.value;
  };

  const mulmoViewerProjectId = ref<string | null>(null);
  const setMulmoViewerProjectId = (projectId: string | null) => {
    mulmoViewerProjectId.value = projectId;
  };

  const useLanguages = computed(() => {
    const languages = settings.value?.USE_LANGUAGES ?? {};
    return Object.keys(languages)
      .map((lang) => {
        return languages[lang] ? lang : null;
      })
      .filter((v) => v);
  });

  return {
    settings,
    updateSettings,

    isOpenSettingModal,
    toggleSettingModal,

    mulmoViewerProjectId,
    setMulmoViewerProjectId,

    useLanguages,
  };
});
