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
            <!-- OpenAI API Key -->
            <div class="space-y-2">
              <Label for="openai-key">OpenAI API Key</Label>
              <div class="flex gap-2">
                <Input
                  id="openai-key"
                  v-model="openaiKey"
                  :type="showOpenaiKey ? 'text' : 'password'"
                  placeholder="sk-..."
                  class="flex-1"
                />
                <Button variant="outline" size="icon" @click="showOpenaiKey = !showOpenaiKey">
                  <Eye v-if="!showOpenaiKey" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </Button>
              </div>
              <p class="text-sm text-muted-foreground">Required for using OpenAI services</p>
            </div>

            <!-- NijiVoice API Key -->
            <div class="space-y-2">
              <Label for="nijivoice-key">NijiVoice API Key</Label>
              <div class="flex gap-2">
                <Input
                  id="nijivoice-key"
                  v-model="nijivoiceApiKey"
                  :type="showNijivoiceKey ? 'text' : 'password'"
                  placeholder="nv_..."
                  class="flex-1"
                />
                <Button variant="outline" size="icon" @click="showNijivoiceKey = !showNijivoiceKey">
                  <Eye v-if="!showNijivoiceKey" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </Button>
              </div>
              <p class="text-sm text-muted-foreground">Required for using NijiVoice TTS services</p>
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
import { ref, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Save, Loader2 } from "lucide-vue-next";
import { notifySuccess, notifyError } from "@/lib/notification";
import Layout from "@/components/layout.vue";

const openaiKey = ref("");
const nijivoiceApiKey = ref("");
const showOpenaiKey = ref(false);
const showNijivoiceKey = ref(false);
const isSaving = ref(false);

onMounted(async () => {
  // Load existing API keys
  try {
    const settings = await window.electronAPI.settings.get();
    if (settings.openaiKey) {
      openaiKey.value = settings.openaiKey;
    }
    if (settings.nijivoiceApiKey) {
      nijivoiceApiKey.value = settings.nijivoiceApiKey;
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
});

const saveSettings = async () => {
  isSaving.value = true;
  try {
    await window.electronAPI.settings.set({
      openaiKey: openaiKey.value,
      nijivoiceApiKey: nijivoiceApiKey.value,
    });

    notifySuccess("Settings saved", "API key has been saved successfully");
  } catch (error) {
    console.error("Failed to save settings:", error);
    notifyError("Error", "Failed to save settings");
  } finally {
    isSaving.value = false;
  }
};
</script>
