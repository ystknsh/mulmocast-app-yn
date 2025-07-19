<template>
  <Layout>
    <div class="container mx-auto p-6 max-w-2xl">
      <h1 class="text-3xl font-bold mb-8">Settings</h1>

      <div class="space-y-6">
        <!-- App Settings Section -->
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>Configure application settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <Label for="language">Display Language</Label>
              <Select v-model="selectedLanguage">
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
              <p class="text-sm text-muted-foreground">Select your preferred display language for the application</p>
            </div>
          </CardContent>
        </Card>

        <!-- API Key Settings Section -->
        <Card>
          <CardHeader>
            <CardTitle>API Key Settings</CardTitle>
            <CardDescription>Configure API keys for external services</CardDescription>
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
              <p class="text-sm text-muted-foreground">{{ config.description }}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, nextTick } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-vue-next";
import { notifySuccess, notifyError } from "@/lib/notification";
import Layout from "@/components/layout.vue";
import { ENV_KEYS } from "../../../shared/constants";

const apiKeys = reactive<Record<string, string>>({});
const showKeys = reactive<Record<string, boolean>>({});
const selectedLanguage = ref("en");
const isInitialLoad = ref(true);

// Initialize all keys
Object.keys(ENV_KEYS).forEach((envKey) => {
  apiKeys[envKey] = "";
  showKeys[envKey] = false;
});

onMounted(async () => {
  // Load existing API keys and language settings
  try {
    const settings = await window.electronAPI.settings.get();
    Object.keys(ENV_KEYS).forEach((envKey) => {
      if (envKey in settings) {
        apiKeys[envKey] = settings[envKey as keyof typeof settings] || "";
      }
    });
    // Load language preference
    if (settings.APP_LANGUAGE) {
      selectedLanguage.value = settings.APP_LANGUAGE;
    }
    // Wait for the next tick to avoid triggering save during initial load
    await nextTick();
    isInitialLoad.value = false;
  } catch (error) {
    console.error("Failed to load settings:", error);
    isInitialLoad.value = false;
  }
});

// Auto-save function with debounce
const autoSave = async () => {
  try {
    await window.electronAPI.settings.set({ ...apiKeys, APP_LANGUAGE: selectedLanguage.value });
    notifySuccess("Settings saved");
  } catch (error) {
    console.error("Failed to save settings:", error);
    notifyError("Error", "Failed to save settings");
  }
};

const debouncedSave = useDebounceFn(autoSave, 1000);

// Watch for changes in apiKeys
watch(
  apiKeys,
  () => {
    // Skip save during initial load
    if (!isInitialLoad.value) {
      debouncedSave();
    }
  },
  { deep: true },
);

// Watch for changes in language selection - save immediately
watch(selectedLanguage, () => {
  if (!isInitialLoad.value) {
    autoSave();
  }
});
</script>
