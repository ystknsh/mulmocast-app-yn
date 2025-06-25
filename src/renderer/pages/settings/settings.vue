<template>
  <Layout>
    <div class="container mx-auto p-6 max-w-2xl">
      <h1 class="text-3xl font-bold mb-8">Settings</h1>

      <div class="space-y-6">
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
          <CardFooter>
            <Button @click="saveSettings" :disabled="isSaving">
              <Save v-if="!isSaving" class="mr-2 h-4 w-4" />
              <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Save, Loader2 } from "lucide-vue-next";
import { notifySuccess, notifyError } from "@/lib/notification";
import Layout from "@/components/layout.vue";
import { ENV_KEYS } from "../../../shared/constants";

const apiKeys = reactive<Record<string, string>>({});
const showKeys = reactive<Record<string, boolean>>({});
const isSaving = ref(false);

// Initialize all keys
Object.keys(ENV_KEYS).forEach((envKey) => {
  apiKeys[envKey] = "";
  showKeys[envKey] = false;
});

onMounted(async () => {
  // Load existing API keys
  try {
    const settings = await window.electronAPI.settings.get();
    Object.keys(ENV_KEYS).forEach((envKey) => {
      if (envKey in settings) {
        apiKeys[envKey] = settings[envKey as keyof typeof settings] || "";
      }
    });
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
});

const saveSettings = async () => {
  isSaving.value = true;
  try {
    await window.electronAPI.settings.set({ ...apiKeys });
    notifySuccess("Settings saved", "API keys have been saved successfully");
  } catch (error) {
    console.error("Failed to save settings:", error);
    notifyError("Error", "Failed to save settings");
  } finally {
    isSaving.value = false;
  }
};
</script>
