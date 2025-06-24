<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Speech Parameters</h4>
    <div v-if="speechParams" class="space-y-4">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Provider</label>
        <select
          :value="speechParams.provider || 'openai'"
          @change="$emit('updateProvider', ($event.target as HTMLSelectElement).value)"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="openai">OpenAI</option>
          <option value="nijivoice">Nijivoice</option>
          <option value="google">Google</option>
          <option value="elevenlabs">ElevenLabs</option>
        </select>
      </div>
      <div
        v-if="speechParams.speakers"
        v-for="(speaker, name) in speechParams.speakers"
        :key="name"
        class="border p-3 rounded"
      >
        <div class="flex items-center justify-between mb-2">
          <h5 class="font-medium text-sm">{{ name }}</h5>
          <Button
            v-if="Object.keys(speechParams.speakers).length > 1"
            variant="ghost"
            size="sm"
            @click="$emit('deleteSpeaker', name)"
            class="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
        <div class="space-y-2">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Voice ID</label>
            <input
              :value="speaker.voiceId"
              @input="$emit('updateSpeaker', name, 'voiceId', ($event.target as HTMLInputElement).value)"
              class="w-full p-1 border rounded text-sm"
            />
          </div>
          <div v-if="speaker.displayName">
            <div class="mb-2">
              <label class="block text-xs text-gray-600 mb-1">Language</label>
              <select
                :value="selectedLanguages[name] || 'en'"
                @change="handleLanguageChange(name, ($event.target as HTMLSelectElement).value)"
                class="w-full p-1 border rounded text-sm"
              >
                <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                  {{ lang.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">
                Display Name ({{ selectedLanguages[name] || "en" }})
              </label>
              <input
                :value="speaker.displayName[selectedLanguages[name] || 'en'] || ''"
                @input="
                  $emit(
                    'updateSpeakerDisplayName',
                    name,
                    selectedLanguages[name] || 'en',
                    ($event.target as HTMLInputElement).value,
                  )
                "
                class="w-full p-1 border rounded text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" @click="$emit('addSpeaker')">Add Speaker</Button>
    </div>
    <div v-else>
      <p class="text-sm text-gray-500 mb-2">No speakers defined</p>
      <Button variant="outline" size="sm" @click="$emit('initializeSpeechParams')">Initialize Speech Parameters</Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MulmoPresentationStyle } from "mulmocast";

const props = defineProps<{
  speechParams?: MulmoPresentationStyle["speechParams"];
}>();

defineEmits<{
  updateProvider: [provider: string];
  updateSpeaker: [name: string, field: "voiceId", value: string];
  updateSpeakerDisplayName: [name: string, language: string, value: string];
  addSpeaker: [];
  deleteSpeaker: [name: string];
  initializeSpeechParams: [];
}>();

const selectedLanguages = ref<Record<string, string>>({});

const languages = [
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
  // TODO: add more languages
];

watch(
  () => props.speechParams?.speakers,
  (speakers) => {
    if (speakers) {
      Object.keys(speakers).forEach((speakerName) => {
        if (!selectedLanguages.value[speakerName]) {
          selectedLanguages.value[speakerName] = "en";
        }
      });
    }
  },
  { immediate: true },
);

const handleLanguageChange = (name: string, language: string) => {
  selectedLanguages.value[name] = language;
};
</script>
