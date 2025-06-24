<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Speech Parameters</h4>
    <div v-if="modelValue?.speechParams?.speakers" class="space-y-4">
      <div v-for="(speaker, name) in modelValue.speechParams.speakers" :key="name" class="border p-3 rounded">
        <div class="flex items-center justify-between mb-2">
          <h5 class="font-medium text-sm">{{ name }}</h5>
          <Button
            v-if="Object.keys(modelValue.speechParams.speakers).length > 1"
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
              @input="
                $emit('update', `speechParams.speakers.${name}.voiceId`, ($event.target as HTMLInputElement).value)
              "
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
                    'update',
                    `speechParams.speakers.${name}.displayName.${selectedLanguages[name] || 'en'}`,
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
import type { MulmoScript } from "mulmocast";

const props = defineProps<{
  modelValue: MulmoScript;
}>();

defineEmits<{
  update: [path: string, value: unknown];
  addSpeaker: [];
  deleteSpeaker: [name: string];
  initializeSpeechParams: [];
}>();

const selectedLanguages = ref<Record<string, string>>({});

const languages = [
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" },
  { code: "pt", name: "Português" },
  { code: "it", name: "Italiano" },
  { code: "ru", name: "Русский" },
];

watch(
  () => props.modelValue?.speechParams?.speakers,
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
