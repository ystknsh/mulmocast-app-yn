<template>
  <Dialog :open="isOpen" @update:open="() => {}">
    <DialogContent
      class="max-h-[80vh] max-w-2xl overflow-y-auto"
      :hide-close="true"
      @escape-key-down.prevent
      @pointer-down-outside.prevent
    >
      <DialogHeader>
        <DialogTitle class="text-center text-2xl font-bold">
          {{ t("onboarding.title") }}
        </DialogTitle>
        <DialogDescription class="text-muted-foreground text-center">
          {{ t("onboarding.description") }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- MulmoCastの説明 -->
        <div class="bg-muted/50 rounded-lg p-4">
          <h3 class="mb-2 font-semibold">{{ t("onboarding.whatIsMulmoCast") }}</h3>
          <p class="text-muted-foreground text-sm">
            {{ t("onboarding.whatIsMulmoCastDescription") }}
          </p>
        </div>

        <!-- LLM settings -->
        <div class="space-y-4">
          <h3 class="font-semibold">{{ t("settings.llmSettings.title") }}</h3>
          <LlmSettings
            :selected-l-l-m="selectedLLM"
            :llm-configs="llmConfigs"
            :api-keys="apiKeys"
            @update:selected-l-l-m="updateSelectedLLM"
            @update:llm-configs="updateLlmConfigs"
          />
        </div>

        <!-- API key -->
        <div class="space-y-4" v-if="selectedLLM !== 'ollamaAgent'">
          <h3 class="font-semibold">{{ t("settings.apiKeys.title") }}</h3>
          <div class="space-y-3">
            <ApiKeyInput
              v-for="(config, envKey) in getRequiredApiKeys()"
              :key="envKey"
              :env-key="envKey"
              :config="config"
              :api-key="apiKeys[envKey]"
              :show-key="showKeys[envKey]"
              @update:api-key="(value) => updateApiKey(envKey, value)"
              @update:show-key="(value) => updateShowKey(envKey, value)"
            />
          </div>
        </div>

        <!-- error message -->
        <div v-if="errorMessage" class="text-destructive text-sm">
          {{ errorMessage }}
        </div>
      </div>

      <DialogFooter class="flex justify-center">
        <Button @click="handleSave" :disabled="!canSave || isSaving" class="w-full">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ t("onboarding.complete") }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from "vue";
import { useI18n } from "vue-i18n";
import { Loader2 } from "lucide-vue-next";

import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LlmSettings from "@/components/llm_settings.vue";
import ApiKeyInput from "@/components/api_key_input.vue";

import { notifySuccess, notifyError } from "@/lib/notification";
import {
  ENV_KEYS,
  llms,
  LLM_OLLAMA_DEFAULT_CONFIG,
  LLM_OPENAI_DEFAULT_CONFIG,
  LLM_ANTHROPIC_DEFAULT_CONFIG,
  LLM_GROQ_DEFAULT_CONFIG,
  LLM_GEMINI_DEFAULT_CONFIG,
} from "../../shared/constants";
import { useMulmoGlobalStore } from "../store";
import { Settings } from "../../main/settings_manager";

const { t } = useI18n();
const globalStore = useMulmoGlobalStore();

type LlmConfigOllama = { url: string; model: string };
type LlmConfigOpenAI = { model: string };
type LlmConfigGemini = { model: string };
type LlmConfigAnthropic = { model: string };
type LlmConfigGroq = { model: string };

type LlmConfigs = {
  ollama: LlmConfigOllama;
  openai: LlmConfigOpenAI;
  gemini: LlmConfigGemini;
  anthropic: LlmConfigAnthropic;
  groq: LlmConfigGroq;
};

defineProps<{
  isOpen: boolean;
}>();
const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  complete: [];
}>();

const isSaving = ref(false);
const errorMessage = ref("");
const selectedLLM = ref("openAIAgent");

const apiKeys = ref<Record<string, string>>({});
const showKeys = ref<Record<string, boolean>>({});

const llmConfigs = ref<LlmConfigs>({
  ollama: { ...LLM_OLLAMA_DEFAULT_CONFIG },
  openai: { ...LLM_OPENAI_DEFAULT_CONFIG },
  anthropic: { ...LLM_ANTHROPIC_DEFAULT_CONFIG },
  groq: { ...LLM_GROQ_DEFAULT_CONFIG },
  gemini: { ...LLM_GEMINI_DEFAULT_CONFIG },
});

// Initialize API keys
Object.keys(ENV_KEYS).forEach((envKey) => {
  apiKeys.value[envKey] = "";
  showKeys.value[envKey] = false;
});

const canSave = computed(() => {
  if (selectedLLM.value === "ollamaAgent") {
    return true; // Ollama doesn't require API key
  }

  const selectedLlmConfig = llms.find((llm) => llm.id === selectedLLM.value);
  if (!selectedLlmConfig?.apiKey) {
    return false;
  }

  return apiKeys.value[selectedLlmConfig.apiKey]?.trim() !== "";
});

const getRequiredApiKeys = () => {
  const selectedLlmConfig = llms.find((llm) => llm.id === selectedLLM.value);
  if (!selectedLlmConfig?.apiKey) {
    return {};
  }

  return {
    [selectedLlmConfig.apiKey]: ENV_KEYS[selectedLlmConfig.apiKey as keyof typeof ENV_KEYS],
  };
};

const updateSelectedLLM = (llm: string) => {
  selectedLLM.value = llm;
  errorMessage.value = "";
};

const updateApiKey = (envKey: string, value: string) => {
  apiKeys.value[envKey] = value;
  errorMessage.value = "";
};

const updateShowKey = (envKey: string, value: boolean) => {
  showKeys.value[envKey] = value;
};

const updateLlmConfigs = (configs: LlmConfigs) => {
  llmConfigs.value = configs;
};

const handleSave = async () => {
  if (!canSave.value) {
    errorMessage.value = t("onboarding.errors.requiredApiKey");
    return;
  }

  isSaving.value = true;
  errorMessage.value = "";

  try {
    const data = {
      ...apiKeys.value,
      APIKEY: toRaw({ ...apiKeys.value }),
      CHAT_LLM: selectedLLM.value,
      llmConfigs: toRaw(llmConfigs.value),
    };

    await window.electronAPI.settings.set(data as unknown as Settings);
    globalStore.updateSettings(data);

    notifySuccess(t("onboarding.success"));
    emit("complete");
  } catch (error) {
    console.error("Failed to save onboarding settings:", error);
    errorMessage.value = t("onboarding.errors.saveFailed");
    notifyError("Error", t("onboarding.errors.saveFailed"));
  } finally {
    isSaving.value = false;
  }
};

// Watch for LLM changes to clear error message
watch(selectedLLM, () => {
  errorMessage.value = "";
});
</script>
