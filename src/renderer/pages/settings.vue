<template>
  <Layout>
    <div class="container mx-auto max-w-2xl p-6">
      <h1 class="mb-8 text-3xl font-bold">{{ t("settings.title") }}</h1>
      <div class="space-y-6">
        <!-- App Settings Section -->
        <Card>
          <CardHeader>
            <CardTitle>{{ t("settings.appSettings.title") }}</CardTitle>
            <CardDescription>{{ t("settings.appSettings.description") }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <Label for="language">{{ t("settings.appSettings.language.label") }}</Label>
              <Select v-model="selectedLanguage">
                <SelectTrigger id="language">
                  <SelectValue :placeholder="t('settings.appSettings.language.placeholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="language in I18N_SUPPORTED_LANGUAGES" :key="language.id" :value="language.id">
                    {{ t("commonLanguages." + language.id) }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-muted-foreground text-sm">{{ t("settings.appSettings.language.description") }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- API Key Settings Section -->
        <Card>
          <CardHeader>
            <CardTitle>{{ t("settings.apiKeys.title") }}</CardTitle>
            <CardDescription>{{ t("settings.apiKeys.description") }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-for="(config, envKey) in ENV_KEYS" :key="envKey" class="space-y-2">
              <Label :for="envKey">{{ config.title }}</Label>
              <div class="flex gap-2">
                <Input
                  :id="envKey"
                  v-model="apiKeys[envKey]"
                  :type="showKeys[envKey] ? 'text' : 'password'"
                  :placeholder="config.placeholder"
                  class="flex-1"
                />
                <Button variant="outline" size="icon" @click="showKeys[envKey] = !showKeys[envKey]">
                  <Eye v-if="!showKeys[envKey]" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <!-- language -->
        <Card>
          <CardHeader>
            <CardTitle>{{ t("settings.languages.title") }}</CardTitle>
            <CardDescription>{{ t("settings.languages.description") }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="text-base font-semibold text-gray-800 dark:text-white">
              {{ t("settings.languages.mainTitle") }}
            </div>
            <RadioGroup v-model="mainLanguage" class="grid grid-cols-4 gap-2 text-sm">
              <div v-for="language in languages" :key="language" class="flex items-center space-x-2">
                <RadioGroupItem :value="language" :id="language" />
                <Label :for="language">{{ t("languages." + language) }}</Label>
              </div>
            </RadioGroup>
            <div class="text-base font-semibold text-gray-800 dark:text-white">
              {{ t("settings.languages.translatedTitle") }}
            </div>
            <div v-for="(language, key) in languages" :key="key">
              &ensp;{{ t("languages." + language) }}
              <Checkbox v-model="useLanguage[language]" />
            </div>
          </CardContent>
        </Card>

        <!-- llm -->
        <Card>
          <CardHeader>
            <CardTitle>{{ t("settings.llmSettings.title") }}</CardTitle>
            <CardDescription>{{ t("settings.llmSettings.description") }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <Label for="language">{{ t("settings.llmSettings.llm.label") }}</Label>
              <Select v-model="selectedLLM">
                <SelectTrigger id="llm">
                  <SelectValue :placeholder="t('settings.llmSettings.llm.placeholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="llm in llms" :key="llm.id" :value="llm.id">
                    {{ t("llms." + llm.id) }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-muted-foreground text-sm">{{ t("settings.llmSettings.llm.description") }}</p>
            </div>
            <div class="mt-4 space-y-2" v-if="selectedLLM === 'ollamaAgent'">
              <Label for="language">{{ t("settings.llmSettings.ollama.label") }}</Label>
              {{ t("settings.llmSettings.ollama.url") }}:
              <Input v-model="llmConfigs['ollama']['url']" type="text" class="flex-1" />
              {{ t("settings.llmSettings.ollama.model") }}:
              <Input v-model="llmConfigs['ollama']['model']" type="text" class="flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, nextTick, toRaw } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { Eye, EyeOff } from "lucide-vue-next";

import { Button, Input, Label, Checkbox } from "@/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout.vue";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { notifySuccess, notifyError } from "@/lib/notification";
import { ENV_KEYS, languages } from "../../shared/constants";
import { I18N_SUPPORTED_LANGUAGES } from "../../shared/constants";
import { useMulmoGlobalStore } from "../store";

const { locale, t } = useI18n();

const llms = [
  {
    id: "openAIAgent",
  },
  {
    id: "ollamaAgent",
  },
  {
    id: "geminiAgent",
  },
  {
    id: "anthropicAgent",
  },
  {
    id: "groqAgent",
  },
];

const apiKeys = reactive<Record<string, string>>({});
const showKeys = reactive<Record<string, boolean>>({});

const globalStore = useMulmoGlobalStore();

const mainLanguage = ref("en");
const useLanguage = reactive<Record<string, boolean>>({});

const selectedLanguage = ref(locale.value);
const isInitialLoad = ref(true);

const selectedLLM = ref("openAIAgent");
const llmConfigs = reactive<Record<string, Record<string, string>>>({
  ollama: {
    url: "http://localhost:11434/v1",
    model: "gpt-oss:20b",
  },
});

// Initialize all keys
Object.keys(ENV_KEYS).forEach((envKey) => {
  apiKeys[envKey] = "";
  showKeys[envKey] = false;
});
Object.values(languages).forEach((langKey) => {
  useLanguage[langKey] = false;
});

onMounted(async () => {
  // Load existing API keys and language settings
  try {
    const settings = await window.electronAPI.settings.get();
    Object.keys(ENV_KEYS).forEach((envKey) => {
      if (settings.APIKEY && settings.APIKEY[envKey]) {
        apiKeys[envKey] = settings.APIKEY[envKey as keyof typeof settings] || "";
      } else if (envKey in settings) {
        // backward compatibility
        apiKeys[envKey] = settings[envKey as keyof typeof settings] || "";
      }
    });
    if (settings.USE_LANGUAGES) {
      Object.values(languages).forEach((langKey) => {
        useLanguage[langKey] = settings.USE_LANGUAGES[langKey] ?? false;
      });
    }

    // Load language preference
    if (settings.APP_LANGUAGE) {
      selectedLanguage.value = settings.APP_LANGUAGE;
    }
    if (settings.MAIN_LANGUAGE) {
      mainLanguage.value = settings.MAIN_LANGUAGE;
    }
    if (settings.CHAT_LLM) {
      selectedLLM.value = settings.CHAT_LLM;
    }
    if (settings.llmConfigs) {
      llmConfigs.ollama = settings.llmConfigs.ollama;
    }
    // Wait for the next tick to avoid triggering save during initial load
    await nextTick();
    isInitialLoad.value = false;
  } catch (error) {
    console.error("Failed to load settings:", error);
    isInitialLoad.value = false;
  }
});

const saveSettings = async () => {
  try {
    const data = {
      ...apiKeys,
      APIKEY: toRaw(apiKeys),
      APP_LANGUAGE: selectedLanguage.value,
      USE_LANGUAGES: { ...useLanguage },
      MAIN_LANGUAGE: mainLanguage.value,
      CHAT_LLM: selectedLLM.value,
      llmConfigs: toRaw(llmConfigs),
    };
    await window.electronAPI.settings.set(data);
    globalStore.updateSettings(data);
    notifySuccess(t("settings.notifications.success"));
  } catch (error) {
    console.error("Failed to save settings:", error);
    notifyError("Error", t("settings.notifications.error"));
  }
};

const debouncedSave = useDebounceFn(saveSettings, 1000);

// Watch for changes in text
watch(
  [apiKeys, llmConfigs],
  () => {
    // Skip save during initial load
    if (!isInitialLoad.value) {
      debouncedSave();
    }
  },
  { deep: true },
);

watch(
  [mainLanguage, useLanguage, selectedLLM],
  () => {
    // Skip save during initial load
    if (!isInitialLoad.value) {
      saveSettings();
    }
  },
  { deep: true },
);

// Watch for changes in language selection - save immediately and update i18n locale
watch(selectedLanguage, (newLang) => {
  if (!isInitialLoad.value) {
    locale.value = newLang;
    saveSettings();
  }
});
</script>
